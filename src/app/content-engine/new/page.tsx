"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function NewContentEngineRunPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [label, setLabel] = useState("");
  const [contextNotes, setContextNotes] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      try {
        const res = await fetch("/api/content-engine", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            label: label.trim() || undefined,
            contextNotes: contextNotes.trim() || undefined,
          }),
        });

        if (!res.ok) {
          const data = (await res.json()) as { error?: string };
          setError(data.error ?? "Failed to start run");
          return;
        }

        const data = (await res.json()) as { run: { id: string } };
        router.push(`/content-engine/${data.run.id}`);
      } catch {
        setError("Network error — try again");
      }
    });
  }

  return (
    <div className="max-w-xl mx-auto py-8">
      <div className="kicker mb-2">Content Engine</div>
      <h1 className="text-[28px] md:text-[32px] font-medium tracking-tight leading-tight mb-1">
        New calendar run
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--color-text-muted)" }}>
        Generates 84 production-ready assets across 4 weeks. The engine runs market analysis first,
        then builds each week sequentially — you approve each week before the next generates.
      </p>

      <form onSubmit={handleSubmit} className="card p-6 flex flex-col gap-5">
        <div>
          <label
            className="block font-mono text-[11px] uppercase tracking-[0.14em] mb-2"
            style={{ color: "var(--color-text-muted)" }}
            htmlFor="label"
          >
            Label <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>(optional)</span>
          </label>
          <input
            id="label"
            type="text"
            className="input w-full"
            placeholder="May 2026 — B2B Push"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            disabled={isPending}
          />
        </div>

        <div>
          <label
            className="block font-mono text-[11px] uppercase tracking-[0.14em] mb-2"
            style={{ color: "var(--color-text-muted)" }}
            htmlFor="contextNotes"
          >
            Campaign context <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>(optional)</span>
          </label>
          <textarea
            id="contextNotes"
            className="input w-full resize-none"
            rows={4}
            placeholder="Current promotions, upcoming launches, events to reference, audiences to prioritize…"
            value={contextNotes}
            onChange={(e) => setContextNotes(e.target.value)}
            disabled={isPending}
          />
          <p className="text-xs mt-1.5" style={{ color: "var(--color-text-muted)" }}>
            The engine uses IEI brand context by default. Add any campaign-specific context here.
          </p>
        </div>

        {error && (
          <div
            className="text-sm rounded px-3 py-2"
            style={{ background: "var(--color-error-bg, #3a0000)", color: "var(--color-error, #ff6b6b)" }}
          >
            {error}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isPending}
          >
            {isPending ? "Starting…" : "Generate calendar"}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => router.back()}
            disabled={isPending}
          >
            Cancel
          </button>
        </div>

        <div
          className="border-t pt-4 text-xs font-mono"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
        >
          <div className="mb-1 uppercase tracking-wider text-[10px]">What generates</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <span>28 Video Scripts</span>
            <span>28 GEO Articles</span>
            <span>28 LinkedIn Posts</span>
            <span>4-week master calendar</span>
          </div>
        </div>
      </form>
    </div>
  );
}
