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
  BrandProject,
  EmailKitRef,
  LandingVariantRef,
  LogoVariantRef,
  PaletteExpansionRef,
  PitchOnePagerRef,
  SocialAssetRef,
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
    const assetUrl = (rel: string) =>
      `/api/brands/${id}/files/${rel.split("/").map(encodeURIComponent).join("/")}`;

    // Load the brand.json so the variant generators can work from real data.
    let brand: Record<string, unknown> = {};
    try {
      brand = JSON.parse(fs.readFileSync(path.join(outDir, manifest.brandJson), "utf8"));
    } catch (err) {
      console.warn(`[skill] couldn't read brand.json for variants:`, err);
    }

    // If the user uploaded their own logo, copy it into the brand outputs
    // and skip the variant generation — we respect their choice.
    let userUploadedLogoUrl: string | undefined;
    if (intake.uploadedLogoPath) {
      try {
        userUploadedLogoUrl = await copyUploadedLogo(intake.uploadedLogoPath, outDir, id);
      } catch (err) {
        console.warn(`[skill] couldn't copy uploaded logo:`, err);
      }
    }

    // Fire all 6 variant generators in parallel. Each is best-effort —
    // failure of any one doesn't block the others or fail the build.
    // Logo variants are skipped when the user provided their own.
    updateBrand(id, { progressStage: "generating brand extras", progressPct: 0.92 });
    const [
      logoResult,
      landingResult,
      paletteResult,
      socialResult,
      pitchResult,
      emailResult,
    ] = await Promise.allSettled([
      userUploadedLogoUrl
        ? Promise.resolve([])
        : generateLogoVariants(brand as never, outDir, 3),
      generateLandingVariants(brand as never, outDir, 3),
      generatePaletteExpansion(brand as never, outDir),
      generateSocialKit(brand as never, outDir),
      generatePitchOnePager(brand as never, outDir),
      generateEmailKit(brand as never, outDir),
    ]);

    const logoVariants: LogoVariantRef[] =
      logoResult.status === "fulfilled"
        ? logoResult.value.map((v) => ({
            key: v.key,
            title: v.title,
            rationale: v.rationale,
            url: assetUrl(v.filename),
          }))
        : [];

    const landingVariants: LandingVariantRef[] =
      landingResult.status === "fulfilled"
        ? landingResult.value.map((v) => ({
            key: v.key,
            title: v.title,
            rationale: v.rationale,
            url: assetUrl(v.filename),
          }))
        : [];

    let paletteExpansion: PaletteExpansionRef | undefined;
    if (paletteResult.status === "fulfilled" && paletteResult.value) {
      const p = paletteResult.value;
      paletteExpansion = {
        url: assetUrl(p.filename),
        light: p.light,
        dark: p.dark,
        semantic: p.semantic,
      };
    }

    const socialKit: SocialAssetRef[] =
      socialResult.status === "fulfilled"
        ? socialResult.value.map((a) => ({
            key: a.key,
            title: a.title,
            platform: a.platform,
            size: a.size,
            url: assetUrl(a.filename),
          }))
        : [];

    let pitchOnePager: PitchOnePagerRef | undefined;
    if (pitchResult.status === "fulfilled" && pitchResult.value) {
      pitchOnePager = {
        htmlUrl: assetUrl(pitchResult.value.htmlFilename),
        pdfUrl: pitchResult.value.pdfFilename
          ? assetUrl(pitchResult.value.pdfFilename)
          : undefined,
      };
    }

    let emailKit: EmailKitRef | undefined;
    if (emailResult.status === "fulfilled" && emailResult.value) {
      emailKit = {
        headerUrl: emailResult.value.headerFilename
          ? assetUrl(emailResult.value.headerFilename)
          : undefined,
        signatureUrl: emailResult.value.signatureFilename
          ? assetUrl(emailResult.value.signatureFilename)
          : undefined,
      };
    }

    updateBrand(id, {
      status: "complete",
      progressStage: "complete",
      progressPct: 1,
      outputs: {
        brandJson: fileUrl(manifest.brandJson),
        playbookHtml: fileUrl(manifest.playbookHtml),
        playbookPdf: fileUrl(manifest.playbookPdf),
        landingHtml: fileUrl(manifest.landingHtml),
        logoSvg: userUploadedLogoUrl ?? fileUrl(manifest.logoSvg),
        logoVariants: logoVariants.length ? logoVariants : undefined,
        landingVariants: landingVariants.length ? landingVariants : undefined,
        paletteExpansion,
        socialKit: socialKit.length ? socialKit : undefined,
        pitchOnePager,
        emailKit,
      },
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
