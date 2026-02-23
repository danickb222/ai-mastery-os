"use client";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 text-center px-4">
      <h1 className="text-[120px] font-bold score-glow" style={{ color: "var(--text-primary)" }}>404</h1>
      <p className="t-body">This route doesn&apos;t exist.</p>
      <Link
        href="/"
        className="btn btn-primary"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
