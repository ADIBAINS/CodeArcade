import Link from "next/link";
import { Gamepad2 } from "lucide-react";

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
    <main className="relative overflow-hidden">
      <div className="arcade-grid-bg pointer-events-none absolute inset-0" />
      <div className="relative mx-auto grid w-[min(1120px,calc(100%-32px))] items-center gap-10 py-14 lg:grid-cols-[1fr_440px]">
        <div>
          <span className="inline-flex min-h-[30px] items-center rounded-full border border-teal-300/30 bg-teal-400/10 px-3 text-[11px] font-black uppercase tracking-[0.16em] text-teal-300">
            {eyebrow}
          </span>
          <h1 className="text-glow mt-4 max-w-xl text-5xl font-black leading-[1.03] tracking-tight text-[var(--text-strong)]">
            {title}
          </h1>
          <p className="mt-4 max-w-lg leading-relaxed text-[var(--muted)]">{blurb}</p>
          <div className="mt-6 flex items-center gap-2 font-mono text-xs text-[var(--muted)]">
            <span className="neon-btn flex h-7 w-7 items-center justify-center rounded-lg text-white">
              <Gamepad2 size={14} />
            </span>
            queue → workers → verdict in seconds
          </div>
        </div>
        <div className="glass rounded-3xl p-6 sm:p-7">
          <h2 className="text-2xl font-black text-[var(--text-strong)]">{cardTitle}</h2>
          <p className="mb-5 mt-1 text-sm text-[var(--muted)]">{cardHint}</p>
          {children}
          <p className="mt-5 text-center text-sm text-[var(--muted)]">{foot}</p>
        </div>
      </div>
    </main>
  );
}

export function AuthFootLink({ href, label, prefix }: { href: string; label: string; prefix: string }) {
  return (
    <>
      {prefix} <Link href={href} className="font-extrabold text-teal-300 hover:underline">{label}</Link>
    </>
  );
}
