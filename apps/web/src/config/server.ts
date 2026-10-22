/**
 * API server origin — used by apiFetch, the OAuth login redirect, and
 * (mirrored) the CSP connect-src in next.config.ts.
 *
 * NEXT_PUBLIC_* variables are inlined into the bundle at build time. CI
 * builds the web app without a .env.local, so the fallback is always the
 * production API domain — builds never fall back to `undefined` (which
 * previously produced https://metarepo.adnanbuilds.online/undefined/auth/google
 * in prod). Local dev overrides it via apps/web/.env.local.
 */
const PRODUCTION_SERVER_URL = "https://metarepo-api.adnanbuilds.online";

export const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || PRODUCTION_SERVER_URL;
