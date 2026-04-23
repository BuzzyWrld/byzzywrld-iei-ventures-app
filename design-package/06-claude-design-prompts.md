# claude.design Prompts

Three prompts, run in order. Attach **all files in this folder** to each conversation so claude.design has full context.

---

## Prompt 1 — Logo

```
You are designing the logo for IEI Ventures, a B2B SaaS platform.

Read the attached files first:
- 01-developer-brief.html — full product spec
- 04-voice-and-feel.md — aesthetic direction

Key constraints:
- The product is white-labeled by agencies (Vendasta, marketing firms). The IEI
  Ventures logo is the *default* mark — when white-labeled, a tenant's own
  logo replaces it. So the mark needs to feel neutral and institutional,
  not personality-heavy.
- Audience is enterprise operators and serious founders. Not a consumer app.
- Avoid AI clichés (sparkles, gradients, geometric abstract blobs).
- References from 04-voice-and-feel.md: Linear, Vercel, Ramp, Arc. Serious,
  typography-driven, modern.

Deliver as SVG:
1. Primary lockup — wordmark + mark
2. Icon mark alone (for favicon, app icon, compact nav)
3. Monochrome variants — black on white, white on black
4. A short rationale (2–3 sentences) on why this mark fits

Give me 3 distinct directions to choose from before committing.
```

---

## Prompt 2 — Design system

```
You are building the design system for the IEI Ventures platform dashboard.

Read these attached files first:
- 01-developer-brief.html — product context
- 02-screens-to-design.md — the component list is at the bottom
- 03-data-contracts.md — the data these components will render
- 04-voice-and-feel.md — aesthetic direction
- 05-output-format.md — exact delivery format

Build a single self-contained HTML file named `design-system.html` that
demonstrates every component listed in 02-screens-to-design.md ("Components
the design system should cover"). Each component should be shown in all its
states.

Requirements:
- Tailwind CDN (per 05-output-format.md)
- Use the IEI Ventures logo from Prompt 1 (paste the SVG inline)
- Define CSS variables for the default theme colors so tenant theming can
  override them later: --color-primary, --color-accent, --color-neutral,
  --color-surface, --color-text
- Typography: Geist is the body font. Suggest one display/serif option for
  hero moments (Instrument Serif, Fraunces, etc.) — include it via Google
  Fonts link
- Every component should have clear state demonstrations:
  Button: default, hover, active, disabled, loading
  Input: default, focused, error, disabled
  Status badge: pending, running, complete, failed
  etc.
- Mobile responsive — works at 375px, 768px, 1280px+
- No illustrations, no decorative animation, no emoji

Also output a one-page `style-tokens.md` listing the final color hex codes,
type scale, spacing scale, radius values, and shadow values so I can port
them into Tailwind config.
```

---

## Prompt 3 — Dashboard screens

```
You are designing the actual screens for the IEI Ventures platform dashboard.

Read all attached files first. Use the logo from Prompt 1 and the design
system from Prompt 2 as your source of truth for visual consistency.

Deliverables — one self-contained HTML file per screen, per the spec in
05-output-format.md:

P1 (must have):
- dashboard-home.html         → /
- new-brand-questionnaire.html → /new (new brand mode)
- new-brand-existing.html     → /new?mode=existing
- project-panel.html          → /brands/:id
- app-shell.html              → global nav + layout wrapper
- login.html                  → auth
- signup.html                 → auth

Hard requirements (from 05-output-format.md):
- Tailwind CDN in <head>
- Mock data inline as <script> block at top of <body>, using the exact shapes
  from 03-data-contracts.md (copy the MOCK_PROJECTS / MOCK_BRAND_JSON blocks)
- Bind points marked with HTML comments: <!-- @bind: project.intake.companyName -->
- All CSS as Tailwind classes
- Mobile responsive (375 / 768 / 1280+)
- Multiple states shown in the same file as separate <section data-state="..."> blocks

Critical design direction (from 04-voice-and-feel.md):
- The intake questionnaire MUST feel conversational — "like a brand strategist,
  not a form." Step-by-step progression, one question (or small group) at a
  time, with progress indicator. Not a flat grid of inputs.
- The project panel is the "payoff" screen — it's where the user sees their
  brand come to life. It should feel tangible, like opening a physical brand
  book. Color swatches should be large and inviting. Typography preview
  should be prominent.
- Dashboard home is operational — it's where power users live. Dense,
  scannable, keyboard-friendly.

Do NOT design:
- The generated-for-clients landing page template (separate deliverable)
- The Brand Playbook PDF layout (separate deliverable)
- Phase 2 screens (lead gen UI, audit score standalone, venture studio)

When you're done, zip up every HTML file + the design-system.html and
style-tokens.md from Prompt 2 into one bundle.
```

---

## Suggested order

1. Run **Prompt 1**, pick a logo direction, iterate until approved
2. Run **Prompt 2** with the approved logo inline — get the design system
3. Run **Prompt 3** with both as reference — get all the screens
4. Drop the output HTML back in this repo → I port to React and wire to live data
