"use client";

import { Eye, EyeOff, KeyRound, Mail, User, UserPlus } from "lucide-react";
import { FormEvent, useState } from "react";
import { apiRequest } from "../../lib/api";
import { clearLegacyToken } from "../../lib/auth";
import { ArcadeButton } from "../../components/ui/ArcadeButton";
import { AuthFootLink, AuthShell } from "../../components/ui/AuthShell";

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
      setMessage(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="New competitor"
      title="Create your arcade account."
      blurb="Register once, submit solutions, inspect verdicts, and climb the leaderboard as problems fall."
      cardTitle="Join the arcade"
      cardHint="Starts as a normal user. Admin access is seeded separately."
      foot={<AuthFootLink href="/login" label="Login instead" prefix="Already registered?" />}
    >
      <form onSubmit={submit} className="grid gap-4">
        {message && (
          <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2.5 text-sm font-bold text-red-300">
            {message}
          </div>
        )}
        <label className="grid gap-1.5">
          <span className="text-xs font-black uppercase tracking-widest text-[var(--muted)]">Name</span>
          <span className="flex min-h-[46px] items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)] px-3 text-[var(--muted)] focus-within:border-teal-300/60">
            <User size={16} />
            <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="PixelSolver" className="w-full bg-transparent text-sm text-[var(--text)] outline-none" />
          </span>
        </label>
        <label className="grid gap-1.5">
          <span className="text-xs font-black uppercase tracking-widest text-[var(--muted)]">Email</span>
          <span className="flex min-h-[46px] items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)] px-3 text-[var(--muted)] focus-within:border-teal-300/60">
            <Mail size={16} />
            <input value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="you@arcade.gg" className="w-full bg-transparent text-sm text-[var(--text)] outline-none" />
          </span>
        </label>
        <label className="grid gap-1.5">
          <span className="text-xs font-black uppercase tracking-widest text-[var(--muted)]">Password</span>
          <span className="flex min-h-[46px] items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)] px-3 text-[var(--muted)] focus-within:border-teal-300/60">
            <KeyRound size={16} />
            <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" placeholder="Min 6 characters" className="w-full bg-transparent text-sm text-[var(--text)] outline-none" />
            <button type="button" onClick={() => setShowPassword((v) => !v)} className="rounded-lg p-1.5 hover:bg-[var(--surface-muted)]" title={showPassword ? "Hide" : "Show"}>
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </span>
        </label>
        <ArcadeButton variant="primary" disabled={loading} className="w-full !min-h-[46px]">
          <UserPlus size={16} /> {loading ? "Creating…" : "Create account"}
        </ArcadeButton>
      </form>
    </AuthShell>
  );
}
