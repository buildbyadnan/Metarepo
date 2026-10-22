import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { bodyLimit } from "hono/body-limit";
import { initDbConnect } from "./db";
import { authRoutes } from "./routes/auth";
import { healthRoutes } from "./routes/health";
import { logError } from "./lib/logger";
import { parseAllowedOrigins } from "./lib/origins";
import { validateEnv } from "./env";
import type { Bindings, Variables } from "./types";

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

const MAX_BODY_BYTES = 1024 * 1024; // 1 MB
let kvRateLimitWarningShown = false;
let envValidated = false;

async function checkRateLimitKV(
  kv: KVNamespace | undefined,
  key: string,
  max: number,
  windowSec: number,
): Promise<boolean> {
  if (!kv) {
    if (!kvRateLimitWarningShown) {
      logError(
        "RATE_LIMIT_KV not configured — rate limiting is disabled. " +
          "Configure a KV namespace binding to enable distributed rate limiting. " +
          "See SETUP.md for instructions.",
      );
      kvRateLimitWarningShown = true;
    }
    return true;
  }

  const now = Math.floor(Date.now() / 1000);
  const entry = await kv.get<{ count: number; resetAt: number }>(key, "json");

  if (!entry || now > entry.resetAt) {
    await kv.put(key, JSON.stringify({ count: 1, resetAt: now + windowSec }), {
      expirationTtl: windowSec + 10,
    });
    return true;
  }

  if (entry.count >= max) return false;

  entry.count++;
  await kv.put(key, JSON.stringify(entry), {
    expirationTtl: entry.resetAt - now + 10,
  });
  return true;
}

function getClientIp(c: { req: { header: (name: string) => string | undefined } }): string {
  return c.req.header("CF-Connecting-IP") || "unknown";
}

app.use("/*", logger());
app.use("/*", bodyLimit({ maxSize: MAX_BODY_BYTES }));
app.use("/*", async (c, next) => {
  c.header("X-Content-Type-Options", "nosniff");
  c.header("X-Frame-Options", "DENY");
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");
  c.header("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  c.header("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  c.header("Content-Security-Policy", "default-src 'none'");

  const requestId = crypto.randomUUID();
  c.header("X-Request-Id", requestId);

  const allowedOrigins = parseAllowedOrigins(c.env.ALLOWED_ORIGINS);

  return cors({
    origin: (origin) => (allowedOrigins.includes(origin) ? origin : null),
    credentials: true,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
  })(c, next);
});

app.use("/*", async (c, next) => {
  if (!envValidated) {
    const result = validateEnv(c.env as unknown as Record<string, unknown>);
    envValidated = true;
    if (!result.ok) {
      return c.json({ error: "Server misconfigured", missing: result.missing }, 500);
    }
  }
  c.set("db", initDbConnect(c.env.DB));
  await next();
});

app.use("/auth/google", async (c, next) => {
  const ip = getClientIp(c);
  if (!(await checkRateLimitKV(c.env.RATE_LIMIT_KV, `auth:${ip}`, 10, 60))) {
    return c.json({ error: "Too many requests" }, 429);
  }
  await next();
});

app.use("/auth/me", async (c, next) => {
  const ip = getClientIp(c);
  if (!(await checkRateLimitKV(c.env.RATE_LIMIT_KV, `me:${ip}`, 30, 60))) {
    return c.json({ error: "Too many requests" }, 429);
  }
  await next();
});

app.route("/", healthRoutes);
app.route("/auth", authRoutes);

app.onError((err, c) => {
  logError("Unhandled error", err);
  return c.json({ error: "Internal Server Error" }, 500);
});

app.notFound((c) => c.json({ error: "Not Found" }, 404));

export default app;
