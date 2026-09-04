import { cn } from "../lib/cn";

export type LeaderboardRow = {
  id: string;
  solvedCount: number;
  totalAccepted: number;
  totalSubmitted: number;
  score: number;
  user: { name: string; email?: string };
};

const RANK = ["#1", "#2", "#3"];

export function LeaderboardTable({ rows, offset = 0 }: { rows: LeaderboardRow[]; offset?: number }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--line)] bg-[var(--surface)]">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-[var(--line)] text-left text-[12px] font-medium text-[var(--muted)]">
            <th className="px-4 py-3">Rank</th>
            <th className="px-4 py-3">User</th>
            <th className="px-4 py-3">Solved</th>
            <th className="hidden px-4 py-3 sm:table-cell">Accepted</th>
            <th className="hidden px-4 py-3 sm:table-cell">Submissions</th>
            <th className="px-4 py-3 text-right">Score</th>
          </tr>
        </thead>
        <tbody>
            {rows.map((row, index) => {
              const rank = offset + index + 1;
              return (
                <tr key={row.id} className="border-b border-[var(--line)] transition last:border-0 hover:bg-[var(--surface-soft)]">
                  <td className="px-4 py-3.5">
                    <span className={cn("font-mono text-[13px]", rank <= 3 ? "font-bold text-[var(--accent)]" : "text-[var(--muted)]")}>
                      {RANK[rank - 1] ?? `#${rank}`}
                    </span>
                  </td>
              <td className="px-4 py-3.5 font-medium text-[var(--text-strong)]">{row.user.name}</td>
              <td className="px-4 py-3.5 font-mono text-[13px]">{row.solvedCount}</td>
              <td className="hidden px-4 py-3.5 font-mono text-[13px] sm:table-cell">{row.totalAccepted}</td>
              <td className="hidden px-4 py-3.5 font-mono text-[13px] sm:table-cell">{row.totalSubmitted}</td>
              <td className="px-4 py-3.5 text-right font-mono text-[13px] font-bold text-[var(--text-strong)]">{row.score}</td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}
