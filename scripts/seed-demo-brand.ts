/**
 * Seeds one fully-built demo brand into the local DB so the dashboard isn't
 * empty on first impression for Tabitha/Buzz. Runs the full orchestrator
 * (main skill + 6 variant generators) end-to-end.
 *
 * Usage:
 *   npm run seed:demo                                # built-in intake
 *   npm run seed:demo -- path/to/intake.json         # custom intake
 *   USER_EMAIL=foo@bar.com npm run seed:demo         # pick a different user
 */
import fs from "node:fs";
import path from "node:path";

const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
    }
  }
}

import Database from "better-sqlite3";
import { enqueueBrandBuild, getBrand, triggerPhase2 } from "../src/lib/skill";
import { updateBrand } from "../src/lib/db";
import { BrandIntakeSchema } from "../src/lib/types";

const DEFAULT_INTAKE = {
  companyName: "Halcyon Credit Partners",
  productDescription:
    "A private credit fund providing flexible non-dilutive capital to growth-stage software companies — direct lending, revenue-based financing, and structured equity bridges.",
  industry: "Private Credit / Alternative Asset Management",
  targetAudience:
    "Founders and CFOs of $5M-$50M ARR B2B SaaS companies seeking growth capital without giving up board seats or large equity stakes",
  toneOfVoice: "confident, institutional, plain-spoken, founder-aligned",
  competitors: "Lighter Capital, Capchase, Founderpath, Arc Technologies",
  archetype: "sage",
  palettePreference: "deep navy + brass + parchment",
  notes:
    "Position as the anti-VC: capital that respects the cap table. Heritage feel, not fintech-bright. Should look like a 50-year-old advisory firm that happens to deploy capital fast.",
};

function pickUser(): { id: string; tenantId: string; email: string } {
  const dbPath = path.join(process.cwd(), "data", "iei.db");
  const db = new Database(dbPath, { readonly: true });
  const wanted = process.env.USER_EMAIL;
  const row = wanted
    ? db.prepare("SELECT id, email, tenant_id FROM users WHERE email = ?").get(wanted)
    : db.prepare("SELECT id, email, tenant_id FROM users LIMIT 1").get();
  db.close();
  if (!row) {
    throw new Error(
      `no user found${wanted ? ` for ${wanted}` : ""} — sign up via /signup first`
    );
  }
  const r = row as { id: string; email: string; tenant_id: string };
  return { id: r.id, email: r.email, tenantId: r.tenant_id };
}

async function main() {
  const intakePath = process.argv[2];
  const raw = intakePath
    ? JSON.parse(fs.readFileSync(intakePath, "utf8"))
    : DEFAULT_INTAKE;
  const intake = BrandIntakeSchema.parse(raw);

  const user = pickUser();
  console.log(`[seed] user=${user.email} tenant=${user.tenantId}`);
  console.log(`[seed] adapter=${process.env.SKILL_ADAPTER ?? "stub"}`);
  console.log(`[seed] brand="${intake.companyName}"\n`);

  const { project } = await enqueueBrandBuild(intake, {
    userId: user.id,
    tenantId: user.tenantId,
  });
  console.log(`[seed] queued id=${project.id}`);

  let lastStage = "";
  let lastPct = -1;
  const startedAt = Date.now();
  const TIMEOUT_MS = 15 * 60 * 1000; // 15 min hard cap (heritage brands w/ 15+ playbook pages can run 11+ min)

  while (true) {
    await new Promise((r) => setTimeout(r, 1500));
    const cur = await getBrand(project.id);
    if (!cur) {
      console.error("[seed] brand vanished from DB");
      process.exit(1);
    }

    const stage = cur.progressStage ?? "";
    const pct = Math.round((cur.progressPct ?? 0) * 100);
    if (stage !== lastStage || pct !== lastPct) {
      const elapsed = Math.round((Date.now() - startedAt) / 1000);
      console.log(`[${elapsed}s] ${cur.status} · ${stage} (${pct}%)`);
      lastStage = stage;
      lastPct = pct;
    }

    if (cur.status === "complete") {
      // Sequential generation: Phase 1 finishes with status="complete" and
      // logoVariants populated but the rest of the variants empty. Auto-pick
      // the first logo to trigger Phase 2 (simulating user behavior) and
      // keep polling. We auto-pick at most once per build.
      const phase1Done =
        (cur.outputs.logoVariants?.length ?? 0) > 0 &&
        !cur.outputs.primaryLogoKey &&
        !cur.outputs.devBrief;
      if (phase1Done) {
        const firstKey = cur.outputs.logoVariants![0].key;
        console.log(
          `\n[seed] PHASE 1 DONE in ${Math.round((Date.now() - startedAt) / 1000)}s — auto-picking logo "${firstKey}" to trigger Phase 2`
        );
        // Inline the pick + Phase 2 trigger so we don't depend on the dev server.
        const pickedUrl = cur.outputs.logoVariants![0].url;
        await updateBrand(cur.id, {
          outputs: {
            ...cur.outputs,
            primaryLogoKey: firstKey,
            logoSvg: pickedUrl,
          },
        });
        await triggerPhase2(cur.id);
        lastStage = "";
        lastPct = -1;
        continue;
      }
      // True "all phases complete" — print summary and exit.
      console.log(`\n[seed] DONE in ${Math.round((Date.now() - startedAt) / 1000)}s`);
      console.log(`[seed] open: http://localhost:3030/brands/${project.id}`);
      console.log(`[seed] outputs:`);
      const o = cur.outputs;
      const list: Array<[string, unknown]> = [
        ["brand.json", o.brandJson],
        ["playbook.html", o.playbookHtml],
        ["playbook.pdf", o.playbookPdf],
        ["landing.html", o.landingHtml],
        ["logo.svg", o.logoSvg],
        ["logo variants", o.logoVariants?.length ?? 0],
        ["landing variants", o.landingVariants?.length ?? 0],
        ["palette expansion", o.paletteExpansion ? "yes" : "no"],
        ["social kit", o.socialKit?.length ?? 0],
        ["pitch one-pager", o.pitchOnePager ? "yes" : "no"],
        ["email kit", o.emailKit ? "yes" : "no"],
        ["dev brief", o.devBrief ? "yes" : "no"],
      ];
      for (const [k, v] of list) console.log(`  - ${k}: ${v}`);
      process.exit(0);
    }
    if (cur.status === "failed") {
      console.error(`\n[seed] FAILED: ${cur.error}`);
      process.exit(1);
    }
    if (Date.now() - startedAt > TIMEOUT_MS) {
      console.error("\n[seed] TIMEOUT — orchestrator still running, killing script");
      process.exit(1);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
