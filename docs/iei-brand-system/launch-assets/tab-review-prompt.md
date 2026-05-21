# Tab's Review Prompt — Structured QA Form

**Purpose:** A structured form Tab uses during the 15-min review of every Brand Blueprint draft. Two purposes:
1. **Tab stays fast** — checkbox + dropdown, not free-write
2. **AI gets clean instructions** — structured tweaks become a parseable regeneration prompt

**Where it lives:** Inside the Tab Review Dashboard (Task #24 — formerly the spot-check dashboard, now the full review dashboard).

**Owner:** Tab (operations), FE Dev + BE Dev (build the dashboard).

---

## When Tab opens a new review

After the AI completes generation (~30 min after chat-complete), the brand project lands in Tab's queue.

Tab sees:
- **Customer name + brand name**
- **Tier** (currently always Brand Blueprint $997 — premium-upgrade reviews are a separate workflow)
- **Time in queue** (how long since AI completed — color-coded: green <2hr, yellow 2-12hr, red >12hr)
- **Quality risk flag** (red if customer skipped >50% of intake questions)
- **Side-by-side panels:**
  - Left: the intake transcript (key answers, easy scan)
  - Right: the generated deliverables (preview pane with tabs for each file)
- **The Review Form below** (this doc)

---

## The Review Form

Tab works through each section in 60-90 seconds. ~15 min total per customer.

### SECTION A — OVERALL DISPOSITION

```
☐  Approve as-is → ships to customer (watermarked preview)
☐  Tweak then ship → fill in flags below, AI regenerates
☐  Major issues — regenerate from scratch → AI redoes full brand
☐  Customer issue — flag for manual reach-out → escalates to support
```

### SECTION B — BRAND MESSAGING

```
Vibe check:  [ ] On-brand   [ ] Off-brand   [ ] Mixed

If tweaking:
☐  Mission too generic — needs specificity
☐  Vision feels hollow — punch it up
☐  Values read corporate — make them personal
☐  Tagline doesn't land — regenerate 3 new options
☐  Voice feels too AI / too corporate — punch up to match customer's actual words
☐  Brand name handling weird — check spelling, capitalization
☐  Other: ____________________________________________

Customer's verbatim phrases that MUST appear (paste from intake):
____________________________________________
```

### SECTION C — LOGO (3 options)

```
Best of the 3:  [ ] Option 1   [ ] Option 2   [ ] Option 3   [ ] None

If tweaking:
☐  All 3 weak — regenerate all
☐  Refine just the best one (above)
☐  Wrong vibe — needs to be more: [ ] modern  [ ] vintage  [ ] playful  [ ] serious  [ ] luxurious  [ ] bold
☐  Wrong type — needs to be more: [ ] wordmark  [ ] icon+text  [ ] icon only  [ ] monogram
☐  Color clash with palette
☐  Doesn't read at small size (16px favicon test)
☐  Customer's vibe references not reflected (re-read Q16-Q21)
☐  Other: ____________________________________________
```

### SECTION D — BRAND KIT (palette + typography)

```
Palette check:  [ ] On-brand   [ ] Off-brand   [ ] Mixed

If tweaking palette:
☐  Colors feel off — needs to be: [ ] warmer  [ ] cooler  [ ] more saturated  [ ] less saturated  [ ] more contrast
☐  Not enough accessibility contrast (text vs background <4.5:1)
☐  Too generic startup-y (the "blue+gradient" trap)
☐  Doesn't match customer's stated vibe (car, animal, anthem references)

Typography check:  [ ] On-brand   [ ] Off-brand

If tweaking type:
☐  Display font wrong era — try: [ ] modern  [ ] classic  [ ] retro  [ ] handwritten
☐  Body font hard to read
☐  Font pairing clashes
☐  Other: ____________________________________________
```

### SECTION E — 1-PAGE WEBSITE

```
Read like a real site:  [ ] Yes   [ ] No

If tweaking:
☐  Hero copy weak / generic
☐  CTA unclear — what should customer do?
☐  Sections in wrong order
☐  Missing key info from intake (e.g., their actual offering)
☐  Mobile layout broken (preview on mobile if visual issue suspected)
☐  Lorem ipsum somewhere (regenerate — should never happen)
☐  Other: ____________________________________________
```

### SECTION F — GTM CHECKLIST

```
Customized to their goal:  [ ] Yes   [ ] No   [ ] Partial

If tweaking:
☐  Too generic — needs more specificity for their stated goal
☐  Missing industry-specific tactics for: ________________
☐  Timeline unrealistic for solo founder
☐  Doesn't reference Fourfold Path structure
☐  Other: ____________________________________________
```

### SECTION G — CONTENT (if + Content tier or Full Suite — N/A for Basic)

```
5 posts hit the voice:  [ ] Yes   [ ] No

If tweaking:
☐  Posts sound generic / could be any brand
☐  Posts don't use customer's verbatim phrases
☐  Awareness/Trust/Convert ratio off (target 50/30/20)
☐  Hooks weak
☐  CTAs not clear
☐  Other: ____________________________________________
```

### SECTION H — CUSTOM NOTE TO AI

Free-text field — anything not covered above. Examples Tab might write:

```
"Customer mentioned her daughter's name 'Maya' as the inspiration — work that in 
to the brand story page."

"The vibe she described (vintage Mercedes + Sade anthem) screams quiet luxury. 
The current output feels too playful. Shift to more restrained typography + 
deeper color palette."

"She's launching a podcast — make sure the GTM checklist includes podcast 
launch tactics, not just blog/social."
```

### SECTION I — ACTION

```
[ Regenerate Flagged Sections ]   →   AI takes ~10 min, Tab re-reviews
[ Approve & Send Preview ]         →   Customer gets watermarked preview email
[ Escalate to Support ]            →   Customer issue, not generation issue
```

---

## What the AI does with this form (BE dev — for Task #23 or #24 build)

When Tab clicks "Regenerate Flagged Sections," BE:

1. Builds a structured prompt from the checked boxes:
   ```
   REGENERATION REQUEST (Tab's review):
   
   Sections to regenerate: [BRAND_MESSAGING, LOGO_OPTION_2]
   
   For BRAND_MESSAGING:
   - Tagline doesn't land — regenerate 3 new options
   - Voice feels too AI / corporate — punch up to match customer's actual words
   - Customer's verbatim phrases that MUST appear:
     "Long live the light bulb moments"
     "From idea to income"
   
   For LOGO_OPTION_2:
   - Refine the best option
   - Wrong vibe — needs more vintage
   - Color clash with palette
   
   Tab's custom note:
   "The vibe she described screams quiet luxury. Shift to more restrained typography."
   ```

2. Calls Claude Sonnet with the regeneration prompt + original intake context + existing outputs (for "regenerate just these sections, keep the rest" semantics)

3. New outputs replace the flagged sections in the brand project

4. Tab gets notified: "Regeneration complete — re-review when ready"

5. Tab re-opens the review form. Either approves (now) or flags again (rare — most regens get approved on round 2).

---

## Speed targets

| Action | Target time |
|---|---|
| Open review + scan deliverables | 3-5 min |
| Fill in form (if tweaking) | 2-5 min |
| Wait for AI regenerate | 5-10 min |
| Re-review | 2-3 min |
| **Total per customer** | **12-18 min** |

If review consistently takes longer than 20 min, two diagnostics:
1. **Generation quality is too low** → strengthen SKILL.md (Task #11), regenerate more aggressively
2. **Form is missing common tweak patterns** → add new checkbox options Tab finds herself writing into the "Other" field

After 30-50 customers, look at "Other" field text — patterns become new structured checkboxes. Form improves over time.

---

## Quality-risk flagged customers

If `qualityRisk: true` (customer skipped >50% of intake questions), the review form opens with an extra banner:

> ⚠️ **HIGH-SKIP CUSTOMER — Output likely needs heavier review.**
>
> This customer skipped 14 of 26 questions. AI filled gaps with inference.
>
> Recommended actions:
> - Spend extra time reviewing — quality bar should be same regardless
> - Consider proactively offering the +$1,000 premium upgrade (customer may need Tab's deeper involvement)
> - Flag for follow-up: send a personal note in delivery email asking if they want to schedule a free 15-min chat to refine before locking final

Tab can choose to proceed with normal review OR escalate to a personal touchpoint.

---

## What this form WON'T cover (intentional)

- **Customer-side revisions** — separate flow (see `customer-revision-flow.md`)
- **Premium upgrade customers** — separate workflow where Tab personally refines (no checkbox form needed; Tab works directly with the files)
- **Production defects** — file corruption, missing pages, wrong format — handled by support, not the review form
- **Voice/style global issues** — these go back to SKILL.md (Task #11), not per-customer

---

**Owner:** Tab (uses it), FE Dev (builds the dashboard), BE Dev (wires the regenerate prompt logic)
**Related:** Task #24 (Review Dashboard), Task #11 (SKILL.md updates), `customer-revision-flow.md`
