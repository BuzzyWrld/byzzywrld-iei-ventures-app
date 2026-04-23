import { NextRequest } from "next/server";
import path from "node:path";
import fs from "node:fs";
import { brandDir, contentTypeFor } from "@/lib/storage";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; file: string[] }> }
) {
  const { id, file } = await params;
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

  try {
    const buf = fs.readFileSync(abs);
    return new Response(new Uint8Array(buf), {
      headers: { "Content-Type": contentTypeFor(rel) },
    });
  } catch {
    return new Response("not found", { status: 404 });
  }
}
