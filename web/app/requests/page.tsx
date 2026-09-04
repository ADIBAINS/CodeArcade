"use client";

import Link from "next/link";
import { Plus, Send } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { DifficultyBadge } from "../../components/DifficultyBadge";
import { ArcadeButton } from "../../components/ui/ArcadeButton";
import { EmptyState, PageHead } from "../../components/ui/PageHead";
import { apiRequest } from "../../lib/api";
import { cn } from "../../lib/cn";

type Request = {
  id: string;
  title: string;
  difficulty: string;
  status: string;
  adminNotes: string | null;
  createdAt: string;
};

const STATUS_STYLE: Record<string, string> = {
  PENDING: "border-sky-300/30 bg-sky-400/10 text-sky-300",
  IN_REVIEW: "border-amber-300/30 bg-amber-400/10 text-amber-300",
  APPROVED: "border-emerald-300/30 bg-emerald-400/10 text-emerald-300",
  REJECTED: "border-red-400/30 bg-red-500/10 text-red-300",
};

const inputCls =
  "w-full rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)] px-3.5 py-2.5 text-sm text-[var(--text)] outline-none placeholder:text-[var(--muted)] focus:border-teal-300/60";

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

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function loadRequests() {
    try {
      setRequests(await apiRequest<Request[]>("/api/requests/mine"));
    } catch {
      // silent — guests see the form only
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setOk(false);
    try {
      await apiRequest("/api/requests", { method: "POST", body: JSON.stringify(form) });
      setMessage("Request submitted! Admins will review it soon.");
      setOk(true);
      setForm({ title: "", statement: "", inputFormat: "", outputFormat: "", constraints: "", difficulty: "EASY" });
      setShowForm(false);
      loadRequests();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Submission failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  return (
    <main className="mx-auto w-[min(1180px,calc(100%-32px))] py-8 pb-16">
      <PageHead
        eyebrow="Community"
        title="Problem requests"
        description="Suggest new problems. Admins review, approve (auto-creates the problem), or reject with feedback."
        actions={
          <ArcadeButton variant="primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? <Plus size={15} className="rotate-45" /> : <Send size={15} />}
            {showForm ? "Cancel" : "New request"}
          </ArcadeButton>
        }
      />

      {message && (
        <div className={cn("mb-5 rounded-xl border px-4 py-3 text-sm font-bold", ok ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-300" : "border-red-400/30 bg-red-500/10 text-red-300")}>
          {message}
        </div>
      )}

      {showForm && (
        <form onSubmit={submit} className="glass mb-6 grid gap-4 rounded-2xl p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
            <label className="grid gap-1.5">
              <span className="text-xs font-black uppercase tracking-widest text-[var(--muted)]">Title</span>
              <input className={inputCls} value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g. Two Sum" />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-black uppercase tracking-widest text-[var(--muted)]">Difficulty</span>
              <select className={inputCls} value={form.difficulty} onChange={(e) => update("difficulty", e.target.value)}>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </label>
          </div>
          {(
            [
              ["statement", "Problem statement", "Describe the problem in detail…"],
              ["inputFormat", "Input format", "How the input is structured…"],
              ["outputFormat", "Output format", "What the output should look like…"],
              ["constraints", "Constraints", "e.g. 1 <= n <= 10^5"],
            ] as const
          ).map(([key, label, ph]) => (
            <label key={key} className="grid gap-1.5">
              <span className="text-xs font-black uppercase tracking-widest text-[var(--muted)]">{label}</span>
              <textarea className={`${inputCls} min-h-[96px]`} value={form[key]} onChange={(e) => update(key, e.target.value)} placeholder={ph} />
            </label>
          ))}
          <ArcadeButton variant="primary" disabled={loading} className="justify-self-start">
            <Send size={15} /> {loading ? "Submitting…" : "Submit request"}
          </ArcadeButton>
        </form>
      )}

      {requests.length > 0 ? (
        <div className="glass overflow-x-auto rounded-2xl">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--line)] text-left text-[11px] font-black uppercase tracking-widest text-[var(--muted)]">
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Difficulty</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3 text-right">Open</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id} className="border-b border-[var(--line)]/60 last:border-0 hover:bg-[var(--surface-soft)]/60">
                  <td className="px-4 py-3 font-bold text-[var(--text-strong)]">{req.title}</td>
                  <td className="px-4 py-3"><DifficultyBadge difficulty={req.difficulty} /></td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-[11px] font-black", STATUS_STYLE[req.status] ?? "border-[var(--line)]")}>{req.status}</span>
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">{new Date(req.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/requests/${req.id}`} className="inline-flex min-h-[34px] items-center rounded-lg border border-[var(--line)] px-3 text-xs font-extrabold hover:border-teal-300/40 hover:text-teal-300">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !showForm && <EmptyState title="No requests yet" hint="Click New request to suggest the first problem." />
      )}
    </main>
  );
}
