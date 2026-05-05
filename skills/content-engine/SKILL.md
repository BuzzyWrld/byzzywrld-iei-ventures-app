# IEI Content Engine Skill — Master Orchestration Procedure

**Version:** 1.0
**Branch:** content-engine
**Output:** 4-week rolling content calendar — 28 days × 3 assets = 84 production-ready assets

---

## Reference Files (pre-loaded — do not Read these paths)

All context is already in your system prompt. Do not attempt to `Read` any file. The following
references are available in-context:

| File | Purpose |
|------|---------|
| `references/brand-context.md` | IEI identity, pillars, competitive frame, vocabulary anchors |
| `references/tone-guard.md` | Green-light/red-light vocabulary, self-audit checklist |
| `references/7-day-matrix.md` | Daily themes, pillars, tone anchors, hook patterns, variety rules |
| `references/asset-formats.md` | Exact templates for Video Script, GEO Article, LinkedIn Post |
| `references/hook-library.md` | 10 hook structures + selection protocol |

---

## Execution Model

This skill runs as a **5-pass sequential process**. Each pass is a separate invocation
with a clean context window. State files written to `data/content-runs/{runId}/` persist
approved output between passes.

```
Pass 1  →  Market Analysis + Hook Selections + Run State Init
Pass 2  →  Week 1: 7 days × 3 assets
Pass 3  →  Week 2: 7 days × 3 assets (reads approved Week 1 as benchmark)
Pass 4  →  Week 3: 7 days × 3 assets (reads approved Weeks 1–2 as benchmark)
Pass 5  →  Week 4 + Final Assembly (reads approved Weeks 1–3, assembles master calendar)
```

**Anti-degradation rule:** Never generate more than one week per invocation. Each week must
receive explicit approval before the next pass begins. If quality drops between weeks,
re-run the failing week's pass with corrected input — do not continue to the next week.

---

## STEP 0 — Context Ingestion (all passes)

Before any generation, declare your loaded state:

```
LOADED CONTEXT:
- Brand: IEI Ventures (Ideas Equal Income)
- Tone profile: BOLD. DIRECT. BUILT.
- Voice: Analyst / Operator / Challenger / Forensic / Builder / Partnership / Proof
- 6 Content Pillars: Blueprint, ROI Equation, Autopsy, AI Paradox, UGC/Affiliate, Channel Takeover
- 7-Day Matrix: loaded
- Asset formats: loaded (Video Script, GEO Article, LinkedIn Post)
- Hook library: loaded (10 structures)
- Tone Guard: loaded (green-light / red-light enforcement)
```

If any of the above is NOT loaded, stop. Do not proceed. The reference files were not inlined.

---

## STEP 1 — Market Analysis + Hook Selection (Pass 1 only)

### 1A. Trend Research

Run exactly 3 WebSearch queries targeting the current week's marketing/AI landscape:

```
Query 1: "AI marketing automation brand strategy [current month year] news"
Query 2: "B2B SaaS brand consistency ROI data [current year]"
Query 3: "agency white-label platform news [current month year]"
```

From the search results, extract exactly 3 trending topics relevant to IEI's ICA:
- B2B founders
- Marketing agency owners
- Vendasta partners / SaaS integrators
- Enterprise marketing teams

Document each topic with: source, headline, data point or dollar figure found.

### 1B. Hook Selection

After completing trend analysis, select exactly 3 hook structures from the hook library
that best align with the 3 trending topics. Apply the selection protocol:

```
HOOK SELECTIONS FOR THIS BATCH:
Trending Topic 1: [topic] → Hook Structure [#]: [reason for fit]
Trending Topic 2: [topic] → Hook Structure [#]: [reason for fit]
Trending Topic 3: [topic] → Hook Structure [#]: [reason for fit]
```

Rules:
- The 3 selected structures become the primary hooks for their matched day types
- The remaining 4 days can use any non-selected structures
- No structure may be used more than twice across the 7 days of Week 1

### 1C. Run State Init

Write a `run-state.json` file to `data/content-runs/{runId}/run-state.json`:

```json
{
  "runId": "{runId}",
  "startDate": "{ISO date}",
  "status": "week_1_pending",
  "trendingTopics": [
    { "topic": "", "source": "", "dataPoint": "" },
    { "topic": "", "source": "", "dataPoint": "" },
    { "topic": "", "source": "", "dataPoint": "" }
  ],
  "hookSelections": {
    "topic1": { "hook": 0, "reason": "" },
    "topic2": { "hook": 0, "reason": "" },
    "topic3": { "hook": 0, "reason": "" }
  },
  "weeksApproved": [],
  "varietyTracker": {
    "mondayIndustries": [],
    "thursdayCompanies": [],
    "thursdayWinsVsFailures": [],
    "fridayCapabilities": [],
    "saturdayPlatforms": [],
    "sundayFrameTypes": []
  }
}
```

### Output of Pass 1

- `run-state.json` written to disk
- Summary printed:

```
MARKET ANALYSIS COMPLETE
------------------------
Topic 1: [topic] — [data point]
Topic 2: [topic] — [data point]
Topic 3: [topic] — [data point]

HOOK SELECTIONS:
Topic 1 → Hook #[N]: [structure name]
Topic 2 → Hook #[N]: [structure name]
Topic 3 → Hook #[N]: [structure name]

STATUS: Awaiting Week 1 generation approval.
```

---

## STEP 2 — Week Generation (Passes 2–4)

Each week pass follows the identical generation procedure below.
The only difference between weeks: each pass reads the prior approved week's
assets as a benchmark for variety enforcement.

### 2A. Pre-Generation Planning

Before drafting any asset, plan all 7 days:

```
WEEK [N] PLAN:
Monday: Hook structure [#], Industry: [name], Trending topic: [which of 3]
Tuesday: Blueprint workflow category: [name], Hook structure [#]
Wednesday: AI assumption under attack: [specific assumption]
Thursday: Company: [name], Win or Failure: [which], Data point: [$X/metric]
Friday: Product capability: [which]
Saturday: Platform/agency type: [which], Partner: [name]
Sunday: Frame type: [affiliate/testimonial/side-revenue]
```

Verify against variety tracker before committing to the plan:
- Monday industry NOT in `varietyTracker.mondayIndustries`
- Thursday company NOT in `varietyTracker.thursdayCompanies`
- Friday capability NOT in `varietyTracker.fridayCapabilities`
- Saturday platform NOT in `varietyTracker.saturdayPlatforms`

### 2B. Daily Asset Generation

Generate each day in sequence: Monday → Tuesday → Wednesday → Thursday → Friday → Saturday → Sunday.

For each day, generate all 3 assets before moving to the next day.

**Generation order per day:**
1. Asset A — Video Script
2. Asset B — GEO Article
3. Asset C — LinkedIn Post

**After each asset, run the Tone Guard self-audit:**

```
TONE AUDIT — [Asset type] [Day]:
[ ] No red-light words or phrases present
[ ] First sentence leads with outcome or active verb
[ ] No passive voice
[ ] No sentence exceeds 20 words
[ ] Sounds like a builder, not a marketer
[ ] Video hook delivers payoff in under 3 seconds
[ ] LinkedIn opens with noun or number (not "I")
[ ] GEO H2/H3 headers use active verbs
[ ] At least one specific data point cited
[ ] IEI Dashboard referenced as the mechanism
AUDIT RESULT: PASS / FAIL [list any failures with rewrite]
```

Do NOT mark an asset final if any audit item fails. Rewrite and re-audit.

### 2C. Hook Variety Check (after all 7 days are drafted)

Run the cross-week variety rules:

```
HOOK VARIETY CHECK — WEEK [N]:
1. First word of each hook: [Mon: X, Tue: X, Wed: X, Thu: X, Fri: X, Sat: X, Sun: X]
   — All 7 first words are different? [YES/NO]
2. Any structure used more than twice? [YES/NO — list]
3. Industry coverage in Monday hook: [industry]
   — Already used in prior weeks? [YES/NO]
4. Thursday company: [company]
   — Already autopsied in this 4-week block? [YES/NO]
5. Friday capability: [capability]
   — Already used in this 4-week block? [YES/NO]
   — At least 2 of 4 Thursday Autopsies non-US brand? [TRACKING]
```

If any rule fails, revise the relevant asset before writing to disk.

### 2D. Write Week to Disk

Write all 7 days as a single markdown file:
`data/content-runs/{runId}/week-{N}-draft.md`

Format:

```markdown
# Week [N] — IEI Content Calendar
Generated: [ISO datetime]

---

## Monday — THE SIGNAL

### Asset A: Video Script
[full video script using exact Asset A template]

### Asset B: GEO Article
[full GEO article using exact Asset B template]

### Asset C: LinkedIn Post
[full LinkedIn post using exact Asset C template]

---

## Tuesday — THE BLUEPRINT
[same structure...]

[...continue for all 7 days]
```

### 2E. Week Summary

After writing to disk, print:

```
WEEK [N] COMPLETE
-----------------
Monday (Signal):    [hook first line — max 10 words]
Tuesday (Blueprint): [hook first line]
Wednesday (AI Paradox): [hook first line]
Thursday (Autopsy): [hook first line]
Friday (Sandbox):   [hook first line]
Saturday (Hitlist): [hook first line]
Sunday (Growth):    [hook first line]

Tone Audit: All 21 assets PASSED
Hook Variety: All 7 variety rules SATISFIED
File written: data/content-runs/{runId}/week-{N}-draft.md

STATUS: Awaiting approval to proceed to Week [N+1].
```

---

## STEP 3 — Week 2 and Week 3 Generation (Passes 3–4)

Each of these passes begins by reading the approved prior week(s) file(s) to extract:

1. First words used in all hooks (to enforce no same first word within any week)
2. Industries already used in Monday hooks
3. Companies already autopsied in Thursday
4. Product capabilities already used in Friday
5. Platforms already called out in Saturday
6. Hook structures already used (track usage per structure across all weeks)

Document the benchmark state before generating:

```
BENCHMARK STATE AT WEEK [N] START:
Monday industries used: [list]
Thursday companies used: [list]
Friday capabilities used: [list]
Saturday platforms used: [list]
Hook structure usage: {1: N, 2: N, ...10: N}
```

Then proceed identically to Step 2 (same generation procedure, same tone audit, same variety check).

---

## STEP 4 — Week 4 + Final Assembly (Pass 5)

### 4A. Generate Week 4

Follow the full Week Generation procedure (Step 2) with all prior 3 weeks loaded as benchmark.

Before generating Week 4's Thursday Autopsy, verify:
- At least 2 of the 4 Thursday Autopsies across all 4 weeks are non-US brands
- If Weeks 1–3 have 0 or 1 non-US brands, Week 4 Thursday MUST be a non-US brand

### 4B. Final Self-Audit

After Week 4 is written, run the master quality gate across all 4 weeks:

```
MASTER QUALITY GATE
-------------------

CROSS-WEEK VARIETY RULES:
[ ] 4 Monday hooks cover 4 different industries
[ ] No hook structure used more than 3× across all 28 days
[ ] No Thursday company repeated within the 4-week block
[ ] No Friday capability repeated within the 4-week block
[ ] No Saturday platform repeated within the 4-week block
[ ] At least 2 Thursday Autopsies are non-US brands

TONE CONSISTENCY:
[ ] All 84 assets passed individual tone audits
[ ] No red-light vocabulary present in any finalized asset
[ ] IEI Dashboard referenced as the mechanism in at least 3 assets per week
[ ] GEO articles contain at least 1 cited data source each

ASSET FORMAT COMPLIANCE:
[ ] All Video Scripts have HOOK / BODY (3 beats) / CTA structure
[ ] All Video Scripts have text-on-screen overlay lines
[ ] All Video Scripts have visual cues per beat
[ ] All GEO Articles have H1 / Key Takeaways / 3 H2s / H3 What This Means structure
[ ] All LinkedIn Posts open with noun or number (not I/We/question)
[ ] All LinkedIn Posts have max 3 hashtags
[ ] All LinkedIn Posts 150–300 words

STATUS: [PASS / FAIL with specific failures listed]
```

If any master quality gate item fails, revise the relevant assets and re-audit before assembly.

### 4C. Assemble Master Calendar

Write the final master calendar:
`data/content-runs/{runId}/master-calendar.md`

Format:

```markdown
# IEI Ventures — 4-Week Content Calendar
Run ID: {runId}
Generated: [ISO datetime]
Status: APPROVED FOR PRODUCTION

---

## Campaign Overview

**Trending Topics This Cycle:**
1. [Topic 1] — [source + data point]
2. [Topic 2] — [source + data point]
3. [Topic 3] — [source + data point]

**Hook Selections Applied:**
- [Topic 1] → Hook #[N]: [structure name]
- [Topic 2] → Hook #[N]: [structure name]
- [Topic 3] → Hook #[N]: [structure name]

**Industry Coverage (Monday Signals):**
- Week 1: [industry]
- Week 2: [industry]
- Week 3: [industry]
- Week 4: [industry]

**Thursday Autopsy Companies:**
- Week 1: [company] ([win/failure])
- Week 2: [company] ([win/failure])
- Week 3: [company] ([win/failure])
- Week 4: [company] ([win/failure])

---

[Full Week 1 content]
[Full Week 2 content]
[Full Week 3 content]
[Full Week 4 content]
```

Also write a JSON index for programmatic access:
`data/content-runs/{runId}/index.json`

```json
{
  "runId": "{runId}",
  "status": "complete",
  "generatedAt": "{ISO datetime}",
  "weeks": [
    {
      "week": 1,
      "file": "week-1-draft.md",
      "approved": true,
      "approvedAt": "{ISO datetime}"
    }
  ],
  "masterCalendar": "master-calendar.md",
  "assetCount": 84,
  "qualityGate": "PASS"
}
```

### 4D. Final Output

Print the completion summary:

```
CONTENT ENGINE — RUN COMPLETE
==============================

Run ID: {runId}
Total assets generated: 84 (28 days × 3 assets)
Quality gate: PASS

WEEK-BY-WEEK SUMMARY:
Week 1: [7 hook first lines]
Week 2: [7 hook first lines]
Week 3: [7 hook first lines]
Week 4: [7 hook first lines]

FILES WRITTEN:
✓ data/content-runs/{runId}/run-state.json
✓ data/content-runs/{runId}/week-1-draft.md
✓ data/content-runs/{runId}/week-2-draft.md
✓ data/content-runs/{runId}/week-3-draft.md
✓ data/content-runs/{runId}/week-4-draft.md
✓ data/content-runs/{runId}/master-calendar.md
✓ data/content-runs/{runId}/index.json

STATUS: Ready for production scheduling.
Next action: Import master-calendar.md into your content scheduling tool.
```

---

## Quality Standards Summary

Every asset produced by this skill must clear these bars before it is final:

| Standard | Requirement |
|----------|-------------|
| Hook impact | Payoff in first 7 words. No setup sentences. |
| Tone | BOLD. DIRECT. BUILT. Zero red-light words. |
| Data | At least 1 specific number, dollar figure, or metric per asset |
| IEI mechanism | Dashboard/system named as the mechanism — not abstract capability |
| Video script | 30–60 second runtime. Hook under 10 words. 3 beats + CTA. |
| GEO article | 600–900 words. H2s with active verbs. Entity names, not pronouns. |
| LinkedIn post | 150–300 words. Noun/number opener. Max 3 hashtags. |
| Variety | No same industry/company/capability/platform across 4 weeks |

---

## Failure Recovery Protocol

**If a week's tone audit fails on more than 3 assets:**
Stop. Do not continue to the next day. Fix all failures in the current day first,
then re-audit, then continue.

**If the hook variety check fails:**
Revise only the specific hook that violates the rule. Do not rewrite entire assets.
Change the hook structure and re-audit Asset A only.

**If the master quality gate fails:**
Log the specific failures. Revise only the failing assets.
Re-run the master quality gate after revision. Do not regenerate entire weeks.

**If a WebSearch returns no usable data points:**
Fall back to the IEI brand context for data. Cite the IEI Dashboard's benchmark metrics.
Do not use vague qualitative claims as substitutes for hard numbers.
