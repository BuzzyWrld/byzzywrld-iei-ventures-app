import { after } from "next/server";
import { NextRequest } from "next/server";
import { getBrand, updateBrand } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { triggerPhase2 } from "@/lib/skill";

export const maxDuration = 300;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await currentUser();
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const project = await getBrand(id);
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

  await updateBrand(id, {
    outputs: {
      ...project.outputs,
      primaryLogoKey: key,
      logoSvg: picked.url,
    },
  });

  const work = await triggerPhase2(id);
  if (work) {
    after(async () => {
      try {
        await work;
      } catch (err) {
        console.error("[brands] background phase 2 failed:", err);
      }
    });
  }

  return Response.json({ ok: true, primaryLogoKey: key });
}
