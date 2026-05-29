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

  const name = bj.name || brand.intake.companyName || "Untitled Brand";
  const landing = o.landingLiveUrl ?? o.landingVariants?.[0]?.url;

  // Canonical deliverable checklist — drives assets KPIs, brand_score, and the
  // activity feed from the brand's ACTUAL outputs (no invented numbers).
  type ActivityIcon = "check" | "world" | "target" | "alert";
  const deliverables: { key: string; label: string; present: boolean; icon: ActivityIcon }[] = [
    { key: "logo", label: "Logo", present: !!o.logoSvg, icon: "check" },
    { key: "playbook", label: "Brand playbook", present: !!(o.playbookPdf || o.playbookHtml), icon: "check" },
    { key: "landing", label: "Landing page", present: !!landing, icon: "world" },
    { key: "palette", label: "Palette expansion", present: !!o.paletteExpansion, icon: "check" },
    { key: "social", label: "Social kit", present: !!o.socialKit?.length, icon: "check" },
    { key: "pitch", label: "Pitch one-pager", present: !!o.pitchOnePager, icon: "check" },
    { key: "email", label: "Email kit", present: !!o.emailKit, icon: "check" },
    { key: "devbrief", label: "Developer brief", present: !!o.devBrief, icon: "check" },
  ];
  const assetsTotal = deliverables.length;
  const assetsReady = deliverables.filter((d) => d.present).length;

  const siteStatus: "live" | "deploying" | "offline" = o.landingLiveUrl
    ? "live"
    : o.landingVariants?.length
      ? "deploying"
      : "offline";

  // Real activity feed: build lifecycle + each delivered asset. Timestamped to
  // the brand's createdAt (the only timestamp the record carries).
  const ts = new Date(brand.createdAt).toLocaleString();
  const activity: { id: string; icon: ActivityIcon; message: string; timestamp: string }[] = [];
  if (brand.status === "failed") {
    activity.push({ id: `${brand.id}-err`, icon: "alert", message: brand.error ? `Build failed: ${brand.error}` : "Build failed", timestamp: ts });
  } else if (brand.status === "running") {
    activity.push({ id: `${brand.id}-build`, icon: "world", message: brand.progressStage ? `Building: ${brand.progressStage}` : "Build in progress", timestamp: ts });
  } else if (brand.status === "complete") {
    activity.push({ id: `${brand.id}-done`, icon: "check", message: `Brand "${name}" build complete`, timestamp: ts });
  }
  for (const d of deliverables.filter((x) => x.present)) {
    activity.push({ id: `${brand.id}-${d.key}`, icon: d.icon, message: `${d.label} ready`, timestamp: ts });
  }
  activity.push({ id: `${brand.id}-created`, icon: "check", message: `Brand "${name}" created`, timestamp: ts });

  return {
    has_brand: true,
    brand_json: {
      meta: {
        brand_name: name,
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
      // No lead-gen pipeline yet — there is no leads source on the brand record,
      // so this stays 0 rather than showing an invented number.
      leads_surfaced: 0,
      site_status: siteStatus,
    },
    recent_activity: activity.slice(0, 8),
    build_progress: brand.status === "complete" ? 1 : brand.progressPct ?? 0,
    last_activity_label:
      brand.status === "failed"
        ? "Build failed"
        : brand.status === "running"
          ? brand.progressStage || "Building…"
          : brand.status === "complete"
            ? "Build complete"
            : "Ready",
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
