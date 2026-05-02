/**
 * Landing page variants — 3 distinct layouts for the brand's marketing site.
 * Each is a self-contained HTML file with inline CSS and Google Fonts link.
 *
 * Generated as 3 parallel single-variant calls so the FamFit exemplar (~47KB)
 * doesn't crowd output budget. Earlier batched single-call approach truncated
 * JSON when the model signal-matched the exemplar's verbosity.
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
import { landingExemplar } from "./exemplar";
import { pickIndustry, industryDirectionBlock } from "@/lib/industries";

export type LandingVariant = {
  key: string;
  title: string;
  rationale: string;
  filename: string;
};

type LayoutSpec = {
  key: "hero-centric" | "long-scroll" | "split-screen";
  description: string;
};

const LAYOUTS: LayoutSpec[] = [
  {
    key: "hero-centric",
    description:
      "one massive hero (big H1, short subtitle, single CTA) + one content section + footer. Feels product-led.",
  },
  {
    key: "long-scroll",
    description:
      "editorial, multiple sections: hero, features, testimonial-style pull quote, offerings list, contact. Feels narrative.",
  },
  {
    key: "split-screen",
    description:
      "hero is a 2-column split: copy left, accent-colored decorative block right. Feels premium.",
  },
];

const SYSTEM = `You design ONE marketing landing page as a single self-contained HTML file. Inline CSS and optional Google Fonts <link> in <head>. No external JS, no images, no <img> tags, no data: URIs. Use CSS shapes/gradients for any visuals.

ABSOLUTELY NO EMOJIS. No 🔗 ⚡ 📊 🧠 ✨ 🎯 🛡️ 📱 or any other emoji character anywhere — not as icons, not in headings, not inline. Use CSS-drawn geometric shapes (circles, squares, arrows, bars, brackets) or no icon at all. Emojis are the #1 tell of AI-generated design.

OUTPUT (JSON only, no prose, no markdown fences):
{
  "key": "<provided layout key>",
  "title": "<2-3 word page name>",
  "rationale": "<one sentence on why this layout fits the brand>",
  "html": "<!DOCTYPE html>...</html>"
}

HTML constraints:
- <!DOCTYPE html> + <html lang="en">
- One <style> block in <head>; no external stylesheets except Google Fonts
- Use brand colors + heading font via inline styles or CSS variables
- Mobile responsive via @media (max-width: 768px) rules
- Target ~5,000-7,000 characters of HTML. The exemplar below is for STYLE INSPIRATION ONLY — match its quality and structural sophistication, NOT its length. Our pages are intentionally tighter.`;

function buildUser(brand: BrandForVariants, layout: LayoutSpec, intake?: IntakeContext): string {
  return [
    `Design ONE landing page using the "${layout.key}" layout: ${layout.description}`,
    "",
    "Copy requirements:",
    "  - Real marketing copy, not placeholder text",
    "  - Derive headline + subhead from positioning + tone",
    "  - Include 'Request access' or 'Get in touch' CTA",
    "",
    "Brand:",
    brandBrief(brand, intake),
  ].join("\n");
}

type ModelResponse = {
  key?: string;
  title?: string;
  rationale?: string;
  html?: string;
};

async function generateOne(
  brand: BrandForVariants,
  layout: LayoutSpec,
  exemplar: string,
  industryBlock: string,
  intake?: IntakeContext
): Promise<ModelResponse | null> {
  let text: string | null = null;
  try {
    text = await callClaude({
      system: SYSTEM + exemplar + industryBlock,
      user: buildUser(brand, layout, intake),
      maxTokens: 16000,
    });
  } catch (err) {
    console.warn(
      `[landing-variants] ${layout.key} call failed:`,
      err instanceof Error ? err.message : err
    );
    return null;
  }
  if (!text) return null;

  try {
    return parseJson<ModelResponse>(text);
  } catch (err) {
    console.warn(
      `[landing-variants] ${layout.key} parse failed:`,
      err instanceof Error ? err.message : err
    );
    return null;
  }
}

export async function generateLandingVariants(
  brand: BrandForVariants,
  outputDir: string,
  count = 3,
  intake?: IntakeContext
): Promise<LandingVariant[]> {
  const exemplar = await landingExemplar();
  const industry = pickIndustry({
    industry: intake?.industry,
    productDescription: intake?.productDescription,
    notes: intake?.notes,
  });
  const industryBlock = industryDirectionBlock(industry);
  if (industry) {
    console.log(`[landing] industry match: ${industry.name}`);
  }
  const layouts = LAYOUTS.slice(0, count);

  const results = await Promise.all(
    layouts.map((l) => generateOne(brand, l, exemplar, industryBlock, intake))
  );

  const dir = path.join(outputDir, "landing-variants");
  await fs.mkdir(dir, { recursive: true });

  const manifest: LandingVariant[] = [];
  for (let i = 0; i < results.length; i++) {
    const v = results[i];
    if (!v?.html || !v.html.includes("<html")) continue;
    const key = safeSlug(v.key || layouts[i].key);
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
