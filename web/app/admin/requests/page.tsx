"use client";

import { Check, Eye, RefreshCw, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { apiRequest } from "../../../lib/api";

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

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [filter, setFilter] = useState("");
  const [message, setMessage] = useState("");
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

  async function approve(id: string) {
    setLoading(true);
    setMessage("");
    try {
      await apiRequest(`/api/requests/admin/${id}/approve`, { method: "POST" });
      setMessage("Request approved and problem created!");
      setSelected(null);
      load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to approve");
    } finally {
      setLoading(false);
    }
  }

  async function reject(id: string) {
    if (!rejectNotes.trim()) {
      setMessage("Please provide a reason for rejection");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      await apiRequest(`/api/requests/admin/${id}/reject`, {
        method: "POST",
        body: JSON.stringify({ adminNotes: rejectNotes })
      });
      setMessage("Request rejected.");
      setShowRejectModal(null);
      setRejectNotes("");
      setSelected(null);
      load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to reject");
    } finally {
      setLoading(false);
    }
  }

  async function markInReview(id: string) {
    setLoading(true);
    setMessage("");
    try {
      await apiRequest(`/api/requests/admin/${id}/in-review`, { method: "POST" });
      setMessage("Request marked as In Review.");
      load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to update");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [filter]);

  function statusBadge(status: string) {
    const map: Record<string, string> = {
      PENDING: "badge pending",
      APPROVED: "badge ac",
      REJECTED: "badge wa",
      IN_REVIEW: "badge medium"
    };
    return map[status] ?? "badge";
  }

  return (
    <main className="container">
      <div className="page-head">
        <div>
          <h1 className="page-title">Problem Requests</h1>
          <p className="muted">Review, approve, or reject community-submitted problems.</p>
        </div>
        <button className="btn" onClick={load}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {message && <div className={message.includes("approved") || message.includes("rejected") || message.includes("marked") ? "message" : "message error"}>{message}</div>}

      <div className="toolbar">
        <select className="select" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All Requests</option>
          <option value="PENDING">Pending</option>
          <option value="IN_REVIEW">In Review</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      <div className="split" style={{ alignItems: "start" }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>By</th>
                <th>Difficulty</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id} style={selected?.id === req.id ? { background: "var(--accent-soft)" } : undefined}>
                  <td>{req.title}</td>
                  <td>{req.user.name}</td>
                  <td><span className={`badge ${req.difficulty.toLowerCase()}`}>{req.difficulty}</span></td>
                  <td><span className={statusBadge(req.status)}>{req.status}</span></td>
                  <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="icon-btn" title="View details" onClick={() => setSelected(req)}>
                        <Eye size={16} />
                      </button>
                      {(req.status === "PENDING") && (
                        <>
                          <button className="icon-btn" title="Approve" onClick={() => approve(req.id)} disabled={loading} style={{ color: "var(--success)" }}>
                            <Check size={16} />
                          </button>
                          <button className="icon-btn danger-btn" title="Reject" onClick={() => setShowRejectModal(req.id)} disabled={loading}>
                            <X size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--muted)" }}>No requests found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {selected && (
          <div className="card stack">
            <div className="problem-card-head">
              <h3 style={{ margin: 0 }}>{selected.title}</h3>
              <span className={statusBadge(selected.status)}>{selected.status}</span>
            </div>
            <div className="problem-meta">
              <span className={`badge ${selected.difficulty.toLowerCase()}`}>{selected.difficulty}</span>
              <span>By {selected.user.name}</span>
            </div>
            <div className="field">
              <label>Statement</label>
              <pre>{selected.statement}</pre>
            </div>
            <div className="field">
              <label>Input Format</label>
              <pre>{selected.inputFormat}</pre>
            </div>
            <div className="field">
              <label>Output Format</label>
              <pre>{selected.outputFormat}</pre>
            </div>
            <div className="field">
              <label>Constraints</label>
              <pre>{selected.constraints}</pre>
            </div>
            {selected.adminNotes && (
              <div className="field">
                <label>Admin Notes</label>
                <div className="message">{selected.adminNotes}</div>
              </div>
            )}
            {selected.status !== "APPROVED" && selected.status !== "REJECTED" && (
              <div style={{ display: "flex", gap: 8 }}>
                {selected.status === "PENDING" && (
                  <button className="btn" onClick={() => markInReview(selected.id)} disabled={loading}>
                    Mark In Review
                  </button>
                )}
                <button className="btn primary" onClick={() => approve(selected.id)} disabled={loading}>
                  <Check size={16} /> Approve
                </button>
                <button className="btn danger-btn" onClick={() => setShowRejectModal(selected.id)} disabled={loading} style={{ borderColor: "var(--danger)", color: "var(--danger)" }}>
                  <X size={16} /> Reject
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {showRejectModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div className="card stack" style={{ maxWidth: 440, width: "100%" }}>
            <h3 style={{ margin: 0 }}>Reject Request</h3>
            <p className="muted">Provide a reason for rejection. This will be visible to the user.</p>
            <div className="field">
              <label>Reason</label>
              <textarea className="textarea" value={rejectNotes} onChange={(e) => setRejectNotes(e.target.value)} placeholder="Explain why this request is being rejected..." />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn primary" onClick={() => reject(showRejectModal)} disabled={loading}>
                Confirm Rejection
              </button>
              <button className="btn" onClick={() => { setShowRejectModal(null); setRejectNotes(""); }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
