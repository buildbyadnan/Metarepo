"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-white mb-2">Something went wrong</h2>
        <p className="text-slate-400 mb-6">{error.message || "An unexpected error occurred"}</p>
        <button
          onClick={reset}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
