"use client";

import { useParams, useRouter } from "next/navigation";
import {
  Check,
  ChevronRight,
  Copy,
  RotateCcw,
  Send,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CodeEditor } from "../../../components/CodeEditor";
import { DifficultyBadge } from "../../../components/DifficultyBadge";
import { ArcadeButton } from "../../../components/ui/ArcadeButton";
import { Skeleton } from "../../../components/ui/PageHead";
import { apiRequest } from "../../../lib/api";
import { buildTemplate } from "../../../lib/templates";
import { cn } from "../../../lib/cn";

type ProblemDetail = {
  id: string;
  title: string;
  slug: string;
  statement: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  difficulty: string;
  timeLimitMs: number;
  memoryLimitMb: number;
  judgeMode: "STDIN" | "FUNCTION";
  functionName: string;
  argumentTypes: string;
  returnType: string;
  testCases: { id: string; input: string; expected?: string; isHidden: boolean }[];
};

type Tab = "statement" | "constraints" | "sample";

export default function ProblemDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const [problem, setProblem] = useState<ProblemDetail | null>(null);
  const [language, setLanguage] = useState<"JAVA" | "CPP">("JAVA");
  const [sourceCode, setSourceCode] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>("statement");
  const [split, setSplit] = useState(46);
  const [copied, setCopied] = useState(false);
  const dragRef = useRef(false);

  const template = useMemo(() => buildTemplate(language, problem), [language, problem]);

  useEffect(() => {
    setMessage("");
    apiRequest<ProblemDetail>(`/api/problems/${params.slug}`)
      .then(setProblem)
      .catch((error) => setMessage(error instanceof Error ? error.message : "Failed to load problem"));
  }, [params.slug]);

  useEffect(() => {
    if (problem) setSourceCode(template);
  }, [template, problem]);

  function onDrag(e: React.MouseEvent) {
    e.preventDefault();
    dragRef.current = true;
    const move = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      setSplit(Math.min(72, Math.max(28, (ev.clientX / window.innerWidth) * 100)));
    };
    const up = () => {
      dragRef.current = false;
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(sourceCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard unavailable */
    }
  }

  const submit = useCallback(async () => {
    if (!problem || loading) return;
    if (!sourceCode.trim()) {
      setMessage("Write some code before submitting.");
      return;
    }
    setLoading(true);
    setMessage("");
    setSuccess("");
    try {
      const submission = await apiRequest<{ id: string }>("/api/submissions", {
        method: "POST",
        body: JSON.stringify({ problemId: problem.id, language, sourceCode }),
      });
      setSuccess("Submitted — opening your result…");
      setTimeout(() => router.push(`/submissions/${submission.id}`), 650);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Submission failed");
    } finally {
      setLoading(false);
    }
  }, [problem, loading, language, sourceCode, router]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") submit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [submit]);

  if (!problem) {
    return (
      <main className="mx-auto w-[min(1400px,calc(100%-32px))] py-8">
        {message ? (
          <div className="rounded-lg bg-[var(--danger-soft)] px-4 py-3 text-sm font-medium text-[var(--danger)]">
            {message}
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-3">
              <Skeleton className="h-10 w-2/3" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-28 w-full" />
            </div>
            <Skeleton className="h-[560px] w-full" />
          </div>
        )}
      </main>
    );
  }

  const sample = problem.testCases[0];

  const statementPane = (
    <>
      <div className="flex gap-1 border-b border-[var(--line)] p-2">
        {(["statement", "constraints", "sample"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "rounded-md px-3 py-1.5 text-[13px] font-medium capitalize transition",
              tab === t
                ? "bg-[var(--surface-soft)] text-[var(--text-strong)]"
                : "text-[var(--muted)] hover:text-[var(--text-strong)]"
            )}
          >
            {t === "sample" ? "Example" : t}
          </button>
        ))}
      </div>
      <div className="max-h-[640px] overflow-y-auto p-5 text-sm leading-relaxed">
        {tab === "statement" && (
          <div className="space-y-5">
            <p className="whitespace-pre-wrap text-[var(--text-strong)]">{problem.statement}</p>
            <div className="rounded-lg bg-[var(--bg-elevated)] p-3.5">
              <p className="mb-1 text-[12px] font-semibold text-[var(--muted)]">Signature</p>
              <code className="font-mono text-[13px] text-[var(--text-strong)]">
                {problem.judgeMode === "FUNCTION"
                  ? `${problem.returnType} ${problem.functionName}(${problem.argumentTypes})`
                  : "Standard input (stdin)"}
              </code>
            </div>
            <div>
              <p className="mb-1 text-[13px] font-semibold text-[var(--text-strong)]">Input</p>
              <p className="whitespace-pre-wrap">{problem.inputFormat}</p>
            </div>
            <div>
              <p className="mb-1 text-[13px] font-semibold text-[var(--text-strong)]">Output</p>
              <p className="whitespace-pre-wrap">{problem.outputFormat}</p>
            </div>
          </div>
        )}
        {tab === "constraints" && (
          <p className="whitespace-pre-wrap text-[var(--text-strong)]">{problem.constraints}</p>
        )}
        {tab === "sample" &&
          (sample ? (
            <div className="space-y-4">
              <div>
                <p className="mb-1.5 text-[12px] font-semibold text-[var(--muted)]">Input</p>
                <pre className="m-0">{sample.input}</pre>
              </div>
              {sample.expected && (
                <div>
                  <p className="mb-1.5 text-[12px] font-semibold text-[var(--muted)]">Output</p>
                  <pre className="m-0">{sample.expected}</pre>
                </div>
              )}
            </div>
          ) : (
            <p className="text-[var(--muted)]">No public example for this problem.</p>
          ))}
      </div>
    </>
  );

  const editorPane = (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-2">
        <div className="flex gap-0.5 rounded-md bg-[var(--surface-soft)] p-0.5">
          {(["JAVA", "CPP"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLanguage(l)}
              className={cn(
                "rounded px-3.5 py-1.5 font-mono text-[12px] font-semibold transition",
                language === l ? "bg-[var(--surface)] text-[var(--text-strong)] shadow-sm" : "text-[var(--muted)]"
              )}
            >
              {l === "JAVA" ? "Java" : "C++"}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-0.5">
          <button onClick={() => setSourceCode(template)} title="Reset to template" className="rounded-md p-2 text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text-strong)]">
            <RotateCcw size={15} />
          </button>
          <button onClick={copy} title="Copy code" className="rounded-md p-2 text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text-strong)]">
            {copied ? <Check size={15} /> : <Copy size={15} />}
          </button>
          <ArcadeButton variant="primary" onClick={submit} disabled={loading} className="ml-1 !min-h-[34px]">
            <Send size={13} /> {loading ? "Submitting…" : "Submit"}
          </ArcadeButton>
        </div>
      </div>
      {message && (
        <div className="mb-3 rounded-lg bg-[var(--danger-soft)] px-4 py-2.5 text-sm font-medium text-[var(--danger)]">
          {message}
        </div>
      )}
      {success && (
        <div className="mb-3 rounded-lg bg-[var(--success-soft)] px-4 py-2.5 text-sm font-medium text-[var(--success)]">
          {success}
        </div>
      )}
      <CodeEditor language={language} value={sourceCode} onChange={setSourceCode} height="600px" />
      <p className="mt-2 text-right font-mono text-[11px] text-[var(--muted)]">
        Ctrl+Enter to submit
      </p>
    </>
  );

  return (
    <main className="mx-auto w-[min(1400px,calc(100%-24px))] py-6 pb-20">
      <div className="mb-4 flex flex-wrap items-center gap-2 text-[13px]">
        <span className="text-[var(--muted)]">
          Problems <ChevronRight size={12} className="inline" /> {problem.slug}
        </span>
        <span className="ml-auto flex items-center gap-3 font-mono text-[12px] text-[var(--muted)]">
          {problem.timeLimitMs} ms · {problem.memoryLimitMb} MB
          <DifficultyBadge difficulty={problem.difficulty} />
        </span>
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-[var(--text-strong)]">
        {problem.title}
      </h1>

      <div className="mt-5 hidden gap-0 lg:grid" style={{ gridTemplateColumns: `${split}% 12px ${100 - split - 1}%` }}>
        <section className="min-h-[560px] overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--surface)]">
          {statementPane}
        </section>
        <div onMouseDown={onDrag} className="flex cursor-col-resize items-center justify-center" title="Drag to resize">
          <div className="h-16 w-1 rounded-full bg-[var(--line-strong)]" />
        </div>
        <section className="flex min-h-[560px] flex-col">{editorPane}</section>
      </div>

      <div className="mt-5 space-y-4 lg:hidden">
        <section className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5">
          <DifficultyBadge difficulty={problem.difficulty} />
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{problem.statement}</p>
          {sample && (
            <>
              <p className="mb-1 mt-4 text-[12px] font-semibold text-[var(--muted)]">Example input</p>
              <pre className="m-0">{sample.input}</pre>
              {sample.expected && (
                <>
                  <p className="mb-1 mt-3 text-[12px] font-semibold text-[var(--muted)]">Example output</p>
                  <pre className="m-0">{sample.expected}</pre>
                </>
              )}
            </>
          )}
        </section>
        <section className="flex min-h-[400px] flex-col">{editorPane}</section>
      </div>
    </main>
  );
}
