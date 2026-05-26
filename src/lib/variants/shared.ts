/**
 * Shared helper for brand variant generators (logos, landing, social, etc.).
 * Hits Claude Haiku via the Anthropic SDK and returns parsed JSON.
 *
 * Each generator provides its own system + user prompt and JSON schema;
 * this module handles the API call, token budgeting, and JSON extraction.
 */
import Anthropic from "@anthropic-ai/sdk";

export type BrandForVariants = {
  name: string;
  tagline?: string;
  positioning?: string;
  tone?: string[];
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    neutral?: string;
    background?: string;
    text?: string;
  };
  typography?: {
    heading?: string | { family?: string; name?: string };
    body?: string | { family?: string; name?: string };
  };
  // --- Brand soul (from extended brand.json) ---
  mission?: string;
  vision?: string;
  values?: string[];
  brandStory?: string;
  voice?: { say?: string[]; dont?: string[] };
  ica?: string;
};

/**
 * Extra context from the intake that variants benefit from but isn't in
 * brand.json — the user's own words (notes), their archetype pick, their
 * named competitors. Variants pull what they need.
 */
export type IntakeContext = {
  notes?: string;
  archetype?: string;
  competitors?: string;
  industry?: string;
  productDescription?: string;
  targetAudience?: string;
  logoStyle?: string;
  logoInspirationUrls?: string;
  /** Customer's Q24b answer — which 3rd-page type fits them. One of
   *  "services" | "products" | "events" | "booking" | "mixed". Empty means
   *  the customer was never asked / skipped; landing.ts falls back to
   *  inferring from offerings + audience signals, defaulting to "mixed". */
  flexPageType?: string;
};

export function fontName(
  v: string | { family?: string; name?: string } | undefined
): string {
  if (!v) return "Geist, Inter, sans-serif";
  if (typeof v === "string") return v;
  return v.family ?? v.name ?? "Geist, Inter, sans-serif";
}

export function safeSlug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "item";
}

export function parseJson<T>(raw: string): T {
  const cleaned = raw.trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]) as T;
    throw new Error(`unparseable model output: ${cleaned.slice(0, 200)}`);
  }
}

export type CallOpts = {
  system: string;
  user: string;
  maxTokens?: number;
  /** Override env default (default: claude-haiku-4-5). */
  model?: string;
};

/**
 * One-shot Claude call with retry-with-backoff on transient errors.
 *
 * Returns null if ANTHROPIC_API_KEY isn't set (so callers can fall through
 * gracefully) — otherwise retries up to 3x on 429 (rate limit) and 5xx
 * errors with 15s/30s/45s backoff. The Anthropic Haiku per-org rate limit
 * (10K output tokens/min) gets hit when ~7 variants build in parallel
 * after a brand kit is generated; without retry, ~5 of the 7 fail silently
 * and the user sees a half-built brand panel.
 */
export async function callClaude(opts: CallOpts): Promise<string | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  const client = new Anthropic();
  const MAX_ATTEMPTS = 3;
  let lastErr: unknown = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const msg = await client.messages.create({
        model: opts.model ?? process.env.LOGO_MODEL ?? "claude-haiku-4-5",
        max_tokens: opts.maxTokens ?? 4000,
        system: opts.system,
        messages: [{ role: "user", content: opts.user }],
      });
      return msg.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("");
    } catch (err) {
      lastErr = err;
      const msg = err instanceof Error ? err.message : String(err);
      const retryable = /\b429\b|rate.?limit|\b5\d\d\b/i.test(msg);
      if (retryable && attempt < MAX_ATTEMPTS) {
        const waitMs = Math.min(60000, 15000 * attempt); // 15s, 30s, 45s
        console.warn(
          `[callClaude] attempt ${attempt} retryable (${msg.slice(0, 80)}), waiting ${waitMs / 1000}s`
        );
        await new Promise((r) => setTimeout(r, waitMs));
        continue;
      }
      // Non-retryable or out of attempts: surface the error so callers can warn.
      throw err;
    }
  }
  // Unreachable but TS wants it.
  throw lastErr;
}

export function brandBrief(brand: BrandForVariants, intake?: IntakeContext): string {
  const c = brand.colors ?? {};
  const lines: string[] = [
    "FRESH-CONTEXT GUARD: this brand is fully specified by the fields below. If any reference",
    "or exemplar in your system prompt mentions other brands by name (Aurelian Labs, Pen2Purpose,",
    "AceTV, FamFit, Wone, Banger, OffScript, Vent, DOL, Halcyon, IEI, Ideas Equal Income, etc.),",
    "those are STRUCTURAL EXAMPLES ONLY — never copy their names, taglines, copy, or content.",
    "Use ONLY the brand specified here.",
    "",
    "BANNED AI VOCABULARY: never use these words/phrases in any output copy. They are AI-tells",
    "and immediately reveal that this output is not human-crafted:",
    "  comprehensive, robust, nuanced, multifaceted, intricate, vibrant, pivotal, seamless,",
    "  cutting-edge, innovative, transformative, holistic, dynamic, unparalleled, world-class,",
    "  delve, leverage, showcase, foster, underscore, elevate, unlock, tapestry, landscape (figurative),",
    "  interplay, paradigm, ecosystem (generic), synergy, moreover, furthermore, additionally.",
    "Banned phrases: 'in today's fast-paced world', 'in an ever-evolving landscape',",
    "  'navigate the complexities of', 'unlock the potential of', 'stand out from the crowd',",
    "  'take your X to the next level', 'where X meets Y'.",
    "Use plain, direct, specific language. Concrete details about THIS brand, never generic startup boilerplate.",
    "",
    `Name: ${brand.name}`,
  ];
  if (brand.tagline) lines.push(`Tagline: ${brand.tagline}`);
  if (brand.positioning) lines.push(`Positioning: ${brand.positioning.slice(0, 320)}`);
  if (brand.mission) lines.push(`Mission: ${brand.mission}`);
  if (brand.vision) lines.push(`Vision: ${brand.vision}`);
  if (brand.values?.length) lines.push(`Values: ${brand.values.join(" · ")}`);
  if (brand.brandStory) lines.push(`Brand story: ${brand.brandStory.slice(0, 400)}`);
  if (brand.ica) lines.push(`ICA: ${brand.ica.slice(0, 300)}`);
  if (brand.tone?.length) lines.push(`Tone: ${brand.tone.join(", ")}`);
  if (brand.voice?.say?.length) lines.push(`On-voice phrases: ${brand.voice.say.slice(0, 4).join(" / ")}`);
  if (brand.voice?.dont?.length) lines.push(`Anti-voice (NEVER write): ${brand.voice.dont.slice(0, 4).join(" / ")}`);
  lines.push(`Heading font: ${fontName(brand.typography?.heading)}`);
  lines.push(`Body font: ${fontName(brand.typography?.body)}`);
  lines.push(`Colors: primary=${c.primary ?? "#111"}, secondary=${c.secondary ?? "#555"}, accent=${c.accent ?? "#c00"}, neutral=${c.neutral ?? "#fff"}`);
  // Intake context — the user's own words / framing the brand.json may have abstracted away
  if (intake?.industry) lines.push(`Industry: ${intake.industry}`);
  if (intake?.targetAudience) lines.push(`Target audience (raw): ${intake.targetAudience}`);
  if (intake?.archetype) lines.push(`Archetype: ${intake.archetype}`);
  if (intake?.competitors) lines.push(`Competitors named by user: ${intake.competitors}`);
  if (intake?.notes) {
    lines.push("", `User's own words about this brand (use them — this is the most personal signal):`);
    lines.push(`"${intake.notes.slice(0, 500)}"`);
  }
  return lines.join("\n");
}
