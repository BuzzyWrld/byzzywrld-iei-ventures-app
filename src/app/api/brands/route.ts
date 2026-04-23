import { NextRequest } from "next/server";
import { BrandIntakeSchema } from "@/lib/types";
import { enqueueBrandBuild } from "@/lib/skill";
import { listBrands } from "@/lib/db";
import { currentTenant } from "@/lib/current-tenant";
import { currentUser } from "@/lib/auth";

export async function GET() {
  const [tenant, user] = await Promise.all([currentTenant(), currentUser()]);
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });
  return Response.json({ brands: listBrands({ tenantId: tenant.id, userId: user.id }) });
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
  const project = enqueueBrandBuild(parsed.data, {
    tenantId: tenant.id,
    userId: user.id,
  });
  return Response.json({ project }, { status: 202 });
}
