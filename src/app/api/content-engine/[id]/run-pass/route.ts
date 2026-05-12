import { after } from "next/server";
import { NextRequest } from "next/server";
import { runPassFromRequest } from "@/lib/content-engine-runner";
import type { ContentRun } from "@/lib/skills/content-engine-contract";

export const maxDuration = 300;

/**
 * POST /api/content-engine/[id]/run-pass
 *
 * Internal endpoint. Called by the content engine runner to trigger the next
 * pass in a fresh Lambda invocation (giving it its own 300s maxDuration budget).
 *
 * Body: { run: ContentRun, pass: 2 | 3 | 4 | 5 }
 *
 * The run state is passed in the body so this handler can upsert it into the
 * local SQLite even if this Lambda instance started cold with an empty /tmp.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await request.json()) as { run: ContentRun; pass: number };

  if (!body.run || !body.pass || body.run.id !== id) {
    return Response.json({ error: "invalid request" }, { status: 400 });
  }

  const pass = body.pass as 2 | 3 | 4 | 5;
  if (![2, 3, 4, 5].includes(pass)) {
    return Response.json({ error: "invalid pass number" }, { status: 400 });
  }

  after(async () => {
    try {
      await runPassFromRequest(body.run, pass);
    } catch (err) {
      console.error(`[content-engine] run-pass ${pass} failed:`, err);
    }
  });
  return Response.json({ ok: true });
}
