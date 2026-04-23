# IEI Ventures — Design Handoff Package

This folder contains everything claude.design needs to produce the UI for the IEI Ventures platform. Hand the whole folder over.

## Files in this package

| File | What it is |
|---|---|
| `00-START-HERE.md` | This file — index + instructions |
| `01-developer-brief.html` | Original 10-slide product brief (full context — read first) |
| `02-screens-to-design.md` | Every screen / page / component that needs design |
| `03-data-contracts.md` | The data shapes that flow through each screen |
| `04-voice-and-feel.md` | Tone, aesthetic, and brand direction for the platform itself |
| `05-output-format.md` | How to deliver designs back so they drop into the codebase |

## Context in one paragraph

IEI Ventures is a SaaS platform. A business signs up, fills an intake (or uploads existing assets), and the platform's AI generates a complete brand system: brand playbook PDF, color palette, typography, logo, landing page, and tone of voice. The platform is white-labelable — agencies like Vendasta can rebrand it and resell to their SMB clients. Target MVP ship: June 30, 2026. Full product spec is in `01-developer-brief.html`.

## What's already built (the codebase context)

- Next.js 16 app, TypeScript, Tailwind — lives in `iei-ventures/`
- Data/plumbing layer is done: SQLite project storage, file outputs, API routes, a stub Brand Playbook skill that generates dummy outputs so the pipeline works end-to-end
- Current UI is **unstyled on purpose** — claude.design is doing the visual layer
- Repo: https://github.com/hbarbosa25/IEI-Ventures

## What claude.design produces

Self-contained HTML (with Tailwind classes) for each screen in `02-screens-to-design.md`. Mock data is fine — `03-data-contracts.md` shows the exact shapes the real data will have, so bind to those field names. We'll wire it to live data when we drop it into the Next app.

## What claude.design does NOT produce (yet)

- Logo generation for the IEI Ventures platform itself (we'll do that separately on claude.design as a dedicated brand exercise)
- The generated-for-clients Brand Playbook PDF visual design (different deliverable, tackled after the dashboard)
- The generated-for-clients landing page template (same — after the dashboard ships)
