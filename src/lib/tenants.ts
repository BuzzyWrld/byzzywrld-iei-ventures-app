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
import { db } from "./db";

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

let _initialized = false;

function ensureSchema() {
  if (_initialized) return;
  db().exec(`
    CREATE TABLE IF NOT EXISTS tenants (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      display_name TEXT NOT NULL,
      logo_url TEXT,
      colors_json TEXT NOT NULL,
      custom_domain TEXT
    );
  `);
  // Upsert seed tenants so color changes in code take effect immediately.
  const ups = db().prepare(
    `INSERT INTO tenants (id, slug, display_name, logo_url, colors_json, custom_domain)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       display_name = excluded.display_name,
       colors_json  = excluded.colors_json`
  );
  for (const t of SEED) {
    ups.run(t.id, t.slug, t.displayName, t.logoUrl ?? null, JSON.stringify(t.colors), t.customDomain ?? null);
  }
  _initialized = true;
}

type Row = {
  id: string;
  slug: string;
  display_name: string;
  logo_url: string | null;
  colors_json: string;
  custom_domain: string | null;
};

function rowToTenant(r: Row): Tenant {
  return {
    id: r.id,
    slug: r.slug,
    displayName: r.display_name,
    logoUrl: r.logo_url ?? undefined,
    colors: JSON.parse(r.colors_json),
    customDomain: r.custom_domain ?? undefined,
  };
}

export function getTenantBySlug(slug: string): Tenant | null {
  ensureSchema();
  const row = db().prepare(`SELECT * FROM tenants WHERE slug = ?`).get(slug) as Row | undefined;
  return row ? rowToTenant(row) : null;
}

export function getTenantByHost(host: string): Tenant | null {
  ensureSchema();
  // Exact custom-domain match first.
  const direct = db()
    .prepare(`SELECT * FROM tenants WHERE custom_domain = ?`)
    .get(host) as Row | undefined;
  if (direct) return rowToTenant(direct);

  // Subdomain on ieiventures.* or localhost: slug = first label.
  const match = host.match(/^([a-z0-9-]+)\.(ieiventures\.(app|com)|localhost:\d+)$/i);
  if (match) {
    const slug = match[1];
    return getTenantBySlug(slug);
  }
  return null;
}

export function resolveTenant(slug?: string | null): Tenant {
  if (slug) {
    const t = getTenantBySlug(slug);
    if (t) return t;
  }
  return getTenantBySlug(DEFAULT_TENANT_SLUG) ?? DEFAULT_TENANT;
}

export function listTenants(): Tenant[] {
  ensureSchema();
  const rows = db().prepare(`SELECT * FROM tenants ORDER BY slug`).all() as Row[];
  return rows.map(rowToTenant);
}
