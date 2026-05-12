/**
 * Content Engine skill adapter — direct Anthropic SDK implementation.
 *
 * Runs the IEI 4-week content calendar generation as 5 sequential passes.
 * Each pass calls Claude via @anthropic-ai/sdk with a Write/Read tool loop,
 * writing output files to a temp working directory.
 *
 * This approach avoids the @anthropic-ai/claude-agent-sdk binary dependency
 * (240 MB per platform), which exceeds Vercel's 250 MB Lambda limit.
 *
 * Pass 1  — market analysis + hook selections → run-state.json
 * Pass 2  — Week 1: 7 days × 3 assets
 * Pass 3  — Week 2 (reads Week 1 as benchmark)
 * Pass 4  — Week 3 (reads Weeks 1–2 as benchmark)
 * Pass 5  — Week 4 + master calendar assembly
 *
 * Required env:
 *   ANTHROPIC_API_KEY=sk-ant-...
 *   CLAUDE_MODEL=claude-sonnet-4-6   (haiku is too weak for 84-asset generation)
 */

import Anthropic from "@anthropic-ai/sdk";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import {
  ContentEngineSkill,
  ContentEngineError,
  ContentRunIntake,
  ContentSkillRunContext,
  WeekPassResult,
  ContentEngineResult,
} from "./content-engine-contract";

const SKILL_ROOT = path.join(process.cwd(), "skills/content-engine");
const REFERENCE_FILES = [
  "references/brand-context.md",
  "references/tone-guard.md",
  "references/7-day-matrix.md",
  "references/asset-formats.md",
  "references/hook-library.md",
];

const VERBOSE = process.env.SKILL_DEBUG === "1";

// ─── System prompt ─────────────────────────────────────────────────────────

async function loadSystemPrompt(): Promise<string> {
  const skillMd = await fs.readFile(path.join(SKILL_ROOT, "SKILL.md"), "utf8");
  const refs = await Promise.all(
    REFERENCE_FILES.map(async (rel) => {
      const content = await fs.readFile(path.join(SKILL_ROOT, rel), "utf8");
      return `## REFERENCE: ${rel}\n\n${content}`;
    })
  );
  return [
    "You are executing the IEI Content Engine skill. The full SKILL.md procedure and all 5 reference files are below. Follow the procedure exactly.",
    "",
    "CRITICAL RULES:",
    "1. Write ALL output files using the Write tool. File paths must be plain filenames (e.g. run-state.json, week-1-draft.md) — no directory prefix.",
    "2. ALL reference files are pre-loaded (brand-context, tone-guard, 7-day-matrix, asset-formats, hook-library). Do NOT attempt to Read any reference file path.",
    "3. Do not ask clarifying questions. Proceed directly to the pass specified in the user prompt.",
    "4. No emojis in any output file.",
    "5. Run the Tone Guard self-audit on every asset before writing it to disk.",
    "",
    "---",
    "",
    skillMd,
    ...refs,
  ].join("\n\n");
}

// ─── Per-pass user prompts ─────────────────────────────────────────────────

function buildPass1Prompt(intake: ContentRunIntake): string {
  return [
    `Execute STEP 1 of the Content Engine skill (Market Analysis + Hook Selection).`,
    "",
    "Write this file using the Write tool:",
    "  run-state.json  — market analysis results, hook selections, variety tracker init",
    "",
    intake.contextNotes ? `Additional context for this campaign:\n${intake.contextNotes}` : "",
    intake.campaignStartDate ? `Campaign start date: ${intake.campaignStartDate}` : "",
    "",
    "After writing run-state.json, print the Market Analysis Complete summary block as specified in STEP 1.",
    "Start by calling the Write tool immediately. Do not output text before the first tool call.",
  ]
    .filter(Boolean)
    .join("\n");
}

function buildWeekPrompt(
  weekNumber: 1 | 2 | 3,
  intake: ContentRunIntake,
  priorWeekContents: string[]
): string {
  const priorContext =
    priorWeekContents.length > 0
      ? [
          "",
          "## APPROVED PRIOR WEEKS (for variety enforcement — do not repeat hooks/industries/companies/capabilities)",
          ...priorWeekContents.map((c, i) => `### Week ${i + 1} (approved)\n${c}`),
        ].join("\n\n")
      : "";

  return [
    `Execute STEP 2 of the Content Engine skill: generate Week ${weekNumber}.`,
    "",
    `Write exactly this file using the Write tool:`,
    `  week-${weekNumber}-draft.md  — all 7 days × 3 assets for Week ${weekNumber}`,
    "",
    "Before writing any asset:",
    "  1. Print the WEEK PLAN block (7-day overview with hook structure, industry, company, etc.)",
    "  2. Verify variety tracker compliance (no repeated industry/company/capability/platform)",
    "  3. Generate Monday through Sunday in order, running Tone Guard self-audit after each asset",
    "  4. Run the Hook Variety Check after all 7 days are drafted",
    "",
    priorContext,
    "",
    intake.contextNotes ? `Campaign context: ${intake.contextNotes}` : "",
    "",
    `After writing week-${weekNumber}-draft.md, print the Week Complete summary block.`,
    "Start by calling the Write tool for the first asset. No text before the first tool call.",
  ]
    .filter(Boolean)
    .join("\n");
}

function buildPass5Prompt(intake: ContentRunIntake, weeks1to3: string[]): string {
  const priorContext = weeks1to3
    .map((c, i) => `### Week ${i + 1} (approved)\n${c}`)
    .join("\n\n");

  return [
    `Execute STEP 4 of the Content Engine skill: generate Week 4, then assemble the master calendar.`,
    "",
    "Write these files using the Write tool:",
    "  week-4-draft.md      — all 7 days × 3 assets for Week 4",
    "  master-calendar.md   — full 4-week calendar assembled from weeks 1–4",
    "  index.json           — JSON index with run metadata and file references",
    "",
    "Sequence:",
    "  1. Read run-state.json to load hook selections and variety tracker",
    "  2. Generate Week 4 (same procedure as prior weeks, include non-US brand check for Thursday)",
    "  3. Run the MASTER QUALITY GATE across all 4 weeks",
    "  4. Assemble master-calendar.md",
    "  5. Write index.json",
    "  6. Print the Content Engine Run Complete summary",
    "",
    "## APPROVED PRIOR WEEKS:",
    priorContext,
    "",
    intake.contextNotes ? `Campaign context: ${intake.contextNotes}` : "",
    "",
    "Start immediately with the Write tool. No text before the first tool call.",
  ]
    .filter(Boolean)
    .join("\n");
}

// ─── Lightweight Pass 1 (no agentic loop) ──────────────────────────────────

/**
 * Run Pass 1 as a single non-agentic API call.
 * Returns JSON for market analysis + hook selections in ~10-30s
 * instead of the 300s+ agentic loop approach.
 */
async function runPass1Lightweight(
  intake: ContentRunIntake,
  workDir: string,
  onProgress?: (stage: string, pct: number) => void,
  baseProgress = 0
): Promise<void> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const prompt = `You are a content strategist for a brand. Analyze the market context and generate a run-state.json for a 4-week content calendar campaign.

${intake.contextNotes ? `Campaign context: ${intake.contextNotes}` : ""}
${intake.campaignStartDate ? `Start date: ${intake.campaignStartDate}` : ""}

Return ONLY valid JSON (no markdown fences, no commentary) with this exact structure:
{
  "trendingTopics": ["topic1", "topic2", "topic3", "topic4", "topic5"],
  "hookSelections": ["hook1", "hook2", "hook3", "hook4", "hook5", "hook6", "hook7"],
  "varietyTracker": {
    "usedHooks": [],
    "usedFormats": [],
    "usedTopics": []
  },
  "marketAnalysis": {
    "targetAudience": "description of ideal customer avatar",
    "painPoints": ["pain1", "pain2", "pain3"],
    "competitors": ["competitor1", "competitor2", "competitor3"],
    "contentThemes": ["theme1", "theme2", "theme3", "theme4"],
    "toneDirection": "description of brand voice direction"
  }
}

Requirements:
- trendingTopics: 5 relevant trending topics for this brand/industry
- hookSelections: 7 diverse hook types from this list: Problem-agitate-solve, Authority proof, Social proof, Contrarian take, Pattern interrupt, Storytelling, Data-driven, Question-based, Metaphor, Behind-the-scenes
- marketAnalysis: thorough but concise analysis
- All content should be specific to the brand context provided`;

  onProgress?.("calling Haiku for market analysis", baseProgress + 0.05);

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  onProgress?.("parsing market analysis", baseProgress + 0.12);

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new ContentEngineError("Pass 1: no text response from API", "NO_RESPONSE");
  }

  // Extract JSON — handle possible markdown fences
  let jsonStr = textBlock.text.trim();
  if (jsonStr.startsWith("```")) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  // Validate it's parseable JSON
  const parsed = JSON.parse(jsonStr);
  if (!parsed.trendingTopics || !parsed.hookSelections) {
    throw new ContentEngineError("Pass 1: invalid run-state structure", "INVALID_RESPONSE");
  }

  await fs.writeFile(path.join(workDir, "run-state.json"), JSON.stringify(parsed, null, 2), "utf8");
  onProgress?.("market analysis complete", baseProgress + 0.15);
}

// ─── Anthropic tool definitions ─────────────────────────────────────────────

const TOOLS: Anthropic.Messages.Tool[] = [
  {
    name: "Write",
    description: "Write text content to a file in the working directory. Use plain filenames only (e.g. run-state.json), no path prefixes.",
    input_schema: {
      type: "object" as const,
      properties: {
        file_path: { type: "string", description: "Filename to write (plain name, no directory prefix)" },
        content: { type: "string", description: "Full file content to write" },
      },
      required: ["file_path", "content"],
    },
  },
  {
    name: "Read",
    description: "Read a file from the working directory.",
    input_schema: {
      type: "object" as const,
      properties: {
        file_path: { type: "string", description: "Filename to read" },
      },
      required: ["file_path"],
    },
  },
];

// ─── Core agent runner ──────────────────────────────────────────────────────

/**
 * In test mode (CONTENT_ENGINE_TEST_MODE=1), skip the real Claude API call
 * and write minimal stub files so the pipeline routing can be validated
 * end-to-end in seconds.
 */
async function runAgentPassStub(
  pass: number,
  workDir: string,
  onProgress?: (stage: string, pct: number) => void,
  baseProgress = 0
): Promise<void> {
  onProgress?.(`stub pass ${pass}: writing files`, baseProgress + 0.05);
  if (pass === 1) {
    await fs.writeFile(
      path.join(workDir, "run-state.json"),
      JSON.stringify({
        trendingTopics: ["GTM strategy", "brand building", "IEI platform"],
        hookSelections: ["Problem-agitate-solve", "Authority proof", "Social proof"],
      }),
      "utf8"
    );
  } else if (pass <= 4) {
    const weekNum = pass - 1;
    await fs.writeFile(
      path.join(workDir, `week-${weekNum}-draft.md`),
      `# Week ${weekNum} — GTM Content Draft (stub)\n\n## Monday\nHOOK (0–3 seconds)\nStub hook for day 1\n`,
      "utf8"
    );
  } else {
    // pass 5: assembly
    await fs.writeFile(path.join(workDir, "week-4-draft.md"), `# Week 4 stub\n`, "utf8");
    await fs.writeFile(path.join(workDir, "master-calendar.md"), `# Master Calendar stub\n`, "utf8");
    await fs.writeFile(path.join(workDir, "index.json"), JSON.stringify({ assetCount: 84 }), "utf8");
  }
  onProgress?.(`stub pass ${pass}: done`, baseProgress + 0.17);
}

async function runAgentPass(
  prompt: string,
  systemPrompt: string,
  workDir: string,
  onProgress?: (stage: string, pct: number) => void,
  baseProgress = 0,
  progressRange = 0.18,
  opts?: { modelOverride?: string; maxTokens?: number }
): Promise<void> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new ContentEngineError("ANTHROPIC_API_KEY is not set", "NO_API_KEY");
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const model = opts?.modelOverride ?? process.env.CLAUDE_MODEL ?? "claude-sonnet-4-6";
  const maxTokens = opts?.maxTokens ?? 16000;

  if (VERBOSE) console.log(`[content-engine] model=${model} workDir=${workDir}`);

  const messages: Anthropic.Messages.MessageParam[] = [
    { role: "user", content: prompt },
  ];

  let toolCalls = 0;
  let turns = 0;
  const MAX_TURNS = 120;
  const WALL_CLOCK_LIMIT_MS = 250_000; // 250s — leaves ~50s for post-processing
  const startTime = Date.now();

  while (turns < MAX_TURNS) {
    const elapsed = Date.now() - startTime;
    if (elapsed > WALL_CLOCK_LIMIT_MS) {
      console.warn(`[content-engine] wall-clock limit reached (${Math.round(elapsed / 1000)}s) after ${turns} turns, ${toolCalls} tool calls — returning partial results`);
      onProgress?.("time limit reached — saving partial results", baseProgress + progressRange - 0.01);
      return;
    }

    turns++;

    // Calculate remaining time and cap this API call to leave 30s for post-processing
    const remaining = WALL_CLOCK_LIMIT_MS - (Date.now() - startTime);
    const callTimeout = Math.max(remaining - 30_000, 30_000); // at least 30s per call
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), callTimeout);

    let response: Anthropic.Messages.Message;
    try {
      response = await client.messages.create(
        {
          model,
          max_tokens: maxTokens,
          system: systemPrompt,
          messages,
          tools: TOOLS,
        },
        { signal: controller.signal }
      );
    } catch (err) {
      clearTimeout(timer);
      if (controller.signal.aborted) {
        console.warn(`[content-engine] API call timed out after ${Math.round(callTimeout / 1000)}s on turn ${turns} — returning partial results`);
        onProgress?.("API call timed out — saving partial results", baseProgress + progressRange - 0.01);
        return;
      }
      throw err;
    }
    clearTimeout(timer);

    if (VERBOSE) {
      console.log(`[content-engine] turn ${turns}: stop_reason=${response.stop_reason} blocks=${response.content.length}`);
    }

    // Handle tool use blocks
    const toolUseBlocks = response.content.filter(
      (b): b is Anthropic.Messages.ToolUseBlock => b.type === "tool_use"
    );

    if (toolUseBlocks.length > 0) {
      const toolResults: Anthropic.Messages.ToolResultBlockParam[] = [];

      for (const block of toolUseBlocks) {
        toolCalls++;
        const pct = Math.min(
          baseProgress + toolCalls * (progressRange / 40),
          baseProgress + progressRange - 0.01
        );

        let result: string;

        if (block.name === "Write") {
          const input = block.input as { file_path: string; content: string };
          const filename = path.basename(input.file_path); // strip any dir prefix
          const dest = path.join(workDir, filename);
          await fs.writeFile(dest, input.content, "utf8");
          result = `Written: ${filename} (${input.content.length} chars)`;
          onProgress?.(`Write: ${filename}`, pct);
          if (VERBOSE) console.log(`[content-engine]   → Write ${filename} (${input.content.length} chars)`);
        } else if (block.name === "Read") {
          const input = block.input as { file_path: string };
          const filename = path.basename(input.file_path);
          const src = path.join(workDir, filename);
          try {
            result = await fs.readFile(src, "utf8");
            onProgress?.(`Read: ${filename}`, pct);
          } catch {
            result = `Error: file not found: ${filename}`;
          }
          if (VERBOSE) console.log(`[content-engine]   → Read ${filename} -> ${result.length} chars`);
        } else {
          result = `Error: unknown tool ${block.name}`;
        }

        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: result,
        });
      }

      // Add assistant response + tool results and continue
      messages.push({ role: "assistant", content: response.content });
      messages.push({ role: "user", content: toolResults });
      continue;
    }

    // No tool use — check stop reason
    if (response.stop_reason === "end_turn") {
      if (VERBOSE) console.log(`[content-engine] pass complete in ${turns} turns, ${toolCalls} tool calls`);
      return;
    }

    if (response.stop_reason === "max_tokens") {
      // Model ran out of tokens mid-response; ask it to continue
      messages.push({ role: "assistant", content: response.content });
      messages.push({ role: "user", content: "Continue from where you left off." });
      continue;
    }

    // Any other stop reason (e.g. stop_sequence) — treat as done
    if (VERBOSE) console.log(`[content-engine] stop_reason=${response.stop_reason}, ending pass`);
    return;
  }

  throw new ContentEngineError(
    `content engine pass exceeded max turns (${MAX_TURNS})`,
    "MAX_TURNS_EXCEEDED"
  );
}

// ─── Extract hook summary from a week file ─────────────────────────────────

async function extractHookSummary(weekFile: string): Promise<string[]> {
  try {
    const content = await fs.readFile(weekFile, "utf8");
    const hookLines: string[] = [];
    const hookMatches = content.matchAll(/^HOOK \(0[–-]3 seconds\)\n([^\n]+)/gm);
    for (const m of hookMatches) {
      hookLines.push(m[1].trim().slice(0, 80));
    }
    if (hookLines.length < 7) {
      const dayMatches = content.matchAll(/^## (?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)[^\n]*\n+([^\n]+)/gm);
      for (const m of dayMatches) {
        hookLines.push(m[1].trim().slice(0, 80));
      }
    }
    return hookLines.slice(0, 7);
  } catch {
    return [];
  }
}

// ─── Skill implementation ───────────────────────────────────────────────────

export const contentEngineSkill: ContentEngineSkill = {
  id: "content-engine@2",

  async runPass(
    pass: 1 | 2 | 3 | 4 | 5,
    runId: string,
    intake: ContentRunIntake,
    ctx: ContentSkillRunContext
  ): Promise<WeekPassResult | void> {
    const { outputDir, onProgress } = ctx;

    if (!process.env.ANTHROPIC_API_KEY) {
      throw new ContentEngineError("ANTHROPIC_API_KEY is not set", "NO_API_KEY");
    }

    await fs.mkdir(outputDir, { recursive: true });

    // ASCII-only temp workdir to prevent path encoding issues
    const workDir = path.join(os.tmpdir(), `iei-ce-${randomUUID().slice(0, 8)}`);
    await fs.mkdir(workDir, { recursive: true });

    // Copy existing output files into workDir so the agent can Read them
    try {
      const existing = await fs.readdir(outputDir);
      await Promise.all(
        existing.map((f) =>
          fs.copyFile(path.join(outputDir, f), path.join(workDir, f)).catch(() => undefined)
        )
      );
    } catch {
      // outputDir may be empty on pass 1 — that is fine
    }

    const baseProgress = (pass - 1) * 0.18;

    // Test mode: skip system prompt loading and use stubs
    if (process.env.CONTENT_ENGINE_TEST_MODE === "1") {
      onProgress?.(`pass ${pass}: invoking stub`, baseProgress + 0.02);
      await runAgentPassStub(pass, workDir, onProgress, baseProgress + 0.02);
    } else if (pass === 1) {
      // Pass 1: single non-agentic API call for market analysis.
      // Uses a lightweight prompt (no 43KB system prompt, no tool loop) to stay under 60s.
      onProgress?.(`pass 1: market analysis (lightweight)`, baseProgress + 0.02);
      await runPass1Lightweight(intake, workDir, onProgress, baseProgress + 0.02);
    } else {
      onProgress?.(`loading skill system prompt`, 0.02);
      const systemPrompt = await loadSystemPrompt();

      let prompt: string;

      if (pass >= 2 && pass <= 4) {
        const weekNumber = (pass - 1) as 1 | 2 | 3;
        const priorWeeks: string[] = [];
        for (let w = 1; w < weekNumber; w++) {
          try {
            const content = await fs.readFile(path.join(outputDir, `week-${w}-draft.md`), "utf8");
            priorWeeks.push(content);
          } catch {
            // week not yet written — skip
          }
        }
        prompt = buildWeekPrompt(weekNumber, intake, priorWeeks);
      } else {
        // pass 5 — week 4 + assembly
        const priorWeeks: string[] = [];
        for (let w = 1; w <= 3; w++) {
          try {
            const content = await fs.readFile(path.join(outputDir, `week-${w}-draft.md`), "utf8");
            priorWeeks.push(content);
          } catch {
            // already handled
          }
        }
        prompt = buildPass5Prompt(intake, priorWeeks);
      }

      onProgress?.(`pass ${pass}: invoking agent`, baseProgress + 0.02);
      // Passes 2–5 (week generation) use Sonnet with the full system prompt for quality.
      await runAgentPass(prompt, systemPrompt, workDir, onProgress, baseProgress + 0.02, 0.15);
    }

    // Move files from workDir back to outputDir
    onProgress?.(`pass ${pass}: collecting outputs`, baseProgress + 0.17);
    const produced = await fs.readdir(workDir);
    if (VERBOSE) console.log(`[content-engine] pass ${pass} produced: [${produced.join(", ")}]`);

    for (const name of produced) {
      const src = path.join(workDir, name);
      const dst = path.join(outputDir, name);
      await fs.rename(src, dst).catch(async (err) => {
        if ((err as NodeJS.ErrnoException).code === "EXDEV") {
          await fs.copyFile(src, dst);
          await fs.unlink(src);
        } else {
          throw err;
        }
      });
    }
    await fs.rm(workDir, { recursive: true, force: true });

    if (pass === 1) return;

    const weekNumber = pass === 5 ? 4 : ((pass - 1) as 1 | 2 | 3);
    const weekFile = path.join(outputDir, `week-${weekNumber}-draft.md`);
    const hookSummary = await extractHookSummary(weekFile);

    return {
      weekNumber: weekNumber as 1 | 2 | 3 | 4,
      file: `week-${weekNumber}-draft.md`,
      hookSummary,
    };
  },

  async run(intake: ContentRunIntake, ctx: ContentSkillRunContext): Promise<ContentEngineResult> {
    const { outputDir, onProgress } = ctx;

    onProgress?.("market analysis", 0.02);
    await this.runPass(1, randomUUID(), intake, ctx);

    onProgress?.("generating week 1", 0.2);
    await this.runPass(2, randomUUID(), intake, ctx);

    onProgress?.("generating week 2", 0.38);
    await this.runPass(3, randomUUID(), intake, ctx);

    onProgress?.("generating week 3", 0.56);
    await this.runPass(4, randomUUID(), intake, ctx);

    onProgress?.("generating week 4 + assembly", 0.74);
    await this.runPass(5, randomUUID(), intake, ctx);

    onProgress?.("complete", 1);

    const indexPath = path.join(outputDir, "index.json");
    let assetCount = 84;
    try {
      const idx = JSON.parse(await fs.readFile(indexPath, "utf8")) as { assetCount?: number };
      assetCount = idx.assetCount ?? 84;
    } catch {
      // index.json is best-effort
    }

    return {
      weekFiles: ["week-1-draft.md", "week-2-draft.md", "week-3-draft.md", "week-4-draft.md"],
      masterCalendarFile: "master-calendar.md",
      indexFile: "index.json",
      assetCount,
    };
  },
};
