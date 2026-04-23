import { NextRequest } from "next/server";
import { getBrand } from "@/lib/db";
import { retryBrandBuild } from "@/lib/skill";
import { currentUser } from "@/lib/auth";

export async function POST(
  _req: NextRequest,
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

  const refreshed = retryBrandBuild(id);
  if (!refreshed) return Response.json({ error: "failed to retry" }, { status: 500 });
  return Response.json({ project: refreshed }, { status: 202 });
}
