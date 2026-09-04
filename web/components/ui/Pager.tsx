import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PageMeta } from "../../lib/api";
import { cn } from "../../lib/cn";

export function Pager({
  meta,
  onPage,
}: {
  meta: PageMeta;
  onPage: (page: number) => void;
}) {
  if (meta.totalPages <= 1) return null;
  const prevDisabled = meta.page <= 1;
  const nextDisabled = meta.page >= meta.totalPages;
  const btn =
    "inline-flex min-h-[34px] items-center gap-1 rounded-lg border border-[var(--line-strong)] bg-[var(--surface)] px-3 text-[13px] font-semibold text-[var(--text-strong)] transition hover:bg-[var(--surface-soft)] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-[var(--surface)]";
  return (
    <div className="mt-4 flex items-center justify-between gap-3">
      <p className="text-[12px] text-[var(--muted)]">
        {meta.total} total · page {meta.page} of {meta.totalPages}
      </p>
      <div className="flex items-center gap-2">
        <button className={cn(btn)} disabled={prevDisabled} onClick={() => onPage(meta.page - 1)}>
          <ChevronLeft size={14} /> Prev
        </button>
        <button className={cn(btn)} disabled={nextDisabled} onClick={() => onPage(meta.page + 1)}>
          Next <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
