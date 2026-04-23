# Output Format

How claude.design should deliver designs so they drop into the Next.js codebase cleanly.

---

## Deliverable: HTML files

One self-contained HTML file per screen in `02-screens-to-design.md`. Name them to match routes:

```
design-package/
  output/
    dashboard-home.html          → maps to /
    new-brand-questionnaire.html → maps to /new
    new-brand-existing.html      → maps to /new?mode=existing
    project-panel.html           → maps to /brands/:id
    app-shell.html               → global nav + layout
    login.html, signup.html      → auth
```

---

## What each HTML file should contain

1. **Tailwind via CDN** in the `<head>`:
   ```html
   <script src="https://cdn.tailwindcss.com"></script>
   ```
2. **Custom fonts** via Google Fonts `<link>` tags if used
3. **Inline mock data** as a `<script>` block at the top of `<body>` — using the shapes in `03-data-contracts.md`
4. **Vanilla HTML rendering** the mock data inline (no React yet — we'll port)
5. **All CSS as Tailwind classes** — no `<style>` blocks unless absolutely needed for a custom animation
6. **Comments marking dynamic regions**, e.g.:
   ```html
   <!-- @bind: project.intake.companyName -->
   <h1 class="text-3xl">Aurelian Labs</h1>
   ```
   This makes React-porting mechanical.

---

## Multiple states per screen

For any screen with multiple states (empty vs filled, running vs complete, etc.), include them all in the same HTML file separated by clear `<section>` boundaries:

```html
<section data-state="empty"> ... </section>
<section data-state="list"> ... </section>
<section data-state="loading"> ... </section>
```

---

## Responsive

Mobile-first. Every screen should work at:
- 375px (iPhone)
- 768px (tablet)
- 1280px+ (desktop)

The dashboard is primarily desktop-used but SMB owners check on phones — don't abandon mobile.

---

## What we'll do with the output

When a screen's HTML is ready, I will:
1. Port it into a React component under `iei-ventures/src/app/...`
2. Replace mock data with live data (via the API shapes in `03-data-contracts.md`)
3. Replace hardcoded colors with CSS variables so tenant theming works
4. Wire up actions (form submits, button clicks) to real API calls

The more the HTML sticks to the data field names in `03-data-contracts.md`, the faster this port is.

---

## Design system artifact

Also produce a single `design-system.html` that shows all the reusable components (buttons, inputs, badges, etc. — see `02-screens-to-design.md` end section) on one page with their states. This becomes our Storybook-lite.
