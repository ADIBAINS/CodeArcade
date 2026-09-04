"use client";

import { useParams, useRouter } from "next/navigation";
import {
  Check,
  ChevronRight,
  Clock,
  Copy,
  Expand,
  MemoryStick,
  RotateCcw,
  Send,
  Shrink,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
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
  const [focus, setFocus] = useState(false);
  const [copied, setCopied] = useState(false);
  const dragRef = useRef(false);

  const template = useMemo(
    () =>
      buildTemplate(language, problem),
    [language, problem]
  );

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
      const pct = Math.min(72, Math.max(28, (ev.clientX / window.innerWidth) * 100));
      setSplit(pct);
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

  async function submit() {
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
      setSuccess("Submitted — watching the judge…");
      setTimeout(() => router.push(`/submissions/${submission.id}`), 650);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Submission failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") submit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!problem) {
    return (
      <main className="mx-auto w-[min(1400px,calc(100%-32px))] py-8">
        {message ? (
          <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300">
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

  return (
    <main className={cn("mx-auto w-[min(1400px,calc(100%-24px))] py-6 pb-24", focus && "w-[min(1600px,calc(100%-16px))]")}>
      {/* header */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <span className="text-xs font-bold text-[var(--muted)]">
          Problems <ChevronRight size={12} className="inline" /> {problem.slug}
        </span>
        <span className="ml-auto inline-flex items-center gap-2 text-xs font-bold text-[var(--muted)]">
          <span className="inline-flex items-center gap-1 rounded-full border border-[var(--line)] px-2.5 py-1">
            <Clock size={12} /> {problem.timeLimitMs} ms
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-[var(--line)] px-2.5 py-1">
            <MemoryStick size={12} /> {problem.memoryLimitMb} MB
          </span>
          <DifficultyBadge difficulty={problem.difficulty} />
        </span>
      </div>
      <h1 className="text-glow text-3xl font-black tracking-tight text-[var(--text-strong)] sm:text-4xl">
        {problem.title}
      </h1>

      {/* workspace */}
      <div
        className="mt-6 hidden gap-0 lg:grid"
        style={{ gridTemplateColumns: `${split}% 10px ${100 - split - 1}%` }}
      >
        <section className="glass min-h-[560px] overflow-hidden rounded-2xl">
          <div className="flex gap-1 border-b border-[var(--line)] p-2">
            {(["statement", "constraints", "sample"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "rounded-lg px-3.5 py-2 text-xs font-black uppercase tracking-wider transition",
                  tab === t ? "bg-teal-400/10 text-teal-300" : "text-[var(--muted)] hover:text-[var(--text)]"
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="max-h-[640px] overflow-y-auto p-5 text-sm leading-relaxed">
            {tab === "statement" && (
              <div className="space-y-5">
                <p className="whitespace-pre-wrap text-[var(--text)]">{problem.statement}</p>
                <div className="rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)] p-4">
                  <p className="mb-1 font-mono text-[11px] uppercase tracking-widest text-teal-300">Signature</p>
                  <code className="font-mono text-[13px] text-[var(--text)]">
                    {problem.judgeMode === "FUNCTION"
                      ? `${problem.returnType} ${problem.functionName}(${problem.argumentTypes})`
                      : "Standard input (stdin)"}
                  </code>
                </div>
                <div>
                  <p className="mb-1 text-xs font-black uppercase tracking-widest text-[var(--muted)]">Input</p>
                  <p className="whitespace-pre-wrap text-[var(--text)]">{problem.inputFormat}</p>
                </div>
                <div>
                  <p className="mb-1 text-xs font-black uppercase tracking-widest text-[var(--muted)]">Output</p>
                  <p className="whitespace-pre-wrap text-[var(--text)]">{problem.outputFormat}</p>
                </div>
              </div>
            )}
            {tab === "constraints" && (
              <p className="whitespace-pre-wrap text-[var(--text)]">{problem.constraints}</p>
            )}
            {tab === "sample" &&
              (sample ? (
                <div className="space-y-4">
                  <div>
                    <p className="mb-1.5 text-xs font-black uppercase tracking-widest text-[var(--muted)]">Input</p>
                    <pre className="m-0">{sample.input}</pre>
                  </div>
                  {sample.expected && (
                    <div>
                      <p className="mb-1.5 text-xs font-black uppercase tracking-widest text-[var(--muted)]">Output</p>
                      <pre className="m-0">{sample.expected}</pre>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-[var(--muted)]">No public sample for this problem.</p>
              ))}
          </div>
        </section>

        <div
          onMouseDown={onDrag}
          className="flex cursor-col-resize items-center justify-center rounded-full transition hover:bg-teal-400/20"
          title="Drag to resize"
        >
          <div className="h-16 w-1 rounded-full bg-[var(--line-strong)]" />
        </div>

        <section className="flex min-h-[560px] flex-col">
          <div className="glass mb-3 flex flex-wrap items-center gap-2 rounded-2xl p-2.5">
            <div className="flex rounded-xl border border-[var(--line)] p-0.5">
              {(["JAVA", "CPP"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={cn(
                    "rounded-lg px-4 py-1.5 font-mono text-xs font-bold transition",
                    language === l ? "bg-teal-400/15 text-teal-300" : "text-[var(--muted)] hover:text-[var(--text)]"
                  )}
                >
                  {l === "JAVA" ? "Java" : "C++"}
                </button>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <button onClick={() => setSourceCode(template)} title="Reset to template" className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]">
                <RotateCcw size={15} />
              </button>
              <button onClick={copy} title="Copy code" className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]">
                {copied ? <Check size={15} className="text-emerald-300" /> : <Copy size={15} />}
              </button>
              <button onClick={() => setFocus((v) => !v)} title="Focus mode" className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]">
                {focus ? <Shrink size={15} /> : <Expand size={15} />}
              </button>
              <ArcadeButton variant="primary" onClick={submit} disabled={loading} className="!min-h-[38px]">
                <Send size={14} /> {loading ? "Submitting…" : "Submit ⏎"}
              </ArcadeButton>
            </div>
          </div>
          {message && (
            <div className="mb-3 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2.5 text-sm font-bold text-red-300">
              {message}
            </div>
          )}
          {success && (
            <div className="mb-3 rounded-xl border border-emerald-300/30 bg-emerald-400/10 px-4 py-2.5 text-sm font-bold text-emerald-300">
              {success}
            </div>
          )}
          <CodeEditor language={language} value={sourceCode} onChange={setSourceCode} height="600px" />
          <p className="mt-2 text-right font-mono text-[11px] text-[var(--muted)]">
            {sourceCode.length} chars · Ctrl+Enter to submit
          </p>
        </section>
      </div>

      {/* mobile stacked */}
      <div className="mt-6 space-y-4 lg:hidden">
        <section className="glass rounded-2xl p-5">
          <DifficultyBadge difficulty={problem.difficulty} />
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{problem.statement}</p>
          {sample && (
            <>
              <p className="mb-1 mt-4 text-xs font-black uppercase tracking-widest text-[var(--muted)]">Sample input</p>
              <pre className="m-0">{sample.input}</pre>
              {sample.expected && (
                <>
                  <p className="mb-1 mt-3 text-xs font-black uppercase tracking-widest text-[var(--muted)]">Sample output</p>
                  <pre className="m-0">{sample.expected}</pre>
                </>
              )}
            </>
          )}
        </section>
        <div className="glass flex flex-wrap items-center gap-2 rounded-2xl p-2.5">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as "JAVA" | "CPP")}
            className="min-h-[40px] flex-1 rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)] px-3 text-sm font-bold"
          >
            <option value="JAVA">Java</option>
            <option value="CPP">C++</option>
          </select>
          <ArcadeButton variant="primary" onClick={submit} disabled={loading} className="flex-1">
            <Send size={14} /> {loading ? "…" : "Submit"}
          </ArcadeButton>
        </div>
        {message && <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2.5 text-sm font-bold text-red-300">{message}</div>}
        {success && <div className="rounded-xl border border-emerald-300/30 bg-emerald-400/10 px-4 py-2.5 text-sm font-bold text-emerald-300">{success}</div>}
        <CodeEditor language={language} value={sourceCode} onChange={setSourceCode} height="440px" />
      </div>
    </main>
  );
}
