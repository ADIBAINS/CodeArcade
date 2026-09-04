"use client";

import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { LeaderboardRow, LeaderboardTable } from "../../components/LeaderboardTable";
import { ArcadeButton } from "../../components/ui/ArcadeButton";
import { CardSkeleton, EmptyState, PageHead } from "../../components/ui/PageHead";
import { apiRequest } from "../../lib/api";

export default function LeaderboardPage() {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setMessage("");
    setLoading(true);
    try {
      setRows(await apiRequest<LeaderboardRow[]>("/api/leaderboard"));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="mx-auto w-[min(1180px,calc(100%-32px))] py-8 pb-16">
      <PageHead
        eyebrow="Arcade ranks"
        title="Leaderboard"
        description="Ranked by score, then solved count, then fewer submissions. Podium updates live as verdicts land."
        actions={
          <ArcadeButton onClick={load}>
            <RefreshCw size={15} /> Refresh
          </ArcadeButton>
        }
      />
      {message && (
        <div className="mb-5 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300">
          {message}
        </div>
      )}
      {loading ? (
        <div className="grid gap-3 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState title="No rankings yet" hint="Be the first to solve a problem and claim rank #1." />
      ) : (
        <LeaderboardTable rows={rows} />
      )}
    </main>
  );
}
