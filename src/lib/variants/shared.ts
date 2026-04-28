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
 * One-shot Claude call returning the text response. Returns null if
 * ANTHROPIC_API_KEY isn't set (so callers can fall through gracefully).
 */
export async function callClaude(opts: CallOpts): Promise<string | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  const client = new Anthropic();
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
}

export function brandBrief(brand: BrandForVariants): string {
  const c = brand.colors ?? {};
  return [
    "FRESH-CONTEXT GUARD: this brand is fully specified by the fields below. If any reference",
    "or exemplar in your system prompt mentions other brands by name (Aurelian Labs, Pen2Purpose,",
    "AceTV, FamFit, Wone, Banger, OffScript, Vent, DOL, Halcyon, IEI, Ideas Equal Income, etc.),",
    "those are STRUCTURAL EXAMPLES ONLY — never copy their names, taglines, copy, or content.",
    "Use ONLY the brand specified here.",
    "",
    `Name: ${brand.name}`,
    brand.tagline ? `Tagline: ${brand.tagline}` : "",
    brand.positioning ? `Positioning: ${brand.positioning.slice(0, 280)}` : "",
    brand.tone?.length ? `Tone: ${brand.tone.join(", ")}` : "",
    `Heading font: ${fontName(brand.typography?.heading)}`,
    `Body font: ${fontName(brand.typography?.body)}`,
    `Colors: primary=${c.primary ?? "#111"}, secondary=${c.secondary ?? "#555"}, accent=${c.accent ?? "#c00"}, neutral=${c.neutral ?? "#fff"}`,
  ]
    .filter(Boolean)
    .join("\n");
}
