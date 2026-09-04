"use client";

import Link from "next/link";
import { ArrowRight, Code2, Cpu, Database, ListChecks, Play, Trophy, Users, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api";

const FEATURES = [
  {
    icon: Cpu,
    title: "Judge Core",
    body: "Submissions land in a Java BlockingQueue and are processed by parallel JudgeWorker threads with timeouts and isolation.",
    accent: "text-teal-300 border-teal-300/30 bg-teal-400/10",
  },
  {
    icon: Database,
    title: "Platform API",
    body: "Express + Prisma + PostgreSQL with JWT auth and Zod validation for users, problems, test cases and results.",
    accent: "text-sky-300 border-sky-300/30 bg-sky-400/10",
  },
  {
    icon: Code2,
    title: "Contest IDE",
    body: "Resizable workspace, theme-synced Monaco editor, Java/C++ templates and one-click submit with live verdict polling.",
    accent: "text-violet-300 border-violet-300/30 bg-violet-400/10",
  },
  {
    icon: ListChecks,
    title: "Fault Review",
    body: "Failed runs show the exact input, expected vs actual output diff, runtime errors and per-test progress.",
    accent: "text-amber-300 border-amber-300/30 bg-amber-400/10",
  },
  {
    icon: Users,
    title: "Arcade Ranks",
    body: "Difficulty-weighted scoring ranked by solved count and submission efficiency. Chase the podium.",
    accent: "text-emerald-300 border-emerald-300/30 bg-emerald-400/10",
  },
  {
    icon: Zap,
    title: "5 Verdicts",
    body: "AC, WA, TLE, CE and RE with execution time, memory limits and hidden test case support.",
    accent: "text-rose-300 border-rose-300/30 bg-rose-400/10",
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
    <main className="relative overflow-hidden">
      <div className="arcade-grid-bg pointer-events-none absolute inset-0" />
      <div className="relative mx-auto w-[min(1180px,calc(100%-32px))] pb-16 pt-12">
        <section className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className="inline-flex min-h-[30px] items-center gap-2 rounded-full border border-teal-300/30 bg-teal-400/10 px-3 text-[11px] font-black uppercase tracking-[0.16em] text-teal-300">
              <span className="live-dot h-1.5 w-1.5 rounded-full bg-teal-300" />
              Judge online · workers ready
            </span>
            <h1 className="text-glow mt-5 text-5xl font-black leading-[1.02] tracking-tight text-[var(--text-strong)] sm:text-6xl">
              Enter the
              <br />
              coding <span className="bg-gradient-to-r from-teal-300 via-sky-400 to-violet-400 bg-clip-text text-transparent">arcade.</span>
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-[var(--muted)]">
              Solve DSA problems in Java or C++, get instant verdicts from a multithreaded judge
              engine, review faults test-by-test, and climb the leaderboard.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/problems"
                className="neon-btn inline-flex min-h-[46px] items-center gap-2 rounded-xl px-6 text-[15px] font-extrabold text-white transition hover:-translate-y-0.5"
              >
                <Play size={17} /> Start solving
              </Link>
              <Link
                href="/leaderboard"
                className="inline-flex min-h-[46px] items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-6 text-[15px] font-extrabold text-[var(--text)] transition hover:-translate-y-0.5 hover:bg-[var(--surface-soft)]"
              >
                <Trophy size={17} /> Leaderboard
              </Link>
            </div>
            <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
              <div className="glass rounded-2xl p-4">
                <strong className="block text-2xl font-black text-[var(--text-strong)]">
                  {totalQuestions ?? "—"}
                </strong>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Problems</span>
              </div>
              <div className="glass rounded-2xl p-4">
                <strong className="block text-2xl font-black text-[var(--text-strong)]">5</strong>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Verdicts</span>
              </div>
              <div className="glass rounded-2xl p-4">
                <strong className="block text-2xl font-black text-[var(--text-strong)]">3</strong>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Workers</span>
              </div>
            </div>
          </div>

          <div className="glass relative overflow-hidden rounded-3xl p-6">
            <div className="mb-4 flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
              <span className="ml-2 font-mono text-[11px] uppercase tracking-widest text-[var(--muted)]">
                live verdict stream
              </span>
            </div>
            <div className="space-y-2.5 font-mono text-[13px]">
              {[
                ["AC", "two-sum.java", "12ms", "text-emerald-300"],
                ["AC", "reverse-array.cpp", "8ms", "text-emerald-300"],
                ["WA", "palindrome.java", "test 4/9", "text-red-300"],
                ["TLE", "n-queens.cpp", "2000ms", "text-amber-300"],
                ["RUNNING", "median-sort.java", "judging…", "text-sky-300"],
              ].map(([v, f, m, c]) => (
                <div
                  key={f}
                  className="flex items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)] px-3.5 py-2.5"
                >
                  <span className={`font-black ${c}`}>{v}</span>
                  <span className="truncate text-[var(--text)]">{f}</span>
                  <span className="ml-auto shrink-0 text-[var(--muted)]">{m}</span>
                </div>
              ))}
            </div>
            <Link
              href="/submissions"
              className="mt-5 inline-flex min-h-[42px] w-full items-center justify-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] text-sm font-extrabold transition hover:border-teal-300/40 hover:text-teal-300"
            >
              View submissions <ArrowRight size={15} />
            </Link>
          </div>
        </section>

        <section className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="glass group rounded-2xl p-5 transition hover:-translate-y-1 hover:border-teal-300/30"
            >
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border ${f.accent}`}>
                <f.icon size={18} />
              </div>
              <h3 className="mt-4 text-lg font-extrabold text-[var(--text-strong)]">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{f.body}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
