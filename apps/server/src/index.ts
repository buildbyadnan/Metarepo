import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { bodyLimit } from "hono/body-limit";
import { initDbConnect } from "./db";
import { healthRoutes } from "./routes/health";
import { logError } from "./lib/logger";
import { parseAllowedOrigins } from "./lib/origins";
import { validateEnv } from "./env";
import type { Bindings, Variables } from "./types";

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

const MAX_BODY_BYTES = 1024 * 1024; // 1 MB
let envValidated = false;

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

app.route("/", healthRoutes);

app.onError((err, c) => {
  logError("Unhandled error", err);
  return c.json({ error: "Internal Server Error" }, 500);
});

app.notFound((c) => c.json({ error: "Not Found" }, 404));

export default app;
