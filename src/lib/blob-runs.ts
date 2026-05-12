/**
 * Vercel Blob–backed persistence for content runs.
 *
 * Solves the ephemeral SQLite problem: each Lambda instance has its own
 * /tmp/iei-data/iei.db, so cross-Lambda reads (e.g. status polling)
 * return "not found". This module writes run state to Vercel Blob on
 * every mutation and reads from Blob when SQLite misses.
 *
 * Requires BLOB_READ_WRITE_TOKEN env var.
 */

import { put, del, get as blobGet } from "@vercel/blob";
import type { ContentRun } from "./skills/content-engine-contract";

const PREFIX = "content-runs";

function blobKey(runId: string): string {
  return `${PREFIX}/${runId}.json`;
}

/**
 * Whether Blob persistence is available.
 * Falls back gracefully to SQLite-only when the token isn't set (local dev).
 */
export function isBlobEnabled(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

/**
 * Write (or overwrite) a content run's state to Vercel Blob.
 * Fire-and-forget safe — callers can `void persistRun(run)` for non-critical updates.
 */
export async function persistRun(run: ContentRun): Promise<void> {
  if (!isBlobEnabled()) return;
  try {
    console.log(`[blob-runs] WRITE ${run.id} status=${run.status} pct=${run.progressPct ?? 0}`);
    await put(blobKey(run.id), JSON.stringify(run), {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
    });
    console.log(`[blob-runs] WRITE ${run.id} DONE status=${run.status}`);
  } catch (err) {
    console.error(`[blob-runs] failed to persist run ${run.id}:`, err);
  }
}

/**
 * Read a content run from Vercel Blob.
 * Returns null if not found or Blob is unavailable.
 */
export async function fetchRun(runId: string): Promise<ContentRun | null> {
  if (!isBlobEnabled()) return null;
  try {
    // Use the SDK's get() which reads through the API, not the CDN
    const result = await blobGet(blobKey(runId), { access: "public" });
    if (!result || result.statusCode !== 200) return null;
    // Read the stream to text
    const reader = result.stream.getReader();
    const chunks: Uint8Array[] = [];
    let done = false;
    while (!done) {
      const { value, done: d } = await reader.read();
      if (value) chunks.push(value);
      done = d;
    }
    const text = new TextDecoder().decode(Buffer.concat(chunks));
    return JSON.parse(text) as ContentRun;
  } catch {
    return null;
  }
}

/**
 * List all content runs from Blob storage.
 * Used as fallback when SQLite list returns empty.
 */
export async function listRunsFromBlob(): Promise<ContentRun[]> {
  if (!isBlobEnabled()) return [];
  try {
    // Vercel Blob list API
    const { list } = await import("@vercel/blob");
    const result = await list({ prefix: `${PREFIX}/` });
    const runs: ContentRun[] = [];
    for (const blob of result.blobs) {
      try {
        const run = await fetchRun(blob.pathname.replace(`${PREFIX}/`, "").replace(".json", ""));
        if (run) runs.push(run);
      } catch {
        // skip malformed entries
      }
    }
    return runs.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (err) {
    console.error("[blob-runs] failed to list runs:", err);
    return [];
  }
}

/**
 * Delete a content run from Blob storage.
 */
export async function deleteRunFromBlob(runId: string): Promise<void> {
  if (!isBlobEnabled()) return;
  try {
    await del(blobKey(runId));
  } catch {
    // best-effort
  }
}
