import { cn } from "../lib/cn";

const DIFF_STYLE: Record<string, string> = {
  EASY: "text-[var(--easy)]",
  MEDIUM: "text-[var(--medium)]",
  HARD: "text-[var(--hard)]",
};

/* LeetCode-style: plain colored text, no pill */
export function DifficultyBadge({ difficulty }: { difficulty: string }) {
  return (
    <span className={cn("text-[13px] font-medium", DIFF_STYLE[difficulty.toUpperCase()] ?? "text-[var(--muted)]")}>
      {difficulty.charAt(0) + difficulty.slice(1).toLowerCase()}
    </span>
  );
}
