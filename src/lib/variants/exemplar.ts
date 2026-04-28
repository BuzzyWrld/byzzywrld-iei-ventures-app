/**
 * Loads IEI's reference exemplars (real shipped landing pages, pitch decks)
 * from the brand-playbook skill's references/ tree at runtime, so variant
 * generators can pattern-match to IEI's actual deliverables instead of
 * generic LLM defaults.
 *
 * Files are read once and cached for the process lifetime — no file watcher,
 * no invalidation; restart the dev server to pick up edits.
 */
import fs from "node:fs/promises";
import path from "node:path";

const REFERENCES_ROOT = path.join(
  process.cwd(),
  "skills",
  "brand-playbook",
  "references",
  "exemplars"
);

const cache = new Map<string, string>();

async function read(relPath: string): Promise<string | null> {
  if (cache.has(relPath)) return cache.get(relPath)!;
  try {
    const full = path.join(REFERENCES_ROOT, relPath);
    const text = await fs.readFile(full, "utf8");
    cache.set(relPath, text);
    return text;
  } catch (err) {
    console.warn(
      `[exemplar] could not read ${relPath}:`,
      err instanceof Error ? err.message : err
    );
    return null;
  }
}

/**
 * Wraps an exemplar HTML in a system-prompt-friendly block. Designed for
 * appending to an existing system prompt — gives the model concrete pattern
 * material without saying "copy this verbatim."
 */
function frame(label: string, content: string): string {
  return [
    "",
    `--- IEI EXEMPLAR (${label}) ---`,
    "Below is one real, shipped IEI deliverable. Study its structural moves —",
    "section ordering, copy density, hero treatment, typography hierarchy,",
    "color application, layout rhythm. Match the QUALITY BAR and STRUCTURAL",
    "PATTERNS. Do not copy specific copy, brand names, or colors — those must",
    "come from the brief below.",
    "",
    content,
    `--- END EXEMPLAR ---`,
    "",
  ].join("\n");
}

export async function landingExemplar(): Promise<string> {
  const html = await read("landings/famfit.html");
  return html ? frame("landing page — FamFit", html) : "";
}

export async function pitchExemplar(): Promise<string> {
  const html = await read("pitches/famfit.html");
  return html ? frame("pitch one-pager — FamFit", html) : "";
}
