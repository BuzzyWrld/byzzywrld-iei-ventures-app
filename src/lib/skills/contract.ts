/**
 * Skill contract — the interface Buzz's real Brand Playbook skill must implement.
 *
 * Our stub implements this today. When Buzz hands off the real skill, we swap
 * implementations via SKILL_ADAPTER env var (see ./index.ts) without touching
 * the dashboard, API, or DB layer.
 *
 * See design-package/SKILL_HANDOFF_CONTRACT.md for the human-readable version.
 */
import type { BrandIntake } from "@/lib/types";

/**
 * All file names in a SkillManifest are *relative* to the outputDir passed to
 * run(). The skill writes the files; the dashboard serves them via
 * /api/brands/:id/files/:file.
 */
export type SkillManifest = {
  /** Required. JSON file matching the BrandJson shape in @/lib/types.ts */
  brandJson: string;
  /** Required. 360 DPI brand playbook. Per brief slide 05, use Playwright
   *  screenshot → PIL assembly. Never page.pdf() — produces font blur. */
  playbookPdf: string;
  /** Optional. Source HTML used to render the PDF. Useful for debugging. */
  playbookHtml?: string;
  /** Required. Self-contained landing page HTML populated with brand data. */
  landingHtml: string;
  /** Required. Primary logo mark as SVG. */
  logoSvg: string;
  /** Optional. Icon-only / alt variants. */
  logoIconSvg?: string;
  logoMonochromeSvg?: string;
};

/**
 * Progress callback the skill can invoke during a run so the dashboard can
 * show useful status ("Generating palette…", "Rendering PDF…"). Optional —
 * skill can ignore it.
 */
export type ProgressReporter = (stage: string, pct?: number) => void | Promise<void>;

export type SkillRunContext = {
  /** Absolute path. Skill writes all output files here. */
  outputDir: string;
  /** Optional progress reporter. */
  onProgress?: ProgressReporter;
  /** Abort signal. Skill should stop work when signaled. */
  signal?: AbortSignal;
};

export interface BrandPlaybookSkill {
  /** Human-readable ID so logs can show which adapter is active. */
  readonly id: string;
  run(intake: BrandIntake, ctx: SkillRunContext): Promise<SkillManifest>;
}

export class SkillError extends Error {
  constructor(message: string, public readonly code: string = "SKILL_ERROR") {
    super(message);
    this.name = "SkillError";
  }
}
