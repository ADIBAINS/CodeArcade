"use client";

import Link from "next/link";
import { Eye, EyeOff, KeyRound, LogIn, Mail } from "lucide-react";
import { FormEvent, useState } from "react";
import { apiRequest } from "../../lib/api";
import { clearLegacyToken } from "../../lib/auth";

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
        body: JSON.stringify({ email, password })
      });
      clearLegacyToken();
      window.location.href = "/problems";
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-hero">
        <div className="auth-copy">
          <span className="eyebrow">CodeArcade Judge</span>
          <h1>Sign in to submit and track verdicts.</h1>
          <p>
            Continue to problems, submissions, leaderboard progress, and admin tools when your account has access.
          </p>
        </div>
        <form className="auth-card" onSubmit={submit}>
          <div className="auth-card-head">
            <h2>Welcome Back</h2>
            <p className="muted">Use your account credentials to continue.</p>
          </div>
          {message && <div className="message error">{message}</div>}
          <div className="field">
            <label>Email</label>
            <div className="input-wrap">
              <Mail size={17} />
              <input value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
            </div>
          </div>
          <div className="field">
            <label>Password</label>
            <div className="input-wrap">
              <KeyRound size={17} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
              />
              <button
                className="input-icon-btn"
                type="button"
                title={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>
          <button className="btn primary wide-btn" disabled={loading}>
            <LogIn size={16} /> {loading ? "Signing in..." : "Login"}
          </button>
          <p className="auth-foot">
            New here? <Link href="/register">Create an account</Link>
          </p>
        </form>
      </section>
    </main>
  );
}
