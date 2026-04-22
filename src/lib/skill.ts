import { randomUUID } from "node:crypto";
import { runBrandPlaybook } from "../../skills/brand-playbook/run";
import { createBrand, getBrand, updateBrand } from "./db";
import { brandDir } from "./storage";
import type { BrandIntake, BrandProject } from "./types";

export function newBrandId(): string {
  return randomUUID();
}

export async function triggerBrandBuild(
  intake: BrandIntake
): Promise<BrandProject> {
  const id = newBrandId();
  const project: BrandProject = {
    id,
    createdAt: new Date().toISOString(),
    status: "running",
    intake,
    outputs: {},
  };
  createBrand(project);

  try {
    const outDir = brandDir(id);
    const manifest = await runBrandPlaybook(intake, outDir);
    const fileUrl = (name: string) =>
      `/api/brands/${id}/files/${encodeURIComponent(name)}`;
    updateBrand(id, {
      status: "complete",
      outputs: {
        brandJson: fileUrl(manifest.brandJson),
        playbookHtml: fileUrl(manifest.playbookHtml),
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

  return getBrand(id)!;
}
