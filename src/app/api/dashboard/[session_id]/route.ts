import { NextRequest } from "next/server";
import { currentUser } from "@/lib/auth";
import { currentTenant } from "@/lib/current-tenant";
import { listBrands } from "@/lib/db";
import type { BrandProject, BrandJson } from "@/lib/types";

export const dynamic = "force-dynamic";

// IEI app default tokens. Used ONLY for the empty state and as fallbacks for
// fields a real brand hasn't produced yet — never as a stand-in brand.
const DEFAULT_TOKENS = {
  primary: "#F5CE00",
  secondary: "#1A1A2E",
  accent: "#C4941A",
  background: "#0A0A0A",
  text: "#F7F6F0",
  font_heading: "Space Grotesk",
  font_body: "DM Sans",
};

function safeBrandJson(raw?: string): Partial<BrandJson> {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as BrandJson;
  } catch {
    return {};
  }
}

/** Clean empty state — a real, well-formed payload for a user with no brands.
 *  Not an error, not the Apex mock. */
function emptyState() {
  return {
    has_brand: false,
    brand_json: {
      meta: { brand_name: "", business_type: "", industry: "" },
      design_tokens: DEFAULT_TOKENS,
      copy: { tagline: "", cta_primary: "Start your brand" },
    },
    asset_urls: {},
    preset: "founder-single-full",
    modules: [
      { id: "brand-kit", status: "locked", data: null },
      { id: "website", status: "locked", data: null },
      { id: "lead-gen", status: "locked", data: null },
      { id: "entity-setup", status: "locked", data: null },
    ],
    kpis: {
      brand_score: 0,
      assets_ready: 0,
      assets_total: 0,
      leads_surfaced: 0,
      site_status: "offline",
    },
    recent_activity: [],
    build_progress: 0,
    last_activity_label: "No brand yet",
  };
}

function mapBrand(brand: BrandProject) {
  const bj = safeBrandJson(brand.outputs.brandJson);
  const o = brand.outputs;
  const colors = bj.colors ?? ({} as Partial<BrandJson["colors"]>);
  const typo = bj.typography ?? ({} as Partial<BrandJson["typography"]>);

  const landing = o.landingLiveUrl ?? o.landingVariants?.[0]?.url;
  const assetEntries = [
    o.playbookPdf,
    o.logoSvg,
    landing,
    o.pitchOnePager?.pdfUrl,
    ...(o.socialKit ?? []).map((s) => s.url),
  ];
  const assetsReady = assetEntries.filter(Boolean).length;
  const assetsTotal = Math.max(assetsReady, 6);

  return {
    has_brand: true,
    brand_json: {
      meta: {
        brand_name: bj.name || brand.intake.companyName || "Untitled Brand",
        business_type: brand.intake.archetype || "",
        industry: brand.intake.industry || "",
      },
      design_tokens: {
        primary: colors.primary || DEFAULT_TOKENS.primary,
        secondary: colors.secondary || DEFAULT_TOKENS.secondary,
        accent: colors.accent || DEFAULT_TOKENS.accent,
        background: DEFAULT_TOKENS.background,
        text: DEFAULT_TOKENS.text,
        font_heading: typo.heading || DEFAULT_TOKENS.font_heading,
        font_body: typo.body || DEFAULT_TOKENS.font_body,
      },
      copy: {
        tagline: bj.tagline || brand.intake.tagline || "",
        cta_primary: "Get Started",
      },
    },
    asset_urls: {
      playbook_pdf: o.playbookPdf,
      logo_svg: o.logoSvg,
      logo_dark_svg: o.logoSvg,
      landing_page: landing,
    },
    preset: "founder-single-full",
    modules: [
      {
        id: "brand-kit",
        status: bj.name || assetsReady > 0
          ? "delivered"
          : brand.status === "running"
            ? "active"
            : "recommended",
        data: null,
      },
      { id: "website", status: landing ? "live" : "recommended", data: null },
      { id: "lead-gen", status: "recommended", data: null },
      { id: "entity-setup", status: "recommended", data: null },
    ],
    kpis: {
      brand_score: assetsTotal ? Math.round((assetsReady / assetsTotal) * 100) : 0,
      assets_ready: assetsReady,
      assets_total: assetsTotal,
      leads_surfaced: 0,
      site_status: landing ? "live" : "offline",
    },
    recent_activity: [
      {
        id: brand.id,
        icon: brand.status === "complete" ? "check" : "world",
        message:
          brand.status === "complete"
            ? `Brand "${bj.name || brand.intake.companyName}" build complete`
            : `Brand "${bj.name || brand.intake.companyName}" is building`,
        timestamp: new Date(brand.createdAt).toLocaleString(),
      },
    ],
    build_progress:
      brand.status === "complete" ? 1 : brand.progressPct ?? 0,
    last_activity_label:
      brand.progressStage ||
      (brand.status === "complete" ? "Build complete" : "Building…"),
  };
}

// NOTE: session_id in the path is legacy and intentionally ignored — the
// response is scoped to the authenticated user (session cookie), never the URL.
export async function GET(
  _request: NextRequest,
  _ctx: { params: Promise<{ session_id: string }> }
) {
  const [tenant, user] = await Promise.all([currentTenant(), currentUser()]);
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });

  const brands = await listBrands({ tenantId: tenant.id, userId: user.id });
  if (brands.length === 0) return Response.json(emptyState());

  // Prefer the latest completed brand; otherwise the most recent one.
  const latest =
    brands.find((b) => b.status === "complete") ?? brands[0];
  return Response.json(mapBrand(latest));
}
