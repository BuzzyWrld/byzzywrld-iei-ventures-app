/**
 * Landing page variants — 3 distinct layouts for the brand's marketing site.
 * Each is a self-contained HTML file with inline CSS and Google Fonts link.
 */
import fs from "node:fs/promises";
import path from "node:path";
import {
  brandBrief,
  callClaude,
  parseJson,
  safeSlug,
  type BrandForVariants,
} from "./shared";

export type LandingVariant = {
  key: string;
  title: string;
  rationale: string;
  filename: string;
};

const SYSTEM = `You design marketing landing pages as self-contained HTML. Each page uses inline CSS and optional Google Fonts <link> in <head>. No external JS, no images (use CSS shapes/gradients for visuals), no <img> tags, no data: URIs. Pages must be production-quality: real copy, real structure, responsive layout.

OUTPUT:
Return ONLY valid JSON, no prose, no markdown fences:
{
  "variants": [
    {
      "key": "hero-centric" | "long-scroll" | "split-screen",
      "title": "<2-3 words>",
      "rationale": "<one-sentence why this layout fits the brand>",
      "html": "<!DOCTYPE html>...</html>"
    }
  ]
}

HTML constraints:
- <!DOCTYPE html> + <html lang="en">
- One <style> block in <head>; no external stylesheets except Google Fonts
- Use brand colors + heading font via inline styles or CSS variables
- Hero + 2-3 content sections + footer with contact CTA
- Mobile responsive via simple @media (max-width: 768px) rules
- Keep each under 6000 chars — split across multiple tool calls is not allowed here`;

function buildUser(brand: BrandForVariants): string {
  return [
    "Design 3 distinct landing page layouts for this brand. Each must use a different structural approach:",
    "  1. hero-centric  — one massive hero (big H1, short subtitle, single CTA) + one section + footer. Feels product-led.",
    "  2. long-scroll   — editorial, multiple sections: hero, features, testimonial-style pull quote, offerings list, contact. Feels narrative.",
    "  3. split-screen  — hero is a 2-column split: copy left, accent-colored decorative block right. Feels premium.",
    "",
    "Copy requirements:",
    "  - Real marketing copy, not placeholder text",
    "  - Derive headline + subhead from positioning + tone",
    "  - Include 'Request access' or 'Get in touch' CTA",
    "",
    "Brand:",
    brandBrief(brand),
  ].join("\n");
}

type ModelResponse = {
  variants: Array<{
    key?: string;
    title?: string;
    rationale?: string;
    html?: string;
  }>;
};

export async function generateLandingVariants(
  brand: BrandForVariants,
  outputDir: string,
  count = 3
): Promise<LandingVariant[]> {
  let text: string | null = null;
  try {
    text = await callClaude({
      system: SYSTEM,
      user: buildUser(brand),
      maxTokens: 8000,
    });
  } catch (err) {
    console.warn(`[landing-variants] call failed:`, err instanceof Error ? err.message : err);
    return [];
  }
  if (!text) return [];

  let parsed: ModelResponse;
  try {
    parsed = parseJson<ModelResponse>(text);
  } catch (err) {
    console.warn(`[landing-variants] parse failed:`, err instanceof Error ? err.message : err);
    return [];
  }

  const dir = path.join(outputDir, "landing-variants");
  await fs.mkdir(dir, { recursive: true });

  const manifest: LandingVariant[] = [];
  for (let i = 0; i < Math.min(parsed.variants.length, count); i++) {
    const v = parsed.variants[i];
    if (!v.html || !v.html.includes("<html")) continue;
    const key = safeSlug(v.key || `option-${i + 1}`);
    const filename = `landing-variants/${key}.html`;
    await fs.writeFile(path.join(outputDir, filename), v.html);
    manifest.push({
      key,
      title: v.title || key,
      rationale: v.rationale || "",
      filename,
    });
  }
  return manifest;
}
