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
import { generateDevBrief } from "./variants/dev-brief";
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
  void runPhase1(project);
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
  void runPhase1(refreshed);
  return refreshed;
}

/**
 * Trigger Phase 2 (the 6 non-logo variants) for a brand whose user has just
 * picked a logo. Idempotent — if the brand already has variant outputs from
 * a prior Phase 2 run, skips re-generation. Called from the
 * /api/brands/[id]/primary-logo PATCH endpoint.
 */
export function triggerPhase2(id: string): void {
  const project = getBrand(id);
  if (!project) return;
  // Already done — don't re-fire.
  if (project.outputs.devBrief && project.outputs.pitchOnePager) return;
  void runPhase2(project);
}

/**
 * Phase 1 of a sequential build: main skill + 3 logo variants only.
 * Sets status="complete" once logos are ready so the LogoPickerGate
 * surfaces. Phase 2 (the other 6 variants) is triggered when the user
 * picks a logo via /api/brands/[id]/primary-logo.
 *
 * If the user uploaded their own logo, Phase 2 fires automatically at
 * the end of this function instead of waiting for a pick.
 */
async function runPhase1(project: BrandProject): Promise<void> {
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

    // Final safety net: even if the adapter "succeeded," verify the playbook
    // is actually complete. An empty body (CSS-only) playbook is the #1
    // quality bug and the user shouldn't see it on the brand panel.
    const playbookPath = path.join(outDir, manifest.playbookHtml ?? "playbook.html");
    try {
      const stat = fs.statSync(playbookPath);
      const content = fs.readFileSync(playbookPath, "utf8");
      const pages = (content.match(/<div\s+class\s*=\s*"[^"]*\bpage\b[^"]*"/g) ?? []).length;
      if (stat.size < 14000 || pages < 5) {
        throw new Error(
          `playbook.html is incomplete: ${stat.size} bytes, ${pages} pages — a real brand kit needs at least 14KB and 5+ .page sections`
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`playbook validation failed: ${msg}`);
    }

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
    // Setting primaryLogoKey='user-uploaded' skips the picker gate on the UI.
    let userUploadedLogoUrl: string | undefined;
    if (intake.uploadedLogoPath) {
      try {
        userUploadedLogoUrl = await copyUploadedLogo(intake.uploadedLogoPath, outDir, id);
        mergeOutputs({
          logoSvg: userUploadedLogoUrl,
          primaryLogoKey: "user-uploaded",
        });
      } catch (err) {
        console.warn(`[skill] couldn't copy uploaded logo:`, err);
      }
    }

    // PHASE 1: generate the 3 logo variants (skipped if user uploaded their own).
    // Once logos exist, we flip to "complete" so the LogoPickerGate appears
    // — the user picks one, then Phase 2 fires via triggerPhase2().
    updateBrand(id, { progressStage: "designing logo options", progressPct: 0.92 });

    if (!userUploadedLogoUrl) {
      try {
        const variants = await generateLogoVariants(brand as never, outDir, 3, {
          style: intake.logoStyle,
          inspirationUrls: intake.logoInspirationUrls,
        });
        if (variants.length) {
          mergeOutputs({
            logoVariants: variants.map((v) => ({
              key: v.key,
              title: v.title,
              rationale: v.rationale,
              url: assetUrl(v.filename),
            })),
          });
        }
      } catch (err) {
        console.warn(`[skill] phase 1 logos failed:`, err);
      }
    }

    if (userUploadedLogoUrl) {
      // User uploaded their own logo — no pick needed. Fire Phase 2
      // straight through without flashing a "complete" state.
      const refreshed = getBrand(id);
      if (refreshed) void runPhase2(refreshed);
    } else {
      // Logos generated; let the brand panel reveal the picker.
      updateBrand(id, {
        status: "complete",
        progressStage: "awaiting logo pick",
        progressPct: 1,
      });
    }
  } catch (err) {
    updateBrand(id, {
      status: "failed",
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

/**
 * Phase 2 of a sequential build: the 6 non-logo variants. Triggered after
 * the user picks a logo (or automatically if they uploaded their own).
 * Runs all 6 in parallel — each retries on transient errors per the
 * callClaude helper, so a partial-failure brand panel is the worst case.
 */
async function runPhase2(project: BrandProject): Promise<void> {
  const { id, intake } = project;
  const outDir = brandDir(id);
  const assetUrl = (rel: string) =>
    `/api/brands/${id}/files/${rel.split("/").map(encodeURIComponent).join("/")}`;
  const mergeOutputs = (patch: Partial<BrandOutputs>) => {
    const current = getBrand(id)?.outputs ?? {};
    updateBrand(id, { outputs: { ...current, ...patch } });
  };

  // Reload brand.json fresh — it may have been touched by tweaks etc.
  let brand: Record<string, unknown> = {};
  try {
    brand = JSON.parse(fs.readFileSync(path.join(outDir, "brand.json"), "utf8"));
  } catch (err) {
    console.warn(`[phase2] couldn't read brand.json:`, err);
    return;
  }

  // Flip status back to running so the brand panel shows the building UI
  // again (stage cards + "usually takes 2-3 minutes" copy).
  updateBrand(id, {
    status: "running",
    progressStage: "building the rest of your kit",
    progressPct: 0,
  });

  const intakeCtx = {
    notes: intake.notes,
    archetype: intake.archetype,
    competitors: intake.competitors,
    industry: intake.industry,
    productDescription: intake.productDescription,
    targetAudience: intake.targetAudience,
    logoStyle: intake.logoStyle,
    logoInspirationUrls: intake.logoInspirationUrls,
  };

  const tasks: Array<Promise<void>> = [
    (async () => {
      try {
        const variants = await generateLandingVariants(brand as never, outDir, 3, intakeCtx);
        if (variants.length) {
          mergeOutputs({
            landingVariants: variants.map((v) => ({
              key: v.key,
              title: v.title,
              rationale: v.rationale,
              url: assetUrl(v.filename),
            })),
          });
        }
      } catch (err) {
        console.warn(`[phase2] landing variants failed:`, err);
      }
    })(),
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
        console.warn(`[phase2] palette expansion failed:`, err);
      }
    })(),
    (async () => {
      try {
        const assets = await generateSocialKit(brand as never, outDir, intakeCtx);
        if (assets.length) {
          mergeOutputs({
            socialKit: assets.map((a) => ({
              key: a.key,
              title: a.title,
              platform: a.platform,
              size: a.size,
              url: assetUrl(a.filename),
            })),
          });
        }
      } catch (err) {
        console.warn(`[phase2] social kit failed:`, err);
      }
    })(),
    (async () => {
      try {
        const p = await generatePitchOnePager(brand as never, outDir, intakeCtx);
        if (p) {
          mergeOutputs({
            pitchOnePager: {
              htmlUrl: assetUrl(p.htmlFilename),
              pdfUrl: p.pdfFilename ? assetUrl(p.pdfFilename) : undefined,
            },
          });
        }
      } catch (err) {
        console.warn(`[phase2] pitch failed:`, err);
      }
    })(),
    (async () => {
      try {
        const e = await generateEmailKit(brand as never, outDir, intakeCtx);
        if (e) {
          mergeOutputs({
            emailKit: {
              headerUrl: e.headerFilename ? assetUrl(e.headerFilename) : undefined,
              signatureUrl: e.signatureFilename ? assetUrl(e.signatureFilename) : undefined,
            },
          });
        }
      } catch (err) {
        console.warn(`[phase2] email failed:`, err);
      }
    })(),
    (async () => {
      try {
        const d = await generateDevBrief(brand as never, outDir, intakeCtx);
        if (d) {
          mergeOutputs({
            devBrief: {
              htmlUrl: assetUrl(d.htmlFilename),
              pdfUrl: d.pdfFilename ? assetUrl(d.pdfFilename) : undefined,
            },
          });
        }
      } catch (err) {
        console.warn(`[phase2] dev brief failed:`, err);
      }
    })(),
  ];

  await Promise.allSettled(tasks);

  updateBrand(id, {
    status: "complete",
    progressStage: "complete",
    progressPct: 1,
  });
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
