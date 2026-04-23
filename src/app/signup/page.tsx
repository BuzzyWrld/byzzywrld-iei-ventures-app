import Link from "next/link";
import { IeiMark } from "@/components/IeiMark";

// Auth is stubbed — same pattern as /login.

export default function SignupPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <div className="flex flex-col px-6 md:px-12 lg:px-20 py-8">
        <Link href="/" className="flex items-center gap-2.5">
          <IeiMark size="md" />
          <span className="font-medium tracking-tight">IEI Ventures</span>
        </Link>
        <div className="flex-1 flex items-center justify-center py-10">
          <div className="w-full max-w-[400px]">
            <div className="kicker mb-2">Create account</div>
            <h1 className="font-serif leading-[1.05] mb-2" style={{ fontSize: 40 }}>
              Start a workspace.
            </h1>
            <p className="text-sm mb-7" style={{ color: "var(--color-text-muted)" }}>
              One workspace per agency. Invite the team once you&apos;re in.
            </p>
            <form className="flex flex-col gap-4" action="#">
              <div>
                <label className="text-sm font-medium mb-1.5 block" htmlFor="name">
                  Full name
                </label>
                <input id="name" type="text" className="input" placeholder="Hector Barbosa" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block" htmlFor="workspace">
                  Workspace name
                </label>
                <input
                  id="workspace"
                  type="text"
                  className="input"
                  placeholder="e.g. Aurelian Labs"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block" htmlFor="email">
                  Work email
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
                <label className="text-sm font-medium mb-1.5 block" htmlFor="pw">
                  Password
                </label>
                <input
                  id="pw"
                  type="password"
                  className="input"
                  autoComplete="new-password"
                />
              </div>
              <button type="submit" className="btn btn-primary btn-lg mt-2" disabled>
                Create account (not wired)
              </button>
            </form>
            <p className="mt-7 text-sm text-center" style={{ color: "var(--color-text-muted)" }}>
              Already have an account?{" "}
              <Link href="/login" className="underline" style={{ color: "var(--color-text)" }}>
                Sign in
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
        <div>
          <div
            className="font-serif leading-[1.15] mb-4"
            style={{ fontSize: 32, maxWidth: "24ch" }}
          >
            Build a brand in the time it used to take to schedule the kickoff call.
          </div>
          <ul
            className="text-sm space-y-2 font-mono"
            style={{ color: "#c3cdbf", letterSpacing: "0.04em" }}
          >
            <li>— 18–28 page brand playbook</li>
            <li>— Landing page, ready to host</li>
            <li>— Logo + brand JSON + SVG suite</li>
          </ul>
        </div>
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
