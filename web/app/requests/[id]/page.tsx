"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { apiRequest } from "../../../lib/api";

type RequestDetail = {
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
  updatedAt: string;
  user: { id: string; name: string };
  reviewedBy: { id: string; name: string } | null;
};

export default function RequestDetailPage() {
  const params = useParams();
  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!params.id) return;
    apiRequest<RequestDetail>(`/api/requests/${params.id}`)
      .then(setRequest)
      .catch((error) => setMessage(error instanceof Error ? error.message : "Failed to load request"));
  }, [params.id]);

  function statusBadge(status: string) {
    const map: Record<string, string> = {
      PENDING: "badge pending",
      APPROVED: "badge ac",
      REJECTED: "badge wa",
      IN_REVIEW: "badge medium"
    };
    return map[status] ?? "badge";
  }

  if (message) {
    return (
      <main className="container">
        <Link className="btn" href="/requests" style={{ marginBottom: 16 }}>
          <ArrowLeft size={16} /> Back
        </Link>
        <div className="message error">{message}</div>
      </main>
    );
  }

  if (!request) {
    return (
      <main className="container">
        <p className="muted">Loading...</p>
      </main>
    );
  }

  return (
    <main className="container">
      <Link className="btn" href="/requests" style={{ marginBottom: 16 }}>
        <ArrowLeft size={16} /> Back
      </Link>

      <div className="card stack">
        <div className="problem-card-head">
          <h2>{request.title}</h2>
          <span className={statusBadge(request.status)}>{request.status}</span>
        </div>

        <div className="problem-meta">
          <span className={`badge ${request.difficulty.toLowerCase()}`}>{request.difficulty}</span>
          <span>Submitted {new Date(request.createdAt).toLocaleDateString()}</span>
          {request.reviewedBy && <span>Reviewed by {request.reviewedBy.name}</span>}
        </div>

        <div className="field">
          <label>Problem Statement</label>
          <pre>{request.statement}</pre>
        </div>

        <div className="field">
          <label>Input Format</label>
          <pre>{request.inputFormat}</pre>
        </div>

        <div className="field">
          <label>Output Format</label>
          <pre>{request.outputFormat}</pre>
        </div>

        <div className="field">
          <label>Constraints</label>
          <pre>{request.constraints}</pre>
        </div>

        {request.adminNotes && (
          <div className="field">
            <label>Admin Feedback</label>
            <div className="message">{request.adminNotes}</div>
          </div>
        )}
      </div>
    </main>
  );
}
