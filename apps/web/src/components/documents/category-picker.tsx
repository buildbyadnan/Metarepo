"use client";

import { useState } from "react";
import { createCategory, type CategoryDto } from "@/lib/api";
import { FIELD_CLASSES, friendlyError } from "./shared";

/** Display label for a builtin key ("report" → "Report"); customs pass through. */
export function categoryLabel(value: string, builtin: readonly string[]): string {
  if (builtin.includes(value)) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
  return value;
}

type Props = {
  id?: string;
  builtin: string[];
  custom: CategoryDto[];
  value: string;
  onChange: (value: string) => void;
  /** Refresh the custom list after an inline create. */
  onCreated?: (category: CategoryDto) => void;
  "aria-label"?: string;
};

/**
 * Category select: builtins and the user's own categories in separate
 * optgroups, plus "＋ New category…" which swaps in an inline name input
 * (no modal round-trip). A stored label missing from the lists (e.g. its
 * category was deleted — documents keep their label) still renders as an
 * option so the current value never appears blank.
 */
export function CategoryPicker({
  id,
  builtin,
  custom,
  value,
  onChange,
  onCreated,
  ...rest
}: Props) {
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valueKnown =
    builtin.includes(value) || custom.some((c) => c.name === value) || value === "__new_category__";

  const startCreate = () => {
    setDraft("");
    setError(null);
    setCreating(true);
  };

  const cancelCreate = () => {
    setCreating(false);
    setError(null);
    // Land back on the previous selection if the picker is mid-"new".
    if (value === "__new_category__") onChange(builtin[0] ?? "other");
  };

  const submitCreate = async () => {
    const name = draft.trim();
    if (!name || saving) return;
    setSaving(true);
    setError(null);
    try {
      const { category } = await createCategory(name);
      onCreated?.(category);
      onChange(category.name); // select what was just created
      setCreating(false);
      setDraft("");
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setSaving(false);
    }
  };

  if (creating) {
    return (
      <div className="space-y-1.5">
        <div className="flex gap-2">
          <input
            id={id}
            className={FIELD_CLASSES}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="e.g. Taxes 2026"
            maxLength={40}
            autoFocus
            aria-label="New category name"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submitCreate();
              } else if (e.key === "Escape") {
                cancelCreate();
              }
            }}
          />
          <button
            type="button"
            onClick={submitCreate}
            disabled={saving || draft.trim().length === 0}
            className="shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 text-[#04130a] hover:bg-emerald-400 disabled:opacity-50 transition-all cursor-pointer"
          >
            {saving ? "Saving…" : "Add"}
          </button>
          <button
            type="button"
            onClick={cancelCreate}
            disabled={saving}
            className="shrink-0 px-3 py-2.5 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-50 transition-all cursor-pointer"
          >
            Cancel
          </button>
        </div>
        {error ? (
          <p className="text-xs text-[#ff6b85]" role="alert">
            {error}
          </p>
        ) : (
          <p className="text-[0.7rem] text-slate-500">1–40 characters · shown on your documents</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <select
        id={id}
        className={FIELD_CLASSES}
        value={valueKnown ? value : ""}
        onChange={(e) => {
          if (e.target.value === "__new_category__") {
            startCreate();
            return;
          }
          onChange(e.target.value);
        }}
        {...rest}
      >
        {!valueKnown ? (
          // Orphaned/unknown stored label — keep it visible and selected.
          <option value={value}>{value} (removed)</option>
        ) : null}
        <optgroup label="Suggested">
          {builtin.map((name) => (
            <option key={name} value={name}>
              {categoryLabel(name, builtin)}
            </option>
          ))}
        </optgroup>
        {custom.length > 0 ? (
          <optgroup label="My categories">
            {custom.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </optgroup>
        ) : null}
        <option value="__new_category__">＋ New category…</option>
      </select>
      {error ? (
        <p className="text-xs text-[#ff6b85]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
