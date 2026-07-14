"use client";

import { Save } from "lucide-react";
import { FormEvent, useState } from "react";
import { apiRequest } from "../../../../lib/api";

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
    memoryLimitMb: 256
    ,judgeMode: "FUNCTION"
    ,functionName: "solve"
    ,argumentTypes: "int,int"
    ,returnType: "int"
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function update(key: keyof typeof form, value: string | number) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const body = { ...form, slug: form.slug || undefined };
      const problem = await apiRequest<{ id: string; title: string }>("/api/problems", {
        method: "POST",
        body: JSON.stringify(body)
      });
      setMessage(`Created ${problem.title}. Add test cases through POST /api/problems/${problem.id}/testcases.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Problem creation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container">
      <h1 className="page-title">New Problem</h1>
      <form className="card stack" onSubmit={submit}>
        {message && <div className={message.startsWith("Created") ? "message" : "message error"}>{message}</div>}
        <div className="field">
          <label>Title</label>
          <input className="input" value={form.title} onChange={(event) => update("title", event.target.value)} />
        </div>
        <div className="field">
          <label>Slug</label>
          <input className="input" value={form.slug} onChange={(event) => update("slug", event.target.value)} />
        </div>
        <div className="field">
          <label>Statement</label>
          <textarea className="textarea" value={form.statement} onChange={(event) => update("statement", event.target.value)} />
        </div>
        <div className="field">
          <label>Input Format</label>
          <textarea className="textarea" value={form.inputFormat} onChange={(event) => update("inputFormat", event.target.value)} />
        </div>
        <div className="field">
          <label>Output Format</label>
          <textarea className="textarea" value={form.outputFormat} onChange={(event) => update("outputFormat", event.target.value)} />
        </div>
        <div className="field">
          <label>Constraints</label>
          <textarea className="textarea" value={form.constraints} onChange={(event) => update("constraints", event.target.value)} />
        </div>
        <div className="grid">
          <div className="field">
            <label>Judge Mode</label>
            <select className="select" value={form.judgeMode} onChange={(event) => update("judgeMode", event.target.value)}>
              <option value="FUNCTION">Function (LeetCode-style)</option>
              <option value="STDIN">Standard input</option>
            </select>
          </div>
          <div className="field"><label>Function Name</label><input className="input" value={form.functionName} onChange={(event) => update("functionName", event.target.value)} /></div>
          <div className="field"><label>Argument Types</label><input className="input" value={form.argumentTypes} onChange={(event) => update("argumentTypes", event.target.value)} placeholder="int,int or int[]" /></div>
          <div className="field"><label>Return Type</label><input className="input" value={form.returnType} onChange={(event) => update("returnType", event.target.value)} /></div>
        </div>
        <div className="grid">
          <div className="field">
            <label>Difficulty</label>
            <select className="select" value={form.difficulty} onChange={(event) => update("difficulty", event.target.value)}>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>
          <div className="field">
            <label>Time Limit MS</label>
            <input className="input" type="number" value={form.timeLimitMs} onChange={(event) => update("timeLimitMs", Number(event.target.value))} />
          </div>
          <div className="field">
            <label>Memory MB</label>
            <input className="input" type="number" value={form.memoryLimitMb} onChange={(event) => update("memoryLimitMb", Number(event.target.value))} />
          </div>
        </div>
        <button className="btn primary" disabled={loading}>
          <Save size={16} /> Create
        </button>
      </form>
    </main>
  );
}
