"use client";

import Link from "next/link";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Route error:", error);
  }, [error]);

  return (
    <main className="mx-auto w-[min(640px,calc(100%-32px))] py-16 pb-24 text-center">
      <AlertTriangle size={36} className="mx-auto text-[var(--warning)]" strokeWidth={1.5} />
      <h1 className="mt-4 text-xl font-bold text-[var(--text-strong)]">Something went wrong</h1>
      <p className="mx-auto mt-2 max-w-md text-sm text-[var(--muted)]">
        This page hit an unexpected error. Your data is safe — try again or head back.
      </p>
      <div className="mt-6 flex justify-center gap-2">
        <button
          onClick={reset}
          className="inline-flex min-h-[38px] items-center gap-2 rounded-lg bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-ink)] transition hover:bg-[var(--accent-strong)]"
        >
          <RotateCcw size={14} /> Try again
        </button>
        <Link
          href="/"
          className="inline-flex min-h-[38px] items-center gap-2 rounded-lg border border-[var(--line-strong)] bg-[var(--surface)] px-4 text-sm font-semibold text-[var(--text-strong)] transition hover:bg-[var(--surface-soft)]"
        >
          <Home size={14} /> Home
        </Link>
      </div>
    </main>
  );
}
