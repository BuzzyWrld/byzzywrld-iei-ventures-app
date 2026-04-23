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

const SYSTEM_PROMPT = `You are a senior brand designer specializing in logo systems. You produce production-ready SVG logos by hand, following the design principles below.

DESIGN PRINCIPLES (from logo-theory.md):
- Simplicity: must read at 16px.
- Single strong idea per mark — no visual noise.
- Geometric anchoring: every shape built on circle, square, triangle, or golden ratio.
- Weight balance: blur-test centered.
- Max 2 typefaces, max 3 colors per primary version.
- No emoji, no illustration, no stock imagery.
- Must work black-on-white as a fallback.
- Typography-led unless otherwise specified.

OUTPUT:
Return ONLY valid JSON, no markdown fences, no prose:
{
  "variants": [
    {
      "key": "wordmark"   | "monogram" | "mark" | "emblem" | "combination",
      "title": "<2-3 word name>",
      "rationale": "<one-sentence why this fits the brand>",
      "svg": "<self-contained SVG with xmlns + viewBox + no external resources>"
    }
  ]
}

SVG constraints:
- xmlns="http://www.w3.org/2000/svg"
- viewBox="0 0 400 160" (landscape lockup) OR "0 0 200 200" (square mark)
- Use the brand's primary, accent, and neutral colors (hex) from the brief
- Use the brand's heading font family for any typography (inline font-family attribute)
- No <image>, no <foreignObject>, no external fonts, no data: URIs
- Should render identically in any browser/editor with just the SVG source`;

function buildUserPrompt(brand: BrandForLogos, count: number): string {
  const heading = fontOf(brand.typography?.heading);
  const c = brand.colors ?? {};
  return [
    `Design ${count} DISTINCT logo directions for the following brand. Each must use a different conceptual approach — never produce ${count} wordmarks or ${count} similar marks.`,
    "",
    "Suggested direction spread:",
    `  1. wordmark      — typography-led, the brand name set beautifully with subtle detail`,
    `  2. monogram      — initials in a bordered container / seal / badge`,
    `  3. geometric mark — abstract mark built from 1-2 primitives, paired with small typography`,
    "",
    "Brand:",
    `  Name: ${brand.name}`,
    brand.tagline ? `  Tagline: ${brand.tagline}` : "",
    brand.positioning ? `  Positioning: ${brand.positioning.slice(0, 240)}` : "",
    brand.tone?.length ? `  Tone: ${brand.tone.join(", ")}` : "",
    `  Heading font: ${heading}`,
    `  Colors: primary=${c.primary ?? "#111"}, secondary=${c.secondary ?? "#555"}, accent=${c.accent ?? "#c00"}, neutral=${c.neutral ?? "#fff"}`,
    "",
    "Return exactly this many variants. JSON only.",
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
