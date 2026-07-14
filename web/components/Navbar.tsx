"use client";

import Link from "next/link";
import { LogIn, LogOut, Shield, UserCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api";
import { AuthUser, clearLegacyToken } from "../lib/auth";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    apiRequest<{ user: AuthUser }>("/api/auth/me")
      .then((result) => setUser(result.user))
      .catch(() => {
        clearLegacyToken();
        setUser(null);
      })
      .finally(() => setLoaded(true));
  }, []);

  async function signOut() {
    await apiRequest("/api/auth/logout", { method: "POST" }).catch(() => null);
    clearLegacyToken();
    setUser(null);
    window.location.href = "/login";
  }

  return (
    <header className="nav">
      <nav className="nav-inner">
        <Link className="brand" href="/">
          CodeArcade
        </Link>
        <Link className="nav-link" href="/problems">
          Problems
        </Link>
        <Link className="nav-link" href="/submissions">
          Submissions
        </Link>
        <Link className="nav-link" href="/leaderboard">
          Leaderboard
        </Link>
        <Link className="nav-link" href="/requests">
          Requests
        </Link>
        {user?.role === "ADMIN" && (
          <>
            <Link className="nav-link" href="/admin/problems">
              Admin
            </Link>
            <Link className="nav-link" href="/admin/requests">
              Review
            </Link>
          </>
        )}
        <div className="nav-auth">
          <ThemeToggle />
          {!loaded ? (
            <div className="nav-auth-placeholder" />
          ) : user ? (
            <>
              <div className="user-pill" title={user.email}>
                {user.role === "ADMIN" ? <Shield size={16} /> : <UserCircle size={16} />}
                <span>{user.name}</span>
              </div>
              <button className="icon-btn danger-btn" title="Sign out" onClick={signOut}>
                <LogOut size={17} />
              </button>
            </>
          ) : (
            <>
              <Link className="btn nav-compact" href="/login">
                <LogIn size={16} /> Login
              </Link>
              <Link className="btn primary nav-compact" href="/register">
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
