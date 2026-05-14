import path from "node:path";
import fs from "node:fs";
import { persistBrandFile, fetchBrandFile } from "./blob-brands";

// On Vercel, process.cwd() is read-only. Use /tmp so brand outputs can be written.
export const OUTPUTS_ROOT = process.env.VERCEL
  ? "/tmp/iei-outputs"
  : path.join(process.cwd(), "outputs");

export function brandDir(brandId: string): string {
  const dir = path.join(OUTPUTS_ROOT, brandId);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function writeOutput(brandId: string, filename: string, content: string | Buffer): string {
  const filePath = path.join(brandDir(brandId), filename);
  fs.writeFileSync(filePath, content);
  // Persist to Vercel Blob for durability (fire-and-forget)
  void persistBrandFile(brandId, filename, content);
  return `/api/brands/${brandId}/files/${encodeURIComponent(filename)}`;
}

export function readOutput(brandId: string, filename: string): Buffer | null {
  const filePath = path.join(brandDir(brandId), filename);
  if (fs.existsSync(filePath)) return fs.readFileSync(filePath);
  // Local file missing (cold start on Vercel) — handled by readOutputAsync
  return null;
}

/**
 * Async read with Blob fallback. Use this in API routes where await is available.
 * Falls back to Vercel Blob when the local /tmp file is gone after a cold start.
 */
export async function readOutputAsync(brandId: string, filename: string): Promise<Buffer | null> {
  const filePath = path.join(brandDir(brandId), filename);
  if (fs.existsSync(filePath)) return fs.readFileSync(filePath);
  // Try Vercel Blob fallback
  const blob = await fetchBrandFile(brandId, filename);
  if (blob) {
    // Re-hydrate local cache so subsequent sync reads work within this invocation
    fs.writeFileSync(filePath, blob);
  }
  return blob;
}

export function contentTypeFor(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const map: Record<string, string> = {
    ".html": "text/html; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".pdf": "application/pdf",
    ".png": "image/png",
  };
  return map[ext] ?? "application/octet-stream";
}
