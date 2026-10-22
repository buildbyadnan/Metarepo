import React from "react";

type TagProps = {
  label: string;
  variant?: "accent" | "muted" | "purple";
};

export default function Tag({ label, variant = "accent" }: TagProps) {
  const styles = {
    accent: "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30",
    purple: "bg-purple-500/15 text-purple-300 border border-purple-500/30",
    muted: "bg-slate-700/30 text-slate-300 border border-slate-600/30",
  }[variant];

  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs ${styles}`}>
      {label}
    </span>
  );
}
