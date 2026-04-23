"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteBrandButton({
  brandId,
  brandName,
  onDeleted,
  variant = "icon",
}: {
  brandId: string;
  brandName: string;
  onDeleted?: () => void;
  /** 'icon' = compact trash button for lists, 'text' = labeled button for brand panel header */
  variant?: "icon" | "text";
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const ok = window.confirm(
      `Delete "${brandName}"? This removes the project and all generated files. Can't be undone.`
    );
    if (!ok) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/brands/${brandId}`, { method: "DELETE" });
      if (!res.ok) {
        alert(`Delete failed: HTTP ${res.status}`);
        setBusy(false);
        return;
      }
      if (onDeleted) onDeleted();
      else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      alert(`Delete failed: ${err instanceof Error ? err.message : String(err)}`);
      setBusy(false);
    }
  }

  if (variant === "text") {
    return (
      <button
        type="button"
        className="btn btn-destructive btn-sm"
        onClick={handleClick}
        disabled={busy}
        title="Delete brand"
      >
        {busy ? "Deleting…" : "Delete brand"}
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-label={`Delete ${brandName}`}
      title="Delete"
      onClick={handleClick}
      disabled={busy}
      className="inline-flex items-center justify-center rounded"
      style={{
        width: 28,
        height: 28,
        color: busy ? "var(--color-text-muted)" : "var(--color-text-muted)",
        background: "transparent",
        border: "1px solid transparent",
        cursor: busy ? "wait" : "pointer",
        transition: "background 120ms, border-color 120ms, color 120ms",
      }}
      onMouseEnter={(e) => {
        if (busy) return;
        const t = e.currentTarget;
        t.style.color = "var(--color-status-failed)";
        t.style.borderColor = "var(--color-status-failed)";
        t.style.background = "#faf0ee";
      }}
      onMouseLeave={(e) => {
        const t = e.currentTarget;
        t.style.color = "var(--color-text-muted)";
        t.style.borderColor = "transparent";
        t.style.background = "transparent";
      }}
    >
      {busy ? (
        <span className="spinner" style={{ width: 11, height: 11 }} />
      ) : (
        <svg
          width="13"
          height="13"
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 3.5h10M5 3.5V2a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v1.5M3.5 3.5v8a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1v-8M6 6v4M8 6v4" />
        </svg>
      )}
    </button>
  );
}
