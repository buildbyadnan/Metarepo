"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { documentContentUrl, fetchDocumentBytes, type DocumentDto } from "@/lib/api";
import { formatBytes, friendlyError } from "./shared";

/**
 * docx-preview renders an in-browser approximation of the Word layout
 * (styles, tables, images, page breaks). Loaded only when a DOCX preview
 * actually opens — `ssr: false` keeps it out of the server bundle entirely,
 * since it needs the DOM.
 */
const DocxPreview = dynamic(() => import("./docx-preview"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center gap-3 py-16 text-sm text-slate-400">
      <span className="h-4 w-4 border-2 border-slate-600 border-t-emerald-400 rounded-full animate-spin" />
      Loading preview…
    </div>
  ),
});

type Props = {
  doc: DocumentDto;
  /** Recipients of write shares may edit — this modal only ever views. */
  onClose: () => void;
};

/** Full-screen viewer: native PDF iframe, client-rendered DOCX, download always available. */
export function DocumentViewModal({ doc, onClose }: Props) {
  const [bytes, setBytes] = useState<ArrayBuffer | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(doc.kind !== "pdf");
  const closeRef = useRef<HTMLButtonElement | null>(null);

  // Close on Escape; move focus into the dialog when it opens.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // DOCX: fetch the bytes once (session cookie) for client-side rendering.
  // (PDFs skip this — they render natively via the iframe below.)
  useEffect(() => {
    if (doc.kind === "pdf") return;
    let cancelled = false;
    setLoading(true);
    fetchDocumentBytes(doc.id)
      .then((buf) => {
        if (cancelled) return;
        setBytes(buf);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(friendlyError(err));
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [doc.id, doc.kind]);

  const isPdf = doc.kind === "pdf";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Viewing ${doc.title}`}
      onClick={(e) => {
        // Click on the backdrop (not its children) closes.
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-4xl h-[85vh] rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-900 bg-slate-900/60">
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-bold text-white truncate">{doc.title}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isPdf ? "PDF" : "Word document"} · {formatBytes(doc.size)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              const a = document.createElement("a");
              a.href = documentContentUrl(doc.id, true);
              a.rel = "noopener";
              document.body.appendChild(a);
              a.click();
              a.remove();
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 transition-all cursor-pointer"
          >
            Download
          </button>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close preview"
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

        {/* Body */}
        <div className="flex-1 min-h-0 bg-slate-900/20">
          {isPdf ? (
            <iframe
              src={documentContentUrl(doc.id)}
              title={doc.title}
              className="h-full w-full border-0"
              // The content route serves CSP: sandbox, so no scripts run.
            />
          ) : loadError ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 p-8 text-center">
              <p className="text-sm text-[#ff6b85]" role="alert">
                {loadError}
              </p>
              <p className="text-xs text-slate-500">
                You can still download the file and open it in Word.
              </p>
            </div>
          ) : loading || !bytes ? (
            <div className="h-full flex items-center justify-center gap-3 text-sm text-slate-400">
              <span className="h-4 w-4 border-2 border-slate-600 border-t-emerald-400 rounded-full animate-spin" />
              Loading preview…
            </div>
          ) : (
            <div className="h-full overflow-auto p-4 docx-preview-scroll">
              <DocxPreview data={bytes} />
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-5 py-2.5 border-t border-slate-900 bg-slate-900/40 flex items-center justify-between">
          <span className="text-[0.7rem] text-slate-500">
            {isPdf
              ? "Rendered by your browser's built-in PDF viewer."
              : "Rendered in your browser — layouts are approximated."}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
