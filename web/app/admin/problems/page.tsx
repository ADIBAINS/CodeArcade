"use client";

import Link from "next/link";
import { Plus, RefreshCw, Save } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { SubmissionRow, SubmissionTable } from "../../../components/SubmissionTable";
import { ArcadeButton, ArcadeLink } from "../../../components/ui/ArcadeButton";
import { PageHead } from "../../../components/ui/PageHead";
import { Pager } from "../../../components/ui/Pager";
import { EMPTY_META, apiList, apiPage, apiRequest, type PageMeta } from "../../../lib/api";
import { cn } from "../../../lib/cn";

type Problem = { id: string; title: string; slug: string; difficulty: string };

const inputCls =
  "w-full rounded-lg border border-[var(--line-strong)] bg-[var(--bg-elevated)] px-3 py-2.5 text-sm text-[var(--text-strong)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--accent)]";
const labelCls = "text-[13px] font-medium text-[var(--text-strong)]";

export default function AdminProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [problemId, setProblemId] = useState("");
  const [input, setInput] = useState("");
  const [expected, setExpected] = useState("");
  const [isHidden, setIsHidden] = useState(true);
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [subPage, setSubPage] = useState(1);
  const [subMeta, setSubMeta] = useState<PageMeta>(EMPTY_META);
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState(false);

  async function loadProblems() {
    const next = await apiPage<Problem>("/api/problems?limit=100");
    setProblems(next);
    setProblemId((current) => current || next[0]?.id || "");
  }

  async function loadSubmissions(selectedProblemId = problemId, nextPage = subPage) {
    if (!selectedProblemId) return;
    const { items, meta } = await apiList<SubmissionRow>(
      `/api/problems/${selectedProblemId}/submissions?page=${nextPage}&limit=20`,
      {},
      nextPage,
      20
    );
    setSubmissions(items);
    setSubMeta(meta);
    setSubPage(meta.page);
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
    loadSubmissions(problemId, 1).catch(() => undefined);
  }, [problemId]);

  return (
    <main className="mx-auto w-[min(1180px,calc(100%-32px))] py-8 pb-16">
      <PageHead
        eyebrow="Admin"
        title="Problems"
        description="Create problems, attach test cases, and inspect submissions."
        actions={
          <ArcadeLink variant="primary" href="/admin/problems/new">
            <Plus size={14} /> New problem
          </ArcadeLink>
        }
      />
      {message && (
        <div className={cn("mb-4 rounded-lg px-4 py-2.5 text-sm font-medium", ok ? "bg-[var(--success-soft)] text-[var(--success)]" : "bg-[var(--danger-soft)] text-[var(--danger)]")}>
          {message}
        </div>
      )}
      <section className="grid items-start gap-4 lg:grid-cols-[360px_1fr]">
        <form onSubmit={addTestCase} className="grid gap-3.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5">
          <h3 className="text-[15px] font-semibold text-[var(--text-strong)]">Add test case</h3>
          <label className="grid gap-1.5">
            <span className={labelCls}>Problem</span>
            <select className={inputCls} value={problemId} onChange={(e) => setProblemId(e.target.value)}>
              {problems.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5">
            <span className={labelCls}>Arguments (JSON)</span>
            <textarea className={cn(inputCls, "min-h-[90px] font-mono")} value={input} onChange={(e) => setInput(e.target.value)} placeholder="[2, 3]" />
          </label>
          <label className="grid gap-1.5">
            <span className={labelCls}>Expected return</span>
            <textarea className={cn(inputCls, "min-h-[72px] font-mono")} value={expected} onChange={(e) => setExpected(e.target.value)} />
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--muted)]">
            <input type="checkbox" checked={isHidden} onChange={(e) => setIsHidden(e.target.checked)} className="h-4 w-4 accent-[#ffa116]" />
            Hidden test case
          </label>
          <ArcadeButton variant="primary" disabled={!problemId}>
            <Save size={14} /> Save test case
          </ArcadeButton>
        </form>
        <div className="grid gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[12px] text-[var(--muted)]">{subMeta.total} submissions</span>
            <ArcadeButton onClick={() => loadSubmissions(problemId, subPage)} className="ml-auto !min-h-[34px] text-[13px]">
              <RefreshCw size={13} /> Refresh
            </ArcadeButton>
          </div>
          <SubmissionTable submissions={submissions} />
          <Pager meta={subMeta} onPage={(p) => loadSubmissions(problemId, p)} />
        </div>
      </section>
    </main>
  );
}
