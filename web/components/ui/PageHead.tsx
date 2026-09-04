import { cn } from "../../lib/cn";

export function PageHead({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow && (
          <span className="mb-2 inline-flex min-h-[26px] items-center rounded-md bg-[var(--surface-soft)] px-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--muted)]">
            {eyebrow}
          </span>
        )}
        <h1 className="text-[1.75rem] font-bold tracking-tight text-[var(--text-strong)]">
          {title}
        </h1>
        {description && <p className="mt-2 text-[14px] leading-relaxed text-[var(--muted)]">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-6 py-12 text-center">
      <p className="text-[15px] font-semibold text-[var(--text-strong)]">{title}</p>
      {hint && <p className="mx-auto mt-2 max-w-md text-sm text-[var(--muted)]">{hint}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton min-h-[20px] w-full", className)} />;
}

export function CardSkeleton() {
  return (
    <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5">
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="mt-3 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-5/6" />
      <Skeleton className="mt-5 h-10 w-full" />
    </div>
  );
}
