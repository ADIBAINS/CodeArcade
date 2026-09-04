"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, Copy, Check, FileCode2, RefreshCw, XCircle } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { CodeEditor } from "../../../components/CodeEditor";
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

function isAccepted(s: SubmissionDetail) {
  const v = (s.verdict ?? s.status ?? "").toUpperCase();
  return v === "AC" || v === "ACCEPTED";
}

function verdictLabel(s: SubmissionDetail) {
  const v = (s.verdict ?? s.status ?? "PENDING").toUpperCase();
  const map: Record<string, string> = {
    AC: "Accepted",
    ACCEPTED: "Accepted",
    WA: "Wrong Answer",
    WRONG_ANSWER: "Wrong Answer",
    TLE: "Time Limit Exceeded",
    TIME_LIMIT_EXCEEDED: "Time Limit Exceeded",
    CE: "Compile Error",
    RE: "Runtime Error",
    PENDING: "Pending",
    RUNNING: "Running",
    JUDGING: "Judging",
  };
  return map[v] ?? s.verdict ?? s.status;
}

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-[var(--line)] bg-[var(--surface)]">
      <div className="flex items-center justify-between gap-2 border-b border-[var(--line)] px-5 py-3">
        <h3 className="text-[13px] font-semibold text-[var(--text-strong)]">{title}</h3>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export default function SubmissionDetailPage() {
  const params = useParams<{ id: string }>();
  const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

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
      <main className="mx-auto w-[min(1180px,calc(100%-32px))] space-y-3 py-8">
        {message ? (
          <div className="rounded-lg bg-[var(--danger-soft)] px-4 py-3 text-sm font-medium text-[var(--danger)]">{message}</div>
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

  const accepted = isAccepted(submission);
  const live = isLive(submission);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(submission?.sourceCode ?? "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <main className="mx-auto w-[min(1180px,calc(100%-32px))] py-8 pb-16">
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <ArcadeLink href="/submissions">
          <ArrowLeft size={15} /> All submissions
        </ArcadeLink>
        <ArcadeLink href={`/problems/${submission.problem.slug}`}>
          <FileCode2 size={15} /> Back to problem
        </ArcadeLink>
        <ArcadeButton onClick={load}>
          <RefreshCw size={14} /> Refresh
        </ArcadeButton>
        {live && (
          <span className="inline-flex items-center gap-2 rounded-md bg-[var(--info-soft)] px-2.5 py-1.5 text-[12px] font-semibold text-[var(--info)]">
            <span className="live-dot h-1.5 w-1.5 rounded-full bg-current" /> Judging…
          </span>
        )}
      </div>

      {/* Result + details left, code editor right (half each on desktop) */}
      <div className="mt-4 grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        <div className="grid gap-4">
          <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-6 text-center sm:p-8">
        {accepted ? (
          <CheckCircle2 size={44} className="mx-auto text-[var(--success)]" strokeWidth={1.5} />
        ) : live ? (
          <RefreshCw size={40} className="mx-auto animate-spin text-[var(--info)]" strokeWidth={1.5} />
        ) : (
          <XCircle size={44} className="mx-auto text-[var(--danger)]" strokeWidth={1.5} />
        )}
        <h1
          className={cn(
            "mt-3 text-2xl font-bold",
            accepted ? "text-[var(--success)]" : live ? "text-[var(--info)]" : "text-[var(--danger)]"
          )}
        >
          {verdictLabel(submission)}
        </h1>
        <p className="mt-1.5 text-sm text-[var(--muted)]">
          <Link href={`/problems/${submission.problem.slug}`} className="font-medium text-[var(--text-strong)] hover:text-[var(--accent)]">
            {submission.problem.title}
          </Link>
        </p>
        <div className="mx-auto mt-6 grid max-w-lg grid-cols-1 divide-y divide-[var(--line)] rounded-lg border border-[var(--line)] bg-[var(--bg-elevated)] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="px-3 py-3.5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--muted)]">Runtime</p>
            <p className="mt-1 font-mono text-[15px] font-semibold text-[var(--text-strong)]">
              {submission.executionTimeMs ?? "—"} ms
            </p>
          </div>
          <div className="px-3 py-3.5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--muted)]">Tests</p>
            <p className="mt-1 font-mono text-[15px] font-semibold text-[var(--text-strong)]">
              {submission.passedTests}/{submission.totalTests}
            </p>
          </div>
          <div className="px-3 py-3.5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--muted)]">Language</p>
            <p className="mt-1 font-mono text-[15px] font-semibold text-[var(--text-strong)]">
              {submission.language}
            </p>
          </div>
        </div>
        <p className="mt-4 text-[12px] text-[var(--muted)]">
          Submitted {new Date(submission.createdAt).toLocaleString()}
        </p>
      </div>

      {message && (
        <div className="mt-4 rounded-lg bg-[var(--danger-soft)] px-4 py-3 text-sm font-medium text-[var(--danger)]">{message}</div>
      )}

          {submission.errorMessage && (
            <Section title="Error">
              <pre className="m-0">{submission.errorMessage}</pre>
            </Section>
          )}
          {submission.failedTestInput && (
            <Section title="Failed input">
              <pre className="m-0">{submission.failedTestInput}</pre>
            </Section>
          )}
          {submission.expectedOutput && (
            <Section title="Expected output">
              <pre className="m-0">{submission.expectedOutput}</pre>
            </Section>
          )}
          {submission.actualOutput && (
            <Section title="Your output">
              <pre className="m-0">{submission.actualOutput}</pre>
            </Section>
          )}
        </div>

        <div className="lg:sticky lg:top-[76px]">
          <Section
            title="Submitted code"
            action={
              <button
                onClick={copyCode}
                className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] font-semibold text-[var(--muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--text-strong)]"
                title="Copy code"
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? "Copied" : "Copy"}
              </button>
            }
          >
            <CodeEditor
              language={submission.language === "CPP" ? "CPP" : "JAVA"}
              value={submission.sourceCode}
              readOnly
              height="560px"
            />
          </Section>
        </div>
      </div>
    </main>
  );
}
