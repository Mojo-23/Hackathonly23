## Task ID
`PHASE-UI-001`

## Phase reference
`/docs/PHASES.md` "Design track" section — first surface-by-surface UI task after `PHASE-UI-000` (tokens/primitives foundation, approved). Targets `docs/DESIGN_SYSTEM.md` §L Tier 1 surface "hackathon detail page" and §M's page-level direction for the event detail page.

## Objective
Redesign only the event detail surface at `/events/[slug]` using the approved Sandstone Editorial design system and the tokens/primitives landed in `PHASE-UI-000`.

## Required reading
Read and follow before making any change:
- `docs/DESIGN_SYSTEM.md`
- `docs/PRODUCT_DECISIONS.md`
- `docs/COMPONENTS.md`
- `docs/PHASES.md`
- `handoff/CLAUDE_REVIEW.md` (the `PHASE-UI-000` review — confirms which semantic tokens/classes now exist and are approved for use)
- `handoff/CODEX_SUMMARY.md` (the `PHASE-UI-000` summary — lists exact token names added to `globals.css` and the primitives already restyled)

## Current implementation (read before editing)
The route lives under the `(public)` route group, not a bare `src/app/events/` path:
- `src/app/(public)/events/[slug]/page.tsx` — the page itself. Server component, `generateStaticParams()` from `hackathons` mock data, fetches via `getHackathonBySlug(slug)`, calls `notFound()` if missing. Currently renders: a `bg-gradient-to-br` cover band using `hackathon.coverGradient`, status badge + organizer name, title, description, two CTA links (`Register now`, conditional `Join matching pool after registering`), then a two-column layout: `EventFactsStrip`, Tracks section (mapped `Card`s), Timeline section (ordered list with an accent dot), Rules section, and a right rail with a Prizes `Card` and a Privacy note `Card`.
- `src/app/(public)/events/[slug]/not-found.tsx` — the route's not-found state, already uses `EmptyState` + `buttonVariants`.
- `src/components/events/event-facts-strip.tsx` — the facts-strip component imported by the page (date range, location/mode, team size, "Privacy-first matching"), currently styled with legacy alias classes (`bg-paper-raised`, `border-border`, `text-ink`, `text-accent`).

Both `page.tsx` and `event-facts-strip.tsx` still use the pre-`PHASE-UI-000` **compatibility alias classes** (`text-ink`, `text-ink-muted`, `bg-paper-raised`, `border-border`, `text-accent`, `bg-accent-soft`) rather than the new semantic token classes (`text-text-primary`, `text-text-secondary`, `bg-background-default`, `border-border-default`, `text-brand`, `bg-brand-tint`) that `PHASE-UI-000` introduced. This task must migrate these two files onto the new semantic classes as part of the redesign, not leave them on the legacy aliases.

The page's cover band currently uses `bg-gradient-to-br` + `hackathon.coverGradient` (a per-event gradient string from mock data). `docs/DESIGN_SYSTEM.md` mandates system-generated, non-gradient, non-illustration event identity — this cover treatment must be replaced with a typographic/tokens-only system-generated treatment as part of this task (see Forbidden: no gradients).

## Allowed files
Only these files may be touched:
- `src/app/(public)/events/[slug]/page.tsx`
- `src/app/(public)/events/[slug]/not-found.tsx`
- `src/components/events/event-facts-strip.tsx`
- `handoff/CODEX_SUMMARY.md`

Do not touch any file outside this list, including but not limited to `src/components/ui/*` primitives, `src/components/events/event-card.tsx`, `src/app/(public)/events/page.tsx`, `src/app/(public)/events/loading.tsx`, `src/lib/mock-data.ts`, or `src/types/domain.ts`. Primitives and mock data may be **read and consumed**, not edited.

## Allowed work
- Redesign the JSX/markup and Tailwind classes of the three allowed files to follow `docs/DESIGN_SYSTEM.md`.
- Use only the existing primitives from `src/components/ui/` as landed in `PHASE-UI-000` (`Button`/`buttonVariants`, `Card` + subparts, `StatusBadge`, `EmptyState`) — consume them, do not modify them.
- Use only the new semantic token/utility classes already defined in `globals.css` by `PHASE-UI-000` (e.g. `text-text-primary`, `text-text-secondary`, `text-text-tertiary`, `bg-background-default`, `bg-background-sunken`, `border-border-default`, `text-brand`, `bg-brand`, `bg-brand-tint`, `rounded-card`, `rounded-control`, `rounded-pill`, `shadow-raised`, `shadow-overlay`, the `text-heading-*`/`text-body*`/`text-label`/`text-metric` type tokens). Do not invent new class names or new CSS variables.
- Use the existing mock data shape as-is (`Hackathon` type, `getHackathonBySlug`, `hackathons`) — no changes to data or its shape.
- Replace the gradient cover band with a system-generated, tokens-only typographic identity treatment (e.g. ink-on-white or a single flat brand/sunken background block with typographic lockup) — no gradient, no imagery dependency.
- Improve visual hierarchy, information architecture ordering, CTA clarity (primary vs. secondary action distinction), the tracks/timeline sections' readability, the privacy note's presentation, and general editorial spacing per `docs/DESIGN_SYSTEM.md` §F/§H.
- Ensure the page reads cleanly at 375px width (mobile) and 1280px width (desktop) — stacked single-column at mobile, the existing two-column (or an improved) layout at desktop.
- Preserve `generateStaticParams()` behavior exactly — all three existing static slugs must still statically generate.
- Preserve `notFound()` behavior for unknown slugs.
- A tiny, justified fix to a global token in `globals.css` is allowed only if a genuine bug is discovered (e.g. a missing token needed to avoid a raw hex) — must be explained in the handoff; do not use this as a loophole to add new tokens for convenience.

## Forbidden
- Do not edit the landing page (`src/app/(public)/page.tsx`).
- Do not edit the events listing page (`src/app/(public)/events/page.tsx` or its `loading.tsx`).
- Do not edit the dashboard (`src/app/(participant)/dashboard/page.tsx`).
- Do not edit any organizer page (`src/app/organizer/**`).
- Do not create auth UI.
- Do not create onboarding UI.
- Do not touch Supabase.
- Do not touch migrations.
- Do not touch database tests.
- Do not touch `package.json` or `package-lock.json`.
- Do not install packages.
- Do not touch `docs/`.
- Do not change global tokens except the narrow, justified bug-fix exception described above.
- Do not create new product flows (registration/matching links may remain as existing placeholder hrefs — do not build out new pages behind them).
- Do not add dark mode.
- Do not add gradients (including removing but not re-adding one elsewhere).
- Do not add glassmorphism.
- Do not add decorative animations.
- Do not add random/ad-hoc shadow values — only the two sanctioned `shadow-raised`/`shadow-overlay` tokens (or no shadow, per the "1px borders over shadows" preference).
- Do not add raw hex values in any `.tsx` file.
- Do not introduce a public marketplace, public people browsing, or public contact reveal of any kind — the privacy note's content and meaning must remain intact.
- Do not create new primitive components — reuse what `PHASE-UI-000` already restyled.

## Approvals on record
- [ ] Database migration approved by human — None required for this task.
- [ ] RLS / contact-reveal logic approved by human — None required for this task.

## Acceptance criteria
- [ ] `/events/[slug]` renders correctly for all existing static slugs (`jordan-ai-builders-hackathon`, `usj-fintech-sprint`, `psut-hardware-hack`).
- [ ] `generateStaticParams()` still statically generates all three slugs (visible in `npm run build` output).
- [ ] The not-found path still renders `EventNotFound` correctly for an unknown slug.
- [ ] No file outside the allowed list changed.
- [ ] No docs changed.
- [ ] No Supabase/database files changed.
- [ ] No package files changed.
- [ ] `npm run build`, `npx tsc --noEmit`, `npx eslint .`, and `powershell -ExecutionPolicy Bypass -File scripts/verify.ps1` all pass.
- [ ] The redesigned page and facts strip use `docs/DESIGN_SYSTEM.md` semantic tokens/classes, not the legacy compatibility aliases (`text-ink`, `bg-paper-raised`, `text-accent`, etc.).
- [ ] No gradient remains in the cover treatment; the event identity block is system-generated and tokens-only.
- [ ] No raw hex value appears in any touched `.tsx` file.
- [ ] Clay/brand color is used only for action emphasis (primary CTA, key accents), not as decorative fill.
- [ ] Layout is clean and usable at 375px and at 1280px (describe/verify in handoff; do not silently skip this check).
- [ ] If no screenshot automation exists in this repo, the handoff states that explicitly rather than fabricating screenshot evidence.
- [ ] Codex writes `handoff/CODEX_SUMMARY.md`.

## Constraints (standing, copied from AGENTS.md — do not remove)
- `user_id` naming rule; `profiles.id` is the only exception; the forbidden identifier (the string formed by `profile` + `_` + `id`) must not appear anywhere.
- No public marketplace, no public people browsing, no public contact reveal.
- No AI winner selection, no public negative scoring.
- No sponsor access to raw participant data without explicit opt-in.
- No new dependencies unless explicitly listed above (none are).
- `/docs` is read-only for this task.

## Verification steps
1. `npm run build` — confirm all three event slugs still statically generate and the not-found path builds.
2. `npx tsc --noEmit`
3. `npx eslint .`
4. `powershell -ExecutionPolicy Bypass -File scripts/verify.ps1`
5. Manually describe (in the handoff) how the layout behaves at 375px and 1280px — actual browser/viewport check if tooling allows, otherwise a careful class-by-class reasoning of the responsive breakpoints used.

## Handoff notes expected
- Quote the exact before/after markup for the cover/identity treatment (proving the gradient was removed and replaced with a tokens-only system-generated block).
- List every legacy alias class (`text-ink`, `bg-paper-raised`, `text-accent`, etc.) that was replaced, and its semantic-token replacement, per file.
- Confirm no raw hex value was introduced in any touched file.
- Quote every clay/brand color usage site so the "action emphasis, not decoration" rule can be spot-checked.
- Confirm `generateStaticParams()` and `notFound()` behavior is unchanged, and cite the `npm run build` route output proving the three slugs still prerender.
- State explicitly whether any screenshot or visual-diff automation exists in this repo; if not, say so plainly instead of claiming visual verification that didn't happen.
- Note any deviation, however small (e.g. any component variant added/removed), explicitly under a `## Deviations` heading — do not write "None" if anything, even minor, changed outside the literal task text.
