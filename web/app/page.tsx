"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Code2, Cpu, ListChecks, Trophy, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api";

const FEATURES = [
  {
    icon: Cpu,
    title: "Multithreaded judge",
    body: "Submissions queue in Java and run across parallel worker threads with timeouts and isolation.",
  },
  {
    icon: Code2,
    title: "Java & C++ workspace",
    body: "Function-style and stdin problems with templates, a synced editor theme, and Ctrl+Enter submit.",
  },
  {
    icon: ListChecks,
    title: "Clear fault reports",
    body: "Failed runs show the exact input, expected vs actual diff, and runtime errors per test.",
  },
  {
    icon: Trophy,
    title: "Difficulty-weighted ranks",
    body: "Score rewards harder solves. Ranked by score, solved count, then efficiency.",
  },
  {
    icon: Zap,
    title: "Five verdicts",
    body: "AC, WA, TLE, CE, RE with execution time, memory limits, and hidden test cases.",
  },
  {
    icon: CheckCircle2,
    title: "Community requests",
    body: "Suggest problems. Admins approve them into the set or reply with feedback.",
  },
];

export default function HomePage() {
  const [totalQuestions, setTotalQuestions] = useState<number | null>(null);

  useEffect(() => {
    apiRequest<{ count: number }>("/api/problems/count")
      .then(({ count }) => setTotalQuestions(count))
      .catch(() => setTotalQuestions(0));
  }, []);

  return (
    <main className="mx-auto w-[min(1180px,calc(100%-32px))] pb-16 pt-12">
      <section className="max-w-2xl">
        <h1 className="text-4xl font-bold leading-tight tracking-tight text-[var(--text-strong)] sm:text-[2.75rem]">
          Sharpen your data structures & algorithms.
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">
          Solve problems in Java or C++, get a verdict in seconds from a queue-powered judge,
          and climb the leaderboard.
        </p>
        <div className="mt-6 flex flex-wrap gap-2.5">
          <Link
            href="/problems"
            className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-[var(--accent)] px-5 text-sm font-semibold text-[var(--accent-ink)] transition hover:bg-[var(--accent-strong)]"
          >
            Start solving
          </Link>
          <Link
            href="/leaderboard"
            className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-[var(--line-strong)] bg-[var(--surface)] px-5 text-sm font-semibold text-[var(--text-strong)] transition hover:bg-[var(--surface-soft)]"
          >
            <Trophy size={15} /> Leaderboard
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-1 divide-y divide-[var(--line)] rounded-lg border border-[var(--line)] bg-[var(--surface)] min-[420px]:grid-cols-3 min-[420px]:divide-x min-[420px]:divide-y-0">
          {[
            [totalQuestions ?? "—", "Problems"],
            ["5", "Verdicts"],
            ["2", "Languages"],
          ].map(([v, l]) => (
            <div key={l} className="flex-1 px-5 py-4">
              <strong className="block text-2xl font-bold text-[var(--text-strong)]">{v}</strong>
              <span className="text-xs font-medium text-[var(--muted)]">{l}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.title} className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-[var(--surface-soft)] text-[var(--accent)]">
              <f.icon size={17} />
            </div>
            <h3 className="mt-3 text-[15px] font-semibold text-[var(--text-strong)]">{f.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">{f.body}</p>
          </div>
        ))}
      </section>

      <Link
        href="/problems"
        className="mt-8 flex items-center justify-between rounded-lg border border-[var(--line)] bg-[var(--surface)] px-5 py-4 text-sm font-semibold text-[var(--text-strong)] transition hover:bg-[var(--surface-soft)]"
      >
        Browse the full problem set <ArrowRight size={16} />
      </Link>
    </main>
  );
}
