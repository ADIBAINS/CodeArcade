"use client";

import { Send } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CodeEditor } from "../../../components/CodeEditor";
import { DifficultyBadge } from "../../../components/DifficultyBadge";
import { apiRequest } from "../../../lib/api";

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
  testCases: { id: string; input: string; expected?: string; isHidden: boolean }[];
};

const javaTemplate = `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Write your solution here
    }
}
`;

const cppTemplate = `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    // Write your solution here
    return 0;
}
`;

export default function ProblemDetailPage() {
  const params = useParams<{ slug: string }>();
  const [problem, setProblem] = useState<ProblemDetail | null>(null);
  const [language, setLanguage] = useState<"JAVA" | "CPP">("JAVA");
  const [sourceCode, setSourceCode] = useState(javaTemplate);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const template = useMemo(() => (language === "JAVA" ? javaTemplate : cppTemplate), [language]);

  useEffect(() => {
    apiRequest<ProblemDetail>(`/api/problems/${params.slug}`)
      .then(setProblem)
      .catch((error) => setMessage(error instanceof Error ? error.message : "Failed to load problem"));
  }, [params.slug]);

  useEffect(() => {
    setSourceCode(template);
  }, [template]);

  async function submit() {
    if (!problem) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const submission = await apiRequest<{ id: string }>("/api/submissions", {
        method: "POST",
        body: JSON.stringify({ problemId: problem.id, language, sourceCode })
      });
      setMessage(`Submitted. Submission ID: ${submission.id}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Submission failed");
    } finally {
      setLoading(false);
    }
  }

  if (!problem) {
    return (
      <main className="container">
        <div className={message ? "message error" : "message"}>{message || "Loading problem..."}</div>
      </main>
    );
  }

  return (
    <main className="container">
      <div className="page-head">
        <div>
          <h1 className="page-title">{problem.title}</h1>
          <p className="muted">
            {problem.timeLimitMs} ms, {problem.memoryLimitMb} MB
          </p>
        </div>
        <DifficultyBadge difficulty={problem.difficulty} />
      </div>
      <section className="split">
        <div className="stack">
          <div className="card">
            <h3>Statement</h3>
            <p>{problem.statement}</p>
          </div>
          <div className="card">
            <h3>Input</h3>
            <p>{problem.inputFormat}</p>
          </div>
          <div className="card">
            <h3>Output</h3>
            <p>{problem.outputFormat}</p>
          </div>
          <div className="card">
            <h3>Constraints</h3>
            <p>{problem.constraints}</p>
          </div>
          {problem.testCases[0] && (
            <div className="card">
              <h3>Sample</h3>
              <strong>Input</strong>
              <pre>{problem.testCases[0].input}</pre>
              {problem.testCases[0].expected && (
                <>
                  <strong>Output</strong>
                  <pre>{problem.testCases[0].expected}</pre>
                </>
              )}
            </div>
          )}
        </div>
        <div className="stack">
          <div className="toolbar">
            <select
              className="select"
              value={language}
              onChange={(event) => setLanguage(event.target.value as "JAVA" | "CPP")}
            >
              <option value="JAVA">Java</option>
              <option value="CPP">C++</option>
            </select>
            <button className="btn primary" onClick={submit} disabled={loading}>
              <Send size={16} /> Submit
            </button>
          </div>
          {message && <div className={message.startsWith("Submitted") ? "message" : "message error"}>{message}</div>}
          <CodeEditor language={language} value={sourceCode} onChange={setSourceCode} />
        </div>
      </section>
    </main>
  );
}

