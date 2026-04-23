/**
 * Stub skill implementation — placeholder until Buzz hands off the real one.
 * Emits brand.json, playbook.html, playbook.pdf (minimal), landing.html, logo.svg.
 */
import fs from "node:fs";
import path from "node:path";
import type { BrandIntake, BrandJson } from "@/lib/types";
import { renderPdfFromHtml } from "@/lib/pdf";
import type {
  BrandPlaybookSkill,
  SkillManifest,
  SkillRunContext,
} from "./contract";

const PALETTE_BY_ARCHETYPE: Record<string, BrandJson["colors"]> = {
  hero: { primary: "#0F172A", secondary: "#DC2626", accent: "#F59E0B", neutral: "#F8FAFC" },
  sage: { primary: "#1E3A8A", secondary: "#0EA5E9", accent: "#CBD5E1", neutral: "#F9FAFB" },
  creator: { primary: "#7C3AED", secondary: "#EC4899", accent: "#FBBF24", neutral: "#FAFAFA" },
  caregiver: { primary: "#065F46", secondary: "#D97706", accent: "#FDE68A", neutral: "#FFFBEB" },
  default: { primary: "#111827", secondary: "#2563EB", accent: "#F97316", neutral: "#F3F4F6" },
};

function synthesizeBrand(intake: BrandIntake): BrandJson {
  const key = (intake.archetype || "").toLowerCase() as keyof typeof PALETTE_BY_ARCHETYPE;
  const colors = PALETTE_BY_ARCHETYPE[key] ?? PALETTE_BY_ARCHETYPE.default;
  return {
    name: intake.companyName,
    tagline: `Brand direction for ${intake.companyName} — ${intake.industry}`,
    colors,
    typography: { heading: "Geist, Inter, sans-serif", body: "Geist, Inter, sans-serif" },
    tone: intake.toneOfVoice.split(",").map((s) => s.trim()).filter(Boolean),
    positioning: `${intake.companyName} serves ${intake.targetAudience} in ${intake.industry}.`,
  };
}

function renderPlaybookHtml(b: BrandJson, intake: BrandIntake): string {
  // Multi-page structure per SKILL.md Step 3: 850×1100px .page divs.
  // Real skill produces 18–28 pages; stub emits 3 so the pipeline is exercised.
  const page = (content: string) =>
    `<div class="page">${content}</div>`;
  const swatches = [b.colors.primary, b.colors.secondary, b.colors.accent, b.colors.neutral];
  return `<!doctype html><html><head><meta charset="utf-8"/><title>${b.name} — Brand Playbook</title>
<style>
  :root {
    --primary: ${b.colors.primary};
    --secondary: ${b.colors.secondary};
    --accent: ${b.colors.accent};
    --neutral: ${b.colors.neutral};
    --font-body: ${b.typography.body};
  }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: var(--font-body); color: #0b0b0b; background: #eee; }
  .page { width: 850px; height: 1100px; background: var(--neutral); padding: 64px 56px; page-break-after: always; position: relative; overflow: hidden; }
  .page + .page { margin-top: 24px; }
  .eyebrow { font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase; color: var(--primary); opacity: 0.7; }
  h1.display { font-size: 72px; margin: 16px 0 12px; color: var(--primary); letter-spacing: -0.02em; line-height: 1.0; }
  h2 { font-size: 28px; margin: 32px 0 12px; color: var(--primary); letter-spacing: -0.01em; }
  .tagline { font-size: 20px; color: #555; max-width: 520px; }
  .swatches { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 12px; }
  .sw { aspect-ratio: 3/4; border-radius: 14px; padding: 16px; color: #fff; font-family: monospace; font-size: 12px; display: flex; align-items: flex-end; }
  .sw.light { color: #111; border: 1px solid #e5e7eb; }
  .pill { display: inline-block; padding: 7px 14px; border-radius: 999px; background: #fff; border: 1px solid #e5e7eb; margin: 6px 6px 0 0; font-size: 14px; }
  .kv { display: grid; grid-template-columns: 180px 1fr; gap: 14px 20px; margin-top: 12px; }
  .kv dt { color: #666; font-size: 13px; }
  .kv dd { margin: 0; font-size: 15px; }
  .footer { position: absolute; bottom: 28px; left: 56px; right: 56px; display: flex; justify-content: space-between; color: #aaa; font-size: 11px; }
</style></head>
<body>

${page(`
  <div class="eyebrow">Brand Playbook · v1.0 · 2026</div>
  <h1 class="display">${b.name}</h1>
  <div class="tagline">${b.tagline}</div>
  <div class="footer"><span>Confidential</span><span>Page 1</span></div>
`)}

${page(`
  <div class="eyebrow">01 · Positioning</div>
  <h2>Positioning</h2>
  <p style="font-size:17px;line-height:1.6;max-width:640px">${b.positioning}</p>

  <h2 style="margin-top:56px">Tone of Voice</h2>
  <div>${b.tone.map((t) => `<span class="pill">${t}</span>`).join("")}</div>

  <h2 style="margin-top:56px">Intake Summary</h2>
  <dl class="kv">
    <dt>Industry</dt><dd>${intake.industry}</dd>
    <dt>Target Audience</dt><dd>${intake.targetAudience}</dd>
    <dt>Competitors</dt><dd>${intake.competitors || "—"}</dd>
    <dt>Archetype</dt><dd>${intake.archetype || "—"}</dd>
    <dt>Notes</dt><dd>${intake.notes || "—"}</dd>
  </dl>
  <div class="footer"><span>${b.name}</span><span>Page 2</span></div>
`)}

${page(`
  <div class="eyebrow">02 · Brand Kit</div>
  <h2>Color System</h2>
  <div class="swatches">
    ${swatches
      .map((c, i) => {
        const labels = ["Primary", "Secondary", "Accent", "Neutral"];
        const light = i === 3;
        return `<div class="sw ${light ? "light" : ""}" style="background:${c}"><div><div style="opacity:.8">${labels[i]}</div>${c}</div></div>`;
      })
      .join("")}
  </div>

  <h2 style="margin-top:48px">Typography</h2>
  <dl class="kv">
    <dt>Heading</dt><dd style="font-family:${b.typography.heading};font-size:28px">${b.typography.heading}</dd>
    <dt>Body</dt><dd style="font-family:${b.typography.body};font-size:16px">${b.typography.body}</dd>
  </dl>
  <div class="footer"><span>${b.name}</span><span>Page 3</span></div>
`)}

</body></html>`;
}

function renderLandingHtml(b: BrandJson): string {
  return `<!doctype html><html><head><meta charset="utf-8"/><title>${b.name}</title></head>
<body style="margin:0;font-family:${b.typography.body};color:#0b0b0b;background:${b.colors.neutral}">
  <section style="min-height:70vh;display:flex;flex-direction:column;justify-content:center;padding:80px 40px;background:linear-gradient(135deg,${b.colors.primary},${b.colors.secondary});color:#fff">
    <h1 style="font-size:64px;margin:0 0 16px">${b.name}</h1>
    <p style="font-size:22px;opacity:.9;max-width:640px">${b.tagline}</p>
    <a href="#contact" style="display:inline-block;margin-top:32px;padding:16px 28px;background:${b.colors.accent};color:#111;border-radius:999px;text-decoration:none;font-weight:600;width:max-content">Get in touch</a>
  </section>
  <section style="max-width:960px;margin:0 auto;padding:80px 40px">
    <h2 style="color:${b.colors.primary};font-size:32px">What we do</h2>
    <p>${b.positioning}</p>
  </section>
</body></html>`;
}

function renderLogoSvg(b: BrandJson): string {
  const initials =
    b.name.split(/\s+/).map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() ||
    "IV";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <rect width="200" height="200" rx="32" fill="${b.colors.primary}"/>
  <text x="100" y="118" text-anchor="middle" font-family="Geist, Inter, sans-serif" font-weight="700" font-size="72" fill="${b.colors.accent}">${initials}</text>
</svg>`;
}

// PDF rendering moved to @/lib/pdf (screenshot-based Playwright pipeline
// per brief slide 05). Both stub and agent-sdk adapters use the same pipeline.

export const stubSkill: BrandPlaybookSkill = {
  id: "stub@0.1",
  async run(intake, ctx: SkillRunContext): Promise<SkillManifest> {
    const { outputDir, onProgress } = ctx;
    fs.mkdirSync(outputDir, { recursive: true });

    onProgress?.("synthesizing brand", 0.1);
    const brand = synthesizeBrand(intake);

    onProgress?.("writing brand json", 0.3);
    fs.writeFileSync(path.join(outputDir, "brand.json"), JSON.stringify(brand, null, 2));

    onProgress?.("rendering playbook html", 0.45);
    fs.writeFileSync(path.join(outputDir, "playbook.html"), renderPlaybookHtml(brand, intake));

    onProgress?.("rendering landing page", 0.6);
    fs.writeFileSync(path.join(outputDir, "landing.html"), renderLandingHtml(brand));

    onProgress?.("generating logo", 0.75);
    fs.writeFileSync(path.join(outputDir, "logo.svg"), renderLogoSvg(brand));

    onProgress?.("rendering pdf", 0.9);
    await renderPdfFromHtml(
      path.join(outputDir, "playbook.html"),
      path.join(outputDir, "playbook.pdf")
    );

    onProgress?.("complete", 1);
    return {
      brandJson: "brand.json",
      playbookHtml: "playbook.html",
      playbookPdf: "playbook.pdf",
      landingHtml: "landing.html",
      logoSvg: "logo.svg",
    };
  },
};
