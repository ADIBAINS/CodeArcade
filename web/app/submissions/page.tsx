"use client";

import { Filter, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { SubmissionRow, SubmissionTable } from "../../components/SubmissionTable";
import { ArcadeButton } from "../../components/ui/ArcadeButton";
import { CardSkeleton, EmptyState, PageHead } from "../../components/ui/PageHead";
import { apiRequest } from "../../lib/api";
import { cn } from "../../lib/cn";

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  async function load() {
    setMessage("");
    setLoading(true);
    try {
      setSubmissions(await apiRequest<SubmissionRow[]>("/api/users/me/submissions"));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load submissions");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const visible = useMemo(() => {
    if (filter === "ALL") return submissions;
    return submissions.filter(
      (s) => (s.verdict ?? s.status ?? "").toUpperCase() === filter
    );
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
        description="Every run with its verdict, test progress and timing. Click through for the full fault breakdown."
        actions={
          <ArcadeButton onClick={load}>
            <RefreshCw size={15} /> Refresh
          </ArcadeButton>
        }
      />

      {submissions.length > 0 && (
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <Filter size={14} className="text-[var(--muted)]" />
          {verdicts.map((v) => (
            <button
              key={v}
              onClick={() => setFilter(v)}
              className={cn(
                "rounded-xl border px-3 py-1.5 text-[11px] font-black tracking-wider transition",
                filter === v
                  ? "border-teal-300/40 bg-teal-400/10 text-teal-300"
                  : "border-[var(--line)] text-[var(--muted)] hover:text-[var(--text)]"
              )}
            >
              {v}
            </button>
          ))}
        </div>
      )}

      {message && (
        <div className="mb-5 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300">
          {message}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          title="No submissions yet"
          hint="Solve a problem to see your first verdict here."
        />
      ) : (
        <SubmissionTable submissions={visible} />
      )}
    </main>
  );
}
