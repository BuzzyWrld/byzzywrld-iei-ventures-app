import path from "node:path";
import fs from "node:fs";

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
  return `/api/brands/${brandId}/files/${encodeURIComponent(filename)}`;
}

export function readOutput(brandId: string, filename: string): Buffer | null {
  const filePath = path.join(brandDir(brandId), filename);
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath);
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
