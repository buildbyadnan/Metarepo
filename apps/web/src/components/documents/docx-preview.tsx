"use client";

import { useEffect, useRef } from "react";
import { renderAsync } from "docx-preview";

/**
 * Client-side DOCX renderer. docx-preview needs a real DOM node (and the
 * browser's layout engine) — it is only ever reached through next/dynamic
 * with `ssr: false`, so this file never executes on the server.
 *
 * Rendering happens entirely in the browser: the bytes were fetched with
 * the session cookie (fetchDocumentBytes), the R2 bucket stays private, and
 * the Worker's CPU budget is untouched.
 */
export default function DocxPreview({ data }: { data: ArrayBuffer }) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let cancelled = false;

    // Styles go into the same container so everything unmounts with it.
    renderAsync(data, container, container, {
      inWrapper: true,
      ignoreWidth: false,
      ignoreHeight: false,
      ignoreFonts: false,
      breakPages: true,
      ignoreLastRenderedPageBreak: false,
    }).catch((err: unknown) => {
      if (cancelled) return;
      container.textContent =
        err instanceof Error
          ? `Could not render this document: ${err.message}`
          : "Could not render this document.";
    });

    return () => {
      cancelled = true;
      container.replaceChildren();
    };
  }, [data]);

  return <div ref={containerRef} className="docx-preview-root" />;
}
