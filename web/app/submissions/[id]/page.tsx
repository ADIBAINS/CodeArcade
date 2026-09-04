"use client";

import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { CodeEditor } from "../../../components/CodeEditor";
import { VerdictBadge, verdictTone } from "../../../components/VerdictBadge";
import { ArcadeButton, ArcadeLink } from "../../../components/ui/ArcadeButton";
import { Skeleton } from "../../../components/ui/PageHead";
import { apiRequest } from "../../../lib/api";
import { cn } from "../../../lib/cn";

type SubmissionDetail = {
  id: string;
  language: string;
  sourceCode: string;
  status: string;
  verdict?: string | null;
  passedTests: number;
  totalTests: number;
  executionTimeMs?: number | null;
  errorMessage?: string | null;
  failedTestInput?: string | null;
  expectedOutput?: string | null;
  actualOutput?: string | null;
  createdAt: string;
  problem: { title: string; slug: string; difficulty: string };
};

function isLive(s?: SubmissionDetail | null) {
  const v = (s?.verdict ?? s?.status ?? "").toUpperCase();
  return v === "PENDING" || v === "RUNNING" || v === "JUDGING" || v === "";
}

function DiffView({ expected, actual }: { expected: string; actual: string }) {
  const expLines = expected.split("\n");
  const actLines = actual.split("\n");
  const rows = Math.max(expLines.length, actLines.length);
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--line)] font-mono text-[12.5px]">
      {Array.from({ length: rows }).map((_, i) => {
        const e = expLines[i] ?? "";
        const a = actLines[i] ?? "";
        const same = e === a;
        return (
          <div key={i} className={cn("grid grid-cols-2", !same && "bg-red-500/[0.06]")}>
            <div className="border-r border-[var(--line)] px-3 py-1.5">
              <span className="mr-2 text-[10px] text-[var(--muted)]">{i + 1}</span>
              <span className={same ? "text-[var(--text)]" : "text-red-300"}>{e || "∅"}</span>
            </div>
            <div className="px-3 py-1.5">
              <span className="mr-2 text-[10px] text-[var(--muted)]">{i + 1}</span>
              <span className={same ? "text-[var(--text)]" : "text-amber-300"}>{a || "∅"}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function SubmissionDetailPage() {
  const params = useParams<{ id: string }>();
  const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setMessage("");
    try {
      setSubmission(await apiRequest<SubmissionDetail>(`/api/submissions/${params.id}`));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load submission");
    }
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!isLive(submission)) return;
    const t = setInterval(load, 2000);
    return () => clearInterval(t);
  }, [submission, load]);

  if (!submission) {
    return (
      <main className="mx-auto w-[min(1180px,calc(100%-32px))] space-y-4 py-8">
        {message ? (
          <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300">{message}</div>
        ) : (
          <>
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </>
        )}
      </main>
    );
  }

  const label = (submission.verdict ?? submission.status ?? "PENDING").toUpperCase();
  const pct = submission.totalTests > 0 ? Math.round((submission.passedTests / submission.totalTests) * 100) : 0;

  return (
    <main className="mx-auto w-[min(1180px,calc(100%-32px))] py-8 pb-16">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <ArcadeLink href="/submissions">
          <ArrowLeft size={15} /> Back
        </ArcadeLink>
        <ArcadeButton onClick={load}>
          <RefreshCw size={15} /> Refresh
        </ArcadeButton>
        {isLive(submission) && (
          <span className="inline-flex items-center gap-2 rounded-full border border-sky-300/30 bg-sky-400/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-sky-300">
            <span className="live-dot h-1.5 w-1.5 rounded-full bg-sky-300" /> Live judging
          </span>
        )}
      </div>

      <div className={cn("glass rounded-3xl border p-6 sm:p-8", verdictTone(label).split(" ")[0])}>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
          {submission.language} · {new Date(submission.createdAt).toLocaleString()} ·{" "}
          <Link href={`/problems/${submission.problem.slug}`} className="text-teal-300 hover:underline">
            {submission.problem.title}
          </Link>
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <VerdictBadge verdict={submission.verdict} status={submission.status} />
          <span className="font-mono text-sm text-[var(--muted)]">
            {submission.executionTimeMs ?? "—"} ms
          </span>
        </div>
        <div className="mt-5">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--muted)]">
            <span>Tests {submission.passedTests}/{submission.totalTests}</span>
            <span>{pct}%</span>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[var(--surface-muted)]">
            <div
              className={cn("h-full rounded-full transition-all", pct === 100 ? "bg-emerald-400" : pct >= 50 ? "bg-amber-300" : "bg-red-400")}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {message && (
        <div className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300">{message}</div>
      )}

      <section className="mt-6 grid gap-4">
        {submission.errorMessage && (
          <div className="glass rounded-2xl p-5">
            <h3 className="mb-2 font-mono text-[11px] font-black uppercase tracking-[0.18em] text-red-300">Fault</h3>
            <pre className="m-0">{submission.errorMessage}</pre>
          </div>
        )}
        {submission.failedTestInput && (
          <div className="glass rounded-2xl p-5">
            <h3 className="mb-2 font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[var(--muted)]">Failed input</h3>
            <pre className="m-0">{submission.failedTestInput}</pre>
          </div>
        )}
        {(submission.expectedOutput || submission.actualOutput) && (
          <div className="glass rounded-2xl p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[var(--muted)]">
                Expected vs yours
              </h3>
              <span className="font-mono text-[11px] text-[var(--muted)]">line-by-line diff</span>
            </div>
            <DiffView expected={submission.expectedOutput ?? ""} actual={submission.actualOutput ?? ""} />
          </div>
        )}
        <div className="glass rounded-2xl p-5">
          <h3 className="mb-3 font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[var(--muted)]">
            Submitted code
          </h3>
          <CodeEditor
            language={submission.language === "CPP" ? "CPP" : "JAVA"}
            value={submission.sourceCode}
            readOnly
            height="420px"
          />
        </div>
      </section>
    </main>
  );
}
