# Customer Revision Flow

**Purpose:** What happens when a customer receives their preview and wants changes (not a refund). The "one round of revisions free" experience.

**Triggered by:** Customer clicks "Request Revisions" button in the delivery email.

**Owner:** Tab (content), FE Dev + BE Dev (implementation).

---

## The flow

```
1. Customer receives delivery email
   ↓
2. Customer opens watermarked preview, reviews everything
   ↓
3. Customer clicks one of three buttons in email:
   
   [ Accept Final Delivery ]   [ Request Revisions ]   [ Decline + Refund ]
   ↓
4. If "Request Revisions":
   → Browser opens at ieiventures.com/revise/[brandId]
   → Returns to a NEW chat session (revision mode)
   ↓
5. AI asks 1-2 clarifying questions to gather structured revision input
   ↓
6. AI regenerates affected sections (or full brand if scope warrants)
   ↓
7. New watermarked preview goes back to Tab's review queue
   ↓
8. Tab reviews → approves → customer gets updated preview email
   ↓
9. Customer accepts OR requests round 2 (paid — see escalation)
```

---

## The revision chat — what AI asks

When customer lands in revision mode, AI opens with:

> **Got it — let's refine this.**
>
> Quick question first: which part feels furthest off?
>
> 🎨  **The visuals** (logo, colors, typography, website look)
> 💬  **The messaging** (mission, vision, voice, taglines, copy)
> 🎯  **The strategy** (GTM checklist, content posts, audience)
> 🌀  **Honestly, all of it — let's redo most of it**

Customer picks → AI follows up:

### If "Visuals":

> Tell me specifically — what's not landing?
>
> Examples:
> • "The logo is too playful — I'm more serious"
> • "The colors feel cold — I want warmer tones"
> • "The font feels dated — looking for more modern"
>
> What's the change you'd want to see?

### If "Messaging":

> Got it. Which messaging piece feels off?
>
> ☐ Mission statement
> ☐ Vision statement
> ☐ Tagline (we gave you 3 — none working?)
> ☐ Brand voice (too formal? too playful?)
> ☐ The brand story / About page copy
> ☐ Something else
>
> Tell me what you'd want it to say instead — even rough is fine.

### If "Strategy":

> Which part?
>
> ☐ GTM checklist doesn't match my actual goals
> ☐ Content posts don't sound like me
> ☐ Wrong audience focus
> ☐ Other
>
> What's the change?

### If "All of it":

> Okay — let's regroup. Before we redo everything, two questions:
>
> 1. Did the chat questions capture you accurately, or did we miss something big?
> 2. If you could change ONE thing about the direction, what would it be?
>
> Based on your answers, we'll either tune the existing draft or start fresh.

---

## After the customer answers

The AI parses the input into a structured revision request:

```json
{
  "revisionScope": "messaging" | "visuals" | "strategy" | "full",
  "specificChanges": "string (customer's verbatim input)",
  "affectedSections": ["mission", "tagline", "voice"],
  "preserveTheseElements": ["logo option 2", "color palette"],
  "customerSentiment": "neutral" | "frustrated" | "excited"
}
```

This gets queued for AI regeneration.

---

## Scope rules

**ONE round of revisions free** (per TOS). The "round" includes:
- Up to 3 sections regenerated in a single revision request
- Up to 1 follow-up clarification from customer
- 1 final preview delivery after revision

**What counts as "outside the round":**
- 4+ sections (= probably should start over with new intake)
- Multiple rounds of back-and-forth
- Asking for entirely new deliverables not in their tier

If customer requests more after the free round, AI responds:

> Got it — that's more than the free revision round covers. Two options:
>
> 1. **Upgrade to Brand-Storming with Tab (+$1,000)** — she'll work with you personally to get it exactly right. Unlimited revisions until you love it.
>
> 2. **Single Refinement Pass ($297)** — one more round of AI revisions with Tab's review.
>
> Which works for you?
>
> [Upgrade to Brand-Storming] [Single Refinement Pass] [Actually, accept the current version]

---

## "Decline + Refund" path

If customer clicks "Decline + Refund" in the original email:

```
1. Browser opens at ieiventures.com/refund/[brandId]
   ↓
2. Form asks:
   "Help us improve — what specifically didn't work?"
   [Required free-text field — used for product feedback]
   
   "By requesting this refund, you confirm:"
   ☐ I have not used the preview deliverables commercially
   ☐ I will delete all watermarked preview files I downloaded
   ☐ I understand my access to the brand files will be revoked
   ↓
3. Submit triggers:
   • Stripe refund initiated (5-10 business days to land)
   • Tab notified via email + dashboard
   • Customer's preview download links revoked within 24 hrs
   • Customer's brand project archived (not deleted — kept for 90 days for audit)
   • Customer receives confirmation email
```

---

## Acceptance path (the happy default)

If customer clicks "Accept Final Delivery":

```
1. Customer confirms acceptance
   ↓
2. Backend triggers:
   • Generate unwatermarked clean files (PDF, SVG, ZIP)
   • Email customer with new download links to clean files
   • Send Tab the upgrade-offer follow-up email (premium $1,000)
   • Send exit survey link
   • Close refund window (set acceptedAt timestamp on brand project)
   • Update DECISIONS_LOG metrics: completed sale
   ↓
3. Customer is now in the post-delivery flow:
   • Day 1: Acceptance + clean files received
   • Day 2-3: Exit survey nudge (if not yet filled)
   • Day 7: Testimonial ask (if NPS was high)
   • Day 14: Check-in: "How's your launch going?" (relationship building)
```

---

## Defect handling (post-acceptance)

Per TOS, customer CAN still get fixes after acceptance if a production defect exists. Examples:

- PDF doesn't open / file corrupted
- Wrong margins on visual asset
- Missing page in playbook
- Logo SVG broken on import
- Wrong email/business name on cover

Customer reports via email to support → Tab fixes within 3 business days → re-delivers → no refund needed (defect is on us).

**Boundary:** subjective complaints ("I don't like the green") are NOT defects post-acceptance. They're tough-luck — that's what the preview-with-revisions phase was for. Tab can choose to be generous case-by-case.

---

## Engineering notes (BE dev)

### New routes
```
POST /api/brands/[id]/request-revision   → opens revision chat session
POST /api/brands/[id]/accept             → triggers clean file generation
POST /api/brands/[id]/decline-refund     → triggers refund flow
GET  /api/brands/[id]/preview            → serves watermarked files (auth-gated)
GET  /api/brands/[id]/final              → serves clean files (only post-accept, auth-gated)
```

### State machine on BrandProject

```
status: "generating"           → AI is building
status: "tab-review"           → in Tab's queue
status: "preview-sent"         → customer has watermarked preview
status: "revising"             → customer requested revisions, in revision chat
status: "preview-sent-r2"      → round 2 preview sent (free)
status: "preview-sent-paid"    → round 3+ preview (after upgrade)
status: "accepted"             → customer accepted, clean files delivered
status: "refunded"             → customer declined, refund processed
status: "defect-fix-pending"   → post-acceptance defect reported
```

### Notification triggers

| Event | Who gets notified | Channel |
|---|---|---|
| AI generation complete | Tab | Dashboard + email |
| Tab approves preview | Customer | Email |
| Customer requests revisions | Tab | Dashboard + email |
| Revised preview ready | Tab → then Customer | Dashboard → Email |
| Customer accepts | Tab | Dashboard + email (good news!) |
| Customer declines + refund | Tab | Dashboard + email (incl. their feedback) |
| Customer reports defect post-accept | Tab + Support | Dashboard + email |

---

**Owner:** Tab (UX rules), FE Dev (revision UI), BE Dev (state machine + endpoints + revision chat)
**Related:** Task #22 (auto-delivery), Task #23 (premium upgrade), Task #24 (Tab review dashboard)
