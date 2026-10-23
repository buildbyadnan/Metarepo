import { sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { users } from "./users";

/**
 * User-created document categories.
 *
 * `documents.category` stays a plain TEXT label holding either a builtin key
 * (report | invoice | id | contract | notes | other) or one of the owner's
 * custom names — there is deliberately no FK from documents to this table:
 * deleting a category never rewrites documents, they keep displaying the
 * label they were given ("one document has one category" stays true).
 *
 * This table only powers the creator's picker/manager. Uniqueness per user
 * is enforced by the (user_id, name) unique index, and the routes add a
 * case-insensitive check on top ("Taxes" and "taxes" are the same category).
 */
export const categories = sqliteTable(
  "categories",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`),
  },
  (t) => [uniqueIndex("categories_user_id_name_uq").on(t.userId, t.name)],
);

export type CategoryRow = typeof categories.$inferSelect;
