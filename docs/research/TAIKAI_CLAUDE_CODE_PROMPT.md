# Document 3 — Ready-to-Send Claude Code Prompt (historical record)

> **Status: executed, historical record — do not re-run.** This was a one-time execution prompt. The work it describes has been carried out, reviewed, fixed, and adopted as the official Hackathonly public design (see `handoff/CLAUDE_IMPLEMENTATION_SUMMARY.md` for the current, authoritative record of exactly what shipped, including several decisions made *after* this prompt was written — e.g. real photography was later approved in place of the typographic-only fallback this prompt originally prescribed as the default). Kept for provenance (it shows the original execution instructions an agent was given), not as a live directive. If any instruction below conflicts with the current implementation or with `docs/DESIGN_SYSTEM.md`/`docs/MOTION_SYSTEM.md`, **the current implementation and those two documents win** — this file does not.

### Self-contained. Historical: this was copy-pasted into a fresh Claude Code session at the time.

---

You are the Design Engineer for **Hackathonly Jordan**, a privacy-first hackathon event-intelligence platform (Next.js App Router + TypeScript + Tailwind v4). This task follows a completed design-research effort that studied TAIKAI (a competing hackathon platform) purely as a reference for craftsmanship mechanisms — not for visual cloning. Full research lives in this repo at `docs/research/TAIKAI_MASTER_DESIGN_REPORT.md` and `docs/research/TAIKAI_IMPLEMENTATION_BRIEF.md` — read the second one before doing anything else; it is self-sufficient.

**Binding human product decision (read this before §5 — it corrects this document's original Priority 1):** photography for event covers and realistic participant avatars are **approved and must be kept**. The only rejected element was *runtime hotlinking* to an external image host (the earlier implementation pulled images live from Unsplash/pravatar.cc). Your task is to migrate that imagery to locally-stored, curated, optimized, consistently-cropped, color-graded assets — not to remove it and not to revert to a purely typographic/geometric system. A typographic/geometric fallback exists only for cards/avatars with no approved image available.

## 1. Visual goal and emotional target

**Visual goal:** bring Hackathonly's public pages to TAIKAI-equivalent craftsmanship — disciplined density-alternation rhythm, a product-preview language that feels real without feeling like a raw admin panel, card systems that avoid the "identical icon-wall" AI-slop trap — while remaining unmistakably Sandstone Editorial (pure white ground, ink typography, one rationed Petra-clay accent).

**Emotional target (one line):** *quiet, earned confidence* — a stranger should feel this is a serious institution that has already solved the hard problems (privacy, operations, credibility) so they don't have to worry about them. This is the calm-authority inverse of TAIKAI's own "exciting + legitimate" hero emotion — same goal (a stranger decides to trust and join), opposite route (restraint instead of saturation).

## 2. Reference principles to adapt, and why

- **Density-alternation rhythm** — never stack more than two visually-dense sections without a low-density rest (a plain paragraph, a divided list, an accordion). Works because it prevents scroll fatigue on long two-audience pages.
- **Module-rail + big-metric-tiles + one operational widget** product-preview anatomy — proves a product is real and mature without showing a raw data table.
- **Fragment/content-type variety within one card grid shell** — several cards showing different content types (a counter, a status line, a mini checklist) inside an identical card shell, rather than repeating one icon+text anatomy N times.
- **Systematic per-instance visual differentiation for repeated content** — when near-duplicate items exist (e.g. a recurring event run every semester), differentiate by a real attribute, not decoration.
- **Silence as a pacing device before a final CTA** — a deliberately plain, undecorated section (FAQ-style) right before the last conversion push measurably improves how that push lands.

## 3. What must never be copied

- **Any saturated/wallpapered accent color used outside the ≤3-per-screen clay rationing law.** Hackathonly's brand color is `brand` (Petra clay), used only for the primary action, the active nav item, and at most one accent detail — never as a fill, background, or repeated icon color.
- **Gradient text, gradient backgrounds, or gradient meshes of any kind**, except the existing flat, non-gradient system-generated cover fields.
- **Illustration, AI-generated art, mascots, generic corporate stock photography, or runtime-hotlinked imagery of any kind** for event covers, avatars, or hero imagery. (Curated, locally-stored, real-feeling photography **is** approved — see the binding decision above and §8–§10 below. This bullet forbids the *bad* imagery categories, not photography itself.)
- **A dark/glowing hero section.** Exactly one dark surface is sanctioned anywhere on the site, and it is a closing CTA band only — never a hero, never mid-page.
- **NFT/on-chain/Web3 iconography or language** of any kind.
- **A forced two-equal-CTA choice inside a single hero.** Every hero gets exactly one dominant primary CTA and, if needed, one quiet secondary (text link, not a competing bordered button).
- **Any fabricated client logo, testimonial, statistic, or competitor comparison.** If real data doesn't exist, omit the section — do not simulate it.

## 4. MY_PRODUCT brand constraints and non-negotiables (full, binding)

- Palette: pure white ground (`background/default`), ink text (`text/primary`), one Petra-clay accent (`brand`) rationed ≤3 uses/screen, warm-stone neutrals for borders/secondary surfaces (`background/sunken`, `border/default`, `border/strong`), semantic status colors used only for actual states, never decoratively.
- Type: General Sans for display/marketing headlines only, Inter for everything else, both already self-hosted — do not add a new font.
- Closed sets: five border radii, two shadows, a 4px-multiple spacing scale. No off-scale spacing, no third shadow, no sixth radius.
- No gradients (except the existing flat cover fields), no glassmorphism, no illustration/mascots, no dark-mode-first design, no purple/Web3 aesthetic.
- Privacy-first is structural: no public marketplace, no public browsing of people outside an opted-in event-scoped pool, no public contact reveal, no AI winner selection, no public negative scoring, no sponsor access to raw data without opt-in. These are product rules, not just visual ones — do not add anything (imagery, copy, or UI) that implies otherwise.
- Jordanian/university-first context; never flags, Petra silhouettes, or tourism-kitsch decoration; never gamification (XP, streaks, levels, confetti outside the two documented signature moments).
- Motion: reuse only the existing D19 motion system in `src/lib/motion/` and `src/components/motion/` — no second animation library, no new motion primitive unless a genuinely new pattern is needed on a third page (in which case extract it into `src/components/motion/`, matching existing documentation style).
- No fabricated data anywhere, ever.

## 5. Exact visual changes needed, in priority order

**Priority 1 (do this first, before anything else):** Migrate existing event-cover and avatar imagery from runtime hotlinks to curated, locally-stored assets. Two earlier sessions added (a) hotlinked Unsplash stock photography for event cover images, and (b) hotlinked pravatar.cc stock headshot images for a "Team formation queue" avatar row on the landing page. **The photography direction itself is approved by explicit human decision — do not remove it and do not revert to a purely typographic/geometric system.** The actual defect is sourcing: images must never be fetched from a third-party host at runtime. Required work: (a) select or source real, curated photography for each event cover — authentic young-builder/university/workshop/laptop/whiteboard/coding-environment imagery, explicitly avoiding generic corporate stock, handshakes, suits, staged fake offices, and tourism clichés — download and commit each image locally under `public/images/events/`, color-grade/crop consistently to Sandstone Editorial's calm register, and serve via `next/image`, removing the Unsplash hotlink entirely; (b) select or source credible, consistently-cropped participant portrait images for the avatar row, commit locally under `public/images/avatars/`, serve locally, removing the pravatar.cc hotlink entirely, keeping the existing typographic/geometric initials chip as a fallback only for any person without an approved local image; (c) write a manifest (e.g. `public/images/SOURCE.md`) recording the source and license of every downloaded asset. This is real asset-sourcing and curation work, not a code-only revert — budget time for image selection and optimization, not just wiring.

**Priority 2:** Audit every public page for the "max two dense sections in a row" rhythm rule (see §2 above). Where three or more dense sections run consecutively, insert a low-density rest section (reuse the existing `MotionReveal`/plain-paragraph pattern already established on the landing page's "quiet break" section — do not invent a new component).

**Priority 3:** Audit every card grid on public pages for content-type variety vs. repeated identical anatomy. Where a grid repeats one card shape N times with no variation, consider whether a subset could show a different, still-real content type (a counter vs. a status line vs. a short list) — only where doing so doesn't require fabricating data.

## 6. Page-level implementation priorities

1. Migrate imagery/avatars to local assets on `/` (landing) and the shared `EventCard` component (used by `/`, `/events`) — Priority 1 above.
2. Re-verify `/organizers` and `/events/[slug]` for the same hotlinking issue (in case any similar pattern was introduced there) and apply the same local-asset migration if found.
3. Re-verify section rhythm on all four public pages (`/`, `/organizers`, `/events`, `/events/[slug]`) per §5 Priority 2.
4. Do not touch `/dashboard` or the organizer command center (`/organizer/events/[eventId]`) — those are "tool register" pages per the existing design system's two-register model, out of scope for this pass.

## 7. Component-level implementation priorities

1. `src/components/events/event-card.tsx` — keep photographic covers; swap the hotlinked Unsplash `<img src>` for a local `next/image` reference pointing at a curated, downloaded asset under `public/images/events/`. Keep the existing hover-zoom micro-interaction — it should continue to apply to the (now local) cover image unchanged.
2. `src/app/(public)/page.tsx` — keep the "Team formation queue" avatar row's photographic treatment; swap the hotlinked pravatar.cc `<img src>` for a local `next/image` reference pointing at a curated, downloaded asset under `public/images/avatars/`, retaining the existing typographic/geometric chip as a per-person fallback only where no approved local image exists.
3. No other component changes are required by this task unless a rhythm or card-variety gap is found during the audits in §5/§6.

## 8. Imagery rules — event covers (photography is approved)

- **Photography is the approved direction for event covers.** Do not remove it and do not revert to a purely typographic/geometric system as the default.
- **No runtime hotlinking to any external image host**, ever, for anything shipped on a public page. Every image used must be downloaded and committed as a local asset under `public/images/events/`, served via `next/image`, with a `public/images/SOURCE.md` manifest recording each asset's origin and license.
- Curation standard (apply to every candidate image before committing it): reject generic corporate stock photography, handshakes, suits, staged fake offices, and tourism clichés. Prefer authentic young builders, university teams, laptops, workshops, whiteboards, and real coding environments — imagery that reads as a plausible real Jordanian university hackathon moment, even when the source photo isn't literally from one yet.
- Consistently crop every event cover to the same aspect ratio and framing convention (matching the card anatomy already in place — cover zone occupying the top ~35–45% of the card). Color-grade/tone every image so the set reads as one coherent system, not a random photo dump — warm-neutral, calm, not saturated or glossy.
- Illustration and AI-generated art remain forbidden regardless of local-vs-hotlinked sourcing — "local" makes hotlinked photography acceptable, it does not make illustration or AI art acceptable.
- The system-generated typographic/geometric cover treatment (flat tone field + theme icon watermark + bracket motif + typographic event mark) remains in the codebase as the fallback for any event with no approved image — never delete this fallback path.

## 9. Avatar / identity-representation rules — realistic avatars are approved

- **Realistic participant avatar photography is approved** for team-formation/preview contexts (e.g. the landing page's "Team formation queue"). Do not remove it and do not force every avatar back to a typographic-only chip.
- **No runtime hotlinking to any external avatar/placeholder-headshot service.** Every avatar image used must be downloaded and committed as a local asset under `public/images/avatars/`, served via `next/image`, with source/license recorded in the same manifest as §8.
- Curation standard: credible, professional-but-human portrait style — real-feeling participant photography, not glamour/stock-agency headshots, not cartoon or illustrated, not visibly AI-generated. Consistent crop (same aspect ratio, same framing/zoom level) and consistent size across every avatar in a row.
- Where no approved local avatar image exists for a given mock person, fall back to the existing typographic/geometric identity chip (initials, circular, tone-rotated ink/stone, soft border) rather than leaving a broken image or reaching for any hotlinked placeholder — the fallback path must remain in the codebase, not be deleted.
- The brand system stays dominant: card border, radius, spacing, and token usage around each avatar follow the existing closed sets exactly — the photo supports the existing card framing, it does not replace or override it with a new visual treatment.
- If a genuinely real, consented, named individual's photo is ever available in a real (non-mock) production context, that is a separate, product-level decision requiring its own review — not something to introduce speculatively here; this task concerns demo/mock data imagery only.

## 10. Primary content-card rules

- Event cards keep their existing fixed anatomy: cover zone (top ~35–45% of card) → organizer/title → metadata row (date, location/mode, team size) → status badge + "view details" affordance. Anatomy must repeat identically across every card in a grid — do not vary event-card anatomy card-to-card (unlike feature-grid cards, where content-type variety is encouraged).
- Cover zone: **curated, locally-stored photography is the approved default** (per §8), with the system-generated fallback (flat tone field, theme icon watermark, bracket motif, typographic event mark) used only where no approved image exists for that event. No illustration, no AI-generated art, no gradient fill, no runtime hotlinking, in either case.
- Radius, border, and shadow must come from the existing closed sets — no new values.

## 11. Product-preview rules

- Density cap: 3–5 visible metrics plus at most one operational widget (a short checklist, a small stagger-revealed list) per preview panel. Never a full data table.
- Real-vs-empty-state handling: every number shown must trace to real values in `src/lib/mock-data.ts` (e.g. `commandCenterMetrics`). A genuinely zero/empty pre-event state (e.g. `checkedIn: 0`) must be labeled honestly ("Check-in opens on event day"), never disguised or hidden.
- Any module-rail/sidebar element inside a preview must hide below the `lg` breakpoint and stack the remaining content to a single column — do not attempt to compress a wide sidebar into a narrow viewport.
- Reuse the existing bordered-panel-with-header-bar-and-status-pill chrome already established on both current hero previews — do not invent a new preview container style.

## 12. Motion rules

- **Reuse the existing motion system in full. Do not introduce a second animation library or a parallel motion approach.** Import every duration/delay/easing/distance value from `src/lib/motion/tokens.ts`; if a new named value is genuinely needed, add it there with a comment, in the same change — never hardcode a motion literal inline.
- Every animated element must be `prefers-reduced-motion`-safe, via an existing primitive (`MotionReveal`, `MotionSection`, `MotionStagger`, `MotionCard`, `MotionCounter`, `FloatingElement`) or a direct `useReducedMotionSafe()` check for any bespoke sequence.
- No autoplaying carousels, no marquees for must-read content, no parallax beyond the existing single-hero-element convention already in place.

## 13. Mobile rules

- Verify every change at a 375px-class viewport in addition to a 1280px-class desktop viewport.
- The single densest/riskiest section in this task is any product-preview panel containing a module rail — confirm it collapses to a single column with the rail hidden (not compressed) below `lg`, and confirm no horizontal overflow is introduced anywhere (the existing `overflow-x-clip` root-wrapper pattern should already guard against this — do not remove it).

## 14. Accessibility rules

- Every heading must form a complete, unskipped outline (one `<h1>` per page, sequential `<h2>`s for every major section — no section without a heading).
- All text/background color pairs must use only the existing semantic tokens, which are already AA-verified — do not introduce a new color pairing without checking contrast.
- Every interactive element must be a real, keyboard-operable element (native `<Link>`/`<button>`) with a visible `focus-visible` ring — never suppressed by a motion wrapper.
- Any image that is purely decorative gets an empty `alt=""`; any image conveying real identity/information gets a real, non-redundant `alt`.
- Touch targets minimum 44px; reduced-motion must render every animated element's fully legible final state immediately, never a stuck or hidden state.

## 15. Repository inspection requirement (do this before writing any code)

Before making any change, inspect the actual repository and confirm, in your own words back to the user:
- The current file structure of `src/app/(public)/`, `src/components/events/`, `src/components/motion/`, `src/lib/motion/`.
- The current (as of inspection time) implementation of `src/components/events/event-card.tsx` and the "Team formation queue" section of `src/app/(public)/page.tsx` — specifically confirm whether the hotlinked-imagery issue described in §5 Priority 1 is still present, since it may have already been fixed since this prompt was written.
- The current styling/token system (`docs/DESIGN_SYSTEM.md`, `src/app/globals.css`) and motion system (`docs/MOTION_SYSTEM.md`, `src/lib/motion/tokens.ts`) — confirm you are reading the live files, not assuming this prompt's description is still accurate.

## 16. File-list confirmation requirement

After inspection, propose the exact list of files you intend to touch, with a one-line reason for each, and get that list explicitly confirmed by the human before writing any code. Do not proceed on an assumed file list.

## 17. Explicitly forbidden without separate, named approval

- No Supabase, database, schema, or migration changes of any kind.
- No authentication/auth-flow changes of any kind.
- No `package.json`/`package-lock.json` changes — no new dependency, no version bump, for any reason, including image-optimization libraries.
- No new third-party service or external API integration of any kind (this explicitly includes any image CDN, avatar service, or analytics/tracking service).
- If you believe any of the above is genuinely required to complete this task correctly, stop and ask by name — do not proceed and do not work around the restriction with an equivalent substitute.

## 18. Design-token reuse requirement

Use only the existing semantic tokens already defined in `src/app/globals.css` and documented in `docs/DESIGN_SYSTEM.md` (`background/*`, `text/*`, `border/*`, `brand/*`, `status/*`, the five radii, the two shadows, the closed spacing scale). Do not introduce a parallel token, a new raw hex value, or a new arbitrary Tailwind value where an existing token already covers the need.

## 19. Local-asset-only imagery requirement

No runtime hotlinking to any external image host, ever. This task specifically **requires** image assets (curated event-cover photography and participant avatars, per the binding decision above and §8–§10) — every one of them must be downloaded and committed locally under `public/images/`, served via `next/image` or an existing local-asset pattern, with a manifest (`public/images/SOURCE.md`) recording source and license for every file. "Local-asset-only" governs *how* images are served, not *whether* photography is used — photography is approved and expected in this task's output.

## 20. No-fabrication requirement

Do not add, imply, or leave in place any fabricated or unverifiable claim, statistic, testimonial, or logo. Every number shown on a public page must trace to real values already present in `src/lib/mock-data.ts`. If a desired section (e.g. a client-logo wall, a competitor comparison) has no real data to back it, omit the section entirely rather than filling it with placeholder content.

## 21. Verification requirements before declaring completion

At minimum, perform and report the results of:
- `npm run build`, `npx tsc --noEmit`, `npx eslint .`, and the project's `scripts/verify.ps1` (or equivalent verify script) — all must pass.
- A manual check at one narrow-mobile viewport (~375px) and one desktop viewport (~1280px) for every page touched — confirm no horizontal overflow, no broken stacking, no cramped/wrapping text.
- A broken-link/broken-image check — confirm every `<Link>` resolves and every image renders correctly.
- A local-asset-loading check — confirm every event-cover and avatar image loads from a local path under `public/images/` and that zero requests to any external image host (`images.unsplash.com`, `i.pravatar.cc`, or any other third-party host) remain anywhere in the touched pages/components.
- A reduced-motion check — confirm every animated element on every touched page renders its fully legible final state with `prefers-reduced-motion: reduce` simulated.
- A scan for any remaining fabricated claim, statistic, testimonial, or logo on every touched page.

## 22. Written implementation summary requirement

At the end, write a summary (following this project's existing handoff-document convention, e.g. `handoff/CLAUDE_IMPLEMENTATION_SUMMARY.md`) covering: what changed, why, exact files touched, verification results, and anything left for manual human review (including any judgment call you made that the human should explicitly confirm).

## 23. No commit, no push

Leave every change uncommitted. Do not run `git commit` or `git push` under any circumstance in this task, regardless of how confident you are in the result.

## 24. Judgment authority

Do not ask for micromanagement of spacing, typography, layout, crop, hierarchy, or motion timing — within the constraints stated above, use your own design judgment. Mentally reject any direction that would feel like a generic AI-generated template, and implement the strongest option that satisfies every constraint in this document. If two valid options remain after applying every rule above, choose the one that reads as calmer and more restrained, not the one that reads as more decorated.

## 25. Target feeling (one line)

**"TAIKAI's craftsmanship, Hackathonly's quiet — a platform confident enough not to shout."**

---

*End of self-contained prompt.*
