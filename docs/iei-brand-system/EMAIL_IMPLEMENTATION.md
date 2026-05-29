# Email Implementation Spec — for Henrique (Task #35)

**Status:** 🔴 LAUNCH BLOCKER — every email send is currently stubbed (`console.log('[email-stub]')`). The customer journey cannot run until this is wired.
**Owner:** Henrique (BE) — build · Tab — Resend account + domain verification
**Provider decision:** **Resend** (best Next.js DX, generous free tier)
**Estimated effort:** ~1.5 dev days + Tab's 30-min setup
**Related:** `launch-assets/email-templates.md` (all 11 templates already written) · Task #34 (the cron also closes the auto-signoff timer) · Task #36 (refund email pairs with Stripe refund completion)

---

## 📚 OFFICIAL RESEND DOCS (start here)

- **Main docs:** https://resend.com/docs/introduction
- **Next.js quickstart:** https://resend.com/docs/send-with-nextjs
- **Node SDK reference:** https://resend.com/docs/api-reference/emails/send-email
- **Domain verification guide (SPF/DKIM/DMARC):** https://resend.com/docs/dashboard/domains/introduction
- **Vercel + Resend deploy guide:** https://resend.com/docs/knowledge-base/vercel
- **React Email (optional, for templating):** https://react.email/docs/introduction
- **Cron on Vercel (we already use this pattern):** https://vercel.com/docs/cron-jobs

---

## What Tab is handling (don't wait on the full thing — API key comes after DNS)

1. Resend account created on `admin@ieiventures.com` (free tier: 3,000/mo, 100/day)
2. Domain `ieiventures.com` added + DNS records (SPF/DKIM/DMARC) being verified — **DNS propagation may take a few hours**
3. API key generated → sent to Henrique securely

You can build the whole module + templates + wiring while DNS verifies. Just can't send-test until the domain is green + key is in hand.

---

## Current state of email in the codebase

- ✅ Code is STRUCTURED for email — clean stub functions exist (e.g., `sendWelcomeEmail` in `src/app/api/stripe/webhook/route.ts`)
- ✅ Vercel Cron already configured (`vercel.json` has the daily privacy-purge cron) — **reuse this pattern for reminder emails**
- ❌ No central email module
- ❌ No provider wired — every send is `console.log('[email-stub]')`
- ❌ Scheduled emails (reminders, auto-acceptance) don't exist yet

Stub locations found:
- `src/app/api/stripe/webhook/route.ts:50` — welcome email stub
- `src/app/api/brands/[id]/accept/route.ts:54` — delivery + upgrade-offer email stub
- (plus any other `[email-stub]` / `TODO(email)` comments)

---

## BUILD PLAN

### Step 1 — Install + central module
```bash
npm install resend
```
Create `src/lib/email.ts`:
- One `sendEmail({ to, subject, react/html })` wrapper around the Resend client
- Typed helper functions per template (e.g., `sendWelcomeEmail`, `sendDeliveryEmail`, etc.)
- Read `RESEND_API_KEY` from env
- Sender identity: `Tab <tab@ieiventures.com>` (or `hello@ieiventures.com` — confirm with Tab)
- Add `RESEND_API_KEY` to `.env.local` + `.env.example` + Vercel env vars

### Step 2 — Port the 11 templates
All copy is written in `docs/iei-brand-system/launch-assets/email-templates.md`. Port to code (HTML strings or React Email components — your call; React Email gives nicer maintainability). Keep Tab's voice verbatim — do NOT rewrite the copy.

### Step 3 — Wire the EVENT-triggered emails (replace stubs)

| Email | Route to wire |
|---|---|
| Welcome (post-purchase) | `src/app/api/stripe/webhook/route.ts` (stub already there) |
| Day-after-intake | chat lock-in route (`src/app/api/intake/chat/[sessionId]/lock-in/route.ts`) |
| Delivery / walkthrough | Tab approve-preview route (admin/reviews approve action) |
| Clean-files delivery + Upgrade offer | `src/app/api/brands/[id]/accept/route.ts` (stub already there) |
| Refund confirmation | `src/app/api/brands/[id]/decline-refund/route.ts` (pairs with Task #36 Stripe refund) |
| Internal new-purchase alert → Tab | `src/app/api/stripe/webhook/route.ts` |

### Step 4 — Wire the SCHEDULED emails (cron)

Reuse the existing Vercel Cron pattern (privacy-purge cron is the template). Add ONE new cron route:

**`src/app/api/cron/preview-lifecycle/route.ts`** — runs daily, queries all brands in `preview-sent` state, and based on age since preview email:

| Age | Action |
|---|---|
| 4 days, no customer action | Send Day-4 reminder email |
| 6 days, no customer action | Send Day-6 final reminder email |
| 7 days, no customer action | **Auto-accept** (set status `accepted`) + send auto-acceptance notification email + deliver clean files |

Add to `vercel.json` crons array:
```json
{ "path": "/api/cron/preview-lifecycle", "schedule": "0 9 * * *" }
```
(9am daily — adjust as desired.)

**This single cron also closes Task #34's 7-day auto-signoff timer.** Two birds.

Also handle delayed post-delivery emails here OR as separate logic:
- Exit survey → 3 days post-acceptance
- Testimonial follow-up → 7 days post-acceptance (if NPS positive)

### Step 5 — Test
Send each of the 11 email types to a real inbox. Verify: formatting renders, all merge-fields populate, all links work (chat URL, walkthrough URL, download links, survey link), no `{{unfilled}}` placeholders.

---

## The 11 email touchpoints (full checklist)

- [ ] 1. Welcome (post-purchase) — EVENT
- [ ] 2. Day-after-intake — EVENT
- [ ] 3. Delivery / walkthrough trigger — EVENT
- [ ] 4. Day-4 reminder — CRON
- [ ] 5. Day-6 final reminder — CRON
- [ ] 6. Day-7 auto-acceptance notification — CRON (+ triggers auto-accept)
- [ ] 7. Clean-files delivery (on Accept) — EVENT
- [ ] 8. Upgrade offer (+$1,000 Brand-Storming) — EVENT
- [ ] 9. Refund confirmation — EVENT (pairs with Task #36)
- [ ] 10. Exit survey — delayed/CRON
- [ ] 11. Testimonial follow-up — delayed/CRON
- [ ] (internal) New-purchase alert to Tab — EVENT

---

## Definition of done

- All 11 email types send via Resend (no more `[email-stub]` console.logs anywhere)
- Cron route deployed + verified firing daily
- Auto-acceptance at Day 7 works end-to-end (status flips + clean files deliver + email sends)
- Tested to a real inbox with formatting + links verified
- `RESEND_API_KEY` in Vercel env vars

---

## Notes

- **Free tier (100/day) is fine for Stage 1.** Don't over-buy. Next tier is $20/mo for 50k emails if volume demands.
- Email copy is LOCKED in `email-templates.md` — port verbatim, don't rewrite Tab's voice.
- Refund confirmation email (#9) is blocked on Task #36 (Stripe refund completion) — knock both out together; same route.
- Welcome + delivery emails are the two most critical — if you have to ship incrementally, ship those first.

**Last updated:** 2026-05-26
