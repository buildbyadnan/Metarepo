"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  // Guard to prevent the programmatic el.close() from firing onClose() again
  const closingProgrammatically = useRef(false);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) {
      if (!el.open) el.showModal();
    } else {
      if (el.open) {
        closingProgrammatically.current = true;
        el.close();
      }
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="modal-title"
      onClose={() => {
        // Native close event: only propagate if the user triggered it (Escape key or backdrop)
        if (closingProgrammatically.current) {
          closingProgrammatically.current = false;
          return;
        }
        onClose();
      }}
      onClick={(e) => {
        // Close on backdrop click (click on <dialog> itself, not its children)
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 backdrop:bg-black/50 backdrop:backdrop-blur-sm rounded-2xl shadow-2xl border-0 p-0 w-full max-w-md"
    >
      <div className="p-8">{children}</div>
    </dialog>
  );
}
