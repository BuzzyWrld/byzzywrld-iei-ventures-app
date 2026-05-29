"use client";

import { signIn } from "next-auth/react";

export function OAuthButtons({
  callbackUrl = "/onboarding",
}: {
  callbackUrl?: string;
}) {
  return (
    <div style={{ display: "flex", gap: 10 }}>
      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl })}
        style={socialBtnStyle}
      >
        Google
      </button>
    </div>
  );
}

const socialBtnStyle: React.CSSProperties = {
  flex: 1,
  background: "transparent",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.15)",
  padding: "12px 20px",
  borderRadius: 6,
  fontWeight: 500,
  fontSize: 13,
  cursor: "pointer",
  fontFamily: "'DM Sans', sans-serif",
};
