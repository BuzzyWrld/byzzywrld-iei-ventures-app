import { after } from "next/server";
import { NextRequest } from "next/server";
import { BrandIntakeSchema } from "@/lib/types";
import { enqueueBrandBuild } from "@/lib/skill";
import { listBrands } from "@/lib/db";
import { currentTenant } from "@/lib/current-tenant";
import { currentUser } from "@/lib/auth";

export const maxDuration = 300;

export async function GET() {
  const [tenant, user] = await Promise.all([currentTenant(), currentUser()]);
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });
  return Response.json({ brands: await listBrands({ tenantId: tenant.id, userId: user.id }) });
}

export async function POST(request: NextRequest) {
  const [tenant, user] = await Promise.all([currentTenant(), currentUser()]);
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = BrandIntakeSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid intake", issues: parsed.error.issues },
      { status: 400 }
    );
  }
  const { project, work } = await enqueueBrandBuild(parsed.data, {
    tenantId: tenant.id,
    userId: user.id,
  });

  after(async () => {
    try {
      await work;
    } catch (err) {
      console.error("[brands] background brand build failed:", err);
    }
  });

  return Response.json({ project }, { status: 202 });
}
