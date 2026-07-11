## Task ID
`PHASE-UI-003B`

## Phase reference
`/docs/PHASES.md` "Design track" section — a taste-refinement pass on `PHASE-UI-003` (landing page), applied before that task's uncommitted work is finalized. Not a new surface; a quality pass on the current in-progress landing implementation.

## Objective
Improve the current **uncommitted** `PHASE-UI-003` landing page implementation so it feels much closer to TAIKAI's platform-grade landing page quality, density, rhythm, and product confidence, while staying fully Hackathonly-branded and Sandstone Editorial.

## Context
`PHASE-UI-003`'s implementation is in the working tree right now, uncommitted (`git status` shows `src/app/(public)/page.tsx` and `handoff/CODEX_SUMMARY.md` as modified, not yet committed). It passed its own verification and review, but the visual result is still assessed as too flat and document-like compared with the desired TAIKAI-level platform feel: the hero preview is too small, sections repeat the same flat-card rhythm, and the page lacks the strong product-preview stage and varied section composition that makes TAIKAI feel premium. This task refines that existing implementation — it does not redo it from scratch and does not revert to the pre-`PHASE-UI-003` skeleton.

## Required reading
Read and follow before making any change:
- `docs/DESIGN_SYSTEM.md`
- `docs/PRODUCT_DECISIONS.md`
- `docs/COMPONENTS.md`
- `docs/PHASES.md`
- `handoff/CODEX_SUMMARY.md` from `PHASE-UI-003` (what was actually built — read the current file, this summary describes the starting point for this task)
- `handoff/CLAUDE_REVIEW.md` from `PHASE-UI-003` (what was flagged/approved — this task is a targeted follow-up to that review's substance, not a re-litigation of it)

## TAIKAI reference analysis (design reference only — read before designing)
`https://taikai.network/` was fetched directly as part of writing this task. The fetch converted the page to text/markdown for analysis and could extract **content structure and information architecture only** — it could not observe actual rendered visual density, color, spacing, or pixel composition (no screenshot/visual rendering was performed). Treat the findings below as directional structural reference, not a pixel spec — they are exactly the kind of "quality, structure, rhythm, and platform confidence" signal this task asks for, not a layout to trace.

What the fetch surfaced:
- **Hero/positioning**: a concise, confident tagline immediately establishing the platform as a comprehensive hackathon management solution, reinforced by trust signals (social proof / "used by many organizations" framing) stated close to the top, before any deep feature explanation.
- **Audience segmentation, sequenced**: the page addresses two personas in a deliberate order — participant-facing capabilities (discovering events, submitting work, earning recognition) presented first, organizer-facing capabilities (hosting, dashboard/management) presented after. The ordering itself signals "this is a real two-sided platform," not just a feature list.
- **Capability overview as a distinct block**: a small number of action-oriented capability groups (not a long undifferentiated feature list) gives the page a "here is what you can actually do here" feeling early, rather than pure brand copy.
- **Resource/utility depth**: deeper technical/resource links (API, docs-style resources) exist but are secondary — they signal platform maturity without cluttering the primary narrative.
- **No embedded visual feature-carousel data was recoverable from this fetch** — the "product preview" quality of TAIKAI's actual hero (screenshots/dashboard mockups) is known by reputation and the design brief's own description, not confirmed pixel-for-pixel by this fetch. Do not assume any specific TAIKAI visual asset, color, or exact composition — build the Hackathonly product-preview panel from the **qualities** listed below and the existing Sandstone Editorial system, not from a traced layout.

Qualities to translate into Hackathonly's Sandstone Editorial identity (not copy):
- Hero scale and composition that reads as a platform stage, not a text block.
- A large, dominant product/dashboard preview presence near the top of the page.
- Section rhythm that moves through capability → inventory → audience split → credibility without repeating the same visual block.
- Platform-grade density: more information per viewport than a brochure page, without feeling cluttered.
- A featured hackathon/event inventory feeling — real, current, "you could act on this today."
- A clear participant/organizer split, sequenced so both personas feel addressed.
- Considered card hierarchy (not every card the same size/weight), and confident spacing/pacing between sections.
- Clear, hierarchical CTA placement (one obvious primary action, secondary actions present but visually subordinate).
- An overall feeling of "real platform," not "brochure" or "documentation."

Translate every one of these into Hackathonly's own system: pure white ground, ink text, Petra clay as the single action accent, warm stone borders, typographic system-generated panels (no imagery/gradients), Jordan-native hackathon positioning, privacy-first matching, and an organizer command-center story. The result must be unmistakably Hackathonly, not a TAIKAI reskin.

## Current implementation (read before editing)
- `src/app/(public)/page.tsx` — the current, uncommitted `PHASE-UI-003` landing page. Read it directly before editing; do not rely solely on the `PHASE-UI-003` handoff's description, since this task's whole premise is that the shipped result under-delivers on the density/confidence target relative to what that handoff described. Identify exactly which sections repeat the same flat white-bordered-card pattern and which part of the hero is under-scaled before making changes.
- `src/components/events/event-card.tsx` — the committed `PHASE-UI-002` card component, available to consume as-is for the featured-hackathons section (same rule as `PHASE-UI-003`: do not modify it).

## Allowed files
Only these files may be touched:
- `src/app/(public)/page.tsx`
- `handoff/CODEX_SUMMARY.md`

Do not touch any file outside this list, including but not limited to `src/components/ui/*` primitives, `src/components/events/event-card.tsx`, `src/app/(public)/events/**`, `src/app/(public)/layout.tsx`, `src/lib/mock-data.ts`, or `src/types/domain.ts`. Primitives, `EventCard`, and mock data may be **read and consumed**, not edited. **Do not create any new file** — no new component files, no new hooks; everything must live inside `src/app/(public)/page.tsx`, same constraint as `PHASE-UI-003`.

## Scope
- Work only on the landing page. Refine the current uncommitted implementation — do not revert to the pre-`PHASE-UI-003` skeleton and do not start over from a blank page.
- Make the page feel much closer to TAIKAI in: hero scale, product-preview depth, featured-event presence, section rhythm, platform confidence, premium visual density.
- Keep Hackathonly's own Sandstone Editorial brand throughout.
- Keep copy original, privacy-first, Jordan-native, and not Web3 — copy may be adjusted as needed to fit new compositions, but must not contradict or weaken the privacy-first / no-public-marketplace framing already established.
- Use existing mock events and `EventCard` where it helps; otherwise build landing-local typographic preview panels/strips directly inside `page.tsx` — no new files.
- Preserve every existing navigation link target exactly (`/events`, `/organizer/events/jordan-ai-builders-hackathon`, and any "view all events"-style link to `/events`).

## Specific design requirements

### 1. Hero
- Make the hero feel like a major platform stage, not just text plus a small card.
- Add or enlarge a product-preview dashboard-style panel that suggests the Hackathonly Event Intelligence OS: registration, team formation, check-in, submissions, sponsor report — visually dominant and screenshot-worthy, not a small side panel.
- Built entirely from Sandstone tokens, borders, typography, and flat editorial panels — no gradients, no glass, no imagery.

### 2. Featured hackathons
- Keep featured hackathons visible early (same requirement as `PHASE-UI-003` — do not move this section later in the page).
- Make the section feel like real platform inventory (a live event list a user could actually register through today), not simple brochure cards.

### 3. Section rhythm
- Avoid repeating identical white-bordered-card grids section after section — this is the core defect this task exists to fix.
- Use varied compositions: split panels, dense dashboard-like strips, a capability matrix, an event-inventory row, an organizer command panel, etc. — vary layout structure between sections, not just copy.
- Keep pure white confidence and warm stone borders throughout — richer composition, not a different palette.

### 4. Participant + organizer story
- Participant matching/privacy value must remain clear.
- Organizer command-center value must remain clear.
- Reaffirm explicitly: this is not a public marketplace or people browser — richer visual density must never come at the cost of this framing.

### 5. Taste target
- If the result still feels like a documentation page, the task has failed its own objective — this is the bar Codex must self-check against before finishing, not just a checkbox.
- It should feel like a premium platform homepage close to TAIKAI's rhythm, without copying TAIKAI assets, text, or colors.

## Forbidden
- Do not touch `/events` (`src/app/(public)/events/page.tsx`, `loading.tsx`) or `/events/[slug]` (`src/app/(public)/events/[slug]/**`), or `event-facts-strip.tsx`.
- Do not touch `src/components/events/event-card.tsx` — consumed as-is.
- Do not touch the dashboard (`src/app/(participant)/dashboard/page.tsx`) or any organizer page (`src/app/organizer/**`).
- Do not touch `src/app/(public)/layout.tsx` or any shared header/footer/nav file.
- Do not touch `docs/`.
- Do not touch Supabase, migrations, or database tests.
- Do not touch `package.json` or `package-lock.json`.
- Do not install packages; do not add new dependencies.
- Do not add new files of any kind.
- Do not add raw hex values in any `.tsx` file.
- Do not add dark mode.
- Do not add glassmorphism.
- Do not add random/ad-hoc shadow values — only the two sanctioned `shadow-raised`/`shadow-overlay` tokens (or no shadow).
- Do not add gradients as decorative fill (the product-preview panel must be flat/token-only, not a gradient).
- Do not copy TAIKAI text, assets, logos, or exact layout.
- Do not use purple/Web3/NFT language or visual tropes.
- Do not introduce a public marketplace, public people browsing, or public contact reveal of any kind.
- Do not add functional signup/login behavior or any new backend behavior.

## Approvals on record
- [ ] Database migration approved by human — None required for this task.
- [ ] RLS / contact-reveal logic approved by human — None required for this task.

## Acceptance criteria
- [ ] `/` renders correctly.
- [ ] The landing page is visibly closer to TAIKAI-level platform quality than the current `PHASE-UI-003` attempt (the handoff must explain what changed and why it addresses the flat/document-like critique, not just list edits).
- [ ] Hero has a large, product-preview-driven composition — not text plus a small card.
- [ ] The page no longer feels like repeated identical-card documentation sections; at least the sections named in "Section rhythm" above use genuinely varied composition.
- [ ] Featured hackathons remain visible early in the page.
- [ ] Participant and organizer value are both clear.
- [ ] Sandstone Editorial is preserved (pure white, ink text, warm stone borders, closed token sets).
- [ ] No raw hex values in `src/app/(public)/page.tsx`.
- [ ] Clay/brand color remains action-emphasis only, respecting the ≤3-per-screen rationing rule even at higher density.
- [ ] No file outside the allowed list changed; no new file created.
- [ ] All existing navigation link targets unchanged.
- [ ] No TAIKAI text, imagery, logos, or exact visual assets copied; no purple/Web3/NFT language or visual pattern introduced.
- [ ] `npm run build`, `npx tsc --noEmit`, `npx eslint .`, and `powershell -ExecutionPolicy Bypass -File scripts/verify.ps1` all pass.
- [ ] The result must feel visually and structurally closer to TAIKAI's platform homepage than the current Hackathonly attempt, while remaining clearly Hackathonly-branded and not copying TAIKAI text/assets/colors.
- [ ] Codex writes `handoff/CODEX_SUMMARY.md` with a before/after explanation (what the flat version looked like, what changed, why it now reads as platform-grade) and any deviations.

## Failure condition
If the landing page still feels like repeated white documentation cards with a small hero preview, **the task has failed**, regardless of whether the acceptance checkboxes above were mechanically satisfied. This is the actual bar Codex is being held to — do not treat the checklist as sufficient on its own; use the "Taste target" self-check in §5 above before considering this task done.

## Constraints (standing, copied from AGENTS.md — do not remove)
- `user_id` naming rule; `profiles.id` is the only exception; the forbidden identifier (the string formed by `profile` + `_` + `id`) must not appear anywhere.
- No public marketplace, no public people browsing, no public contact reveal.
- No AI winner selection, no public negative scoring.
- No sponsor access to raw participant data without explicit opt-in.
- No new dependencies unless explicitly listed above (none are).
- `/docs` is read-only for this task.

## Verification steps
1. `npm run build` — confirm `/` still builds and every navigation link target is unchanged.
2. `npx tsc --noEmit`
3. `npx eslint .`
4. `powershell -ExecutionPolicy Bypass -File scripts/verify.ps1`
5. Manually describe (in the handoff) how the enlarged hero/product-preview panel and the varied section compositions behave at 375px and 1280px — actual browser/viewport check if tooling allows, otherwise careful class-by-class reasoning.

## Handoff notes expected
- A clear before/after narrative: what specifically made the `PHASE-UI-003` version read as flat/document-like, and what specific structural changes (not just token tweaks) address that.
- Describe the enlarged/rebuilt hero product-preview panel in detail: what it shows, how it suggests "registration → team formation → check-in → submissions → sponsor report," and confirm it is flat/token-only (no gradient, no image).
- List which sections now use varied composition (split panel, dashboard strip, capability matrix, event-inventory row, organizer command panel, etc.) versus the prior repeated card-grid pattern.
- Confirm no raw hex value was introduced.
- Quote every clay/brand color usage site so the ≤3-per-screen rule can be spot-checked at the new density.
- Confirm all navigation link targets are unchanged.
- Confirm `EventCard` was not modified — only consumed.
- Explicitly confirm no TAIKAI text/asset/logo was copied and no purple/Web3/NFT language or visual pattern was introduced.
- State explicitly whether any screenshot or visual-diff automation exists in this repo; if not, say so plainly instead of claiming visual verification that didn't happen.
- Note any deviation, however small, explicitly under a `## Deviations` heading, with the reasoning behind each structural choice.

---

## Archive note

**Status: SUPERSEDED — not executed as written, and no longer applicable.**

This task was never executed through the Claude-plans/Codex-implements/Claude-reviews workflow it describes. Instead, the human explicitly authorized Claude to act as Design Authority and implement the public experience directly (see `CLAUDE.md`'s "Design Authority" section and `docs/PRODUCT_DECISIONS.md` D19/D20-equivalent decisions), and the landing page — along with `/organizers`, `/participants`, `/blog`, and `/events` — was subsequently rebuilt several times over, culminating in the TAIKAI-inspired public experience now adopted as the official Hackathonly design (see `handoff/CLAUDE_IMPLEMENTATION_SUMMARY.md` for the current, authoritative record).

Every constraint this task describes (Sandstone Editorial only, no TAIKAI assets/text/purple, clay rationing, no public marketplace) remained binding throughout that later work — only the *process* (direct Claude implementation instead of a Codex handoff) and the *scope* (eventually the whole public experience, not just `/`) diverged from what's written above. Archived here so `tasks/current-task.md` could be reset to a clean no-active-task state. This file is a historical record of an earlier, narrower plan — do not treat it as describing the current implementation.
