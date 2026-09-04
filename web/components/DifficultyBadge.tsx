import { cn } from "../lib/cn";

const DIFF_STYLE: Record<string, string> = {
  EASY: "border-emerald-300/30 bg-emerald-400/10 text-emerald-300",
  MEDIUM: "border-amber-300/30 bg-amber-400/10 text-amber-300",
  HARD: "border-red-400/30 bg-red-500/10 text-red-300",
};

export function DifficultyBadge({ difficulty }: { difficulty: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-black uppercase tracking-wider",
        DIFF_STYLE[difficulty.toUpperCase()] ??
          "border-[var(--line-strong)] bg-[var(--surface-muted)] text-[var(--muted)]"
      )}
    >
      {difficulty}
    </span>
  );
}
