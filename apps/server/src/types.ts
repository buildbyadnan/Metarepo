import type { initDbConnect } from "./db";

export type Bindings = Env & {
  DB: D1Database;
  RATE_LIMIT_KV?: KVNamespace;
  ALLOWED_ORIGINS: string;
};
export type Variables = { db: ReturnType<typeof initDbConnect> };
