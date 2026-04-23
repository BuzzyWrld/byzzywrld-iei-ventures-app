/**
 * File upload storage — one dir per upload session keyed by UUID.
 * Stored under data/uploads/<sessionId>/<filename>.
 * Not tied to a brand yet; the session ID is passed into the intake so the
 * skill can reference the uploaded assets.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const UPLOADS_ROOT = path.join(process.cwd(), "data", "uploads");

export type UploadKind = "logo" | "brand-guide" | "other";

export type StoredUpload = {
  sessionId: string;
  filename: string;
  size: number;
  mime: string;
  kind: UploadKind;
  url: string;
};

const MAX_BYTES = 20 * 1024 * 1024; // 20 MB per file
const ALLOWED_MIMES = new Set([
  "image/svg+xml",
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
]);

function classify(mime: string, name: string): UploadKind {
  if (mime === "image/svg+xml") return "logo";
  if (mime === "application/pdf") return "brand-guide";
  if (/logo/i.test(name)) return "logo";
  if (/(brand|guide|style)/i.test(name) && mime === "application/pdf") return "brand-guide";
  return "other";
}

function safeFilename(raw: string): string {
  const base = path.basename(raw).replace(/[^\w.\-]/g, "_");
  return base.slice(0, 120) || "file";
}

export async function storeUpload(
  sessionId: string,
  file: File
): Promise<StoredUpload> {
  if (!ALLOWED_MIMES.has(file.type)) {
    throw new Error(`unsupported file type: ${file.type}`);
  }
  if (file.size > MAX_BYTES) {
    throw new Error(`file too large: ${file.size} bytes (max ${MAX_BYTES})`);
  }
  const dir = path.join(UPLOADS_ROOT, sessionId);
  await fs.mkdir(dir, { recursive: true });
  const filename = safeFilename(file.name);
  const dest = path.join(dir, filename);
  const buf = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(dest, buf);
  return {
    sessionId,
    filename,
    size: buf.length,
    mime: file.type,
    kind: classify(file.type, filename),
    url: `/api/uploads/${sessionId}/${encodeURIComponent(filename)}`,
  };
}

export async function listUploads(sessionId: string): Promise<StoredUpload[]> {
  const dir = path.join(UPLOADS_ROOT, sessionId);
  try {
    const names = await fs.readdir(dir);
    const out: StoredUpload[] = [];
    for (const name of names) {
      const stat = await fs.stat(path.join(dir, name));
      out.push({
        sessionId,
        filename: name,
        size: stat.size,
        mime: guessMime(name),
        kind: classify(guessMime(name), name),
        url: `/api/uploads/${sessionId}/${encodeURIComponent(name)}`,
      });
    }
    return out;
  } catch {
    return [];
  }
}

export async function readUpload(sessionId: string, filename: string): Promise<Buffer | null> {
  const safe = safeFilename(filename);
  if (safe !== filename.replace(/[^\w.\-]/g, "_").slice(0, 120)) {
    // Caller passed a different string than what we'd store. Defensive bail.
  }
  const full = path.join(UPLOADS_ROOT, sessionId, safeFilename(filename));
  try {
    return await fs.readFile(full);
  } catch {
    return null;
  }
}

export function newSessionId(): string {
  return randomUUID();
}

function guessMime(name: string): string {
  const ext = path.extname(name).toLowerCase();
  const map: Record<string, string> = {
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".pdf": "application/pdf",
  };
  return map[ext] ?? "application/octet-stream";
}
