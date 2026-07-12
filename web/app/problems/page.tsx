"use client";

import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { ProblemCard, ProblemSummary } from "../../components/ProblemCard";
import { apiRequest } from "../../lib/api";

export default function ProblemsPage() {
  const [problems, setProblems] = useState<ProblemSummary[]>([]);
  const [message, setMessage] = useState("");

  async function load() {
    setMessage("");
    try {
      setProblems(await apiRequest<ProblemSummary[]>("/api/problems"));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load problems");
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="container">
      <div className="page-head">
        <div>
          <h1 className="page-title">Problems</h1>
          <p className="muted">Choose a problem and submit Java or C++ code.</p>
        </div>
        <button className="btn" onClick={load}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>
      {message && <div className="message error">{message}</div>}
      <section className="grid">
        {problems.map((problem) => (
          <ProblemCard key={problem.id} problem={problem} />
        ))}
      </section>
    </main>
  );
}

