import { NextRequest } from "next/server";
import { contentTypeFor, readOutput } from "@/lib/storage";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; file: string }> }
) {
  const { id, file } = await params;
  const name = decodeURIComponent(file);
  if (name.includes("..") || name.includes("/")) {
    return new Response("bad filename", { status: 400 });
  }
  const buf = readOutput(id, name);
  if (!buf) return new Response("not found", { status: 404 });
  return new Response(new Uint8Array(buf), {
    headers: { "Content-Type": contentTypeFor(name) },
  });
}
