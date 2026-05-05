/**
 * Content Engine skill adapter.
 *
 * Runs the IEI 4-week content calendar generation as 5 sequential agent passes.
 * Each pass invokes Claude via @anthropic-ai/claude-agent-sdk with the full
 * SKILL.md + 5 reference files inlined into the system prompt.
 *
 * Pass 1  — market analysis + hook selections + run-state.json
 * Pass 2  — Week 1: 7 days × 3 assets
 * Pass 3  — Week 2 (reads Week 1 as benchmark)
 * Pass 4  — Week 3 (reads Weeks 1–2 as benchmark)
 * Pass 5  — Week 4 + master calendar assembly
 *
 * Enable:
 *   ANTHROPIC_API_KEY=sk-ant-...
 *   SKILL_ADAPTER=agent-sdk        (shared with brand-playbook)
 *   CLAUDE_MODEL=sonnet            (haiku is too weak for 84-asset generation)
 */

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
    "1. Write ALL output files using the Write tool into the current working directory.",
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

function buildPass1Prompt(intake: ContentRunIntake, workDir: string): string {
  return [
    `Execute STEP 1 of the Content Engine skill (Market Analysis + Hook Selection).`,
    `Working directory: ${workDir}`,
    "",
    "Write these files to the working directory:",
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
  weekNumber: 1 | 2 | 3 | 4,
  workDir: string,
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
    `Working directory: ${workDir}`,
    "",
    `Write exactly this file:`,
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
    "After writing week-" + weekNumber + "-draft.md, print the Week Complete summary block.",
    "Start by calling the Write tool for the first asset. No text before the first tool call.",
  ]
    .filter(Boolean)
    .join("\n");
}

function buildPass5Prompt(workDir: string, intake: ContentRunIntake, weeks1to3: string[]): string {
  const priorContext = weeks1to3
    .map((c, i) => `### Week ${i + 1} (approved)\n${c}`)
    .join("\n\n");

  return [
    `Execute STEP 4 of the Content Engine skill: generate Week 4, then assemble the master calendar.`,
    `Working directory: ${workDir}`,
    "",
    "Write these files:",
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

// ─── SDK loader (shared pattern from agent-sdk.ts) ─────────────────────────

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
  } catch {
    throw new ContentEngineError(
      "@anthropic-ai/claude-agent-sdk is not installed. Run: npm install @anthropic-ai/claude-agent-sdk",
      "SDK_NOT_INSTALLED"
    );
  }
}

// ─── Core agent runner ──────────────────────────────────────────────────────

async function runAgentPass(
  prompt: string,
  systemPrompt: string,
  workDir: string,
  onProgress?: (stage: string, pct: number) => void,
  baseProgress = 0,
  progressRange = 0.18
): Promise<void> {
  const { query } = await loadAgentSdk();
  const model = process.env.CLAUDE_MODEL ?? "sonnet";

  if (VERBOSE) console.log(`[content-engine] model=${model} workDir=${workDir}`);

  const stream = query({
    prompt,
    options: {
      systemPrompt,
      model,
      cwd: workDir,
      permissionMode: "bypassPermissions",
      dangerouslySkipPermissions: true,
      allowedTools: ["Write", "Read", "Edit", "WebSearch"],
    },
  });

  let toolCalls = 0;
  let result: SdkMessage | null = null;

  for await (const msg of stream) {
    if (VERBOSE) console.log(`[content-engine] ${msg.type}${msg.subtype ? `/${msg.subtype}` : ""}`);

    if (msg.type === "assistant") {
      for (const block of msg.message?.content ?? []) {
        if (block.type === "tool_use") {
          toolCalls++;
          const pct = Math.min(baseProgress + toolCalls * (progressRange / 30), baseProgress + progressRange - 0.01);
          const input = block.input as { file_path?: string; query?: string } | undefined;
          const detail = input?.file_path ?? input?.query?.slice(0, 50) ?? "";
          onProgress?.(`${block.name}: ${detail}`, pct);
          if (VERBOSE) console.log(`[content-engine]   → ${block.name} ${detail}`);
        } else if (block.type === "text" && block.text && VERBOSE) {
          console.log(`[content-engine]   text: ${block.text.slice(0, 100)}`);
        }
      }
    } else if (msg.type === "result") {
      result = msg;
    }
  }

  if (VERBOSE && result) {
    console.log(
      `[content-engine] pass result: subtype=${result.subtype} turns=${result.num_turns} cost=$${result.total_cost_usd?.toFixed(3)}`
    );
  }

  if (result?.is_error || result?.subtype !== "success") {
    const hint = result?.errors?.join("; ") ?? result?.result ?? result?.error;
    throw new ContentEngineError(
      `content engine pass failed (${result?.subtype ?? "unknown"}): ${hint ?? "no details"}`,
      "PASS_FAILED"
    );
  }
}

// ─── Extract hook summary from a week file ─────────────────────────────────

async function extractHookSummary(weekFile: string): Promise<string[]> {
  try {
    const content = await fs.readFile(weekFile, "utf8");
    const hookLines: string[] = [];
    // Find HOOK lines in each day's video script section
    const hookMatches = content.matchAll(/^HOOK \(0[–-]3 seconds\)\n([^\n]+)/gm);
    for (const m of hookMatches) {
      hookLines.push(m[1].trim().slice(0, 80));
    }
    // Fallback: grab the first non-empty line after each ## heading
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
  id: "content-engine@1",

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

    onProgress?.(`loading skill system prompt`, 0.02);
    const systemPrompt = await loadSystemPrompt();

    const baseProgress = (pass - 1) * 0.18;

    let prompt: string;

    if (pass === 1) {
      prompt = buildPass1Prompt(intake, workDir);
    } else if (pass >= 2 && pass <= 4) {
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
      prompt = buildWeekPrompt(weekNumber, workDir, intake, priorWeeks);
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
      prompt = buildPass5Prompt(workDir, intake, priorWeeks);
    }

    onProgress?.(`pass ${pass}: invoking agent`, baseProgress + 0.02);
    await runAgentPass(systemPrompt, prompt, workDir, onProgress, baseProgress + 0.02, 0.15);

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

    // Run all 5 passes sequentially
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

    // Read the index to return metadata
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
