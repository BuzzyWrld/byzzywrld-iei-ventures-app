# Data Contracts

These are the exact TypeScript shapes the UI binds to. Use these field names in your mock data so the designs drop into the real app cleanly.

Source of truth: [`iei-ventures/src/lib/types.ts`](../src/lib/types.ts)

---

## BrandIntake — what the user submits from `/new`

```ts
type BrandIntake = {
  companyName: string;           // required — e.g. "Aurelian Labs"
  industry: string;              // required — e.g. "AI / Financial Services"
  targetAudience: string;        // required — e.g. "Capital markets operators"
  toneOfVoice: string;           // required — comma-separated tags, e.g. "confident, precise, modern"
  competitors: string;           // optional — e.g. "Hebbia, Harvey"
  archetype: string;             // optional — one of: hero | sage | creator | caregiver | explorer | jester | ...
  palettePreference: string;     // optional — free text or palette ID
  notes: string;                 // optional — catch-all
};
```

---

## BrandJson — what the skill produces (populates project panel)

```ts
type BrandJson = {
  name: string;                  // "Aurelian Labs"
  tagline: string;               // "Brand direction for Aurelian Labs — AI / Financial Services"
  colors: {
    primary: string;             // hex, e.g. "#1E3A8A"
    secondary: string;           // hex
    accent: string;              // hex
    neutral: string;             // hex
  };
  typography: {
    heading: string;             // font stack, e.g. "Geist, Inter, sans-serif"
    body: string;
  };
  tone: string[];                // e.g. ["confident", "precise", "modern"]
  positioning: string;           // one-sentence positioning statement
};
```

---

## BrandProject — the full project record

```ts
type BrandProject = {
  id: string;                    // UUID
  createdAt: string;             // ISO 8601 timestamp
  status: "pending" | "running" | "complete" | "failed";
  intake: BrandIntake;
  outputs: {
    brandJson?: string;          // URL to JSON file
    playbookHtml?: string;       // URL to HTML
    playbookPdf?: string;        // URL to PDF (post Day 3)
    landingHtml?: string;        // URL to landing page HTML
    logoSvg?: string;            // URL to SVG
    landingLiveUrl?: string;     // deployed landing page URL (post Day 4)
  };
  error?: string;                // populated when status === "failed"
};
```

---

## TenantConfig — for white-label mode (Phase 1.5, post-MVP but design around it)

```ts
type TenantConfig = {
  id: string;
  slug: string;                  // "vendasta" → vendasta.ieiventures.com
  displayName: string;           // "Vendasta"
  logoUrl: string;
  colors: {
    primary: string;
    accent: string;
  };
  customDomain?: string;         // if they've configured a CNAME
};
```

When no tenant is set, fall back to the default IEI Ventures theme.

---

## API endpoints the UI will call

| Method | Path | Returns |
|---|---|---|
| POST | `/api/brands` | `{ project: BrandProject }` — creates and runs skill |
| GET | `/api/brands` | `{ brands: BrandProject[] }` |
| GET | `/api/brands/:id` | `{ project: BrandProject }` |
| GET | `/api/brands/:id/files/:file` | raw file (for downloads, previews) |

Error response shape:
```ts
{ error: string; issues?: ZodIssue[] }
```

---

## Mock data block — use this in claude.design

```ts
const MOCK_PROJECTS: BrandProject[] = [
  {
    id: "1a2b3c4d",
    createdAt: "2026-04-22T14:30:00Z",
    status: "complete",
    intake: {
      companyName: "Aurelian Labs",
      industry: "AI / Financial Services",
      targetAudience: "Capital markets operators",
      toneOfVoice: "confident, precise, modern",
      competitors: "Hebbia, Harvey",
      archetype: "sage",
      palettePreference: "",
      notes: "",
    },
    outputs: {
      brandJson: "/api/brands/1a2b3c4d/files/brand.json",
      playbookHtml: "/api/brands/1a2b3c4d/files/playbook.html",
      landingHtml: "/api/brands/1a2b3c4d/files/landing.html",
      logoSvg: "/api/brands/1a2b3c4d/files/logo.svg",
    },
  },
  {
    id: "5e6f7g8h",
    createdAt: "2026-04-21T09:15:00Z",
    status: "running",
    intake: {
      companyName: "Greenfield Capital",
      industry: "Private Credit",
      targetAudience: "Mid-market sponsors",
      toneOfVoice: "institutional, discreet",
      competitors: "",
      archetype: "sage",
      palettePreference: "",
      notes: "",
    },
    outputs: {},
  },
];

const MOCK_BRAND_JSON: BrandJson = {
  name: "Aurelian Labs",
  tagline: "Brand direction for Aurelian Labs — AI / Financial Services",
  colors: { primary: "#1E3A8A", secondary: "#0EA5E9", accent: "#CBD5E1", neutral: "#F9FAFB" },
  typography: { heading: "Geist, Inter, sans-serif", body: "Geist, Inter, sans-serif" },
  tone: ["confident", "precise", "modern"],
  positioning: "Aurelian Labs serves Capital markets operators in AI / Financial Services.",
};
```
