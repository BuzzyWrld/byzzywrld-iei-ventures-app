import { NextRequest } from "next/server";
import fs from "node:fs/promises";
import { deleteBrand, getBrand } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { brandDir } from "@/lib/storage";

export async function GET(
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
  return Response.json({ project });
}

export async function DELETE(
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

  // Delete DB row first, then best-effort clean up generated files.
  await deleteBrand(id);
  try {
    await fs.rm(brandDir(id), { recursive: true, force: true });
  } catch (err) {
    console.warn(`[brands] file cleanup failed for ${id}:`, err);
  }
  return Response.json({ ok: true });
}
