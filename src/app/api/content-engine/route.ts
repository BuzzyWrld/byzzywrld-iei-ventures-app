import { after } from "next/server";
import { NextRequest } from "next/server";
import { enqueueContentRun } from "@/lib/content-engine-runner";
import { listContentRuns } from "@/lib/db";
import { listRunsFromBlob } from "@/lib/blob-runs";
import { currentTenant } from "@/lib/current-tenant";
import { currentUser } from "@/lib/auth";
import type { ContentRunIntake } from "@/lib/skills/content-engine-contract";

export const maxDuration = 300;

export async function GET() {
  const [tenant, user] = await Promise.all([currentTenant(), currentUser()]);
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });
  // Try SQLite first; if empty, fall back to Vercel Blob
  let runs = listContentRuns({ tenantId: tenant.id, userId: user.id });
  if (runs.length === 0) {
    const blobRuns = await listRunsFromBlob();
    runs = blobRuns.filter(
      (r) => r.tenantId === tenant.id && (!r.userId || r.userId === user.id)
    );
  }
  return Response.json({ runs });
}

export async function POST(request: NextRequest) {
  const [tenant, user] = await Promise.all([currentTenant(), currentUser()]);
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });

  const body = (await request.json()) as Partial<ContentRunIntake>;
  const intake: ContentRunIntake = {
    label: typeof body.label === "string" ? body.label : undefined,
    campaignStartDate:
      typeof body.campaignStartDate === "string" ? body.campaignStartDate : undefined,
    model: typeof body.model === "string" ? body.model : undefined,
    contextNotes: typeof body.contextNotes === "string" ? body.contextNotes : undefined,
  };

  console.log("[content-engine] POST: enqueuing run");
  const { run, work } = enqueueContentRun(intake, { tenantId: tenant.id, userId: user.id });
  console.log(`[content-engine] POST: run ${run.id} created, scheduling after()`);

  // after() takes a callback, not a raw Promise.
  // The callback runs after the response is sent to the client.
  after(async () => {
    console.log(`[content-engine] after(): starting work for ${run.id}`);
    try {
      await work;
      console.log(`[content-engine] after(): work completed for ${run.id}`);
    } catch (err) {
      console.error("[content-engine] background work failed:", err);
      // Persist the error to Blob so polling can surface it
      try {
        const { persistRun } = await import("@/lib/blob-runs");
        const errMsg = err instanceof Error ? `${err.message}\n${err.stack}` : String(err);
        await persistRun({ ...run, status: "failed", error: errMsg });
      } catch { /* best-effort */ }
    }
  });
  return Response.json({ run }, { status: 202 });
}
