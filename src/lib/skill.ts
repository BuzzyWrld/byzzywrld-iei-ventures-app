import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { createBrand, getBrand, updateBrand } from "./db";
import { skill } from "./skills";
import { brandDir } from "./storage";
import { generateLogoVariants } from "./logos";
import { generateLandingVariants } from "./variants/landing";
import { generatePaletteExpansion } from "./variants/palette-expand";
import { generateSocialKit } from "./variants/social";
import { generatePitchOnePager } from "./variants/pitch";
import { generateEmailKit } from "./variants/email";
import type {
  BrandIntake,
  BrandOutputs,
  BrandProject,
} from "./types";

export function newBrandId(): string {
  return randomUUID();
}

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

/**
 * Retry a failed (or stuck) brand build using its saved intake. Reuses the
 * same brand ID so the URL and any bookmarks stay valid.
 */
export function retryBrandBuild(id: string): BrandProject | null {
  const existing = getBrand(id);
  if (!existing) return null;
  // Wipe previous outputs + error, reset to pending so the UI shows the
  // running state immediately.
  updateBrand(id, {
    status: "pending",
    progressStage: "starting",
    progressPct: 0,
    error: undefined,
    outputs: {},
  });
  // Clean up any stale files from the previous attempt — best-effort.
  try {
    fs.rmSync(brandDir(id), { recursive: true, force: true });
  } catch (err) {
    console.warn(`[skill] retry: couldn't clear outputs dir:`, err);
  }
  const refreshed = getBrand(id)!;
  void runBrandBuildInBackground(refreshed);
  return refreshed;
}

async function runBrandBuildInBackground(project: BrandProject): Promise<void> {
  const { id, intake } = project;
  updateBrand(id, { status: "running", progressStage: "starting", progressPct: 0 });

  const fileUrl = (name?: string) =>
    name ? `/api/brands/${id}/files/${encodeURIComponent(name)}` : undefined;
  const assetUrl = (rel: string) =>
    `/api/brands/${id}/files/${rel.split("/").map(encodeURIComponent).join("/")}`;

  // Merge helper: reads current outputs and applies a patch. The UI polls
  // after each merge, so sections light up with green checkmarks as they land.
  const mergeOutputs = (patch: Partial<BrandOutputs>) => {
    const current = getBrand(id)?.outputs ?? {};
    updateBrand(id, { outputs: { ...current, ...patch } });
  };

  try {
    const outDir = brandDir(id);
    const manifest = await skill().run(intake, {
      outputDir: outDir,
      onProgress: (stage, pct) => {
        updateBrand(id, { progressStage: stage, progressPct: pct });
      },
    });

    // Save the main skill outputs IMMEDIATELY so the Brand foundation card
    // flips to green the moment the main skill finishes.
    mergeOutputs({
      brandJson: fileUrl(manifest.brandJson),
      playbookHtml: fileUrl(manifest.playbookHtml),
      playbookPdf: fileUrl(manifest.playbookPdf),
      landingHtml: fileUrl(manifest.landingHtml),
      logoSvg: fileUrl(manifest.logoSvg),
    });

    // Load brand.json for the variant generators.
    let brand: Record<string, unknown> = {};
    try {
      brand = JSON.parse(fs.readFileSync(path.join(outDir, manifest.brandJson), "utf8"));
    } catch (err) {
      console.warn(`[skill] couldn't read brand.json for variants:`, err);
    }

    // If the user uploaded their own logo, copy it and mark the logo stage done.
    let userUploadedLogoUrl: string | undefined;
    if (intake.uploadedLogoPath) {
      try {
        userUploadedLogoUrl = await copyUploadedLogo(intake.uploadedLogoPath, outDir, id);
        mergeOutputs({ logoSvg: userUploadedLogoUrl });
      } catch (err) {
        console.warn(`[skill] couldn't copy uploaded logo:`, err);
      }
    }

    // Fire all 6 variant generators in parallel. Each wrapped promise
    // merges its output into the DB AS SOON AS IT COMPLETES — so the UI
    // sees stages flip to complete one-by-one, not all at the end.
    updateBrand(id, { progressStage: "generating brand extras", progressPct: 0.92 });

    const tasks: Array<Promise<void>> = [
      // Logos (skipped if user uploaded)
      (async () => {
        if (userUploadedLogoUrl) return;
        try {
          const variants = await generateLogoVariants(brand as never, outDir, 3);
          mergeOutputs({
            logoVariants: variants.length
              ? variants.map((v) => ({
                  key: v.key,
                  title: v.title,
                  rationale: v.rationale,
                  url: assetUrl(v.filename),
                }))
              : undefined,
          });
        } catch (err) {
          console.warn(`[skill] logos failed:`, err);
        }
      })(),
      // Landing variants
      (async () => {
        try {
          const variants = await generateLandingVariants(brand as never, outDir, 3);
          mergeOutputs({
            landingVariants: variants.length
              ? variants.map((v) => ({
                  key: v.key,
                  title: v.title,
                  rationale: v.rationale,
                  url: assetUrl(v.filename),
                }))
              : undefined,
          });
        } catch (err) {
          console.warn(`[skill] landing variants failed:`, err);
        }
      })(),
      // Palette expansion
      (async () => {
        try {
          const p = await generatePaletteExpansion(brand as never, outDir);
          if (p) {
            mergeOutputs({
              paletteExpansion: {
                url: assetUrl(p.filename),
                light: p.light,
                dark: p.dark,
                semantic: p.semantic,
              },
            });
          }
        } catch (err) {
          console.warn(`[skill] palette expansion failed:`, err);
        }
      })(),
      // Social kit
      (async () => {
        try {
          const assets = await generateSocialKit(brand as never, outDir);
          mergeOutputs({
            socialKit: assets.length
              ? assets.map((a) => ({
                  key: a.key,
                  title: a.title,
                  platform: a.platform,
                  size: a.size,
                  url: assetUrl(a.filename),
                }))
              : undefined,
          });
        } catch (err) {
          console.warn(`[skill] social kit failed:`, err);
        }
      })(),
      // Pitch one-pager
      (async () => {
        try {
          const p = await generatePitchOnePager(brand as never, outDir);
          if (p) {
            mergeOutputs({
              pitchOnePager: {
                htmlUrl: assetUrl(p.htmlFilename),
                pdfUrl: p.pdfFilename ? assetUrl(p.pdfFilename) : undefined,
              },
            });
          }
        } catch (err) {
          console.warn(`[skill] pitch one-pager failed:`, err);
        }
      })(),
      // Email kit
      (async () => {
        try {
          const e = await generateEmailKit(brand as never, outDir);
          if (e) {
            mergeOutputs({
              emailKit: {
                headerUrl: e.headerFilename ? assetUrl(e.headerFilename) : undefined,
                signatureUrl: e.signatureFilename ? assetUrl(e.signatureFilename) : undefined,
              },
            });
          }
        } catch (err) {
          console.warn(`[skill] email kit failed:`, err);
        }
      })(),
    ];

    await Promise.allSettled(tasks);

    updateBrand(id, {
      status: "complete",
      progressStage: "complete",
      progressPct: 1,
    });
  } catch (err) {
    updateBrand(id, {
      status: "failed",
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

/**
 * Copy a file the user uploaded (via /api/uploads) into the brand's output
 * directory as the primary logo, preserving extension. Returns the URL the
 * project panel should use to display it.
 */
async function copyUploadedLogo(
  uploadedPath: string,
  brandOutDir: string,
  brandId: string
): Promise<string> {
  // uploadedPath looks like "/api/uploads/<sessionId>/<filename>"
  const match = uploadedPath.match(/^\/api\/uploads\/([^/]+)\/(.+)$/);
  if (!match) throw new Error(`unrecognized upload path: ${uploadedPath}`);
  const [, sessionId, rawName] = match;
  const filename = decodeURIComponent(rawName);
  const src = path.join(
    process.cwd(),
    "data",
    "uploads",
    sessionId,
    filename
  );
  const ext = path.extname(filename).toLowerCase() || ".svg";
  const destName = `logo${ext}`;
  const dest = path.join(brandOutDir, destName);
  const buf = fs.readFileSync(src);
  fs.writeFileSync(dest, buf);
  return `/api/brands/${brandId}/files/${encodeURIComponent(destName)}`;
}

export { getBrand };
