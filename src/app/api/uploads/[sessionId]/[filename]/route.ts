import { NextRequest } from "next/server";
import path from "node:path";
import { readUpload } from "@/lib/uploads";

export const runtime = "nodejs";

const CONTENT_TYPES: Record<string, string> = {
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ sessionId: string; filename: string }> }
) {
  const { sessionId, filename } = await params;
  const name = decodeURIComponent(filename);
  if (name.includes("..") || name.includes("/")) {
    return new Response("bad filename", { status: 400 });
  }
  const buf = await readUpload(sessionId, name);
  if (!buf) return new Response("not found", { status: 404 });
  const ct = CONTENT_TYPES[path.extname(name).toLowerCase()] ?? "application/octet-stream";
  return new Response(new Uint8Array(buf), { headers: { "Content-Type": ct } });
}
