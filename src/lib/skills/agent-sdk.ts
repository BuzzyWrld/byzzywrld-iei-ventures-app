/**
 * Agent SDK skill adapter — runs Buzz's real brand-playbook skill via
 * @anthropic-ai/claude-agent-sdk.
 *
 * Enable by:
 *   1. `npm install @anthropic-ai/claude-agent-sdk`
 *   2. Set env:
 *        ANTHROPIC_API_KEY=sk-ant-...
 *        SKILL_ADAPTER=agent-sdk
 *        CLAUDE_MODEL=claude-haiku-4-5  (or claude-sonnet-4-6 for premium)
 *
 * Pipeline:
 *   a) Load skills/brand-playbook/SKILL.md + references/*.md as system context
 *   b) Give Claude the Write/Read/Bash tools with cwd = outputDir
 *   c) Prompt with the intake JSON — Claude writes brand.json, playbook.html,
 *      landing.html, logo.svg into outputDir following the skill procedure
 *   d) We post-process: Playwright screenshot pipeline → playbook.pdf
 *      (the presentation-pdf skill referenced in SKILL.md is claude.ai-only)
 */
import fs from "node:fs/promises";
import path from "node:path";
import type { BrandIntake } from "@/lib/types";
import { renderPdfFromHtml } from "@/lib/pdf";
import { BrandPlaybookSkill, SkillError, SkillManifest, SkillRunContext } from "./contract";

const SKILL_ROOT = path.join(process.cwd(), "skills/brand-playbook");
const REFERENCE_FILES = [
  "references/worksheets.md",
  "references/color-theory.md",
  "references/logo-theory.md",
  "references/social-sizes.md",
];

async function loadSkillSystemPrompt(): Promise<string> {
  const skillMd = await fs.readFile(path.join(SKILL_ROOT, "SKILL.md"), "utf8");
  const refs = await Promise.all(
    REFERENCE_FILES.map(async (rel) => {
      const content = await fs.readFile(path.join(SKILL_ROOT, rel), "utf8");
      return `# REFERENCE: ${rel}\n\n${content}`;
    })
  );
  return [
    "You are executing the brand-playbook skill. Below are the full SKILL.md procedure and all reference files. Follow the procedure exactly.",
    "IMPORTANT: When the skill says to load references/*.md, the content is already included below — do not try to Read those paths.",
    "IMPORTANT: The `presentation-pdf` skill referenced in SKILL.md is NOT available here. Skip that step — just write the structured HTML with 850x1100px .page divs and the host will render it to PDF separately.",
    "IMPORTANT: Write all output files to the current working directory (the host will tell you where via the prompt). Use the Write tool. Required outputs: brand.json, playbook.html, landing.html, logo.svg.",
    "---",
    skillMd,
    ...refs,
  ].join("\n\n");
}

function buildUserPrompt(intake: BrandIntake, outputDir: string): string {
  return [
    `Build a complete brand playbook for the following intake. Write all deliverables to ${outputDir}.`,
    "",
    "REQUIRED OUTPUTS (exact filenames):",
    "  brand.json     — JSON object matching the BrandJson shape",
    "  playbook.html  — multi-page HTML using 850x1100px .page divs (brand playbook)",
    "  landing.html   — single-page landing site populated with brand data",
    "  logo.svg       — primary logo mark as SVG",
    "",
    "BrandJson shape:",
    '  { name, tagline, colors: { primary, secondary, accent, neutral }, typography: { heading, body }, tone: string[], positioning }',
    "",
    "INTAKE:",
    "```json",
    JSON.stringify(intake, null, 2),
    "```",
  ].join("\n");
}

type AgentSdkDeps = {
  query: (args: {
    prompt: string;
    options: {
      systemPrompt: string;
      allowedTools: string[];
      permissionMode: "acceptEdits" | "default";
      cwd: string;
      model?: string;
    };
  }) => AsyncIterable<{ type?: string; text?: string; [k: string]: unknown }>;
};

async function loadAgentSdk(): Promise<AgentSdkDeps> {
  try {
    // Lazy import so the adapter file compiles even when the SDK isn't installed.
    // The string-concat hides the import from the TS static resolver; this is
    // intentional — install the SDK before switching SKILL_ADAPTER to agent-sdk.
    const moduleName = "@anthropic-ai/claude-agent-sdk";
    const mod = (await import(/* @vite-ignore */ moduleName)) as unknown as AgentSdkDeps;
    return mod;
  } catch (err) {
    throw new SkillError(
      "@anthropic-ai/claude-agent-sdk is not installed. Run: npm install @anthropic-ai/claude-agent-sdk",
      "SDK_NOT_INSTALLED"
    );
  }
}

export const agentSdkSkill: BrandPlaybookSkill = {
  id: "agent-sdk@1",
  async run(intake: BrandIntake, ctx: SkillRunContext): Promise<SkillManifest> {
    const { outputDir, onProgress } = ctx;

    if (!process.env.ANTHROPIC_API_KEY) {
      throw new SkillError("ANTHROPIC_API_KEY is not set", "NO_API_KEY");
    }

    await fs.mkdir(outputDir, { recursive: true });

    onProgress?.("loading skill + references", 0.05);
    const systemPrompt = await loadSkillSystemPrompt();

    onProgress?.("invoking agent sdk", 0.1);
    const { query } = await loadAgentSdk();

    const model = process.env.CLAUDE_MODEL ?? "claude-haiku-4-5";
    const userPrompt = buildUserPrompt(intake, outputDir);

    let turn = 0;
    for await (const msg of query({
      prompt: userPrompt,
      options: {
        systemPrompt,
        allowedTools: ["Write", "Read", "Bash"],
        permissionMode: "acceptEdits",
        cwd: outputDir,
        model,
      },
    })) {
      turn++;
      if (msg.text) {
        onProgress?.(msg.text.slice(0, 80), Math.min(0.1 + turn * 0.02, 0.85));
      }
    }

    // Skill writes structured HTML; we own the screenshot → PDF step.
    onProgress?.("rendering pdf", 0.9);
    const playbookHtml = path.join(outputDir, "playbook.html");
    const playbookPdf = path.join(outputDir, "playbook.pdf");
    try {
      await fs.access(playbookHtml);
    } catch {
      throw new SkillError(
        "skill did not produce playbook.html",
        "MISSING_OUTPUT"
      );
    }
    await renderPdfFromHtml(playbookHtml, playbookPdf);

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
