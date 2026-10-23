import { SERVER_URL } from "@/config/server";
import { API_ENDPOINTS } from "@repo/api-endpoints";

const MAX_RETRIES = 2;
const BASE_DELAY_MS = 300;

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    /** The server's human-readable `message` when present; `message` holds the error code. */
    readonly detail?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const method = options?.method?.toUpperCase() ?? "GET";
  const isBodyMethod = method === "POST" || method === "PUT" || method === "PATCH";
  const isFormData = options?.body instanceof FormData;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    try {
      const headers = new Headers(options?.headers);
      // Let the browser set the multipart boundary for FormData bodies.
      if (isBodyMethod && !isFormData && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
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
        throw new ApiError(
          message,
          res.status,
          typeof body?.message === "string" ? body.message : undefined,
        );
      }

      // 204 No Content (e.g. DELETE) has no body to parse.
      if (res.status === 204) return undefined as T;

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

export type UploadResult = { document: DocumentDto };

/**
 * Multipart upload — its own fetch (FormData body, longer timeout for big
 * files) with the same cookie/credentials and error semantics as apiFetch.
 * Deliberately a single attempt: a timed-out POST may have already been
 * stored server-side, so retrying would duplicate the file and burn quota.
 */
export async function apiUploadDocument(formData: FormData): Promise<UploadResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120_000);

  try {
    const res = await fetch(`${SERVER_URL}${API_ENDPOINTS.documents.root}`, {
      method: "POST",
      credentials: "include",
      body: formData,
      signal: controller.signal,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      const message = body?.error || body?.message || `API error: ${res.status}`;
      throw new ApiError(
        message,
        res.status,
        typeof body?.message === "string" ? body.message : undefined,
      );
    }

    return (await res.json()) as UploadResult;
  } finally {
    clearTimeout(timeout);
  }
}

// ---------------------------------------------------------------------------
// Document types shared by the documents page
// ---------------------------------------------------------------------------

export type DocumentDto = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  kind: string;
  originalName: string;
  size: number;
  createdAt: string;
};

export type DocumentsUsage = {
  usedBytes: number;
  quotaBytes: number;
  count: number;
  maxFiles: number;
  maxFileSizeBytes: number;
};

export type DocumentsListResponse = {
  documents: DocumentDto[];
  usage: DocumentsUsage;
};

/** Builds the authenticated content URL for a document (credentialed top-level navigation). */
export function documentContentUrl(id: string, download = false): string {
  return `${SERVER_URL}${API_ENDPOINTS.documents.content(id)}${download ? "?download=1" : ""}`;
}
