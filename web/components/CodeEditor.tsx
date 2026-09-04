"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

export function CodeEditor({
  language,
  value,
  onChange,
  height = "560px",
  readOnly = false,
}: {
  language: "JAVA" | "CPP";
  value: string;
  onChange?: (value: string) => void;
  height?: string;
  readOnly?: boolean;
}) {
  const [theme, setTheme] = useState("vs-dark");

  useEffect(() => {
    const sync = () =>
      setTheme(document.documentElement.dataset.theme === "light" ? "light" : "vs-dark");
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--line)] bg-[#1e1e1e]">
      <div className="flex items-center gap-2 border-b border-[var(--line)] bg-[var(--surface)] px-4 py-2">
        <span className="font-mono text-[12px] text-[var(--muted)]">
          {language === "JAVA" ? "Solution.java" : "solution.cpp"}
        </span>
        {readOnly && (
          <span className="ml-auto text-[11px] font-medium uppercase tracking-wider text-[var(--muted)]">
            read-only
          </span>
        )}
      </div>
      <MonacoEditor
        height={height}
        theme={theme}
        language={language === "JAVA" ? "java" : "cpp"}
        value={value}
        onChange={(next) => onChange?.(next ?? "")}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 14 },
          readOnly,
          renderLineHighlight: readOnly ? "none" : "all",
          stickyScroll: { enabled: false },
        }}
      />
    </div>
  );
}
