"use client";

import { Save } from "lucide-react";
import { FormEvent, useState } from "react";
import { ArcadeButton } from "../../../../components/ui/ArcadeButton";
import { PageHead } from "../../../../components/ui/PageHead";
import { apiRequest } from "../../../../lib/api";
import { cn } from "../../../../lib/cn";

const inputCls =
  "w-full rounded-lg border border-[var(--line-strong)] bg-[var(--bg-elevated)] px-3 py-2.5 text-sm text-[var(--text-strong)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--accent)]";
const labelCls = "text-[13px] font-medium text-[var(--text-strong)]";

export default function NewProblemPage() {
  const [form, setForm] = useState({
    title: "",
    slug: "",
    statement: "",
    inputFormat: "",
    outputFormat: "",
    constraints: "",
    difficulty: "EASY",
    timeLimitMs: 2000,
    memoryLimitMb: 256,
    judgeMode: "FUNCTION",
    functionName: "solve",
    argumentTypes: "int,int",
    returnType: "int",
  });
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);

  function update(key: keyof typeof form, value: string | number) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setOk(false);
    try {
      const body = { ...form, slug: form.slug || undefined };
      const problem = await apiRequest<{ id: string; title: string }>("/api/problems", {
        method: "POST",
        body: JSON.stringify(body),
      });
      setMessage(`Created ${problem.title}. Add test cases from Admin → Problems.`);
      setOk(true);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Problem creation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto w-[min(860px,calc(100%-32px))] py-8 pb-16">
      <PageHead eyebrow="Admin" title="New problem" description="Function mode is LeetCode-style. STDIN mode reads from standard input." />
      <form onSubmit={submit} className="grid gap-4 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5">
        {message && (
          <div className={cn("rounded-lg px-4 py-2.5 text-sm font-medium", ok ? "bg-[var(--success-soft)] text-[var(--success)]" : "bg-[var(--danger-soft)] text-[var(--danger)]")}>
            {message}
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5">
            <span className={labelCls}>Title</span>
            <input className={inputCls} value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Two Sum" />
          </label>
          <label className="grid gap-1.5">
            <span className={labelCls}>Slug (optional)</span>
            <input className={inputCls} value={form.slug} onChange={(e) => update("slug", e.target.value)} placeholder="two-sum" />
          </label>
        </div>
        {(
          [
            ["statement", "Statement"],
            ["inputFormat", "Input format"],
            ["outputFormat", "Output format"],
            ["constraints", "Constraints"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="grid gap-1.5">
            <span className={labelCls}>{label}</span>
            <textarea className={cn(inputCls, "min-h-[96px]")} value={form[key]} onChange={(e) => update(key, e.target.value)} />
          </label>
        ))}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="grid gap-1.5">
            <span className={labelCls}>Judge mode</span>
            <select className={inputCls} value={form.judgeMode} onChange={(e) => update("judgeMode", e.target.value)}>
              <option value="FUNCTION">Function</option>
              <option value="STDIN">STDIN</option>
            </select>
          </label>
          <label className="grid gap-1.5">
            <span className={labelCls}>Function</span>
            <input className={cn(inputCls, "font-mono")} value={form.functionName} onChange={(e) => update("functionName", e.target.value)} />
          </label>
          <label className="grid gap-1.5">
            <span className={labelCls}>Arg types</span>
            <input className={cn(inputCls, "font-mono")} value={form.argumentTypes} onChange={(e) => update("argumentTypes", e.target.value)} />
          </label>
          <label className="grid gap-1.5">
            <span className={labelCls}>Return</span>
            <input className={cn(inputCls, "font-mono")} value={form.returnType} onChange={(e) => update("returnType", e.target.value)} />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="grid gap-1.5">
            <span className={labelCls}>Difficulty</span>
            <select className={inputCls} value={form.difficulty} onChange={(e) => update("difficulty", e.target.value)}>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </label>
          <label className="grid gap-1.5">
            <span className={labelCls}>Time limit (ms)</span>
            <input className={inputCls} type="number" value={form.timeLimitMs} onChange={(e) => update("timeLimitMs", Number(e.target.value))} />
          </label>
          <label className="grid gap-1.5">
            <span className={labelCls}>Memory (MB)</span>
            <input className={inputCls} type="number" value={form.memoryLimitMb} onChange={(e) => update("memoryLimitMb", Number(e.target.value))} />
          </label>
        </div>
        <div>
          <ArcadeButton variant="primary" disabled={loading}>
            <Save size={14} /> {loading ? "Creating…" : "Create problem"}
          </ArcadeButton>
        </div>
      </form>
    </main>
  );
}
