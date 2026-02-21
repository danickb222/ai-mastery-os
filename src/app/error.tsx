"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 text-center px-4">
      <div className="text-7xl font-bold text-red-500/20">!</div>
      <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
      <p className="text-sm text-gray-400 max-w-md">
        {error.message || "An unexpected error occurred. Your data is safe in localStorage."}
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-500 px-6 py-3 text-sm font-semibold text-white transition-colors"
        >
          Try Again
        </button>
        <a
          href="/"
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-6 py-3 text-sm font-medium text-gray-300 transition-colors"
        >
          Back to Dashboard
        </a>
      </div>
    </div>
  );
}
