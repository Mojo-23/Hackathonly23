# CODEX SUMMARY

## Task
PHASE-UI-002 - redesign only the public `/events` listing surface using the approved Sandstone Editorial tokens and primitives.

## What changed
- Reworked `/events` spacing and wrapper treatment to the public Sandstone surface rhythm.
- Replaced `EventCard`'s per-event gradient cover with a flat, token-only system identity panel generated from existing event data.
- Migrated `EventCard` away from legacy compatibility aliases and raw Tailwind type sizes to semantic text/background/border/type classes.
- Updated the `/events` loading skeleton to match the redesigned header and card-grid structure.
- Preserved the existing `hackathons.map(...)` data flow and every `Link href={`/events/${hackathon.slug}`}` target.

## Files touched
- `src/app/(public)/events/page.tsx`
- `src/app/(public)/events/loading.tsx`
- `src/components/events/event-card.tsx`
- `handoff/CODEX_SUMMARY.md`

## Cover / identity treatment
Before, each card depended on the mock gradient field:

```tsx
<div className={cn("h-28 bg-gradient-to-br", hackathon.coverGradient)} />
```

After, the cover is token-only and system-generated from existing event fields:

```tsx
<div className="flex h-32 flex-col justify-between border-b border-border-default bg-background-sunken p-4">
  <p className="text-label font-medium uppercase tracking-label text-text-tertiary">
    {hackathon.theme}
  </p>
  <div className="flex items-end justify-between gap-4">
    <p className="font-display text-heading-lg font-semibold text-text-primary">
      {getEventMark(hackathon.title)}
    </p>
    <p className="text-label font-medium uppercase tracking-label text-text-tertiary">
      {modeLabel[hackathon.mode]}
    </p>
  </div>
</div>
```

No `bg-gradient-*`, `hackathon.coverGradient`, image dependency, or raw color value remains in the card cover.

## Legacy alias replacements
`src/components/events/event-card.tsx`:
- Removed `bg-gradient-to-br` plus `hackathon.coverGradient`; replaced with `bg-background-sunken`, `border-border-default`, and a generated `getEventMark(hackathon.title)` typographic mark.
- Removed `cn` because the gradient class composition is gone.
- Replaced `text-ink-subtle` with `text-text-secondary` / `text-text-tertiary`.
- Replaced `text-ink` with `text-text-primary`.
- Replaced `group-hover:text-accent` with `group-hover:text-brand` on interactive hover only.
- Replaced `text-ink-muted` with `text-text-secondary`.
- Replaced `hover:shadow-sm` with sanctioned `group-hover:shadow-raised`.
- Replaced raw type utilities like `text-xs`, `text-sm`, and `text-lg` with `text-label`, `text-body-sm`, and `text-heading-sm`/`text-heading-lg`.

`src/app/(public)/events/page.tsx`:
- No legacy compatibility alias classes were present in the current file. The wrapper now uses `bg-background-default` and `text-text-primary`, and grid spacing now uses the page/card rhythm from the design system.

`src/app/(public)/events/loading.tsx`:
- No legacy compatibility alias classes were present in the current file. The skeleton now uses `bg-background-default`, `border-border-default`, `rounded-card`, and `rounded-pill` in the updated card skeleton shape.

## Clay / brand usage
Brand color appears only as inherited section-header emphasis or interactive state feedback:

```tsx
<p className="text-label font-semibold uppercase tracking-label text-brand">{eyebrow}</p>
```

from the existing `SectionHeader` primitive, plus these `EventCard` interaction states:

```tsx
group-focus-visible:border-brand group-focus-visible:ring-brand-tint
```

```tsx
group-hover:text-brand
```

No `bg-brand`, `bg-brand-tint`, `text-accent`, `bg-accent`, or brand decorative fill appears in the touched files.

## Links and route behavior
Every card still links through the existing slug:

```tsx
<Link href={`/events/${hackathon.slug}`} className="group block h-full focus-visible:outline-none">
```

`npm run build` confirmed the existing detail slugs still prerender:

```text
/events/jordan-ai-builders-hackathon
/events/usj-fintech-sprint
/events/psut-hardware-hack
```

The event detail page was not touched.

## Responsive behavior
- At 375px: `/events` uses 16px gutters (`px-4`), a single-column grid (`grid-cols-1`), 16px card gaps (`gap-4`), and each card keeps a fixed 128px identity cover above stacked metadata rows.
- At 1280px: content is constrained to `max-w-6xl`, the grid becomes three columns via `lg:grid-cols-3`, gaps increase to 24px via `sm:gap-6`, and card heights align through `h-full`/`flex-1`.

No screenshot or visual-diff automation exists as a repo command or direct `package.json` dependency for Playwright, Cypress, or Puppeteer. The responsive check above is based on the implemented breakpoint classes rather than fabricated screenshot evidence.

## Verification results
- `npm run build` - passed.
- `npx tsc --noEmit` - passed.
- `npx eslint .` - passed.
- `powershell -ExecutionPolicy Bypass -File scripts/verify.ps1` - passed:
  - `npm run build`
  - `npx tsc --noEmit`
  - `npx eslint .`
  - forbidden naming scan

Additional local checks:
- Raw hex scan across touched `.tsx` files - no matches.
- Legacy alias / gradient / `coverGradient` scan across touched files - no matches.
- `git diff --check` - passed; Git only reported existing Windows line-ending normalization warnings.

## Scope checks
- No docs changed.
- No Supabase, migrations, or database files changed.
- No package files changed.
- No UI primitive files changed.
- No new dependencies were added.
- No public marketplace, public people browsing, public contact reveal, AI winner selection, public negative scoring, or sponsor raw-data access was introduced.

## Deviations
- The card display copy changed as part of the redesign: the previous truncated description line was removed from `EventCard`, and a non-button `View details` link affordance was added inside the existing clickable card. This stays within the task's card/listing redesign scope and supports the requested CTA/hover affordance clarity.
- Date, location, and team-size separators in `EventCard` were normalized to ASCII hyphens.

## Open questions
None.
