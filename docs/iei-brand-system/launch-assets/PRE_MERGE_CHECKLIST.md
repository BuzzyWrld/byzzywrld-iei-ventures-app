# Pre-Merge Checklist — `content-engine` → `main`

**For:** Henrique (BE dev)
**Reviewer:** Tab (final PR approval + customer-side smoke test)
**Estimated time:** 4-6 hours focused work for Henrique + ~30 min Tab review

**Status legend:** ⬜ not started · 🟡 in progress · ✅ done · 🚫 blocked

---

## 🧪 VERIFICATION (Henrique — must-do before merge)

- ⬜ Rebase or merge `main` into `content-engine` (main moved when docs landed — resolve any conflicts)
- ⬜ Run `npm run build` — TypeScript compiles cleanly, no new errors
- ⬜ Smoke-test each new endpoint via curl/Postman:
  - ⬜ `POST /api/chat/start` → creates session, returns Q1
  - ⬜ `POST /api/chat/turn` → next question + extracts intake fields
  - ⬜ `POST /api/chat/[id]/complete` → triggers synthesis + generation
  - ⬜ `POST /api/synthesize` → returns `IEIBrandFoundation` JSON
  - ⬜ `POST /api/stripe/webhook` → tested with Stripe CLI test events
  - ⬜ Preview file URLs (watermarked) → return correct files with auth gate
  - ⬜ Accept endpoint → triggers clean file generation + revokes watermarked access
  - ⬜ Decline + refund endpoint → triggers Stripe refund + revokes preview links
- ⬜ **End-to-end happy path:** Stripe test purchase → chat completes → AI generates → Tab review queue gets the brand → approve → watermarked preview email lands → customer accepts → clean files delivered
- ⬜ **Refund flow test:** same flow but customer declines within 7 days → confirm Stripe refund initiated + preview links revoked
- ⬜ **Revision flow test:** customer requests revisions → AI asks 1-2 clarifying questions → regenerates → back to Tab review queue
- ⬜ **Privacy purge test:** complete a brand, wait (or fast-forward retention timer), verify personal-narrative fields are deleted but business data retained
- ⬜ **Stripe webhook idempotency:** send same `checkout.session.completed` event twice → verify only ONE BrandProject is created

## 📚 DOCUMENTATION (Henrique — must-do before merge)

- ⬜ `.env.example` updated with all new env vars (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `ANTHROPIC_API_KEY`, email provider creds, blob storage, etc.)
- ⬜ **`docs/iei-brand-system/API_CONTRACTS.md`** — written for Buzzy. Every new endpoint with: HTTP method + path, request shape, response shape, error format, example payloads. **This is the #1 unblocker for FE work — Buzzy can't build the chat UI without it.**
- ⬜ `README.md` updated with how to run new flows locally
- ⬜ DB schema/migration notes if anything changed (which tables, which fields, any new indexes)

## 🧹 CODE HYGIENE (Henrique — nice-to-have but catch what you can)

- ⬜ No `console.log` debug statements left in production paths
- ⬜ Error handling on Anthropic API + Stripe + email provider (graceful failures, not crashes)
- ⬜ Rate-limit handling + retry on Anthropic (exponential backoff)
- ⬜ No new `any` types in critical paths
- ⬜ Secrets never logged (verify webhook signing, API keys, etc.)

## 🚀 MERGE PROCESS

- ⬜ **Henrique:** Open a PR from `content-engine` → `main` with a clear description listing what's in it
- ⬜ **Tab:** Review the PR diff (~15 min eyeball — look for obvious issues, large files, leaked secrets, off-vibe code)
- ⬜ **Tab:** Approve the PR
- ⬜ **Henrique:** Merge with merge commit (preserves history)
- ⬜ **Henrique:** Deploy to staging (Vercel auto-deploys preview if configured)
- ⬜ **Tab:** Final customer-side smoke test — go through the entire flow as a user would (buy via Stripe test → fill chat → wait for preview → accept → confirm files received). This is the real acceptance test.

---

## ✋ Note for Henrique

If anything in the e2e tests behaves weird or unexpectedly — **stop and flag it before merging.** Better to delay a merge by a day than to merge broken code that a real paying customer will hit on day 1.

If you discover something fixable in <30 min, fix it. If it's a structural issue, flag it and we triage.

## ✋ Note for Tab

Your PR review doesn't need to understand every line of code. You're looking for:
- 🚨 Massive files (anything >500 lines)
- 🚨 Anything that looks like a hardcoded API key or password
- 🚨 Anything in the diff that has nothing to do with this work (random tweaks elsewhere)
- 🚨 Anything that looks like it would break existing features

When in doubt, comment on the PR with "what does this do?" and let Henrique explain.

---

**Last updated:** 2026-05-21
