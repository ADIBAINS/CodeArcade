"use client";

import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { LeaderboardRow, LeaderboardTable } from "../../components/LeaderboardTable";
import { apiRequest } from "../../lib/api";

export default function LeaderboardPage() {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [message, setMessage] = useState("");

  async function load() {
    setMessage("");
    try {
      setRows(await apiRequest<LeaderboardRow[]>("/api/leaderboard"));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load leaderboard");
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="container">
      <div className="page-head">
        <div>
          <h1 className="page-title">Leaderboard</h1>
          <p className="muted">Ranked by score, solved count, then fewer submissions.</p>
        </div>
        <button className="btn" onClick={load}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>
      {message && <div className="message error">{message}</div>}
      <LeaderboardTable rows={rows} />
    </main>
  );
}

