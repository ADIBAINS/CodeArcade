"use client";

import { Check, Eye, RefreshCw, X } from "lucide-react";
import { useEffect, useState } from "react";
import { ArcadeButton } from "../../../components/ui/ArcadeButton";
import { EmptyState, PageHead } from "../../../components/ui/PageHead";
import { apiRequest } from "../../../lib/api";
import { cn } from "../../../lib/cn";

type AdminRequest = {
  id: string;
  title: string;
  statement: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  difficulty: string;
  status: string;
  adminNotes: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string };
  reviewedBy: { id: string; name: string } | null;
};

const STATUS_STYLE: Record<string, string> = {
  PENDING: "border-sky-300/30 bg-sky-400/10 text-sky-300",
  IN_REVIEW: "border-amber-300/30 bg-amber-400/10 text-amber-300",
  APPROVED: "border-emerald-300/30 bg-emerald-400/10 text-emerald-300",
  REJECTED: "border-red-400/30 bg-red-500/10 text-red-300",
};

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [filter, setFilter] = useState("");
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState(false);
  const [selected, setSelected] = useState<AdminRequest | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setMessage("");
    try {
      const url = filter ? `/api/requests/admin/all?status=${filter}` : "/api/requests/admin/all";
      setRequests(await apiRequest<AdminRequest[]>(url));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load requests");
    }
  }

  function note(msg: string, good: boolean) {
    setMessage(msg);
    setOk(good);
  }

  async function approve(id: string) {
    setLoading(true);
    try {
      await apiRequest(`/api/requests/admin/${id}/approve`, { method: "POST" });
      note("Request approved and problem created!", true);
      setSelected(null);
      load();
    } catch (error) {
      note(error instanceof Error ? error.message : "Failed to approve", false);
    } finally {
      setLoading(false);
    }
  }

  async function reject(id: string) {
    if (!rejectNotes.trim()) {
      note("Please provide a reason for rejection", false);
      return;
    }
    setLoading(true);
    try {
      await apiRequest(`/api/requests/admin/${id}/reject`, {
        method: "POST",
        body: JSON.stringify({ adminNotes: rejectNotes }),
      });
      note("Request rejected.", true);
      setShowRejectModal(null);
      setRejectNotes("");
      setSelected(null);
      load();
    } catch (error) {
      note(error instanceof Error ? error.message : "Failed to reject", false);
    } finally {
      setLoading(false);
    }
  }

  async function markInReview(id: string) {
    setLoading(true);
    try {
      await apiRequest(`/api/requests/admin/${id}/in-review`, { method: "POST" });
      note("Request marked as In Review.", true);
      load();
    } catch (error) {
      note(error instanceof Error ? error.message : "Failed to update", false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [filter]);

  return (
    <main className="mx-auto w-[min(1280px,calc(100%-32px))] py-8 pb-16">
      <PageHead
        eyebrow="Admin"
        title="Review requests"
        description="Approve to auto-create the problem, or reject with feedback visible to the author."
        actions={
          <ArcadeButton onClick={load}>
            <RefreshCw size={15} /> Refresh
          </ArcadeButton>
        }
      />
      {message && (
        <div className={cn("mb-5 rounded-xl border px-4 py-3 text-sm font-bold", ok ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-300" : "border-red-400/30 bg-red-500/10 text-red-300")}>
          {message}
        </div>
      )}
      <div className="mb-4 flex flex-wrap gap-2">
        {["", "PENDING", "IN_REVIEW", "APPROVED", "REJECTED"].map((f) => (
          <button
            key={f || "ALL"}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-xl border px-3.5 py-1.5 text-[11px] font-black tracking-wider transition",
              filter === f ? "border-teal-300/40 bg-teal-400/10 text-teal-300" : "border-[var(--line)] text-[var(--muted)] hover:text-[var(--text)]"
            )}
          >
            {f || "ALL"}
          </button>
        ))}
      </div>
      {requests.length === 0 ? (
        <EmptyState title="No requests found" hint="Try a different filter." />
      ) : (
        <section className="grid items-start gap-4 xl:grid-cols-[1fr_420px]">
          <div className="glass overflow-x-auto rounded-2xl">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--line)] text-left text-[11px] font-black uppercase tracking-widest text-[var(--muted)]">
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">By</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id} className={cn("border-b border-[var(--line)]/60 last:border-0 hover:bg-[var(--surface-soft)]/60", selected?.id === req.id && "bg-teal-400/[0.06]")}>
                    <td className="max-w-[240px] truncate px-4 py-3 font-bold text-[var(--text-strong)]">{req.title}</td>
                    <td className="px-4 py-3 text-[var(--muted)]">{req.user.name}</td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-[11px] font-black", STATUS_STYLE[req.status])}>{req.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => setSelected(req)} title="View" className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--line)] text-[var(--muted)] hover:text-teal-300">
                          <Eye size={14} />
                        </button>
                        {req.status === "PENDING" && (
                          <>
                            <button onClick={() => approve(req.id)} disabled={loading} title="Approve" className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-300/30 text-emerald-300 hover:bg-emerald-400/10">
                              <Check size={14} />
                            </button>
                            <button onClick={() => setShowRejectModal(req.id)} disabled={loading} title="Reject" className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-400/30 text-red-300 hover:bg-red-500/10">
                              <X size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {selected ? (
            <div className="glass grid gap-3 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-lg font-black text-[var(--text-strong)]">{selected.title}</h3>
                <span className={cn("rounded-full border px-2.5 py-1 text-[11px] font-black", STATUS_STYLE[selected.status])}>{selected.status}</span>
              </div>
              <p className="text-xs font-bold text-[var(--muted)]">By {selected.user.name} · {selected.user.email}</p>
              {(
                [
                  ["Statement", selected.statement],
                  ["Input", selected.inputFormat],
                  ["Output", selected.outputFormat],
                  ["Constraints", selected.constraints],
                ] as const
              ).map(([l, b]) => (
                <div key={l}>
                  <p className="mb-1 font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[var(--muted)]">{l}</p>
                  <pre className="m-0 max-h-40 overflow-y-auto">{b}</pre>
                </div>
              ))}
              {selected.status !== "APPROVED" && selected.status !== "REJECTED" && (
                <div className="flex flex-wrap gap-2">
                  {selected.status === "PENDING" && (
                    <ArcadeButton onClick={() => markInReview(selected.id)} disabled={loading} className="!min-h-[36px] text-xs">
                      Mark in review
                    </ArcadeButton>
                  )}
                  <ArcadeButton variant="primary" onClick={() => approve(selected.id)} disabled={loading} className="!min-h-[36px] text-xs">
                    <Check size={14} /> Approve
                  </ArcadeButton>
                  <ArcadeButton variant="danger" onClick={() => setShowRejectModal(selected.id)} disabled={loading} className="!min-h-[36px] text-xs">
                    <X size={14} /> Reject
                  </ArcadeButton>
                </div>
              )}
            </div>
          ) : (
            <div className="glass rounded-2xl p-8 text-center text-sm text-[var(--muted)]">
              Select a request to preview its full content.
            </div>
          )}
        </section>
      )}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setShowRejectModal(null)}>
          <div className="glass w-full max-w-md rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-black text-[var(--text-strong)]">Reject request</h3>
            <p className="mt-1 text-sm text-[var(--muted)]">This feedback is visible to the author.</p>
            <textarea
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              placeholder="Explain why…"
              className="mt-4 min-h-[110px] w-full rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)] p-3 text-sm outline-none focus:border-red-400/50"
            />
            <div className="mt-4 flex gap-2">
              <ArcadeButton variant="danger" onClick={() => reject(showRejectModal)} disabled={loading} className="flex-1">
                Confirm rejection
              </ArcadeButton>
              <ArcadeButton onClick={() => { setShowRejectModal(null); setRejectNotes(""); }} className="flex-1">
                Cancel
              </ArcadeButton>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
