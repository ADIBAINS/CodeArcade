"use client";

import Link from "next/link";
import { RefreshCw, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DifficultyBadge } from "../../components/DifficultyBadge";
import { ArcadeButton } from "../../components/ui/ArcadeButton";
import { EmptyState, PageHead, Skeleton } from "../../components/ui/PageHead";
import { Pager } from "../../components/ui/Pager";
import { EMPTY_META, apiList, type PageMeta } from "../../lib/api";
import { cn } from "../../lib/cn";

export type ProblemSummary = {
  id: string;
  title: string;
  slug: string;
  difficulty: string;
  timeLimitMs: number;
  memoryLimitMb: number;
};

type Filter = "ALL" | "EASY" | "MEDIUM" | "HARD";

export default function ProblemsPage() {
  const [problems, setProblems] = useState<ProblemSummary[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("ALL");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PageMeta>(EMPTY_META);

  async function load(nextPage = page) {
    setMessage("");
    setLoading(true);
    try {
      const { items, meta } = await apiList<ProblemSummary>(`/api/problems?page=${nextPage}&limit=100`, {}, nextPage, 100);
      setProblems(items);
      setMeta(meta);
      setPage(meta.page);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load problems");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(1);
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return problems.filter((p) => {
      if (filter !== "ALL" && p.difficulty.toUpperCase() !== filter) return false;
      if (q && !p.title.toLowerCase().includes(q) && !p.slug.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [problems, query, filter]);

  return (
    <main className="mx-auto w-[min(1180px,calc(100%-32px))] py-8 pb-16">
      <PageHead
        eyebrow="Problem set"
        title="Problems"
        description="Pick a problem and submit Java or C++ code for an instant verdict."
        actions={
          <ArcadeButton onClick={() => load(page)}>
            <RefreshCw size={14} /> Refresh
          </ArcadeButton>
        }
      />

      <div className="mb-4 flex flex-col gap-2.5 lg:flex-row lg:items-center">
        <div className="flex min-h-[38px] flex-1 items-center gap-2 rounded-lg border border-[var(--line-strong)] bg-[var(--surface)] px-3 text-[var(--muted)]">
          <Search size={15} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search problems"
            className="w-full bg-transparent text-sm text-[var(--text-strong)] outline-none placeholder:text-[var(--muted)]"
          />
        </div>
        <div className="-mx-1 flex gap-1 overflow-x-auto px-1">
          {(["ALL", "EASY", "MEDIUM", "HARD"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "shrink-0 whitespace-nowrap rounded-md px-3.5 py-2 text-[13px] font-semibold transition",
                filter === f
                  ? "bg-[var(--surface-soft)] text-[var(--text-strong)]"
                  : "text-[var(--muted)] hover:text-[var(--text-strong)]"
              )}
            >
              {f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {message && (
        <div className="mb-4 rounded-lg bg-[var(--danger-soft)] px-4 py-2.5 text-sm font-medium text-[var(--danger)]">
          {message}
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-[52px]" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          title={problems.length === 0 ? "No problems yet" : "No matching problems"}
          hint="Try a different search term or difficulty filter."
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[var(--line)] bg-[var(--surface)]">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--line)] text-left text-[12px] font-medium text-[var(--muted)]">
                <th className="w-14 px-4 py-3">#</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Difficulty</th>
                <th className="hidden px-4 py-3 sm:table-cell">Time</th>
                <th className="hidden px-4 py-3 md:table-cell">Memory</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((p, i) => (
                <tr key={p.id} className="border-b border-[var(--line)] transition last:border-0 hover:bg-[var(--surface-soft)]">
                  <td className="px-4 py-3.5 font-mono text-[13px] text-[var(--muted)]">{(meta.page - 1) * meta.limit + i + 1}</td>
                  <td className="px-4 py-3.5">
                    <Link href={`/problems/${p.slug}`} className="font-medium text-[var(--text-strong)] hover:text-[var(--accent)]">
                      {p.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3.5">
                    <DifficultyBadge difficulty={p.difficulty} />
                  </td>
                  <td className="hidden px-4 py-3.5 font-mono text-[13px] text-[var(--muted)] sm:table-cell">
                    {p.timeLimitMs} ms
                  </td>
                  <td className="hidden px-4 py-3.5 font-mono text-[13px] text-[var(--muted)] md:table-cell">
                    {p.memoryLimitMb} MB
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!loading && visible.length > 0 && <Pager meta={meta} onPage={load} />}
    </main>
  );
}
