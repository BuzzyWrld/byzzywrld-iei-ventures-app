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
  1. WORDMARK   — pure typography, brand name set beautifully. NO container, NO separate mark, NO line/rule cutting through the letters. If you add an accent detail (a single dot, a tiny underline, a colored period), place it OUTSIDE the letterforms — never overlapping or bisecting any letter. When in doubt: pure type, nothing else.
  2. MONOGRAM   — brand initials (2–3 chars) inside a bordered container (square, circle, or hexagon). The initials MUST fit comfortably with at least 15% padding on every side. If the brand has long initials (4+ chars), drop to 2 chars (use the most distinctive). No wordmark beside it in this variant.
  3. MARK+LOCKUP — abstract geometric mark on the left (built from 1–2 primitives, e.g. circles, lines, triangles) paired with the full brand name on the right. The mark must NOT overlap the wordmark.

OVERLAP/COLLISION CHECK (mandatory):
Before finalizing each variant, mentally verify:
  - No element crosses through any letter glyph
  - No text overflows its container (monogram especially)
  - Text and decorative elements don't share the same x/y range unless intentional
  - All elements stay within the viewBox bounds

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
  - Wordmark (viewBox 400×160): for a brand name of N visible characters (count letters AND spaces), set font-size no larger than min(72, 380 / N * 1.6). Examples — 8 chars: ~64px, 14 chars: ~43px, 20 chars: ~30px. Always text-anchor="middle" x="200" y="100".
  - Mark-lockup (viewBox 400×160): symbol on left takes x=20-110; wordmark on right starts at x=130 with text-anchor="start". Font-size: min(40, 260 / N * 1.6). The wordmark must end before x=380.
  - Monogram (viewBox 200×200): use 2–3 character initials. Border container is a 160×160 box centered at (100,100), so 20px padding on every side. The text inside MUST fit with another 15% padding inside that. Font-size by initial count:
    * 2 letters: 90–110px font-size, fits comfortably
    * 3 letters: 60–75px font-size MAX — never go bigger or letters will overflow the border
    * 4+ letters: drop to 2 most distinctive letters; do NOT cram 4 letters into a monogram
    Always text-anchor="middle" x="100" y="120" (the y nudge accounts for cap-height).
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
  // Retry with exponential backoff on transient errors (429 rate limits, 5xx).
  // The Anthropic Haiku per-org rate limit (10K output tokens/min) gets hit
  // when several brands build in parallel. A single 30-60s wait usually clears it.
  const MAX_ATTEMPTS = 3;
  let attempt = 0;
  while (attempt < MAX_ATTEMPTS) {
    attempt++;
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
      break;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const isRateLimit = /\b429\b|rate.?limit/i.test(msg);
      const isServerError = /\b5\d\d\b/.test(msg);
      const retryable = isRateLimit || isServerError;
      if (retryable && attempt < MAX_ATTEMPTS) {
        const waitMs = Math.min(60000, 15000 * attempt); // 15s, 30s, 45s
        console.warn(`[logos] attempt ${attempt} failed (${isRateLimit ? "rate limit" : "5xx"}), waiting ${waitMs / 1000}s before retry`);
        await new Promise((r) => setTimeout(r, waitMs));
        continue;
      }
      console.warn(`[logos] giving up after ${attempt} attempt(s):`, msg);
      return [];
    }
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

const TWEAK_SYSTEM_PROMPT = `You edit existing brand logo SVGs. The user describes ONE small change ("center the T," "delete the underline," "make the dot smaller," "move the lockup down 8 pixels"). You return ONE modified SVG that applies the change and preserves everything else.

CRITICAL RULES:
- Return ONLY the SVG. No JSON. No prose. No markdown fences. The first character of your response is "<" and the last is ">".
- Preserve viewBox, dimensions, and overall composition unless the user explicitly asks to change them.
- Do not add new <text> elements unless the user asked. Do not change the brand name spelling.
- Keep the @import font block — that's required for the SVG to render in a sandboxed <object>.
- All XML special characters in attributes/text must be properly escaped: & as &amp;, < as &lt;, > as &gt;, " as &quot;, ' as &apos;. Especially in URL attributes — never write a raw &.
- If the user's instruction is unclear or impossible (e.g. "make it cooler"), return the SVG unchanged. Do not invent changes the user didn't ask for.
- The output must remain valid XML — broken SVG renders as a parse error to the user.`;

function buildTweakPrompt(svg: string, instruction: string): string {
  return [
    "Apply this single change to the SVG below:",
    `  "${instruction.trim()}"`,
    "",
    "Return ONLY the modified SVG. Preserve everything else.",
    "",
    "Current SVG:",
    svg,
  ].join("\n");
}

export type TweakResult =
  | { ok: true; svg: string }
  | { ok: false; reason: "rate_limited" | "invalid_response" | "io_error" | "no_key" | "empty_input" };

/**
 * Apply a user instruction to an existing logo SVG. Reads the file, sends
 * (system + user instruction + current SVG) to Haiku, gets back a modified
 * SVG, sanitizes it (escape & in URLs), writes it back to the same path.
 *
 * Returns a discriminated result so the API layer can give the user a
 * specific error message — "rate limited, try again in a minute" is very
 * different from "the model couldn't make sense of your request."
 */
export async function tweakLogo(
  svgPath: string,
  instruction: string
): Promise<TweakResult> {
  if (!process.env.ANTHROPIC_API_KEY) return { ok: false, reason: "no_key" };
  if (!instruction.trim()) return { ok: false, reason: "empty_input" };

  let originalSvg = "";
  try {
    originalSvg = await fs.readFile(svgPath, "utf8");
  } catch (err) {
    console.warn(`[logos:tweak] could not read svg:`, err instanceof Error ? err.message : err);
    return { ok: false, reason: "io_error" };
  }

  if (!originalSvg.includes("<svg")) {
    console.warn(`[logos:tweak] file at ${svgPath} is not an SVG`);
    return { ok: false, reason: "io_error" };
  }

  const client = new Anthropic();
  const MAX_ATTEMPTS = 3;
  let attempt = 0;
  let text = "";
  let lastWasRateLimit = false;
  while (attempt < MAX_ATTEMPTS) {
    attempt++;
    try {
      const msg = await client.messages.create({
        model: process.env.LOGO_MODEL ?? "claude-haiku-4-5",
        max_tokens: 4000,
        system: TWEAK_SYSTEM_PROMPT,
        messages: [
          { role: "user", content: buildTweakPrompt(originalSvg, instruction) },
        ],
      });
      text = msg.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("");
      lastWasRateLimit = false;
      break;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const isRate = /\b429\b|rate.?limit/i.test(msg);
      const retryable = isRate || /\b5\d\d\b/.test(msg);
      lastWasRateLimit = isRate;
      if (retryable && attempt < MAX_ATTEMPTS) {
        const waitMs = Math.min(60000, 15000 * attempt);
        console.warn(`[logos:tweak] attempt ${attempt} retryable (${msg.slice(0, 60)}), waiting ${waitMs / 1000}s`);
        await new Promise((r) => setTimeout(r, waitMs));
        continue;
      }
      console.warn(`[logos:tweak] giving up:`, msg);
      return { ok: false, reason: lastWasRateLimit ? "rate_limited" : "invalid_response" };
    }
  }

  // Extract just the <svg>...</svg> block in case the model added stray text.
  const match = text.match(/<svg[\s\S]*<\/svg>/);
  if (!match) {
    console.warn(`[logos:tweak] response did not contain an <svg> block`);
    return { ok: false, reason: "invalid_response" };
  }
  const cleaned = sanitizeSvg(match[0]);

  try {
    await fs.writeFile(svgPath, cleaned);
    return { ok: true, svg: cleaned };
  } catch (err) {
    console.warn(`[logos:tweak] write failed:`, err instanceof Error ? err.message : err);
    return { ok: false, reason: "io_error" };
  }
}
