import { Hono, type Context } from "hono";
import { and, desc, eq, sql, count } from "drizzle-orm";
import { documents, type DocumentRow } from "../db/schema";
import { getSessionUserId } from "../lib/session";
import {
  formatBytes,
  normalizeCategory,
  normalizeDescription,
  normalizeTitle,
  sanitizeFileName,
  sniffDocumentKind,
} from "../lib/documents";
import { logError } from "../lib/logger";
import { isForeignOrigin, parseAllowedOrigins } from "../lib/origins";
import {
  DOCUMENT_MIME,
  MAX_FILES_PER_USER,
  MAX_UPLOAD_BYTES,
  SYSTEM_STORAGE_QUOTA_BYTES,
  USER_STORAGE_QUOTA_BYTES,
} from "../constants";
import type { Bindings, Variables } from "../types";

type Ctx = { Bindings: Bindings; Variables: Variables };

/**
 * Documents API — the personal cloud.
 *
 * Isolation invariants (do not weaken):
 * 1. Every query is scoped by `user_id` taken from the server-side session.
 * 2. Missing and foreign document ids return the *identical* 404, so ids
 *    cannot be probed across accounts.
 * 3. R2 objects are only reachable through the authenticated content route;
 *    the bucket is private and never exposed via presigned URLs.
 */
export const documentRoutes = new Hono<Ctx>();

/** Identical response for "does not exist" and "belongs to someone else". */
function notFound(c: Context<Ctx>) {
  return c.json({ error: "Not found" }, 404);
}

/**
 * Rejects mutations that arrive with a foreign `Origin` header — defense in
 * depth alongside the SameSite=Lax session cookie (same rule as PATCH
 * /auth/me and POST /auth/logout).
 */
function fromForeignOrigin(c: Context<Ctx>): boolean {
  return isForeignOrigin(c.req.header("origin"), parseAllowedOrigins(c.env.ALLOWED_ORIGINS));
}

function publicDoc(row: DocumentRow) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    kind: row.kind,
    originalName: row.originalName,
    size: row.size,
    createdAt: row.createdAt,
  };
}

function asciiFallbackName(name: string): string {
  return sanitizeFileName(name)
    .replace(/[^\x20-\x7e]/g, "_")
    .replace(/["\\]/g, "_");
}

// ---------------------------------------------------------------------------
// POST /documents — multipart upload (file + title + description? + category?)
// ---------------------------------------------------------------------------
documentRoutes.post("/", async (c) => {
  if (fromForeignOrigin(c)) return c.json({ error: "Forbidden" }, 403);

  const userId = await getSessionUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  const body = await c.req.parseBody();
  const file = body.file;

  if (typeof file === "string" || !(file instanceof File)) {
    return c.json({ error: "missing_file", message: "No file was provided." }, 400);
  }

  if (file.size === 0) {
    return c.json({ error: "empty_file", message: "The file is empty." }, 400);
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return c.json(
      {
        error: "file_too_large",
        message: `Files must be ${formatBytes(MAX_UPLOAD_BYTES)} or smaller.`,
      },
      413,
    );
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const kind = sniffDocumentKind(bytes);
  if (!kind) {
    return c.json(
      {
        error: "unsupported_type",
        message: "Only PDF and DOCX files are supported.",
      },
      415,
    );
  }

  const originalName = sanitizeFileName(file.name);
  // A non-string title (e.g. a stray file part) is a malformed request —
  // never silently coerce it to the filename.
  if (body.title !== undefined && typeof body.title !== "string") {
    return c.json({ error: "invalid_title", message: "Title must be text." }, 400);
  }
  const title = normalizeTitle(body.title, originalName);
  if (!title) {
    return c.json(
      {
        error: "invalid_title",
        message: "Title must be 1–120 characters.",
      },
      400,
    );
  }

  const description = normalizeDescription(body.description);
  if (!description.ok) {
    return c.json(
      {
        error: "invalid_description",
        message: "Description must be 1000 characters or fewer.",
      },
      400,
    );
  }

  const category = normalizeCategory(body.category);
  if (!category) {
    return c.json(
      {
        error: "invalid_category",
        message: "Unknown category.",
      },
      400,
    );
  }

  const id = crypto.randomUUID();
  const r2Key = `docs/${userId}/${id}.${kind}`;
  const bucket = c.env.DOCS_BUCKET;

  try {
    await bucket.put(r2Key, bytes, {
      httpMetadata: { contentType: DOCUMENT_MIME[kind] },
      customMetadata: { userId, kind, originalName },
    });
  } catch (err) {
    logError("R2 upload failed", err);
    return c.json({ error: "storage_unavailable", message: "Could not store the file." }, 503);
  }

  const db = c.var.db;
  try {
    // Single guarded INSERT: the quota checks and the write are one atomic
    // statement, so concurrent uploads cannot race past the ceilings
    // (D1 has no transaction API — same reasoning as the auth callback).
    const result = await db.run(sql`
      INSERT INTO documents (id, user_id, title, description, category, kind, original_name, r2_key, size)
      SELECT ${id}, ${userId}, ${title}, ${description.value}, ${category}, ${kind}, ${originalName}, ${r2Key}, ${bytes.length}
      WHERE
        (SELECT COALESCE(SUM(size), 0) FROM documents WHERE user_id = ${userId}) + ${bytes.length}
          <= ${USER_STORAGE_QUOTA_BYTES}
        AND (SELECT COUNT(*) FROM documents WHERE user_id = ${userId}) < ${MAX_FILES_PER_USER}
        AND (SELECT COALESCE(SUM(size), 0) FROM documents) + ${bytes.length}
          <= ${SYSTEM_STORAGE_QUOTA_BYTES}
    `);

    if (result.meta?.changes === 0) {
      // Quota missed between the R2 put and the insert — remove the orphan.
      await bucket.delete(r2Key).catch((err) => logError("R2 cleanup failed", err));

      const agg = await db
        .select({ used: sql<number>`COALESCE(SUM(size), 0)`, files: count() })
        .from(documents)
        .where(eq(documents.userId, userId))
        .get();

      const used = agg?.used ?? 0;
      const files = agg?.files ?? 0;

      let message: string;
      if (files >= MAX_FILES_PER_USER) {
        message = `You have reached the limit of ${MAX_FILES_PER_USER} documents. Delete some to upload more.`;
      } else if (used + bytes.length > USER_STORAGE_QUOTA_BYTES) {
        message = `Your storage is full (${formatBytes(USER_STORAGE_QUOTA_BYTES)} per user). Delete documents to free space.`;
      } else {
        message = `MetaRepo storage is full (${formatBytes(SYSTEM_STORAGE_QUOTA_BYTES)} system-wide). Try again later.`;
      }

      return c.json({ error: "quota_exceeded", message }, 409);
    }

    const row = await db.select().from(documents).where(eq(documents.id, id)).get();
    if (!row) {
      return c.json({ error: "storage_unavailable", message: "Could not save the document." }, 500);
    }

    return c.json({ document: publicDoc(row) }, 201);
  } catch (err) {
    // Any failure after the R2 put must not leave a stored object behind.
    await bucket.delete(r2Key).catch(() => {});
    throw err;
  }
});

// ---------------------------------------------------------------------------
// GET /documents — the caller's own documents + usage meter data
// ---------------------------------------------------------------------------
documentRoutes.get("/", async (c) => {
  const userId = await getSessionUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  const db = c.var.db;

  const [rows, agg] = await Promise.all([
    db
      .select()
      .from(documents)
      .where(eq(documents.userId, userId))
      .orderBy(desc(documents.createdAt), desc(documents.id)),
    db
      .select({ used: sql<number>`COALESCE(SUM(size), 0)`, files: count() })
      .from(documents)
      .where(eq(documents.userId, userId))
      .get(),
  ]);

  return c.json({
    documents: rows.map(publicDoc),
    usage: {
      usedBytes: agg?.used ?? 0,
      quotaBytes: USER_STORAGE_QUOTA_BYTES,
      count: agg?.files ?? 0,
      maxFiles: MAX_FILES_PER_USER,
      maxFileSizeBytes: MAX_UPLOAD_BYTES,
    },
  });
});

// ---------------------------------------------------------------------------
// GET /documents/:id/content — streams the caller's own file from R2.
// PDFs are served inline (browser viewer); DOCX always downloads.
// `?download=1` forces a download for PDFs too.
// ---------------------------------------------------------------------------
documentRoutes.get("/:id/content", async (c) => {
  const userId = await getSessionUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  const id = c.req.param("id");

  const row = await c.var.db
    .select()
    .from(documents)
    .where(and(eq(documents.id, id), eq(documents.userId, userId)))
    .get();

  if (!row) return notFound(c);

  const object = await c.env.DOCS_BUCKET.get(row.r2Key);
  if (!object) {
    // Row exists but the object is gone (manual bucket surgery) — treat the
    // same as missing so the response stays indistinguishable.
    logError(`R2 object missing for document ${row.id}`);
    return notFound(c);
  }

  const isPdf = row.kind === "pdf";
  const inline = isPdf && c.req.query("download") !== "1";
  const disposition = inline ? "inline" : "attachment";
  // `kind` is validated against the enum at upload time; default to the
  // stricter mime for anything unexpected.
  const mime = isPdf ? DOCUMENT_MIME.pdf : DOCUMENT_MIME.docx;

  c.header("Content-Type", mime);
  c.header(
    "Content-Disposition",
    `${disposition}; filename="${asciiFallbackName(row.originalName)}"; ` +
      `filename*=UTF-8''${encodeURIComponent(row.originalName)}`,
  );
  c.header("Content-Length", String(object.size));
  c.header("Cache-Control", "private, max-age=60");
  c.header("ETag", object.httpEtag);
  // Override the global default-src 'none': `sandbox` is the proven pattern
  // for serving user files (no scripts execute, inline PDF viewing works).
  c.header("Content-Security-Policy", "sandbox");

  return c.body(object.body, 200);
});

// ---------------------------------------------------------------------------
// PATCH /documents/:id — edit title / description / category (owner only)
// ---------------------------------------------------------------------------
documentRoutes.patch("/:id", async (c) => {
  if (fromForeignOrigin(c)) return c.json({ error: "Forbidden" }, 403);

  const userId = await getSessionUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  const id = c.req.param("id");
  const body = (await c.req.json().catch(() => null)) as {
    title?: unknown;
    description?: unknown;
    category?: unknown;
  } | null;

  if (!body || typeof body !== "object") {
    return c.json({ error: "invalid_body", message: "Expected a JSON object." }, 400);
  }

  const hasChanges = "title" in body || "description" in body || "category" in body;
  if (!hasChanges) {
    return c.json(
      { error: "invalid_body", message: "Provide title, description, and/or category." },
      400,
    );
  }

  const existing = await c.var.db
    .select()
    .from(documents)
    .where(and(eq(documents.id, id), eq(documents.userId, userId)))
    .get();

  if (!existing) return notFound(c);

  const set: { title?: string; description?: string | null; category?: string } = {};

  if ("title" in body) {
    if (typeof body.title !== "string") {
      return c.json({ error: "invalid_title", message: "Title must be text." }, 400);
    }
    const title = normalizeTitle(body.title, existing.originalName);
    if (!title) {
      return c.json({ error: "invalid_title", message: "Title must be 1–120 characters." }, 400);
    }
    set.title = title;
  }

  if ("description" in body) {
    const description = normalizeDescription(body.description);
    if (!description.ok) {
      return c.json(
        { error: "invalid_description", message: "Description must be 1000 characters or fewer." },
        400,
      );
    }
    set.description = description.value;
  }

  if ("category" in body) {
    const category = normalizeCategory(body.category);
    if (!category) {
      return c.json({ error: "invalid_category", message: "Unknown category." }, 400);
    }
    set.category = category;
  }

  const result = await c.var.db
    .update(documents)
    .set(set)
    .where(and(eq(documents.id, id), eq(documents.userId, userId)))
    .run();

  if (result.meta?.changes === 0) return notFound(c);

  const updated = await c.var.db
    .select()
    .from(documents)
    .where(and(eq(documents.id, id), eq(documents.userId, userId)))
    .get();

  if (!updated) return notFound(c);

  return c.json({ document: publicDoc(updated) });
});

// ---------------------------------------------------------------------------
// DELETE /documents/:id — removes the R2 object and the row (frees quota)
// ---------------------------------------------------------------------------
documentRoutes.delete("/:id", async (c) => {
  if (fromForeignOrigin(c)) return c.json({ error: "Forbidden" }, 403);

  const userId = await getSessionUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  const id = c.req.param("id");

  const row = await c.var.db
    .select()
    .from(documents)
    .where(and(eq(documents.id, id), eq(documents.userId, userId)))
    .get();

  if (!row) return notFound(c);

  await c.env.DOCS_BUCKET.delete(row.r2Key);

  await c.var.db
    .delete(documents)
    .where(and(eq(documents.id, id), eq(documents.userId, userId)))
    .run();

  return c.body(null, 204);
});
