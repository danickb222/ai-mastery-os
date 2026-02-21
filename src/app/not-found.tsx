import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 text-center px-4">
      <div className="text-7xl font-bold text-white/10">404</div>
      <h1 className="text-2xl font-bold text-white">Page not found</h1>
      <p className="text-sm text-gray-400 max-w-md">
        This route doesn&apos;t exist. You may have followed a broken link or typed the URL incorrectly.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-500 px-6 py-3 text-sm font-semibold text-white transition-colors"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
