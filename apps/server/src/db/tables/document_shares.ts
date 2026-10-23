import { sqliteTable, text, index, uniqueIndex, check } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { documents } from "./documents";

/**
 * Email-keyed document shares.
 *
 * A share grants exactly one recipient — identified by their exact Google
 * login email (`users.email` is UNIQUE) — access to one document:
 * - "read": view metadata + content, download
 * - "write": additionally edit title/description (never category, delete,
 *   or share management — those stay owner-only)
 *
 * There is no recipient_user_id on purpose: resolution happens at access
 * time by matching the session user's email against `recipient_email`, so a
 * share created before the recipient ever signed up simply activates when
 * they first log in with that email.
 *
 * Deleting a document cascades and removes its shares.
 */
export const documentShares = sqliteTable(
  "document_shares",
  {
    id: text("id").primaryKey(),
    documentId: text("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    /** Lowercased exact email of the recipient (resolved at access time). */
    recipientEmail: text("recipient_email").notNull(),
    /** "read" | "write" — also enforced by a CHECK constraint below. */
    permission: text("permission").notNull(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`),
  },
  (t) => [
    uniqueIndex("document_shares_document_id_recipient_email_uq").on(
      t.documentId,
      t.recipientEmail,
    ),
    index("document_shares_recipient_email_idx").on(t.recipientEmail),
    check("document_shares_permission_ck", sql`${t.permission} in ('read', 'write')`),
  ],
);

export type DocumentShareRow = typeof documentShares.$inferSelect;
