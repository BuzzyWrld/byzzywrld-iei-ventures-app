/**
 * Content engine orchestration.
 *
 * Mirrors the pattern in skill.ts but for the 5-pass content engine.
 * Each pass is approval-gated: the API route calls advanceContentRun() after
 * the user approves the current week, which triggers the next pass.
 */

import path from "node:path";
import fs from "node:fs";
import { randomUUID } from "node:crypto";
import { createContentRun, getContentRun, updateContentRun, upsertContentRun } from "./db";
import { contentEngineSkill } from "./skills/content-engine";
import { OUTPUTS_ROOT } from "./storage";
import { isVideoRenderEnabled, renderBrandVideo } from "./video-render";
import { listBrands } from "./db";
import type {
  ContentRun,
  ContentRunIntake,
  ContentRunStatus,
  WeekMeta,
} from "./skills/content-engine-contract";

function contentRunDir(runId: string): string {
  const dir = path.join(OUTPUTS_ROOT, "content-runs", runId);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function enqueueContentRun(
  intake: ContentRunIntake,
  opts: { tenantId?: string; userId?: string } = {}
): { run: ContentRun; work: Promise<void> } {
  const id = randomUUID();
  const run: ContentRun = {
    id,
    createdAt: new Date().toISOString(),
    status: "pending",
    intake,
    outputs: { weeks: [] },
    tenantId: opts.tenantId ?? "default",
    userId: opts.userId,
  };
  createContentRun(run);
  return { run, work: runPass1(run) };
}

/**
 * Called by the approval API after a user approves a week.
 * Advances the run to the next pass.
 */
export async function advanceContentRun(runId: string): Promise<{ run: ContentRun | null; work: Promise<void> | null }> {
  const run = getContentRun(runId);
  if (!run) return { run: null, work: null };

  const nextPass: Record<ContentRunStatus, (() => Promise<void>) | null> = {
    week_1_review: () => runWeekPass(run, 3, "week_2"),
    week_2_review: () => runWeekPass(run, 4, "week_3"),
    week_3_review: () => runWeekPass(run, 5, "week_4"),
    // these states don't advance via approval
    pending: null,
    analysis: null,
    week_1: null,
    week_2: null,
    week_3: null,
    week_4: null,
    week_4_review: null,
    complete: null,
    failed: null,
  };

  const fn = nextPass[run.status];
  const work = fn ? fn() : null;
  return { run: getContentRun(runId), work };
}

// ─── Pass runners ──────────────────────────────────────────────────────────

async function runPass1(run: ContentRun): Promise<void> {
  const { id, intake } = run;
  updateContentRun(id, { status: "analysis", progressStage: "market analysis", progressPct: 0 });

  try {
    const outputDir = contentRunDir(id);
    await contentEngineSkill.runPass(1, id, intake, {
      outputDir,
      onProgress: (stage, pct) => {
        updateContentRun(id, { progressStage: stage, progressPct: pct * 0.18 });
      },
    });

    // Read run-state.json to extract trending topics + hook selections
    const outputs = mergeRunState(id, outputDir, run.outputs.weeks ?? []);
    updateContentRun(id, { outputs });

    // Trigger Week 1 in a fresh Lambda invocation so it gets its own 300s budget.
    // Pass the current run state in the body so the receiving Lambda can restore it
    // even if it starts with an empty SQLite.
    const refreshed = getContentRun(id);
    if (refreshed) await triggerPassViaFetch(refreshed, 2);
  } catch (err) {
    updateContentRun(id, {
      status: "failed",
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

async function runWeekPass(
  run: ContentRun,
  pass: 2 | 3 | 4 | 5,
  nextStatus: ContentRunStatus
): Promise<void> {
  const { id, intake } = run;
  updateContentRun(id, { status: nextStatus, progressStage: `generating ${nextStatus.replace("_", " ")}`, progressPct: (pass - 1) * 0.18 });

  try {
    const outputDir = contentRunDir(id);
    const result = await contentEngineSkill.runPass(pass, id, intake, {
      outputDir,
      onProgress: (stage, pct) => {
        updateContentRun(id, {
          progressStage: stage,
          progressPct: (pass - 1) * 0.18 + pct * 0.18,
        });
      },
    });

    if (!result) {
      // Pass 1 only — shouldn't happen for passes 2–5
      updateContentRun(id, { status: "failed", error: "pass returned no week result" });
      return;
    }

    // Add this week to the weeks array
    const current = getContentRun(id);
    const weeks: WeekMeta[] = [...(current?.outputs.weeks ?? [])];
    const weekMeta: WeekMeta = {
      weekNumber: result.weekNumber,
      file: result.file,
      status: "generated",
      hookSummary: result.hookSummary,
    };
    const existing = weeks.findIndex((w) => w.weekNumber === result.weekNumber);
    if (existing >= 0) weeks[existing] = weekMeta;
    else weeks.push(weekMeta);

    const reviewStatus: ContentRunStatus =
      pass === 5 ? "complete" : (`week_${result.weekNumber}_review` as ContentRunStatus);

    if (pass === 5) {
      // Final pass — assemble index
      let assetCount = 84;
      try {
        const idx = JSON.parse(
          fs.readFileSync(path.join(outputDir, "index.json"), "utf8")
        ) as { assetCount?: number };
        assetCount = idx.assetCount ?? 84;
      } catch {
        // best-effort
      }
      updateContentRun(id, {
        status: "complete",
        progressStage: "complete",
        progressPct: 1,
        outputs: {
          ...current?.outputs,
          weeks,
          masterCalendarFile: "master-calendar.md",
          indexFile: "index.json",
          assetCount,
        },
      });

      // Fire-and-forget: render brand explainer video if Remotion is configured
      if (isVideoRenderEnabled()) {
        void renderBrandVideoForRun(id, run.tenantId);
      }
    } else {
      updateContentRun(id, {
        status: reviewStatus,
        progressStage: `week ${result.weekNumber} ready for review`,
        progressPct: pass * 0.18,
        outputs: { ...current?.outputs, weeks },
      });
    }
  } catch (err) {
    updateContentRun(id, {
      status: "failed",
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function mergeRunState(
  runId: string,
  outputDir: string,
  currentWeeks: WeekMeta[]
): ContentRun["outputs"] {
  try {
    const raw = fs.readFileSync(path.join(outputDir, "run-state.json"), "utf8");
    const state = JSON.parse(raw) as {
      trendingTopics?: ContentRun["outputs"]["trendingTopics"];
      hookSelections?: ContentRun["outputs"]["hookSelections"];
    };
    return {
      runStateFile: "run-state.json",
      weeks: currentWeeks,
      trendingTopics: state.trendingTopics,
      hookSelections: state.hookSelections,
    };
  } catch {
    return { runStateFile: "run-state.json", weeks: currentWeeks };
  }
}

/**
 * Trigger a week pass in a fresh Lambda invocation via self-fetch.
 * Each pass gets its own 300s maxDuration budget this way.
 *
 * Falls back to running the pass inline if the self-fetch fails or times out
 * (e.g. due to Vercel deployment protection on preview builds).
 */
async function triggerPassViaFetch(run: ContentRun, pass: 2 | 3 | 4 | 5): Promise<void> {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  const bypassToken = process.env.VERCEL_BYPASS_TOKEN;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (bypassToken) headers["x-vercel-protection-bypass"] = bypassToken;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000); // 20s timeout — generous for cold starts

  try {
    const resp = await fetch(`${baseUrl}/api/content-engine/${run.id}/run-pass`, {
      method: "POST",
      headers,
      body: JSON.stringify({ run, pass }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (resp.ok) return; // Pass 2 successfully delegated to a new Lambda
  } catch {
    clearTimeout(timer);
    // Self-fetch timed out or failed — fall through to inline execution
  }

  // Fallback: run the pass inline in the current Lambda.
  const weekNum = (pass - 1) as 1 | 2 | 3 | 4;
  const refreshed = getContentRun(run.id);
  if (refreshed) await runWeekPass(refreshed, pass, `week_${weekNum}` as ContentRunStatus);
}

/**
 * Entry point for the /run-pass internal endpoint.
 * Restores run state into local SQLite (idempotent upsert) and runs the pass.
 * Returns a promise for use with after().
 */
export function runPassFromRequest(run: ContentRun, pass: 2 | 3 | 4 | 5): Promise<void> {
  upsertContentRun(run);
  // pass 2 = week_1, pass 3 = week_2, pass 4 = week_3, pass 5 = week_4
  const weekNum = (pass - 1) as 1 | 2 | 3 | 4;
  const refreshed = getContentRun(run.id);
  if (!refreshed) return Promise.resolve();
  return runWeekPass(refreshed, pass, `week_${weekNum}` as ContentRunStatus);
}

export function contentRunFileUrl(runId: string, filename: string): string {
  return `/api/content-engine/${runId}/files/${filename.split("/").map(encodeURIComponent).join("/")}`;
}

/**
 * Look up the tenant's most recent brand, extract brand.json, and trigger
 * a Remotion Lambda render. Updates the content run with the video URL
 * when done. Runs asynchronously — does not block content engine completion.
 */
async function renderBrandVideoForRun(runId: string, tenantId: string): Promise<void> {
  try {
    const brands = listBrands({ tenantId });
    const brand = brands.find((b) => b.status === "complete");
    if (!brand) {
      console.log(`[brand-video] skipping — no completed brand found for tenant ${tenantId}`);
      return;
    }

    // Read brand.json from the brand's output directory
    const brandOutDir = path.join(OUTPUTS_ROOT, "brands", brand.id);
    const brandJsonPath = path.join(brandOutDir, "brand.json");
    if (!fs.existsSync(brandJsonPath)) {
      console.log(`[brand-video] skipping — brand.json not found at ${brandJsonPath}`);
      return;
    }

    const brandData = JSON.parse(fs.readFileSync(brandJsonPath, "utf8")) as {
      name?: string;
      tagline?: string;
      colors?: { primary: string; secondary: string; accent: string; neutral: string };
      typography?: { heading: string; body: string };
      mission?: string;
      ica?: string;
    };

    const result = await renderBrandVideo(
      {
        brandName: brandData.name ?? brand.intake.companyName,
        tagline: brandData.tagline ?? "",
        colors: brandData.colors ?? { primary: "#FFCC00", secondary: "#1A1A1A", accent: "#FFD633", neutral: "#F5F5F5" },
        typography: brandData.typography ?? { heading: "Inter", body: "Inter" },
        mission: brandData.mission,
        ica: brandData.ica,
      },
      (pct) => {
        updateContentRun(runId, {
          progressStage: `rendering video ${Math.round(pct * 100)}%`,
        });
      }
    );

    if (result.outputUrl) {
      const current = getContentRun(runId);
      const existingOutputs = current?.outputs ?? { weeks: [] };
      updateContentRun(runId, {
        outputs: {
          ...existingOutputs,
          brandVideoUrl: result.outputUrl,
          brandVideoRenderId: result.renderId,
        },
      });
      console.log(`[brand-video] saved video URL to content run ${runId}: ${result.outputUrl}`);
    } else {
      console.warn(`[brand-video] render failed for run ${runId}: ${result.error}`);
    }
  } catch (err) {
    console.error(`[brand-video] unexpected error for run ${runId}:`, err);
  }
}

export { getContentRun, contentRunDir };
