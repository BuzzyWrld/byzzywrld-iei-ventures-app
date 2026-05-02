/**
 * Agent SDK skill adapter — runs Buzz's real brand-playbook skill via
 * @anthropic-ai/claude-agent-sdk.
 *
 * Enable by:
 *   1. `npm install @anthropic-ai/claude-agent-sdk`
 *   2. Set env:
 *        ANTHROPIC_API_KEY=sk-ant-...
 *        SKILL_ADAPTER=agent-sdk
 *        CLAUDE_MODEL=haiku  (or sonnet / opus / full ID like claude-sonnet-4-6)
 */
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { BrandIntake } from "@/lib/types";
import { renderPdfFromHtml } from "@/lib/pdf";
import { BrandPlaybookSkill, SkillError, SkillManifest, SkillRunContext } from "./contract";
import { pickIndustry, industryDirectionBlock } from "@/lib/industries";

const SKILL_ROOT = path.join(process.cwd(), "skills/brand-playbook");
const REFERENCE_FILES = [
  "references/worksheets.md",
  "references/color-theory.md",
  "references/logo-theory.md",
  "references/social-sizes.md",
];

const VERBOSE = process.env.SKILL_DEBUG === "1";

async function loadSkillSystemPrompt(): Promise<string> {
  const skillMd = await fs.readFile(path.join(SKILL_ROOT, "SKILL.md"), "utf8");
  const refs = await Promise.all(
    REFERENCE_FILES.map(async (rel) => {
      const content = await fs.readFile(path.join(SKILL_ROOT, rel), "utf8");
      return `## REFERENCE: ${rel}\n\n${content}`;
    })
  );
  return [
    "You are executing the brand-playbook skill. Below are the full SKILL.md procedure and all reference files. Follow the procedure exactly.",
    "",
    "CRITICAL RULES:",
    "1. Write ALL output files using the Write tool into the current working directory. Do not ask permission.",
    "2. Required files (exact names): brand.json, playbook.html, landing.html, logo.svg.",
    "3. The `presentation-pdf` skill referenced in SKILL.md Step 5 is NOT available here. SKIP that step. Just write structured playbook.html with 850×1100px .page divs — the host renders it to PDF afterward.",
    "4. Reference files (worksheets, color-theory, logo-theory, social-sizes) are inlined below. Do not Read them.",
    "5. Do not ask clarifying questions. Use the Pure Creation mode if information is missing.",
    "6. ABSOLUTELY NO EMOJIS ANYWHERE in landing.html, playbook.html, logo.svg, or brand.json. No 🔗 ⚡ 📊 🧠 ✨ 🎯 🛡️ 📱 or any emoji character. Use CSS-drawn shapes (rect/circle/path/border) or typography only for icons/accents. Emojis are the #1 tell of AI-generated design.",
    "",
    "---",
    "",
    skillMd,
    ...refs,
  ].join("\n\n");
}

function buildUserPrompt(intake: BrandIntake, outputDir: string): string {
  // If the user picked a palette from our 4-option step, palettePreference
  // carries hex codes like "Plenum — #1a1f1a, #263e0f, #a8b098, #f2f0e9".
  // When that's the case, instruct Claude to honor the pick exactly. This
  // overrides SKILL.md's "audience > aesthetic preference" rule for the
  // specific case where the user made an explicit deliberate choice.
  const hexMatches = intake.palettePreference.match(
    /#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})/gi
  );
  const userPickedPalette = (hexMatches?.length ?? 0) >= 4;
  // Industry direction (curated by IEI team) — feeds the main skill so
  // landing.html and playbook reflect industry-appropriate aesthetics
  // from the FIRST output, not just the variants.
  const industry = pickIndustry({
    industry: intake.industry,
    productDescription: intake.productDescription,
    notes: intake.notes,
  });
  const industryBlock = industryDirectionBlock(industry);

  return [
    "FRESH-CONTEXT GUARD: build for the brand in the intake below ONLY. The system prompt mentions",
    "other brands by name (Aurelian Labs, Pen2Purpose, AceTV, FamFit, Wone, Banger, OffScript, Vent,",
    "DOL, Halcyon, IEI, Ideas Equal Income, etc.) — those are STRUCTURAL EXAMPLES. Never copy their",
    "names or copy. If your output contains any of those brand names, that is a critical defect.",
    "",
    `Build a complete brand playbook NOW using the Write tool. The working directory is already set to:`,
    `  ${outputDir}`,
    "",
    "Write these four files (paths are relative to cwd):",
    "  brand.json     — JSON with ALL fields below populated:",
    "                   { name, tagline, positioning,",
    "                     tone: string[],",
    "                     colors: { primary, secondary, accent, neutral } (each a #hex),",
    "                     typography: { heading, body } (each a font name string),",
    "                     mission (1 sentence), vision (1 sentence),",
    "                     values: string[] (3-5 short phrases),",
    "                     brandStory (2-4 sentences — use intake.notes verbatim if personal),",
    "                     voice: { say: string[], dont: string[] } (4-6 each — on-voice and anti-voice phrases),",
    "                     ica (1 paragraph: ideal customer as a named human, their pains, their desires) }",
    "                   The mission/vision/values/brandStory/voice/ica are REQUIRED and substantive. They are the soul of the brand — every downstream output reads them.",
    "  playbook.html  — multi-page HTML with 850×1100px .page divs (per SKILL Step 3)",
    "  landing.html   — single-page landing site populated with brand data",
    "  logo.svg       — primary logo mark as SVG",
    "",
    userPickedPalette
      ? "PALETTE OVERRIDE: the user has explicitly chosen a palette. The hex codes below are non-negotiable — use them as primary/secondary/accent/neutral in that order, even if audience/industry analysis would suggest otherwise. This overrides SKILL.md's 'audience > aesthetic preference' hierarchy rule."
      : "",
    industryBlock,
    "Intake:",
    "```json",
    JSON.stringify(intake, null, 2),
    "```",
    "",
    "Start by calling the Write tool. Do not output any text before the first tool call.",
  ]
    .filter(Boolean)
    .join("\n");
}

type SdkMessage = {
  type: string;
  subtype?: string;
  message?: { content?: Array<{ type: string; name?: string; input?: unknown; text?: string }> };
  result?: string;
  is_error?: boolean;
  total_cost_usd?: number;
  num_turns?: number;
  duration_ms?: number;
  errors?: string[];
  permission_denials?: Array<{ tool_name: string; tool_input: unknown }>;
  error?: string;
  stop_reason?: string | null;
};

type AgentSdkDeps = {
  query: (args: {
    prompt: string;
    options: Record<string, unknown>;
  }) => AsyncIterable<SdkMessage>;
};

async function loadAgentSdk(): Promise<AgentSdkDeps> {
  try {
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

    // Claude sometimes mistypes non-ASCII path characters (e.g. curly quotes in
    // folder names) and writes files to an adjacent wrong path. To eliminate
    // this, we run the skill in an ASCII-only temp dir and move files afterward.
    const workDir = path.join(os.tmpdir(), `iei-skill-${randomUUID().slice(0, 8)}`);
    await fs.mkdir(workDir, { recursive: true });

    onProgress?.("loading skill + references", 0.05);
    const systemPrompt = await loadSkillSystemPrompt();
    if (VERBOSE) console.log(`[agent-sdk] system prompt length: ${systemPrompt.length} chars`);

    onProgress?.("invoking agent sdk", 0.1);
    const { query } = await loadAgentSdk();

    const model = process.env.CLAUDE_MODEL ?? "haiku";
    const userPrompt = buildUserPrompt(intake, workDir);

    if (VERBOSE) console.log(`[agent-sdk] model=${model} workDir=${workDir}`);

    const stream = query({
      prompt: userPrompt,
      options: {
        systemPrompt,
        model,
        cwd: workDir,
        permissionMode: "bypassPermissions",
        dangerouslySkipPermissions: true,
        allowedTools: ["Write", "Read", "Edit", "Bash"],
      },
    });

    let assistantTurns = 0;
    let toolCalls = 0;
    let result: SdkMessage | null = null;

    for await (const msg of stream) {
      if (VERBOSE) console.log(`[agent-sdk] ${msg.type}${msg.subtype ? `/${msg.subtype}` : ""}`);

      if (msg.type === "assistant") {
        assistantTurns++;
        for (const block of msg.message?.content ?? []) {
          if (block.type === "tool_use") {
            toolCalls++;
            onProgress?.(
              `tool: ${block.name}`,
              Math.min(0.1 + toolCalls * 0.08, 0.85)
            );
            if (VERBOSE) {
              const input = block.input as { file_path?: string; command?: string } | undefined;
              const detail = input?.file_path ?? input?.command?.slice(0, 60) ?? "";
              console.log(`[agent-sdk]   → tool_use: ${block.name} ${detail}`);
            }
          } else if (block.type === "tool_result" && VERBOSE) {
            const r = block as unknown as { content?: string; is_error?: boolean };
            console.log(`[agent-sdk]   ← tool_result${r.is_error ? " ERROR" : ""}: ${String(r.content ?? "").slice(0, 120)}`);
          } else if (block.type === "text" && block.text) {
            onProgress?.(block.text.slice(0, 80), Math.min(0.1 + assistantTurns * 0.03, 0.85));
          }
        }
      } else if (msg.type === "user" && VERBOSE) {
        for (const block of msg.message?.content ?? []) {
          if (block.type === "tool_result") {
            const r = block as unknown as { content?: unknown; is_error?: boolean };
            const content =
              typeof r.content === "string"
                ? r.content
                : Array.isArray(r.content)
                ? (r.content as Array<{ text?: string }>).map((c) => c.text ?? "").join(" ")
                : JSON.stringify(r.content);
            console.log(
              `[agent-sdk]   ← tool_result${r.is_error ? " ERROR" : ""}: ${content.slice(0, 200)}`
            );
          }
        }
      } else if (msg.type === "result") {
        result = msg;
      }
    }

    if (VERBOSE && result) {
      console.log(
        `[agent-sdk] result: subtype=${result.subtype} turns=${result.num_turns} cost=$${result.total_cost_usd?.toFixed(3)} duration=${result.duration_ms}ms`
      );
      if (result.permission_denials?.length) {
        console.log(`[agent-sdk] permission_denials:`, result.permission_denials);
      }
      if (result.errors?.length) {
        console.log(`[agent-sdk] errors:`, result.errors);
      }
    }

    if (result?.is_error || result?.subtype !== "success") {
      const hint = result?.errors?.join("; ") ?? result?.result ?? result?.error;
      throw new SkillError(
        `skill run failed (${result?.subtype ?? "unknown"}): ${hint ?? "no details"}`,
        "RUN_FAILED"
      );
    }

    // Move files from the ASCII workDir to the real outputDir.
    onProgress?.("collecting outputs", 0.88);
    const produced = await fs.readdir(workDir);
    if (VERBOSE) console.log(`[agent-sdk] workDir produced: [${produced.join(", ")}]`);
    for (const name of produced) {
      await fs.rename(path.join(workDir, name), path.join(outputDir, name)).catch(async (err) => {
        // Cross-device rename fails — fall back to copy+delete.
        if ((err as NodeJS.ErrnoException).code === "EXDEV") {
          await fs.copyFile(path.join(workDir, name), path.join(outputDir, name));
          await fs.unlink(path.join(workDir, name));
        } else {
          throw err;
        }
      });
    }
    await fs.rm(workDir, { recursive: true, force: true });

    // Skill writes structured HTML; we own the screenshot → PDF step.
    onProgress?.("rendering pdf", 0.9);
    const playbookHtml = path.join(outputDir, "playbook.html");
    const playbookPdf = path.join(outputDir, "playbook.pdf");
    try {
      await fs.access(playbookHtml);
    } catch {
      const contents = await fs.readdir(outputDir).catch(() => []);
      throw new SkillError(
        `skill did not produce playbook.html. contents=[${contents.join(", ")}] assistantTurns=${assistantTurns} toolCalls=${toolCalls}`,
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
