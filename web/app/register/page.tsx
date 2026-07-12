"use client";

import Link from "next/link";
import { Eye, EyeOff, KeyRound, Mail, User, UserPlus } from "lucide-react";
import { FormEvent, useState } from "react";
import { apiRequest } from "../../lib/api";
import { clearLegacyToken } from "../../lib/auth";

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
        body: JSON.stringify({ name, email, password })
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
    <main className="auth-page">
      <section className="auth-hero">
        <div className="auth-copy">
          <span className="eyebrow">New Competitor</span>
          <h1>Create your CodeArcade account.</h1>
          <p>Register once, submit solutions, inspect verdicts, and climb the leaderboard as problems are solved.</p>
        </div>
        <form className="auth-card" onSubmit={submit}>
          <div className="auth-card-head">
            <h2>Register</h2>
            <p className="muted">Your account starts as a normal user. Admin access is seeded separately.</p>
          </div>
          {message && <div className="message error">{message}</div>}
          <div className="field">
            <label>Name</label>
            <div className="input-wrap">
              <User size={17} />
              <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" />
            </div>
          </div>
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
                autoComplete="new-password"
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
            <UserPlus size={16} /> {loading ? "Creating..." : "Create Account"}
          </button>
          <p className="auth-foot">
            Already registered? <Link href="/login">Login instead</Link>
          </p>
        </form>
      </section>
    </main>
  );
}
