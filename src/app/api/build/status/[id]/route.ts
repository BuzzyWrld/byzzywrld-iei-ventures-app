import { NextRequest } from "next/server";
import { getBrand } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const brand = await getBrand(id);

  if (!brand) {
    return Response.json({ error: "not found" }, { status: 404 });
  }

  if (brand.status === "complete") {
    return Response.json({
      build_id: id,
      status: "ready",
      progress: 1.0,
      brand_json: brand.outputs,
      asset_urls: {
        playbook_pdf: brand.outputs?.playbookPdf || null,
        logo_svg: brand.outputs?.logoSvg || null,
      },
    });
  }

  if (brand.status === "failed" || brand.error) {
    return Response.json({
      build_id: id,
      status: "error",
      progress: brand.progressPct || 0,
      error: brand.error || "Unknown error",
    });
  }

  // In progress
  return Response.json({
    build_id: id,
    status: "processing",
    progress: brand.progressPct || 0.1,
    current_step: brand.progressStage || "Building brand identity",
    completed_steps: [],
  });
}
