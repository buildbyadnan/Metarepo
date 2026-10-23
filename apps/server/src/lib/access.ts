import { and, eq } from "drizzle-orm";
import { documents, documentShares, users, type DocumentRow } from "../db/schema";
import type { initDbConnect } from "../db";

type Db = ReturnType<typeof initDbConnect>;

/**
 * Document authorization: the single source of truth for who may do what.
 *
 * Access levels (in precedence order):
 * - "owner": everything — edit (incl. category), delete, manage shares
 * - "write": view + edit title/description (never category/delete/shares)
 * - "read":  view + download only
 * - null:    no access — routes must return the *identical* 404 used for
 *            nonexistent ids, so document existence never leaks
 *
 * Shares are keyed by the recipient's email (not user id): a share resolves
 * on the recipient's first login with that address and vanishes the moment
 * the share row is revoked.
 */

export type DocumentAccessLevel = "owner" | "write" | "read";

/**
 * The resolved document, the caller's level, and their email — null for
 * owners (their identity is already enforced by user_id and the extra
 * lookup is skipped).
 */
export type ResolvedDocument = {
  doc: DocumentRow;
  access: DocumentAccessLevel;
  email: string | null;
};

/**
 * Pure access decision (unit-tested directly): given the document, the
 * session, and the share row found for this document+email (or null),
 * which level — if any — does the session hold?
 */
export function decideDocumentAccess(
  doc: { userId: string },
  session: { userId: string; email: string },
  share: { recipientEmail: string; permission: string } | null,
): DocumentAccessLevel | null {
  if (doc.userId === session.userId) return "owner";
  if (!share) return null;
  if (share.recipientEmail.trim().toLowerCase() !== session.email.trim().toLowerCase()) {
    return null;
  }
  if (share.permission === "write") return "write";
  if (share.permission === "read") return "read";
  return null;
}

/** Resolves a document + the session's access level, or null when hidden. */
export async function resolveDocumentAccess(
  db: Db,
  docId: string,
  sessionUserId: string,
): Promise<ResolvedDocument | null> {
  const doc = await db.select().from(documents).where(eq(documents.id, docId)).get();
  if (!doc) return null;

  // Owners never need the email/share lookup.
  if (doc.userId === sessionUserId) return { doc, access: "owner", email: null };

  const sessionUser = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.id, sessionUserId))
    .get();
  if (!sessionUser) return null;

  const email = sessionUser.email.trim().toLowerCase();
  const share = await db
    .select()
    .from(documentShares)
    .where(and(eq(documentShares.documentId, docId), eq(documentShares.recipientEmail, email)))
    .get();
  if (!share) return null;

  const access = decideDocumentAccess(doc, { userId: sessionUserId, email }, share);
  return access ? { doc, access, email } : null;
}

/** The session user's email, or null when the account row is gone. */
export async function getSessionEmail(db: Db, sessionUserId: string): Promise<string | null> {
  const row = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.id, sessionUserId))
    .get();
  return row?.email ?? null;
}
