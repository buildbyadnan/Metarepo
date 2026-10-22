/**
 * API server origin — used by apiFetch, the OAuth login redirect, and
 * (mirrored) the CSP connect-src in next.config.ts.
 *
 * NEXT_PUBLIC_* variables are inlined into the bundle at build time. CI
 * builds the web app without a .env.local, so every consumer falls back
 * to sane defaults here instead of `undefined` (which previously produced
 * https://metarepo.adnanbuilds.online/undefined/auth/google in prod):
 *   - production builds  -> the real API domain
 *   - development builds -> the local wrangler dev port
 * Setting NEXT_PUBLIC_SERVER_URL always overrides the default.
 */
const PRODUCTION_SERVER_URL = "https://metarepo-api.adnanbuilds.online";
const DEVELOPMENT_SERVER_URL = "http://localhost:8787";

export const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  (process.env.NODE_ENV === "production" ? PRODUCTION_SERVER_URL : DEVELOPMENT_SERVER_URL);
