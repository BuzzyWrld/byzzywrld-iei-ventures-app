import { NextRequest } from "next/server";
import { getBrand, updateBrand } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { triggerPhase2 } from "@/lib/skill";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await currentUser();
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const project = getBrand(id);
  if (!project) return Response.json({ error: "not found" }, { status: 404 });
  if (project.userId && project.userId !== user.id) {
    return Response.json({ error: "not found" }, { status: 404 });
  }

  const body = (await request.json().catch(() => ({}))) as { key?: string };
  const key = typeof body.key === "string" ? body.key : "";
  if (!key) return Response.json({ error: "key required" }, { status: 400 });

  const variants = project.outputs.logoVariants ?? [];
  const picked = variants.find((v) => v.key === key);
  if (!picked) {
    return Response.json({ error: "unknown logo key" }, { status: 400 });
  }

  updateBrand(id, {
    outputs: {
      ...project.outputs,
      primaryLogoKey: key,
      // Also flip the top-level logoSvg to the picked one so downstream
      // components that read logoSvg (project panel header, download list)
      // show the user's pick.
      logoSvg: picked.url,
    },
  });

  // SEQUENTIAL GENERATION: this is the trigger for Phase 2 (the 6 non-logo
  // variants). triggerPhase2 is idempotent — if the brand already has those
  // outputs (from a re-pick or earlier run), it skips. Fire-and-forget; the
  // UI sees the brand flip back to "running" while Phase 2 runs.
  triggerPhase2(id);

  return Response.json({ ok: true, primaryLogoKey: key });
}
