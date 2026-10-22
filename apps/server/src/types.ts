import type { initDbConnect } from "./db";

export type Bindings = Env & {
  DB: D1Database;
  RATE_LIMIT_KV?: KVNamespace;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  SESSION_SECRET: string;
  WEB_APP_URL: string;
  ALLOWED_ORIGINS: string;
};
export type Variables = { db: ReturnType<typeof initDbConnect> };
