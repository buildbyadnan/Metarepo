"use client";

import { useState } from "react";
import { createCategory, deleteCategory, renameCategory, type CategoryDto } from "@/lib/api";
import { FIELD_CLASSES, friendlyError } from "./shared";

type Props = {
  builtin: readonly string[];
  categories: CategoryDto[];
  /** Sync the refreshed list (and documents, after rename cascade) upward. */
  onChanged: (categories: CategoryDto[]) => void;
  /** Rename cascades onto documents — the caller should reload the list. */
  onDocumentsChanged?: () => void;
  onClose: () => void;
};

/**
 * "Manage categories" panel: create, rename (cascades to that user's
 * documents), and delete (picker entry only — documents keep their stored
 * label, so deletion never rewrites or blocks anything).
 */
export function ManageCategoriesDialog({
  builtin,
  categories,
  onChanged,
  onDocumentsChanged,
  onClose,
}: Props) {
  const [draft, setDraft] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const create = async () => {
    const name = draft.trim();
    if (!name || creating) return;
    setCreating(true);
    setError(null);
    setNotice(null);
    try {
      const { category } = await createCategory(name);
      onChanged([...categories, category]);
      setDraft("");
      setNotice(`Created “${category.name}”.`);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setCreating(false);
    }
  };

  const rename = async (id: string) => {
    const name = editName.trim();
    if (!name || savingId) return;
    setSavingId(id);
    setError(null);
    setNotice(null);
    try {
      const { category } = await renameCategory(id, name);
      onChanged(categories.map((c) => (c.id === id ? category : c)));
      setEditingId(null);
      setNotice(`Renamed to “${category.name}” — documents using it were updated.`);
      onDocumentsChanged?.();
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setSavingId(null);
    }
  };

  const remove = async (category: CategoryDto) => {
    setSavingId(category.id);
    setError(null);
    setNotice(null);
    try {
      await deleteCategory(category.id);
      onChanged(categories.filter((c) => c.id !== category.id));
      setNotice(
        `Removed “${category.name}” from your list — documents that used it keep the label.`,
      );
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Manage categories"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-900 bg-slate-900/60">
          <div>
            <h2 className="text-base font-bold text-white">Manage categories</h2>
            <p className="text-xs text-slate-500 mt-0.5">Your own labels — separate per account</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close manage categories"
            className="h-8 w-8 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer flex items-center justify-center"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Create */}
          <div>
            <label
              htmlFor="new-category"
              className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5"
            >
              New category
            </label>
            <div className="flex gap-2">
              <input
                id="new-category"
                className={FIELD_CLASSES}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="e.g. Taxes 2026"
                maxLength={40}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    create();
                  }
                }}
              />
              <button
                type="button"
                onClick={create}
                disabled={creating || draft.trim().length === 0}
                className="shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 text-[#04130a] hover:bg-emerald-400 disabled:opacity-50 transition-all cursor-pointer"
              >
                {creating ? "Adding…" : "Add"}
              </button>
            </div>
          </div>

          {error ? (
            <p className="text-xs text-[#ff6b85]" role="alert">
              {error}
            </p>
          ) : null}
          {notice ? (
            <p className="text-xs text-emerald-400" role="status">
              {notice}
            </p>
          ) : null}

          {/* List */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Your categories ({categories.length}/50)
            </h3>
            {categories.length === 0 ? (
              <p className="text-sm text-slate-500">
                None yet — the suggested ones ({" "}
                {builtin.map((b) => b.charAt(0).toUpperCase() + b.slice(1)).join(", ")} ) are always
                available.
              </p>
            ) : (
              <ul className="space-y-2">
                {categories.map((category) => (
                  <li
                    key={category.id}
                    className="rounded-xl border border-slate-900 bg-slate-900/40 px-4 py-3"
                  >
                    {editingId === category.id ? (
                      <div className="flex gap-2">
                        <input
                          className={FIELD_CLASSES}
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          maxLength={40}
                          autoFocus
                          aria-label={`Rename ${category.name}`}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              rename(category.id);
                            } else if (e.key === "Escape") {
                              setEditingId(null);
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => rename(category.id)}
                          disabled={savingId === category.id || editName.trim().length === 0}
                          className="shrink-0 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-[#04130a] hover:bg-emerald-400 disabled:opacity-50 transition-all cursor-pointer"
                        >
                          {savingId === category.id ? "Saving…" : "Save"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          disabled={savingId === category.id}
                          className="shrink-0 px-3 py-2 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-50 transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="min-w-0 flex-1 text-sm text-slate-200 truncate">
                          {category.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(category.id);
                            setEditName(category.name);
                            setError(null);
                          }}
                          disabled={savingId !== null}
                          className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-50 transition-all cursor-pointer"
                        >
                          Rename
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(category)}
                          disabled={savingId !== null}
                          className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 border border-slate-800 text-slate-400 hover:text-[#ff6b85] hover:border-[#ff6b85]/30 disabled:opacity-50 transition-all cursor-pointer"
                        >
                          {savingId === category.id ? "Removing…" : "Delete"}
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="text-[0.7rem] text-slate-600 leading-relaxed">
            Deleting a category only removes it from this list — documents that used it keep their
            label. Renaming updates the label on your documents automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
