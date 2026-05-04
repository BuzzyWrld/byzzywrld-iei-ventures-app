import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import type { BrandProject } from "./types";

// On Vercel, process.cwd() is read-only. Use /tmp so SQLite can write.
const DATA_DIR = process.env.VERCEL
  ? "/tmp/iei-data"
  : path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = path.join(DATA_DIR, "iei.db");

// Cache the DB instance on globalThis so Next dev-mode HMR doesn't open a
// new connection every time db.ts gets re-evaluated. In a real process
// restart globalThis is fresh; during hot reload it persists.
const _g = globalThis as { __iei_db?: Database.Database };

export function db(): Database.Database {
  if (_g.__iei_db) return _g.__iei_db;
  const _db = new Database(DB_PATH);
  _g.__iei_db = _db;
  _db.pragma("journal_mode = WAL");
  _db.exec(`
    CREATE TABLE IF NOT EXISTS brands (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      status TEXT NOT NULL,
      intake_json TEXT NOT NULL,
      outputs_json TEXT NOT NULL DEFAULT '{}',
      error TEXT,
      progress_stage TEXT,
      progress_pct REAL
    );
  `);
  // Idempotent migrations for columns added after initial schema.
  const cols = (_db.prepare(`PRAGMA table_info(brands)`).all() as { name: string }[]).map(
    (c) => c.name
  );
  if (!cols.includes("progress_stage")) {
    _db.exec(`ALTER TABLE brands ADD COLUMN progress_stage TEXT`);
  }
  if (!cols.includes("progress_pct")) {
    _db.exec(`ALTER TABLE brands ADD COLUMN progress_pct REAL`);
  }
  if (!cols.includes("tenant_id")) {
    _db.exec(`ALTER TABLE brands ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default'`);
  }
  if (!cols.includes("user_id")) {
    _db.exec(`ALTER TABLE brands ADD COLUMN user_id TEXT`);
  }
  // Mark orphaned 'running' jobs (from a previous crashed process) as failed.
  //
  // IMPORTANT: this must run ONCE per actual Node.js process, not once per
  // module evaluation. Next.js dev-mode HMR re-evaluates server modules when
  // source changes, which would otherwise re-run this cleanup and clobber
  // any brand currently mid-build. Storing the flag on globalThis survives
  // module reload but resets on real process restart — exactly what we want.
  const g = globalThis as { __iei_cleanup_done?: boolean };
  if (!g.__iei_cleanup_done) {
    g.__iei_cleanup_done = true;
    _db.prepare(
      `UPDATE brands SET status = 'failed', error = 'server restarted while job was running' WHERE status = 'running'`
    ).run();
  }
  return _db;
}

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

export function createBrand(p: BrandProject): void {
  db()
    .prepare(
      `INSERT INTO brands (id, created_at, status, intake_json, outputs_json, error, progress_stage, progress_pct, tenant_id, user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      p.id,
      p.createdAt,
      p.status,
      JSON.stringify(p.intake),
      JSON.stringify(p.outputs),
      p.error ?? null,
      p.progressStage ?? null,
      p.progressPct ?? null,
      p.tenantId,
      p.userId ?? null
    );
}

export function updateBrand(id: string, patch: Partial<BrandProject>): void {
  const current = getBrand(id);
  if (!current) throw new Error(`brand ${id} not found`);
  const next = { ...current, ...patch };
  db()
    .prepare(
      `UPDATE brands
       SET status = ?, outputs_json = ?, error = ?, progress_stage = ?, progress_pct = ?
       WHERE id = ?`
    )
    .run(
      next.status,
      JSON.stringify(next.outputs),
      next.error ?? null,
      next.progressStage ?? null,
      next.progressPct ?? null,
      id
    );
}

export function getBrand(id: string): BrandProject | null {
  const row = db().prepare(`SELECT * FROM brands WHERE id = ?`).get(id) as
    | Row
    | undefined;
  return row ? rowToProject(row) : null;
}

export function deleteBrand(id: string): void {
  db().prepare(`DELETE FROM brands WHERE id = ?`).run(id);
}

export function listBrands(opts?: { tenantId?: string; userId?: string }): BrandProject[] {
  const where: string[] = [];
  const args: string[] = [];
  if (opts?.tenantId) {
    where.push("tenant_id = ?");
    args.push(opts.tenantId);
  }
  if (opts?.userId) {
    where.push("user_id = ?");
    args.push(opts.userId);
  }
  const sql =
    `SELECT * FROM brands` +
    (where.length ? ` WHERE ${where.join(" AND ")}` : "") +
    ` ORDER BY created_at DESC`;
  const rows = (args.length ? db().prepare(sql).all(...args) : db().prepare(sql).all()) as Row[];
  return rows.map(rowToProject);
}
