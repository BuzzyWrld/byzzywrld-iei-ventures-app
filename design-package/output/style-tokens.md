# IEI Ventures — Style Tokens

Port these directly into `tailwind.config.ts`. Everything the design system uses resolves to one of these.

---

## Colors

### Role tokens (tenant-overridable via `TenantConfig.colors`)

| Token | Hex | CSS var | Role |
|---|---|---|---|
| primary | `#1A1F1A` | `--color-primary` | Ink — buttons, headings, borders-strong |
| accent | `#263E0F` | `--color-accent` | Moss — single-use emphasis, logo corner ticks |
| neutral | `#6B6F69` | `--color-neutral` | Warm gray — muted text, captions |
| surface | `#FAFAF7` | `--color-surface` | Paper — page background |
| surface-2 | `#F2F0E9` | `--color-surface-2` | Raised panel, hover fill |
| text | `#1A1F1A` | `--color-text` | Body text |
| text-muted | `#6B6F69` | `--color-text-muted` | Secondary text |
| border | `#E4E2DA` | `--color-border` | Default borders, rules |
| border-strong | `#1A1F1A` | `--color-border-strong` | Button outlines, emphasis rules |

### Status tokens (fixed; not tenant-overridable)

| Token | Hex | Usage |
|---|---|---|
| status-pending | `#A8A59A` | queued, not yet started |
| status-running | `#B8912E` | in-progress (pulses) |
| status-complete | `#3E6B2A` | success |
| status-failed | `#9A3A2A` | error |

---

## Typography

- **Body / UI:** `Geist, Inter, system-ui, sans-serif` (weights 300 / 400 / 500 / 600 / 700)
- **Display / serif moments:** `Instrument Serif, Georgia, serif` (use sparingly — intake hero, playbook cover, landing hero)
- **Mono:** `Geist Mono, ui-monospace, monospace` (meta, kickers, IDs, counts)

### Scale

| Name | Size | Line-height | Tracking | Weight |
|---|---|---|---|---|
| display | 48px | 1.05 | -0.02em | 400 (serif) |
| h1 | 32px | 1.25 | -0.015em | 500 |
| h2 | 24px | 1.33 | -0.01em | 600 |
| h3 | 18px | 1.55 | 0 | 600 |
| body | 15px | 1.6 | 0 | 400 |
| small | 13px | 1.54 | 0 | 400 |
| mono | 12px | 1.33 | 0.06em (UC) | 500 |

---

## Spacing — 4px base

| Step | px | Tailwind |
|---|---|---|
| 1 | 4 | `1` |
| 2 | 8 | `2` |
| 3 | 12 | `3` |
| 4 | 16 | `4` |
| 5 | 20 | `5` |
| 6 | 24 | `6` |
| 8 | 32 | `8` |
| 10 | 40 | `10` |
| 12 | 48 | `12` |

---

## Radius

| Name | Value | Usage |
|---|---|---|
| sm | `4px` | small chips, skeleton bars |
| md | `6px` | buttons, inputs, cards |
| lg | `10px` | project cards, modals, dropzones |
| full | `999px` | badges, pills, avatars |

---

## Shadows

| Name | Value | Usage |
|---|---|---|
| sh-1 | `0 1px 0 rgba(26,31,26,.04), 0 1px 2px rgba(26,31,26,.06)` | card rest |
| sh-2 | `0 2px 4px rgba(26,31,26,.06), 0 4px 12px rgba(26,31,26,.08)` | card hover, modal, toast |
| focus | `0 0 0 3px rgba(38,62,15,.18)` | focus ring (derived from `--color-accent` @ 18%) |

---

## Tailwind config snippet

```ts
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        accent:  'var(--color-accent)',
        neutral: 'var(--color-neutral)',
        surface: 'var(--color-surface)',
        'surface-2': 'var(--color-surface-2)',
        text: 'var(--color-text)',
        'text-muted': 'var(--color-text-muted)',
        border: 'var(--color-border)',
        'border-strong': 'var(--color-border-strong)',
        status: {
          pending:  '#A8A59A',
          running:  '#B8912E',
          complete: '#3E6B2A',
          failed:   '#9A3A2A',
        },
      },
      fontFamily: {
        sans:  ['Geist', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        mono:  ['"Geist Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        display: ['48px', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        h1:      ['32px', { lineHeight: '1.25', letterSpacing: '-0.015em' }],
        h2:      ['24px', { lineHeight: '1.33', letterSpacing: '-0.01em' }],
        h3:      ['18px', { lineHeight: '1.55' }],
        body:    ['15px', { lineHeight: '1.6' }],
        small:   ['13px', { lineHeight: '1.54' }],
        mono:    ['12px', { lineHeight: '1.33', letterSpacing: '0.06em' }],
      },
      borderRadius: {
        sm: '4px',
        md: '6px',
        lg: '10px',
        full: '999px',
      },
      boxShadow: {
        'sh-1': '0 1px 0 rgba(26,31,26,0.04), 0 1px 2px rgba(26,31,26,0.06)',
        'sh-2': '0 2px 4px rgba(26,31,26,0.06), 0 4px 12px rgba(26,31,26,0.08)',
        focus:  '0 0 0 3px rgba(38,62,15,0.18)',
      },
    },
  },
};
```

---

## Tenant override contract

When a `TenantConfig` is active, swap at runtime:

```ts
document.documentElement.style.setProperty('--color-primary', tenant.colors.primary);
document.documentElement.style.setProperty('--color-accent',  tenant.colors.accent);
```

Nothing else needs to change — all components reference role tokens.
