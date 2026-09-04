import type { Metadata } from "next";
import { SquareTerminal } from "lucide-react";
import { Navbar } from "../components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "CodeArcade — Solve coding problems",
  description: "Solve DSA problems, get instant verdicts, climb the leaderboard.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var stored = window.localStorage.getItem("codearcade_theme");
                  var theme = stored || "dark";
                  document.documentElement.dataset.theme = theme;
                } catch (error) {
                  document.documentElement.dataset.theme = "dark";
                }
              })();
            `,
          }}
        />
      </head>
      <body>
        <div className="shell flex min-h-screen flex-col">
          <Navbar />
          <div className="flex-1">{children}</div>
          <footer className="border-t border-[var(--line)]">
            <div className="mx-auto flex w-[min(1180px,calc(100%-32px))] flex-wrap items-center gap-2 py-5 text-[13px] text-[var(--muted)]">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-[var(--surface-soft)] text-[var(--accent)]">
                <SquareTerminal size={13} />
              </span>
              <span className="font-semibold text-[var(--text-strong)]">CodeArcade</span>
              <span className="ml-auto font-mono text-xs">AC · WA · TLE · CE · RE</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
