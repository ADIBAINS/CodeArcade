"use client";

import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

export function CodeEditor({
  language,
  value,
  onChange
}: {
  language: "JAVA" | "CPP";
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="editor-shell">
      <MonacoEditor
        height="520px"
        theme="vs-dark"
        language={language === "JAVA" ? "java" : "cpp"}
        value={value}
        onChange={(next) => onChange(next ?? "")}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          scrollBeyondLastLine: false,
          automaticLayout: true
        }}
      />
    </div>
  );
}

