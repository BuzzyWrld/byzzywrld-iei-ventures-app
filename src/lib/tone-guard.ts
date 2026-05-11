/**
 * Tone Guard Agent
 *
 * Validates content engine output against IEI Ventures tone rules:
 * BOLD. DIRECT. BUILT.
 *
 * Catches banned words, passive voice, hedging, filler phrases,
 * and structural violations before content is finalized.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ToneViolation {
  line: number;
  column: number;
  text: string;
  rule: string;
  severity: "error" | "warning";
  suggestion: string;
}

export interface ToneAuditResult {
  passed: boolean;
  score: number;
  violations: ToneViolation[];
  stats: {
    totalLines: number;
    checkedLines: number;
    errorCount: number;
    warningCount: number;
  };
}

// ─── Banned vocabulary ────────────────────────────────────────────────────────

const BANNED_VERBS = new Set([
  "strive", "strives", "striving",
  "leverage", "leverages", "leveraging", "leveraged",
  "elevate", "elevates", "elevating", "elevated",
  "unlock", "unlocks", "unlocking", "unlocked",
  "empower", "empowers", "empowering", "empowered",
  "foster", "fosters", "fostering", "fostered",
  "nurture", "nurtures", "nurturing", "nurtured",
  "navigate", "navigates", "navigating", "navigated",
  "showcase", "showcases", "showcasing", "showcased",
  "underscore", "underscores", "underscoring", "underscored",
  "delve", "delves", "delving", "delved",
  "utilize", "utilizes", "utilizing", "utilized",
]);

const BANNED_ADJECTIVES = new Set([
  "comprehensive", "robust", "nuanced", "multifaceted",
  "vibrant", "pivotal", "seamless", "cutting-edge",
  "innovative", "transformative", "holistic", "dynamic",
  "unparalleled", "world-class", "best-in-class",
  "synergistic", "disruptive",
]);

const BANNED_NOUNS = new Set([
  "thought leader", "thought leadership",
  "synergy", "tapestry", "paradigm", "interplay",
]);

const BANNED_PHRASES = [
  "we strive to",
  "we believe that",
  "in today's fast-paced world",
  "in an ever-evolving landscape",
  "navigate the complexities",
  "unlock the potential",
  "take your business to the next level",
  "stand out from the crowd",
  "the future of",
  "at our core",
  "at the intersection of",
  "where .+ meets",
  "game-changer",
  "it's important to note",
  "i've been thinking about",
  "in today's post",
];

const THROAT_CLEARING = [
  "moreover,",
  "furthermore,",
  "additionally,",
  "in conclusion,",
  "it is worth noting",
  "it should be noted",
  "as we all know",
  "needless to say",
];

// ─── Passive voice detection ──────────────────────────────────────────────────

const PASSIVE_PATTERNS = [
  /\b(?:is|are|was|were|been|being)\s+(?:designed|built|created|made|used|intended|meant|expected|supposed)\s+to\b/i,
  /\b(?:is|are|was|were)\s+(?:\w+ed)\s+by\b/i,
  /\bcan be\s+\w+ed\b/i,
  /\bhas been\s+\w+ed\b/i,
];

// ─── Hedging detection ────────────────────────────────────────────────────────

const HEDGE_PATTERNS = [
  /\bcan potentially\b/i,
  /\bmight help\b/i,
  /\bcould possibly\b/i,
  /\bmay be able to\b/i,
  /\btends to\b/i,
  /\bin some cases\b/i,
  /\bif you want to\b/i,
  /\bfeel free to\b/i,
  /\bdon't hesitate to\b/i,
  /\bif you're interested\b/i,
];

// ─── Core audit function ──────────────────────────────────────────────────────

/**
 * Audits a single content asset against IEI tone rules.
 * Returns a result with violations, score (0-100), and pass/fail.
 */
export function auditTone(content: string): ToneAuditResult {
  const lines = content.split("\n");
  const violations: ToneViolation[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // Skip markdown fences, headers, and metadata lines
    if (/^(-{3}|```|#|ASSET [ABC]:|Day:|Week:|Platform:|Runtime:|Target)/.test(line.trim())) {
      continue;
    }

    const lowerLine = line.toLowerCase();

    // Check banned verbs
    for (const word of BANNED_VERBS) {
      const idx = lowerLine.indexOf(word);
      if (idx !== -1 && isWordBoundary(lowerLine, idx, word.length)) {
        violations.push({
          line: lineNum,
          column: idx + 1,
          text: word,
          rule: "banned-verb",
          severity: "error",
          suggestion: `Replace "${word}" with a green-light verb: Ship, Generate, Deploy, Build, Execute, Automate`,
        });
      }
    }

    // Check banned adjectives
    for (const word of BANNED_ADJECTIVES) {
      const idx = lowerLine.indexOf(word);
      if (idx !== -1 && isWordBoundary(lowerLine, idx, word.length)) {
        violations.push({
          line: lineNum,
          column: idx + 1,
          text: word,
          rule: "banned-adjective",
          severity: "error",
          suggestion: `Replace "${word}" with: Locked-in, Proven, Measurable, Structured, Systematic, Repeatable`,
        });
      }
    }

    // Check banned noun phrases
    for (const phrase of BANNED_NOUNS) {
      const idx = lowerLine.indexOf(phrase);
      if (idx !== -1) {
        violations.push({
          line: lineNum,
          column: idx + 1,
          text: phrase,
          rule: "banned-noun",
          severity: "error",
          suggestion: `Remove "${phrase}" — use concrete nouns: Infrastructure, System, Engine, Pipeline, Blueprint`,
        });
      }
    }

    // Check banned phrases
    for (const phrase of BANNED_PHRASES) {
      const regex = new RegExp(phrase, "i");
      const match = lowerLine.match(regex);
      if (match) {
        violations.push({
          line: lineNum,
          column: (match.index ?? 0) + 1,
          text: match[0],
          rule: "banned-phrase",
          severity: "error",
          suggestion: `Remove AI filler phrase. Lead with outcome or active verb.`,
        });
      }
    }

    // Check throat-clearing openers
    for (const opener of THROAT_CLEARING) {
      if (lowerLine.trimStart().startsWith(opener)) {
        violations.push({
          line: lineNum,
          column: 1,
          text: opener,
          rule: "throat-clearing",
          severity: "warning",
          suggestion: `Cut "${opener}" — start with the point directly.`,
        });
      }
    }

    // Check passive voice
    for (const pattern of PASSIVE_PATTERNS) {
      const match = line.match(pattern);
      if (match) {
        violations.push({
          line: lineNum,
          column: (match.index ?? 0) + 1,
          text: match[0],
          rule: "passive-voice",
          severity: "warning",
          suggestion: `Rewrite in active voice. "${match[0]}" → use a direct subject + verb.`,
        });
      }
    }

    // Check hedging
    for (const pattern of HEDGE_PATTERNS) {
      const match = line.match(pattern);
      if (match) {
        violations.push({
          line: lineNum,
          column: (match.index ?? 0) + 1,
          text: match[0],
          rule: "hedging",
          severity: "warning",
          suggestion: `Remove hedge. State the claim directly without qualifiers.`,
        });
      }
    }

    // Check sentence length (>20 words)
    const sentences = line.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    for (const sentence of sentences) {
      const wordCount = sentence.trim().split(/\s+/).length;
      if (wordCount > 20) {
        violations.push({
          line: lineNum,
          column: 1,
          text: sentence.trim().slice(0, 60) + "...",
          rule: "sentence-too-long",
          severity: "warning",
          suggestion: `${wordCount} words — break into two sentences. Max 20 words per sentence.`,
        });
      }
    }
  }

  const checkedLines = lines.filter(
    (l) => l.trim().length > 0 && !/^(-{3}|```|#)/.test(l.trim())
  ).length;
  const errorCount = violations.filter((v) => v.severity === "error").length;
  const warningCount = violations.filter((v) => v.severity === "warning").length;

  // Score: start at 100, deduct 10 per error, 3 per warning
  const score = Math.max(0, 100 - errorCount * 10 - warningCount * 3);

  return {
    passed: errorCount === 0,
    score,
    violations,
    stats: {
      totalLines: lines.length,
      checkedLines,
      errorCount,
      warningCount,
    },
  };
}

/**
 * Audits multiple assets and returns a combined report.
 */
export function auditWeek(weekMarkdown: string): {
  overall: { passed: boolean; averageScore: number; totalViolations: number };
  assets: Array<{ label: string; result: ToneAuditResult }>;
} {
  // Split on Asset A / B / C boundaries
  const assetBlocks = weekMarkdown.split(/(?=---\s*\nASSET [ABC]:)/);
  const assets: Array<{ label: string; result: ToneAuditResult }> = [];

  for (const block of assetBlocks) {
    if (!block.trim()) continue;
    const labelMatch = block.match(/ASSET ([ABC]):\s*(.+)/);
    const label = labelMatch ? `Asset ${labelMatch[1]}: ${labelMatch[2]}` : "Unknown";
    assets.push({ label, result: auditTone(block) });
  }

  const totalViolations = assets.reduce((s, a) => s + a.result.violations.length, 0);
  const averageScore = assets.length > 0
    ? Math.round(assets.reduce((s, a) => s + a.result.score, 0) / assets.length)
    : 100;

  return {
    overall: {
      passed: assets.every((a) => a.result.passed),
      averageScore,
      totalViolations,
    },
    assets,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isWordBoundary(text: string, start: number, length: number): boolean {
  const before = start === 0 || /\W/.test(text[start - 1]);
  const after = start + length >= text.length || /\W/.test(text[start + length]);
  return before && after;
}
