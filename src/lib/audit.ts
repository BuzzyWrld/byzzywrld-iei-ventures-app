/**
 * Brand audit scorer. Scrapes a URL, asks Claude to score the brand
 * against 6 criteria, returns a 0-100 score plus gap list.
 *
 * Uses Anthropic SDK direct (not Agent SDK — no tool use needed, just
 * classification against a rubric).
 */
import Anthropic from "@anthropic-ai/sdk";
import type { ScrapeResult } from "./scraper";
import { scrapeUrl } from "./scraper";

export type AuditCriterion = {
  name: string;
  score: number; // 0-10
  note: string;
};

export type AuditResult = {
  url: string;
  score: number; // 0-100
  summary: string;
  criteria: AuditCriterion[];
  gaps: string[];
  scrapedAt: string;
};

const CRITERIA = [
  "Visual identity (palette + logo)",
  "Typography system",
  "Messaging clarity (hero + positioning)",
  "Tone of voice consistency",
  "Audience focus (who it's for)",
  "Professional polish",
];

const SYSTEM_PROMPT = `You are a senior brand strategist auditing a company's public web presence. Score each of 6 criteria from 0-10, then produce a weighted overall score 0-100. Be rigorous, not generous — a 10 is reserved for work that would win a design award. Most sites score 4-7 per criterion.

Return ONLY valid JSON matching this shape:
{
  "summary": "one-sentence overall read (max 20 words)",
  "criteria": [
    { "name": "<name>", "score": 0-10, "note": "one short observation" }
  ],
  "gaps": ["3-5 concrete improvement bullets"]
}

Do not wrap in markdown fences. Do not add prose outside the JSON.`;

function buildUserPrompt(scrape: ScrapeResult): string {
  return [
    `Audit this brand based on what's detectable from the public site.`,
    ``,
    `URL: ${scrape.url}`,
    `Page title: ${scrape.title || "(none)"}`,
    `Meta description: ${scrape.description || "(none)"}`,
    `Hero H1: ${scrape.hero.h1 || "(none)"}`,
    `Hero subtitle: ${scrape.hero.subtitle || "(none)"}`,
    `Detected palette: ${scrape.colors.join(", ") || "(none)"}`,
    `Detected fonts: ${scrape.fonts.join(", ") || "(none)"}`,
    ``,
    `Score these criteria (0-10 each):`,
    ...CRITERIA.map((c, i) => `${i + 1}. ${c}`),
    ``,
    `Then weight them equally into a 0-100 overall score and list 3-5 gaps.`,
  ].join("\n");
}

export async function auditUrl(url: string): Promise<AuditResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }
  const scrape = await scrapeUrl(url);

  const client = new Anthropic();
  const msg = await client.messages.create({
    model: process.env.CLAUDE_MODEL || "claude-haiku-4-5",
    max_tokens: 800,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildUserPrompt(scrape) }],
  });

  const text = msg.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");

  let parsed: { summary: string; criteria: AuditCriterion[]; gaps: string[] };
  try {
    parsed = JSON.parse(text.trim());
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error(`audit: model returned unparseable output: ${text.slice(0, 200)}`);
    parsed = JSON.parse(match[0]);
  }

  const score = Math.round(
    (parsed.criteria.reduce((sum, c) => sum + c.score, 0) / (parsed.criteria.length * 10)) * 100
  );

  return {
    url,
    score,
    summary: parsed.summary,
    criteria: parsed.criteria,
    gaps: parsed.gaps,
    scrapedAt: new Date().toISOString(),
  };
}
