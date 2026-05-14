/**
 * GET  /api/content-engine/[id]/video — check video status
 * POST /api/content-engine/[id]/video — trigger (or re-trigger) brand video render
 */

import { NextResponse } from "next/server";
import { getContentRun, updateContentRun } from "@/lib/db";
import { listBrands } from "@/lib/db";
import { isVideoRenderEnabled, renderBrandVideo } from "@/lib/video-render";
import { OUTPUTS_ROOT } from "@/lib/storage";
import fs from "node:fs";
import path from "node:path";
import { after } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Params) {
  const { id } = await ctx.params;
  const run = await getContentRun(id);
  if (!run) return NextResponse.json({ error: "not found" }, { status: 404 });

  return NextResponse.json({
    enabled: isVideoRenderEnabled(),
    videoUrl: run.outputs.brandVideoUrl ?? null,
    renderId: run.outputs.brandVideoRenderId ?? null,
    status: run.outputs.brandVideoUrl ? "complete" : "pending",
  });
}

export async function POST(_req: Request, ctx: Params) {
  const { id } = await ctx.params;
  const run = await getContentRun(id);
  if (!run) return NextResponse.json({ error: "not found" }, { status: 404 });

  if (!isVideoRenderEnabled()) {
    return NextResponse.json(
      { error: "Video rendering not configured — set REMOTION_* env vars" },
      { status: 503 }
    );
  }

  // Find the tenant's brand data
  const brands = await listBrands({ tenantId: run.tenantId });
  const brand = brands.find((b) => b.status === "complete");
  if (!brand) {
    return NextResponse.json({ error: "No completed brand found for this tenant" }, { status: 400 });
  }

  const brandJsonPath = path.join(OUTPUTS_ROOT, brand.id, "brand.json");
  if (!fs.existsSync(brandJsonPath)) {
    return NextResponse.json({ error: "brand.json not found" }, { status: 400 });
  }

  const brandData = JSON.parse(fs.readFileSync(brandJsonPath, "utf8")) as {
    name?: string;
    tagline?: string;
    colors?: { primary: string; secondary: string; accent: string; neutral: string };
    typography?: { heading: string; body: string };
    mission?: string;
    ica?: string;
  };

  // Fire in background via next/server after()
  after(async () => {
    try {
      const result = await renderBrandVideo(
        {
          brandName: brandData.name ?? brand.intake.companyName,
          tagline: brandData.tagline ?? "",
          colors: brandData.colors ?? { primary: "#FFCC00", secondary: "#1A1A1A", accent: "#FFD633", neutral: "#F5F5F5" },
          typography: brandData.typography ?? { heading: "Inter", body: "Inter" },
          mission: brandData.mission,
          ica: brandData.ica,
        },
        async (pct) => {
          await updateContentRun(id, { progressStage: `rendering video ${Math.round(pct * 100)}%` });
        }
      );

      if (result.outputUrl) {
        const current = await getContentRun(id);
        const existingOutputs = current?.outputs ?? { weeks: [] };
        await updateContentRun(id, {
          outputs: {
            ...existingOutputs,
            brandVideoUrl: result.outputUrl,
            brandVideoRenderId: result.renderId,
          },
        });
      }
    } catch (err) {
      console.error(`[brand-video] trigger failed for run ${id}:`, err);
    }
  });

  return NextResponse.json({ status: "rendering", message: "Video render triggered" });
}
