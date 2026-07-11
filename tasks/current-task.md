## Task ID
`PHASE-UI-002`

## Phase reference
`/docs/PHASES.md` "Design track" section — second surface-by-surface UI task, following `PHASE-UI-000` (tokens/primitives foundation, approved) and `PHASE-UI-001` (event detail surface, approved). Targets `docs/DESIGN_SYSTEM.md` §L Tier 2 surface "listing" and §M's page-level direction for the events listing page.

## Objective
Redesign only the public events listing surface at `/events` using the approved Sandstone Editorial design system, now that the tokens/primitives from `PHASE-UI-000` and the event detail surface from `PHASE-UI-001` are complete and can serve as the pattern reference.

## Required reading
Read and follow before making any change:
- `docs/DESIGN_SYSTEM.md`
- `docs/PRODUCT_DECISIONS.md`
- `docs/COMPONENTS.md`
- `docs/PHASES.md`
- `handoff/CLAUDE_REVIEW.md` and `handoff/CODEX_SUMMARY.md` from `PHASE-UI-000` (lists exact semantic token/class names now available)
- `handoff/CLAUDE_REVIEW.md` and `handoff/CODEX_SUMMARY.md` from `PHASE-UI-001` (shows the approved pattern for removing the gradient cover and replacing it with a tokens-only system-generated identity treatment — reuse the same approach and class vocabulary for consistency, do not invent a different treatment)

## Current implementation (read before editing)
The listing route lives under the `(public)` route group:
- `src/app/(public)/events/page.tsx` — the page itself. Server component, no async fetch (mock data imported directly), renders a `SectionHeader` (eyebrow/title/description) followed by a responsive grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`) of `EventCard` components, one per `hackathons` mock entry.
- `src/app/(public)/events/loading.tsx` — the route's loading skeleton, already using the `Skeleton` primitive, matching the page's header + 3-column grid shape with 6 placeholder cards.
- `src/components/events/event-card.tsx` — the card component rendered per event. Currently: a `Link` wrapping a `Card`, with a `bg-gradient-to-br` + `hackathon.coverGradient` band (the same gradient pattern `PHASE-UI-001` removed from the detail page), organizer name + `StatusBadge`, title (hover color via `group-hover:text-accent`), truncated description, and a metadata row (date range, city/mode, team size) using legacy alias classes (`text-ink-subtle`, `text-ink`, `text-ink-muted`, `text-accent`).

All three files still use pre-`PHASE-UI-000` **compatibility alias classes** (`text-ink`, `text-ink-subtle`, `text-ink-muted`, `text-accent`) rather than the new semantic token classes. This task must migrate them, consistent with how `PHASE-UI-001` migrated the event detail page.

The card's cover band uses the same `bg-gradient-to-br` + `hackathon.coverGradient` pattern that `PHASE-UI-001` already removed from the event detail page's hero. This task must apply the equivalent system-generated, tokens-only treatment here too — reuse the same visual vocabulary (e.g. a flat `bg-background-sunken` panel with a typographic mark), not a new one-off design.

## Allowed files
Only these files may be touched:
- `src/app/(public)/events/page.tsx`
- `src/app/(public)/events/loading.tsx`
- `src/components/events/event-card.tsx`
- `handoff/CODEX_SUMMARY.md`

Do not touch any file outside this list, including but not limited to `src/components/ui/*` primitives, `src/app/(public)/events/[slug]/**`, `src/components/events/event-facts-strip.tsx`, `src/lib/mock-data.ts`, or `src/types/domain.ts`. Primitives and mock data may be **read and consumed**, not edited.

## Allowed work
- Redesign the JSX/markup and Tailwind classes of the three allowed files to follow `docs/DESIGN_SYSTEM.md`.
- Use only the existing primitives from `src/components/ui/` as landed in `PHASE-UI-000` (`Card` + subparts, `StatusBadge`, `SectionHeader`, `Skeleton`) — consume them, do not modify them.
- Use only the semantic token/utility classes already defined in `globals.css` (e.g. `text-text-primary`, `text-text-secondary`, `text-text-tertiary`, `bg-background-default`, `bg-background-sunken`, `border-border-default`, `text-brand`, `bg-brand`, `bg-brand-tint`, `rounded-card`, `rounded-control`, `shadow-raised`, the `text-heading-*`/`text-body*`/`text-label`/`text-metric` type tokens). Do not invent new class names or new CSS variables.
- Use the existing mock data shape as-is (`Hackathon` type, `hackathons`) — no changes to data or its shape.
- Replace the per-card gradient cover with a system-generated, tokens-only typographic identity treatment consistent with the pattern `PHASE-UI-001` established for the event detail page — no gradient, no imagery dependency.
- Improve visual hierarchy, card/listing quality, discoverability of key event facts (date, mode, city, team size, status), CTA/hover affordance clarity, and general editorial spacing per `docs/DESIGN_SYSTEM.md` §F/§H.
- Update `loading.tsx`'s skeleton shape only as needed to match the redesigned page/card structure (e.g. if card height or grid columns change) — keep it a skeleton, not a fully-styled fake card.
- Ensure the page reads cleanly at 375px width (mobile, single column) and 1280px width (desktop, existing or improved multi-column grid).
- Preserve every existing `Link href={`/events/${hackathon.slug}`}` — the listing must keep linking to the same event detail routes `PHASE-UI-001` already redesigned.
- A tiny, justified fix to a global token in `globals.css`, or a tiny shared-component bug fix in `event-facts-strip.tsx`/the detail page, is allowed only if a genuine bug is discovered while working on this page — must be explained in the handoff; do not use this as a loophole for unrelated changes.

## Forbidden
- Do not edit `/events/[slug]` (`src/app/(public)/events/[slug]/**`) or `src/components/events/event-facts-strip.tsx`, except for the narrow, justified bug-fix exception above.
- Do not edit the landing page (`src/app/(public)/page.tsx`).
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
- Do not create new product flows.
- Do not add functional search/filtering backed by new state or logic unless it already exists in this codebase and only needs visual restyling — it does not currently exist, so do not add it.
- Do not add dark mode.
- Do not add gradients.
- Do not add glassmorphism.
- Do not add decorative animations.
- Do not add random/ad-hoc shadow values — only the two sanctioned `shadow-raised`/`shadow-overlay` tokens (or no shadow, per the "1px borders over shadows" preference).
- Do not add raw hex values in any `.tsx` file.
- Do not introduce a public marketplace, public people browsing, or public contact reveal of any kind.
- Do not create new primitive components — reuse what `PHASE-UI-000` already restyled.

## Approvals on record
- [ ] Database migration approved by human — None required for this task.
- [ ] RLS / contact-reveal logic approved by human — None required for this task.

## Acceptance criteria
- [ ] `/events` renders correctly with all existing mock hackathons listed.
- [ ] Every event card's link still points to its existing `/events/[slug]` route (same slugs as before).
- [ ] The event detail page's behavior is unchanged (no edit, unless the narrow justified bug-fix exception was used and is explained in the handoff).
- [ ] No file outside the allowed list changed.
- [ ] No docs changed.
- [ ] No Supabase/database files changed.
- [ ] No package files changed.
- [ ] `npm run build`, `npx tsc --noEmit`, `npx eslint .`, and `powershell -ExecutionPolicy Bypass -File scripts/verify.ps1` all pass.
- [ ] The redesigned page, card, and loading skeleton use `docs/DESIGN_SYSTEM.md` semantic tokens/classes, not the legacy compatibility aliases (`text-ink`, `text-ink-subtle`, `text-accent`, etc.).
- [ ] No gradient remains in the card cover treatment; the event identity block is system-generated and tokens-only, consistent with the `PHASE-UI-001` pattern.
- [ ] No raw hex value appears in any touched `.tsx` file.
- [ ] Clay/brand color is used only for action emphasis (e.g. hover/interactive state), not as decorative fill.
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
1. `npm run build` — confirm `/events` still builds and all card links resolve to valid `generateStaticParams()` slugs.
2. `npx tsc --noEmit`
3. `npx eslint .`
4. `powershell -ExecutionPolicy Bypass -File scripts/verify.ps1`
5. Manually describe (in the handoff) how the grid/card layout behaves at 375px and 1280px — actual browser/viewport check if tooling allows, otherwise a careful class-by-class reasoning of the responsive breakpoints used.

## Handoff notes expected
- Quote the exact before/after markup for the card's cover/identity treatment (proving the gradient was removed and replaced with a tokens-only system-generated block consistent with `PHASE-UI-001`'s pattern).
- List every legacy alias class (`text-ink`, `text-ink-subtle`, `text-accent`, etc.) that was replaced, and its semantic-token replacement, per file.
- Confirm no raw hex value was introduced in any touched file.
- Quote every clay/brand color usage site so the "action emphasis, not decoration" rule can be spot-checked.
- Confirm every event card's link `href` still targets an existing `/events/[slug]` route, and that the detail page itself was not touched (or, if the narrow bug-fix exception was used, explain exactly what and why).
- State explicitly whether any screenshot or visual-diff automation exists in this repo; if not, say so plainly instead of claiming visual verification that didn't happen.
- Note any deviation, however small (e.g. any component prop added/removed, any copy change), explicitly under a `## Deviations` heading — do not write "None" if anything, even minor, changed outside the literal task text.
