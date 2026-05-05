"use client";

import { useEffect, useState, useTransition } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { ContentRun, ContentRunStatus, WeekMeta } from "@/lib/skills/content-engine-contract";

const POLL_INTERVAL_MS = 4000;
const ACTIVE_STATUSES: ContentRunStatus[] = [
  "pending", "analysis", "week_1", "week_2", "week_3", "week_4",
];
const REVIEW_STATUSES: ContentRunStatus[] = [
  "week_1_review", "week_2_review", "week_3_review", "week_4_review",
];

function isActive(s: ContentRunStatus): boolean {
  return ACTIVE_STATUSES.includes(s);
}
function isReview(s: ContentRunStatus): boolean {
  return REVIEW_STATUSES.includes(s);
}
function reviewWeekNumber(s: ContentRunStatus): number {
  const m = s.match(/^week_(\d)_review$/);
  return m ? parseInt(m[1]) : 0;
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_THEMES = ["The Signal", "The Blueprint", "AI Paradox", "The Autopsy", "Sandbox", "Hitlist", "Growth Engine"];

const STEPS = [
  { label: "Market Analysis", key: "analysis" as ContentRunStatus },
  { label: "Week 1", key: "week_1" as ContentRunStatus, review: "week_1_review" as ContentRunStatus },
  { label: "Week 2", key: "week_2" as ContentRunStatus, review: "week_2_review" as ContentRunStatus },
  { label: "Week 3", key: "week_3" as ContentRunStatus, review: "week_3_review" as ContentRunStatus },
  { label: "Week 4", key: "week_4" as ContentRunStatus, review: "week_4_review" as ContentRunStatus },
];

export default function ContentEngineRunPage() {
  const { id } = useParams<{ id: string }>();
  const [run, setRun] = useState<ContentRun | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [approveError, setApproveError] = useState("");

  async function fetchRun() {
    try {
      const res = await fetch(`/api/content-engine/${id}`);
      if (res.ok) {
        const data = (await res.json()) as { run: ContentRun };
        setRun(data.run);
      }
    } catch {
      setError("Failed to load run");
    }
  }

  useEffect(() => {
    fetchRun();
  }, [id]);

  useEffect(() => {
    if (!run) return;
    if (!isActive(run.status)) return;
    const t = setInterval(fetchRun, POLL_INTERVAL_MS);
    return () => clearInterval(t);
  }, [run?.status]);

  async function handleApprove(weekNumber: number) {
    setApproveError("");
    startTransition(async () => {
      try {
        const res = await fetch(`/api/content-engine/${id}/approve`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ weekNumber }),
        });
        if (!res.ok) {
          const data = (await res.json()) as { error?: string };
          setApproveError(data.error ?? "Approve failed");
          return;
        }
        const data = (await res.json()) as { run: ContentRun };
        setRun(data.run);
      } catch {
        setApproveError("Network error — try again");
      }
    });
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>{error}</p>
      </div>
    );
  }

  if (!run) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="animate-pulse flex gap-3">
          <div className="w-10 h-10 rounded" style={{ background: "var(--color-surface-2)" }} />
          <div className="flex-1 flex flex-col gap-2 pt-1">
            <div className="h-4 rounded w-1/3" style={{ background: "var(--color-surface-2)" }} />
            <div className="h-3 rounded w-1/2" style={{ background: "var(--color-surface-2)" }} />
          </div>
        </div>
      </div>
    );
  }

  const reviewWeek = isReview(run.status) ? reviewWeekNumber(run.status) : null;
  const weekInReview = reviewWeek
    ? run.outputs.weeks.find((w) => w.weekNumber === reviewWeek)
    : null;

  return (
    <div className="max-w-3xl mx-auto py-6 flex flex-col gap-6">
      {/* Header */}
      <div>
        <div className="kicker mb-1">
          <Link href="/content-engine" style={{ color: "var(--color-text-muted)" }}>
            Content Engine
          </Link>
          {" / "}
          <span style={{ color: "var(--color-text-muted)" }}>{run.id.slice(0, 8)}</span>
        </div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-[24px] md:text-[28px] font-medium tracking-tight leading-tight">
            {run.intake.label ?? "Untitled Calendar"}
          </h1>
          <StatusChip status={run.status} />
        </div>
        {run.status === "complete" && (
          <a
            href={`/api/content-engine/${id}/files/master-calendar.md`}
            className="btn btn-primary mt-3 inline-flex"
            download
          >
            Download master calendar
          </a>
        )}
      </div>

      {/* Progress pipeline */}
      <div className="card p-5">
        <div className="font-mono text-[10.5px] uppercase tracking-[0.14em] mb-4" style={{ color: "var(--color-text-muted)" }}>
          Pipeline
        </div>
        <div className="flex flex-col gap-2">
          {STEPS.map((step, i) => (
            <PipelineStep
              key={step.key}
              label={step.label}
              stepIndex={i}
              status={run.status}
              stepKey={step.key}
              reviewKey={step.review}
              progressStage={run.progressStage}
              progressPct={run.progressPct}
            />
          ))}
        </div>
      </div>

      {/* Trending topics (from analysis) */}
      {run.outputs.trendingTopics && run.outputs.trendingTopics.length > 0 && (
        <div className="card p-5">
          <div className="font-mono text-[10.5px] uppercase tracking-[0.14em] mb-3" style={{ color: "var(--color-text-muted)" }}>
            Trending Topics This Cycle
          </div>
          <div className="flex flex-col gap-2">
            {run.outputs.trendingTopics.map((t, i) => (
              <div key={i} className="flex gap-3 items-start">
                <span
                  className="font-mono text-xs shrink-0 mt-0.5"
                  style={{ color: "var(--color-accent)" }}
                >
                  T{i + 1}
                </span>
                <div>
                  <div className="text-sm font-medium">{t.topic}</div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                    {t.dataPoint} — {t.source}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Week cards */}
      {run.outputs.weeks.map((week) => (
        <WeekCard
          key={week.weekNumber}
          week={week}
          runId={id}
          isCurrentReview={reviewWeek === week.weekNumber}
          onApprove={handleApprove}
          isPending={isPending}
        />
      ))}

      {/* Approval panel — shows when a week is in review */}
      {weekInReview && reviewWeek && (
        <div
          className="card p-5 border"
          style={{ borderColor: "var(--color-accent)", borderWidth: 1 }}
        >
          <div className="font-mono text-[10.5px] uppercase tracking-[0.14em] mb-2" style={{ color: "var(--color-accent)" }}>
            Week {reviewWeek} — Review Required
          </div>
          <p className="text-sm mb-4" style={{ color: "var(--color-text-muted)" }}>
            Review the 7-day draft above. Approve to trigger Week {reviewWeek + 1} generation.
          </p>
          {approveError && (
            <div
              className="text-sm rounded px-3 py-2 mb-3"
              style={{ background: "var(--color-error-bg, #3a0000)", color: "var(--color-error, #ff6b6b)" }}
            >
              {approveError}
            </div>
          )}
          <button
            className="btn btn-primary"
            onClick={() => handleApprove(reviewWeek)}
            disabled={isPending}
          >
            {isPending ? "Approving…" : `Approve Week ${reviewWeek} — Generate Week ${reviewWeek + 1}`}
          </button>
        </div>
      )}

      {/* Error state */}
      {run.status === "failed" && run.error && (
        <div
          className="card p-5 text-sm"
          style={{ background: "var(--color-error-bg, #1a0000)", color: "var(--color-error, #ff6b6b)" }}
        >
          <div className="font-mono text-[10px] uppercase tracking-wider mb-1">Error</div>
          {run.error}
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function StatusChip({ status }: { status: ContentRunStatus }) {
  const color =
    status === "complete"
      ? "var(--color-success, #4caf50)"
      : status === "failed"
      ? "var(--color-error, #ff6b6b)"
      : isReview(status)
      ? "var(--color-accent)"
      : isActive(status)
      ? "var(--color-text-muted)"
      : "var(--color-text-muted)";

  const labels: Record<ContentRunStatus, string> = {
    pending: "Pending",
    analysis: "Analysing market",
    week_1: "Generating week 1",
    week_1_review: "Week 1 ready",
    week_2: "Generating week 2",
    week_2_review: "Week 2 ready",
    week_3: "Generating week 3",
    week_3_review: "Week 3 ready",
    week_4: "Assembling week 4",
    week_4_review: "Week 4 ready",
    complete: "Complete",
    failed: "Failed",
  };

  return (
    <span
      className="font-mono text-xs px-2 py-1 rounded"
      style={{ background: "var(--color-surface-2)", color }}
    >
      {labels[status]}
    </span>
  );
}

function PipelineStep({
  label,
  stepIndex,
  status,
  stepKey,
  reviewKey,
  progressStage,
  progressPct,
}: {
  label: string;
  stepIndex: number;
  status: ContentRunStatus;
  stepKey: ContentRunStatus;
  reviewKey?: ContentRunStatus;
  progressStage?: string;
  progressPct?: number;
}) {
  const allKeys = STEPS.flatMap((s) => [s.key, s.review]).filter(Boolean) as ContentRunStatus[];
  const currentIdx = allKeys.indexOf(status);
  const stepIdx = allKeys.indexOf(stepKey);

  const isDone =
    stepIdx < currentIdx ||
    status === "complete" ||
    (reviewKey && allKeys.indexOf(reviewKey) < currentIdx);

  const isRunning = status === stepKey;
  const isReviewNow = reviewKey && status === reviewKey;

  let dot = "○";
  let dotColor = "var(--color-text-muted)";
  if (isDone) { dot = "✓"; dotColor = "var(--color-success, #4caf50)"; }
  if (isRunning) { dot = "◉"; dotColor = "var(--color-accent)"; }
  if (isReviewNow) { dot = "◈"; dotColor = "var(--color-accent)"; }

  return (
    <div className="flex items-start gap-3 text-sm">
      <span className="font-mono text-xs w-4 shrink-0 mt-0.5" style={{ color: dotColor }}>
        {dot}
      </span>
      <div className="flex-1">
        <span style={{ color: isDone || isRunning || isReviewNow ? "inherit" : "var(--color-text-muted)" }}>
          {label}
        </span>
        {isRunning && progressStage && (
          <span className="ml-2 font-mono text-xs" style={{ color: "var(--color-text-muted)" }}>
            {progressStage}
            {progressPct != null ? ` ${Math.round(progressPct * 100)}%` : ""}
          </span>
        )}
        {isReviewNow && (
          <span className="ml-2 font-mono text-xs" style={{ color: "var(--color-accent)" }}>
            awaiting approval
          </span>
        )}
      </div>
    </div>
  );
}

function WeekCard({
  week,
  runId,
  isCurrentReview,
  onApprove,
  isPending,
}: {
  week: WeekMeta;
  runId: string;
  isCurrentReview: boolean;
  onApprove: (n: number) => void;
  isPending: boolean;
}) {
  const [expanded, setExpanded] = useState(isCurrentReview);

  const isApproved = week.status === "approved";
  const borderColor = isCurrentReview
    ? "var(--color-accent)"
    : isApproved
    ? "var(--color-success, #4caf50)"
    : "var(--color-border)";

  return (
    <div className="card overflow-hidden" style={{ borderColor, borderWidth: 1 }}>
      <button
        className="w-full flex items-center justify-between gap-3 p-5 text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <span
            className="font-mono text-xs px-2 py-1 rounded shrink-0"
            style={{
              background: "var(--color-surface-2)",
              color: isApproved ? "var(--color-success, #4caf50)" : isCurrentReview ? "var(--color-accent)" : "var(--color-text-muted)",
            }}
          >
            W{week.weekNumber}
          </span>
          <span className="font-medium text-sm">Week {week.weekNumber}</span>
          {isApproved && (
            <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: "var(--color-success, #4caf50)" }}>
              Approved
            </span>
          )}
          {isCurrentReview && (
            <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: "var(--color-accent)" }}>
              Review
            </span>
          )}
        </div>
        <span className="font-mono text-xs" style={{ color: "var(--color-text-muted)" }}>
          {expanded ? "▲" : "▼"}
        </span>
      </button>

      {expanded && (
        <div className="px-5 pb-5 flex flex-col gap-4 border-t" style={{ borderColor: "var(--color-border)" }}>
          {/* Hook summary grid */}
          {week.hookSummary && week.hookSummary.length > 0 && (
            <div className="mt-4">
              <div
                className="font-mono text-[10px] uppercase tracking-wider mb-2"
                style={{ color: "var(--color-text-muted)" }}
              >
                Hook Summary
              </div>
              <div className="flex flex-col gap-1.5">
                {week.hookSummary.map((hook, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <span
                      className="font-mono text-[10px] shrink-0 mt-0.5 w-12"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {DAY_LABELS[i]} · {DAY_THEMES[i]?.slice(0, 6)}
                    </span>
                    <span className="text-xs leading-snug">{hook}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* View / Download week file */}
          <div className="flex gap-2 items-center">
            <a
              href={`/api/content-engine/${runId}/files/${week.file}`}
              className="btn btn-secondary btn-sm"
              download
            >
              Download week {week.weekNumber} draft
            </a>
            {isCurrentReview && !isApproved && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => onApprove(week.weekNumber)}
                disabled={isPending}
              >
                {isPending ? "Approving…" : "Approve"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
