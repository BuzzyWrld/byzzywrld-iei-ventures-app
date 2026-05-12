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
import { persistRun, fetchRun } from "./blob-runs";
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

/**
 * Update SQLite and fire-and-forget persist to Vercel Blob.
 * The Blob write is async but we don't await it for progress updates
 * (too frequent). For state transitions we await it.
 */
function updateAndPersist(id: string, patch: Partial<ContentRun>, await_blob = false): void | Promise<void> {
  updateContentRun(id, patch);
  const run = getContentRun(id);
  if (run) {
    const p = persistRun(run);
    if (await_blob) return p;
  }
}

async function createAndPersist(run: ContentRun): Promise<void> {
  createContentRun(run);
  await persistRun(run);
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
  // Don't persist "pending" to Blob — runPass1 immediately sets "analysis" and awaits that persist.
  // A fire-and-forget "pending" write here races with runPass1's "analysis" write and can overwrite it.
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
  console.log(`[content-engine] runPass1 started for ${id}`);
  updateContentRun(id, { status: "analysis", progressStage: "market analysis", progressPct: 0 });
  await persistRun(getContentRun(id)!); // Blob: AWAIT so status is visible to polls before proceeding
  console.log(`[content-engine] runPass1 persisted "analysis" to Blob for ${id}`);

  // Safety: persist "failed" to Blob at 270s so the UI isn't stuck if Lambda times out
  const safetyTimer = setTimeout(async () => {
    console.error(`[content-engine] Pass 1 approaching 300s timeout — persisting safety state`);
    try {
      updateContentRun(id, {
        status: "failed",
        error: "Pass 1 exceeded 270s safety limit. The market analysis took too long. Try again — subsequent attempts may hit warm Lambdas.",
      });
      const snap = getContentRun(id);
      if (snap) await persistRun(snap);
    } catch { /* best-effort */ }
  }, 270_000);

  try {
    const outputDir = contentRunDir(id);
    await contentEngineSkill.runPass(1, id, intake, {
      outputDir,
      onProgress: (stage, pct) => {
        // Update local SQLite only — no Blob writes during pass execution.
        // Blob writes from onProgress race with the final state persist and can
        // overwrite "week_1" with stale "analysis". Pass 1 is <5s anyway.
        updateContentRun(id, { progressStage: stage, progressPct: pct * 0.18 });
      },
    });
    clearTimeout(safetyTimer);

    // Read run-state.json to extract trending topics + hook selections
    const outputs = mergeRunState(id, outputDir, run.outputs.weeks ?? []);
    // Transition to week_1 BEFORE persisting — prevents stale "analysis" from racing
    updateContentRun(id, { status: "week_1", outputs, progressStage: "delegating week 1 generation", progressPct: 0.18 });

    // Persist before delegation so the next Lambda can also read from Blob
    const refreshed = getContentRun(id);
    if (refreshed) {
      await persistRun(refreshed);
      await triggerPassViaFetch(refreshed, 2);
    }
  } catch (err) {
    clearTimeout(safetyTimer);
    updateContentRun(id, {
      status: "failed",
      error: err instanceof Error ? err.message : String(err),
    });
    const failed = getContentRun(id);
    if (failed) await persistRun(failed);
  }
}

async function runWeekPass(
  run: ContentRun,
  pass: 2 | 3 | 4 | 5,
  nextStatus: ContentRunStatus
): Promise<void> {
  const { id, intake } = run;
  updateContentRun(id, { status: nextStatus, progressStage: `generating ${nextStatus.replace("_", " ")}`, progressPct: (pass - 1) * 0.18 });
  await persistRun(getContentRun(id)!);

  try {
    const outputDir = contentRunDir(id);
    const result = await contentEngineSkill.runPass(pass, id, intake, {
      outputDir,
      onProgress: (stage, pct) => {
        // Update local SQLite only — no Blob writes during pass execution.
        // Fire-and-forget Blob writes race with the final state persist.
        updateContentRun(id, {
          progressStage: stage,
          progressPct: (pass - 1) * 0.18 + pct * 0.18,
        });
      },
    });

    if (!result) {
      updateContentRun(id, { status: "failed", error: "pass returned no week result" });
      const f = getContentRun(id);
      if (f) await persistRun(f);
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

    // Persist final state of this pass to Blob
    const final = getContentRun(id);
    if (final) await persistRun(final);
  } catch (err) {
    updateContentRun(id, {
      status: "failed",
      error: err instanceof Error ? err.message : String(err),
    });
    const f = getContentRun(id);
    if (f) await persistRun(f);
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
 * If the self-fetch fails, the run is marked failed with a diagnostic message
 * rather than running the pass inline (which would exceed the 300s budget).
 */
async function triggerPassViaFetch(run: ContentRun, pass: 2 | 3 | 4 | 5): Promise<void> {
  // Prefer the stable production URL over the deployment-specific VERCEL_URL
  const host =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_URL;
  const baseUrl = host ? `https://${host}` : "http://localhost:3000";

  const bypassToken = process.env.VERCEL_BYPASS_TOKEN;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (bypassToken) headers["x-vercel-protection-bypass"] = bypassToken;

  const url = `${baseUrl}/api/content-engine/${run.id}/run-pass`;
  console.log(`[content-engine] self-fetch pass ${pass} → ${url}`);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25_000);

  try {
    const resp = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ run, pass }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (resp.ok) {
      console.log(`[content-engine] pass ${pass} delegated successfully`);
      return;
    }

    const text = await resp.text().catch(() => "");
    console.error(`[content-engine] self-fetch returned ${resp.status}: ${text}`);
  } catch (err) {
    clearTimeout(timer);
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[content-engine] self-fetch failed: ${msg}`);
  }

  // Do NOT run inline — it would exceed the 300s budget.
  // Mark the run so the UI can show a retry option.
  updateContentRun(run.id, {
    status: "failed",
    error: `Pass ${pass} delegation failed (self-fetch to ${url}). Check VERCEL_PROJECT_PRODUCTION_URL and VERCEL_BYPASS_TOKEN env vars. Re-trigger via the dashboard.`,
  });
  const failed = getContentRun(run.id);
  if (failed) await persistRun(failed);
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
