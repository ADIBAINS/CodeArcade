"use client";

import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { VerdictBadge } from "../../../components/VerdictBadge";
import { apiRequest } from "../../../lib/api";

type SubmissionDetail = {
  id: string;
  language: string;
  sourceCode: string;
  status: string;
  verdict?: string | null;
  passedTests: number;
  totalTests: number;
  executionTimeMs?: number | null;
  errorMessage?: string | null;
  failedTestInput?: string | null;
  expectedOutput?: string | null;
  actualOutput?: string | null;
  createdAt: string;
  problem: {
    title: string;
    slug: string;
    difficulty: string;
  };
};

export default function SubmissionDetailPage() {
  const params = useParams<{ id: string }>();
  const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
  const [message, setMessage] = useState("");

  async function load() {
    setMessage("");
    try {
      setSubmission(await apiRequest<SubmissionDetail>(`/api/submissions/${params.id}`));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load submission");
    }
  }

  useEffect(() => {
    load();
  }, [params.id]);

  if (!submission) {
    return (
      <main className="container">
        <div className={message ? "message error" : "message"}>{message || "Loading submission..."}</div>
      </main>
    );
  }

  return (
    <main className="container">
      <div className="page-head">
        <div>
          <h1 className="page-title">{submission.problem.title}</h1>
          <p className="muted">
            {submission.language} submission from {new Date(submission.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="toolbar">
          <Link className="btn" href="/submissions">
            <ArrowLeft size={16} /> Back
          </Link>
          <button className="btn" onClick={load}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      {message && <div className="message error">{message}</div>}

      <section className="grid">
        <div className="card">
          <h3>Verdict</h3>
          <VerdictBadge verdict={submission.verdict} status={submission.status} />
        </div>
        <div className="card">
          <h3>Tests</h3>
          <p>
            {submission.passedTests}/{submission.totalTests}
          </p>
        </div>
        <div className="card">
          <h3>Execution Time</h3>
          <p>{submission.executionTimeMs ?? "-"} ms</p>
        </div>
      </section>

      <section className="stack" style={{ marginTop: 16 }}>
        {submission.errorMessage && (
          <div className="card">
            <h3>Fault</h3>
            <pre>{submission.errorMessage}</pre>
          </div>
        )}

        {submission.failedTestInput && (
          <div className="card">
            <h3>Input Values</h3>
            <pre>{submission.failedTestInput}</pre>
          </div>
        )}

        {(submission.expectedOutput || submission.actualOutput) && (
          <div className="grid">
            <div className="card">
              <h3>Expected Output</h3>
              <pre>{submission.expectedOutput ?? ""}</pre>
            </div>
            <div className="card">
              <h3>Your Output</h3>
              <pre>{submission.actualOutput ?? ""}</pre>
            </div>
          </div>
        )}

        <div className="card">
          <h3>Submitted Code</h3>
          <pre>{submission.sourceCode}</pre>
        </div>
      </section>
    </main>
  );
}

