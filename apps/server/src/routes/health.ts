import { Hono } from "hono";
import { sql } from "drizzle-orm";
import type { Bindings, Variables } from "../types";

export const healthRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>();

healthRoutes.get("/health", async (c) => {
  const hasDb = !!c.env.DB;
  if (!hasDb) {
    return c.json({ status: "degraded", db: "missing" }, 503);
  }

  try {
    const db = c.var.db;
    const start = Date.now();
    // Round-trip probe: `select 1` is valid SQLite (a `from 1`-style probe
    // is a syntax error and would always report unreachable).
    await db.all(sql`select 1`);
    const latency = Date.now() - start;
    return c.json({
      status: "ok",
      db: "connected",
      latency,
    });
  } catch {
    return c.json({ status: "degraded", db: "unreachable" }, 503);
  }
});
