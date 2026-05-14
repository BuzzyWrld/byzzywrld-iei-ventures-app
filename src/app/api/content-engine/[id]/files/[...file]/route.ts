import { NextRequest } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { contentRunDir } from "@/lib/content-engine-runner";
import { contentTypeFor } from "@/lib/storage";
import { currentUser } from "@/lib/auth";
import { getContentRun } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; file: string[] }> }
) {
  const user = await currentUser();
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });

  const { id, file } = await params;

  // Ownership check: content run must belong to the user's tenant
  const run = await getContentRun(id);
  if (!run) return Response.json({ error: "not found" }, { status: 404 });
  if (run.tenantId !== user.tenantId) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  const filename = file.map(decodeURIComponent).join("/");

  // Prevent path traversal
  const runDir = contentRunDir(id);
  const filePath = path.resolve(runDir, filename);
  if (!filePath.startsWith(path.resolve(runDir))) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  if (!fs.existsSync(filePath)) {
    return Response.json({ error: "not found" }, { status: 404 });
  }

  const buffer = fs.readFileSync(filePath);
  const contentType = contentTypeFor(filename);

  return new Response(buffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
