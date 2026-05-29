import { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ session_id: string }> }
) {
  const { session_id } = await params;

  // Full mock data matching the DashboardData contract
  // TODO: Replace with real brand engine data once builds complete
  return Response.json({
    brand_json: {
      meta: {
        brand_name: "Apex Studio",
        business_type: "Creative Agency",
        industry: "Design & Branding",
      },
      design_tokens: {
        primary: "#F5CE00",
        secondary: "#1A1A2E",
        accent: "#C4941A",
        background: "#0A0A0A",
        text: "#F7F6F0",
        font_heading: "Space Grotesk",
        font_body: "DM Sans",
      },
      copy: {
        tagline: "Where vision meets velocity.",
        cta_primary: "Start Building",
      },
    },
    asset_urls: {
      playbook_pdf: "https://example.com/apex-playbook.pdf",
      logo_svg: "https://example.com/apex-logo.svg",
      logo_dark_svg: "https://example.com/apex-logo-dark.svg",
      landing_page: "https://apexstudio.vercel.app",
    },
    preset: "founder-single-full",
    modules: [
      {
        id: "brand-kit",
        status: "delivered",
        data: null,
      },
      {
        id: "website",
        status: "live",
        data: null,
      },
      {
        id: "lead-gen",
        status: "active",
        data: {
          prospects_scored: 23,
          outreach_sent: 8,
          progress: 0.64,
          next_check_in: "2026-05-26T14:00:00Z",
        },
      },
      {
        id: "entity-setup",
        status: "recommended",
        data: {
          current_status: "sole_prop",
          recommended_entity: "llc",
          estimated_cost: "$199",
        },
      },
      {
        id: "business-dashboard",
        status: "locked",
        data: {
          module_count: 5,
          modules_configured: [],
          last_opened: null,
        },
      },
      {
        id: "domains",
        status: "locked",
        data: {
          suggested_domain: "apexstudio.com",
          available: true,
          price_annual: 12.99,
          alternatives: ["apexstudio.co", "apexstudio.io"],
        },
      },
    ],
    kpis: {
      brand_score: 87,
      assets_ready: 14,
      assets_total: 18,
      leads_surfaced: 23,
      site_status: "live",
    },
    recent_activity: [
      {
        id: "a1",
        icon: "check",
        message: "Brand playbook PDF generated",
        timestamp: "4 min ago",
      },
      {
        id: "a2",
        icon: "world",
        message: "Landing page deployed to Vercel",
        timestamp: "12 min ago",
      },
      {
        id: "a3",
        icon: "target",
        message: "5 new prospects surfaced in Design & Branding",
        timestamp: "1 hour ago",
      },
      {
        id: "a4",
        icon: "check",
        message: "Logo variations (SVG + PNG) exported",
        timestamp: "2 hours ago",
      },
      {
        id: "a5",
        icon: "world",
        message: "DNS configured for apexstudio.com",
        timestamp: "3 hours ago",
      },
      {
        id: "a6",
        icon: "target",
        message: "Lead scoring model trained on industry data",
        timestamp: "Yesterday at 4pm",
      },
      {
        id: "a7",
        icon: "check",
        message: "Color palette finalized from intake responses",
        timestamp: "Yesterday at 2pm",
      },
    ],
    build_progress: 0.78,
    last_activity_label: "Last activity 4 min ago",
  });
}
