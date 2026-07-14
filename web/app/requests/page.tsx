"use client";

import { Send } from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { apiRequest } from "../../lib/api";

type Request = {
  id: string;
  title: string;
  difficulty: string;
  status: string;
  adminNotes: string | null;
  createdAt: string;
};

export default function RequestsPage() {
  const [form, setForm] = useState({
    title: "",
    statement: "",
    inputFormat: "",
    outputFormat: "",
    constraints: "",
    difficulty: "EASY"
  });
  const [requests, setRequests] = useState<Request[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function loadRequests() {
    try {
      setRequests(await apiRequest<Request[]>("/api/requests/mine"));
    } catch {
      // silent
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await apiRequest("/api/requests", {
        method: "POST",
        body: JSON.stringify(form)
      });
      setMessage("Request submitted successfully!");
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
          <h1 className="page-title">My Requests</h1>
          <p className="muted">Submit problem suggestions and track their status.</p>
        </div>
        <button className="btn primary" onClick={() => setShowForm(!showForm)}>
          <Send size={16} /> {showForm ? "Cancel" : "New Request"}
        </button>
      </div>

      {message && <div className={message.includes("success") ? "message" : "message error"}>{message}</div>}

      {showForm && (
        <form className="card stack" onSubmit={submit}>
          <h3>Submit a Problem Request</h3>
          <div className="field">
            <label>Title</label>
            <input className="input" value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g. Two Sum" />
          </div>
          <div className="field">
            <label>Problem Statement</label>
            <textarea className="textarea" value={form.statement} onChange={(e) => update("statement", e.target.value)} placeholder="Describe the problem in detail..." />
          </div>
          <div className="field">
            <label>Input Format</label>
            <textarea className="textarea" value={form.inputFormat} onChange={(e) => update("inputFormat", e.target.value)} placeholder="How the input is structured..." />
          </div>
          <div className="field">
            <label>Output Format</label>
            <textarea className="textarea" value={form.outputFormat} onChange={(e) => update("outputFormat", e.target.value)} placeholder="What the output should look like..." />
          </div>
          <div className="field">
            <label>Constraints</label>
            <textarea className="textarea" value={form.constraints} onChange={(e) => update("constraints", e.target.value)} placeholder="e.g. 1 <= n <= 10^5" />
          </div>
          <div className="field">
            <label>Difficulty</label>
            <select className="select" value={form.difficulty} onChange={(e) => update("difficulty", e.target.value)}>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>
          <button className="btn primary" disabled={loading}>
            <Send size={16} /> {loading ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      )}

      {requests.length > 0 ? (
        <div className="table-wrap" style={{ marginTop: 20 }}>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Difficulty</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id}>
                  <td>{req.title}</td>
                  <td><span className={`badge ${req.difficulty.toLowerCase()}`}>{req.difficulty}</span></td>
                  <td><span className={statusBadge(req.status)}>{req.status}</span></td>
                  <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Link className="btn" href={`/requests/${req.id}`}>
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !showForm && <p className="muted" style={{ marginTop: 20 }}>No requests yet. Click &quot;New Request&quot; to suggest a problem.</p>
      )}
    </main>
  );
}
