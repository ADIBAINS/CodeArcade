"use client";

import Link from "next/link";
import { Plus, RefreshCw, Save } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { SubmissionRow, SubmissionTable } from "../../../components/SubmissionTable";
import { ArcadeButton, ArcadeLink } from "../../../components/ui/ArcadeButton";
import { PageHead } from "../../../components/ui/PageHead";
import { apiRequest } from "../../../lib/api";
import { cn } from "../../../lib/cn";

type Problem = { id: string; title: string; slug: string; difficulty: string };

const inputCls =
  "w-full rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)] px-3.5 py-2.5 text-sm text-[var(--text)] outline-none placeholder:text-[var(--muted)] focus:border-teal-300/60";

export default function AdminProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [problemId, setProblemId] = useState("");
  const [input, setInput] = useState("");
  const [expected, setExpected] = useState("");
  const [isHidden, setIsHidden] = useState(true);
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState(false);

  async function loadProblems() {
    const next = await apiRequest<Problem[]>("/api/problems");
    setProblems(next);
    setProblemId((current) => current || next[0]?.id || "");
  }

  async function loadSubmissions(selectedProblemId = problemId) {
    if (!selectedProblemId) return;
    setSubmissions(await apiRequest<SubmissionRow[]>(`/api/problems/${selectedProblemId}/submissions`));
  }

  async function addTestCase(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    setOk(false);
    try {
      await apiRequest(`/api/problems/${problemId}/testcases`, {
        method: "POST",
        body: JSON.stringify({ input, expected, isHidden }),
      });
      setInput("");
      setExpected("");
      setMessage("Test case added.");
      setOk(true);
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
    <main className="mx-auto w-[min(1180px,calc(100%-32px))] py-8 pb-16">
      <PageHead
        eyebrow="Admin"
        title="Manage problems"
        description="Create problems, attach test cases, and inspect every submission per problem."
        actions={
          <ArcadeLink variant="primary" href="/admin/problems/new">
            <Plus size={15} /> New problem
          </ArcadeLink>
        }
      />
      {message && (
        <div className={cn("mb-5 rounded-xl border px-4 py-3 text-sm font-bold", ok ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-300" : "border-red-400/30 bg-red-500/10 text-red-300")}>
          {message}
        </div>
      )}
      <section className="grid items-start gap-4 lg:grid-cols-[380px_1fr]">
        <form onSubmit={addTestCase} className="glass grid gap-4 rounded-2xl p-5">
          <h3 className="text-lg font-black text-[var(--text-strong)]">Add test case</h3>
          <label className="grid gap-1.5">
            <span className="text-xs font-black uppercase tracking-widest text-[var(--muted)]">Problem</span>
            <select className={inputCls} value={problemId} onChange={(e) => setProblemId(e.target.value)}>
              {problems.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5">
            <span className="text-xs font-black uppercase tracking-widest text-[var(--muted)]">Arguments (JSON)</span>
            <textarea className={`${inputCls} min-h-[96px] font-mono`} value={input} onChange={(e) => setInput(e.target.value)} placeholder='[2, 3] or [[1, 8, 2]]' />
          </label>
          <label className="grid gap-1.5">
            <span className="text-xs font-black uppercase tracking-widest text-[var(--muted)]">Expected return</span>
            <textarea className={`${inputCls} min-h-[80px] font-mono`} value={expected} onChange={(e) => setExpected(e.target.value)} />
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-[var(--muted)]">
            <input type="checkbox" checked={isHidden} onChange={(e) => setIsHidden(e.target.checked)} className="h-4 w-4 accent-teal-400" />
            Hidden test case
          </label>
          <ArcadeButton variant="primary" disabled={!problemId}>
            <Save size={15} /> Save test case
          </ArcadeButton>
        </form>
        <div className="grid gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-[var(--muted)]">{submissions.length} submissions</span>
            <ArcadeButton onClick={() => loadSubmissions()} className="ml-auto !min-h-[36px] text-xs">
              <RefreshCw size={14} /> Refresh
            </ArcadeButton>
          </div>
          <SubmissionTable submissions={submissions} />
        </div>
      </section>
    </main>
  );
}
