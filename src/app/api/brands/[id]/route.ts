import { NextRequest } from "next/server";
import { getBrand } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const project = getBrand(id);
  if (!project) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json({ project });
}
