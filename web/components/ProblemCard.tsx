import Link from "next/link";
import { ArrowRight, Cpu, Timer } from "lucide-react";
import { DifficultyBadge } from "./DifficultyBadge";

export type ProblemSummary = {
  id: string;
  title: string;
  slug: string;
  difficulty: string;
  timeLimitMs: number;
  memoryLimitMb: number;
};

const DIFFICULTY_RING: Record<string, string> = {
  EASY: "hover:border-emerald-300/40",
  MEDIUM: "hover:border-amber-300/40",
  HARD: "hover:border-red-400/40",
};

export function ProblemCard({ problem, index }: { problem: ProblemSummary; index?: number }) {
  return (
    <article
      className={`glass group flex min-h-[220px] flex-col rounded-2xl p-5 transition hover:-translate-y-1 ${
        DIFFICULTY_RING[problem.difficulty.toUpperCase()] ?? "hover:border-teal-300/40"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)] font-mono text-xs font-bold text-[var(--muted)]">
            {String((index ?? 0) + 1).padStart(2, "0")}
          </span>
          <h3 className="text-[16px] font-extrabold leading-snug text-[var(--text-strong)]">
            {problem.title}
          </h3>
        </div>
        <DifficultyBadge difficulty={problem.difficulty} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-[var(--muted)]">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--bg-elevated)] px-2.5 py-1">
          <Timer size={13} /> {problem.timeLimitMs} ms
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--bg-elevated)] px-2.5 py-1">
          <Cpu size={13} /> {problem.memoryLimitMb} MB
        </span>
      </div>
      <Link
        href={`/problems/${problem.slug}`}
        className="neon-btn mt-auto inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl pt-0 text-sm font-extrabold text-white opacity-90 transition group-hover:opacity-100"
        style={{ marginTop: 18 }}
      >
        Solve <ArrowRight size={15} />
      </Link>
    </article>
  );
}
