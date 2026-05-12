export const maxDuration = 300;

import { after, NextRequest } from "next/server";
import { getContentRun, upsertContentRun } from "@/lib/db";
import { fetchRun, persistRun } from "@/lib/blob-runs";
import { currentUser } from "@/lib/auth";
import type { ContentRunStatus } from "@/lib/skills/content-engine-contract";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await currentUser();
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  // Prefer Blob (authoritative cross-Lambda state) over local SQLite (stale cache)
  const run = await fetchRun(id) ?? getContentRun(id);
  if (!run) return Response.json({ error: "not found" }, { status: 404 });
  if (run.userId && run.userId !== user.id) {
    return Response.json({ error: "not found" }, { status: 404 });
  }

  return Response.json({ run });
}

/** Map review status → next pass number */
const REVIEW_TO_PASS: Partial<Record<ContentRunStatus, 3 | 4 | 5>> = {
  week_1_review: 3,
  week_2_review: 4,
  week_3_review: 5,
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await currentUser();
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json() as { action?: string; week?: number };

  if (body.action !== "approve") {
    return Response.json({ error: "unknown action" }, { status: 400 });
  }

  // ALWAYS read from Blob for approvals — local SQLite may have stale state
  // from when this warm Lambda instance first created or touched the run.
  const run = await fetchRun(id) ?? getContentRun(id);
  if (!run) return Response.json({ error: "not found" }, { status: 404 });
  if (run.userId && run.userId !== user.id) {
    return Response.json({ error: "not found" }, { status: 404 });
  }

  const nextPass = REVIEW_TO_PASS[run.status];

  // week_4_review → complete (no more passes)
  if (run.status === "week_4_review") {
    upsertContentRun(run);
    const { updateContentRun } = await import("@/lib/db");
    updateContentRun(id, { status: "complete", progressStage: "complete", progressPct: 1 });
    const final = getContentRun(id);
    if (final) await persistRun(final);
    return Response.json({ run: final, message: "calendar complete" });
  }

  if (!nextPass) {
    return Response.json(
      { error: `run is in '${run.status}' — not ready for approval` },
      { status: 409 }
    );
  }

  // Mark week as approved in outputs
  const weekNum = body.week ?? (nextPass - 2);
  const weeks = [...(run.outputs.weeks ?? [])];
  const wi = weeks.findIndex((w) => w.weekNumber === weekNum);
  if (wi >= 0) weeks[wi] = { ...weeks[wi], status: "approved" };

  // Update status and persist before delegation
  upsertContentRun(run);
  const { updateContentRun } = await import("@/lib/db");
  updateContentRun(id, {
    outputs: { ...run.outputs, weeks },
    progressStage: `approved week ${weekNum} — generating next`,
  });
  const updated = getContentRun(id)!;
  await persistRun(updated);

  // Delegate next pass to a fresh Lambda
  after(async () => {
    try {
      const { runPassFromRequest } = await import("@/lib/content-engine-runner");
      await runPassFromRequest(updated, nextPass);
    } catch (err) {
      console.error(`[content-engine] approve → pass ${nextPass} failed:`, err);
      const { updateContentRun: upd } = await import("@/lib/db");
      upd(id, { status: "failed", error: err instanceof Error ? err.message : String(err) });
      const snap = getContentRun(id);
      if (snap) await persistRun(snap);
    }
  });

  return Response.json({ run: updated, message: `week ${weekNum} approved — generating week ${weekNum + 1}` });
}
