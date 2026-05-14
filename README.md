# IEI Ventures

AI-powered brand development + lead generation platform. Dashboard takes an intake, runs the Brand Playbook Claude Code skill, and surfaces the generated assets (PDF playbook, brand JSON, landing page, logo).

See `IEI_Ventures_Developer_Brief.html` for the full spec.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind
- SQLite (better-sqlite3) for project metadata — local file at `data/iei.db`
- Filesystem outputs under `outputs/<brandId>/`
- Stub Brand Playbook skill at `skills/brand-playbook/run.ts` — replaced with Buzz's real skill when it lands

## Run locally

```bash
npm install
npm run dev
# http://localhost:3030
```

1. Click **+ New brand**
2. Fill intake, submit
3. Redirects to the project page with downloadable outputs

## Routes

| Path | What |
|---|---|
| `/` | project list |
| `/new` | intake form |
| `/brands/:id` | project detail + output links |
| `POST /api/brands` | create + run skill (synchronous for now) |
| `GET /api/brands` | list projects |
| `GET /api/brands/:id` | single project |
| `GET /api/brands/:id/files/:file` | download generated output |

## Day-by-day plan

- **Day 1 (today)** — Scaffold, stub skill, end-to-end plumbing ✅
- **Day 2** — Questionnaire UX polish, proper project panel
- **Day 3** — Real Brand Playbook skill integration + Playwright → PIL → 360 DPI PDF pipeline
- **Day 4** — Landing page auto-deploy to Vercel
- **Day 5** — Monday demo polish
- **Day 6** — Existing-brand flow (logo upload + URL scrape)
- **Day 7** — Logo generation via Claude Design
- **Day 8** — White-label shell (tenant config, subdomain routing)

## Design work

Frontend, logo, and UI polish are being generated on **claude.design** separately — this repo intentionally ships with minimal unstyled UI to keep plumbing decoupled from visual design.

## Notes

- PDF pipeline uses **Playwright + PIL** per brief slide 05 (Day 3). Do NOT use `page.pdf()`.
- Logo logic must evaluate existing assets before generating — never override a working logo.
- No financial KPIs (FINRA).
