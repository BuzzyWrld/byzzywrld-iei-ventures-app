/**
 * Developer Brief — a structured handoff document for whoever builds the
 * actual website (the agency, the client's dev, or our own team). Bridges
 * "AI made a brand kit" → "now build the site."
 *
 * Output: dev-brief.html (multi-page 850×1100px) + dev-brief.pdf via the
 * Playwright screenshot pipeline. Same rendering pattern as the playbook.
 *
 * Sections (mandatory):
 *   1. Brand identity summary (name, tagline, mission, voice, ICA)
 *   2. Color tokens — hex + CSS variable names + usage rules + 60/30/10
 *   3. Typography — Google Fonts links, weights, type scale, pairing rules
 *   4. Component specs — buttons, cards, forms, nav, hero
 *   5. Site map + navigation structure
 *   6. Content sources — what copy goes where
 *   7. Imagery direction — photography style, do/don't list
 *   8. Tech notes — recommended stack, accessibility minima, performance targets
 *   9. Asset manifest — links to logo SVG, social kit, palette JSON
 */
import fs from "node:fs/promises";
import path from "node:path";
import { renderPdfFromHtml } from "@/lib/pdf";
import {
  brandBrief,
  callClaude,
  parseJson,
  type BrandForVariants,
  type IntakeContext,
} from "./shared";

export type DevBrief = {
  htmlFilename: string;
  pdfFilename: string;
};

const SYSTEM = `You produce **Developer Briefs** — the document a website developer reads to actually build a brand's site. The reader is an engineer or agency, not the brand owner. Tone: precise, structural, no marketing fluff.

Output structure: a multi-page HTML document with 850×1100px portrait pages (\`<div class="page" style="width:850px;height:1100px">\`), inline <style> in <head>. Each page is one logical section.

JSON shape (return JSON only, no prose, no markdown fences):
{
  "html": "<!DOCTYPE html>...</html>"
}

Required sections (each on its own .page div, ~6–9 pages total):

  PAGE 1 — Cover
    Brand name, tagline, "Developer Brief", date placeholder, version "v1.0".
    Use the brand's primary color as the dominant page color.

  PAGE 2 — Brand at a Glance
    A single-page summary card: name, tagline, mission (1 sentence), voice (3 adjectives),
    ICA (one-sentence description), positioning. Dense but scannable.

  PAGE 3 — Color Tokens
    Render every brand color as a real CSS chip with:
      - swatch (a real colored block)
      - color name (e.g. "Primary")
      - hex code
      - suggested CSS variable name (e.g. \`--color-primary\`)
      - usage rule (e.g. "Headers, primary CTAs, brand surfaces")
    Below the chips, show the 60/30/10 weight rule explicitly with a tiny example layout.
    Include a "do not use" line if applicable (e.g. "Never pure white on dark — use neutral").

  PAGE 4 — Typography
    For each font (heading, body):
      - The Google Fonts <link href> tag the dev needs to paste in
      - Weight inventory (e.g. "400, 600, 700")
      - The type scale: H1, H2, H3, body, small, caption — with px sizes and line-heights
      - One pairing rule (e.g. "Heading sentence-case; body uses 1.6 line-height")
    Render at least one "specimen" — show the font at its actual rendered size in the brief itself.

  PAGE 5 — Component Specs
    A table-style page covering: buttons (primary, secondary, ghost), cards, form inputs,
    nav, hero. For each component: dimensions, padding, border-radius, hover state, focus state.
    Don't show CSS code — show the prose spec. The dev writes the CSS.

  PAGE 6 — Site Map + Navigation
    A simple list/tree of pages this site should have (Home, About, Services/Products, Contact, etc.),
    based on the brand's offerings. For each page: a one-sentence purpose + the primary CTA.
    Note global nav structure (sticky? hamburger threshold? footer columns?).

  PAGE 7 — Content & Voice
    Per-page content notes: which copy from the brand playbook goes where. Hero headline source
    (use the brand's tagline verbatim where it fits), feature section source, footer copy source.
    Voice section: if the brand brief includes "On-voice phrases" and "Anti-voice" arrays, use
    those VERBATIM as the DO SAY / DO NOT SAY examples — do not paraphrase or invent. Only invent
    if the brand brief has no voice arrays. Tone guardrails should reference the brand's actual
    archetype + tone words from the brief, not generic guidance.

  PAGE 8 — Imagery & Visual Language
    Photography direction (style, mood, what to AVOID — no stock-photo-smiles, no generic
    handshake-business shots, etc.). Iconography style (line, filled, custom). Pattern/texture usage.

  PAGE 9 — Tech Notes & Asset Manifest
    Recommended stack (e.g. "Next.js or static site is fine; CMS optional for blogs").
    Accessibility minima (WCAG 2.1 AA, contrast targets, keyboard-nav coverage).
    Performance targets (LCP < 2.5s, image optimization, font preloading).
    Asset list: "logo.svg", "social-kit/", "palette.json" with one-line description each
    (the dev grabs these from the brand kit zip).

CRITICAL:
- ABSOLUTELY NO EMOJIS anywhere. No 🔗 ⚡ 📊 or any emoji character. Use CSS shapes if you need icons.
- Real CSS chips for colors — never describe colors in prose alone. Show real swatches.
- The brief must look like the brand — use the brand colors and heading font as the brief's own design system, so the dev sees the brand applied.
- Dense but scannable — each page should fit comfortably without overflow.`;

function buildUser(brand: BrandForVariants, intake?: IntakeContext): string {
  return [
    "Build a complete Developer Brief for the brand below. Return JSON only.",
    "",
    "Brand:",
    brandBrief(brand, intake),
  ].join("\n");
}

type ModelResponse = { html?: string };

export async function generateDevBrief(
  brand: BrandForVariants,
  outputDir: string,
  intake?: IntakeContext
): Promise<DevBrief | null> {
  let text: string | null = null;
  try {
    text = await callClaude({
      system: SYSTEM,
      user: buildUser(brand, intake),
      maxTokens: 20000,
    });
  } catch (err) {
    console.warn(`[dev-brief] call failed:`, err instanceof Error ? err.message : err);
    return null;
  }
  if (!text) return null;

  let parsed: ModelResponse;
  try {
    parsed = parseJson<ModelResponse>(text);
  } catch (err) {
    console.warn(`[dev-brief] parse failed:`, err instanceof Error ? err.message : err);
    return null;
  }
  if (!parsed.html || !parsed.html.includes("<html")) return null;

  const htmlFilename = "dev-brief.html";
  const pdfFilename = "dev-brief.pdf";
  const htmlPath = path.join(outputDir, htmlFilename);
  const pdfPath = path.join(outputDir, pdfFilename);

  await fs.writeFile(htmlPath, parsed.html);
  try {
    await renderPdfFromHtml(htmlPath, pdfPath);
  } catch (err) {
    console.warn(`[dev-brief] pdf render failed:`, err instanceof Error ? err.message : err);
    return { htmlFilename, pdfFilename: "" };
  }
  return { htmlFilename, pdfFilename };
}
