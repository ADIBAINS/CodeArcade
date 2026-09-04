import { cn } from "../lib/cn";

const VERDICT_STYLE: Record<string, string> = {
  AC: "border-emerald-300/30 bg-emerald-400/10 text-emerald-300",
  ACCEPTED: "border-emerald-300/30 bg-emerald-400/10 text-emerald-300",
  WA: "border-red-400/30 bg-red-500/10 text-red-300",
  WRONG_ANSWER: "border-red-400/30 bg-red-500/10 text-red-300",
  TLE: "border-amber-300/30 bg-amber-400/10 text-amber-300",
  TIME_LIMIT_EXCEEDED: "border-amber-300/30 bg-amber-400/10 text-amber-300",
  CE: "border-orange-400/30 bg-orange-500/10 text-orange-300",
  RE: "border-purple-300/30 bg-purple-500/10 text-purple-300",
  PENDING: "border-sky-300/30 bg-sky-400/10 text-sky-300",
  RUNNING: "border-sky-300/30 bg-sky-400/10 text-sky-300",
  JUDGING: "border-sky-300/30 bg-sky-400/10 text-sky-300",
};

export function verdictTone(label: string): string {
  const key = label.toUpperCase().replace(/\s+/g, "_");
  return VERDICT_STYLE[key] ?? "border-[var(--line-strong)] bg-[var(--surface-muted)] text-[var(--muted)]";
}

export function VerdictBadge({ verdict, status }: { verdict?: string | null; status?: string }) {
  const label = (verdict ?? status ?? "PENDING").toUpperCase();
  const live = label === "PENDING" || label === "RUNNING" || label === "JUDGING";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-black tracking-wide",
        verdictTone(label)
      )}
    >
      {live && <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-current" />}
      {label}
    </span>
  );
}
