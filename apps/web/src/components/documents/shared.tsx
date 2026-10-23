import { ApiError } from "@/lib/api";

/** Field styling shared by the documents page and its dialogs. */
export const FIELD_CLASSES =
  "w-full rounded-xl bg-slate-950/60 border border-slate-800 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition-colors";

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

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Recently";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

/** Maps server error codes to plain-language copy. */
export function friendlyError(err: unknown): string {
  if (err instanceof ApiError) {
    switch (err.message) {
      case "file_too_large":
        return "That file is over the 10 MB limit.";
      case "unsupported_type":
        return "Only PDF and DOCX files are supported — the file content is checked, not just its name.";
      case "quota_exceeded":
        return err.detail || "Storage limit reached — delete a document to free space.";
      case "invalid_title":
        return "Title must be 1–120 characters.";
      case "invalid_description":
        return "Description must be 1000 characters or fewer.";
      case "invalid_category":
        return err.detail || "Unknown category.";
      case "missing_file":
      case "empty_file":
        return "Pick a non-empty file to upload.";
      case "invalid_email":
        return "Enter a valid email address.";
      case "invalid_permission":
        return "Choose read only or read and write.";
      case "cannot_share_to_self":
        return "You can't share a document with yourself.";
      case "already_shared":
        return "This document is already shared with that email — revoke it first to change permission.";
      case "share_limit":
      case "category_limit":
        return err.detail || "Limit reached — remove some entries first.";
      case "forbidden":
        return err.detail || "Only the owner can do that.";
      case "builtin_category":
        return err.detail || "That name is a built-in category — pick your own.";
      case "already_exists":
        return err.detail || "You already have a category with that name.";
      case "invalid_name":
        return err.detail || "Category names must be 1–40 characters.";
      case "Unauthorized":
        return "Your session expired — please sign in again.";
      case "Not found":
        return "That item no longer exists.";
      case "Too many requests":
        return "Too many requests in a short time — wait a minute and try again.";
      default:
        break;
    }
  }
  if (err instanceof ApiError && err.status >= 500) return "The server had a problem — try again.";
  const message = err instanceof Error ? err.message : "";
  if (message.includes("Failed to fetch") || message.includes("abort")) {
    return "Couldn't reach the server — check your connection and try again.";
  }
  return message || "Something went wrong — try again.";
}

export function KindIcon({ kind }: { kind: string }) {
  const isPdf = kind === "pdf";
  return (
    <div
      aria-hidden="true"
      className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center border ${
        isPdf
          ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
          : "bg-sky-500/10 border-sky-500/20 text-sky-400"
      }`}
    >
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
      </svg>
    </div>
  );
}
