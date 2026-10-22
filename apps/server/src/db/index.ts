import { drizzle } from "drizzle-orm/d1";
import { sql } from "drizzle-orm";
import * as schema from "./schema";

// D1 connections are ephemeral — PRAGMA must be set per-request.
// This is the only correct pattern for D1 foreign key enforcement.
export const initDbConnect = (env: D1Database) => {
  const db = drizzle(env, { schema });
  db.run(sql`PRAGMA foreign_keys = ON`);
  return db;
};
