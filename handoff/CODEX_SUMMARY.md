# CODEX SUMMARY

## Task
PHASE-UI-000 - Sandstone Editorial tokens, font declarations, and existing UI primitives only.

## What changed
- Replaced the old warm-paper token base in `src/app/globals.css` with the Sandstone Editorial light-only palette.
- Removed the dark-mode media query from `globals.css`.
- Added semantic Tailwind theme tokens for background, text, border, brand, status, radius, type, motion, shadow, and font roles.
- Kept compatibility aliases such as `paper`, `ink`, `accent`, and existing status aliases so unchanged page JSX and other components continue to render.
- Updated only the allowed primitives: `Button`, `Card`, `StatusBadge`, `MetricCard`, `EmptyState`, `SectionHeader`, and `Skeleton`.
- Added one font TODO comment only; no font files, network font imports, package changes, or `next/font/local` wiring were added.

## Files touched
- `src/app/globals.css`
- `src/components/ui/button.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/status-badge.tsx`
- `src/components/ui/metric-card.tsx`
- `src/components/ui/empty-state.tsx`
- `src/components/ui/section-header.tsx`
- `src/components/ui/skeleton.tsx`
- `handoff/CODEX_SUMMARY.md`

## Token changes
Palette and semantic tokens added or changed in `globals.css`:

| Token | Old value | New value |
|---|---:|---:|
| `--background-default` | new | `#FFFFFF` |
| `--background-sunken` | new | `#F7F6F3` |
| `--background-inverse` | new | `#191714` |
| `--background-row-hover` | new | `#FAFAF8` |
| `--text-primary` | new | `#191714` |
| `--text-secondary` | new | `#5C574E` |
| `--text-tertiary` | new | `#8D877B` |
| `--text-inverse` | new | `#FFFFFF` |
| `--border-default` | new | `#E8E5E0` |
| `--border-strong` | `#cdc9b8` | `#D6D2CA` |
| `--brand-default` | new | `#A03D21` |
| `--brand-hover` | new | `#873218` |
| `--brand-foreground` | new | `#FFFFFF` |
| `--brand-tint` | new | `#F8EDE7` |
| `--paper` | `#faf9f6` | `var(--background-default)` |
| `--paper-raised` | `#ffffff` | `var(--background-default)` |
| `--ink` | `#16150f` | `var(--text-primary)` |
| `--ink-muted` | `#5c5a4f` | `var(--text-secondary)` |
| `--ink-subtle` | `#8b8878` | `var(--text-tertiary)` |
| `--border` | `#e4e1d6` | `var(--border-default)` |
| `--accent` | `#b6551a` | `var(--brand-default)` |
| `--accent-foreground` | `#fdf6ee` | `var(--brand-foreground)` |
| `--accent-soft` | `#f5e3d3` | `var(--brand-tint)` |
| `--status-success-fg` | `#1f6b3a` | `#1E6B40` |
| `--status-success-tint` | new | `#E8F3EC` |
| `--status-success-bg` | `#dcefdf` | `var(--status-success-tint)` |
| `--status-warning-fg` | new | `#8A6116` |
| `--status-warning-tint` | new | `#F8F0DC` |
| `--status-pending-fg` | `#7a6417` | `var(--status-warning-fg)` |
| `--status-pending-bg` | `#f5efd9` | `var(--status-warning-tint)` |
| `--status-error-fg` | new | `#B3261E` |
| `--status-error-tint` | new | `#F9E9E7` |
| `--status-danger-fg` | `#9c3323` | `var(--status-error-fg)` |
| `--status-danger-bg` | `#f6dfda` | `var(--status-error-tint)` |
| `--status-info-fg` | `#29538f` | `#1F5C8F` |
| `--status-info-tint` | new | `#E7F0F7` |
| `--status-info-bg` | `#dde7f5` | `var(--status-info-tint)` |
| `--status-neutral-fg` | `#57543f` | `var(--text-secondary)` |
| `--status-neutral-tint` | new | `var(--background-sunken)` |
| `--status-neutral-bg` | `#e9e7dd` | `var(--status-neutral-tint)` |
| `--radius-control` | new | `6px` |
| `--radius-chip` | new | `8px` |
| `--radius-card` | new | `10px` |
| `--radius-overlay` | new | `14px` |
| `--radius-pill` | new | `999px` |
| `--elevation-raised` | new | `0 1px 3px rgba(25,23,20,0.07)` |
| `--elevation-overlay` | new | `0 8px 30px rgba(25,23,20,0.12)` |
| `--motion-fast` | new | `120ms` |
| `--motion-base` | new | `200ms` |
| `--motion-slow` | new | `300ms` |
| `--font-family-display` | new | General Sans fallback stack |
| `--font-family-ui` | old `--font-sans` stack | Inter fallback stack |
| `--font-family-arabic` | new | IBM Plex Sans Arabic fallback stack |
| `--font-family-mono` | old `--font-mono` stack | same mono fallback stack |

Type and Tailwind export tokens added: `--text-display-xl`, `--text-display-lg`, `--text-heading-lg`, `--text-heading-md`, `--text-heading-sm`, `--text-body`, `--text-body-sm`, `--text-label`, `--text-metric`, `--tracking-label`, semantic `--color-*` exports, `--font-display`, `--font-arabic`, `--shadow-raised`, and `--shadow-overlay`.

## Primitive notes
- `Button`: moved to `rounded-control`, semantic brand/background/text tokens, approved variants only (`primary`, `secondary`, `ghost`, `destructive`), focus ring via brand tint, disabled opacity at 40%, and added `isLoading` with an inline spinner while retaining children.
- `Card`: moved to white `background/default`, `border/default`, and `radius/card`.
- `StatusBadge`: kept existing public API but maps pending to warning, danger to error, success/info/neutral to semantic tint + fg tokens.
- `MetricCard`: moved to 24px padding, metric type token, tabular numerals, and warning/danger border tint only.
- `EmptyState`: moved to dashed `border/default`, `radius/card`, one Lucide icon at 1.75 stroke, and semantic text tokens.
- `SectionHeader`: moved the eyebrow to semantic brand text and heading/body to semantic type/text tokens.
- `Skeleton`: moved to `background/sunken`, `radius/control`, and reduced-motion safe pulse.

## Clay / brand accent usage
Clay is used only for action emphasis in touched primitives:
- `Button` primary action: `bg-brand text-brand-foreground hover:bg-brand-hover active:bg-brand-hover`
- `Button` focus state: `focus-visible:border-brand ... focus-visible:ring-brand-tint`
- `SectionHeader` eyebrow: `text-brand`

No touched primitive uses clay as wallpaper or a status/category color.

## Checks against scope
- `git diff --name-only` is limited to the allowed files listed above.
- No `src/app/**/page.tsx` file appears in the diff.
- No `/docs` file changed.
- No Supabase file changed.
- No package file changed.
- No new primitive file was created.
- No raw hex value appears in any touched `.tsx` component.

## Font note
Self-hosting is still needed to fully satisfy the final type-system direction for General Sans and Inter. This task explicitly did not approve font binary assets, so I added only a TODO comment in `globals.css` and used fallback stack declarations.

## Skipped primitive gaps
`docs/DESIGN_SYSTEM.md` describes primitives that do not currently exist in `src/components/ui/`, so they were correctly skipped rather than created: generic `Badge`, `Input`, `Select`, `Tabs`, table/data-table primitives, chip/tag primitive, dialog/modal/confirm dialog primitive, breadcrumb primitive, `ErrorState`, `CopyField`, `Stepper`, and `TimelineList`.

## Verification results
- `powershell -ExecutionPolicy Bypass -File scripts/verify.ps1` - passed:
  - `npm run build`
  - `npx tsc --noEmit`
  - `npx eslint .`
  - forbidden naming scan
- `git diff --check` - passed; Git reported only existing CRLF normalization warnings.
- Raw hex scan across touched `.tsx` primitives - passed with no matches.

## Deviations
None.

## Open questions
None.
