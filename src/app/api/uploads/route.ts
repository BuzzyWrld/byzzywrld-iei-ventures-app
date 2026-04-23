import { NextRequest } from "next/server";
import { listUploads, newSessionId, storeUpload } from "@/lib/uploads";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const sessionId = (form.get("sessionId") as string | null) ?? newSessionId();
  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return Response.json({ error: "no files provided" }, { status: 400 });
  }
  try {
    const uploaded = await Promise.all(files.map((f) => storeUpload(sessionId, f)));
    const all = await listUploads(sessionId);
    return Response.json({ sessionId, uploaded, all }, { status: 201 });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("sessionId");
  if (!sessionId) return Response.json({ error: "sessionId required" }, { status: 400 });
  const all = await listUploads(sessionId);
  return Response.json({ sessionId, all });
}
