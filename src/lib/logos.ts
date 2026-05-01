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
- viewBox="0 0 400 160" for wordmark and mark-lockup, "0 0 200 200" for monogram
- Use brand primary + accent colors via inline fill
- The SVG renders inside an <object> sandbox, so it WILL NOT inherit fonts from the host page. To use the brand's heading font, embed it via:
    <defs><style>@import url('https://fonts.googleapis.com/css2?family=FONT+NAME:wght@400;700&amp;display=swap');</style></defs>
  Replace FONT+NAME with the brand's heading font (URL-encoded — spaces become +). The ampersand MUST be written as &amp; — a raw & makes the SVG invalid XML. This is non-negotiable.
- After embedding the font, set font-family="FontName, sans-serif" on every <text>.
- Sizing rules (CRITICAL — text must fit inside viewBox):
  - Wordmark (viewBox 400×160): for a brand name of N visible characters, set font-size no larger than: min(72, 380 / N * 1.6). For "Tab Industries" (14 chars including space) that's about 43–50px. Always use text-anchor="middle" and x="200" y="100".
  - Mark-lockup (viewBox 400×160): the symbol takes the left ~110px; the text starts at x≈130 with text-anchor="start". Font-size should be no larger than: min(48, 270 / N * 1.6).
  - Monogram (viewBox 200×200): the initials should be 80–100px font-size, text-anchor="middle", x="100" y="115".
- No <image>, no <foreignObject>, no external resources beyond the Google Fonts @import, no data: URIs.
- All XML special characters in attribute values and text content must be properly escaped: & as &amp;, < as &lt;, > as &gt;, " as &quot;, ' as &apos;.`;

export type LogoOptions = {
  /** "professional" | "playful" | "minimal" | "cartoonish" | "vintage" | "bold" — empty = AI picks. */
  style?: string;
  /** Comma- or newline-separated inspiration URLs (Pinterest, Dribbble). */
  inspirationUrls?: string;
};

const STYLE_HINTS: Record<string, string> = {
  professional: "Clean wordmark or geometric mark. Suit-and-tie polish. Conservative typography. No mascot, no illustrative flourish.",
  playful:      "Friendly curves, bouncy proportions, expressive shapes. Optimistic energy without being childish.",
  minimal:      "Single line or single shape. Negative space does the work. Strict reduction — every element must justify itself.",
  cartoonish:   "Mascot-driven or illustrative character. Hand-drawn energy. Bold outlines, expressive shapes. Suitable for consumer/playful brands.",
  vintage:      "Heritage typography (serif or slab), badge or seal silhouettes, ornamental detail. Hand-built feel.",
  bold:         "Heavy typographic weights, strong geometry, high contrast. Industrial confidence.",
};

function buildUserPrompt(brand: BrandForLogos, count: number, opts: LogoOptions = {}): string {
  const heading = fontOf(brand.typography?.heading);
  const c = brand.colors ?? {};
  const styleHint = opts.style && STYLE_HINTS[opts.style] ? STYLE_HINTS[opts.style] : "";
  const inspiration = (opts.inspirationUrls ?? "")
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return [
    `Design ${count} DISTINCT logo directions for the brand below. Follow the 3 approaches in order: wordmark, monogram, mark-lockup.`,
    "",
    "REMINDER: the ONLY text allowed anywhere in the logo is the brand name (or its initials). No tagline, no industry, no subtitle, no descriptor.",
    "",
    styleHint ? `STYLE DIRECTION (${opts.style}): ${styleHint} All 3 variants should fit this style.` : "",
    inspiration.length
      ? `INSPIRATION REFERENCES (the user pasted these as visual cues — match the vibe, do NOT copy):\n${inspiration.map((u) => `  - ${u}`).join("\n")}`
      : "",
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
 * SVG safety-net: ensures the SVG is valid XML so the browser doesn't render
 * a parse error instead of the logo. The model often embeds Google Fonts via
 *   <defs><style>@import url('...&display=swap');</style></defs>
 * — the unescaped `&` breaks XML parsing. We preserve the @import (the SVG
 * needs the font to render correctly inside an <object> sandbox) and just
 * escape every bare `&` that isn't already a known entity.
 */
function sanitizeSvg(svg: string): string {
  return svg.replace(
    /&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#x[0-9a-fA-F]+;)/g,
    "&amp;"
  );
}

/**
 * Generate N logo variants for a brand, write them under outputDir/logos/,
 * return a manifest. Returns [] on failure (logos are nice-to-have).
 */
export async function generateLogoVariants(
  brand: BrandForLogos,
  outputDir: string,
  count = 3,
  opts: LogoOptions = {}
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
      messages: [{ role: "user", content: buildUserPrompt(brand, count, opts) }],
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
    await fs.writeFile(path.join(outputDir, filename), sanitizeSvg(v.svg));
    manifest.push({
      key,
      title: v.title || key,
      rationale: v.rationale || "",
      filename,
    });
  }
  return manifest;
}
