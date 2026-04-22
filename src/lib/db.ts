import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import type { BrandProject } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = path.join(DATA_DIR, "iei.db");

let _db: Database.Database | null = null;
export function db(): Database.Database {
  if (_db) return _db;
  _db = new Database(DB_PATH);
  _db.pragma("journal_mode = WAL");
  _db.exec(`
    CREATE TABLE IF NOT EXISTS brands (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      status TEXT NOT NULL,
      intake_json TEXT NOT NULL,
      outputs_json TEXT NOT NULL DEFAULT '{}',
      error TEXT
    );
  `);
  return _db;
}

type Row = {
  id: string;
  created_at: string;
  status: BrandProject["status"];
  intake_json: string;
  outputs_json: string;
  error: string | null;
};

const rowToProject = (r: Row): BrandProject => ({
  id: r.id,
  createdAt: r.created_at,
  status: r.status,
  intake: JSON.parse(r.intake_json),
  outputs: JSON.parse(r.outputs_json || "{}"),
  error: r.error ?? undefined,
});

export function createBrand(p: BrandProject): void {
  db()
    .prepare(
      `INSERT INTO brands (id, created_at, status, intake_json, outputs_json, error)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(
      p.id,
      p.createdAt,
      p.status,
      JSON.stringify(p.intake),
      JSON.stringify(p.outputs),
      p.error ?? null
    );
}

export function updateBrand(id: string, patch: Partial<BrandProject>): void {
  const current = getBrand(id);
  if (!current) throw new Error(`brand ${id} not found`);
  const next = { ...current, ...patch };
  db()
    .prepare(
      `UPDATE brands SET status = ?, outputs_json = ?, error = ? WHERE id = ?`
    )
    .run(next.status, JSON.stringify(next.outputs), next.error ?? null, id);
}

export function getBrand(id: string): BrandProject | null {
  const row = db().prepare(`SELECT * FROM brands WHERE id = ?`).get(id) as
    | Row
    | undefined;
  return row ? rowToProject(row) : null;
}

export function listBrands(): BrandProject[] {
  const rows = db()
    .prepare(`SELECT * FROM brands ORDER BY created_at DESC`)
    .all() as Row[];
  return rows.map(rowToProject);
}
