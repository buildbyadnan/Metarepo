export function parseAllowedOrigins(raw: string | undefined): string[] {
  if (!raw) return ["http://localhost:3000"];
  return raw
    .split(",")
    .map((o) => o.trim())
    .filter((o) => {
      try {
        const url = new URL(o);
        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    });
}

/**
 * True when the request carries an `Origin` header from a site that is not
 * in the allow-list. Requests without an Origin (same-origin navigations,
 * curl) are not rejected here — cross-site browser calls always send one.
 * Defense in depth on top of the SameSite=Lax session cookie.
 */
export function isForeignOrigin(origin: string | undefined, allowedOrigins: string[]): boolean {
  return Boolean(origin) && !allowedOrigins.includes(origin!);
}
