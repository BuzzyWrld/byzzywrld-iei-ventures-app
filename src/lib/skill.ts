import { randomUUID } from "node:crypto";
import { createBrand, getBrand, updateBrand } from "./db";
import { skill } from "./skills";
import { brandDir } from "./storage";
import type { BrandIntake, BrandProject } from "./types";

export function newBrandId(): string {
  return randomUUID();
}

/**
 * Kick off a brand build. Returns immediately with the pending project;
 * the skill runs in the background and updates the DB row as it progresses.
 *
 * Fire-and-forget is fine for our single-instance self-hosted setup. A real
 * production multi-instance deploy would want BullMQ or similar.
 */
export function enqueueBrandBuild(
  intake: BrandIntake,
  opts: { tenantId?: string; userId?: string } = {}
): BrandProject {
  const id = newBrandId();
  const project: BrandProject = {
    id,
    createdAt: new Date().toISOString(),
    status: "pending",
    intake,
    outputs: {},
    tenantId: opts.tenantId ?? "default",
    userId: opts.userId,
  };
  createBrand(project);
  void runBrandBuildInBackground(project);
  return project;
}

async function runBrandBuildInBackground(project: BrandProject): Promise<void> {
  const { id, intake } = project;
  updateBrand(id, { status: "running", progressStage: "starting", progressPct: 0 });

  try {
    const outDir = brandDir(id);
    const manifest = await skill().run(intake, {
      outputDir: outDir,
      onProgress: (stage, pct) => {
        updateBrand(id, { progressStage: stage, progressPct: pct });
      },
    });
    const fileUrl = (name?: string) =>
      name ? `/api/brands/${id}/files/${encodeURIComponent(name)}` : undefined;
    updateBrand(id, {
      status: "complete",
      progressStage: "complete",
      progressPct: 1,
      outputs: {
        brandJson: fileUrl(manifest.brandJson),
        playbookHtml: fileUrl(manifest.playbookHtml),
        playbookPdf: fileUrl(manifest.playbookPdf),
        landingHtml: fileUrl(manifest.landingHtml),
        logoSvg: fileUrl(manifest.logoSvg),
      },
    });
  } catch (err) {
    updateBrand(id, {
      status: "failed",
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

export { getBrand };
