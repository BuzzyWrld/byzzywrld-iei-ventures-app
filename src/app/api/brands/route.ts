import { NextRequest } from "next/server";
import { BrandIntakeSchema } from "@/lib/types";
import { triggerBrandBuild } from "@/lib/skill";
import { listBrands } from "@/lib/db";

export async function GET() {
  return Response.json({ brands: listBrands() });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = BrandIntakeSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid intake", issues: parsed.error.issues },
      { status: 400 }
    );
  }
  const project = await triggerBrandBuild(parsed.data);
  return Response.json({ project }, { status: 201 });
}
