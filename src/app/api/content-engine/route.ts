import { NextRequest } from "next/server";
import { enqueueContentRun } from "@/lib/content-engine-runner";
import { listContentRuns } from "@/lib/db";
import { currentTenant } from "@/lib/current-tenant";
import { currentUser } from "@/lib/auth";
import type { ContentRunIntake } from "@/lib/skills/content-engine-contract";

export async function GET() {
  const [tenant, user] = await Promise.all([currentTenant(), currentUser()]);
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });
  return Response.json({ runs: listContentRuns({ tenantId: tenant.id, userId: user.id }) });
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

  const run = enqueueContentRun(intake, { tenantId: tenant.id, userId: user.id });
  return Response.json({ run }, { status: 202 });
}
