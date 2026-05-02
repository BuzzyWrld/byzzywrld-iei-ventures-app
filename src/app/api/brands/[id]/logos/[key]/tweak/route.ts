/**
 * Tweak a logo SVG via natural-language instruction.
 *   POST /api/brands/:id/logos/:key/tweak
 *   body: { instruction: string }
 *   returns: { url: string }   ← cache-busted URL of the updated SVG
 *
 * Reads the existing logo SVG from disk, sends it to the model with the
 * user's instruction, writes the result back to the same path. The
 * response URL has a `?v=<timestamp>` cache-buster so the browser shows
 * the new SVG immediately.
 */
import { NextRequest } from "next/server";
import path from "node:path";
import { getBrand } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { tweakLogo } from "@/lib/logos";
import { brandDir } from "@/lib/storage";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; key: string }> }
) {
  const user = await currentUser();
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });

  const { id, key } = await params;
  const project = getBrand(id);
  if (!project) return Response.json({ error: "not found" }, { status: 404 });
  if (project.userId && project.userId !== user.id) {
    return Response.json({ error: "not found" }, { status: 404 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    instruction?: string;
  };
  const instruction =
    typeof body.instruction === "string" ? body.instruction.trim() : "";
  if (!instruction) {
    return Response.json({ error: "instruction required" }, { status: 400 });
  }
  if (instruction.length > 500) {
    return Response.json(
      { error: "instruction too long (max 500 chars)" },
      { status: 400 }
    );
  }

  // Validate key against the project's logo variants — prevents arbitrary
  // file access via a crafted key.
  const variants = project.outputs.logoVariants ?? [];
  const variant = variants.find((v) => v.key === key);
  if (!variant) {
    return Response.json({ error: "unknown logo key" }, { status: 400 });
  }

  // Resolve the SVG path on disk: outputs/<id>/logos/<key>.svg
  const svgPath = path.join(brandDir(id), "logos", `${key}.svg`);

  const result = await tweakLogo(svgPath, instruction);
  if (!result) {
    return Response.json(
      { error: "tweak failed — try rephrasing or simplifying the request" },
      { status: 500 }
    );
  }

  // Cache-bust the URL so the browser doesn't show the stale SVG.
  const bust = Date.now();
  const url = `${variant.url}?v=${bust}`;
  return Response.json({ ok: true, url });
}
