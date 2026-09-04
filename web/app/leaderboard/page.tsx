"use client";

import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { LeaderboardRow, LeaderboardTable } from "../../components/LeaderboardTable";
import { ArcadeButton } from "../../components/ui/ArcadeButton";
import { CardSkeleton, EmptyState, PageHead } from "../../components/ui/PageHead";
import { Pager } from "../../components/ui/Pager";
import { EMPTY_META, apiList, type PageMeta } from "../../lib/api";

export default function LeaderboardPage() {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PageMeta>(EMPTY_META);

  async function load(nextPage = page) {
    setMessage("");
    setLoading(true);
    try {
      const { items, meta } = await apiList<LeaderboardRow>(`/api/leaderboard?page=${nextPage}&limit=20`, {}, nextPage, 20);
      setRows(items);
      setMeta(meta);
      setPage(meta.page);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(1);
  }, []);

  return (
    <main className="mx-auto w-[min(900px,calc(100%-32px))] py-8 pb-16">
      <PageHead
        eyebrow="Rankings"
        title="Leaderboard"
        description="Ranked by score, then solved count, then fewer submissions."
        actions={
          <ArcadeButton onClick={() => load(page)}>
            <RefreshCw size={14} /> Refresh
          </ArcadeButton>
        }
      />
      {message && (
        <div className="mb-4 rounded-lg bg-[var(--danger-soft)] px-4 py-2.5 text-sm font-medium text-[var(--danger)]">
          {message}
        </div>
      )}
      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState title="No rankings yet" hint="Be the first to solve a problem and claim rank #1." />
      ) : (
        <LeaderboardTable rows={rows} offset={(meta.page - 1) * meta.limit} />
      )}
      {!loading && rows.length > 0 && <Pager meta={meta} onPage={load} />}
    </main>
  );
}
