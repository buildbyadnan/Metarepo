import {
  CATEGORY_NAME_MAX,
  DOCUMENT_CATEGORIES,
  DOCUMENT_DESCRIPTION_MAX,
  DOCUMENT_TITLE_MAX,
  type DocumentCategory,
  type DocumentKind,
} from "../constants";

/**
 * Pure validation helpers for the documents feature.
 *
 * Everything here is deliberately free of Cloudflare/Hono imports so it can
 * be unit-tested in plain Node (vitest) without a Workers runtime.
 */

/** Magic-byte signatures. */
const PDF_MAGIC = [0x25, 0x50, 0x44, 0x46]; // %PDF
const ZIP_MAGIC = [0x50, 0x4b, 0x03, 0x04]; // PK\x03\x04

/**
 * The main document part of every genuine DOCX package. Zip entry names are
 * stored uncompressed in both local headers and the central directory, so
 * this ASCII path appears literally in the bytes of a real Word file.
 */
const WORD_DOCUMENT_XML = [
  0x77, 0x6f, 0x72, 0x64, 0x2f, 0x64, 0x6f, 0x63, 0x75, 0x6d, 0x65, 0x6e, 0x74, 0x2e, 0x78, 0x6d,
  0x6c,
]; // "word/document.xml"

/**
 * Windows scanned for the entry name in large archives: local file headers
 * at the head, the central directory (which lists every entry name) at the
 * tail. Files at or below the sum are scanned in full. Kept as byte scans —
 * no string allocation — because uploads run inside the 10 ms free-tier CPU
 * budget (see apps/server/AGENTS.md → Workers limits).
 */
const ZIP_HEAD_WINDOW = 1024 * 1024;
const ZIP_TAIL_WINDOW = 2 * 1024 * 1024;

/** PDF header must appear within the first 1024 bytes (ISO 32000-1 §7.5.2). */
const PDF_HEADER_WINDOW = 1024;

function startsWith(bytes: Uint8Array, magic: number[]): boolean {
  if (bytes.length < magic.length) return false;
  for (let i = 0; i < magic.length; i++) {
    if (bytes[i] !== magic[i]) return false;
  }
  return true;
}

/** True when `needle` occurs in bytes[from, to). */
function includesAscii(
  bytes: Uint8Array,
  needle: readonly number[],
  from: number,
  to: number,
): boolean {
  if (to - from < needle.length) return false;
  for (let i = from; i <= to - needle.length; i++) {
    let hit = true;
    for (let j = 0; j < needle.length; j++) {
      if (bytes[i + j] !== needle[j]) {
        hit = false;
        break;
      }
    }
    if (hit) return true;
  }
  return false;
}

/** True when the bytes contain `word/document.xml` within the safe windows. */
function looksLikeWordDocument(bytes: Uint8Array): boolean {
  if (bytes.length <= ZIP_HEAD_WINDOW + ZIP_TAIL_WINDOW) {
    return includesAscii(bytes, WORD_DOCUMENT_XML, 0, bytes.length);
  }
  return (
    includesAscii(bytes, WORD_DOCUMENT_XML, 0, ZIP_HEAD_WINDOW) ||
    includesAscii(bytes, WORD_DOCUMENT_XML, bytes.length - ZIP_TAIL_WINDOW, bytes.length)
  );
}

/**
 * Decides the document kind from the file's actual bytes:
 * - DOCX: a ZIP archive (PK\x03\x04 at byte 0) containing the required
 *         `word/document.xml` part — a random zip renamed .docx is rejected
 * - PDF: `%PDF` within the first 1024 bytes (per the spec; some producers
 *         prepend a little junk)
 *
 * Returns null for anything else — the filename is never consulted, so a
 * renamed executable (.exe → x.pdf) is rejected.
 */
export function sniffDocumentKind(bytes: Uint8Array): DocumentKind | null {
  // ZIP first: PK at byte 0 wins over any embedded "%PDF" pattern.
  if (startsWith(bytes, ZIP_MAGIC)) {
    return looksLikeWordDocument(bytes) ? "docx" : null;
  }

  const window = Math.min(bytes.length, PDF_HEADER_WINDOW);
  if (window >= PDF_MAGIC.length) {
    for (let i = 0; i <= window - PDF_MAGIC.length; i++) {
      if (
        bytes[i] === PDF_MAGIC[0] &&
        bytes[i + 1] === PDF_MAGIC[1] &&
        bytes[i + 2] === PDF_MAGIC[2] &&
        bytes[i + 3] === PDF_MAGIC[3]
      ) {
        return "pdf";
      }
    }
  }

  return null;
}

/**
 * Strips control characters and path separators from a client-supplied
 * filename, caps the length, and guarantees a non-empty result.
 */
export function sanitizeFileName(raw: string): string {
  const cleaned = (raw || "")
    // biome-ignore lint/suspicious/noControlCharactersInRegex: intentional control-char strip
    .replace(/[\x00-\x1f\x7f]/g, "")
    .replace(/[/\\]/g, "_")
    .trim()
    .slice(0, 200);
  return cleaned.length > 0 ? cleaned : "file";
}

/**
 * Validates/normalizes the user-supplied title. Falls back to the original
 * filename (minus extension) when the field is left blank.
 */
export function normalizeTitle(raw: unknown, originalName: string): string | null {
  const trimmed = typeof raw === "string" ? raw.trim() : "";
  const fallback = originalName.replace(/\.[^.]+$/, "").trim();
  const title = trimmed.length > 0 ? trimmed : fallback;
  if (title.length === 0 || title.length > DOCUMENT_TITLE_MAX) return null;
  return title;
}

/** Validates the optional description; empty → null. */
export function normalizeDescription(
  raw: unknown,
): { ok: true; value: string | null } | { ok: false } {
  if (raw === undefined || raw === null || raw === "") return { ok: true, value: null };
  if (typeof raw !== "string") return { ok: false };
  const trimmed = raw.trim();
  if (trimmed.length === 0) return { ok: true, value: null };
  if (trimmed.length > DOCUMENT_DESCRIPTION_MAX) return { ok: false };
  return { ok: true, value: trimmed };
}

/**
 * Validates the category against the builtins and (optionally) the user's
 * custom category names. Missing → "other"; unknown → null.
 *
 * Builtins always match lowercased; a custom name matches
 * case-insensitively but returns the canonical stored spelling, so
 * documents keep the creator's original casing.
 */
export function normalizeCategory(
  raw: unknown,
  customNames: readonly string[] = [],
): string | null {
  if (raw === undefined || raw === null || raw === "") return "other";
  if (typeof raw !== "string") return null;
  const lowered = raw.trim().toLowerCase();
  if ((DOCUMENT_CATEGORIES as readonly string[]).includes(lowered)) {
    return lowered as DocumentCategory;
  }
  const match = customNames.find((name) => name.trim().toLowerCase() === lowered);
  return match ?? null;
}

/**
 * Validates a user-created category name for POST/PATCH /categories:
 * control chars stripped, trimmed, 1–CATEGORY_NAME_MAX chars, and it may
 * not shadow a builtin key (those stay reserved for every account).
 */
export function normalizeCategoryName(
  raw: unknown,
): { ok: true; value: string } | { ok: false; reason: "invalid_name" | "builtin" } {
  if (typeof raw !== "string") return { ok: false, reason: "invalid_name" };
  const cleaned = raw
    // biome-ignore lint/suspicious/noControlCharactersInRegex: intentional control-char strip
    .replace(/[\x00-\x1f\x7f]/g, "")
    .trim();
  // Reject (don't silently truncate): the user should see why nothing stuck.
  if (cleaned.length === 0 || cleaned.length > CATEGORY_NAME_MAX) {
    return { ok: false, reason: "invalid_name" };
  }
  if ((DOCUMENT_CATEGORIES as readonly string[]).includes(cleaned.toLowerCase())) {
    return { ok: false, reason: "builtin" };
  }
  return { ok: true, value: cleaned };
}

/** Human-friendly byte formatting shared by the API usage payloads. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value >= 10 ? Math.round(value) : Math.round(value * 10) / 10} ${units[unit]}`;
}
