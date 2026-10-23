import type { Context } from "hono";
import { getCookie } from "hono/cookie";
import { eq } from "drizzle-orm";
import { sessions } from "../db/schema";
import { hashSession } from "./crypto";
import { SESSION_TOKEN_LENGTH } from "../constants";
import type { Bindings, Variables } from "../types";

type AppContext = Context<{ Bindings: Bindings; Variables: Variables }>;

/**
 * Resolves the owning user id for the current request from the session
 * cookie (or Bearer token). Returns null when there is no valid session.
 *
 * This is the ONLY source of user identity for document access — route
 * handlers must never trust a client-supplied user id.
 */
export async function getSessionUserId(c: AppContext): Promise<string | null> {
  const token = c.req.header("Authorization")?.replace("Bearer ", "") || getCookie(c, "session");

  if (!token || token.length !== SESSION_TOKEN_LENGTH) return null;

  const sessionHash = await hashSession(token, c.env.SESSION_SECRET);
  const session = await c.var.db.select().from(sessions).where(eq(sessions.id, sessionHash)).get();

  if (!session || session.expiresAt < Math.floor(Date.now() / 1000)) return null;

  return session.userId;
}
