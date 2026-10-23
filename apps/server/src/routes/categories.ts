import { Hono, type Context } from "hono";
import { and, desc, eq, count } from "drizzle-orm";
import { categories, documents, type CategoryRow } from "../db/schema";
import { getSessionUserId } from "../lib/session";
import { normalizeCategoryName } from "../lib/documents";
import { isForeignOrigin, parseAllowedOrigins } from "../lib/origins";
import { CATEGORY_NAME_MAX, DOCUMENT_CATEGORIES, MAX_CATEGORIES_PER_USER } from "../constants";
import type { Bindings, Variables } from "../types";

type Ctx = { Bindings: Bindings; Variables: Variables };

/**
 * Custom category management — per-user lists that power the picker.
 *
 * Documents store the category as a plain label (builtin key or custom
 * name), so:
 * - renaming a category cascades onto the owner's documents that carry it
 * - deleting only removes the entry; documents keep their stored label
 *   untouched (the label stays visible/filterable forever)
 *
 * Categories belong to an account, never to a share: recipients of a shared
 * document see its label read-only and can manage only their own list.
 */
export const categoryRoutes = new Hono<Ctx>();

function fromForeignOrigin(c: Context<Ctx>): boolean {
  return isForeignOrigin(c.req.header("origin"), parseAllowedOrigins(c.env.ALLOWED_ORIGINS));
}

function publicCategory(row: CategoryRow) {
  return { id: row.id, name: row.name, createdAt: row.createdAt };
}

// ---------------------------------------------------------------------------
// GET /categories — builtin suggestions + the caller's custom categories
// ---------------------------------------------------------------------------
categoryRoutes.get("/", async (c) => {
  const userId = await getSessionUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  const rows = await c.var.db
    .select()
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(desc(categories.createdAt), desc(categories.id));

  return c.json({
    builtin: [...DOCUMENT_CATEGORIES],
    categories: rows.map(publicCategory),
  });
});

// ---------------------------------------------------------------------------
// POST /categories — create a custom category
// ---------------------------------------------------------------------------
categoryRoutes.post("/", async (c) => {
  if (fromForeignOrigin(c)) return c.json({ error: "Forbidden" }, 403);

  const userId = await getSessionUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  const body = (await c.req.json().catch(() => null)) as { name?: unknown } | null;
  if (!body || typeof body !== "object") {
    return c.json({ error: "invalid_body", message: "Expected a JSON object." }, 400);
  }

  const parsed = normalizeCategoryName(body.name);
  if (!parsed.ok) {
    if (parsed.reason === "builtin") {
      return c.json(
        {
          error: "builtin_category",
          message: "That name is a built-in category — pick your own.",
        },
        400,
      );
    }
    return c.json(
      {
        error: "invalid_name",
        message: `Category names must be 1–${CATEGORY_NAME_MAX} characters.`,
      },
      400,
    );
  }

  const db = c.var.db;

  const agg = await db
    .select({ total: count() })
    .from(categories)
    .where(eq(categories.userId, userId))
    .get();
  if ((agg?.total ?? 0) >= MAX_CATEGORIES_PER_USER) {
    return c.json(
      {
        error: "category_limit",
        message: `You can create up to ${MAX_CATEGORIES_PER_USER} categories.`,
      },
      409,
    );
  }

  const existing = await db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .where(eq(categories.userId, userId));
  if (existing.some((row) => row.name.trim().toLowerCase() === parsed.value.toLowerCase())) {
    return c.json({ error: "already_exists", message: "You already have that category." }, 409);
  }

  const id = crypto.randomUUID();
  const inserted = await db
    .insert(categories)
    .values({ id, userId, name: parsed.value })
    .onConflictDoNothing()
    .run();

  // UNIQUE(user_id, name) raced past the check above.
  if (inserted.meta?.changes === 0) {
    return c.json({ error: "already_exists", message: "You already have that category." }, 409);
  }

  const row = await db.select().from(categories).where(eq(categories.id, id)).get();
  if (!row) return c.json({ error: "storage_unavailable", message: "Could not save." }, 500);

  return c.json({ category: publicCategory(row) }, 201);
});

// ---------------------------------------------------------------------------
// PATCH /categories/:id — rename; cascades onto the owner's documents
// ---------------------------------------------------------------------------
categoryRoutes.patch("/:id", async (c) => {
  if (fromForeignOrigin(c)) return c.json({ error: "Forbidden" }, 403);

  const userId = await getSessionUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  const id = c.req.param("id");
  const body = (await c.req.json().catch(() => null)) as { name?: unknown } | null;
  if (!body || typeof body !== "object") {
    return c.json({ error: "invalid_body", message: "Expected a JSON object." }, 400);
  }

  const parsed = normalizeCategoryName(body.name);
  if (!parsed.ok) {
    if (parsed.reason === "builtin") {
      return c.json(
        {
          error: "builtin_category",
          message: "That name is a built-in category — pick your own.",
        },
        400,
      );
    }
    return c.json(
      {
        error: "invalid_name",
        message: `Category names must be 1–${CATEGORY_NAME_MAX} characters.`,
      },
      400,
    );
  }

  const db = c.var.db;

  const existing = await db
    .select()
    .from(categories)
    .where(and(eq(categories.id, id), eq(categories.userId, userId)))
    .get();
  if (!existing) return c.json({ error: "Not found" }, 404);

  const dup = await db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .where(eq(categories.userId, userId));
  if (
    dup.some((row) => row.id !== id && row.name.trim().toLowerCase() === parsed.value.toLowerCase())
  ) {
    return c.json({ error: "already_exists", message: "You already have that category." }, 409);
  }

  const result = await db
    .update(categories)
    .set({ name: parsed.value })
    .where(and(eq(categories.id, id), eq(categories.userId, userId)))
    .run();
  if (result.meta?.changes === 0) return c.json({ error: "Not found" }, 404);

  // Cascade: documents carrying the old label follow the rename. Documents
  // of other users are untouched — this category belongs to `userId` only.
  await db
    .update(documents)
    .set({ category: parsed.value })
    .where(and(eq(documents.userId, userId), eq(documents.category, existing.name)))
    .run();

  const updated = await db.select().from(categories).where(eq(categories.id, id)).get();
  if (!updated) return c.json({ error: "Not found" }, 404);

  return c.json({ category: publicCategory(updated) });
});

// ---------------------------------------------------------------------------
// DELETE /categories/:id — removes the picker entry only. Documents keep
// their stored label: no reassignment, no 409, no silent mutations.
// ---------------------------------------------------------------------------
categoryRoutes.delete("/:id", async (c) => {
  if (fromForeignOrigin(c)) return c.json({ error: "Forbidden" }, 403);

  const userId = await getSessionUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  const id = c.req.param("id");

  const result = await c.var.db
    .delete(categories)
    .where(and(eq(categories.id, id), eq(categories.userId, userId)))
    .run();

  if (result.meta?.changes === 0) return c.json({ error: "Not found" }, 404);

  return c.body(null, 204);
});
