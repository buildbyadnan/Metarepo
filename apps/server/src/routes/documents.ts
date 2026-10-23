import { Hono, type Context } from "hono";
import { and, desc, eq, exists, sql, count } from "drizzle-orm";
import {
  categories,
  documentShares,
  documents,
  users,
  type DocumentRow,
  type DocumentShareRow,
} from "../db/schema";
import { getSessionUserId } from "../lib/session";
import { getSessionEmail, resolveDocumentAccess } from "../lib/access";
import { normalizePermission, normalizeRecipientEmail } from "../lib/shares";
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
  MAX_SHARES_PER_DOCUMENT,
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
 *    cannot be probed across accounts. Shared-in documents follow the same
 *    rule: a revoked or never-existent share is indistinguishable from a
 *    document that does not exist.
 * 3. R2 objects are only reachable through the authenticated content route;
 *    the bucket is private and never exposed via presigned URLs.
 * 4. Authorization funnels through resolveDocumentAccess() — owner >
 *    write > read > null. Delete and share management stay owner-only even
 *    for write recipients, and the category field is owner-only too.
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

function publicShare(row: DocumentShareRow) {
  return {
    id: row.id,
    documentId: row.documentId,
    email: row.recipientEmail,
    permission: row.permission,
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

  // Builtins resolve without a lookup; only a non-builtin value costs one
  // query against the user's custom categories.
  let category = normalizeCategory(body.category);
  if (category === null && typeof body.category === "string" && body.category.trim() !== "") {
    const custom = await c.var.db
      .select({ name: categories.name })
      .from(categories)
      .where(eq(categories.userId, userId));
    category = normalizeCategory(
      body.category,
      custom.map((row) => row.name),
    );
  }
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
// GET /documents/shared — documents OTHER people shared with the caller.
// Includes the permission and owner info for the "Shared by" badge.
// ---------------------------------------------------------------------------
documentRoutes.get("/shared", async (c) => {
  const userId = await getSessionUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  const email = await getSessionEmail(c.var.db, userId);
  if (!email) return c.json({ error: "Unauthorized" }, 401);

  const rows = await c.var.db
    .select({
      doc: documents,
      permission: documentShares.permission,
      sharedAt: documentShares.createdAt,
      ownerName: users.name,
      ownerEmail: users.email,
      ownerPicture: users.picture,
    })
    .from(documentShares)
    .innerJoin(documents, eq(documents.id, documentShares.documentId))
    .innerJoin(users, eq(users.id, documents.userId))
    .where(eq(documentShares.recipientEmail, email.trim().toLowerCase()))
    .orderBy(desc(documents.createdAt), desc(documents.id));

  return c.json({
    documents: rows.map((row) => ({
      ...publicDoc(row.doc),
      permission: row.permission,
      sharedAt: row.sharedAt,
      sharedBy: {
        name: row.ownerName,
        email: row.ownerEmail,
        picture: row.ownerPicture,
      },
    })),
  });
});

// ---------------------------------------------------------------------------
// GET /documents/:id/content — streams the caller's file from R2.
// Owners and read/write recipients all pass through resolveDocumentAccess.
// PDFs are served inline (browser viewer); DOCX always downloads.
// `?download=1` forces a download for PDFs too.
// ---------------------------------------------------------------------------
documentRoutes.get("/:id/content", async (c) => {
  const userId = await getSessionUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  const id = c.req.param("id");

  const resolved = await resolveDocumentAccess(c.var.db, id, userId);
  if (!resolved) return notFound(c);
  const row = resolved.doc;

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
  // Override the global default-src 'none': this response is meant to be
  // framed by the web app's preview iframe. X-Frame-Options is skipped
  // globally for `/content` (it cannot allow-list origins), so framing is
  // governed here by `frame-ancestors` — the web origin(s) from
  // ALLOWED_ORIGINS, plus 'self'. The previous `sandbox` policy blocked
  // Chrome's PDF viewer inside the framed preview.
  const frameAncestors = ["'self'", ...parseAllowedOrigins(c.env.ALLOWED_ORIGINS)].join(" ");
  c.header("Content-Security-Policy", `frame-ancestors ${frameAncestors}`);

  return c.body(object.body, 200);
});

// ---------------------------------------------------------------------------
// PATCH /documents/:id — edit title / description (owner or write share);
// category stays owner-only (write recipients get an explicit 403 there).
// Read recipients get the identical 404: mutations must not leak existence.
// ---------------------------------------------------------------------------
documentRoutes.patch("/:id", async (c) => {
  if (fromForeignOrigin(c)) return c.json({ error: "Forbidden" }, 403);

  const userId = await getSessionUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  const id = c.req.param("id");

  const resolved = await resolveDocumentAccess(c.var.db, id, userId);
  // No access, or read-only access: indistinguishable from a missing id.
  if (!resolved || resolved.access === "read") return notFound(c);
  const existing = resolved.doc;
  const isOwner = resolved.access === "owner";

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

  if ("category" in body && !isOwner) {
    return c.json({ error: "forbidden", message: "Only the owner can change the category." }, 403);
  }

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
    // Owner-only, validated against builtins + this owner's custom names.
    let category = normalizeCategory(body.category);
    if (category === null && typeof body.category === "string" && body.category.trim() !== "") {
      const custom = await c.var.db
        .select({ name: categories.name })
        .from(categories)
        .where(eq(categories.userId, existing.userId));
      category = normalizeCategory(
        body.category,
        custom.map((row) => row.name),
      );
    }
    if (!category) {
      return c.json({ error: "invalid_category", message: "Unknown category." }, 400);
    }
    set.category = category;
  }

  // Scope by id + (owner user id OR a live write share) so a revocation
  // racing this request cannot slip through.
  const writeScope = isOwner
    ? eq(documents.userId, userId)
    : exists(
        c.var.db
          .select({ one: sql`1` })
          .from(documentShares)
          .where(
            and(
              eq(documentShares.documentId, id),
              eq(documentShares.recipientEmail, resolved.email ?? ""),
              eq(documentShares.permission, "write"),
            ),
          ),
      );

  const result = await c.var.db
    .update(documents)
    .set(set)
    .where(and(eq(documents.id, id), writeScope))
    .run();

  if (result.meta?.changes === 0) return notFound(c);

  const updated = await c.var.db.select().from(documents).where(eq(documents.id, id)).get();

  if (!updated) return notFound(c);

  return c.json({ document: publicDoc(updated) });
});

// ---------------------------------------------------------------------------
// DELETE /documents/:id — removes the R2 object and the row (frees quota).
// Owner-only even for write recipients: a write share cannot destroy data.
// Everyone else gets the identical 404.
// ---------------------------------------------------------------------------
documentRoutes.delete("/:id", async (c) => {
  if (fromForeignOrigin(c)) return c.json({ error: "Forbidden" }, 403);

  const userId = await getSessionUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  const id = c.req.param("id");

  const resolved = await resolveDocumentAccess(c.var.db, id, userId);
  if (!resolved || resolved.access !== "owner") return notFound(c);
  const row = resolved.doc;

  await c.env.DOCS_BUCKET.delete(row.r2Key);

  const result = await c.var.db
    .delete(documents)
    .where(and(eq(documents.id, id), eq(documents.userId, userId)))
    .run();

  // Row vanished between resolve and delete (e.g. owner deleted it twice) —
  // the R2 object is gone either way, keep the response consistent.
  if (result.meta?.changes === 0) return notFound(c);

  return c.body(null, 204);
});

// ---------------------------------------------------------------------------
// POST /documents/:id/shares — share with an email address (owner only).
// The recipient does not need an account yet: the share activates when
// that address first signs in. Rate-limited at the app layer (index.ts).
// ---------------------------------------------------------------------------
documentRoutes.post("/:id/shares", async (c) => {
  if (fromForeignOrigin(c)) return c.json({ error: "Forbidden" }, 403);

  const userId = await getSessionUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  const id = c.req.param("id");

  const resolved = await resolveDocumentAccess(c.var.db, id, userId);
  if (!resolved || resolved.access !== "owner") return notFound(c);

  const body = (await c.req.json().catch(() => null)) as {
    email?: unknown;
    permission?: unknown;
  } | null;

  if (!body || typeof body !== "object") {
    return c.json({ error: "invalid_body", message: "Expected a JSON object." }, 400);
  }

  const email = normalizeRecipientEmail(body.email);
  if (!email) {
    return c.json({ error: "invalid_email", message: "Enter a valid email address." }, 400);
  }

  const permission = normalizePermission(body.permission);
  if (!permission) {
    return c.json(
      { error: "invalid_permission", message: 'Permission must be "read" or "write".' },
      400,
    );
  }

  const ownerEmail = await getSessionEmail(c.var.db, userId);
  if (ownerEmail && email === ownerEmail.trim().toLowerCase()) {
    return c.json(
      { error: "cannot_share_to_self", message: "You cannot share with yourself." },
      400,
    );
  }

  const agg = await c.var.db
    .select({ shares: count() })
    .from(documentShares)
    .where(eq(documentShares.documentId, id))
    .get();
  if ((agg?.shares ?? 0) >= MAX_SHARES_PER_DOCUMENT) {
    return c.json(
      {
        error: "share_limit",
        message: `A document can be shared with at most ${MAX_SHARES_PER_DOCUMENT} people.`,
      },
      409,
    );
  }

  const shareId = crypto.randomUUID();
  const inserted = await c.var.db
    .insert(documentShares)
    .values({
      id: shareId,
      documentId: id,
      recipientEmail: email,
      permission,
    })
    .onConflictDoNothing()
    .run();

  // UNIQUE(document_id, recipient_email) raced or pre-existed → duplicate.
  if (inserted.meta?.changes === 0) {
    return c.json(
      { error: "already_shared", message: "This document is already shared with that email." },
      409,
    );
  }

  const row = await c.var.db
    .select()
    .from(documentShares)
    .where(eq(documentShares.id, shareId))
    .get();
  if (!row) return c.json({ error: "storage_unavailable", message: "Could not share." }, 500);

  return c.json({ share: publicShare(row) }, 201);
});

// ---------------------------------------------------------------------------
// GET /documents/:id/shares — the share list (owner only). Includes the
// recipient's display name when they already have an account.
// ---------------------------------------------------------------------------
documentRoutes.get("/:id/shares", async (c) => {
  const userId = await getSessionUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  const id = c.req.param("id");

  const resolved = await resolveDocumentAccess(c.var.db, id, userId);
  if (!resolved || resolved.access !== "owner") return notFound(c);

  const rows = await c.var.db
    .select({
      share: documentShares,
      recipientName: users.name,
      recipientPicture: users.picture,
    })
    .from(documentShares)
    .leftJoin(users, eq(users.email, documentShares.recipientEmail))
    .where(eq(documentShares.documentId, id))
    .orderBy(desc(documentShares.createdAt), desc(documentShares.id));

  return c.json({
    shares: rows.map((row) => ({
      ...publicShare(row.share),
      recipientName: row.recipientName,
      recipientPicture: row.recipientPicture,
    })),
  });
});

// ---------------------------------------------------------------------------
// DELETE /documents/:id/shares/:shareId — revoke one share (owner only).
// Scoped by document id too, so a share id from another document is a 404.
// ---------------------------------------------------------------------------
documentRoutes.delete("/:id/shares/:shareId", async (c) => {
  if (fromForeignOrigin(c)) return c.json({ error: "Forbidden" }, 403);

  const userId = await getSessionUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  const id = c.req.param("id");
  const shareId = c.req.param("shareId");

  const resolved = await resolveDocumentAccess(c.var.db, id, userId);
  if (!resolved || resolved.access !== "owner") return notFound(c);

  const result = await c.var.db
    .delete(documentShares)
    .where(and(eq(documentShares.id, shareId), eq(documentShares.documentId, id)))
    .run();

  if (result.meta?.changes === 0) return notFound(c);

  return c.body(null, 204);
});
