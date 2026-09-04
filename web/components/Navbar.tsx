"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, Shield, SquareTerminal, UserCircle, X } from "lucide-react";
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

  const adminLinks =
    user?.role === "ADMIN"
      ? [
          { href: "/admin/problems", label: "Admin" },
          { href: "/admin/requests", label: "Review" },
        ]
      : [];

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--bg-elevated)]">
      <nav className="mx-auto flex min-h-[60px] w-[min(1180px,calc(100%-32px))] items-center gap-1">
        <Link href="/" className="mr-6 flex items-center gap-2 py-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--accent)] text-[var(--accent-ink)]">
            <SquareTerminal size={17} />
          </span>
          <span className="text-[17px] font-bold tracking-tight text-[var(--text-strong)]">
            CodeArcade
          </span>
        </Link>

        <div className="hidden items-center gap-0.5 lg:flex">
          {[...LINKS, ...adminLinks].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "inline-flex min-h-[36px] items-center rounded-md px-3 text-sm font-medium transition",
                isActive(link.href)
                  ? "text-[var(--text-strong)]"
                  : "text-[var(--muted)] hover:text-[var(--text-strong)]"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="ml-auto hidden items-center gap-2 lg:flex">
          <ThemeToggle />
          {!loaded ? (
            <div className="skeleton h-9 w-24 rounded-lg" />
          ) : user ? (
            <>
              <div
                className="inline-flex max-w-[200px] items-center gap-2 rounded-lg bg-[var(--surface-soft)] px-3 py-1.5 text-sm font-semibold text-[var(--text-strong)]"
                title={user.email}
              >
                {user.role === "ADMIN" ? <Shield size={14} /> : <UserCircle size={14} />}
                <span className="truncate">{user.name}</span>
              </div>
              <button
                className="inline-flex h-[36px] w-[36px] items-center justify-center rounded-lg text-[var(--muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--text-strong)]"
                title="Sign out"
                onClick={signOut}
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="inline-flex min-h-[36px] items-center rounded-lg bg-[var(--accent)] px-5 text-sm font-semibold text-[var(--accent-ink)] transition hover:bg-[var(--accent-strong)]"
            >
              Sign in
            </Link>
          )}
        </div>

        <button
          className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-lg text-[var(--muted)] hover:bg-[var(--surface-soft)] lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-[var(--line)] px-4 py-3 lg:hidden">
          <div className="grid gap-0.5">
            {[...LINKS, ...adminLinks].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-sm font-medium",
                  isActive(link.href)
                    ? "bg-[var(--surface-soft)] text-[var(--text-strong)]"
                    : "text-[var(--muted)]"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2 border-t border-[var(--line)] pt-3">
            <ThemeToggle />
            {loaded &&
              (user ? (
                <>
                  <span className="flex-1 truncate px-2 text-sm font-semibold text-[var(--text-strong)]">
                    {user.name}
                  </span>
                  <button
                    onClick={signOut}
                    className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-[var(--surface-soft)] px-3 text-sm font-semibold"
                  >
                    <LogOut size={15} /> Sign out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-lg bg-[var(--accent)] px-3 py-2.5 text-center text-sm font-semibold text-[var(--accent-ink)]"
                >
                  Sign in
                </Link>
              ))}
          </div>
        </div>
      )}
    </header>
  );
}
