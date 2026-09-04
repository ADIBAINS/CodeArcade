import Link from "next/link";
import { cn } from "../../lib/cn";

type Variant = "primary" | "ghost" | "danger";

export function ArcadeButton({
  variant = "ghost",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={cn(
        "inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl border px-4 text-sm font-extrabold transition active:translate-y-px",
        variant === "primary" &&
          "neon-btn border-transparent text-white hover:-translate-y-px",
        variant === "ghost" &&
          "border-[var(--line)] bg-[var(--surface)] text-[var(--text)] hover:-translate-y-px hover:border-[var(--line-strong)] hover:bg-[var(--surface-soft)]",
        variant === "danger" &&
          "border-red-400/30 bg-red-500/10 text-red-300 hover:bg-red-500/20",
        props.disabled && "cursor-not-allowed opacity-60 hover:translate-y-0",
        className
      )}
      {...props}
    />
  );
}

export function ArcadeLink({
  variant = "ghost",
  className,
  ...props
}: React.ComponentProps<typeof Link> & { variant?: Variant }) {
  return (
    <Link
      className={cn(
        "inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl border px-4 text-sm font-extrabold transition hover:-translate-y-px active:translate-y-px",
        variant === "primary" && "neon-btn border-transparent text-white",
        variant === "ghost" &&
          "border-[var(--line)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--line-strong)] hover:bg-[var(--surface-soft)]",
        variant === "danger" && "border-red-400/30 bg-red-500/10 text-red-300 hover:bg-red-500/20",
        className
      )}
      {...props}
    />
  );
}
