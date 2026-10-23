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

// ---------------------------------------------------------------------------
// Sharing
// ---------------------------------------------------------------------------

export type SharePermission = "read" | "write";

export type ShareDto = {
  id: string;
  documentId: string;
  email: string;
  permission: SharePermission;
  createdAt: string;
  /** Display info — null while the recipient has never signed in. */
  recipientName?: string | null;
  recipientPicture?: string | null;
};

export type SharesListResponse = {
  shares: ShareDto[];
};

/** A document someone shared with the current user. */
export type SharedDocumentDto = DocumentDto & {
  permission: SharePermission;
  sharedAt: string;
  sharedBy: { name: string; email: string; picture: string | null };
};

export type SharedListResponse = {
  documents: SharedDocumentDto[];
};

export async function fetchShares(id: string): Promise<SharesListResponse> {
  return apiFetch<SharesListResponse>(API_ENDPOINTS.documents.shares(id));
}

export async function createShare(
  id: string,
  email: string,
  permission: SharePermission,
): Promise<{ share: ShareDto }> {
  return apiFetch<{ share: ShareDto }>(API_ENDPOINTS.documents.shares(id), {
    method: "POST",
    body: JSON.stringify({ email, permission }),
  });
}

export async function revokeShare(id: string, shareId: string): Promise<void> {
  await apiFetch<void>(API_ENDPOINTS.documents.share(id, shareId), { method: "DELETE" });
}

export async function fetchSharedDocuments(): Promise<SharedListResponse> {
  return apiFetch<SharedListResponse>(API_ENDPOINTS.documents.shared);
}

// ---------------------------------------------------------------------------
// Categories (user-defined)
// ---------------------------------------------------------------------------

export type CategoryDto = {
  id: string;
  name: string;
  createdAt: string;
};

export type CategoriesResponse = {
  builtin: string[];
  categories: CategoryDto[];
};

export async function fetchCategories(): Promise<CategoriesResponse> {
  return apiFetch<CategoriesResponse>(API_ENDPOINTS.categories.root);
}

export async function createCategory(name: string): Promise<{ category: CategoryDto }> {
  return apiFetch<{ category: CategoryDto }>(API_ENDPOINTS.categories.root, {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function renameCategory(id: string, name: string): Promise<{ category: CategoryDto }> {
  return apiFetch<{ category: CategoryDto }>(API_ENDPOINTS.categories.detail(id), {
    method: "PATCH",
    body: JSON.stringify({ name }),
  });
}

export async function deleteCategory(id: string): Promise<void> {
  await apiFetch<void>(API_ENDPOINTS.categories.detail(id), { method: "DELETE" });
}

/** Builds the authenticated content URL for a document (credentialed top-level navigation). */
export function documentContentUrl(id: string, download = false): string {
  return `${SERVER_URL}${API_ENDPOINTS.documents.content(id)}${download ? "?download=1" : ""}`;
}

/**
 * Fetches a document's raw bytes with the session cookie — used by the
 * client-side DOCX preview (docx-preview renders an ArrayBuffer in the DOM,
 * so no public/presigned URL is ever needed).
 */
export async function fetchDocumentBytes(id: string): Promise<ArrayBuffer> {
  const res = await fetch(documentContentUrl(id), { credentials: "include" });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(
      body?.error || `API error: ${res.status}`,
      res.status,
      typeof body?.message === "string" ? body.message : undefined,
    );
  }
  return res.arrayBuffer();
}
