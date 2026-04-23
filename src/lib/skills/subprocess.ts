/**
 * Subprocess skill adapter — for when Buzz delivers his skill as a CLI
 * (Python script, node CLI, or packaged Claude Code skill).
 *
 * Invocation contract (the CLI must implement):
 *   $ <cmd> <intake.json path> <output dir path>
 *
 * The CLI must:
 *  - read BrandIntake JSON from the first arg
 *  - write all output files to the second arg
 *  - print a single JSON SkillManifest to stdout on success
 *  - stream progress to stderr as lines `PROGRESS <stage> <pct?>`
 *  - exit 0 on success, non-zero on failure (stderr = error)
 *
 * Configure via env:
 *   SKILL_ADAPTER=subprocess
 *   SKILL_CMD=/path/to/run-skill      (or e.g. "python3 ./skills/brand-playbook/main.py")
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import type { BrandIntake } from "@/lib/types";
import {
  BrandPlaybookSkill,
  SkillError,
  SkillManifest,
  SkillRunContext,
} from "./contract";

function makeSubprocessSkill(cmd: string): BrandPlaybookSkill {
  return {
    id: `subprocess@${cmd}`,
    async run(intake: BrandIntake, ctx: SkillRunContext): Promise<SkillManifest> {
      const { outputDir, onProgress, signal } = ctx;
      fs.mkdirSync(outputDir, { recursive: true });

      const tmpIntake = path.join(os.tmpdir(), `intake-${Date.now()}.json`);
      fs.writeFileSync(tmpIntake, JSON.stringify(intake, null, 2));

      const [bin, ...baseArgs] = cmd.split(" ").filter(Boolean);
      const args = [...baseArgs, tmpIntake, outputDir];

      return await new Promise<SkillManifest>((resolve, reject) => {
        const child = spawn(bin, args, { signal });
        let stdout = "";
        let stderr = "";

        child.stdout.on("data", (d) => (stdout += d.toString()));
        child.stderr.on("data", (d) => {
          const chunk = d.toString();
          stderr += chunk;
          for (const line of chunk.split("\n")) {
            const m = line.match(/^PROGRESS\s+(.+?)(?:\s+([\d.]+))?$/);
            if (m) onProgress?.(m[1], m[2] ? Number(m[2]) : undefined);
          }
        });

        child.on("error", (err) =>
          reject(new SkillError(`failed to spawn skill: ${err.message}`, "SPAWN_FAILED"))
        );

        child.on("close", (code) => {
          fs.rmSync(tmpIntake, { force: true });
          if (code !== 0) {
            return reject(
              new SkillError(
                `skill exited with code ${code}: ${stderr.slice(-500)}`,
                "NONZERO_EXIT"
              )
            );
          }
          try {
            const manifest = JSON.parse(stdout.trim()) as SkillManifest;
            resolve(manifest);
          } catch (err) {
            reject(
              new SkillError(
                `skill stdout was not valid SkillManifest JSON: ${stdout.slice(0, 300)}`,
                "BAD_MANIFEST"
              )
            );
          }
        });
      });
    },
  };
}

export { makeSubprocessSkill };
