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
    <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[#0b1020] shadow-[var(--shadow-md)]">
      <div className="flex items-center gap-1.5 border-b border-white/10 bg-white/[0.03] px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
        <span className="ml-3 font-mono text-[11px] uppercase tracking-widest text-slate-400">
          {language === "JAVA" ? "Solution.java" : "solution.cpp"}
        </span>
        {readOnly && (
          <span className="ml-auto rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
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
