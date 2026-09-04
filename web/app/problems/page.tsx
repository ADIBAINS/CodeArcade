"use client";

import Link from "next/link";
import { Plus, RefreshCw, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ProblemCard, ProblemSummary } from "../../components/ProblemCard";
import { ArcadeButton } from "../../components/ui/ArcadeButton";
import { CardSkeleton, EmptyState, PageHead } from "../../components/ui/PageHead";
import { apiRequest } from "../../lib/api";

type Filter = "ALL" | "EASY" | "MEDIUM" | "HARD";

export default function ProblemsPage() {
  const [problems, setProblems] = useState<ProblemSummary[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("ALL");

  async function load() {
    setMessage("");
    setLoading(true);
    try {
      setProblems(await apiRequest<ProblemSummary[]>("/api/problems"));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load problems");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return problems.filter((p) => {
      if (filter !== "ALL" && p.difficulty.toUpperCase() !== filter) return false;
      if (q && !p.title.toLowerCase().includes(q) && !p.slug.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [problems, query, filter]);

  const counts = useMemo(
    () => ({
      ALL: problems.length,
      EASY: problems.filter((p) => p.difficulty.toUpperCase() === "EASY").length,
      MEDIUM: problems.filter((p) => p.difficulty.toUpperCase() === "MEDIUM").length,
      HARD: problems.filter((p) => p.difficulty.toUpperCase() === "HARD").length,
    }),
    [problems]
  );

  return (
    <main className="mx-auto w-[min(1180px,calc(100%-32px))] py-8 pb-16">
      <PageHead
        eyebrow="Problem set"
        title="Choose your battle"
        description="Filter by difficulty, search the archive, and submit Java or C++ code for instant verdicts."
        actions={
          <>
            <Link
              href="/requests"
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 text-sm font-extrabold hover:bg-[var(--surface-soft)]"
            >
              <Plus size={15} /> Request
            </Link>
            <ArcadeButton onClick={load}>
              <RefreshCw size={15} /> Refresh
            </ArcadeButton>
          </>
        }
      />

      <div className="glass mb-6 flex flex-col gap-3 rounded-2xl p-4 lg:flex-row lg:items-center">
        <div className="flex min-h-[44px] flex-1 items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)] px-3 text-[var(--muted)]">
          <Search size={16} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search problems…"
            className="w-full bg-transparent text-sm text-[var(--text)] outline-none placeholder:text-[var(--muted)]"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(["ALL", "EASY", "MEDIUM", "HARD"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border px-3.5 text-xs font-black uppercase tracking-wider transition ${
                filter === f
                  ? "border-teal-300/40 bg-teal-400/10 text-teal-300"
                  : "border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              {f}
              <span className="opacity-70">{counts[f]}</span>
            </button>
          ))}
        </div>
      </div>

      {message && (
        <div className="mb-5 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300">
          {message}
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          title={problems.length === 0 ? "No problems yet" : "No matches"}
          hint={
            problems.length === 0
              ? "Ask an admin to seed problems, or request one and get it approved."
              : "Try a different search term or difficulty filter."
          }
        />
      ) : (
        <>
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
            Showing {visible.length} of {problems.length}
          </p>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((problem, i) => (
              <ProblemCard key={problem.id} problem={problem} index={i} />
            ))}
          </section>
        </>
      )}
    </main>
  );
}
