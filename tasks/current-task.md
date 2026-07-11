## Task ID
`PHASE-UI-000`

## Phase reference
`/docs/PHASES.md` "Design track" section — tokens + fonts (declarations only) + primitives only, no page redesigns, must precede any surface-level UI work.

## Objective
Align the UI foundation with `docs/DESIGN_SYSTEM.md` before any page redesign.

## Required docs
Read and follow before making any change:
- `docs/DESIGN_SYSTEM.md`
- `docs/PRODUCT_DECISIONS.md`
- `docs/COMPONENTS.md`
- `docs/PHASES.md`

## Allowed files
Only these files may be touched:
- `src/app/globals.css`
- `src/components/ui/button.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/status-badge.tsx`
- `src/components/ui/metric-card.tsx`
- `src/components/ui/empty-state.tsx`
- `src/components/ui/section-header.tsx`
- `src/components/ui/skeleton.tsx`
- `handoff/CODEX_SUMMARY.md`

## Allowed work
- Update CSS variables and semantic design tokens.
- Update only existing primitive components listed above.
- Keep existing page JSX unchanged.
- Preserve existing call sites of every primitive touched.
- Apply Sandstone Editorial: pure white background, ink text, Petra clay action accent, warm stone neutrals.
- Use semantic tokens instead of raw hex values in TSX components.
- Add font-family token declarations only.
- If self-hosted fonts are needed to fully satisfy the type system, add a `TODO` comment only — do not add font files or fetch fonts over the network.
- If a primitive named in `docs/DESIGN_SYSTEM.md` (e.g. `Badge`, `Input`) does not already exist in `src/components/ui/`, skip it and note the gap in the handoff — do not create it.

## Forbidden
- Do not edit any `src/app/**/page.tsx` file.
- Do not create new primitive files.
- Do not touch `docs/`.
- Do not touch Supabase.
- Do not touch `package.json` or `package-lock.json`.
- Do not install packages.
- Do not add font files.
- Do not add dark mode.
- Do not add gradients.
- Do not add glassmorphism.
- Do not add decorative animations.
- Do not add random shadows.

## Approvals on record
- [ ] Database migration approved by human — None required for this task.
- [ ] RLS / contact-reveal logic approved by human — None required for this task.

Font *binary asset* addition is explicitly NOT approved in this task — declarations/fallback stacks only.

## Acceptance criteria
- [ ] `powershell -ExecutionPolicy Bypass -File scripts/verify.ps1` passes.
- [ ] `git diff` is limited to the allowed files list above.
- [ ] No page files changed.
- [ ] No docs changed.
- [ ] No Supabase files changed.
- [ ] No package files changed.
- [ ] No new primitive files created.
- [ ] No raw hex value appears inside any touched `.tsx` component — colors route through semantic tokens.
- [ ] Clay/brand accent used only for action emphasis, not as background wallpaper.
- [ ] Codex writes `handoff/CODEX_SUMMARY.md`.

## Constraints (standing, copied from AGENTS.md — do not remove)
- `user_id` naming rule; `profiles.id` is the only exception; the forbidden identifier (the string formed by `profile` + `_` + `id`) must not appear anywhere.
- No public marketplace, no public people browsing, no public contact reveal.
- No AI winner selection, no public negative scoring.
- No sponsor access to raw participant data without explicit opt-in.
- No new dependencies unless explicitly listed above (none are).
- `/docs` is read-only for this task.

## Verification steps
1. `npm run build`
2. `npx tsc --noEmit`
3. `npx eslint .`
4. `powershell -ExecutionPolicy Bypass -File scripts/verify.ps1`

## Handoff notes expected
- List every semantic token added/changed in `globals.css`, old value → new value where changed.
- Confirm no raw hex value was introduced in any touched primitive.
- Quote the clay/brand accent usage sites in the updated primitives.
- State whether font self-hosting is needed, and confirm only a `TODO` comment was added, not a workaround.
- Confirm no `src/app/**/page.tsx` file appears in the diff.
- Note any `DESIGN_SYSTEM.md`-described primitive that doesn't exist yet and was correctly skipped.
