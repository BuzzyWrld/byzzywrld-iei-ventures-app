import { after } from "next/server";
import { NextRequest } from "next/server";
import { advanceContentRun } from "@/lib/content-engine-runner";
import { getContentRun, updateContentRun } from "@/lib/db";
import { currentUser } from "@/lib/auth";

/**
 * POST /api/content-engine/[id]/approve
 *
 * Approves the week currently in review and triggers the next generation pass.
 * Body: { weekNumber: 1 | 2 | 3 | 4 }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await currentUser();
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const run = await getContentRun(id);
  if (!run) return Response.json({ error: "not found" }, { status: 404 });
  if (run.userId && run.userId !== user.id) {
    return Response.json({ error: "not found" }, { status: 404 });
  }

  const body = (await request.json()) as { weekNumber?: number };
  const weekNumber = body.weekNumber;

  // Mark the week as approved in the outputs array
  const weeks = run.outputs.weeks.map((w) =>
    w.weekNumber === weekNumber ? { ...w, status: "approved" as const, approvedAt: new Date().toISOString() } : w
  );
  await updateContentRun(id, { outputs: { ...run.outputs, weeks } });

  // Advance to the next pass (triggers async agent run)
  const { run: updated, work } = await advanceContentRun(id);
  if (work) after(work);
  return Response.json({ run: updated });
}
