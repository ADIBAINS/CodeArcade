import Link from "next/link";
import { Eye } from "lucide-react";
import { VerdictBadge } from "./VerdictBadge";
import { timeAgo } from "../lib/time";

export type SubmissionRow = {
  id: string;
  language: string;
  status: string;
  verdict?: string | null;
  passedTests: number;
  totalTests: number;
  executionTimeMs?: number | null;
  createdAt: string;
  problem?: { title: string; slug: string };
};

export function SubmissionTable({ submissions }: { submissions: SubmissionRow[] }) {
  return (
    <div className="glass overflow-x-auto rounded-2xl">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-[var(--line)] text-left text-[11px] font-black uppercase tracking-widest text-[var(--muted)]">
            <th className="px-4 py-3">Problem</th>
            <th className="px-4 py-3">Lang</th>
            <th className="px-4 py-3">Verdict</th>
            <th className="px-4 py-3">Tests</th>
            <th className="px-4 py-3">Time</th>
            <th className="px-4 py-3">When</th>
            <th className="px-4 py-3 text-right">Open</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((s) => {
            const pct = s.totalTests > 0 ? Math.round((s.passedTests / s.totalTests) * 100) : 0;
            return (
              <tr key={s.id} className="border-b border-[var(--line)]/60 transition last:border-0 hover:bg-[var(--surface-soft)]/60">
                <td className="max-w-[220px] truncate px-4 py-3 font-bold text-[var(--text-strong)]">
                  {s.problem?.title ?? s.id.slice(0, 8)}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-md border border-[var(--line)] bg-[var(--bg-elevated)] px-1.5 py-0.5 font-mono text-[11px] font-bold">
                    {s.language}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <VerdictBadge verdict={s.verdict} status={s.status} />
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-xs">
                    {s.passedTests}/{s.totalTests}
                  </span>
                  <span className="ml-2 hidden h-1.5 w-16 overflow-hidden rounded-full bg-[var(--surface-muted)] align-middle xl:inline-block">
                    <span
                      className={`block h-full rounded-full ${pct === 100 ? "bg-emerald-400" : pct >= 50 ? "bg-amber-300" : "bg-red-400"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{s.executionTimeMs ?? "—"} ms</td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-[var(--muted)]">{timeAgo(s.createdAt)}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/submissions/${s.id}`}
                    title="View details"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--line)] text-[var(--muted)] transition hover:border-teal-300/40 hover:text-teal-300"
                  >
                    <Eye size={15} />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
