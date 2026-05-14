import { NextRequest } from "next/server";
import path from "node:path";
import { brandDir, contentTypeFor, readOutputAsync } from "@/lib/storage";
import { currentUser } from "@/lib/auth";
import { getBrand } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; file: string[] }> }
) {
  const user = await currentUser();
  if (!user) return new Response("unauthorized", { status: 401 });

  const { id, file } = await params;

  // Ownership check: brand must belong to the user's tenant
  const brand = await getBrand(id);
  if (!brand) return new Response("not found", { status: 404 });
  if (brand.tenantId !== user.tenantId) {
    return new Response("forbidden", { status: 403 });
  }

  if (!file || file.length === 0) return new Response("not found", { status: 404 });

  const rel = file.map((s) => decodeURIComponent(s)).join("/");
  if (rel.includes("..") || rel.startsWith("/")) {
    return new Response("bad filename", { status: 400 });
  }

  const root = brandDir(id);
  const abs = path.normalize(path.join(root, rel));
  if (!abs.startsWith(path.resolve(root))) {
    return new Response("bad filename", { status: 400 });
  }

  // Try local fs first, fall back to Vercel Blob on cold start
  const buf = await readOutputAsync(id, rel);
  if (!buf) return new Response("not found", { status: 404 });

  return new Response(new Uint8Array(buf), {
    headers: { "Content-Type": contentTypeFor(rel) },
  });
}
