/**
 * Tenant model for white-label. One tenant per agency that embeds the
 * platform under their own brand (Vendasta, etc.). The "iei" tenant is the
 * built-in default — unbranded / canonical IEI Ventures look.
 *
 * Resolution order (see middleware.ts):
 *   1. `x-iei-tenant` header (set by middleware from subdomain / custom domain)
 *   2. `?tenant=slug` query param (for previewing themes)
 *   3. fallback to "iei" (default)
 */
import {
  upsertTenant,
  findTenantBySlug,
  findTenantByDomain,
  listTenantRows,
  type TenantRow,
} from "./db";

export type Tenant = {
  id: string;
  slug: string;
  displayName: string;
  logoUrl?: string;
  colors: {
    primary: string;
    accent: string;
    surface?: string;
    surface2?: string;
    border?: string;
    text?: string;
    textMuted?: string;
  };
  customDomain?: string;
};

export const DEFAULT_TENANT_SLUG = "iei";

const DEFAULT_TENANT: Tenant = {
  id: "default",
  slug: DEFAULT_TENANT_SLUG,
  displayName: "IEI Ventures",
  colors: {
    primary:    "#F5CE00",               // Signal Yellow
    accent:     "#C4941A",               // Deep Gold
    surface:    "#0A0A0A",               // Ventures Black
    surface2:   "#181818",               // Carbon
    border:     "rgba(255,255,255,0.09)",
    text:       "#F7F6F0",               // Chalk
    textMuted:  "#898989",               // Ash
  },
};

/** Seed tenants — kept inline for now. Admin UI would manage these. */
const SEED: Tenant[] = [
  DEFAULT_TENANT,
  {
    id: "vendasta",
    slug: "vendasta",
    displayName: "Vendasta",
    colors: { primary: "#0b132b", accent: "#ff6b35" },
  },
  {
    id: "aurelian",
    slug: "aurelian",
    displayName: "Aurelian Labs",
    colors: { primary: "#0f172a", accent: "#B8860B" },
  },
];

// Local dev / DB-less preview: serve tenants from the in-memory SEED so the
// dashboard renders without Supabase credentials. Mirrors auth.ts DEV_BYPASS
// and is hard-disabled in production so real tenant data always comes from the DB.
const DEV_BYPASS =
  process.env.DEV_BYPASS === "true" && process.env.NODE_ENV !== "production";
function seedTenant(slug: string): Tenant | null {
  return SEED.find((t) => t.slug === slug) ?? null;
}

let _seeded = false;
async function ensureSeed(): Promise<void> {
  if (_seeded) return;
  _seeded = true;
  for (const t of SEED) {
    await upsertTenant({
      id: t.id,
      slug: t.slug,
      displayName: t.displayName,
      logoUrl: t.logoUrl,
      colorsJson: JSON.stringify(t.colors),
      customDomain: t.customDomain,
    });
  }
}

function rowToTenant(r: TenantRow): Tenant {
  return {
    id: r.id,
    slug: r.slug,
    displayName: r.display_name,
    logoUrl: r.logo_url ?? undefined,
    colors: JSON.parse(r.colors_json),
    customDomain: r.custom_domain ?? undefined,
  };
}

export async function getTenantBySlug(slug: string): Promise<Tenant | null> {
  if (DEV_BYPASS) return seedTenant(slug);
  await ensureSeed();
  const row = await findTenantBySlug(slug);
  return row ? rowToTenant(row) : null;
}

export async function getTenantByHost(host: string): Promise<Tenant | null> {
  await ensureSeed();
  // Exact custom-domain match first.
  const direct = await findTenantByDomain(host);
  if (direct) return rowToTenant(direct);

  // Subdomain on ieiventures.* or localhost: slug = first label.
  const match = host.match(/^([a-z0-9-]+)\.(ieiventures\.(app|com)|localhost:\d+)$/i);
  if (match) {
    const slug = match[1];
    return getTenantBySlug(slug);
  }
  return null;
}

export async function resolveTenant(slug?: string | null): Promise<Tenant> {
  if (slug) {
    const t = await getTenantBySlug(slug);
    if (t) return t;
  }
  return (await getTenantBySlug(DEFAULT_TENANT_SLUG)) ?? DEFAULT_TENANT;
}

export async function listTenants(): Promise<Tenant[]> {
  await ensureSeed();
  const rows = await listTenantRows();
  return rows.map(rowToTenant);
}
