import { SHARE_PERMISSIONS, type SharePermission } from "../constants";
import { isValidEmail } from "./validate";

/**
 * Pure validation helpers for document shares — no Cloudflare/Hono imports
 * so they can be unit-tested in plain Node (vitest).
 */

/**
 * Validates and canonicalizes a share recipient email: trimmed + lowercased
 * (users.email is stored lowercased at signup, so matching stays exact).
 * Returns null for anything that is not a plausible email address.
 */
export function normalizeRecipientEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim().toLowerCase();
  if (trimmed.length === 0) return null;
  return isValidEmail(trimmed) ? trimmed : null;
}

/** Validates the share permission: "read" | "write" (case-insensitive). */
export function normalizePermission(raw: unknown): SharePermission | null {
  if (typeof raw !== "string") return null;
  const lowered = raw.trim().toLowerCase();
  return (SHARE_PERMISSIONS as readonly string[]).includes(lowered)
    ? (lowered as SharePermission)
    : null;
}
