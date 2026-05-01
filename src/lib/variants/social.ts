/**
 * Social media kit — branded SVGs at the standard dimensions for each
 * platform. All self-contained, all use the brand's palette + fonts.
 *
 * Output: outputs/<id>/social/{instagram-post,linkedin-cover,x-header,avatar}.svg
 */
import fs from "node:fs/promises";
import path from "node:path";
import {
  brandBrief,
  callClaude,
  parseJson,
  safeSlug,
  type BrandForVariants,
  type IntakeContext,
} from "./shared";

export type SocialAsset = {
  key: string;
  title: string;
  platform: string;
  size: string;
  filename: string;
};

const SYSTEM = `You design social media brand assets as self-contained SVGs. Output ONLY valid JSON — no prose, no markdown fences.

Required JSON shape:
{
  "assets": [
    {
      "key": "instagram-post"  | "linkedin-cover" | "x-header" | "avatar",
      "title": "<2-3 word name>",
      "svg": "<svg xmlns='...'>...</svg>"
    }
  ]
}

Required assets (exact keys, exact viewBoxes):
  instagram-post    1080×1080   template post: brand name + short pull-quote + accent detail
  linkedin-cover    1584×396    banner: brand mark left, tagline right, accent shapes
  x-header          1500×500    banner: minimal, logo-centric, lots of negative space
  avatar            400×400     circular / square profile mark using brand initial(s)

SVG rules:
- xmlns="http://www.w3.org/2000/svg" required
- viewBox sized to the platform dimensions
- Use ONLY the brand's colors (primary, secondary, accent, neutral)
- Typography uses the brand's heading font via inline font-family
- No <image>, no data: URIs, no external refs
- Design should feel like a cohesive system — same accent detail language across all 4 assets
- Avoid generic geometric abstraction; tie visuals to the brand's tone
- ABSOLUTELY NO EMOJIS. No emoji characters anywhere in the SVG text. Use only the brand's own typography + shapes drawn with SVG primitives (rect, circle, path).`;

function buildUser(brand: BrandForVariants, intake?: IntakeContext): string {
  return [
    "Design the 4 social assets below for this brand. Return JSON only.",
    "",
    brandBrief(brand, intake),
  ].join("\n");
}

type ModelResponse = {
  assets: Array<{
    key?: string;
    title?: string;
    svg?: string;
  }>;
};

const DIMS: Record<string, { size: string; platform: string }> = {
  "instagram-post": { size: "1080×1080", platform: "Instagram" },
  "linkedin-cover": { size: "1584×396", platform: "LinkedIn" },
  "x-header": { size: "1500×500", platform: "X / Twitter" },
  avatar: { size: "400×400", platform: "Profile" },
};

export async function generateSocialKit(
  brand: BrandForVariants,
  outputDir: string,
  intake?: IntakeContext
): Promise<SocialAsset[]> {
  let text: string | null = null;
  try {
    text = await callClaude({
      system: SYSTEM,
      user: buildUser(brand, intake),
      maxTokens: 12000,
    });
  } catch (err) {
    console.warn(`[social-kit] call failed:`, err instanceof Error ? err.message : err);
    return [];
  }
  if (!text) return [];

  let parsed: ModelResponse;
  try {
    parsed = parseJson<ModelResponse>(text);
  } catch (err) {
    console.warn(`[social-kit] parse failed:`, err instanceof Error ? err.message : err);
    return [];
  }

  const dir = path.join(outputDir, "social");
  await fs.mkdir(dir, { recursive: true });

  const manifest: SocialAsset[] = [];
  for (const a of parsed.assets ?? []) {
    if (!a.svg || !a.svg.includes("<svg")) continue;
    const key = safeSlug(a.key || "asset");
    const meta = DIMS[key] ?? { size: "—", platform: "Social" };
    const filename = `social/${key}.svg`;
    await fs.writeFile(path.join(outputDir, filename), a.svg);
    manifest.push({
      key,
      title: a.title || key,
      platform: meta.platform,
      size: meta.size,
      filename,
    });
  }
  return manifest;
}
