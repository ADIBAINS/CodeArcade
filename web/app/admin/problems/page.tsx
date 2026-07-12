"use client";

import Link from "next/link";
import { Plus, RefreshCw, Save } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { SubmissionRow, SubmissionTable } from "../../../components/SubmissionTable";
import { apiRequest } from "../../../lib/api";

type Problem = {
  id: string;
  title: string;
  slug: string;
  difficulty: string;
};

export default function AdminProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [problemId, setProblemId] = useState("");
  const [input, setInput] = useState("");
  const [expected, setExpected] = useState("");
  const [isHidden, setIsHidden] = useState(true);
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [message, setMessage] = useState("");

  async function loadProblems() {
    const next = await apiRequest<Problem[]>("/api/problems");
    setProblems(next);
    setProblemId((current) => current || next[0]?.id || "");
  }

  async function loadSubmissions(selectedProblemId = problemId) {
    if (!selectedProblemId) {
      return;
    }
    setSubmissions(await apiRequest<SubmissionRow[]>(`/api/problems/${selectedProblemId}/submissions`));
  }

  async function addTestCase(event: FormEvent) {
    event.preventDefault();
    setMessage("");

    try {
      await apiRequest(`/api/problems/${problemId}/testcases`, {
        method: "POST",
        body: JSON.stringify({ input, expected, isHidden })
      });
      setInput("");
      setExpected("");
      setMessage("Test case added.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to add test case");
    }
  }

  useEffect(() => {
    loadProblems().catch((error) => setMessage(error instanceof Error ? error.message : "Failed to load problems"));
  }, []);

  useEffect(() => {
    loadSubmissions(problemId).catch(() => undefined);
  }, [problemId]);

  return (
    <main className="container">
      <div className="page-head">
        <div>
          <h1 className="page-title">Admin Problems</h1>
          <p className="muted">Create problems, add test cases, and inspect submissions.</p>
        </div>
        <Link className="btn primary" href="/admin/problems/new">
          <Plus size={16} /> New Problem
        </Link>
      </div>
      {message && <div className={message.includes("added") ? "message" : "message error"}>{message}</div>}
      <section className="split">
        <form className="card stack" onSubmit={addTestCase}>
          <h3>Add Test Case</h3>
          <div className="field">
            <label>Problem</label>
            <select className="select" value={problemId} onChange={(event) => setProblemId(event.target.value)}>
              {problems.map((problem) => (
                <option key={problem.id} value={problem.id}>
                  {problem.title}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Input</label>
            <textarea className="textarea" value={input} onChange={(event) => setInput(event.target.value)} />
          </div>
          <div className="field">
            <label>Expected Output</label>
            <textarea className="textarea" value={expected} onChange={(event) => setExpected(event.target.value)} />
          </div>
          <label className="toolbar">
            <input type="checkbox" checked={isHidden} onChange={(event) => setIsHidden(event.target.checked)} />
            Hidden
          </label>
          <button className="btn primary" disabled={!problemId}>
            <Save size={16} /> Save Test Case
          </button>
        </form>
        <div className="stack">
          <div className="toolbar">
            <button className="btn" onClick={() => loadSubmissions()}>
              <RefreshCw size={16} /> Refresh Submissions
            </button>
          </div>
          <SubmissionTable submissions={submissions} />
        </div>
      </section>
    </main>
  );
}
