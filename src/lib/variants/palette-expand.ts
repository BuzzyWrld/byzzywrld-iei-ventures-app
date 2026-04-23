/**
 * Palette expansion — takes the brand's 4 role colors and produces a full
 * design-system palette: tints, shades, semantic tokens, dark-mode pair.
 * Output is a single JSON file for downstream use (Tailwind config,
 * product theming).
 */
import fs from "node:fs/promises";
import path from "node:path";
import {
  brandBrief,
  callClaude,
  parseJson,
  type BrandForVariants,
} from "./shared";

export type ExpandedPalette = {
  filename: string;
  light: Record<string, string>;
  dark: Record<string, string>;
  semantic: Record<string, string>;
};

const SYSTEM = `You are a color system designer. Given a brand's 4 role colors (primary, secondary, accent, neutral), produce a complete design-system palette with tints/shades and semantic tokens.

OUTPUT (JSON only, no prose):
{
  "light": {
    "primary-50":  "#hex",  "primary-100": "#hex",  ...up to "primary-900",
    "accent-50":   "#hex",  ...up to "accent-900",
    "neutral-50":  "#hex",  ...up to "neutral-900",
    "surface":     "#hex",
    "surface-2":   "#hex",
    "text":        "#hex",
    "text-muted":  "#hex",
    "border":      "#hex"
  },
  "dark": {
    "surface":     "#hex",
    "surface-2":   "#hex",
    "text":        "#hex",
    "text-muted":  "#hex",
    "border":      "#hex",
    "primary":     "#hex",
    "accent":      "#hex"
  },
  "semantic": {
    "success": "#hex",
    "warning": "#hex",
    "danger":  "#hex",
    "info":    "#hex"
  }
}

Rules:
- Every value is a #RRGGBB string
- Tints (50-300) are lighter, shades (600-900) darker, 500 is the base
- Dark-mode palette should work with the brand's accent as the highlight color
- Semantic colors should tonally match the brand (not generic material palette)`;

function buildUser(brand: BrandForVariants): string {
  return [
    "Expand the following brand colors into a full design-system palette. Follow the schema exactly. Return JSON only.",
    "",
    brandBrief(brand),
  ].join("\n");
}

type ModelResponse = {
  light: Record<string, string>;
  dark: Record<string, string>;
  semantic: Record<string, string>;
};

export async function generatePaletteExpansion(
  brand: BrandForVariants,
  outputDir: string
): Promise<ExpandedPalette | null> {
  let text: string | null = null;
  try {
    text = await callClaude({
      system: SYSTEM,
      user: buildUser(brand),
      maxTokens: 2500,
    });
  } catch (err) {
    console.warn(`[palette-expand] call failed:`, err instanceof Error ? err.message : err);
    return null;
  }
  if (!text) return null;

  let parsed: ModelResponse;
  try {
    parsed = parseJson<ModelResponse>(text);
  } catch (err) {
    console.warn(`[palette-expand] parse failed:`, err instanceof Error ? err.message : err);
    return null;
  }

  const filename = "palette-expanded.json";
  await fs.writeFile(
    path.join(outputDir, filename),
    JSON.stringify(parsed, null, 2)
  );
  return {
    filename,
    light: parsed.light ?? {},
    dark: parsed.dark ?? {},
    semantic: parsed.semantic ?? {},
  };
}
