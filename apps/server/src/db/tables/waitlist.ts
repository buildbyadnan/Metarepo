import { sqliteTable, text, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

/**
 * Waitlist entries. Every user who signs in with Google is added here with
 * status "pending" on their first login; access to the dashboard requires an
 * "approved" status (promote manually via D1 / drizzle studio).
 *
 * status: "pending" | "approved"
 */
export const waitlist = sqliteTable(
  "waitlist",
  {
    email: text("email").primaryKey(),
    name: text("name").notNull(),
    picture: text("picture"),
    status: text("status").notNull().default("pending"),
    joinedAt: text("joined_at")
      .notNull()
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`),
  },
  (t) => [index("waitlist_status_idx").on(t.status)],
);
