"use client";

import { Eye, EyeOff, KeyRound, LogIn, Mail } from "lucide-react";
import { FormEvent, useState } from "react";
import { apiRequest } from "../../lib/api";
import { clearLegacyToken } from "../../lib/auth";
import { ArcadeButton } from "../../components/ui/ArcadeButton";
import { AuthFootLink, AuthShell } from "../../components/ui/AuthShell";

const inputWrap =
  "flex min-h-[42px] items-center gap-2 rounded-lg border border-[var(--line-strong)] bg-[var(--bg-elevated)] px-3 text-[var(--muted)] focus-within:border-[var(--accent)]";
const inputCls = "w-full bg-transparent text-sm text-[var(--text-strong)] outline-none placeholder:text-[var(--muted)]";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      clearLegacyToken();
      window.location.href = "/problems";
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="CodeArcade"
      title="Sign in to start solving."
      blurb="One account for problems, submissions, leaderboard progress, and admin tools."
      cardTitle="Sign in"
      cardHint="Welcome back."
      foot={<AuthFootLink href="/register" label="Sign up" prefix="New to CodeArcade?" />}
    >
      <form onSubmit={submit} className="grid gap-3.5">
        {message && (
          <div className="rounded-lg bg-[var(--danger-soft)] px-4 py-2.5 text-sm font-medium text-[var(--danger)]">
            {message}
          </div>
        )}
        <label className="grid gap-1.5">
          <span className="text-[13px] font-medium text-[var(--text-strong)]">Email</span>
          <span className={inputWrap}>
            <Mail size={15} />
            <input value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="you@example.com" className={inputCls} />
          </span>
        </label>
        <label className="grid gap-1.5">
          <span className="text-[13px] font-medium text-[var(--text-strong)]">Password</span>
          <span className={inputWrap}>
            <KeyRound size={15} />
            <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" placeholder="••••••••" className={inputCls} />
            <button type="button" onClick={() => setShowPassword((v) => !v)} className="rounded-md p-1.5 hover:bg-[var(--surface-soft)]" title={showPassword ? "Hide" : "Show"}>
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </span>
        </label>
        <ArcadeButton variant="primary" disabled={loading} className="mt-1 w-full">
          <LogIn size={15} /> {loading ? "Signing in…" : "Sign in"}
        </ArcadeButton>
      </form>
    </AuthShell>
  );
}
