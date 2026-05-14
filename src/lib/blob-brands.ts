/**
 * Vercel Blob–backed persistence for brand output files.
 *
 * Mirrors blob-runs.ts but for brand assets (PDFs, SVGs, HTML, JSON).
 * On Vercel, /tmp is ephemeral — files vanish between cold starts.
 * This module writes brand outputs to Blob on every write and reads
 * from Blob when the local filesystem misses.
 *
 * Requires BLOB_READ_WRITE_TOKEN env var (same token as blob-runs).
 */

import { put, get as blobGet } from "@vercel/blob";

const PREFIX = "brand-outputs";

function blobKey(brandId: string, filename: string): string {
  return `${PREFIX}/${brandId}/${filename}`;
}

export function isBlobEnabled(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

/**
 * Write a brand output file to Vercel Blob.
 * Call alongside the local fs write so both stay in sync.
 */
export async function persistBrandFile(
  brandId: string,
  filename: string,
  content: string | Buffer
): Promise<void> {
  if (!isBlobEnabled()) return;
  try {
    const buf = typeof content === "string" ? Buffer.from(content, "utf8") : content;
    await put(blobKey(brandId, filename), buf, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
  } catch (err) {
    console.error(`[blob-brands] failed to persist ${brandId}/${filename}:`, err);
  }
}

/**
 * Read a brand output file from Vercel Blob.
 * Returns null if not found or Blob is unavailable.
 */
export async function fetchBrandFile(
  brandId: string,
  filename: string
): Promise<Buffer | null> {
  if (!isBlobEnabled()) return null;
  try {
    const result = await blobGet(blobKey(brandId, filename), { access: "public" });
    if (!result || result.statusCode !== 200) return null;
    const reader = result.stream.getReader();
    const chunks: Uint8Array[] = [];
    let done = false;
    while (!done) {
      const { value, done: d } = await reader.read();
      if (value) chunks.push(value);
      done = d;
    }
    return Buffer.concat(chunks);
  } catch {
    return null;
  }
}
