import { Hono } from "hono";
import { setCookie, getCookie } from "hono/cookie";
import {
  generateState,
  validateState,
  getGoogleAuthUrl,
  exchangeCodeForTokens,
  getGoogleUser,
  refreshAccessToken,
} from "@repo/auth";
import { encrypt, decrypt } from "@repo/http";
import { users, accounts, sessions } from "../db/schema";
import { eq, and, lt } from "drizzle-orm";
import { hashSession } from "../lib/crypto";
import { getSessionUserId } from "../lib/session";
import { isValidEmail } from "../lib/validate";
import { logError } from "../lib/logger";
import { isForeignOrigin, parseAllowedOrigins } from "../lib/origins";
import { SESSION_TOKEN_LENGTH } from "../constants";
import type { Bindings, Variables } from "../types";

// Session lifetime in seconds (default: 7 days). Customize as needed.
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function sanitizeName(name: string): string {
  return (
    (name || "User")
      // eslint-disable-next-line no-control-regex -- intentional: strip control chars from user input
      .replace(/[\x00-\x1f\x7f]/g, "")
      .trim()
      .slice(0, 100)
  );
}

function sanitizePicture(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" ? parsed.href : null;
  } catch {
    return null;
  }
}

export const authRoutes = new Hono<{
  Bindings: Bindings;
  Variables: Variables;
}>();

authRoutes.get("/google", async (c) => {
  const state = generateState();
  const { url, codeVerifier } = await getGoogleAuthUrl(
    c.env.GOOGLE_CLIENT_ID,
    `${new URL(c.req.url).origin}/auth/google/callback`,
    state,
  );

  setCookie(c, "oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    path: "/",
    maxAge: 600,
  });
  setCookie(c, "oauth_code_verifier", codeVerifier, {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    path: "/",
    maxAge: 600,
  });

  return c.redirect(url);
});

authRoutes.get("/google/callback", async (c) => {
  const state = c.req.query("state");
  const code = c.req.query("code");
  const savedState = getCookie(c, "oauth_state");
  const codeVerifier = getCookie(c, "oauth_code_verifier");

  setCookie(c, "oauth_state", "", {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    maxAge: 0,
    path: "/",
  });
  setCookie(c, "oauth_code_verifier", "", {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    maxAge: 0,
    path: "/",
  });

  const webUrl = c.env.WEB_APP_URL;
  if (!webUrl) {
    logError("WEB_APP_URL not configured");
    return c.json({ error: "Server configuration error" }, 500);
  }

  if (!code || !state || !savedState || !codeVerifier) {
    return c.redirect(`${webUrl}?auth_error=missing_params`);
  }

  if (!validateState(state, savedState)) {
    return c.redirect(`${webUrl}?auth_error=invalid_state`);
  }

  try {
    const tokens = await exchangeCodeForTokens(
      code,
      c.env.GOOGLE_CLIENT_ID,
      c.env.GOOGLE_CLIENT_SECRET,
      `${new URL(c.req.url).origin}/auth/google/callback`,
      codeVerifier,
    );

    const googleUser = await getGoogleUser(tokens.access_token);

    if (!googleUser.id || !googleUser.email) {
      return c.redirect(`${webUrl}?auth_error=invalid_user`);
    }

    const email = googleUser.email.toLowerCase().trim();
    if (!isValidEmail(email)) {
      return c.redirect(`${webUrl}?auth_error=invalid_email`);
    }

    const name = sanitizeName(googleUser.name);
    const picture = sanitizePicture(googleUser.picture);

    const db = c.var.db;

    const sessionToken = generateState();
    const sessionHash = await hashSession(sessionToken, c.env.SESSION_SECRET);

    const encryptedRefreshToken = tokens.refresh_token
      ? await encrypt(tokens.refresh_token, c.env.SESSION_SECRET)
      : null;

    // D1 Workers doesn't support db.transaction() (Drizzle sends raw SQL BEGIN).
    // Use D1's batch() API which runs statements atomically.
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = now + SESSION_MAX_AGE;

    await db.batch([
      db
        .insert(users)
        .values({
          id: googleUser.id,
          email,
          name,
          picture,
        })
        .onConflictDoUpdate({
          target: users.id,
          set: { email, name, picture, updatedAt: new Date().toISOString() },
        }),
      db
        .insert(accounts)
        .values({
          userId: googleUser.id,
          provider: "google",
          providerAccountId: googleUser.id,
          refreshToken: encryptedRefreshToken,
          expiresAt: Math.floor(Date.now() / 1000) + tokens.expires_in,
        })
        .onConflictDoUpdate({
          target: [accounts.provider, accounts.providerAccountId],
          set: {
            ...(encryptedRefreshToken ? { refreshToken: encryptedRefreshToken } : {}),
            expiresAt: Math.floor(Date.now() / 1000) + tokens.expires_in,
          },
        }),
      // Every Google signup creates/refreshes the user row; no gating tables.
      db.delete(sessions).where(eq(sessions.userId, googleUser.id)),
      db.insert(sessions).values({ id: sessionHash, userId: googleUser.id, expiresAt }),
    ]);

    setCookie(c, "session", sessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });

    // Signed in — straight into the product.
    return c.redirect(`${webUrl}/documents`);
  } catch (err) {
    logError("Auth callback failed", err);
    return c.redirect(`${webUrl}?auth_error=callback_failed`);
  }
});

authRoutes.get("/me", async (c) => {
  const sessionToken =
    c.req.header("Authorization")?.replace("Bearer ", "") || getCookie(c, "session");

  if (!sessionToken || sessionToken.length !== SESSION_TOKEN_LENGTH) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const sessionHash = await hashSession(sessionToken, c.env.SESSION_SECRET);
  const db = c.var.db;

  const session = await db.select().from(sessions).where(eq(sessions.id, sessionHash)).get();

  if (!session || session.expiresAt < Math.floor(Date.now() / 1000)) {
    if (session) {
      await db.delete(sessions).where(eq(sessions.id, sessionHash)).run();
    }
    return c.json({ error: "Unauthorized" }, 401);
  }

  const now = Math.floor(Date.now() / 1000);
  const remaining = session.expiresAt - now;
  if (remaining < SESSION_MAX_AGE / 2) {
    const newSessionToken = generateState();
    const newSessionHash = await hashSession(newSessionToken, c.env.SESSION_SECRET);
    const newExpiresAt = now + SESSION_MAX_AGE;

    const deleteResult = await db.delete(sessions).where(eq(sessions.id, sessionHash)).run();

    if (deleteResult.meta?.changes !== 0) {
      await db
        .insert(sessions)
        .values({ id: newSessionHash, userId: session.userId, expiresAt: newExpiresAt })
        .run();

      setCookie(c, "session", newSessionToken, {
        httpOnly: true,
        secure: true,
        sameSite: "Lax",
        path: "/",
        maxAge: SESSION_MAX_AGE,
      });
    }
  }

  await db
    .delete(sessions)
    .where(and(eq(sessions.userId, session.userId), lt(sessions.expiresAt, now)))
    .run();

  const user = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      picture: users.picture,
      notifyUpdates: users.notifyUpdates,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, session.userId))
    .get();

  if (!user) return c.json({ error: "Unauthorized" }, 401);

  return c.json({ user });
});

/**
 * PATCH /auth/me — account preferences for the signed-in user.
 * Body: { notifyUpdates: boolean }
 */
authRoutes.patch("/me", async (c) => {
  if (isForeignOrigin(c.req.header("origin"), parseAllowedOrigins(c.env.ALLOWED_ORIGINS))) {
    return c.json({ error: "Forbidden" }, 403);
  }

  const userId = await getSessionUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  const body = (await c.req.json().catch(() => null)) as { notifyUpdates?: unknown } | null;
  if (!body || typeof body.notifyUpdates !== "boolean") {
    return c.json({ error: "notifyUpdates must be a boolean" }, 400);
  }

  await c.var.db
    .update(users)
    .set({ notifyUpdates: body.notifyUpdates, updatedAt: new Date().toISOString() })
    .where(eq(users.id, userId))
    .run();

  return c.json({ notifyUpdates: body.notifyUpdates });
});

authRoutes.post("/logout", async (c) => {
  if (isForeignOrigin(c.req.header("origin"), parseAllowedOrigins(c.env.ALLOWED_ORIGINS))) {
    return c.json({ error: "Forbidden" }, 403);
  }

  const sessionToken =
    c.req.header("Authorization")?.replace("Bearer ", "") || getCookie(c, "session");

  if (sessionToken && sessionToken.length === SESSION_TOKEN_LENGTH) {
    const sessionHash = await hashSession(sessionToken, c.env.SESSION_SECRET);
    const db = c.var.db;
    await db.delete(sessions).where(eq(sessions.id, sessionHash)).run();
  }

  setCookie(c, "session", "", {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    maxAge: 0,
    path: "/",
  });

  return c.json({ ok: true });
});

authRoutes.post("/refresh", async (c) => {
  try {
    const sessionToken =
      c.req.header("Authorization")?.replace("Bearer ", "") || getCookie(c, "session");

    if (!sessionToken || sessionToken.length !== SESSION_TOKEN_LENGTH) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const sessionHash = await hashSession(sessionToken, c.env.SESSION_SECRET);
    const db = c.var.db;

    const session = await db.select().from(sessions).where(eq(sessions.id, sessionHash)).get();

    if (!session || session.expiresAt < Math.floor(Date.now() / 1000)) {
      return c.json({ error: "Session expired" }, 401);
    }

    const account = await db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, session.userId))
      .get();

    if (!account?.refreshToken || !account.expiresAt) {
      return c.json({ error: "No refresh token available" }, 400);
    }

    const now = Math.floor(Date.now() / 1000);
    if (account.expiresAt > now) {
      return c.json({ error: "Token not expired yet" }, 400);
    }

    const decryptedRefreshToken = await decrypt(account.refreshToken, c.env.SESSION_SECRET);

    const tokens = await refreshAccessToken(
      decryptedRefreshToken,
      c.env.GOOGLE_CLIENT_ID,
      c.env.GOOGLE_CLIENT_SECRET,
    );

    const encryptedNewRefreshToken = tokens.refresh_token
      ? await encrypt(tokens.refresh_token, c.env.SESSION_SECRET)
      : account.refreshToken;

    await db
      .update(accounts)
      .set({
        refreshToken: encryptedNewRefreshToken,
        expiresAt: now + tokens.expires_in,
      })
      .where(eq(accounts.id, account.id));

    return c.json({ ok: true });
  } catch (err) {
    logError("Token refresh failed", err);
    return c.json({ error: "Token refresh failed" }, 500);
  }
});
