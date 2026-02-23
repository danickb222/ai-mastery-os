"use client";
import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 text-center px-4">
      <h1 className="t-display">Something went wrong.</h1>
      <p className="t-body">An error occurred. Your local progress data is safe.</p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="btn btn-primary"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="btn btn-ghost"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
