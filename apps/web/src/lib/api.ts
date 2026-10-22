const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL!;
const MAX_RETRIES = 2;
const BASE_DELAY_MS = 300;

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const method = options?.method?.toUpperCase() ?? "GET";
  const isBodyMethod = method === "POST" || method === "PUT" || method === "PATCH";

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    try {
      const headers: Record<string, string> = {};
      if (isBodyMethod) {
        headers["Content-Type"] = "application/json";
      }
      if (options?.headers) {
        const h = options.headers as Record<string, string>;
        for (const [k, v] of Object.entries(h)) {
          headers[k] = v;
        }
      }

      const res = await fetch(`${SERVER_URL}${path}`, {
        ...options,
        credentials: "include",
        headers,
        signal: controller.signal,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const message = body?.error || body?.message || `API error: ${res.status}`;
        throw new Error(message);
      }

      return res.json() as Promise<T>;
    } catch (err: unknown) {
      const isAbort = err instanceof DOMException && err.name === "AbortError";
      const isNetworkError = err instanceof TypeError && err.message === "Failed to fetch";
      const canRetry = (isAbort || isNetworkError) && attempt < MAX_RETRIES;

      if (!canRetry) throw err;

      await new Promise((r) => setTimeout(r, BASE_DELAY_MS * 2 ** attempt));
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new Error("Unreachable");
}
