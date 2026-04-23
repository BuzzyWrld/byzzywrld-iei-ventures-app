/**
 * CLI entry for running the active skill adapter against a sample intake.
 * Useful for offline testing without spinning up the Next server.
 *
 * Usage:
 *   npm run skill                            # uses sample intake
 *   npm run skill -- path/to/intake.json     # uses custom intake
 *   SKILL_ADAPTER=agent-sdk npm run skill    # switches adapter
 */
import fs from "node:fs";
import path from "node:path";

// Load .env.local for this standalone CLI (Next.js does this automatically,
// but we're running outside Next). Quiet failure if missing — stub adapter
// needs no env vars.
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
    }
  }
}

import { skill } from "../src/lib/skills";
import { BrandIntakeSchema } from "../src/lib/types";

const SAMPLE_INTAKE = {
  companyName: "Aurelian Labs",
  industry: "AI / Financial Services",
  targetAudience: "Capital markets operators",
  toneOfVoice: "confident, precise, modern",
  competitors: "Hebbia, Harvey",
  archetype: "sage",
  palettePreference: "",
  notes: "Prestige institutional feel; deep navy or forest + brass accent.",
};

async function main() {
  const intakePath = process.argv[2];
  const raw = intakePath ? JSON.parse(fs.readFileSync(intakePath, "utf8")) : SAMPLE_INTAKE;
  const intake = BrandIntakeSchema.parse(raw);

  const outDir = path.join(process.cwd(), "outputs", `cli-${Date.now()}`);
  fs.mkdirSync(outDir, { recursive: true });

  const s = skill();
  console.log(`[skill] adapter=${s.id}`);
  console.log(`[skill] outputDir=${outDir}\n`);

  const manifest = await s.run(intake, {
    outputDir: outDir,
    onProgress: (stage, pct) => {
      const p = pct !== undefined ? ` (${Math.round(pct * 100)}%)` : "";
      console.log(`[skill] ${stage}${p}`);
    },
  });

  console.log("\n[skill] manifest:", manifest);
  console.log(`[skill] ${outDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
