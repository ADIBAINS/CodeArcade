"use client";

import { ArrowLeft } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DifficultyBadge } from "../../../components/DifficultyBadge";
import { ArcadeLink } from "../../../components/ui/ArcadeButton";
import { Skeleton } from "../../../components/ui/PageHead";
import { apiRequest } from "../../../lib/api";
import { cn } from "../../../lib/cn";

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
  reviewedBy: { id: string; name: string } | null;
};

const STATUS_STYLE: Record<string, string> = {
  PENDING: "text-[var(--info)] bg-[var(--info-soft)]",
  IN_REVIEW: "text-[var(--warning)] bg-[var(--warning-soft)]",
  APPROVED: "text-[var(--success)] bg-[var(--success-soft)]",
  REJECTED: "text-[var(--danger)] bg-[var(--danger-soft)]",
};

export default function RequestDetailPage() {
  const params = useParams<{ id: string }>();
  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!params.id) return;
    apiRequest<RequestDetail>(`/api/requests/${params.id}`)
      .then(setRequest)
      .catch((error) => setMessage(error instanceof Error ? error.message : "Failed to load request"));
  }, [params.id]);

  return (
    <main className="mx-auto w-[min(860px,calc(100%-32px))] py-8 pb-16">
      <ArcadeLink href="/requests" className="mb-5">
        <ArrowLeft size={15} /> Back
      </ArcadeLink>
      {message && (
        <div className="rounded-lg bg-[var(--danger-soft)] px-4 py-3 text-sm font-medium text-[var(--danger)]">{message}</div>
      )}
      {!request && !message && (
        <div className="space-y-3">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      )}
      {request && (
        <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-6">
          <div>
            <span className={cn("inline-flex rounded-md px-2 py-0.5 text-[12px] font-semibold", STATUS_STYLE[request.status] ?? "")}>
              {request.status.replace("_", " ")}
            </span>
            <h1 className="mt-2 text-xl font-bold leading-snug text-[var(--text-strong)]">{request.title}</h1>
          </div>
          <div className="mt-2.5 flex flex-wrap items-center gap-3 text-[13px] text-[var(--muted)]">
            <DifficultyBadge difficulty={request.difficulty} />
            <span>{new Date(request.createdAt).toLocaleDateString()}</span>
            {request.reviewedBy && <span>Reviewed by {request.reviewedBy.name}</span>}
          </div>
          {(
            [
              ["Problem statement", request.statement],
              ["Input format", request.inputFormat],
              ["Output format", request.outputFormat],
              ["Constraints", request.constraints],
            ] as const
          ).map(([label, body]) => (
            <div key={label} className="mt-5">
              <p className="mb-1.5 text-[13px] font-semibold text-[var(--text-strong)]">{label}</p>
              <pre className="m-0">{body}</pre>
            </div>
          ))}
          {request.adminNotes && (
            <div className="mt-5 rounded-lg bg-[var(--surface-soft)] px-4 py-3 text-sm">
              <p className="text-[12px] font-semibold uppercase tracking-wider text-[var(--muted)]">Admin feedback</p>
              <p className="mt-1 text-[var(--text-strong)]">{request.adminNotes}</p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
