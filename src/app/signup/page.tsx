"use client";

import Link from "next/link";
import { useActionState } from "react";
import { IeiMark } from "@/components/IeiMark";
import { signupAction } from "@/app/actions/auth";

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signupAction, null);

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
              One account per operator. Invite teammates later.
            </p>
            <form action={formAction} className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block" htmlFor="name">
                  Full name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className={`input ${state?.error ? "is-error" : ""}`}
                  placeholder="Hector Barbosa"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block" htmlFor="email">
                  Work email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={`input ${state?.error ? "is-error" : ""}`}
                  placeholder="you@company.com"
                  autoComplete="email"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block" htmlFor="pw">
                  Password{" "}
                  <span
                    className="font-mono text-xs"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    (8+ chars)
                  </span>
                </label>
                <input
                  id="pw"
                  name="password"
                  type="password"
                  className={`input ${state?.error ? "is-error" : ""}`}
                  autoComplete="new-password"
                  required
                  minLength={8}
                />
              </div>
              {state?.error && (
                <div
                  className="p-3 rounded-md text-sm flex items-start gap-2"
                  style={{
                    background: "#faf0ee",
                    border: "1px solid var(--color-status-failed)",
                    color: "var(--color-status-failed)",
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    style={{ marginTop: 2, flexShrink: 0 }}
                  >
                    <circle cx="8" cy="8" r="6" />
                    <path d="M8 5v4M8 11h.01" />
                  </svg>
                  <div>
                    <strong>Couldn&apos;t create account.</strong> {state.error}.
                  </div>
                </div>
              )}
              <button type="submit" className="btn btn-primary btn-lg mt-2" disabled={pending}>
                {pending ? (
                  <>
                    <span className="spinner" /> Creating…
                  </>
                ) : (
                  "Create account"
                )}
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
          className="font-mono text-xs"
          style={{ color: "var(--color-text-muted)" }}
        >
          © 2026 IEI Ventures
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
