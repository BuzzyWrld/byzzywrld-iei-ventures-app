"use client";

import Link from "next/link";
import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { loginAction } from "@/app/actions/auth";
import { OAuthButtons } from "@/components/auth/OAuthButtons";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const [state, formAction, pending] = useActionState(loginAction, null);
  const linkRequired = useSearchParams().get("error") === "link_required";

  return (
    <div
      style={{
        background: "#0A0A0A",
        color: "#fff",
        minHeight: "100vh",
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          minHeight: "100vh",
        }}
      >
        {/* ============ LEFT: YELLOW BRAND PANEL ============ */}
        <div
          style={{
            background: "#F5CE00",
            padding: "52px 48px 52px 0",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          {/* Spacer to keep space-between layout */}
          <div />

          {/* Tagline block — right-aligned, text right */}
          <div style={{ textAlign: "right", maxWidth: 400 }}>
            {/* Logo — above eyebrow */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "flex-end", marginBottom: 18 }}>
              <div
                style={{
                  width: 26,
                  height: 26,
                  border: "1.5px solid #0A0A0A",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#0A0A0A",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                IEI
              </div>
              <span
                style={{
                  fontWeight: 700,
                  fontSize: 14,
                  color: "#0A0A0A",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                Ventures
              </span>
            </div>
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "3px",
                textTransform: "uppercase",
                color: "rgba(0,0,0,0.5)",
                marginBottom: 18,
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              A Branch of IEI Agency
            </p>
            <h2
              style={{
                fontSize: 62,
                fontWeight: 700,
                lineHeight: 1.06,
                color: "#0A0A0A",
                margin: 0,
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              From Intake
              <br />
              To Identity
              <br />
              To Income.
            </h2>
            <p
              style={{
                fontSize: 16,
                color: "rgba(0,0,0,0.6)",
                lineHeight: 1.6,
                marginTop: 22,
              }}
            >
              The AI platform that builds your brand foundation and the systems
              to grow it.
            </p>
          </div>

          {/* Social proof */}
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ fontSize: 11, color: "rgba(0,0,0,0.55)" }}>
              <strong style={{ color: "#0A0A0A" }}>2,847</strong> brands built
            </div>
            <div
              style={{
                width: 1,
                height: 16,
                background: "rgba(0,0,0,0.15)",
              }}
            />
            <div style={{ fontSize: 11, color: "rgba(0,0,0,0.55)" }}>
              <strong style={{ color: "#0A0A0A" }}>$497</strong> starter
            </div>
          </div>
        </div>

        {/* ============ RIGHT: AUTH FORM ============ */}
        <div
          style={{
            padding: "52px 0 52px 48px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            maxWidth: 480,
          }}
        >
          {/* Eyebrow */}
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "3px",
              textTransform: "uppercase",
              color: "#F5CE00",
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            Sign In
          </span>

          {/* Heading */}
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              lineHeight: 1.1,
              margin: "10px 0 8px",
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            Welcome back
          </h1>
          <p
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.55)",
              lineHeight: 1.6,
              marginBottom: 28,
            }}
          >
            Sign in to continue building your brand.
          </p>

          {/* Account-takeover guard: Google matched an existing account that
              isn't linked to it. Tell them to sign in normally then link. */}
          {linkRequired && (
            <div
              style={{
                border: "1px solid rgba(245,206,0,0.4)",
                background: "rgba(245,206,0,0.08)",
                color: "#F5CE00",
                borderRadius: 6,
                padding: "12px 14px",
                fontSize: 12.5,
                lineHeight: 1.5,
                marginBottom: 16,
              }}
            >
              An account already exists for this email. Sign in with your email &amp;
              password, then connect Google from <strong>Settings</strong>.
            </div>
          )}

          {/* Social auth buttons */}
          <div style={{ marginBottom: 16 }}>
            <OAuthButtons callbackUrl="/onboarding" />
          </div>

          {/* OR divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              margin: "8px 0 16px",
            }}
          >
            <div
              style={{
                flex: 1,
                height: 1,
                background: "rgba(255,255,255,0.08)",
              }}
            />
            <span
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.35)",
                letterSpacing: "2px",
              }}
            >
              OR
            </span>
            <div
              style={{
                flex: 1,
                height: 1,
                background: "rgba(255,255,255,0.08)",
              }}
            />
          </div>

          {/* Email + Password form */}
          <form action={formAction}>
            <label style={labelStyle}>Email</label>
            <input
              name="email"
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              required
              style={{ ...inputStyle, marginBottom: 12 }}
            />

            <label style={labelStyle}>Password</label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
              minLength={8}
              style={{ ...inputStyle, marginBottom: 18 }}
            />

            {/* Error */}
            {state?.error && (
              <p
                style={{
                  fontSize: 12,
                  color: "#F87171",
                  marginBottom: 12,
                }}
              >
                {state.error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={pending}
              style={{
                background: "#F5CE00",
                color: "#0A0A0A",
                border: "none",
                padding: "14px 22px",
                borderRadius: 6,
                fontWeight: 600,
                fontSize: 14,
                cursor: pending ? "not-allowed" : "pointer",
                fontFamily: "'DM Sans', sans-serif",
                letterSpacing: "0.2px",
                width: "100%",
                opacity: pending ? 0.7 : 1,
                transition: "all 0.15s",
              }}
            >
              {pending ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Sign up link */}
          <p
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.4)",
              marginTop: 14,
              textAlign: "center",
            }}
          >
            New here?{" "}
            <Link
              href="/signup"
              style={{ color: "#F5CE00", textDecoration: "none" }}
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  color: "rgba(255,255,255,0.5)",
  fontWeight: 500,
  letterSpacing: "0.5px",
  textTransform: "uppercase",
  marginBottom: 8,
  display: "block",
};

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#fff",
  padding: "14px 16px",
  borderRadius: 6,
  fontSize: 14,
  width: "100%",
  fontFamily: "'DM Sans', sans-serif",
  outline: "none",
};
