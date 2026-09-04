import Link from "next/link";
import { SquareTerminal } from "lucide-react";

export function AuthShell({
  eyebrow,
  title,
  blurb,
  cardTitle,
  cardHint,
  children,
  foot,
}: {
  eyebrow: string;
  title: string;
  blurb: string;
  cardTitle: string;
  cardHint: string;
  children: React.ReactNode;
  foot: React.ReactNode;
}) {
  return (
    <main className="mx-auto grid w-[min(1000px,calc(100%-32px))] items-start gap-10 py-14 lg:grid-cols-[1fr_400px]">
      <div className="hidden lg:block">
        <span className="inline-flex min-h-[26px] items-center rounded-md bg-[var(--surface-soft)] px-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--muted)]">
          {eyebrow}
        </span>
        <h1 className="mt-4 max-w-md text-[2rem] font-bold leading-tight tracking-tight text-[var(--text-strong)]">
          {title}
        </h1>
        <p className="mt-3 max-w-md text-[15px] leading-relaxed text-[var(--muted)]">{blurb}</p>
        <div className="mt-6 flex items-center gap-2 text-[13px] text-[var(--muted)]">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--surface-soft)] text-[var(--accent)]">
            <SquareTerminal size={14} />
          </span>
          Queue → workers → verdict in seconds
        </div>
      </div>
      <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-6">
        <h2 className="text-xl font-bold text-[var(--text-strong)]">{cardTitle}</h2>
        <p className="mb-5 mt-1 text-sm text-[var(--muted)]">{cardHint}</p>
        {children}
        <p className="mt-5 text-center text-sm text-[var(--muted)]">{foot}</p>
      </div>
    </main>
  );
}

export function AuthFootLink({ href, label, prefix }: { href: string; label: string; prefix: string }) {
  return (
    <>
      {prefix}{" "}
      <Link href={href} className="font-semibold text-[var(--text-strong)] hover:underline">
        {label}
      </Link>
    </>
  );
}
