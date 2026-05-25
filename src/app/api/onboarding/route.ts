import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  // Store intent answers — for now just acknowledge.
  // In a full implementation this would save to the user's profile in DB.
  return Response.json({
    success: true,
    dashboard_config: {
      audience: body.audience || "solo",
      brandCount: body.brandCount || "one",
      needsDashboard: body.needsDashboard ?? false,
      techStack: body.techStack || [],
    },
  });
}
