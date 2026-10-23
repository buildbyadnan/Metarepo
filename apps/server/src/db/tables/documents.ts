import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { users } from "./users";

/**
 * Personal-cloud documents. One row per uploaded file; the bytes themselves
 * live in R2 under `docs/{userId}/{uuid}.{ext}` — the key is only ever
 * returned to (and servable by) the owning session.
 *
 * Every query against this table MUST be scoped by `user_id`: that is the
 * isolation boundary between accounts.
 */
export const documents = sqliteTable(
  "documents",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    /** report | invoice | id | contract | notes | other (validated server-side) */
    category: text("category").notNull().default("other"),
    /** pdf | docx — derived from file content, never from the filename. */
    kind: text("kind").notNull(),
    originalName: text("original_name").notNull(),
    /** Unique R2 object key: docs/{userId}/{uuid}.{kind} */
    r2Key: text("r2_key").notNull().unique(),
    size: integer("size").notNull(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`),
  },
  (t) => [
    index("documents_user_id_idx").on(t.userId),
    index("documents_created_at_idx").on(t.createdAt),
  ],
);

export type DocumentRow = typeof documents.$inferSelect;
