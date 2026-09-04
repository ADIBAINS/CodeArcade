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
    <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
      <div className="max-w-2xl">
        {eyebrow && (
          <span className="mb-3 inline-flex min-h-[28px] items-center rounded-full border border-teal-300/30 bg-teal-400/10 px-3 text-[11px] font-black uppercase tracking-[0.14em] text-teal-300">
            {eyebrow}
          </span>
        )}
        <h1 className="text-glow text-4xl font-black tracking-tight text-[var(--text-strong)] sm:text-5xl">
          {title}
        </h1>
        {description && <p className="mt-3 text-[15px] leading-relaxed text-[var(--muted)]">{description}</p>}
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
    <div className="glass rounded-2xl px-6 py-12 text-center">
      <p className="text-lg font-extrabold text-[var(--text-strong)]">{title}</p>
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
    <div className="glass rounded-2xl p-5">
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="mt-3 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-5/6" />
      <Skeleton className="mt-5 h-10 w-full" />
    </div>
  );
}
