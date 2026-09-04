"use client";

import { RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { SubmissionRow, SubmissionTable } from "../../components/SubmissionTable";
import { ArcadeButton } from "../../components/ui/ArcadeButton";
import { CardSkeleton, EmptyState, PageHead } from "../../components/ui/PageHead";
import { Pager } from "../../components/ui/Pager";
import { EMPTY_META, apiList, type PageMeta } from "../../lib/api";
import { cn } from "../../lib/cn";

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PageMeta>(EMPTY_META);

  async function load(nextPage = page) {
    setMessage("");
    setLoading(true);
    try {
      const { items, meta } = await apiList<SubmissionRow>(`/api/users/me/submissions?page=${nextPage}&limit=20`, {}, nextPage, 20);
      setSubmissions(items);
      setMeta(meta);
      setPage(meta.page);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load submissions");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(1);
  }, []);

  const visible = useMemo(() => {
    if (filter === "ALL") return submissions;
    return submissions.filter((s) => (s.verdict ?? s.status ?? "").toUpperCase() === filter);
  }, [submissions, filter]);

  const verdicts = useMemo(() => {
    const set = new Set(submissions.map((s) => (s.verdict ?? s.status ?? "PENDING").toUpperCase()));
    return ["ALL", ...Array.from(set)];
  }, [submissions]);

  return (
    <main className="mx-auto w-[min(1180px,calc(100%-32px))] py-8 pb-16">
      <PageHead
        eyebrow="Your runs"
        title="Submissions"
        description="Every run with its verdict, test progress and timing."
        actions={
          <ArcadeButton onClick={() => load(page)}>
            <RefreshCw size={14} /> Refresh
          </ArcadeButton>
        }
      />

      {submissions.length > 0 && (
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5">
          {verdicts.map((v) => (
            <button
              key={v}
              onClick={() => setFilter(v)}
              className={cn(
                "shrink-0 whitespace-nowrap rounded-md px-3 py-1.5 text-[12px] font-semibold transition",
                filter === v
                  ? "bg-[var(--surface-soft)] text-[var(--text-strong)]"
                  : "text-[var(--muted)] hover:text-[var(--text-strong)]"
              )}
            >
              {v}
            </button>
          ))}
        </div>
      )}

      {message && (
        <div className="mb-4 rounded-lg bg-[var(--danger-soft)] px-4 py-2.5 text-sm font-medium text-[var(--danger)]">
          {message}
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState title="No submissions yet" hint="Solve a problem to see your first verdict here." />
      ) : (
        <SubmissionTable submissions={visible} />
      )}
      {!loading && visible.length > 0 && <Pager meta={meta} onPage={load} />}
    </main>
  );
}
