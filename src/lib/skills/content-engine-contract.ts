/**
 * Types and interfaces for the IEI Content Engine skill.
 *
 * The engine produces a 4-week rolling content calendar (84 assets total:
 * 28 days × 3 assets per day). Generation runs as 5 sequential agent passes,
 * each writing markdown files to the run's output directory.
 */

/** Current lifecycle stage of a content run. */
export type ContentRunStatus =
  | "pending"         // created, not yet started
  | "analysis"        // Pass 1: market analysis + hook selections
  | "week_1"          // Pass 2: generating week 1
  | "week_1_review"   // Week 1 awaiting user approval
  | "week_2"          // Pass 3: generating week 2
  | "week_2_review"   // Week 2 awaiting user approval
  | "week_3"          // Pass 4: generating week 3
  | "week_3_review"   // Week 3 awaiting user approval
  | "week_4"          // Pass 5: generating week 4 + assembling master
  | "week_4_review"   // Week 4 awaiting user approval (used before final assembly)
  | "complete"        // All 4 weeks approved, master calendar written
  | "failed";         // Terminal error state

/** Lightweight input to start a content run. */
export interface ContentRunIntake {
  /** Optional label for this calendar batch (e.g. "May 2026 — B2B Push") */
  label?: string;
  /** ISO date string for campaign start (defaults to next Monday if omitted) */
  campaignStartDate?: string;
  /** Override the default Claude model for this run */
  model?: string;
  /** Any additional context the model should factor in (current promotions, events, etc.) */
  contextNotes?: string;
}

/** A single trending topic identified during market analysis. */
export interface TrendingTopic {
  topic: string;
  source: string;
  dataPoint: string;
}

/** One hook structure selected from the library for this batch. */
export interface HookSelection {
  hookNumber: number;
  structureName: string;
  reason: string;
}

/** Per-week output metadata. */
export interface WeekMeta {
  weekNumber: 1 | 2 | 3 | 4;
  /** Path relative to the run's output directory */
  file: string;
  status: "pending" | "generated" | "approved" | "rejected";
  approvedAt?: string;
  /** Hook first lines for quick review (7 entries, one per day) */
  hookSummary?: string[];
}

/** Full output manifest, populated progressively as passes complete. */
export interface ContentRunOutputs {
  /** Written at the end of Pass 1 */
  runStateFile?: string;
  weeks: WeekMeta[];
  /** Written at the end of Pass 5 */
  masterCalendarFile?: string;
  indexFile?: string;
  /** Total assets generated (should be 84 when complete) */
  assetCount?: number;
  /** S3 URL of the rendered brand explainer video (set after Remotion Lambda render completes) */
  brandVideoUrl?: string;
  /** Render ID for tracking (Remotion Lambda) */
  brandVideoRenderId?: string;
  /** Trending topics identified in market analysis */
  trendingTopics?: TrendingTopic[];
  hookSelections?: Record<"topic1" | "topic2" | "topic3", HookSelection>;
}

/** Full content run record stored in the database. */
export interface ContentRun {
  id: string;
  createdAt: string;
  status: ContentRunStatus;
  intake: ContentRunIntake;
  outputs: ContentRunOutputs;
  error?: string;
  progressStage?: string;
  progressPct?: number;
  tenantId: string;
  userId?: string;
}

/** Runtime context passed to the skill adapter. */
export interface ContentSkillRunContext {
  /** Absolute path where all output files are written */
  outputDir: string;
  /** Optional progress callback */
  onProgress?: (stage: string, pct: number) => void;
}

/** Result returned by a single week pass. */
export interface WeekPassResult {
  weekNumber: 1 | 2 | 3 | 4;
  file: string;
  hookSummary: string[];
}

/** Full result returned after all 5 passes complete. */
export interface ContentEngineResult {
  weekFiles: string[];
  masterCalendarFile: string;
  indexFile: string;
  assetCount: number;
}

/** The content engine skill adapter interface. */
export interface ContentEngineSkill {
  id: string;
  /** Run the full 5-pass pipeline. Resolves when Pass 5 is complete. */
  run(intake: ContentRunIntake, ctx: ContentSkillRunContext): Promise<ContentEngineResult>;
  /** Run a single pass (used by the approval-gated incremental API). */
  runPass(
    pass: 1 | 2 | 3 | 4 | 5,
    runId: string,
    intake: ContentRunIntake,
    ctx: ContentSkillRunContext
  ): Promise<WeekPassResult | void>;
}

export class ContentEngineError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = "ContentEngineError";
  }
}
