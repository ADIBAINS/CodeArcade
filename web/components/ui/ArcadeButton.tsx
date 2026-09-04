import Link from "next/link";
import { cn } from "../../lib/cn";

type Variant = "primary" | "ghost" | "danger";

const base =
  "inline-flex min-h-[38px] items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition active:translate-y-px";

export function ArcadeButton({
  variant = "ghost",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={cn(
        base,
        variant === "primary" && "bg-[var(--accent)] text-[var(--accent-ink)] hover:bg-[var(--accent-strong)]",
        variant === "ghost" &&
          "border border-[var(--line-strong)] bg-[var(--surface)] text-[var(--text-strong)] hover:bg-[var(--surface-soft)]",
        variant === "danger" && "bg-[var(--danger-soft)] text-[var(--danger)] hover:brightness-110",
        props.disabled && "cursor-not-allowed opacity-55 hover:translate-y-0",
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
        base,
        variant === "primary" && "bg-[var(--accent)] text-[var(--accent-ink)] hover:bg-[var(--accent-strong)]",
        variant === "ghost" &&
          "border border-[var(--line-strong)] bg-[var(--surface)] text-[var(--text-strong)] hover:bg-[var(--surface-soft)]",
        variant === "danger" && "bg-[var(--danger-soft)] text-[var(--danger)] hover:brightness-110",
        className
      )}
      {...props}
    />
  );
}
