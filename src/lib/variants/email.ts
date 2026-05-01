/**
 * Email kit — branded header SVG + HTML email signature block. Both
 * drop-in reusable for Gmail signatures, marketing headers, etc.
 */
import fs from "node:fs/promises";
import path from "node:path";
import {
  brandBrief,
  callClaude,
  parseJson,
  type BrandForVariants,
  type IntakeContext,
} from "./shared";

export type EmailKit = {
  headerFilename: string;   // SVG banner
  signatureFilename: string; // HTML snippet
};

const SYSTEM = `You design email brand kits. Return ONLY JSON, no prose, no fences.

Shape:
{
  "header_svg": "<svg ...>...</svg>",
  "signature_html": "<table>...</table>"
}

Required:
- header_svg: 600×120 viewBox, brand wordmark + accent detail, self-contained (no <image>, no data:)
- signature_html: inline-styled HTML TABLE (email clients ignore <style>), includes:
    - Brand mark (text-based, using heading font inline style)
    - Sender name placeholder: {{name}}, title: {{title}}, email: {{email}}
    - Accent-colored vertical divider on the left
    - Tagline muted beneath the wordmark

Both assets use brand colors + heading font.

ABSOLUTELY NO EMOJIS anywhere in the SVG or signature HTML. Typography + shapes only.`;

function buildUser(brand: BrandForVariants, intake?: IntakeContext): string {
  return [
    "Create the email header SVG and signature HTML for this brand. Return JSON only.",
    "",
    brandBrief(brand, intake),
  ].join("\n");
}

type ModelResponse = {
  header_svg?: string;
  signature_html?: string;
};

export async function generateEmailKit(
  brand: BrandForVariants,
  outputDir: string,
  intake?: IntakeContext
): Promise<EmailKit | null> {
  let text: string | null = null;
  try {
    text = await callClaude({
      system: SYSTEM,
      user: buildUser(brand, intake),
      maxTokens: 3000,
    });
  } catch (err) {
    console.warn(`[email-kit] call failed:`, err instanceof Error ? err.message : err);
    return null;
  }
  if (!text) return null;

  let parsed: ModelResponse;
  try {
    parsed = parseJson<ModelResponse>(text);
  } catch (err) {
    console.warn(`[email-kit] parse failed:`, err instanceof Error ? err.message : err);
    return null;
  }

  const dir = path.join(outputDir, "email");
  await fs.mkdir(dir, { recursive: true });

  const headerFilename = parsed.header_svg?.includes("<svg") ? "email/header.svg" : "";
  const signatureFilename = parsed.signature_html?.includes("<table") ? "email/signature.html" : "";

  if (headerFilename) {
    await fs.writeFile(path.join(outputDir, headerFilename), parsed.header_svg!);
  }
  if (signatureFilename) {
    await fs.writeFile(path.join(outputDir, signatureFilename), parsed.signature_html!);
  }
  if (!headerFilename && !signatureFilename) return null;
  return { headerFilename, signatureFilename };
}
