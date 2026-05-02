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
import { pickIndustry, industryDirectionBlock } from "@/lib/industries";
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
const MAX_TURNS = 40;
const MAX_OUTPUT_TOKENS = 16384;
/** Minimum playbook size — playbooks shorter than this almost always have an
 *  empty body or only 1-2 pages. Real playbooks are 18-40KB. We retry below this. */
const PLAYBOOK_MIN_BYTES = 14000;
/** Minimum number of .page divs in a complete playbook. */
const PLAYBOOK_MIN_PAGES = 5;

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
    "6. PLAYBOOK CHUNKING — non-negotiable. Output cap is ~16,000 tokens per tool call but a real brand playbook is 25,000-40,000 characters. So you MUST chunk the playbook across MULTIPLE tool calls:",
    "   - Call 1 (Write playbook.html): <!doctype html> + <html> + <head> + <style> + <body> + the FIRST 2-3 <div class=\"page\"> sections (cover, brand overview, mission/vision/values).",
    "   - Call 2 (Append playbook.html): the next 2-3 .page divs (target audience, brand messaging, brand style guide).",
    "   - Call 3 (Append playbook.html): the next 2-3 .page divs (offerings, competitors, SMART goals).",
    "   - Call 4 (Append playbook.html): the final 2-3 .page divs (niches/Dream 100, GTM checklist, back cover) PLUS </body></html>.",
    "   It is a CRITICAL FAILURE to write only the <head>/<style> in Call 1 and stop. After Call 1, you MUST continue with Append until the file has at least 8 <div class=\"page\"> sections AND ends with </body></html>. The host code verifies this and will reject incomplete playbooks. A playbook of less than 14KB or with fewer than 5 pages is broken — keep going.",
    "7. When all 4 files are complete, reply with a short confirmation and STOP.",
    "8. ABSOLUTELY NO EMOJIS ANYWHERE in landing.html, playbook.html, logo.svg, or brand.json. No 🔗 ⚡ 📊 🧠 ✨ 🎯 🛡️ 📱 or any emoji character. Use CSS-drawn shapes (rect/circle/path/border) or typography only for icons/accents. Emojis are the #1 tell of AI-generated design and this brand cannot look AI-generated.",
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
  // Industry direction (curated by IEI team) — feeds the main skill's
  // landing.html and playbook so even the FIRST output reflects industry-
  // appropriate aesthetics. Without this, only the variant generators
  // were industry-aware and the main landing.html looked generic.
  const industry = pickIndustry({
    industry: intake.industry,
    productDescription: intake.productDescription,
    notes: intake.notes,
  });
  const industryBlock = industryDirectionBlock(industry);
  return [
    "FRESH-CONTEXT GUARD: build for the brand below ONLY. The system prompt mentions other brands",
    "by name (Aurelian Labs, Pen2Purpose, AceTV, FamFit, Wone, Banger, OffScript, Vent, DOL, Halcyon,",
    "IEI, Ideas Equal Income, etc.) — those are STRUCTURAL EXAMPLES. Never copy their names or copy.",
    "If your output contains any of those brand names, that is a critical defect.",
    "",
    "Build a complete brand playbook NOW using the Write tool.",
    "",
    "Write these four files (relative paths only):",
    "  brand.json     — see STRICT SCHEMA below. Host UI parses this — deviations crash rendering.",
    "  playbook.html  — multi-page HTML with 850×1100px .page divs (per SKILL Step 3)",
    "  landing.html   — single-page landing site populated with brand data",
    "  logo.svg       — primary logo mark as SVG",
    "",
    "STRICT brand.json SCHEMA — do not deviate. ALL fields below are REQUIRED, including the 'soul of the brand' fields:",
    "{",
    '  "name": string,                // plain string',
    '  "tagline": string,             // one short, memorable line',
    '  "positioning": string,         // ONE STRING PARAGRAPH (never an object), 2-4 sentences',
    '  "tone": string[],              // array of 3-6 short adjectives matching the user\'s toneOfVoice',
    '  "colors": {                    // each value is a #RRGGBB hex STRING',
    '     "primary": "#hex",',
    '     "secondary": "#hex",',
    '     "accent": "#hex",',
    '     "neutral": "#hex"',
    "  },",
    '  "typography": {                // each value is the FONT NAME as a plain string',
    '     "heading": "Font Name",',
    '     "body": "Font Name"',
    "  },",
    '  "mission": string,             // ONE sentence: why this brand exists, what it does for whom',
    '  "vision": string,              // ONE sentence: the future this brand is working toward',
    '  "values": string[],            // 3-5 core values, each a short phrase (e.g. "Earned trust over hype")',
    '  "brandStory": string,          // 2-4 sentence origin/why story. If intake.notes contains personal',
    "                                  //   detail (homeless founder, transition story, etc.), USE IT here verbatim or close to it.",
    '  "voice": {',
    '     "say": string[],            // 4-6 example phrases this brand WOULD say — short, in-voice',
    '     "dont": string[]            // 4-6 example phrases this brand would NEVER say — anti-voice',
    "  },",
    '  "ica": string                  // 1 paragraph: the ideal customer as a named human ("Maya, 32, runs..."), pains, desires',
    "}",
    "Never nest additional objects inside `positioning`, `tone`, `typography.{heading,body}`, `mission`, `vision`, or any string field — those must be strings/array-of-strings only.",
    "All 'soul of the brand' fields (mission/vision/values/brandStory/voice/ica) MUST be present and substantive. Do not return placeholders or leave them empty — they are the heart of the brand and downstream tools depend on them.",
    "",
    userPickedPalette
      ? "PALETTE OVERRIDE: the user has explicitly chosen a palette. The hex codes below are non-negotiable — use them as primary/secondary/accent/neutral in that order, even if audience/industry analysis would suggest otherwise."
      : "",
    industryBlock,
    "Intake:",
    "```json",
    JSON.stringify(intake, null, 2),
    "```",
    "",
    "CRITICAL: build around the user's `productDescription` verbatim. Do not invent products, offerings, or use cases beyond what's described there. If their description is short, stay close to its spirit — don't extrapolate a whole portfolio from two sentences.",
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
      let nudgedAboutPlaybook = false;

      /**
       * A playbook is "complete" when it has body content — not just CSS.
       * The orchestrator uses this to decide whether to keep looping after
       * the model thinks it's done.
       */
      async function playbookIsComplete(): Promise<{ ok: boolean; reason?: string; bytes?: number; pages?: number }> {
        const p = path.join(workDir, "playbook.html");
        try {
          const stat = await fs.stat(p);
          const content = await fs.readFile(p, "utf8");
          const pages = (content.match(/<div\s+class\s*=\s*"[^"]*\bpage\b[^"]*"/g) ?? []).length;
          const hasClosingHtml = /<\/html>\s*$/i.test(content.trim());
          if (stat.size < PLAYBOOK_MIN_BYTES) {
            return { ok: false, reason: `only ${stat.size} bytes (need ${PLAYBOOK_MIN_BYTES})`, bytes: stat.size, pages };
          }
          if (pages < PLAYBOOK_MIN_PAGES) {
            return { ok: false, reason: `only ${pages} <div class="page"> sections (need ${PLAYBOOK_MIN_PAGES})`, bytes: stat.size, pages };
          }
          if (!hasClosingHtml) {
            return { ok: false, reason: `missing closing </html>`, bytes: stat.size, pages };
          }
          return { ok: true, bytes: stat.size, pages };
        } catch {
          return { ok: false, reason: "playbook.html not yet written" };
        }
      }

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

        // Early exit: only when all 4 required files exist AND the playbook is
        // actually complete. Otherwise, nudge the model to keep going.
        const produced = new Set(await fs.readdir(workDir));
        if ([...required].every((f) => produced.has(f))) {
          const check = await playbookIsComplete();
          if (check.ok) {
            if (VERBOSE) console.log(`[${cfg.id}] all required files written; playbook=${check.bytes}B/${check.pages} pages`);
            break;
          }
          // Playbook is incomplete. Inject a system-style user message telling
          // the model exactly what's missing and to continue with Append.
          if (!nudgedAboutPlaybook && VERBOSE) {
            console.log(`[${cfg.id}] playbook incomplete (${check.reason}); nudging model to continue`);
          }
          nudgedAboutPlaybook = true;
          messages.push({
            role: "user",
            content:
              `Your playbook.html is INCOMPLETE: ${check.reason}. ` +
              `Do NOT stop yet. Use Append (not Write — that would overwrite) to add more <div class="page"> sections to playbook.html until it has at least ${PLAYBOOK_MIN_PAGES} pages and ends with </body></html>. ` +
              `Continue with the next page section now. Each Append call should add 1-3 full pages. Keep calling Append until the file is complete.`,
          });
          continue;
        }

        if (choice.finish_reason === "stop") {
          // Model stopped voluntarily but we don't have all 4 files. Nudge it.
          const missing = [...required].filter((f) => !produced.has(f));
          messages.push({
            role: "user",
            content: `You stopped early. The following required files are missing: ${missing.join(", ")}. Write them now using the Write tool.`,
          });
        }
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
