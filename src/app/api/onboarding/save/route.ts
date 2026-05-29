import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { intent } = body;

  if (!intent?.audience) {
    return Response.json({ error: "audience is required" }, { status: 400 });
  }

  // Determine dashboard preset based on answers
  const key = `${intent.audience}-${intent.brandCount || "one"}-${intent.needsDashboard || "maybe-later"}`;
  const PRESETS: Record<string, string> = {
    "solo-one-yes": "founder-single-full",
    "solo-one-maybe-later": "founder-single-lite",
    "solo-multiple-yes": "founder-portfolio-full",
    "solo-multiple-maybe-later": "founder-portfolio-lite",
    "agency-one-yes": "agency-boutique-full",
    "agency-one-maybe-later": "agency-boutique-lite",
    "agency-multiple-yes": "agency-multi-full",
    "agency-multiple-maybe-later": "agency-multi-lite",
  };

  const dashboardPreset = PRESETS[key] || "founder-single-lite";

  const fullModules = ["brand-kit", "website", "lead-gen-agent", "business-dashboard"];
  const liteModules = ["brand-kit", "website"];
  const preActivatedModules = intent.needsDashboard === "yes" ? fullModules : liteModules;

  return Response.json({
    ok: true,
    dashboardPreset,
    preActivatedModules,
    integrationRecommendations: (intent.techStack || []).map((tool: string) => ({
      tool,
      action: "connect",
    })),
  });
}
