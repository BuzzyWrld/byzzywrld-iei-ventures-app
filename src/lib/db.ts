import { neon } from "@neondatabase/serverless";
import type { BrandProject } from "./types";
import type { ContentRun, ContentRunStatus, ContentRunOutputs } from "./skills/content-engine-contract";

// ─── Connection ─────────────────────────────────────────────────────────────

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL env var is required (Neon Postgres connection string)");
}

const sql = neon(DATABASE_URL);

// ─── Schema bootstrap (idempotent) ──────────────────────────────────────────

const _g = globalThis as { __iei_pg_ready?: Promise<void> };

function ensureSchema(): Promise<void> {
  if (_g.__iei_pg_ready) return _g.__iei_pg_ready;
  _g.__iei_pg_ready = (async () => {
    await sql`
      CREATE TABLE IF NOT EXISTS brands (
        id TEXT PRIMARY KEY,
        created_at TEXT NOT NULL,
        status TEXT NOT NULL,
        intake_json TEXT NOT NULL,
        outputs_json TEXT NOT NULL DEFAULT '{}',
        error TEXT,
        progress_stage TEXT,
        progress_pct DOUBLE PRECISION,
        tenant_id TEXT NOT NULL DEFAULT 'default',
        user_id TEXT
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS content_runs (
        id TEXT PRIMARY KEY,
        created_at TEXT NOT NULL,
        status TEXT NOT NULL,
        intake_json TEXT NOT NULL,
        outputs_json TEXT NOT NULL DEFAULT '{}',
        error TEXT,
        progress_stage TEXT,
        progress_pct DOUBLE PRECISION,
        tenant_id TEXT NOT NULL DEFAULT 'default',
        user_id TEXT
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        tenant_id TEXT NOT NULL DEFAULT 'default',
        created_at TEXT NOT NULL
      )
    `;
    // OAuth columns — idempotent migrations for existing tables
    await sql`ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL`.catch(() => {});
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS oauth_provider TEXT`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS oauth_provider_account_id TEXT`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS image TEXT`;
    await sql`
      CREATE TABLE IF NOT EXISTS tenants (
        id TEXT PRIMARY KEY,
        slug TEXT UNIQUE NOT NULL,
        display_name TEXT NOT NULL,
        logo_url TEXT,
        colors_json TEXT NOT NULL,
        custom_domain TEXT
      )
    `;
  })();
  return _g.__iei_pg_ready;
}

// ─── Brands ─────────────────────────────────────────────────────────────────

type Row = {
  id: string;
  created_at: string;
  status: BrandProject["status"];
  intake_json: string;
  outputs_json: string;
  error: string | null;
  progress_stage: string | null;
  progress_pct: number | null;
  tenant_id: string | null;
  user_id: string | null;
};

const rowToProject = (r: Row): BrandProject => ({
  id: r.id,
  createdAt: r.created_at,
  status: r.status,
  intake: JSON.parse(r.intake_json),
  outputs: JSON.parse(r.outputs_json || "{}"),
  error: r.error ?? undefined,
  progressStage: r.progress_stage ?? undefined,
  progressPct: r.progress_pct ?? undefined,
  tenantId: r.tenant_id ?? "default",
  userId: r.user_id ?? undefined,
});

export async function createBrand(p: BrandProject): Promise<void> {
  await ensureSchema();
  await sql`
    INSERT INTO brands (id, created_at, status, intake_json, outputs_json, error, progress_stage, progress_pct, tenant_id, user_id)
    VALUES (${p.id}, ${p.createdAt}, ${p.status}, ${JSON.stringify(p.intake)}, ${JSON.stringify(p.outputs)}, ${p.error ?? null}, ${p.progressStage ?? null}, ${p.progressPct ?? null}, ${p.tenantId}, ${p.userId ?? null})
  `;
}

export async function updateBrand(id: string, patch: Partial<BrandProject>): Promise<void> {
  await ensureSchema();
  const current = await getBrand(id);
  if (!current) throw new Error(`brand ${id} not found`);
  const next = { ...current, ...patch };
  await sql`
    UPDATE brands
    SET status = ${next.status}, outputs_json = ${JSON.stringify(next.outputs)}, error = ${next.error ?? null}, progress_stage = ${next.progressStage ?? null}, progress_pct = ${next.progressPct ?? null}
    WHERE id = ${id}
  `;
}

export async function getBrand(id: string): Promise<BrandProject | null> {
  await ensureSchema();
  const rows = await sql`SELECT * FROM brands WHERE id = ${id}`;
  return rows.length ? rowToProject(rows[0] as Row) : null;
}

export async function deleteBrand(id: string): Promise<void> {
  await ensureSchema();
  await sql`DELETE FROM brands WHERE id = ${id}`;
}

export async function listBrands(opts?: { tenantId?: string; userId?: string }): Promise<BrandProject[]> {
  await ensureSchema();
  let rows;
  if (opts?.tenantId && opts?.userId) {
    rows = await sql`SELECT * FROM brands WHERE tenant_id = ${opts.tenantId} AND user_id = ${opts.userId} ORDER BY created_at DESC`;
  } else if (opts?.tenantId) {
    rows = await sql`SELECT * FROM brands WHERE tenant_id = ${opts.tenantId} ORDER BY created_at DESC`;
  } else if (opts?.userId) {
    rows = await sql`SELECT * FROM brands WHERE user_id = ${opts.userId} ORDER BY created_at DESC`;
  } else {
    rows = await sql`SELECT * FROM brands ORDER BY created_at DESC`;
  }
  return (rows as Row[]).map(rowToProject);
}

// ─── ContentRun CRUD ────────────────────────────────────────────────────────

type ContentRunRow = {
  id: string;
  created_at: string;
  status: ContentRunStatus;
  intake_json: string;
  outputs_json: string;
  error: string | null;
  progress_stage: string | null;
  progress_pct: number | null;
  tenant_id: string | null;
  user_id: string | null;
};

const rowToRun = (r: ContentRunRow): ContentRun => ({
  id: r.id,
  createdAt: r.created_at,
  status: r.status,
  intake: JSON.parse(r.intake_json),
  outputs: JSON.parse(r.outputs_json || "{}") as ContentRunOutputs,
  error: r.error ?? undefined,
  progressStage: r.progress_stage ?? undefined,
  progressPct: r.progress_pct ?? undefined,
  tenantId: r.tenant_id ?? "default",
  userId: r.user_id ?? undefined,
});

export async function createContentRun(run: ContentRun): Promise<void> {
  await ensureSchema();
  await sql`
    INSERT INTO content_runs (id, created_at, status, intake_json, outputs_json, error, progress_stage, progress_pct, tenant_id, user_id)
    VALUES (${run.id}, ${run.createdAt}, ${run.status}, ${JSON.stringify(run.intake)}, ${JSON.stringify(run.outputs)}, ${run.error ?? null}, ${run.progressStage ?? null}, ${run.progressPct ?? null}, ${run.tenantId}, ${run.userId ?? null})
  `;
}

export async function upsertContentRun(run: ContentRun): Promise<void> {
  await ensureSchema();
  await sql`
    INSERT INTO content_runs (id, created_at, status, intake_json, outputs_json, error, progress_stage, progress_pct, tenant_id, user_id)
    VALUES (${run.id}, ${run.createdAt}, ${run.status}, ${JSON.stringify(run.intake)}, ${JSON.stringify(run.outputs)}, ${run.error ?? null}, ${run.progressStage ?? null}, ${run.progressPct ?? null}, ${run.tenantId}, ${run.userId ?? null})
    ON CONFLICT (id) DO UPDATE SET
      status = EXCLUDED.status,
      intake_json = EXCLUDED.intake_json,
      outputs_json = EXCLUDED.outputs_json,
      error = EXCLUDED.error,
      progress_stage = EXCLUDED.progress_stage,
      progress_pct = EXCLUDED.progress_pct,
      tenant_id = EXCLUDED.tenant_id,
      user_id = EXCLUDED.user_id
  `;
}

export async function updateContentRun(id: string, patch: Partial<ContentRun>): Promise<void> {
  await ensureSchema();
  const current = await getContentRun(id);
  if (!current) throw new Error(`content run ${id} not found`);
  const next = { ...current, ...patch };
  await sql`
    UPDATE content_runs
    SET status = ${next.status}, outputs_json = ${JSON.stringify(next.outputs)}, error = ${next.error ?? null}, progress_stage = ${next.progressStage ?? null}, progress_pct = ${next.progressPct ?? null}
    WHERE id = ${id}
  `;
}

export async function getContentRun(id: string): Promise<ContentRun | null> {
  await ensureSchema();
  const rows = await sql`SELECT * FROM content_runs WHERE id = ${id}`;
  return rows.length ? rowToRun(rows[0] as ContentRunRow) : null;
}

export async function listContentRuns(opts?: { tenantId?: string; userId?: string }): Promise<ContentRun[]> {
  await ensureSchema();
  let rows;
  if (opts?.tenantId && opts?.userId) {
    rows = await sql`SELECT * FROM content_runs WHERE tenant_id = ${opts.tenantId} AND user_id = ${opts.userId} ORDER BY created_at DESC`;
  } else if (opts?.tenantId) {
    rows = await sql`SELECT * FROM content_runs WHERE tenant_id = ${opts.tenantId} ORDER BY created_at DESC`;
  } else if (opts?.userId) {
    rows = await sql`SELECT * FROM content_runs WHERE user_id = ${opts.userId} ORDER BY created_at DESC`;
  } else {
    rows = await sql`SELECT * FROM content_runs ORDER BY created_at DESC`;
  }
  return (rows as ContentRunRow[]).map(rowToRun);
}

// ─── Users (auth) ───────────────────────────────────────────────────────────

export type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  tenant_id: string;
  created_at: string;
};

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  await ensureSchema();
  const rows = await sql`SELECT * FROM users WHERE email = ${email}`;
  return rows.length ? (rows[0] as UserRow) : null;
}

export async function findUserById(id: string): Promise<UserRow | null> {
  await ensureSchema();
  const rows = await sql`SELECT * FROM users WHERE id = ${id}`;
  return rows.length ? (rows[0] as UserRow) : null;
}

export async function createUser(user: { id: string; email: string; passwordHash: string; name: string; tenantId: string; createdAt: string }): Promise<void> {
  await ensureSchema();
  await sql`
    INSERT INTO users (id, email, password_hash, name, tenant_id, created_at)
    VALUES (${user.id}, ${user.email}, ${user.passwordHash}, ${user.name}, ${user.tenantId}, ${user.createdAt})
  `;
}

export async function upsertOAuthUser(input: {
  email: string;
  name: string | null;
  image: string | null;
  provider: string;
  providerAccountId: string | null;
}): Promise<UserRow> {
  await ensureSchema();
  const rows = await sql`
    INSERT INTO users (id, email, password_hash, name, tenant_id, created_at, oauth_provider, oauth_provider_account_id, image)
    VALUES (${crypto.randomUUID()}, ${input.email}, ${null}, ${input.name ?? "User"}, ${"default"}, ${new Date().toISOString()}, ${input.provider}, ${input.providerAccountId}, ${input.image})
    ON CONFLICT (email) DO UPDATE SET
      oauth_provider = EXCLUDED.oauth_provider,
      oauth_provider_account_id = EXCLUDED.oauth_provider_account_id,
      name = COALESCE(users.name, EXCLUDED.name),
      image = COALESCE(users.image, EXCLUDED.image)
    RETURNING *
  `;
  return rows[0] as UserRow;
}

// ─── Tenants ────────────────────────────────────────────────────────────────

export type TenantRow = {
  id: string;
  slug: string;
  display_name: string;
  logo_url: string | null;
  colors_json: string;
  custom_domain: string | null;
};

export async function upsertTenant(t: { id: string; slug: string; displayName: string; logoUrl?: string; colorsJson: string; customDomain?: string }): Promise<void> {
  await ensureSchema();
  await sql`
    INSERT INTO tenants (id, slug, display_name, logo_url, colors_json, custom_domain)
    VALUES (${t.id}, ${t.slug}, ${t.displayName}, ${t.logoUrl ?? null}, ${t.colorsJson}, ${t.customDomain ?? null})
    ON CONFLICT (id) DO UPDATE SET
      display_name = EXCLUDED.display_name,
      colors_json = EXCLUDED.colors_json
  `;
}

export async function findTenantBySlug(slug: string): Promise<TenantRow | null> {
  await ensureSchema();
  const rows = await sql`SELECT * FROM tenants WHERE slug = ${slug}`;
  return rows.length ? (rows[0] as TenantRow) : null;
}

export async function findTenantByDomain(domain: string): Promise<TenantRow | null> {
  await ensureSchema();
  const rows = await sql`SELECT * FROM tenants WHERE custom_domain = ${domain}`;
  return rows.length ? (rows[0] as TenantRow) : null;
}

export async function listTenantRows(): Promise<TenantRow[]> {
  await ensureSchema();
  const rows = await sql`SELECT * FROM tenants ORDER BY slug`;
  return rows as TenantRow[];
}
