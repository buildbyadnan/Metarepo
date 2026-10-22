import { logError } from "./lib/logger";

/**
 * Required environment variables that must be present at startup.
 * DB and RATE_LIMIT_KV are Cloudflare bindings (set in wrangler.jsonc), not env vars.
 */
const REQUIRED_ENV_VARS = ["ALLOWED_ORIGINS"] as const;

export interface EnvValidationResult {
  ok: boolean;
  missing: string[];
  warnings: string[];
}

export function validateEnv(env: Record<string, unknown>): EnvValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const key of REQUIRED_ENV_VARS) {
    const value = env[key];
    if (typeof value !== "string" || value.length === 0) {
      missing.push(key);
    }
  }

  const allowedOrigins = env["ALLOWED_ORIGINS"];
  if (typeof allowedOrigins === "string" && allowedOrigins.length > 0) {
    const origins = allowedOrigins.split(",").map((o) => o.trim());
    for (const origin of origins) {
      try {
        const url = new URL(origin);
        if (url.protocol !== "http:" && url.protocol !== "https:") {
          warnings.push(`ALLOWED_ORIGINS contains non-HTTP origin: ${origin}`);
        }
      } catch {
        warnings.push(`ALLOWED_ORIGINS contains invalid URL: ${origin}`);
      }
    }
  }

  const ok = missing.length === 0;

  if (!ok) {
    logError("Environment validation failed", undefined, {
      missing,
    });
  }

  for (const warning of warnings) {
    logError(warning);
  }

  return { ok, missing, warnings };
}
