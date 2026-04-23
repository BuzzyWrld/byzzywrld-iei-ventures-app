/**
 * Stub skill implementation — placeholder until Buzz hands off the real one.
 * Emits brand.json, playbook.html, playbook.pdf (minimal), landing.html, logo.svg.
 */
import fs from "node:fs";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { BrandIntake, BrandJson } from "@/lib/types";
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
  return `<!doctype html><html><head><meta charset="utf-8"/><title>${b.name} — Brand Playbook</title></head>
<body style="font-family:${b.typography.body};margin:0;background:${b.colors.neutral}">
<div style="max-width:820px;margin:0 auto;padding:64px 48px">
  <h1 style="font-size:48px;margin:0 0 8px;color:${b.colors.primary}">${b.name}</h1>
  <div style="color:#555;font-size:18px">${b.tagline}</div>
  <h2 style="margin-top:48px;color:${b.colors.primary}">Positioning</h2><p>${b.positioning}</p>
  <h2 style="color:${b.colors.primary}">Colors</h2>
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px">
    ${[b.colors.primary, b.colors.secondary, b.colors.accent, b.colors.neutral]
      .map((c) => `<div style="aspect-ratio:1;border-radius:12px;background:${c};padding:12px;color:#fff;font-family:monospace;font-size:13px;display:flex;align-items:flex-end">${c}</div>`)
      .join("")}
  </div>
  <h2 style="color:${b.colors.primary}">Tone</h2>
  <div>${b.tone.map((t) => `<span style="display:inline-block;padding:6px 12px;border-radius:999px;background:#fff;border:1px solid #e5e7eb;margin:4px 6px 0 0">${t}</span>`).join("")}</div>
  <h2 style="color:${b.colors.primary}">Intake</h2>
  <pre style="background:#fff;padding:16px;border-radius:8px">${JSON.stringify(intake, null, 2)}</pre>
</div></body></html>`;
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

async function renderPlaybookPdf(b: BrandJson, intake: BrandIntake): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const body = await doc.embedFont(StandardFonts.Helvetica);

  const hex = (h: string) => {
    const m = h.replace("#", "");
    return rgb(
      parseInt(m.slice(0, 2), 16) / 255,
      parseInt(m.slice(2, 4), 16) / 255,
      parseInt(m.slice(4, 6), 16) / 255
    );
  };

  page.drawRectangle({ x: 0, y: 732, width: 612, height: 60, color: hex(b.colors.primary) });
  page.drawText(b.name, { x: 48, y: 752, size: 28, font, color: rgb(1, 1, 1) });
  page.drawText(b.tagline, { x: 48, y: 700, size: 12, font: body, color: hex("#555555") });
  page.drawText("Positioning", { x: 48, y: 660, size: 16, font, color: hex(b.colors.primary) });
  page.drawText(b.positioning, { x: 48, y: 640, size: 11, font: body, color: rgb(0.1, 0.1, 0.1), maxWidth: 516 });
  page.drawText("Colors", { x: 48, y: 580, size: 16, font, color: hex(b.colors.primary) });

  const swatches = [b.colors.primary, b.colors.secondary, b.colors.accent, b.colors.neutral];
  swatches.forEach((c, i) => {
    page.drawRectangle({ x: 48 + i * 120, y: 490, width: 100, height: 70, color: hex(c) });
    page.drawText(c, { x: 48 + i * 120, y: 470, size: 9, font: body, color: rgb(0.3, 0.3, 0.3) });
  });

  page.drawText("Tone of Voice", { x: 48, y: 430, size: 16, font, color: hex(b.colors.primary) });
  page.drawText(b.tone.join(" · "), { x: 48, y: 410, size: 11, font: body, color: rgb(0.1, 0.1, 0.1) });

  page.drawText("Industry", { x: 48, y: 360, size: 11, font, color: hex("#666666") });
  page.drawText(intake.industry, { x: 48, y: 344, size: 11, font: body, color: rgb(0.1, 0.1, 0.1) });
  page.drawText("Target Audience", { x: 48, y: 320, size: 11, font, color: hex("#666666") });
  page.drawText(intake.targetAudience, { x: 48, y: 304, size: 11, font: body, color: rgb(0.1, 0.1, 0.1) });

  page.drawText(
    "STUB — replaced by Buzz's Playwright+PIL pipeline (brief slide 05)",
    { x: 48, y: 40, size: 9, font: body, color: hex("#9ca3af") }
  );

  return await doc.save();
}

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
    const pdfBytes = await renderPlaybookPdf(brand, intake);
    fs.writeFileSync(path.join(outputDir, "playbook.pdf"), pdfBytes);

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
