import Link from "next/link";
import { IeiMark } from "@/components/IeiMark";

// Auth is stubbed — no backend yet. Form submits are no-ops.
// When we wire Supabase/Clerk, swap the onSubmit + add real validation.

export default function LoginPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <div className="flex flex-col px-6 md:px-12 lg:px-20 py-8">
        <Link href="/" className="flex items-center gap-2.5">
          <IeiMark size="md" />
          <span className="font-medium tracking-tight">IEI Ventures</span>
        </Link>
        <div className="flex-1 flex items-center justify-center py-10">
          <div className="w-full max-w-[400px]">
            <div className="kicker mb-2">Sign in</div>
            <h1 className="font-serif leading-[1.05] mb-2" style={{ fontSize: 40 }}>
              Welcome back.
            </h1>
            <p className="text-sm mb-7" style={{ color: "var(--color-text-muted)" }}>
              Email + password, or Google. (Auth lands next.)
            </p>
            <form className="flex flex-col gap-4" action="#">
              <div>
                <label className="text-sm font-medium mb-1.5 block" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className="input"
                  placeholder="you@company.com"
                  autoComplete="email"
                />
              </div>
              <div>
                <div className="flex items-baseline justify-between mb-1.5">
                  <label className="text-sm font-medium" htmlFor="pw">
                    Password
                  </label>
                  <Link
                    href="/reset"
                    className="text-xs hover:underline"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Forgot?
                  </Link>
                </div>
                <input
                  id="pw"
                  type="password"
                  className="input"
                  autoComplete="current-password"
                />
              </div>
              <button type="submit" className="btn btn-primary btn-lg mt-2" disabled>
                Sign in (not wired)
              </button>
            </form>
            <div
              className="flex items-center gap-3 my-6 text-xs font-mono"
              style={{ color: "var(--color-text-muted)" }}
            >
              <div className="flex-1 h-px" style={{ background: "var(--color-border)" }} />
              OR
              <div className="flex-1 h-px" style={{ background: "var(--color-border)" }} />
            </div>
            <button className="btn btn-secondary btn-lg w-full" disabled>
              <svg width="16" height="16" viewBox="0 0 18 18">
                <path
                  fill="#4285F4"
                  d="M17.64 9.2c0-.64-.06-1.25-.17-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"
                />
                <path
                  fill="#34A853"
                  d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.83.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.92v2.32A8.99 8.99 0 009 18z"
                />
                <path
                  fill="#FBBC05"
                  d="M3.97 10.72A5.41 5.41 0 013.68 9c0-.6.1-1.18.29-1.72V4.96H.92A8.99 8.99 0 000 9c0 1.45.35 2.82.92 4.04l3.05-2.32z"
                />
                <path
                  fill="#EA4335"
                  d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.92 4.96l3.05 2.32C4.68 5.16 6.66 3.58 9 3.58z"
                />
              </svg>
              Continue with Google
            </button>
            <p className="mt-7 text-sm text-center" style={{ color: "var(--color-text-muted)" }}>
              New here?{" "}
              <Link href="/signup" className="underline" style={{ color: "var(--color-text)" }}>
                Create an account
              </Link>
            </p>
          </div>
        </div>
        <div
          className="flex items-center justify-between font-mono text-xs"
          style={{ color: "var(--color-text-muted)" }}
        >
          <span>© 2026 IEI Ventures</span>
          <div className="flex gap-4">
            <Link href="/docs" className="hover:text-[var(--color-text)]">
              Docs
            </Link>
            <Link href="/privacy" className="hover:text-[var(--color-text)]">
              Privacy
            </Link>
          </div>
        </div>
      </div>
      <aside
        className="hidden md:flex flex-col justify-between p-12"
        style={{ background: "var(--color-primary)", color: "var(--color-surface)" }}
      >
        <div className="kicker" style={{ color: "#9a9f99" }}>
          From intake · to identity · to income
        </div>
        <blockquote
          className="font-serif leading-[1.15]"
          style={{ fontSize: 36, maxWidth: "22ch" }}
        >
          &ldquo;A serious tool, quietly presented.&rdquo;
        </blockquote>
        <div
          className="font-mono text-xs"
          style={{ color: "#9a9f99", letterSpacing: "0.14em", textTransform: "uppercase" }}
        >
          IEI Ventures · 2026
        </div>
      </aside>
    </div>
  );
}
