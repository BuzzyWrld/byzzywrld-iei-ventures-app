/**
 * Pitch one-pager — a single-page HTML brand snapshot for investors, sales
 * decks, or partnership docs. Post-processed to PDF via the Playwright
 * screenshot pipeline for pixel-perfect output.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { renderPdfFromHtml } from "@/lib/pdf";
import {
  brandBrief,
  callClaude,
  parseJson,
  type BrandForVariants,
} from "./shared";
import { pitchExemplar } from "./exemplar";

export type PitchOnePager = {
  htmlFilename: string;
  pdfFilename: string;
};

const SYSTEM = `You design one-page brand snapshots for investor decks and sales conversations. Output is a self-contained HTML file structured as ONE portrait page (850×1100px) with inline CSS.

JSON shape (return JSON only, no prose):
{
  "html": "<!DOCTYPE html>...</html>"
}

Page structure (all on one page):
  1. Header strip with brand wordmark + tagline
  2. Positioning statement (large serif pull-quote)
  3. Offerings / what we do (3-4 bullets or cards)
  4. Target audience one-liner
  5. Contact CTA at bottom

Constraints:
- Single <div class="page" style="width:850px;height:1100px"> wrapper
- Inline <style> only; optional Google Fonts <link> in <head>
- Use brand colors + heading font
- No <img>, no data: URIs, no scripts
- Dense but not cramped — real copy, not placeholder
- ABSOLUTELY NO EMOJIS anywhere in the HTML. No bullet-point emojis, no feature icons. Use plain typography, CSS-drawn shapes, or the accent color for emphasis.`;

function buildUser(brand: BrandForVariants): string {
  return [
    "Design a 1-page brand snapshot. Return JSON only.",
    "",
    brandBrief(brand),
  ].join("\n");
}

type ModelResponse = { html?: string };

export async function generatePitchOnePager(
  brand: BrandForVariants,
  outputDir: string
): Promise<PitchOnePager | null> {
  let text: string | null = null;
  try {
    const exemplar = await pitchExemplar();
    text = await callClaude({
      system: SYSTEM + exemplar,
      user: buildUser(brand),
      maxTokens: 4500,
    });
  } catch (err) {
    console.warn(`[pitch] call failed:`, err instanceof Error ? err.message : err);
    return null;
  }
  if (!text) return null;

  let parsed: ModelResponse;
  try {
    parsed = parseJson<ModelResponse>(text);
  } catch (err) {
    console.warn(`[pitch] parse failed:`, err instanceof Error ? err.message : err);
    return null;
  }
  if (!parsed.html || !parsed.html.includes("<html")) return null;

  const htmlFilename = "pitch-onepager.html";
  const pdfFilename = "pitch-onepager.pdf";
  const htmlPath = path.join(outputDir, htmlFilename);
  const pdfPath = path.join(outputDir, pdfFilename);

  await fs.writeFile(htmlPath, parsed.html);
  try {
    await renderPdfFromHtml(htmlPath, pdfPath);
  } catch (err) {
    console.warn(`[pitch] pdf render failed:`, err instanceof Error ? err.message : err);
    // Still return html-only if PDF fails.
    return { htmlFilename, pdfFilename: "" };
  }
  return { htmlFilename, pdfFilename };
}
