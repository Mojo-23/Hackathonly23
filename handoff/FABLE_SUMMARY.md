# FABLE SUMMARY — DESIGN-000

## Task
`DESIGN-000` — convert the approved "Sandstone Editorial" design strategy into permanent, enforceable source-of-truth documentation. Documentation-only; executed directly by Claude (Fable) per the human's instruction, not routed through Codex — hence this summary file rather than `CODEX_SUMMARY.md`.

## Files changed

### 1. `docs/DESIGN_SYSTEM.md` — **created** (new file, the main deliverable)
Complete design system in normative MUST/MUST NOT language, declared as the source of truth for all UI/UX implementation. Sections:
- **A. Design North Star** — Sandstone Editorial defined: pure white ground, ink type, Petra-clay accent, warm-stone neutrals, two registers (marketing/tool), forbidden identity territory (purple/web3/dark-first/template SaaS).
- **B. Brand Personality** — seven attributes each with an enforcement rule; audience MUST-feels (participants/organizers/sponsors); the full never-feels list.
- **C. Visual Direction** — white as brand confidence; clay as action-only; QR finder-bracket motif and blur-to-sharp reveal as the two ownable devices; **system-generated event covers mandatory**; illustration forbidden.
- **D. Color System** — full semantic token table with the exact hex palette provided (background/text/border/brand/status); seven-point color law including the clay ≤3-per-screen rule and the no-raw-hex-in-components rule.
- **E. Typography System** — General Sans (display/marketing only) + Inter (everything in-app) + IBM Plex Sans Arabic (reserved); mechanical role separation; full nine-token type scale; typography law (tabular numerals mandatory, big-numbers-quiet-labels, banned patterns).
- **F. Spacing System** — closed 4→128 scale; register rhythms; heading-attachment rule; anti-slop spacing law.
- **G. Radius, Borders, Elevation** — closed five-radius set; two-shadow law with written-justification requirement for a third; six mandatory interaction states.
- **H. Component Language** — strict per-component rules (role, allowed/forbidden variants, states, hover, color, anti-slop warnings) for buttons, inputs/selects, tabs, cards, event cards, metric cards, tables, badges, chips, section headers, empty states, modals, sidebar/nav, breadcrumbs, CTA blocks.
- **I. Motion System** — three timing tokens; 400ms cap; full motion ban list; the two signature moments (contact reveal ~500ms blur-to-sharp + clay underline sweep; QR check-in success flash) as the entire theatrical budget; `prefers-reduced-motion` mandatory.
- **J. Mobile-First Rules** — collapse order, tables→record cards, sticky-CTA singleton rule, 44/48/56px touch targets, participant QR screen as designed artifact.
- **K. Anti-Sloppy-AI Doctrine** — "What not-sloppy-AI UI means for Hackathonly Jordan": uniform-medium-emphasis diagnosis, the full banned-pattern list (visual/layout/component/color/motion/dashboard), and the three mandatory review tests (squint, deletion, neighbor) as review-blocking checks.
- **L. Screen Hierarchy** — Tier 1 (event detail, command center, reveal flow, report template), Tier 2, Tier 3, with the taste-where-strangers-judge principle.
- **M. Page-Level Direction** — per-page purpose/hierarchy/emotional goal/required sections/CTA/density/premium markers/risks/forbidden patterns for all ten surfaces (landing, listing, detail, auth, onboarding, participant dashboard, command center, QR check-in pair, submission flow, report template).
- **N. Implementation Route** — DESIGN-000 (this task) → PHASE-UI-000 (tokens/fonts/primitives only, no page redesigns) → surface-by-surface tasks with 375px/1280px screenshot requirement and standing acceptance criteria for every future UI task.

### 2. `docs/PRODUCT_DECISIONS.md` — **D18 added**
"Sandstone Editorial is the approved V1 visual direction." Status: accepted. Records: reason, alternatives rejected, V1 light-only, pure white superseding the warm-paper default, dark mode not-V1 (scanner-screen local exception sanctioned), mandatory system covers, no purple/web3, contact reveal as signature interaction, `DESIGN_SYSTEM.md` as UI source of truth, and that the Phase 2 `globals.css` token base is now out of date by design pending PHASE-UI-000. Placed after D17 in correct numbering order (an initial mis-ordering was caught and fixed during the edit).

### 3. `docs/COMPONENTS.md` — **reconciled**
§1 rewritten: now points to `DESIGN_SYSTEM.md` as the visual source of truth and removes the three stale conflicts — warm off-white paper base (now pure white), "dark mode for organizer surfaces from day one" (now light-only V1), and the undecided "Geist or Inter / desert-amber or crimson" language (now the decided General Sans + Inter / Petra clay). §2's `EventCard`/`EventHero` entries updated to require system-generated covers. Component *architecture* content (inventory, §3 code rules) untouched — it did not conflict.

### 4. `docs/PHASES.md` — **planning note added**
New "Design track" section at the end: DESIGN-000 marked complete (docs only), PHASE-UI-000 defined as the mandatory next UI step (tokens + fonts + primitives, no page redesigns), then surface-by-surface tasks per §L tier order with the screenshot/review requirements.

### 5. `handoff/FABLE_SUMMARY.md` — this file.

## Confirmations
- **No UI implementation occurred.** No component, page, or style was created or modified.
- **No `src/` files changed** (including `globals.css`).
- **No database/Supabase files changed** — `supabase/migrations/` and `supabase/tests/` untouched.
- **No `package.json`/`package-lock.json` changes; no fonts or packages installed.**
- Nothing was committed; no Codex run occurred.

## Follow-up tasks
1. **Human review** of the four doc changes (especially `DESIGN_SYSTEM.md` — it is now binding on all future UI work).
2. **Commit** once approved.
3. **PHASE-UI-000** — tokens + fonts + primitives task (the font self-hosting asset addition will need explicit human approval in that task, consistent with the no-new-dependencies standing rule).
