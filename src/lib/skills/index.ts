/**
 * Skill registry — picks the right adapter at runtime.
 *
 * Env:
 *   SKILL_ADAPTER=stub        → built-in placeholder (default)
 *   SKILL_ADAPTER=subprocess  → external CLI; requires SKILL_CMD
 */
import type { BrandPlaybookSkill } from "./contract";
import { stubSkill } from "./stub";
import { makeSubprocessSkill } from "./subprocess";

export * from "./contract";

let _skill: BrandPlaybookSkill | null = null;

export function skill(): BrandPlaybookSkill {
  if (_skill) return _skill;
  const adapter = (process.env.SKILL_ADAPTER ?? "stub").toLowerCase();
  if (adapter === "subprocess") {
    const cmd = process.env.SKILL_CMD;
    if (!cmd) throw new Error("SKILL_ADAPTER=subprocess requires SKILL_CMD env var");
    _skill = makeSubprocessSkill(cmd);
  } else {
    _skill = stubSkill;
  }
  return _skill;
}
