"use client";

import { Check, Eye, RefreshCw, X } from "lucide-react";
import { useEffect, useState } from "react";
import { ArcadeButton } from "../../../components/ui/ArcadeButton";
import { EmptyState, PageHead } from "../../../components/ui/PageHead";
import { Pager } from "../../../components/ui/Pager";
import { EMPTY_META, apiList, apiRequest, type PageMeta } from "../../../lib/api";
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
  user: { id: string; name: string; email?: string };
  reviewedBy: { id: string; name: string } | null;
};

const STATUS_STYLE: Record<string, string> = {
  PENDING: "text-[var(--info)] bg-[var(--info-soft)]",
  IN_REVIEW: "text-[var(--warning)] bg-[var(--warning-soft)]",
  APPROVED: "text-[var(--success)] bg-[var(--success-soft)]",
  REJECTED: "text-[var(--danger)] bg-[var(--danger-soft)]",
};

const FILTERS = ["", "PENDING", "IN_REVIEW", "APPROVED", "REJECTED"];

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [filter, setFilter] = useState("");
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PageMeta>(EMPTY_META);

  async function load(nextPage = page) {
    setMessage("");
    try {
      const base = `/api/requests/admin/all?page=${nextPage}&limit=20`;
      const url = filter ? `${base}&status=${filter}` : base;
      const { items, meta } = await apiList<AdminRequest>(url, {}, nextPage, 20);
      setRequests(items);
      setMeta(meta);
      setPage(meta.page);
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
      note("Request approved and problem created.", true);
      setSelectedId(null);
      load(page);
    } catch (error) {
      note(error instanceof Error ? error.message : "Failed to approve", false);
    } finally {
      setLoading(false);
    }
  }

  async function reject(id: string) {
    if (!rejectNotes.trim()) {
      note("Please provide a reason for rejection.", false);
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
      setSelectedId(null);
      load(page);
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
      note("Marked as in review.", true);
      load(page);
    } catch (error) {
      note(error instanceof Error ? error.message : "Failed to update", false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setPage(1);
    load(1);
  }, [filter]);

  const selected = requests.find((r) => r.id === selectedId) ?? null;

  return (
    <main className="mx-auto w-[min(1180px,calc(100%-32px))] py-8 pb-16">
      <PageHead
        eyebrow="Admin"
        title="Review requests"
        description="Approve to auto-create the problem, or reject with feedback."
        actions={
          <ArcadeButton onClick={() => load(page)}>
            <RefreshCw size={14} /> Refresh
          </ArcadeButton>
        }
      />
      {message && (
        <div className={cn("mb-4 rounded-lg px-4 py-2.5 text-sm font-medium", ok ? "bg-[var(--success-soft)] text-[var(--success)]" : "bg-[var(--danger-soft)] text-[var(--danger)]")}>
          {message}
        </div>
      )}
      <div className="mb-4 -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5">
        {FILTERS.map((f) => (
          <button
            key={f || "ALL"}
            onClick={() => setFilter(f)}
            className={cn(
              "shrink-0 whitespace-nowrap rounded-md px-3 py-1.5 text-[12px] font-semibold transition",
              filter === f ? "bg-[var(--surface-soft)] text-[var(--text-strong)]" : "text-[var(--muted)] hover:text-[var(--text-strong)]"
            )}
          >
            {(f || "ALL").replace("_", " ")}
          </button>
        ))}
      </div>
      {requests.length === 0 ? (
        <EmptyState title="No requests found" hint="Try a different filter." />
      ) : (
        <section className="grid items-start gap-4 xl:grid-cols-[1fr_400px]">
          <div className="grid gap-0">
          <div className="overflow-x-auto rounded-lg border border-[var(--line)] bg-[var(--surface)]">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--line)] text-left text-[12px] font-medium text-[var(--muted)]">
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">By</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr
                    key={req.id}
                    onClick={() => setSelectedId(req.id)}
                    className={cn(
                      "cursor-pointer border-b border-[var(--line)] last:border-0 hover:bg-[var(--surface-soft)]",
                      selectedId === req.id && "bg-[var(--surface-soft)]"
                    )}
                  >
                    <td className="max-w-[240px] truncate px-4 py-3 font-medium text-[var(--text-strong)]">{req.title}</td>
                    <td className="px-4 py-3 text-[var(--muted)]">{req.user.name}</td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex rounded-md px-2 py-0.5 text-[12px] font-semibold", STATUS_STYLE[req.status] ?? "")}>
                        {req.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setSelectedId(req.id)} title="View" className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text-strong)]">
                          <Eye size={14} />
                        </button>
                        {req.status === "PENDING" && (
                          <>
                            <button onClick={() => approve(req.id)} disabled={loading} title="Approve" className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--success)] hover:bg-[var(--success-soft)]">
                              <Check size={14} />
                            </button>
                            <button onClick={() => setShowRejectModal(req.id)} disabled={loading} title="Reject" className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--danger)] hover:bg-[var(--danger-soft)]">
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
          <Pager meta={meta} onPage={load} />
          </div>
          {selected ? (
            <div className="grid gap-3 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-[15px] font-semibold text-[var(--text-strong)]">{selected.title}</h3>
                <span className={cn("rounded-md px-2 py-0.5 text-[12px] font-semibold", STATUS_STYLE[selected.status] ?? "")}>
                  {selected.status.replace("_", " ")}
                </span>
              </div>
              <p className="text-[13px] text-[var(--muted)]">By {selected.user.name}{selected.user.email ? ` · ${selected.user.email}` : ""}</p>
              {(
                [
                  ["Statement", selected.statement],
                  ["Input", selected.inputFormat],
                  ["Output", selected.outputFormat],
                  ["Constraints", selected.constraints],
                ] as const
              ).map(([l, b]) => (
                <div key={l}>
                  <p className="mb-1 text-[12px] font-semibold text-[var(--muted)]">{l}</p>
                  <pre className="m-0 max-h-40 overflow-y-auto">{b}</pre>
                </div>
              ))}
              {selected.status !== "APPROVED" && selected.status !== "REJECTED" && (
                <div className="flex flex-wrap gap-2">
                  {selected.status === "PENDING" && (
                    <ArcadeButton onClick={() => markInReview(selected.id)} disabled={loading} className="!min-h-[34px] text-[13px]">
                      Mark in review
                    </ArcadeButton>
                  )}
                  <ArcadeButton variant="primary" onClick={() => approve(selected.id)} disabled={loading} className="!min-h-[34px] text-[13px]">
                    <Check size={13} /> Approve
                  </ArcadeButton>
                  <ArcadeButton variant="danger" onClick={() => setShowRejectModal(selected.id)} disabled={loading} className="!min-h-[34px] text-[13px]">
                    <X size={13} /> Reject
                  </ArcadeButton>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-8 text-center text-sm text-[var(--muted)]">
              Select a request to preview it.
            </div>
          )}
        </section>
      )}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowRejectModal(null)}>
          <div className="w-full max-w-md rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-[15px] font-semibold text-[var(--text-strong)]">Reject request</h3>
            <p className="mt-1 text-sm text-[var(--muted)]">This feedback is visible to the author.</p>
            <textarea
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              placeholder="Explain why…"
              className="mt-3 min-h-[100px] w-full rounded-lg border border-[var(--line-strong)] bg-[var(--bg-elevated)] p-3 text-sm text-[var(--text-strong)] outline-none focus:border-[var(--accent)]"
            />
            <div className="mt-3 flex gap-2">
              <ArcadeButton variant="danger" onClick={() => reject(showRejectModal)} disabled={loading} className="flex-1">
                Reject
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
