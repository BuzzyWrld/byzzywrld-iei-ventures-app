import { after } from "next/server";
import { NextRequest } from "next/server";
import { getBrand } from "@/lib/db";
import { retryBrandBuild } from "@/lib/skill";
import { currentUser } from "@/lib/auth";

export const maxDuration = 300;

export async function POST(
  _req: NextRequest,
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

  const result = await retryBrandBuild(id);
  if (!result) return Response.json({ error: "failed to retry" }, { status: 500 });

  after(async () => {
    try {
      await result.work;
    } catch (err) {
      console.error("[brands] background retry build failed:", err);
    }
  });

  return Response.json({ project: result.project }, { status: 202 });
}
