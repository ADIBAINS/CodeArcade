import Link from "next/link";
import { ChevronRight } from "lucide-react";
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
    <div className="overflow-x-auto rounded-lg border border-[var(--line)] bg-[var(--surface)]">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-[var(--line)] text-left text-[12px] font-medium text-[var(--muted)]">
            <th className="px-4 py-3">Problem</th>
            <th className="px-4 py-3">Lang</th>
            <th className="px-4 py-3">Verdict</th>
            <th className="px-4 py-3">Tests</th>
            <th className="px-4 py-3">Time</th>
            <th className="px-4 py-3">When</th>
            <th className="w-10 px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {submissions.map((s) => (
            <tr key={s.id} className="border-b border-[var(--line)] transition last:border-0 hover:bg-[var(--surface-soft)]">
              <td className="max-w-[220px] truncate px-4 py-3 font-medium text-[var(--text-strong)]">
                {s.problem?.title ?? s.id.slice(0, 8)}
              </td>
              <td className="px-4 py-3 font-mono text-[12px] text-[var(--muted)]">{s.language}</td>
              <td className="px-4 py-3">
                <VerdictBadge verdict={s.verdict} status={s.status} />
              </td>
              <td className="px-4 py-3 font-mono text-[13px]">
                {s.passedTests}/{s.totalTests}
              </td>
              <td className="px-4 py-3 font-mono text-[13px] text-[var(--muted)]">{s.executionTimeMs ?? "—"} ms</td>
              <td className="whitespace-nowrap px-4 py-3 text-[13px] text-[var(--muted)]">{timeAgo(s.createdAt)}</td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/submissions/${s.id}`}
                  title="View details"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--text-strong)]"
                >
                  <ChevronRight size={15} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
