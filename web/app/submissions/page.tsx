"use client";

import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { SubmissionRow, SubmissionTable } from "../../components/SubmissionTable";
import { apiRequest } from "../../lib/api";

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [message, setMessage] = useState("");

  async function load() {
    setMessage("");
    try {
      setSubmissions(await apiRequest<SubmissionRow[]>("/api/users/me/submissions"));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load submissions");
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="container">
      <div className="page-head">
        <div>
          <h1 className="page-title">Submissions</h1>
          <p className="muted">Your submitted code and judge verdicts.</p>
        </div>
        <button className="btn" onClick={load}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>
      {message && <div className="message error">{message}</div>}
      <SubmissionTable submissions={submissions} />
    </main>
  );
}

