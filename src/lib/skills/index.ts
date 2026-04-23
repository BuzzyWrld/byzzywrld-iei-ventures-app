/**
 * Skill registry — picks the right adapter at runtime.
 *
 * Env:
 *   SKILL_ADAPTER=stub        → built-in placeholder (default, no API cost)
 *   SKILL_ADAPTER=agent-sdk   → real skill via @anthropic-ai/claude-agent-sdk
 *                               requires ANTHROPIC_API_KEY  (~$0.18/brand on Haiku)
 *   SKILL_ADAPTER=deepseek    → DeepSeek V3 via OpenAI-compatible API
 *                               requires DEEPSEEK_API_KEY  (~$0.05/brand)
 *   SKILL_ADAPTER=kimi        → Moonshot Kimi via OpenAI-compatible API
 *                               requires KIMI_API_KEY or MOONSHOT_API_KEY
 *   SKILL_ADAPTER=subprocess  → external CLI; requires SKILL_CMD
 */
import type { BrandPlaybookSkill } from "./contract";
import { stubSkill } from "./stub";
import { agentSdkSkill } from "./agent-sdk";
import { deepseekSkill, kimiSkill } from "./openai-compat";
import { makeSubprocessSkill } from "./subprocess";

export * from "./contract";

let _skill: BrandPlaybookSkill | null = null;

export function skill(): BrandPlaybookSkill {
  if (_skill) return _skill;
  const adapter = (process.env.SKILL_ADAPTER ?? "stub").toLowerCase();
  if (adapter === "agent-sdk") {
    _skill = agentSdkSkill;
  } else if (adapter === "deepseek") {
    _skill = deepseekSkill();
  } else if (adapter === "kimi") {
    _skill = kimiSkill();
  } else if (adapter === "subprocess") {
    const cmd = process.env.SKILL_CMD;
    if (!cmd) throw new Error("SKILL_ADAPTER=subprocess requires SKILL_CMD env var");
    _skill = makeSubprocessSkill(cmd);
  } else {
    _skill = stubSkill;
  }
  return _skill;
}
