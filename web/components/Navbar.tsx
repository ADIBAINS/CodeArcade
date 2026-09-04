"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gamepad2, LogIn, LogOut, Menu, Shield, UserCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api";
import { AuthUser, clearLegacyToken } from "../lib/auth";
import { cn } from "../lib/cn";
import { ThemeToggle } from "./ThemeToggle";

const LINKS = [
  { href: "/problems", label: "Problems" },
  { href: "/submissions", label: "Submissions" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/requests", label: "Requests" },
];

export function Navbar() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

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

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--bg-elevated)_88%,transparent)] backdrop-blur-xl">
      <nav className="mx-auto flex min-h-[68px] w-[min(1180px,calc(100%-32px))] items-center gap-2">
        <Link href="/" className="mr-auto flex items-center gap-2.5 py-3">
          <span className="neon-btn flex h-9 w-9 items-center justify-center rounded-xl text-white">
            <Gamepad2 size={18} />
          </span>
          <span className="text-lg font-black tracking-tight text-[var(--text-strong)]">
            Code<span className="text-teal-300">Arcade</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "inline-flex min-h-[36px] items-center rounded-lg px-3 text-sm font-bold transition",
                isActive(link.href)
                  ? "bg-teal-400/10 text-teal-300"
                  : "text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)]"
              )}
            >
              {link.label}
            </Link>
          ))}
          {user?.role === "ADMIN" && (
            <>
              <Link
                href="/admin/problems"
                className={cn(
                  "inline-flex min-h-[36px] items-center rounded-lg px-3 text-sm font-bold",
                  isActive("/admin/problems")
                    ? "bg-teal-400/10 text-teal-300"
                    : "text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)]"
                )}
              >
                Admin
              </Link>
              <Link
                href="/admin/requests"
                className={cn(
                  "inline-flex min-h-[36px] items-center rounded-lg px-3 text-sm font-bold",
                  isActive("/admin/requests")
                    ? "bg-teal-400/10 text-teal-300"
                    : "text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)]"
                )}
              >
                Review
              </Link>
            </>
          )}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggle />
          {!loaded ? (
            <div className="skeleton h-9 w-40 !rounded-full" />
          ) : user ? (
            <>
              <div
                className="inline-flex max-w-[210px] items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-sm font-extrabold text-teal-300"
                title={user.email}
              >
                {user.role === "ADMIN" ? <Shield size={15} /> : <UserCircle size={15} />}
                <span className="truncate">{user.name}</span>
              </div>
              <button
                className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-full border border-[var(--line)] text-[var(--muted)] transition hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-300"
                title="Sign out"
                onClick={signOut}
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3.5 text-sm font-extrabold hover:bg-[var(--surface-soft)]"
              >
                <LogIn size={15} /> Login
              </Link>
              <Link
                href="/register"
                className="neon-btn inline-flex min-h-[38px] items-center rounded-xl px-3.5 text-sm font-extrabold text-white"
              >
                Register
              </Link>
            </>
          )}
        </div>

        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--line)] text-[var(--muted)] lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-[var(--line)] px-4 py-4 lg:hidden">
          <div className="grid gap-1">
            {[...LINKS, ...(user?.role === "ADMIN" ? [{ href: "/admin/problems", label: "Admin" }, { href: "/admin/requests", label: "Review" }] : [])].map(
              (link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-xl px-3 py-2.5 text-sm font-bold",
                    isActive(link.href)
                      ? "bg-teal-400/10 text-teal-300"
                      : "bg-[var(--surface-soft)] text-[var(--text)]"
                  )}
                >
                  {link.label}
                </Link>
              )
            )}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <ThemeToggle />
            {loaded &&
              (user ? (
                <>
                  <span className="flex-1 truncate rounded-xl border border-[var(--line)] px-3 py-2 text-sm font-bold text-teal-300">
                    {user.name}
                  </span>
                  <button
                    onClick={signOut}
                    className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-red-400/30 bg-red-500/10 px-3 text-sm font-bold text-red-300"
                  >
                    <LogOut size={15} /> Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="flex-1 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 text-center text-sm font-bold"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setOpen(false)}
                    className="neon-btn flex-1 rounded-xl px-3 py-2.5 text-center text-sm font-bold text-white"
                  >
                    Register
                  </Link>
                </>
              ))}
          </div>
        </div>
      )}
    </header>
  );
}
