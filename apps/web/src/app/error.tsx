"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="text-center">
        <h1 className="text-xl font-semibold text-white mb-2">Something went wrong</h1>
        <p className="text-slate-400 mb-6">{error.message || "Please try again later."}</p>
        <button
          onClick={() => reset()}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
