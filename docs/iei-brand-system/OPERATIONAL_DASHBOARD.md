# Operational Dashboard — Tab's Customer Tracking System

**Purpose:** A single-screen view Tab uses to track every Brand Blueprint customer from Stripe purchase → intake call → review → delivery → testimonial. Replaces the need for spreadsheets, sticky notes, or hoping memory holds.

**Recommended tool:** **Notion** (free for personal use, easy to share with future VA/dev team). Alternative: Airtable (more structured, but $$). For Stage 1 (< 50 customers), Notion is plenty.

**Setup time:** 30-45 min once. Tab can have this live before the first paying customer.

---

## Database structure — Notion "Brand Blueprint Customers" database

Create one Notion page called "**Brand Blueprint Customers**" with a table view. These properties:

### Core fields (visible in main table view)

| Field | Type | Notes |
|---|---|---|
| **Customer Name** | Title | Use customer's name as the page title |
| **Tier** | Select | Options: Basic ($997) · + Content ($1,997) · Full Suite ($3,997) |
| **Status** | Status | Pipeline below |
| **Purchase Date** | Date | Auto-set when row created |
| **Intake Call** | Date + Time | Pull from Calendly |
| **Delivery Due** | Formula | `Intake Call + 5 working days` |
| **Delivery Sent** | Date | Set when Tab sends delivery email |
| **NPS** | Number (0-10) | Pull from exit survey |
| **Testimonial?** | Select | Yes-video · Yes-written · No · Pending |

### Status pipeline (use Notion's status property)

In ORDER (most → least visited stages):

1. **🟢 Paid — awaiting intake booking** (post-Stripe, Calendly not yet booked)
2. **🟡 Intake booked** (Calendly confirmed)
3. **🔵 Intake complete** (call done, intake form filled)
4. **🟠 In generation** (AI running)
5. **🟣 In review** (Tab reviewing per checklist)
6. **🟦 Delivered — awaiting refinement?** (sent to customer)
7. **🟩 Refinement pass** (customer requested changes)
8. **✅ Complete** (delivered final, exit survey sent)
9. **⭐ Testimonial captured**
10. **❌ Refunded / Cancelled**

### Additional fields (visible in detail page, hidden in table view)

| Field | Type | Notes |
|---|---|---|
| **Email** | Email | Customer contact |
| **Phone** | Phone | Optional |
| **Stripe Order ID** | Text | Reference for support |
| **Brand Name** | Text | What they call their business |
| **Industry** | Select | Pick from a list — useful for future segmentation |
| **Goal (6-month)** | Text | From Module 6 intake |
| **Brands Admired** | Multi-select | Tracks competitor patterns over time |
| **Channel — How they found us** | Select | DM · email · referral · social post · ad · other |
| **Referred by** | Relation → other customer | If they came via referral |
| **Notes** | Long text | Tab's running notes |
| **Internal Tags** | Multi-select | "high-touch", "needs follow-up", "great case study", "difficult", etc. |

---

## Workflow — what Tab does at each status change

### Status: 🟢 Paid — awaiting intake booking
**Trigger:** Stripe payment notification arrives
**Action:** Create new row in dashboard. Status = 🟢. Customer's welcome email auto-sent (per `email-templates.md` Email 1). If 48 hrs pass without Calendly booking → manual nudge email.

### Status: 🟡 Intake booked
**Trigger:** Calendly booking confirmation
**Action:** Update status. Confirm calendar invite. Email 2 (intake confirmation) auto-sent.

### Status: 🔵 Intake complete
**Trigger:** Tab finishes intake call
**Action:** Within 60 min — type intake into `/new/deep` form. Note call vibe in dashboard Notes field. Send Email 3 (day-after update). Block calendar for review per tier:
- Basic: 90 min
- + Content: 3 hrs
- Full Suite: 5 hrs

### Status: 🟠 In generation
**Trigger:** Tab triggers brand generation
**Action:** Wait for AI to complete (typically 10-20 min for full suite, less for basic). When done → move to 🟣.

### Status: 🟣 In review
**Trigger:** Generation complete
**Action:** Open `tier-review-checklists.md`. Work through the tier-specific checklist. If review exceeds 2× the time cap, escalate (regenerate weak sections OR push delivery by 1 day).

### Status: 🟦 Delivered — awaiting refinement?
**Trigger:** Tab sends Email 4 (delivery) with the ZIP/links
**Action:** Customer has 5 days to request refinement. Track in Notes if any refinement comes in. If yes → 🟩. If no after 5 days → ✅.

### Status: 🟩 Refinement pass
**Trigger:** Customer reply with changes
**Action:** Address within 3 business days. Track scope (refinement = adjusting existing deliverables; NOT adding new ones outside tier — flag those and offer upgrade instead).

### Status: ✅ Complete
**Trigger:** Final delivery accepted by customer
**Action:** Send Email 5 (exit survey) if no response within 3 days. Send Email 6 (testimonial ask) at day 7 if exit survey positive.

### Status: ⭐ Testimonial captured
**Trigger:** Testimonial received
**Action:** File in `customer-assets/testimonials/` folder. Update landing page within 1 week. Send referral credit to customer.

### Status: ❌ Refunded / Cancelled
**Trigger:** Refund request approved
**Action:** Process via Stripe within 5 business days. Email 7 (refund confirmation) sent. Note WHY in Notes field — this is signal for product improvement.

---

## Views to set up in Notion

Create multiple table views filtered by stage so Tab can see the right info in seconds.

### View 1 — "Today's Focus" (default landing view)
**Filter:** Status is any of [🟡 Intake booked, 🔵 Intake complete, 🟣 In review]
**Sort:** Delivery Due (ascending)
**Why:** Tab opens dashboard, sees exactly what needs attention today.

### View 2 — "Sales Pipeline" (this week's sales activity)
**Filter:** Status is [🟢 Paid — awaiting intake booking]
**Sort:** Purchase Date (descending)
**Why:** Track conversion from purchase → booked intake. If gaps emerge here, nudges are needed.

### View 3 — "Delivery Queue"
**Filter:** Status is [🟠 In generation, 🟣 In review]
**Sort:** Delivery Due (ascending)
**Why:** Tab's actual work queue.

### View 4 — "Post-Delivery Follow-up"
**Filter:** Status is [🟦 Delivered, ✅ Complete] AND Testimonial = Pending
**Sort:** Delivery Sent (descending)
**Why:** Capture testimonials systematically.

### View 5 — "Capacity Check"
**Filter:** Intake Call this week
**Sort:** Intake Call (ascending)
**Why:** See if calendar is overbooked vs. 20 hrs/week budget.

### View 6 — "All-time"
**Filter:** none
**Sort:** Purchase Date (descending)
**Why:** Full history. Useful for monthly review + reporting.

---

## Weekly review ritual (15 min, every Sunday)

Open dashboard. For each:

1. **Sales:** How many purchases this week? Compare to last week. Trending up/down?
2. **Conversion:** Of customers who paid, how many booked intake within 48 hrs? Anyone overdue → manual nudge.
3. **Delivery SLA:** Any deliveries late? Why? Pattern (Full Suite always overruns? specific module always weak?)?
4. **Capacity:** How many intake calls booked next week? If > 6 → consider closing calendar until catch-up.
5. **NPS rolling average:** Pull avg from completed surveys. Below 8 → investigate why.
6. **Testimonials captured:** Goal = 1-2 per week to fuel Stage 2 cohort sales pitch.
7. **Patterns to flag:** Any tier underperforming? Any channel (referral, DM, ad) outperforming? Brands-admired list show clustering (signals a niche)?

---

## Metrics worth tracking (add a separate "Metrics" page in Notion)

Weekly snapshot:

| Metric | This week | Last week | All-time |
|---|---|---|---|
| New purchases | | | |
| Revenue | | | |
| Conversion (purchase → intake booked within 48hr) | | | |
| Avg NPS | | | |
| Testimonials captured | | | |
| Refund rate | | | |
| Tab's hours invested | | | |
| Effective hourly rate (revenue / hours) | | | |
| Cost per customer (Stripe fees + Anthropic API + email) | | | |
| Gross margin % | | | |

These metrics matter for:
- Knowing when to raise prices (NPS high + capacity-constrained = raise)
- Knowing when to hire a VA (Tab's hours > 25/week sustainably = scale signal)
- Pitching cohort customers (have real revenue + conversion + NPS data)
- The bankroll decision in the GTM doc (revenue-funded path requires real revenue numbers)

---

## Integration suggestions (Stage 2, not MVP)

These reduce Tab's manual data entry — defer until ~10-15 customers have run through the manual process:

- **Stripe → Notion:** Zapier/Make automation creates new dashboard row on Stripe payment
- **Calendly → Notion:** Same — updates Intake Call date when booked
- **Email tool → Notion:** Logs sent emails as comments on customer page
- **Typeform/Tally exit survey → Notion:** Auto-fills NPS + testimonial response

Cost: ~$20-30/mo for Zapier or Make starter plans. Skip for Stage 1.

---

## A note on data privacy

The dashboard contains customer personal info. Per Privacy Policy:

- Notion account must use a strong password + 2FA
- Don't share the dashboard link publicly
- When customer requests deletion → delete their row (not just archive)
- Retention: 90 days post-delivery for support, then anonymize (replace name with "Customer #N", keep aggregate data)

If/when a VA joins the team:
- Create a "VA View" with PII redacted (no email, no phone)
- VA only sees what they need to see
- Document access in `OPERATIONAL_DASHBOARD.md` for audit purposes
