import { Crown, Medal } from "lucide-react";
import { cn } from "../lib/cn";

export type LeaderboardRow = {
  id: string;
  solvedCount: number;
  totalAccepted: number;
  totalSubmitted: number;
  score: number;
  user: { name: string; email: string };
};

export function LeaderboardTable({ rows }: { rows: LeaderboardRow[] }) {
  const top = rows.slice(0, 3);
  const rest = rows.slice(3);
  return (
    <div className="space-y-4">
      {top.length > 0 && (
        <div className="grid gap-3 md:grid-cols-3">
          {top.map((row, i) => (
            <div
              key={row.id}
              className={cn(
                "glass relative overflow-hidden rounded-2xl p-5",
                i === 0 && "border-amber-300/40 shadow-[0_0_40px_rgba(253,176,34,0.15)]"
              )}
            >
              {i === 0 && <Crown size={18} className="absolute right-4 top-4 text-amber-300" />}
              <p className="font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[var(--muted)]">
                Rank #{i + 1}
              </p>
              <p className="mt-1 truncate text-lg font-black text-[var(--text-strong)]">{row.user.name}</p>
              <p className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-teal-300">{row.score}</span>
                <span className="text-xs font-bold text-[var(--muted)]">pts</span>
              </p>
              <p className="mt-2 text-xs font-bold text-[var(--muted)]">
                {row.solvedCount} solved · {row.totalAccepted} accepted · {row.totalSubmitted} runs
              </p>
            </div>
          ))}
        </div>
      )}
      <div className="glass overflow-x-auto rounded-2xl">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--line)] text-left text-[11px] font-black uppercase tracking-widest text-[var(--muted)]">
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Player</th>
              <th className="px-4 py-3">Solved</th>
              <th className="px-4 py-3">Accepted</th>
              <th className="px-4 py-3">Runs</th>
              <th className="px-4 py-3 text-right">Score</th>
            </tr>
          </thead>
          <tbody>
            {(top.length > 0 ? rest : rows).map((row, index) => {
              const rank = top.length > 0 ? index + 4 : index + 1;
              return (
                <tr key={row.id} className="border-b border-[var(--line)]/60 transition last:border-0 hover:bg-[var(--surface-soft)]/60">
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 font-mono font-bold text-[var(--muted)]">
                      {rank <= 3 && <Medal size={13} className="text-amber-300" />} #{rank}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-[var(--text-strong)]">{row.user.name}</td>
                  <td className="px-4 py-3 font-mono">{row.solvedCount}</td>
                  <td className="px-4 py-3 font-mono">{row.totalAccepted}</td>
                  <td className="px-4 py-3 font-mono">{row.totalSubmitted}</td>
                  <td className="px-4 py-3 text-right font-mono font-black text-teal-300">{row.score}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
