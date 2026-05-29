import { supabase } from "./supabase";
import type { BrandProject } from "./types";
import type { ContentRun, ContentRunStatus, ContentRunOutputs } from "./skills/content-engine-contract";

// ─── Schema bootstrap (idempotent) ──────────────────────────────────────────

const _g = globalThis as { __iei_pg_ready?: Promise<void> };

function ensureSchema(): Promise<void> {
  if (_g.__iei_pg_ready) return _g.__iei_pg_ready;
  _g.__iei_pg_ready = (async () => {
    // Using Supabase's rpc to run raw SQL for table creation
    await supabase.rpc("exec_sql", {
      query: `
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
        );
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
        );
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT,
          name TEXT NOT NULL,
          tenant_id TEXT NOT NULL DEFAULT 'default',
          created_at TEXT NOT NULL,
          oauth_provider TEXT,
          oauth_provider_account_id TEXT,
          image TEXT
        );
        CREATE TABLE IF NOT EXISTS tenants (
          id TEXT PRIMARY KEY,
          slug TEXT UNIQUE NOT NULL,
          display_name TEXT NOT NULL,
          logo_url TEXT,
          colors_json TEXT NOT NULL,
          custom_domain TEXT
        );
      `,
    }).then(({ error }) => {
      // exec_sql RPC may not exist yet; fall back to direct table operations
      if (error) {
        console.warn("[db] exec_sql RPC not available, tables must exist in Supabase dashboard");
      }
    });
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
  const { error } = await supabase.from("brands").insert({
    id: p.id,
    created_at: p.createdAt,
    status: p.status,
    intake_json: JSON.stringify(p.intake),
    outputs_json: JSON.stringify(p.outputs),
    error: p.error ?? null,
    progress_stage: p.progressStage ?? null,
    progress_pct: p.progressPct ?? null,
    tenant_id: p.tenantId,
    user_id: p.userId ?? null,
  });
  if (error) throw new Error(`createBrand failed: ${error.message}`);
}

export async function updateBrand(id: string, patch: Partial<BrandProject>): Promise<void> {
  await ensureSchema();
  const current = await getBrand(id);
  if (!current) throw new Error(`brand ${id} not found`);
  const next = { ...current, ...patch };
  const { error } = await supabase
    .from("brands")
    .update({
      status: next.status,
      outputs_json: JSON.stringify(next.outputs),
      error: next.error ?? null,
      progress_stage: next.progressStage ?? null,
      progress_pct: next.progressPct ?? null,
    })
    .eq("id", id);
  if (error) throw new Error(`updateBrand failed: ${error.message}`);
}

export async function getBrand(id: string): Promise<BrandProject | null> {
  await ensureSchema();
  const { data, error } = await supabase.from("brands").select("*").eq("id", id).single();
  if (error && error.code === "PGRST116") return null; // not found
  if (error) throw new Error(`getBrand failed: ${error.message}`);
  return data ? rowToProject(data as Row) : null;
}

export async function deleteBrand(id: string): Promise<void> {
  await ensureSchema();
  const { error } = await supabase.from("brands").delete().eq("id", id);
  if (error) throw new Error(`deleteBrand failed: ${error.message}`);
}

export async function listBrands(opts?: { tenantId?: string; userId?: string }): Promise<BrandProject[]> {
  await ensureSchema();
  let query = supabase.from("brands").select("*").order("created_at", { ascending: false });
  if (opts?.tenantId) query = query.eq("tenant_id", opts.tenantId);
  if (opts?.userId) query = query.eq("user_id", opts.userId);
  const { data, error } = await query;
  if (error) throw new Error(`listBrands failed: ${error.message}`);
  return (data as Row[]).map(rowToProject);
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
  const { error } = await supabase.from("content_runs").insert({
    id: run.id,
    created_at: run.createdAt,
    status: run.status,
    intake_json: JSON.stringify(run.intake),
    outputs_json: JSON.stringify(run.outputs),
    error: run.error ?? null,
    progress_stage: run.progressStage ?? null,
    progress_pct: run.progressPct ?? null,
    tenant_id: run.tenantId,
    user_id: run.userId ?? null,
  });
  if (error) throw new Error(`createContentRun failed: ${error.message}`);
}

export async function upsertContentRun(run: ContentRun): Promise<void> {
  await ensureSchema();
  const { error } = await supabase.from("content_runs").upsert(
    {
      id: run.id,
      created_at: run.createdAt,
      status: run.status,
      intake_json: JSON.stringify(run.intake),
      outputs_json: JSON.stringify(run.outputs),
      error: run.error ?? null,
      progress_stage: run.progressStage ?? null,
      progress_pct: run.progressPct ?? null,
      tenant_id: run.tenantId,
      user_id: run.userId ?? null,
    },
    { onConflict: "id" }
  );
  if (error) throw new Error(`upsertContentRun failed: ${error.message}`);
}

export async function updateContentRun(id: string, patch: Partial<ContentRun>): Promise<void> {
  await ensureSchema();
  const current = await getContentRun(id);
  if (!current) throw new Error(`content run ${id} not found`);
  const next = { ...current, ...patch };
  const { error } = await supabase
    .from("content_runs")
    .update({
      status: next.status,
      outputs_json: JSON.stringify(next.outputs),
      error: next.error ?? null,
      progress_stage: next.progressStage ?? null,
      progress_pct: next.progressPct ?? null,
    })
    .eq("id", id);
  if (error) throw new Error(`updateContentRun failed: ${error.message}`);
}

export async function getContentRun(id: string): Promise<ContentRun | null> {
  await ensureSchema();
  const { data, error } = await supabase.from("content_runs").select("*").eq("id", id).single();
  if (error && error.code === "PGRST116") return null;
  if (error) throw new Error(`getContentRun failed: ${error.message}`);
  return data ? rowToRun(data as ContentRunRow) : null;
}

export async function listContentRuns(opts?: { tenantId?: string; userId?: string }): Promise<ContentRun[]> {
  await ensureSchema();
  let query = supabase.from("content_runs").select("*").order("created_at", { ascending: false });
  if (opts?.tenantId) query = query.eq("tenant_id", opts.tenantId);
  if (opts?.userId) query = query.eq("user_id", opts.userId);
  const { data, error } = await query;
  if (error) throw new Error(`listContentRuns failed: ${error.message}`);
  return (data as ContentRunRow[]).map(rowToRun);
}

// ─── Users (auth) ───────────────────────────────────────────────────────────

export type UserRow = {
  id: string;
  email: string;
  /** Null for accounts created purely via OAuth (no password set). */
  password_hash: string | null;
  name: string;
  tenant_id: string;
  created_at: string;
  oauth_provider?: string | null;
  oauth_provider_account_id?: string | null;
  image?: string | null;
};

/** Thrown when an OAuth sign-in matches an existing account by email but the
 *  OAuth identity (provider + account id) is NOT already linked to it. Callers
 *  must NOT auto-link — that would allow OAuth account takeover. */
export const ACCOUNT_EXISTS_DIFFERENT_METHOD = "ACCOUNT_EXISTS_DIFFERENT_METHOD";

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  await ensureSchema();
  const { data, error } = await supabase.from("users").select("*").eq("email", email).single();
  if (error && error.code === "PGRST116") return null;
  if (error) throw new Error(`findUserByEmail failed: ${error.message}`);
  return data as UserRow | null;
}

export async function findUserById(id: string): Promise<UserRow | null> {
  await ensureSchema();
  const { data, error } = await supabase.from("users").select("*").eq("id", id).single();
  if (error && error.code === "PGRST116") return null;
  if (error) throw new Error(`findUserById failed: ${error.message}`);
  return data as UserRow | null;
}

export async function createUser(user: { id: string; email: string; passwordHash: string; name: string; tenantId: string; createdAt: string }): Promise<void> {
  await ensureSchema();
  const { error } = await supabase.from("users").insert({
    id: user.id,
    email: user.email,
    password_hash: user.passwordHash,
    name: user.name,
    tenant_id: user.tenantId,
    created_at: user.createdAt,
  });
  if (error) throw new Error(`createUser failed: ${error.message}`);
}

export async function upsertOAuthUser(input: {
  email: string;
  name: string | null;
  image: string | null;
  provider: string;
  providerAccountId: string | null;
}): Promise<UserRow> {
  await ensureSchema();

  // Check if user exists
  const { data: existing } = await supabase.from("users").select("*").eq("email", input.email).single();

  if (existing) {
    // SECURITY: only treat this as the SAME account when the stored OAuth
    // identity exactly matches the incoming one. An email match alone is NOT
    // sufficient — otherwise anyone who can present an OAuth login for an
    // address could hijack a password (or other-provider) account.
    const sameIdentity =
      existing.oauth_provider === input.provider &&
      existing.oauth_provider_account_id != null &&
      existing.oauth_provider_account_id === input.providerAccountId;

    if (!sameIdentity) {
      throw new Error(ACCOUNT_EXISTS_DIFFERENT_METHOD);
    }

    // Same returning OAuth identity — refresh display fields only, never relink.
    const { data, error } = await supabase
      .from("users")
      .update({
        name: existing.name || input.name || "User",
        image: existing.image || input.image,
      })
      .eq("id", existing.id)
      .select("*")
      .single();
    if (error) throw new Error(`upsertOAuthUser update failed: ${error.message}`);
    return data as UserRow;
  }

  // Insert new user
  const { data, error } = await supabase
    .from("users")
    .insert({
      id: crypto.randomUUID(),
      email: input.email,
      password_hash: null,
      name: input.name ?? "User",
      tenant_id: "default",
      created_at: new Date().toISOString(),
      oauth_provider: input.provider,
      oauth_provider_account_id: input.providerAccountId,
      image: input.image,
    })
    .select("*")
    .single();
  if (error) throw new Error(`upsertOAuthUser insert failed: ${error.message}`);
  return data as UserRow;
}

/**
 * Link an OAuth identity to an ALREADY-AUTHENTICATED user (proven via their
 * existing session). Safe counterpart to the refusal in upsertOAuthUser:
 * the caller must have verified that `userId` owns the session AND that the
 * session email matches the OAuth email. Refuses if the OAuth identity is
 * already attached to a different account.
 */
export async function linkOAuthIdentity(input: {
  userId: string;
  provider: string;
  providerAccountId: string;
  image: string | null;
}): Promise<UserRow> {
  await ensureSchema();

  const { data: clash } = await supabase
    .from("users")
    .select("id")
    .eq("oauth_provider", input.provider)
    .eq("oauth_provider_account_id", input.providerAccountId)
    .single();
  if (clash && (clash as { id: string }).id !== input.userId) {
    throw new Error("OAUTH_IDENTITY_ALREADY_LINKED");
  }

  const { data, error } = await supabase
    .from("users")
    .update({
      oauth_provider: input.provider,
      oauth_provider_account_id: input.providerAccountId,
      image: input.image ?? undefined,
    })
    .eq("id", input.userId)
    .select("*")
    .single();
  if (error) throw new Error(`linkOAuthIdentity failed: ${error.message}`);
  return data as UserRow;
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
  const { error } = await supabase.from("tenants").upsert(
    {
      id: t.id,
      slug: t.slug,
      display_name: t.displayName,
      logo_url: t.logoUrl ?? null,
      colors_json: t.colorsJson,
      custom_domain: t.customDomain ?? null,
    },
    { onConflict: "id" }
  );
  if (error) throw new Error(`upsertTenant failed: ${error.message}`);
}

export async function findTenantBySlug(slug: string): Promise<TenantRow | null> {
  await ensureSchema();
  const { data, error } = await supabase.from("tenants").select("*").eq("slug", slug).single();
  if (error && error.code === "PGRST116") return null;
  if (error) throw new Error(`findTenantBySlug failed: ${error.message}`);
  return data as TenantRow | null;
}

export async function findTenantByDomain(domain: string): Promise<TenantRow | null> {
  await ensureSchema();
  const { data, error } = await supabase.from("tenants").select("*").eq("custom_domain", domain).single();
  if (error && error.code === "PGRST116") return null;
  if (error) throw new Error(`findTenantByDomain failed: ${error.message}`);
  return data as TenantRow | null;
}

export async function listTenantRows(): Promise<TenantRow[]> {
  await ensureSchema();
  const { data, error } = await supabase.from("tenants").select("*").order("slug");
  if (error) throw new Error(`listTenantRows failed: ${error.message}`);
  return data as TenantRow[];
}
