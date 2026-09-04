"use client";

import { Eye, EyeOff, KeyRound, Mail, User, UserPlus } from "lucide-react";
import { FormEvent, useState } from "react";
import { apiRequest } from "../../lib/api";
import { clearLegacyToken } from "../../lib/auth";
import { ArcadeButton } from "../../components/ui/ArcadeButton";
import { AuthFootLink, AuthShell } from "../../components/ui/AuthShell";

const inputWrap =
  "flex min-h-[42px] items-center gap-2 rounded-lg border border-[var(--line-strong)] bg-[var(--bg-elevated)] px-3 text-[var(--muted)] focus-within:border-[var(--accent)]";
const inputCls = "w-full bg-transparent text-sm text-[var(--text-strong)] outline-none placeholder:text-[var(--muted)]";

export default function RegisterPage() {
  const [name, setName] = useState("");
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
      await apiRequest("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
      clearLegacyToken();
      window.location.href = "/problems";
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="CodeArcade"
      title="Create your account."
      blurb="Sign up once, submit solutions, and climb the leaderboard."
      cardTitle="Sign up"
      cardHint="Free forever. No credit card."
      foot={<AuthFootLink href="/login" label="Sign in" prefix="Have an account?" />}
    >
      <form onSubmit={submit} className="grid gap-3.5">
        {message && (
          <div className="rounded-lg bg-[var(--danger-soft)] px-4 py-2.5 text-sm font-medium text-[var(--danger)]">
            {message}
          </div>
        )}
        <label className="grid gap-1.5">
          <span className="text-[13px] font-medium text-[var(--text-strong)]">Username</span>
          <span className={inputWrap}>
            <User size={15} />
            <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="username" placeholder="pick a handle" className={inputCls} />
          </span>
        </label>
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
            <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" placeholder="Min 6 characters" className={inputCls} />
            <button type="button" onClick={() => setShowPassword((v) => !v)} className="rounded-md p-1.5 hover:bg-[var(--surface-soft)]" title={showPassword ? "Hide" : "Show"}>
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </span>
        </label>
        <ArcadeButton variant="primary" disabled={loading} className="mt-1 w-full">
          <UserPlus size={15} /> {loading ? "Creating…" : "Sign up"}
        </ArcadeButton>
      </form>
    </AuthShell>
  );
}
