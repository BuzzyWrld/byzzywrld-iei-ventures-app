import { NextRequest } from "next/server";
import { getContentRun } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await currentUser();
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const run = getContentRun(id);
  if (!run) return Response.json({ error: "not found" }, { status: 404 });
  if (run.userId && run.userId !== user.id) {
    return Response.json({ error: "not found" }, { status: 404 });
  }

  return Response.json({ run });
}
