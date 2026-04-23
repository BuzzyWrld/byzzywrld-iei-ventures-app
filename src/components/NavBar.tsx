"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { IeiMark } from "./IeiMark";
import { logoutAction } from "@/app/actions/auth";

// Primary nav intentionally empty — the logo links home, and the workspace
// is normally the user's brand (or list view if they have multiple).

const HIDE_ON = ["/login", "/signup"];

export function NavBar({ initials = "?", email }: { initials?: string; email?: string }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  if (HIDE_ON.some((p) => pathname.startsWith(p))) return null;

  return (
    <header className="nav sticky top-0 z-30" role="banner">
      <div className="max-w-[1280px] mx-auto flex items-center gap-6 px-5 md:px-6 py-3">
        <Link
          href="/"
          className="flex items-center gap-2.5 shrink-0"
          aria-label="IEI Ventures home"
        >
          <IeiMark size="md" />
          <span className="font-medium tracking-tight hidden sm:inline">IEI Ventures</span>
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <button className="btn btn-ghost btn-sm hidden md:inline-flex" aria-label="Search">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="7" cy="7" r="4.5" />
              <path d="M10.5 10.5L14 14" />
            </svg>
            <span style={{ color: "var(--color-text-muted)" }}>Search</span>
            <span className="kbd">⌘K</span>
          </button>
          <Link href="/new" className="btn btn-primary btn-sm">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M6 2v8M2 6h8" />
            </svg>
            New brand
          </Link>
          <div ref={menuRef} className="relative">
            <button
              className="btn btn-ghost btn-icon"
              aria-label="Account"
              aria-haspopup="true"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span
                className="inline-flex items-center justify-center w-7 h-7 rounded-full font-mono text-[11px]"
                style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}
              >
                {initials}
              </span>
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-md border shadow-lg z-40"
                style={{
                  background: "var(--color-surface)",
                  borderColor: "var(--color-border)",
                  boxShadow: "var(--sh-2)",
                }}
                role="menu"
              >
                {email && (
                  <div
                    className="px-3 py-2 border-b text-xs"
                    style={{
                      color: "var(--color-text-muted)",
                      borderColor: "var(--color-border)",
                    }}
                  >
                    <div className="kicker mb-0.5">Signed in as</div>
                    <div className="truncate" style={{ color: "var(--color-text)" }}>
                      {email}
                    </div>
                  </div>
                )}
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--color-surface-2)]"
                    role="menuitem"
                  >
                    Sign out
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
