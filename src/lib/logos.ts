/**
 * Logo variant generator — a dedicated post-processing step that produces
 * N distinct SVG logo directions for a brand (wordmark, monogram, geometric
 * mark, etc.).
 *
 * Separate from the main skill because:
 *  - Logos are the weakest part of the main skill's output
 *  - A dedicated pass with logo-theory rules + tight JSON schema produces
 *    better SVGs than cramming it into the big playbook prompt
 *  - Always uses Claude Haiku (best at SVG) regardless of main SKILL_ADAPTER —
 *    $0.005 / run, worth it for quality
 */
import Anthropic from "@anthropic-ai/sdk";
import fs from "node:fs/promises";
import path from "node:path";

export type LogoVariant = {
  key: string;        // "wordmark" | "monogram" | "mark" | ...
  title: string;      // short display name
  rationale: string;  // one-sentence why-it-fits
  filename: string;   // relative path written under outputs/<id>/logos/
};

type BrandForLogos = {
  name: string;
  tagline?: string;
  positioning?: string;
  tone?: string[];
  colors?: { primary?: string; secondary?: string; accent?: string; neutral?: string };
  typography?: {
    heading?: string | { family?: string; name?: string };
    body?: string | { family?: string; name?: string };
  };
};

function fontOf(
  v: string | { family?: string; name?: string } | undefined
): string {
  if (!v) return "Geist, Inter, sans-serif";
  if (typeof v === "string") return v;
  return v.family ?? v.name ?? "Geist, Inter, sans-serif";
}

const SYSTEM_PROMPT = `You are a senior brand designer producing production-ready SVG logos by hand.

DESIGN PRINCIPLES:
- Simplicity: must read at 16px. Single strong idea per mark.
- Geometric anchoring: shapes built from circles, squares, triangles, or golden ratios.
- Max 2 typefaces, max 3 colors per primary version.
- No emoji, no illustration, no stock imagery, no decorative flourishes.

CRITICAL CONTENT RULES:
- The ONLY text in the logo is the brand name (or its initials for monograms).
- NEVER add taglines, subtitles, descriptors like "CO.", "STUDIO", "LABS", the industry, or category text.
- NEVER include the tagline as SVG text even if it's mentioned in the brief.
- A logo is a mark, not a business card.

DISTINCTNESS RULE (non-negotiable):
The 3 variants must be visually and conceptually distinct. NOT 3 wordmarks. NOT 3 monograms.
  1. WORDMARK   — pure typography, brand name set beautifully, optional 1-color accent detail (a dot, a rule, a single modified letter). No container, no separate mark.
  2. MONOGRAM   — brand initials inside a bordered container (square, circle, or hexagon). No wordmark beside it in this variant.
  3. MARK+LOCKUP — abstract geometric mark (built from 1–2 primitives) paired with the full brand name set beside it.

OUTPUT (JSON only, no fences, no prose):
{
  "variants": [
    {
      "key": "wordmark" | "monogram" | "mark-lockup",
      "title": "<2-3 word name for this direction>",
      "rationale": "<one-sentence why this approach fits the brand's tone>",
      "svg": "<self-contained SVG>"
    }
  ]
}

SVG TECH:
- xmlns="http://www.w3.org/2000/svg"
- viewBox="0 0 400 160" for wordmark & mark-lockup, "0 0 200 200" for monogram
- Use brand primary + accent colors via inline fill
- Inline font-family using the brand's heading font
- No <image>, no <foreignObject>, no external resources, no data: URIs`;

function buildUserPrompt(brand: BrandForLogos, count: number): string {
  const heading = fontOf(brand.typography?.heading);
  const c = brand.colors ?? {};
  return [
    `Design ${count} DISTINCT logo directions for the brand below. Follow the 3 approaches in order: wordmark, monogram, mark-lockup.`,
    "",
    "REMINDER: the ONLY text allowed anywhere in the logo is the brand name (or its initials). No tagline, no industry, no subtitle, no descriptor.",
    "",
    "Brand:",
    `  Name: ${brand.name}`,
    brand.tone?.length ? `  Tone: ${brand.tone.join(", ")}` : "",
    `  Heading font: ${heading}`,
    `  Colors: primary=${c.primary ?? "#111"}, accent=${c.accent ?? "#c00"}, neutral=${c.neutral ?? "#fff"}`,
    "",
    "Return exactly 3 variants. JSON only.",
  ]
    .filter(Boolean)
    .join("\n");
}

type ModelResponse = {
  variants: Array<{
    key?: string;
    title?: string;
    rationale?: string;
    svg?: string;
  }>;
};

function parseJson(raw: string): ModelResponse {
  const cleaned = raw.trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    // Sometimes models wrap in ```json fences.
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("logo generator: unparseable model output");
  }
}

/**
 * Generate N logo variants for a brand, write them under outputDir/logos/,
 * return a manifest. Returns [] on failure (logos are nice-to-have).
 */
export async function generateLogoVariants(
  brand: BrandForLogos,
  outputDir: string,
  count = 3
): Promise<LogoVariant[]> {
  if (!process.env.ANTHROPIC_API_KEY) {
    // No key — no AI logos. Caller should fall back.
    return [];
  }

  const client = new Anthropic();
  let text = "";
  try {
    const msg = await client.messages.create({
      model: process.env.LOGO_MODEL ?? "claude-haiku-4-5",
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserPrompt(brand, count) }],
    });
    text = msg.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");
  } catch (err) {
    console.warn(`[logos] model call failed:`, err instanceof Error ? err.message : err);
    return [];
  }

  let parsed: ModelResponse;
  try {
    parsed = parseJson(text);
  } catch (err) {
    console.warn(`[logos] parse failed:`, err instanceof Error ? err.message : err);
    return [];
  }

  const logosDir = path.join(outputDir, "logos");
  await fs.mkdir(logosDir, { recursive: true });

  const manifest: LogoVariant[] = [];
  for (let i = 0; i < parsed.variants.length && i < count; i++) {
    const v = parsed.variants[i];
    if (!v.svg || !v.svg.includes("<svg")) continue;
    const key = (v.key || `option-${i + 1}`).toLowerCase().replace(/[^a-z0-9-]/g, "-");
    const filename = `logos/${key}.svg`;
    await fs.writeFile(path.join(outputDir, filename), v.svg);
    manifest.push({
      key,
      title: v.title || key,
      rationale: v.rationale || "",
      filename,
    });
  }
  return manifest;
}
