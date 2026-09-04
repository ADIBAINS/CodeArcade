import { cn } from "../lib/cn";

const VERDICT_STYLE: Record<string, string> = {
  AC: "text-[var(--success)] bg-[var(--success-soft)]",
  ACCEPTED: "text-[var(--success)] bg-[var(--success-soft)]",
  WA: "text-[var(--danger)] bg-[var(--danger-soft)]",
  WRONG_ANSWER: "text-[var(--danger)] bg-[var(--danger-soft)]",
  TLE: "text-[var(--warning)] bg-[var(--warning-soft)]",
  TIME_LIMIT_EXCEEDED: "text-[var(--warning)] bg-[var(--warning-soft)]",
  CE: "text-[var(--danger)] bg-[var(--danger-soft)]",
  RE: "text-[var(--danger)] bg-[var(--danger-soft)]",
  PENDING: "text-[var(--info)] bg-[var(--info-soft)]",
  RUNNING: "text-[var(--info)] bg-[var(--info-soft)]",
  JUDGING: "text-[var(--info)] bg-[var(--info-soft)]",
};

export function verdictTone(label: string): string {
  const key = label.toUpperCase().replace(/\s+/g, "_");
  return VERDICT_STYLE[key] ?? "text-[var(--muted)] bg-[var(--surface-soft)]";
}

export function VerdictBadge({ verdict, status }: { verdict?: string | null; status?: string }) {
  const label = (verdict ?? status ?? "PENDING").toUpperCase();
  const live = label === "PENDING" || label === "RUNNING" || label === "JUDGING";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[12px] font-semibold",
        verdictTone(label)
      )}
    >
      {live && <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-current" />}
      {label}
    </span>
  );
}
