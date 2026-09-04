"use client";

import Link from "next/link";
import { ChevronRight, Inbox, Plus, Send } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { DifficultyBadge } from "../../components/DifficultyBadge";
import { ArcadeButton } from "../../components/ui/ArcadeButton";
import { Pager } from "../../components/ui/Pager";
import { EMPTY_META, apiList, apiRequest, type PageMeta } from "../../lib/api";
import { cn } from "../../lib/cn";
import { timeAgo } from "../../lib/time";

type Request = {
  id: string;
  title: string;
  difficulty: string;
  status: string;
  adminNotes: string | null;
  createdAt: string;
};

const STATUS_DOT: Record<string, string> = {
  PENDING: "bg-[var(--info)]",
  IN_REVIEW: "bg-[var(--warning)]",
  APPROVED: "bg-[var(--success)]",
  REJECTED: "bg-[var(--danger)]",
};

const FILTERS = ["ALL", "PENDING", "IN_REVIEW", "APPROVED", "REJECTED"] as const;

const inputCls =
  "w-full rounded-lg border border-[var(--line-strong)] bg-[var(--bg-elevated)] px-3 py-2.5 text-sm text-[var(--text-strong)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--accent)]";
const labelCls = "text-[13px] font-medium text-[var(--text-strong)]";

export default function RequestsPage() {
  const [form, setForm] = useState({
    title: "",
    statement: "",
    inputFormat: "",
    outputFormat: "",
    constraints: "",
    difficulty: "EASY",
  });
  const [requests, setRequests] = useState<Request[]>([]);
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("ALL");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PageMeta>(EMPTY_META);

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function loadRequests(nextPage = page) {
    try {
      const { items, meta } = await apiList<Request>(`/api/requests/mine?page=${nextPage}&limit=20`, {}, nextPage, 20);
      setRequests(items);
      setMeta(meta);
      setPage(meta.page);
    } catch {
      // silent — guests just see the form
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setOk(false);
    try {
      await apiRequest("/api/requests", { method: "POST", body: JSON.stringify(form) });
      setMessage("Request submitted. Admins will review it soon.");
      setOk(true);
      setForm({ title: "", statement: "", inputFormat: "", outputFormat: "", constraints: "", difficulty: "EASY" });
      setShowForm(false);
      loadRequests(1);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Submission failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests(1);
  }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: meta.total };
    for (const r of requests) c[r.status] = (c[r.status] ?? 0) + 1;
    return c;
  }, [requests, meta.total]);

  const visible = filter === "ALL" ? requests : requests.filter((r) => r.status === filter);

  return (
    <main className="mx-auto w-[min(860px,calc(100%-32px))] py-8 pb-16">
      <div className="flex items-center justify-between gap-3">
        <h1 className="truncate text-2xl font-bold tracking-tight text-[var(--text-strong)]">
          Problem requests
        </h1>
        <ArcadeButton
          variant={showForm ? "ghost" : "primary"}
          onClick={() => setShowForm(!showForm)}
          className="shrink-0"
        >
          {showForm ? <Plus size={14} className="rotate-45" /> : <Send size={14} />}
          {showForm ? "Close" : "New request"}
        </ArcadeButton>
      </div>
      <p className="mt-1.5 text-sm text-[var(--muted)]">
        Suggest a problem. Approved requests become real problems — rejected ones come back with feedback.
      </p>

      {message && (
        <div className={cn("mt-4 rounded-lg px-4 py-2.5 text-sm font-medium", ok ? "bg-[var(--success-soft)] text-[var(--success)]" : "bg-[var(--danger-soft)] text-[var(--danger)]")}>
          {message}
        </div>
      )}

      {showForm && (
        <form onSubmit={submit} className="mt-5 rounded-lg border border-[var(--line)] bg-[var(--surface)]">
          <div className="border-b border-[var(--line)] px-5 py-3.5">
            <h2 className="text-[15px] font-semibold text-[var(--text-strong)]">Suggest a problem</h2>
            <p className="mt-0.5 text-[13px] text-[var(--muted)]">Write it like a problem statement — admins handle test cases.</p>
          </div>
          <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
            <label className="grid min-w-0 content-start gap-1.5">
              <span className={labelCls}>Title <span className="font-normal text-[var(--muted)]">(min 3)</span></span>
              <input required minLength={3} maxLength={120} className={inputCls} value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g. Two Sum" />
            </label>
            <label className="grid content-start gap-1.5">
              <span className={labelCls}>Difficulty</span>
              <select className={inputCls} value={form.difficulty} onChange={(e) => update("difficulty", e.target.value)}>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </label>
            <label className="grid content-start gap-1.5">
              <span className={labelCls}>Problem statement <span className="font-normal text-[var(--muted)]">(min 20)</span></span>
              <textarea required minLength={20} className={cn(inputCls, "min-h-[110px]")} value={form.statement} onChange={(e) => update("statement", e.target.value)} placeholder="Given an array of integers…" />
            </label>
            <label className="grid content-start gap-1.5">
              <span className={labelCls}>Input format <span className="font-normal text-[var(--muted)]">(min 5)</span></span>
              <textarea required minLength={5} className={cn(inputCls, "min-h-[110px]")} value={form.inputFormat} onChange={(e) => update("inputFormat", e.target.value)} placeholder="First line: n…" />
            </label>
            <label className="grid content-start gap-1.5">
              <span className={labelCls}>Output format <span className="font-normal text-[var(--muted)]">(min 5)</span></span>
              <textarea required minLength={5} className={cn(inputCls, "min-h-[110px]")} value={form.outputFormat} onChange={(e) => update("outputFormat", e.target.value)} placeholder="Print the answer…" />
            </label>
            <label className="grid content-start gap-1.5">
              <span className={labelCls}>Constraints <span className="font-normal text-[var(--muted)]">(min 5)</span></span>
              <textarea required minLength={5} className={cn(inputCls, "min-h-[110px] font-mono")} value={form.constraints} onChange={(e) => update("constraints", e.target.value)} placeholder="1 <= n <= 10^5" />
            </label>
            <div className="sm:col-span-2 lg:col-span-3">
              <ArcadeButton variant="primary" disabled={loading}>
                <Send size={14} /> {loading ? "Submitting…" : "Submit request"}
              </ArcadeButton>
            </div>
          </div>
        </form>
      )}

      {/* Underline tab bar */}
      {requests.length > 0 && (
        <div className="mt-7 flex gap-5 overflow-x-auto border-b border-[var(--line)]">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "relative shrink-0 whitespace-nowrap pb-2.5 text-[13px] font-semibold transition",
                filter === f ? "text-[var(--text-strong)]" : "text-[var(--muted)] hover:text-[var(--text-strong)]"
              )}
            >
              {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase().replace("_", " ")}
              <span className="ml-1.5 font-mono text-[12px] opacity-70">{counts[f] ?? 0}</span>
              {filter === f && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-[var(--accent)]" />}
            </button>
          ))}
        </div>
      )}

      {/* Horizontal card grid — each card stacks its components per line */}
      {visible.length > 0 && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {visible.map((req) => (
            <Link
              key={req.id}
              href={`/requests/${req.id}`}
              className="group flex min-w-0 flex-col gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-4 py-3.5 transition hover:border-[var(--line-strong)] hover:bg-[var(--surface-soft)]"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span className={cn("h-2 w-2 shrink-0 rounded-full", STATUS_DOT[req.status] ?? "bg-[var(--line-strong)]")} />
                <p className="truncate text-[14px] font-medium text-[var(--text-strong)] group-hover:text-[var(--accent)]">
                  {req.title}
                </p>
              </div>
              <p className="text-[12px] text-[var(--muted)]">
                {req.status.charAt(0) + req.status.slice(1).toLowerCase().replace("_", " ")} · {timeAgo(req.createdAt)}
              </p>
              <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                <DifficultyBadge difficulty={req.difficulty} />
                <ChevronRight size={16} className="shrink-0 text-[var(--muted)] transition group-hover:translate-x-0.5 group-hover:text-[var(--accent)]" />
              </div>
            </Link>
          ))}
        </div>
      )}
      {visible.length > 0 && <Pager meta={meta} onPage={loadRequests} />}
      {visible.length === 0 && (
        !showForm && (
          <div className="mt-6 rounded-lg border border-dashed border-[var(--line-strong)] px-6 py-14 text-center">
            <Inbox size={28} className="mx-auto text-[var(--muted)]" strokeWidth={1.5} />
            <p className="mt-3 text-[15px] font-semibold text-[var(--text-strong)]">
              {requests.length === 0 ? "No requests yet" : "Nothing with this status"}
            </p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-[var(--muted)]">
              {requests.length === 0
                ? "Suggest the first problem — good requests get approved fast."
                : "Try a different status tab above."}
            </p>
            {requests.length === 0 && (
              <ArcadeButton variant="primary" onClick={() => setShowForm(true)} className="mt-5">
                <Send size={14} /> New request
              </ArcadeButton>
            )}
          </div>
        )
      )}
    </main>
  );
}
