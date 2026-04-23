"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IeiMark } from "./IeiMark";

const PRIMARY = [
  { href: "/", label: "Projects" },
  { href: "/templates", label: "Templates" },
  { href: "/docs", label: "Docs" },
];

export function NavBar() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

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

        <nav className="hidden md:flex items-center gap-1 text-sm" aria-label="Primary">
          {PRIMARY.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1.5 rounded ${isActive(item.href) ? "active" : ""}`}
              style={isActive(item.href) ? undefined : { color: "var(--color-text-muted)" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

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
          <button className="btn btn-ghost btn-icon" aria-label="Account">
            <span
              className="inline-flex items-center justify-center w-7 h-7 rounded-full font-mono text-[11px]"
              style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}
            >
              HB
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
