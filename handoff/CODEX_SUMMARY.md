# CLAUDE IMPLEMENTATION SUMMARY — Landing page motion system

## Task
Add a full, polished motion system to the public landing page (`/`) — page-load entrance sequencing, scroll reveal, stagger, hover/press micro-interactions, ambient drift, cursor parallax, and count-up statistics — while remaining premium, controlled, and fully `prefers-reduced-motion`-safe. Document the resulting system so Codex can extend it correctly in future tasks.

## Note on authorship and process (read this first)
This was implemented **directly by Claude, not by Codex**, and it is the second such exception in this session. Both times, Claude flagged the conflict with `CLAUDE.md`'s "Claude must not freestyle code" rule before proceeding, and the human explicitly confirmed the override each time — most recently for this motion system specifically, including explicit authorization to add a new dependency (`framer-motion`) and to revise `docs/DESIGN_SYSTEM.md`'s motion section, both of which would otherwise require separate approval under this project's standing rules. This is **not** a new standing process — normal Claude-plans/Codex-implements/Claude-reviews discipline resumes after this task. See `docs/PRODUCT_DECISIONS.md` D19 for the permanent record of this decision and the authorization.

This file is named `CODEX_SUMMARY.md` to match the workflow's expected handoff filename, but the work was not produced by a Codex run.

## What was implemented

### 1. Dependency
- Added `framer-motion` (`^12.42.2`) to `package.json`/`package-lock.json` — the only new dependency. No second animation library was introduced.

### 2. Motion library (`src/lib/motion/`)
- `tokens.ts` — closed set of duration/stagger/distance/scale/easing constants (source of truth for every timing value used anywhere in the system).
- `variants.ts` — shared Framer Motion variants (`fadeUp`, `fadeUpSm`, `fadeIn`, `scaleIn`, `staggerContainer`).
- `use-reduced-motion-safe.ts` — SSR-safe `prefers-reduced-motion` hook; every motion primitive calls this.
- `use-cursor-parallax.ts` — spring-smoothed pointer-parallax hook, inert under reduced motion.

### 3. Reusable motion primitives (`src/components/motion/`)
- `motion-reveal.tsx` — `MotionReveal`: single-element scroll/entrance reveal.
- `motion-section.tsx` — `MotionSection`: section-root reveal preset.
- `motion-stagger.tsx` — `MotionStagger` + `MotionStaggerItem`: staggered grid/list reveal.
- `motion-card.tsx` — `MotionCard`: hover-lift/press wrapper for card-shaped children.
- `motion-counter.tsx` — `MotionCounter`: count-up-once number, no replay.
- `floating-element.tsx` — `FloatingElement`: slow ambient vertical drift.
- `motion-marquee.tsx` — `MotionMarquee`: slow infinite horizontal loop (built, documented, not yet used on any page — no logo row exists in mock data).

### 4. Landing page (`src/app/(public)/page.tsx`)
Converted to a client component (`"use client"`, required for Framer Motion) and wired into the primitives above:
- **Hero**: staggered text entrance on load (eyebrow → heading → subhead → CTAs), followed by the dashboard preview panel scaling in from 0.96→1, with gentle cursor parallax (≤8px, spring-smoothed, disabled under reduced motion) applied to the whole panel.
- **Hero preview panel internals**: the "team formation queue" rows and "live signals" feed stagger in (`MotionStagger`); the four stat tiles use `FloatingElement` (slow, staggered-delay drift) with `MotionCounter` for the numbers; the "Live" status dot has a slow opacity pulse.
- **Featured hackathons**: section fades up on scroll (`MotionSection`), heading/link reveal individually, the `EventCard` grid staggers in via `MotionStagger`/`MotionStaggerItem`, each card wrapped in `MotionCard` for hover-lift (the `EventCard` component itself was **not modified** — `MotionCard` composes around it).
- **Participant/organizer split**: both panels reveal on scroll with a slight stagger offset between them; the participant promise list and organizer module-chip row each stagger their children in.
- **Lifecycle strip**: five stage cards stagger left-to-right on scroll; a thin connector line beneath them animates `scaleX: 0→1` (brand/clay color, used here as a progress indicator — a narrow, documented exception, see D19) as the section enters view.
- **Command-center panel** (inverted section): metric tiles stagger in, each number uses `MotionCounter`.
- **Text links**: "View all events" arrow shifts right on hover via a CSS `group-hover:translate-x-*` transition (not JS-animated — cheaper, and this is the pattern `MOTION_SYSTEM.md` recommends for link affordances).
- Root wrapper uses `overflow-x-clip` to guarantee the small parallax offset can never cause horizontal scroll at any viewport width.

### 5. Documentation
- **`docs/DESIGN_SYSTEM.md` §I (Motion System)** — fully rewritten. Replaces the prior near-zero-motion closed law with the actually-implemented system: extended timing tokens, per-category rules (entrance, scroll reveal, hover/focus, ambient, parallax, counters, connector lines, marquee, section transitions, loading), a mandatory reduced-motion section, and the two original signature moments preserved unchanged. Points to `docs/MOTION_SYSTEM.md` as the binding implementation reference.
- **`docs/MOTION_SYSTEM.md`** (new) — the full implementation reference: architecture, why Framer Motion, every token, every component API with usage examples, correct-usage examples, an explicit "motion that should NOT be added" list, accessibility requirements, performance rules, mobile-specific notes, and a numbered "extending this system" section aimed directly at future Codex tasks.
- **`docs/PRODUCT_DECISIONS.md` D19** (new) — records this as a decision: reason, the direct-implementation process exception (stated explicitly, twice-confirmed), and exactly what in D18/§I this supersedes.

## Motion System — Mandatory Rules for Future Codex Tasks

Any future Codex task touching animated UI, or adding motion to a new surface, **must**:

1. **Read `docs/MOTION_SYSTEM.md` and `docs/DESIGN_SYSTEM.md` §I before writing any animation code.** Do not guess at values or patterns — they are specified.
2. **Reuse the existing primitives** (`MotionReveal`, `MotionSection`, `MotionStagger`/`MotionStaggerItem`, `MotionCard`, `MotionCounter`, `FloatingElement`, `MotionMarquee`) and hooks (`useReducedMotionSafe`, `useCursorParallax`) from `src/components/motion/` and `src/lib/motion/`. Do not write a new one-off `motion.div` animation for a need one of these already covers.
3. **Never introduce a second animation library.** Framer Motion is the only one. If it cannot do something needed, that is a scoped decision for a new `PRODUCT_DECISIONS.md` entry, not a silent new dependency.
4. **Never hardcode a duration, delay, easing curve, or distance.** Every value must come from `src/lib/motion/tokens.ts`. If nothing fits, add a named token there in the same change, with a comment explaining its use.
5. **Every animated element must be reduced-motion-safe.** Use an existing primitive (already gated) or call `useReducedMotionSafe()` directly for bespoke sequences. Reduced motion must render the final, fully legible state immediately — never a stuck or hidden state.
6. **Follow the exact motion language established here** — vary between the three provided fade variants (`fadeUp`/`fadeUpSm`/`fadeIn`) rather than inventing new ones; keep ambient motion slow (`duration.ambient`, 8s+) and small (≤10px); keep parallax to one dominant element per page; keep marquees slow (≥30s/loop) and never used for must-read content.
7. **Extend, don't fork.** If a genuinely new animated pattern is needed on a second page, extract it into `src/components/motion/` with documentation matching the existing primitives' style — don't copy-paste a bespoke sequence a second time.
8. **The brand/clay-as-progress-indicator exception is narrow.** It applies only to the lifecycle connector line pattern (D19). Any other use of brand color as decoration (not action, not this one named exception) is still forbidden per `DESIGN_SYSTEM.md` §D.
9. **Verification for any motion change**: `npm run build`, `npx tsc --noEmit`, `npx eslint .`, `powershell -ExecutionPolicy Bypass -File scripts/verify.ps1`, plus manual confirmation that (a) reduced motion renders a fully static, legible page, (b) no horizontal overflow is introduced at 375px or 1280px, (c) nothing blocks reading or clicking mid-animation, (d) animation values are centralized in `tokens.ts`, not scattered inline.

## Files touched
- `src/app/(public)/page.tsx` (rewritten)
- `src/lib/motion/tokens.ts` (new)
- `src/lib/motion/variants.ts` (new)
- `src/lib/motion/use-reduced-motion-safe.ts` (new)
- `src/lib/motion/use-cursor-parallax.ts` (new)
- `src/components/motion/motion-reveal.tsx` (new)
- `src/components/motion/motion-section.tsx` (new)
- `src/components/motion/motion-stagger.tsx` (new)
- `src/components/motion/motion-card.tsx` (new)
- `src/components/motion/motion-counter.tsx` (new)
- `src/components/motion/floating-element.tsx` (new)
- `src/components/motion/motion-marquee.tsx` (new)
- `package.json` / `package-lock.json` (added `framer-motion`)
- `docs/DESIGN_SYSTEM.md` (§I rewritten)
- `docs/MOTION_SYSTEM.md` (new)
- `docs/PRODUCT_DECISIONS.md` (D19 added)
- `handoff/CODEX_SUMMARY.md` (this file)

`EventCard`, `Button`, `Card`, and every other existing primitive/route file were **not modified** — motion composes around them (`MotionCard` wraps `EventCard`; CTAs still render through the unmodified `buttonVariants`).

## Verification results
- `npx tsc --noEmit` — passed.
- `npm run build` — passed. `/` still prerenders statically (`○`); all three event-detail slugs still prerender (`/events/jordan-ai-builders-hackathon`, `/events/usj-fintech-sprint`, `/events/psut-hardware-hack`).
- `npx eslint .` — passed (one `react-hooks/set-state-in-effect` error was found and fixed in `MotionCounter` during development — the reduced-motion final value is now derived at render time instead of via a synchronous `setState` inside `useEffect`).
- `powershell -ExecutionPolicy Bypass -File scripts/verify.ps1` — passed (build, typecheck, lint, forbidden-string scan).
- Raw hex scan (`grep -nE "#[0-9a-fA-F]{3,8}"`) across every new/changed `.tsx`/`.ts` file — zero matches. All color usage routes through existing semantic tokens, including opacity-modified tokens (`text-text-inverse/70`, `border-text-inverse/10`) — no raw `white`/hex literal was introduced.

## Accessibility / reduced-motion verification
- `useReducedMotionSafe()` gates every primitive: entrance sequencing, scroll reveal, stagger, ambient drift (`FloatingElement`), cursor parallax (`useCursorParallax`), hover-lift (`MotionCard`), count-up (`MotionCounter`), and marquee (`MotionMarquee`) all render their static/final/inert state when the hook returns `true`.
- Verified by code inspection (this repo has no automated reduced-motion test harness or screenshot tooling — no Playwright/Cypress/Puppeteer dependency exists) that every `motion.*` usage in `page.tsx` and every primitive has a corresponding reduced-motion branch. No animation gates interactivity — all CTAs and links remain real, clickable elements throughout their entrance sequence.
- No layout-shifting properties are animated anywhere (`transform`/`opacity` only), and the root landing wrapper uses `overflow-x-clip` specifically to guard against the parallax offset introducing horizontal scroll.

## Deviations
- The task asked for a "logo marquee" as part of the full brief. No logo/social-proof row exists anywhere in this repo's mock data or components, so there is nothing to marquee yet. `MotionMarquee` was built and documented as a ready primitive (§6 in `MOTION_SYSTEM.md`) rather than fabricated content or a marquee of unrelated placeholder text — using it on the landing page today would mean inventing content that isn't real, which conflicts with this project's "no invented data" standard.
- "Testimonials" and "project thumbnails" from the original brief were not implemented for the same reason — no testimonial or project-thumbnail data/components exist in this codebase. Nothing was fabricated to fill those slots.
- The command-center section's inverted background (carried over from the prior `PHASE-UI-003B` visual pass, not new to this task) is the one place brand-adjacent contrast is used at a section level; it predates this motion task and was not changed structurally here, only animated (its metric tiles now stagger and count up).
