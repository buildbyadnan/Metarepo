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
