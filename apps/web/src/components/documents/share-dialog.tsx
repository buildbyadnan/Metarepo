"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  createShare,
  fetchShares,
  revokeShare,
  type DocumentDto,
  type ShareDto,
  type SharePermission,
} from "@/lib/api";
import { FIELD_CLASSES, friendlyError, KindIcon } from "./shared";

type Props = {
  doc: DocumentDto;
  onClose: () => void;
  /** Called after any share change so the parent can refresh counts etc. */
  onChanged?: () => void;
};

/**
 * Owner-only share management: invite by email with read-only or
 * read-and-write permission, and revoke existing shares. The recipient
 * doesn't need an account yet — the share activates on their first login
 * with that exact address.
 */
export function ShareDialog({ doc, onClose, onChanged }: Props) {
  const [shares, setShares] = useState<ShareDto[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState<SharePermission>("read");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);

  const loadShares = useCallback(async () => {
    try {
      const data = await fetchShares(doc.id);
      setShares(data.shares);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setListLoading(false);
    }
  }, [doc.id]);

  useEffect(() => {
    loadShares();
    emailRef.current?.focus();
  }, [loadShares]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const invite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    setNotice(null);
    try {
      await createShare(doc.id, email.trim(), permission);
      setEmail("");
      setNotice(`Shared with ${email.trim() || "that address"}.`);
      await loadShares();
      onChanged?.();
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const revoke = async (share: ShareDto) => {
    setRevokingId(share.id);
    setError(null);
    setNotice(null);
    try {
      await revokeShare(doc.id, share.id);
      setShares((current) => current.filter((s) => s.id !== share.id));
      setNotice(`Access revoked for ${share.email}.`);
      onChanged?.();
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Share ${doc.title}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
        <div className="flex items-start gap-3 px-6 py-5 border-b border-slate-900 bg-slate-900/60">
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold text-white">Share document</h2>
            <div className="flex items-center gap-2 mt-2">
              <KindIcon kind={doc.kind} />
              <div className="min-w-0">
                <p className="text-sm text-slate-200 truncate">{doc.title}</p>
                <p className="text-xs text-slate-500">Private to your account unless shared</p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close share dialog"
            className="h-8 w-8 shrink-0 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer flex items-center justify-center"
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
          <form onSubmit={invite} className="space-y-4">
            <div>
              <label
                htmlFor="share-email"
                className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5"
              >
                Email address
              </label>
              <input
                ref={emailRef}
                id="share-email"
                type="email"
                className={FIELD_CLASSES}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teammate@example.com"
                autoComplete="off"
                maxLength={320}
                required
              />
            </div>

            <fieldset>
              <legend className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Permission
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  {
                    value: "read" as SharePermission,
                    title: "Read only",
                    hint: "View and download",
                  },
                  {
                    value: "write" as SharePermission,
                    title: "Read and write",
                    hint: "Also edit title & description",
                  },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`rounded-xl border px-4 py-3 cursor-pointer transition-all ${
                      permission === opt.value
                        ? "border-emerald-500/60 bg-emerald-500/10"
                        : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="share-permission"
                      value={opt.value}
                      checked={permission === opt.value}
                      onChange={() => setPermission(opt.value)}
                      className="sr-only"
                    />
                    <span className="block text-sm font-semibold text-slate-200">{opt.title}</span>
                    <span className="block text-xs text-slate-500 mt-0.5">{opt.hint}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <button
              type="submit"
              disabled={submitting || email.trim().length === 0}
              className="w-full px-6 py-2.5 rounded-xl text-sm font-bold bg-emerald-500 text-[#04130a] hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="h-4 w-4 border-2 border-[#04130a]/30 border-t-[#04130a] rounded-full animate-spin" />
                  Sharing…
                </>
              ) : (
                "Share"
              )}
            </button>
          </form>

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

          <div className="border-t border-slate-900 pt-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Shared with
            </h3>
            {listLoading ? (
              <div className="space-y-2">
                <div className="h-10 rounded-xl bg-slate-900/60 animate-pulse" />
                <div className="h-10 rounded-xl bg-slate-900/60 animate-pulse" />
              </div>
            ) : shares.length === 0 ? (
              <p className="text-sm text-slate-500">Not shared with anyone yet.</p>
            ) : (
              <ul className="space-y-2">
                {shares.map((share) => (
                  <li
                    key={share.id}
                    className="flex items-center gap-3 rounded-xl border border-slate-900 bg-slate-900/40 px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-slate-200 truncate">
                        {share.recipientName ?? share.email}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {share.recipientName ? `${share.email} · ` : "Invited — "}
                        {share.permission === "write" ? "Read and write" : "Read only"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => revoke(share)}
                      disabled={revokingId === share.id}
                      className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 border border-slate-800 text-slate-400 hover:text-[#ff6b85] hover:border-[#ff6b85]/30 disabled:opacity-60 transition-all cursor-pointer"
                    >
                      {revokingId === share.id ? "Revoking…" : "Revoke"}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="text-[0.7rem] text-slate-600 leading-relaxed">
            The recipient sees this document under their &quot;Shared with me&quot; tab after
            signing in with that exact email. Write access allows editing the title and description
            — deleting and sharing stay yours alone.
          </p>
        </div>
      </div>
    </div>
  );
}
