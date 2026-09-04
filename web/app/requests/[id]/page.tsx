"use client";

import Link from "next/link";
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
  PENDING: "border-sky-300/30 bg-sky-400/10 text-sky-300",
  IN_REVIEW: "border-amber-300/30 bg-amber-400/10 text-amber-300",
  APPROVED: "border-emerald-300/30 bg-emerald-400/10 text-emerald-300",
  REJECTED: "border-red-400/30 bg-red-500/10 text-red-300",
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
    <main className="mx-auto w-[min(900px,calc(100%-32px))] py-8 pb-16">
      <ArcadeLink href="/requests" className="mb-5">
        <ArrowLeft size={15} /> Back
      </ArcadeLink>
      {message && (
        <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300">{message}</div>
      )}
      {!request && !message && (
        <div className="space-y-3">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      )}
      {request && (
        <div className="glass rounded-3xl p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h1 className="text-3xl font-black text-[var(--text-strong)]">{request.title}</h1>
            <span className={cn("inline-flex rounded-full border px-3 py-1 text-[11px] font-black", STATUS_STYLE[request.status] ?? "border-[var(--line)]")}>
              {request.status}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-[var(--muted)]">
            <DifficultyBadge difficulty={request.difficulty} />
            <span className="inline-flex items-center rounded-full border border-[var(--line)] px-2.5 py-1">
              {new Date(request.createdAt).toLocaleDateString()}
            </span>
            {request.reviewedBy && (
              <span className="inline-flex items-center rounded-full border border-[var(--line)] px-2.5 py-1">
                Reviewed by {request.reviewedBy.name}
              </span>
            )}
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
              <p className="mb-1.5 font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[var(--muted)]">{label}</p>
              <pre className="m-0">{body}</pre>
            </div>
          ))}
          {request.adminNotes && (
            <div className="mt-5 rounded-xl border border-teal-300/25 bg-teal-400/10 px-4 py-3 text-sm">
              <p className="font-mono text-[11px] font-black uppercase tracking-[0.18em] text-teal-300">Admin feedback</p>
              <p className="mt-1 text-[var(--text)]">{request.adminNotes}</p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
