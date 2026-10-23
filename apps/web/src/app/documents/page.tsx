"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { AppNav } from "@/components/app-nav";
import {
  apiFetch,
  apiUploadDocument,
  fetchCategories,
  fetchSharedDocuments,
  documentContentUrl,
  type CategoryDto,
  type DocumentDto,
  type DocumentsListResponse,
  type DocumentsUsage,
  type SharedDocumentDto,
} from "@/lib/api";
import { API_ENDPOINTS } from "@repo/api-endpoints";
import {
  FIELD_CLASSES,
  formatBytes,
  formatDate,
  friendlyError,
  KindIcon,
} from "@/components/documents/shared";
import { CategoryPicker, categoryLabel } from "@/components/documents/category-picker";
import { ManageCategoriesDialog } from "@/components/documents/manage-categories-dialog";
import { ShareDialog } from "@/components/documents/share-dialog";
import { DocumentViewModal } from "@/components/documents/document-view-modal";

type Tab = "mine" | "shared";

export default function DocumentsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>("mine");

  // My documents
  const [docs, setDocs] = useState<DocumentDto[]>([]);
  const [usage, setUsage] = useState<DocumentsUsage | null>(null);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  // Shared with me
  const [sharedDocs, setSharedDocs] = useState<SharedDocumentDto[]>([]);
  const [sharedLoading, setSharedLoading] = useState(true);
  const [sharedError, setSharedError] = useState<string | null>(null);

  // Categories
  const [builtinCats, setBuiltinCats] = useState<string[]>([]);
  const [customCats, setCustomCats] = useState<CategoryDto[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [manageCatsOpen, setManageCatsOpen] = useState(false);

  // Upload form state
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("other");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Per-document interaction state
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  /** True while editing a document from the shared tab (no category rights). */
  const [editingShared, setEditingShared] = useState(false);
  const [editDraft, setEditDraft] = useState({ title: "", description: "", category: "other" });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Dialogs
  const [viewDoc, setViewDoc] = useState<DocumentDto | null>(null);
  const [shareDoc, setShareDoc] = useState<DocumentDto | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/");
  }, [user, loading, router]);

  const loadList = useCallback(async () => {
    try {
      const data = await apiFetch<DocumentsListResponse>(API_ENDPOINTS.documents.root);
      setDocs(data.documents);
      setUsage(data.usage);
      setListError(null);
    } catch (err) {
      setListError(friendlyError(err));
    } finally {
      setListLoading(false);
    }
  }, []);

  const loadShared = useCallback(async () => {
    try {
      const data = await fetchSharedDocuments();
      setSharedDocs(data.documents);
      setSharedError(null);
    } catch (err) {
      setSharedError(friendlyError(err));
    } finally {
      setSharedLoading(false);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const data = await fetchCategories();
      setBuiltinCats(data.builtin);
      setCustomCats(data.categories);
    } catch (err) {
      // Non-fatal: the builtin fallback below keeps the picker usable.
      console.error(friendlyError(err));
      if (builtinCats.length === 0) {
        setBuiltinCats(["report", "invoice", "id", "contract", "notes", "other"]);
      }
    }
  }, [builtinCats.length]);

  useEffect(() => {
    if (user) {
      loadList();
      loadShared();
      loadCategories();
    }
  }, [user, loadList, loadShared, loadCategories]);

  const maxFileSize = usage?.maxFileSizeBytes ?? 10 * 1024 * 1024;

  /** Rejects a pick and clears the input so re-selecting the same file re-fires `change`. */
  const rejectPick = (message: string) => {
    setFile(null);
    setUploadError(message);
    if (inputRef.current) inputRef.current.value = "";
  };

  const pickFile = (next: File | null) => {
    if (uploading) return; // a file picked mid-upload would be wiped by the reset
    setUploadError(null);
    if (!next) return; // dialog cancelled — keep the current selection
    const lower = next.name.toLowerCase();
    if (!lower.endsWith(".pdf") && !lower.endsWith(".docx")) {
      rejectPick("Only PDF and DOCX files are supported.");
      return;
    }
    if (next.size === 0) {
      rejectPick("That file is empty.");
      return;
    }
    if (next.size > maxFileSize) {
      rejectPick(`Files must be ${formatBytes(maxFileSize)} or smaller.`);
      return;
    }
    setFile(next);
    // Prefill the title from the filename while it is still blank.
    setTitle((current) =>
      current.trim().length > 0 ? current : next.name.replace(/\.[^.]+$/, "").slice(0, 120),
    );
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const dropped = e.dataTransfer.files?.[0] ?? null;
    pickFile(dropped);
  };

  const resetUploadForm = () => {
    setFile(null);
    setTitle("");
    setDescription("");
    setCategory("other");
    if (inputRef.current) inputRef.current.value = "";
  };

  const onUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || uploading) return;

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);

    try {
      await apiUploadDocument(formData);
      resetUploadForm();
      await loadList();
    } catch (err) {
      setUploadError(friendlyError(err));
    } finally {
      setUploading(false);
    }
  };

  const triggerDownload = (id: string) => {
    const a = document.createElement("a");
    a.href = documentContentUrl(id, true);
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const startEdit = (doc: DocumentDto, fromShared: boolean) => {
    setEditingId(doc.id);
    setEditingShared(fromShared);
    setEditDraft({
      title: doc.title,
      description: doc.description ?? "",
      category: doc.category,
    });
    setEditError(null);
  };

  const saveEdit = async (id: string) => {
    setEditSaving(true);
    setEditError(null);
    try {
      const body: Record<string, string> = {
        title: editDraft.title,
        description: editDraft.description,
      };
      // Category is owner-only — write recipients never send it (403 guard).
      if (!editingShared) body.category = editDraft.category;

      const res = await apiFetch<{ document: DocumentDto }>(API_ENDPOINTS.documents.detail(id), {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      if (editingShared) {
        setSharedDocs((current) =>
          current.map((d) => (d.id === id ? { ...d, ...res.document } : d)),
        );
      } else {
        setDocs((current) => current.map((d) => (d.id === id ? res.document : d)));
      }
      setEditingId(null);
    } catch (err) {
      setEditError(friendlyError(err));
    } finally {
      setEditSaving(false);
    }
  };

  const deleteDoc = async (id: string) => {
    setDeletingId(id);
    setDeleteError(null);
    try {
      await apiFetch(API_ENDPOINTS.documents.detail(id), { method: "DELETE" });
      setConfirmDeleteId(null);
      setDocs((current) => current.filter((d) => d.id !== id));
      await loadList(); // refresh the usage meter
    } catch (err) {
      setDeleteError(friendlyError(err)); // shown in the confirm row below
    } finally {
      setDeletingId(null);
    }
  };

  const percent =
    usage && usage.quotaBytes > 0
      ? Math.min(100, Math.round((usage.usedBytes / usage.quotaBytes) * 100))
      : 0;

  /**
   * Filter chips = builtins ∪ my custom categories ∪ labels present on my
   * documents (so a deleted category's documents stay filterable).
   */
  const filterValues = (() => {
    const seen = new Set<string>();
    for (const value of [
      ...builtinCats,
      ...customCats.map((c) => c.name),
      ...docs.map((d) => d.category),
    ]) {
      if (value) seen.add(value);
    }
    return [...seen];
  })();

  const filteredDocs =
    categoryFilter === null ? docs : docs.filter((d) => d.category === categoryFilter);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#07090a] flex flex-col items-center justify-center p-6 text-white">
        <div className="w-full max-w-5xl space-y-8 animate-pulse">
          <div className="h-12 bg-slate-800 rounded-lg w-1/4"></div>
          <div className="h-40 bg-slate-800 rounded-2xl"></div>
          <div className="h-64 bg-slate-800 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#07090a] text-slate-100 selection:bg-emerald-500 selection:text-white">
      {/* Glow effects — mirrors the dashboard */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-700/10 rounded-full blur-[128px] pointer-events-none" />

      <AppNav />

      <main className="max-w-5xl mx-auto px-6 py-12 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <span className="text-[0.7rem] uppercase tracking-[0.2em] text-emerald-400 font-mono">
            Personal cloud
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mt-2">
            Your documents
          </h1>
          <p className="text-slate-400 mt-2 max-w-2xl">
            PDFs and Word documents, private to your account. Open both right in the browser, and
            share with people by email.
          </p>
        </div>

        {/* Tabs */}
        <div
          className="flex items-center gap-1 mb-6 p-1 rounded-xl border border-slate-900 bg-slate-900/40 w-fit"
          role="tablist"
          aria-label="Document views"
        >
          {[
            { id: "mine" as Tab, label: "My documents" },
            { id: "shared" as Tab, label: "Shared with me" },
          ].map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                tab === t.id
                  ? "bg-emerald-500 text-[#04130a] shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {t.label}
              {t.id === "shared" && !sharedLoading && sharedDocs.length > 0 ? (
                <span
                  className={`ml-2 text-[0.65rem] px-1.5 py-0.5 rounded-full font-bold ${
                    tab === t.id ? "bg-black/20" : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {sharedDocs.length}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {tab === "mine" ? (
          <>
            {/* Storage meter */}
            <div className="rounded-2xl border border-slate-900 bg-slate-900/40 p-6 backdrop-blur-sm mb-8">
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="font-semibold text-slate-200">
                  {usage
                    ? `${formatBytes(usage.usedBytes)} of ${formatBytes(usage.quotaBytes)} used`
                    : "Loading storage…"}
                </span>
                <span className="text-xs text-slate-400">
                  {usage
                    ? `${usage.count} of ${usage.maxFiles} documents · max ${formatBytes(usage.maxFileSizeBytes)} per file`
                    : ""}
                </span>
              </div>
              <div
                className="h-2 w-full rounded-full bg-slate-950 border border-slate-900 overflow-hidden"
                role="progressbar"
                aria-label="Storage used"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percent}
                aria-valuetext={
                  usage
                    ? `${formatBytes(usage.usedBytes)} of ${formatBytes(usage.quotaBytes)}`
                    : undefined
                }
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-500"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>

            {/* Upload panel */}
            <form
              onSubmit={onUpload}
              className="rounded-2xl border border-slate-900 bg-slate-900/40 p-6 backdrop-blur-sm mb-8"
            >
              <h3 className="text-lg font-bold text-white mb-4">Upload a document</h3>

              {/* sr-only + peer keeps the file input keyboard-focusable (Enter/Space
                  opens the picker); the dropzone shows the focus ring. */}
              <input
                ref={inputRef}
                id="doc-upload"
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="sr-only peer"
                disabled={uploading}
                aria-label="Choose a PDF or DOCX file to upload"
                onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
              />
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={onDrop}
                onClick={() => {
                  if (!uploading) inputRef.current?.click();
                }}
                className={`relative rounded-xl border-2 border-dashed p-8 text-center peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-400/70 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[#07090a] transition-colors ${
                  uploading
                    ? "border-slate-800 bg-slate-950/20 opacity-60"
                    : dragActive
                      ? "border-emerald-400 bg-emerald-500/5 cursor-pointer"
                      : "border-slate-800 hover:border-slate-700 bg-slate-950/40 cursor-pointer"
                }`}
              >
                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    <KindIcon kind={file.name.toLowerCase().endsWith(".docx") ? "docx" : "pdf"} />
                    <div className="text-left">
                      <p className="text-sm font-semibold text-slate-200 truncate max-w-xs">
                        {file.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatBytes(file.size)} — click to change
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-200">
                      Drag a PDF or DOCX here, or click to browse
                    </p>
                    <p className="text-xs text-slate-500">
                      Up to {formatBytes(maxFileSize)} per file · private to you
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="doc-title"
                    className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5"
                  >
                    Title
                  </label>
                  <input
                    id="doc-title"
                    className={FIELD_CLASSES}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Q4 Financial Report"
                    maxLength={120}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label
                    htmlFor="doc-description"
                    className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5"
                  >
                    Description <span className="normal-case font-normal">(optional)</span>
                  </label>
                  <input
                    id="doc-description"
                    className={FIELD_CLASSES}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What is this document about?"
                    maxLength={1000}
                  />
                </div>
                <div>
                  <label
                    htmlFor="doc-category"
                    className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5"
                  >
                    Category
                  </label>
                  <CategoryPicker
                    id="doc-category"
                    builtin={builtinCats}
                    custom={customCats}
                    value={category}
                    onChange={setCategory}
                    onCreated={(c) => setCustomCats((cur) => [...cur, c])}
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={!file || uploading}
                    className="w-full px-6 py-2.5 rounded-xl text-sm font-bold bg-emerald-500 text-[#04130a] hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <span className="h-4 w-4 border-2 border-[#04130a]/30 border-t-[#04130a] rounded-full animate-spin" />
                        Uploading…
                      </>
                    ) : (
                      "Upload"
                    )}
                  </button>
                </div>
              </div>

              {uploadError ? (
                <p className="text-xs text-[#ff6b85] mt-4" role="alert">
                  {uploadError}
                </p>
              ) : null}
            </form>

            {/* List header + category filter */}
            <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
              <h2 className="text-lg font-bold text-white">All documents</h2>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setManageCatsOpen(true)}
                  className="text-xs font-medium text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  Manage categories
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setListLoading(true);
                    loadList();
                  }}
                  className="text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Refresh
                </button>
              </div>
            </div>

            {docs.length > 0 ? (
              <div className="flex items-center gap-2 flex-wrap mb-4">
                <button
                  type="button"
                  onClick={() => setCategoryFilter(null)}
                  aria-pressed={categoryFilter === null}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                    categoryFilter === null
                      ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  All
                </button>
                {filterValues.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setCategoryFilter((cur) => (cur === value ? null : value))}
                    aria-pressed={categoryFilter === value}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                      categoryFilter === value
                        ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {categoryLabel(value, builtinCats)}
                  </button>
                ))}
              </div>
            ) : null}

            {listError ? (
              <div
                className="rounded-2xl border border-[#ff6b85]/20 bg-[#ff6b85]/5 p-6 text-sm text-[#ff6b85]"
                role="alert"
              >
                {listError}
              </div>
            ) : null}

            {listLoading && docs.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[0, 1].map((i) => (
                  <div key={i} className="h-32 rounded-2xl bg-slate-900/40 animate-pulse" />
                ))}
              </div>
            ) : filteredDocs.length === 0 && !listError ? (
              <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/20 p-12 text-center">
                <p className="text-slate-300 font-semibold">
                  {categoryFilter !== null && docs.length > 0
                    ? `No documents in “${categoryLabel(categoryFilter, builtinCats)}”`
                    : "No documents yet"}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  {categoryFilter !== null && docs.length > 0
                    ? "Pick another category or clear the filter."
                    : "Drop a PDF or DOCX above — it stays private to your account."}
                </p>
              </div>
            ) : filteredDocs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="rounded-2xl border border-slate-900 bg-slate-900/40 p-5 backdrop-blur-sm"
                  >
                    {editingId === doc.id && !editingShared ? (
                      /* ── Edit mode (owner) ─────────────────────── */
                      <div className="space-y-3">
                        <input
                          className={FIELD_CLASSES}
                          value={editDraft.title}
                          onChange={(e) => setEditDraft((d) => ({ ...d, title: e.target.value }))}
                          maxLength={120}
                          aria-label="Title"
                        />
                        <input
                          className={FIELD_CLASSES}
                          value={editDraft.description}
                          onChange={(e) =>
                            setEditDraft((d) => ({ ...d, description: e.target.value }))
                          }
                          placeholder="Description (optional)"
                          maxLength={1000}
                          aria-label="Description"
                        />
                        <CategoryPicker
                          builtin={builtinCats}
                          custom={customCats}
                          value={editDraft.category}
                          onChange={(value) => setEditDraft((d) => ({ ...d, category: value }))}
                          onCreated={(c) => setCustomCats((cur) => [...cur, c])}
                          aria-label="Category"
                        />
                        {editError ? (
                          <p className="text-xs text-[#ff6b85]" role="alert">
                            {editError}
                          </p>
                        ) : null}
                        <div className="flex gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => saveEdit(doc.id)}
                            disabled={editSaving}
                            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-[#04130a] hover:bg-emerald-400 disabled:opacity-60 transition-all cursor-pointer"
                          >
                            {editSaving ? "Saving…" : "Save"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            disabled={editSaving}
                            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 transition-all cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* ── View mode ─────────────────────────────── */
                      <>
                        <div className="flex items-start gap-4">
                          <KindIcon kind={doc.kind} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-sm font-bold text-white truncate">{doc.title}</h3>
                              <span className="text-[0.65rem] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                                {categoryLabel(doc.category, builtinCats)}
                              </span>
                            </div>
                            {doc.description ? (
                              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                                {doc.description}
                              </p>
                            ) : null}
                            <p className="text-xs text-slate-500 mt-1.5">
                              {formatBytes(doc.size)} · uploaded {formatDate(doc.createdAt)}
                            </p>
                          </div>
                        </div>

                        {confirmDeleteId === doc.id ? (
                          <div className="mt-4 flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-slate-400">Delete permanently?</span>
                            <button
                              type="button"
                              onClick={() => deleteDoc(doc.id)}
                              disabled={deletingId === doc.id}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#ff6b85]/15 text-[#ff6b85] border border-[#ff6b85]/30 hover:bg-[#ff6b85]/25 disabled:opacity-60 transition-all cursor-pointer"
                            >
                              {deletingId === doc.id ? "Deleting…" : "Yes, delete"}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setConfirmDeleteId(null);
                                setDeleteError(null);
                              }}
                              disabled={deletingId === doc.id}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 transition-all cursor-pointer"
                            >
                              Cancel
                            </button>
                            {deleteError ? (
                              <p className="w-full text-xs text-[#ff6b85] mt-1" role="alert">
                                {deleteError}
                              </p>
                            ) : null}
                          </div>
                        ) : (
                          <div className="mt-4 flex items-center gap-2 flex-wrap">
                            <button
                              type="button"
                              onClick={() => setViewDoc(doc)}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all cursor-pointer"
                            >
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() => triggerDownload(doc.id)}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 transition-all cursor-pointer"
                            >
                              Download
                            </button>
                            <button
                              type="button"
                              onClick={() => startEdit(doc, false)}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 transition-all cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setShareDoc(doc)}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-emerald-400 transition-all cursor-pointer"
                            >
                              Share
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setConfirmDeleteId(doc.id);
                                setDeleteError(null);
                              }}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 border border-slate-800 text-slate-400 hover:text-[#ff6b85] hover:border-[#ff6b85]/30 transition-all cursor-pointer ml-auto"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : null}
          </>
        ) : (
          /* ─────────────────── Shared with me ─────────────────── */
          <>
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              <div>
                <h2 className="text-lg font-bold text-white">Shared with you</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  These documents live in the owner&apos;s account — they don&apos;t count against
                  your storage.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSharedLoading(true);
                  loadShared();
                }}
                className="text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Refresh
              </button>
            </div>

            {sharedError ? (
              <div
                className="rounded-2xl border border-[#ff6b85]/20 bg-[#ff6b85]/5 p-6 text-sm text-[#ff6b85]"
                role="alert"
              >
                {sharedError}
              </div>
            ) : null}

            {sharedLoading && sharedDocs.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[0, 1].map((i) => (
                  <div key={i} className="h-32 rounded-2xl bg-slate-900/40 animate-pulse" />
                ))}
              </div>
            ) : sharedDocs.length === 0 && !sharedError ? (
              <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/20 p-12 text-center">
                <p className="text-slate-300 font-semibold">Nothing shared with you yet</p>
                <p className="text-sm text-slate-500 mt-1">
                  When someone shares a document with your email, it appears here.
                </p>
              </div>
            ) : sharedDocs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sharedDocs.map((doc) => {
                  const canWrite = doc.permission === "write";
                  return (
                    <div
                      key={doc.id}
                      className="rounded-2xl border border-slate-900 bg-slate-900/40 p-5 backdrop-blur-sm"
                    >
                      {editingId === doc.id && editingShared ? (
                        /* ── Edit mode (write share: no category) ─── */
                        <div className="space-y-3">
                          <input
                            className={FIELD_CLASSES}
                            value={editDraft.title}
                            onChange={(e) => setEditDraft((d) => ({ ...d, title: e.target.value }))}
                            maxLength={120}
                            aria-label="Title"
                          />
                          <input
                            className={FIELD_CLASSES}
                            value={editDraft.description}
                            onChange={(e) =>
                              setEditDraft((d) => ({ ...d, description: e.target.value }))
                            }
                            placeholder="Description (optional)"
                            maxLength={1000}
                            aria-label="Description"
                          />
                          <p className="text-xs text-slate-500">
                            Category: {doc.category} — only the owner can change it.
                          </p>
                          {editError ? (
                            <p className="text-xs text-[#ff6b85]" role="alert">
                              {editError}
                            </p>
                          ) : null}
                          <div className="flex gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => saveEdit(doc.id)}
                              disabled={editSaving}
                              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-[#04130a] hover:bg-emerald-400 disabled:opacity-60 transition-all cursor-pointer"
                            >
                              {editSaving ? "Saving…" : "Save"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              disabled={editSaving}
                              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 transition-all cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start gap-4">
                            <KindIcon kind={doc.kind} />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-sm font-bold text-white truncate">
                                  {doc.title}
                                </h3>
                                <span
                                  className={`text-[0.65rem] uppercase tracking-wider px-2 py-0.5 rounded-full border font-semibold ${
                                    canWrite
                                      ? "bg-sky-500/10 text-sky-400 border-sky-500/20"
                                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                  }`}
                                >
                                  {canWrite ? "Read and write" : "Read only"}
                                </span>
                                <span className="text-[0.65rem] uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800/60 text-slate-300 border border-slate-700 font-semibold">
                                  {categoryLabel(doc.category, builtinCats)}
                                </span>
                              </div>
                              {doc.description ? (
                                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                                  {doc.description}
                                </p>
                              ) : null}
                              <div className="flex items-center gap-2 mt-2">
                                {doc.sharedBy.picture ? (
                                  <img
                                    src={doc.sharedBy.picture}
                                    alt=""
                                    className="h-6 w-6 rounded-full border border-slate-700"
                                  />
                                ) : (
                                  <span className="h-6 w-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[0.6rem] font-bold text-slate-300">
                                    {(doc.sharedBy.name || "?").charAt(0).toUpperCase()}
                                  </span>
                                )}
                                <span className="text-xs text-slate-500">
                                  Shared by{" "}
                                  <span className="text-slate-300 font-medium">
                                    {doc.sharedBy.name}
                                  </span>{" "}
                                  · {formatDate(doc.sharedAt)}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 mt-1">{formatBytes(doc.size)}</p>
                            </div>
                          </div>

                          <div className="mt-4 flex items-center gap-2 flex-wrap">
                            <button
                              type="button"
                              onClick={() => setViewDoc(doc)}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all cursor-pointer"
                            >
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() => triggerDownload(doc.id)}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 transition-all cursor-pointer"
                            >
                              Download
                            </button>
                            {canWrite ? (
                              <button
                                type="button"
                                onClick={() => startEdit(doc, true)}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 transition-all cursor-pointer"
                              >
                                Edit
                              </button>
                            ) : null}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : null}
          </>
        )}
      </main>

      {/* Dialogs */}
      {viewDoc ? <DocumentViewModal doc={viewDoc} onClose={() => setViewDoc(null)} /> : null}
      {shareDoc ? (
        <ShareDialog doc={shareDoc} onClose={() => setShareDoc(null)} onChanged={loadShared} />
      ) : null}
      {manageCatsOpen ? (
        <ManageCategoriesDialog
          builtin={builtinCats}
          categories={customCats}
          onChanged={setCustomCats}
          onDocumentsChanged={loadList}
          onClose={() => setManageCatsOpen(false)}
        />
      ) : null}
    </div>
  );
}
