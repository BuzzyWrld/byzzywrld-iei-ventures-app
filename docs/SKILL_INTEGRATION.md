# Brand Playbook Skill Integration

## What we received

Buzz delivered the real Brand Playbook skill as a `.skill` file — a zip
containing a Claude Code skill. Extracted and installed at:

```
iei-ventures/skills/brand-playbook/
  SKILL.md                       # 410 lines — main procedure
  references/
    worksheets.md                # 10 brand worksheet prompts
    color-theory.md              # palette selection rules
    logo-theory.md               # logo typology + variant rules
    social-sizes.md              # platform sizing reference
```

## What the skill is

A **prompt-based procedure** (not a runnable program). It instructs Claude
to build a complete brand playbook in five steps:

1. Detect mode (full intake / partial / pure creation)
2. Build the 10-worksheet brand foundation internally
3. Design the brand kit (colors, typography, logo system)
4. Plan playbook structure (18–28 portrait pages)
5. Write PDF-native HTML + render via screenshot pipeline

Output: a complete multi-page brand playbook as HTML + PDF, plus the
brand JSON context summary.

## How we execute it

The skill is designed to run inside Claude Code's interactive sandbox. For
our self-hosted dashboard, the right integration is the
**Claude Agent SDK** (`@anthropic-ai/claude-agent-sdk`) server-side:

- Load `SKILL.md` (and its reference files) as the system prompt
- Pass intake JSON + desired output directory as the user message
- Give Claude the `Write`, `Read`, and `Bash` tools to generate files
- Claude produces `brand.json`, `playbook.html`, `landing.html`, `logo.svg`
  at the output path
- **Post-process**: we render `playbook.html` → PDF ourselves via
  Playwright (see `src/lib/pdf.ts` — Day 3). The skill's referenced
  `presentation-pdf` skill is claude.ai-sandbox-only and not available in
  the Agent SDK.

## Environment variables needed

```
ANTHROPIC_API_KEY=sk-ant-...       # required for real skill execution
SKILL_ADAPTER=agent-sdk            # switch from 'stub' to the real adapter
```

Until `SKILL_ADAPTER=agent-sdk` is set, the dashboard runs the `stub`
adapter (no API cost, produces placeholder outputs so the UI works).

## Adapter architecture

See `src/lib/skills/`:

```
contract.ts      # BrandPlaybookSkill interface, SkillManifest type
stub.ts          # built-in placeholder adapter (default)
subprocess.ts    # CLI-based adapter (unused today; kept for flexibility)
index.ts         # factory, switches on SKILL_ADAPTER env var
```

To add the real adapter:

```ts
// src/lib/skills/agent-sdk.ts (TODO — requires ANTHROPIC_API_KEY)
import { query } from "@anthropic-ai/claude-agent-sdk";
import fs from "node:fs/promises";
import path from "node:path";

export function makeAgentSdkSkill(): BrandPlaybookSkill {
  return {
    id: "agent-sdk@1",
    async run(intake, { outputDir, onProgress }) {
      const skillMd = await fs.readFile(
        path.join(process.cwd(), "skills/brand-playbook/SKILL.md"),
        "utf8"
      );
      // Load reference files into context
      const refs = await Promise.all(
        ["worksheets", "color-theory", "logo-theory", "social-sizes"].map((n) =>
          fs.readFile(
            path.join(process.cwd(), `skills/brand-playbook/references/${n}.md`),
            "utf8"
          )
        )
      );

      const systemPrompt = [skillMd, ...refs].join("\n\n---\n\n");
      const userPrompt = `Build a brand playbook for this intake. Write all output files to ${outputDir}. Produce: brand.json, playbook.html, landing.html, logo.svg.\n\nIntake:\n${JSON.stringify(intake, null, 2)}`;

      for await (const msg of query({
        systemPrompt,
        prompt: userPrompt,
        options: {
          allowedTools: ["Write", "Read", "Bash"],
          permissionMode: "acceptEdits",
          cwd: outputDir,
        },
      })) {
        if ("text" in msg) onProgress?.(msg.text.slice(0, 80));
      }

      // Post-process: render playbook.html → playbook.pdf via Playwright
      await renderPdf(path.join(outputDir, "playbook.html"), path.join(outputDir, "playbook.pdf"));

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
```

Then in `src/lib/skills/index.ts`, add the `agent-sdk` branch.

## PDF rendering pipeline (Day 3)

The skill writes `playbook.html` with `.page` divs of 850×1100px. Our
Playwright post-processor must:

1. Launch Chromium with `--font-render-hinting=none --disable-font-subpixel-positioning`
2. Load the HTML
3. For each `.page` div — screenshot at `deviceScaleFactor: 3`
4. Assemble screenshots into a single PDF at 360 DPI (using `pdf-lib`)
5. Never call `page.pdf()` — produces font blur per brief slide 05

Spec: brief slide 05, `SKILL.md` Step 4 ("Write PDF-Native HTML") and
Step 5 ("Render + Deliver").

## When Buzz is ready to iterate on the skill

The skill is now in the repo — he can clone, edit `SKILL.md` or the
reference files, and push. Changes pick up on next skill invocation
(no server restart needed; we re-read the files per run).
