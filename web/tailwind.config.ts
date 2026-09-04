import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        arcade: {
          bg: "var(--bg)",
          elevated: "var(--bg-elevated)",
          surface: "var(--surface)",
          soft: "var(--surface-soft)",
          muted: "var(--surface-muted)",
          line: "var(--line)",
          text: "var(--text)",
          strong: "var(--text-strong)",
          faint: "var(--muted)",
          accent: "var(--accent)",
          accentStrong: "var(--accent-strong)",
          accentSoft: "var(--accent-soft)",
        },
      },
      boxShadow: {
        arcade: "var(--shadow-md)",
        glow: "0 0 0 1px rgba(45,212,191,.35), 0 8px 40px rgba(45,212,191,.25)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
