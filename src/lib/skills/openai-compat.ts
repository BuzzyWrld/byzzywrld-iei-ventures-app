/**
 * OpenAI-compatible skill adapter. Works with any provider whose API speaks
 * the OpenAI chat completions / tool-use schema:
 *   - DeepSeek (https://api.deepseek.com/v1)
 *   - Moonshot / Kimi (https://api.moonshot.ai/v1)
 *   - OpenAI itself (https://api.openai.com/v1)
 *
 * Runs the same brand-playbook skill prompt as the Agent SDK adapter, but
 * implements the Write + Read tool loop manually (since the Agent SDK is
 * Claude-only).
 */
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import OpenAI from "openai";
import type {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from "openai/resources/chat/completions";
import type { BrandIntake } from "@/lib/types";
import { renderPdfFromHtml } from "@/lib/pdf";
import {
  BrandPlaybookSkill,
  SkillError,
  SkillManifest,
  SkillRunContext,
} from "./contract";

const SKILL_ROOT = path.join(process.cwd(), "skills/brand-playbook");
const REFERENCE_FILES = [
  "references/worksheets.md",
  "references/color-theory.md",
  "references/logo-theory.md",
  "references/social-sizes.md",
];

const VERBOSE = process.env.SKILL_DEBUG === "1";
const MAX_TURNS = 30;
const MAX_OUTPUT_TOKENS = 8192;

async function loadSystemPrompt(): Promise<string> {
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
    "1. Write ALL output files using Write/Append. File paths are RELATIVE to the working directory — never prefix an absolute path.",
    "2. Required files (exact names): brand.json, playbook.html, landing.html, logo.svg.",
    "3. The `presentation-pdf` skill referenced in SKILL.md Step 5 is NOT available here. SKIP that step. Just write structured playbook.html with 850×1100px .page divs — the host renders it to PDF afterward.",
    "4. Reference files (worksheets, color-theory, logo-theory, social-sizes) are inlined below. Do not Read them.",
    "5. Do not ask clarifying questions. Use Pure Creation mode if information is missing.",
    "6. OUTPUT TOKEN LIMIT: a single tool call can't return more than ~8000 tokens. For playbook.html (which is typically 20-40KB), you MUST split it across multiple tool calls: Write the first chunk (e.g. <!doctype html> + <head> + first 2-3 .page divs), then Append subsequent chunks with the remaining pages, ending with </body></html>. Never try to fit the whole playbook in one Write — it will truncate mid-file and fail.",
    "7. When all 4 files are complete, reply with a short confirmation and STOP.",
    "",
    "---",
    "",
    skillMd,
    ...refs,
  ].join("\n\n");
}

function buildUserPrompt(intake: BrandIntake): string {
  const hexMatches = intake.palettePreference.match(
    /#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})/gi
  );
  const userPickedPalette = (hexMatches?.length ?? 0) >= 4;
  return [
    "Build a complete brand playbook NOW using the Write tool.",
    "",
    "Write these four files (relative paths only):",
    "  brand.json     — see STRICT SCHEMA below. Host UI parses this — deviations crash rendering.",
    "  playbook.html  — multi-page HTML with 850×1100px .page divs (per SKILL Step 3)",
    "  landing.html   — single-page landing site populated with brand data",
    "  logo.svg       — primary logo mark as SVG",
    "",
    "STRICT brand.json SCHEMA — do not deviate:",
    "{",
    '  "name": string,                // required, plain string',
    '  "tagline": string,             // required, one short line',
    '  "positioning": string,         // required, ONE STRING PARAGRAPH (never an object)',
    '  "tone": string[],              // required, array of short adjectives',
    '  "colors": {                    // required; each value is a #RRGGBB hex STRING',
    '     "primary": "#hex",',
    '     "secondary": "#hex",',
    '     "accent": "#hex",',
    '     "neutral": "#hex"',
    "  },",
    '  "typography": {                // required; each value is the FONT NAME as a plain string',
    '     "heading": "Font Name",',
    '     "body": "Font Name"',
    "  }",
    "}",
    "Additional fields are allowed but the 6 above must be present in exactly these shapes.",
    "Never nest additional objects inside `positioning`, `tone`, or `typography.{heading,body}` — those must be strings/array-of-strings only.",
    "",
    userPickedPalette
      ? "PALETTE OVERRIDE: the user has explicitly chosen a palette. The hex codes below are non-negotiable — use them as primary/secondary/accent/neutral in that order, even if audience/industry analysis would suggest otherwise."
      : "",
    "Intake:",
    "```json",
    JSON.stringify(intake, null, 2),
    "```",
  ]
    .filter(Boolean)
    .join("\n");
}

const TOOLS: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "Write",
      description:
        "Write a NEW file (or overwrite) in the current working directory. For long files (>6000 chars), write a partial and use Append for the rest — a single Write call can be truncated by output token limits.",
      parameters: {
        type: "object",
        properties: {
          file_path: { type: "string", description: "Relative path (e.g. 'brand.json')." },
          content: { type: "string", description: "Full file contents." },
        },
        required: ["file_path", "content"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "Append",
      description:
        "Append more content to a file you already started with Write. Use this to stream long files (like playbook.html) across multiple tool calls so no single call hits the output token cap.",
      parameters: {
        type: "object",
        properties: {
          file_path: { type: "string", description: "Relative path to append to." },
          content: { type: "string", description: "Content to append." },
        },
        required: ["file_path", "content"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "Read",
      description: "Read a file you previously wrote, from the current working directory.",
      parameters: {
        type: "object",
        properties: {
          file_path: { type: "string", description: "Relative path." },
        },
        required: ["file_path"],
      },
    },
  },
];

function safeRelative(workDir: string, rel: string): string {
  // Accept either relative or absolute that happens to be under workDir. Reject
  // anything trying to escape.
  const resolved = path.isAbsolute(rel) ? rel : path.join(workDir, rel);
  const norm = path.resolve(resolved);
  if (!norm.startsWith(path.resolve(workDir))) {
    throw new Error(`path escapes workDir: ${rel}`);
  }
  return norm;
}

async function execTool(
  name: string,
  argsJson: string,
  workDir: string
): Promise<string> {
  let args: Record<string, unknown>;
  try {
    args = JSON.parse(argsJson);
  } catch {
    return `ERROR: arguments were not valid JSON`;
  }
  try {
    if (name === "Write") {
      const rel = String(args.file_path);
      const content = String(args.content ?? "");
      const abs = safeRelative(workDir, rel);
      await fs.mkdir(path.dirname(abs), { recursive: true });
      await fs.writeFile(abs, content);
      return `File written: ${path.basename(abs)} (${content.length} chars). If this file is incomplete, continue with Append.`;
    }
    if (name === "Append") {
      const rel = String(args.file_path);
      const content = String(args.content ?? "");
      const abs = safeRelative(workDir, rel);
      await fs.appendFile(abs, content);
      const stat = await fs.stat(abs);
      return `Appended (${content.length} chars). File is now ${stat.size} bytes total.`;
    }
    if (name === "Read") {
      const rel = String(args.file_path);
      const abs = safeRelative(workDir, rel);
      const content = await fs.readFile(abs, "utf8");
      return content.slice(0, 20000);
    }
    return `ERROR: unknown tool ${name}`;
  } catch (err) {
    return `ERROR: ${err instanceof Error ? err.message : String(err)}`;
  }
}

type ProviderConfig = {
  id: string;
  baseURL: string;
  apiKey: string;
  model: string;
};

export function makeOpenAiCompatSkill(cfg: ProviderConfig): BrandPlaybookSkill {
  return {
    id: cfg.id,
    async run(intake: BrandIntake, ctx: SkillRunContext): Promise<SkillManifest> {
      const { outputDir, onProgress } = ctx;
      if (!cfg.apiKey) throw new SkillError(`${cfg.id}: api key missing`, "NO_API_KEY");

      await fs.mkdir(outputDir, { recursive: true });
      const workDir = path.join(os.tmpdir(), `iei-skill-${randomUUID().slice(0, 8)}`);
      await fs.mkdir(workDir, { recursive: true });

      onProgress?.("loading skill + references", 0.05);
      const systemPrompt = await loadSystemPrompt();
      const userPrompt = buildUserPrompt(intake);

      onProgress?.("invoking model", 0.1);
      const client = new OpenAI({ baseURL: cfg.baseURL, apiKey: cfg.apiKey });

      const messages: ChatCompletionMessageParam[] = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ];

      const required = new Set(["brand.json", "playbook.html", "landing.html", "logo.svg"]);
      let turn = 0;
      let toolCalls = 0;

      while (turn < MAX_TURNS) {
        turn++;
        if (VERBOSE) console.log(`[${cfg.id}] turn ${turn}`);

        const completion = await client.chat.completions.create({
          model: cfg.model,
          messages,
          tools: TOOLS,
          tool_choice: "auto",
          temperature: 0.3,
          max_tokens: MAX_OUTPUT_TOKENS,
        });

        const choice = completion.choices[0];
        const msg = choice.message;
        messages.push(msg);

        if (msg.content && VERBOSE) {
          console.log(`[${cfg.id}] text: ${String(msg.content).slice(0, 100)}`);
        }

        const calls = msg.tool_calls ?? [];
        if (calls.length === 0) {
          if (VERBOSE) console.log(`[${cfg.id}] no tool calls; stopping`);
          break;
        }

        for (const call of calls) {
          if (call.type !== "function") continue;
          toolCalls++;
          const fn = call.function;
          if (VERBOSE) console.log(`[${cfg.id}]   → ${fn.name} ${fn.arguments.slice(0, 80)}`);
          const result = await execTool(fn.name, fn.arguments, workDir);
          if (VERBOSE) console.log(`[${cfg.id}]   ← ${result.slice(0, 100)}`);
          messages.push({
            role: "tool",
            tool_call_id: call.id,
            content: result,
          });
          // Progress label — never throw from here; the fn.arguments may be
          // truncated JSON if the model hit its output cap mid-tool-call.
          let label = fn.name;
          try {
            const parsed = JSON.parse(fn.arguments) as { file_path?: string };
            if (parsed.file_path) label = `${fn.name} ${parsed.file_path}`;
          } catch {
            label = `${fn.name} (truncated)`;
          }
          onProgress?.(label.slice(0, 80), Math.min(0.1 + toolCalls * 0.07, 0.85));
        }

        // Early exit: all 4 required files present.
        const produced = new Set(await fs.readdir(workDir));
        if ([...required].every((f) => produced.has(f))) {
          if (VERBOSE) console.log(`[${cfg.id}] all required files written`);
          break;
        }

        if (choice.finish_reason === "stop") break;
      }

      // Move files to real outputDir.
      onProgress?.("collecting outputs", 0.88);
      const produced = await fs.readdir(workDir);
      if (VERBOSE) console.log(`[${cfg.id}] produced: [${produced.join(", ")}]`);
      for (const name of produced) {
        await fs.rename(path.join(workDir, name), path.join(outputDir, name)).catch(async (err) => {
          if ((err as NodeJS.ErrnoException).code === "EXDEV") {
            await fs.copyFile(path.join(workDir, name), path.join(outputDir, name));
            await fs.unlink(path.join(workDir, name));
          } else {
            throw err;
          }
        });
      }
      await fs.rm(workDir, { recursive: true, force: true });

      onProgress?.("rendering pdf", 0.9);
      const playbookHtml = path.join(outputDir, "playbook.html");
      const playbookPdf = path.join(outputDir, "playbook.pdf");
      try {
        await fs.access(playbookHtml);
      } catch {
        const contents = await fs.readdir(outputDir).catch(() => []);
        throw new SkillError(
          `skill did not produce playbook.html. contents=[${contents.join(", ")}] turns=${turn} toolCalls=${toolCalls}`,
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
}

/* ---------- provider presets ---------- */

export function deepseekSkill(): BrandPlaybookSkill {
  return makeOpenAiCompatSkill({
    id: "deepseek",
    baseURL: process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com/v1",
    apiKey: process.env.DEEPSEEK_API_KEY ?? "",
    model: process.env.DEEPSEEK_MODEL ?? "deepseek-chat",
  });
}

export function kimiSkill(): BrandPlaybookSkill {
  return makeOpenAiCompatSkill({
    id: "kimi",
    baseURL: process.env.KIMI_BASE_URL ?? "https://api.moonshot.ai/v1",
    apiKey: process.env.KIMI_API_KEY ?? process.env.MOONSHOT_API_KEY ?? "",
    model: process.env.KIMI_MODEL ?? "kimi-k2-0711-preview",
  });
}
