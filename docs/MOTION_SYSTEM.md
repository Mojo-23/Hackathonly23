# Hackathonly Jordan — Motion System (implementation reference)

**This is the implementation reference for the motion language authorized in `docs/DESIGN_SYSTEM.md` §I (decision D19).** `DESIGN_SYSTEM.md` states product-level intent; this file is the binding technical contract — component APIs, exact tokens, file locations, and worked examples. Before touching any animated UI, read this file. Reuse what's here; do not invent a parallel animation approach.

## 1. Why Framer Motion

Chosen because: (a) it is the standard, actively-maintained animation library for React/Next.js — no bespoke CSS-keyframe system to hand-maintain; (b) `useInView`/`whileInView` give free, performant scroll-reveal without a custom Intersection Observer wrapper; (c) `useReducedMotion` gives a built-in, correct `prefers-reduced-motion` read with no extra plumbing; (d) `useSpring`/`useMotionValue` give cheap, physically-smooth parallax and count-up without re-rendering on every frame (`useMotionValueEvent` is the one place we intentionally re-render, for the counter's displayed text). No second animation library may be introduced — if Framer Motion cannot do something this system needs, that is a decision for a documented follow-up, not a second dependency.

## 2. Architecture

```
src/lib/motion/
  tokens.ts                  — duration/stagger/distance/scale/easing constants (source of truth)
  variants.ts                — shared Framer Motion Variants (fadeUp, fadeUpSm, fadeIn, scaleIn, staggerContainer)
  use-reduced-motion-safe.ts — SSR-safe prefers-reduced-motion hook, used by every motion primitive
  use-cursor-parallax.ts     — spring-smoothed pointer-parallax hook

src/components/motion/
  motion-reveal.tsx          — MotionReveal: single-element scroll/entrance reveal
  motion-section.tsx         — MotionSection: MotionReveal preset for whole <section> roots
  motion-stagger.tsx         — MotionStagger + MotionStaggerItem: staggered grid/list reveal
  motion-card.tsx            — MotionCard: hover-lift wrapper for card-shaped elements
  motion-counter.tsx         — MotionCounter: count-up-once number
  floating-element.tsx       — FloatingElement: slow ambient vertical drift
  motion-marquee.tsx         — MotionMarquee: slow infinite horizontal loop
```

Rule: **components consume primitives, they do not write raw `motion.div` animation logic inline**, except for the handful of page-specific, non-reusable sequences documented in §6 below (the hero's own staggered text sequence and the lifecycle connector line — both bespoke enough that extracting them would be premature abstraction, but they still import all timing/easing from `tokens.ts`).

## 3. Tokens (`src/lib/motion/tokens.ts`)

```ts
export const duration = { fast: 0.15, base: 0.35, slow: 0.6, reveal: 0.5, ambient: 8, pulse: 2, heroPanelDelay: 0.35 };
export const stagger = { item: 0.08, heroLine: 0.12 };
export const distance = { riseSm: 12, riseMd: 20, riseLg: 32 };
export const scale = { panelIn: 0.96, hoverLift: 1.01, press: 0.98 };
export const easing = { standard: [0.16,1,0.3,1], entrance: [0.22,1,0.36,1] };
export const revealViewport = { once: true, margin: "-80px" };
```

All values are in seconds (Framer Motion convention) except `distance`/`scale` which are px/unitless. **Codex must import these, never write `duration: 0.4` or `ease: [0.1, 0.9, ...]` inline.** If a new timing need doesn't fit an existing token, add a named token here with a comment explaining its use — don't invent a bespoke number in a component.

## 4. Shared variants (`src/lib/motion/variants.ts`)

| Variant | Motion | When to use |
|---|---|---|
| `fadeUp` | opacity 0→1, y +20px→0, `duration.reveal` | Default scroll-reveal for headings/section blocks |
| `fadeUpSm` | opacity 0→1, y +12px→0, `duration.base` | Tighter list rows (avatars, tags, feed lines, stagger items) |
| `fadeIn` | opacity 0→1 only, `duration.base` | When a rise would compete with a sibling that's already moving |
| `scaleIn` | opacity 0→1, scale 0.96→1, `duration.slow` | The hero's one dominant panel entrance only — do not reuse elsewhere without reason |
| `staggerContainer(delay, initialDelay?)` | function returning a container variant | Pair with `MotionStagger`, not used directly by most components |

## 5. Component APIs

### `MotionReveal`
```tsx
<MotionReveal variants={fadeUp} delay={0} as="div" className="...">
  {children}
</MotionReveal>
```
Single-element scroll/entrance reveal. `whileInView`, `viewport={revealViewport}` (once, `-80px` margin — starts slightly before fully in view). Renders a plain `<div>`/`<section>` with no animation under reduced motion — never a broken/half-hidden state.

### `MotionSection`
```tsx
<MotionSection className="border-b ...">{...}</MotionSection>
```
Thin preset over `MotionReveal` with `as="section"` and `fadeUp` — use at a `<section>` root so the whole section fades up as it enters, before its internal `MotionReveal`/`MotionStagger` children run their own reveals.

### `MotionStagger` + `MotionStaggerItem`
```tsx
<MotionStagger staggerDelay={0.08} initialDelay={0} className="grid ...">
  {items.map((item) => (
    <MotionStaggerItem key={item.id} variants={fadeUpSm} className="...">
      {item.content}
    </MotionStaggerItem>
  ))}
</MotionStagger>
```
Container/child pair for grids and lists. Every grid of cards/tags/avatars on the landing page uses this — items MUST NOT all appear in the same frame.

### `MotionCard`
```tsx
<MotionCard className="h-full">
  <EventCard hackathon={hackathon} />
</MotionCard>
```
Wraps a card-shaped child with hover-lift (`y: -4`, `scale: scale.hoverLift`) and tap feedback (`scale: scale.press`). Transform-only — never touches the wrapped component's own border/shadow classes, so it composes safely around any existing card (including `EventCard`, which is never itself modified for motion — it keeps its own CSS `group-hover` states, `MotionCard` adds the lift on top).

### `MotionCounter`
```tsx
<MotionCounter value={138} className="text-metric font-semibold tabular-nums" />
<MotionCounter value={1234} format={(n) => n.toLocaleString()} />
```
Counts 0→`value` once, on first scroll-into-view, using `animate()` + `useMotionValue` (no re-render per frame except the display text via `useMotionValueEvent`). Renders the final value with zero animation under reduced motion — never shows "0" to a reduced-motion user waiting for a scroll trigger that won't animate.

### `FloatingElement`
```tsx
<FloatingElement distance={4} loopDuration={9} delay={0.4}>
  {children}
</FloatingElement>
```
Slow, infinite vertical drift (`y: [0, -distance, 0]`). Used for the hero's stat tiles only, with staggered `delay` per tile so they don't all move in lockstep (which would read as one wobbling block rather than a "living" panel). Fully static under reduced motion.

### `MotionMarquee`
```tsx
<MotionMarquee durationSeconds={40} className="gap-8">
  {logos.map((logo) => <LogoChip key={logo.id} {...logo} />)}
</MotionMarquee>
```
Not currently used on any page — no logo/social-proof row exists in mock data yet. Provided now so a future sponsor/university logo strip has a ready, correct primitive instead of Codex inventing a new marquee implementation later. Renders `children` twice back-to-back internally for a seamless loop; caller passes the row's contents once.

### `useCursorParallax(maxOffset = 10)`
```tsx
const parallax = useCursorParallax(8);
<motion.div style={{ x: parallax.x, y: parallax.y }} onPointerMove={parallax.onPointerMove} onPointerLeave={parallax.onPointerLeave}>
```
Returns spring-smoothed `x`/`y` `MotionValue`s plus pointer handlers. Used once, on the hero's dominant preview panel. Fully inert (handlers no-op, values stay 0) under reduced motion — caller does not need its own check.

### `useReducedMotionSafe()`
```tsx
const reducedMotion = useReducedMotionSafe();
if (reducedMotion) return <StaticVersion />;
```
Every motion primitive above already calls this internally. Call it directly only when writing a bespoke, non-reusable animation (see §6) or when a component needs to branch its JSX structure, not just skip a `motion.*` wrapper.

## 6. Bespoke, page-specific sequences (not extracted into primitives)

These two are intentionally *not* generic components — they are one-off enough that a primitive would be over-abstraction, but they still import every value from `tokens.ts`:

- **Hero text stagger** (`src/app/(public)/page.tsx`): a local `heroSequence`/`heroText` variant pair driving the eyebrow → heading → subhead → CTA stagger on mount (`initial`/`animate`, not scroll-triggered — this is the one deliberate exception to "everything is scroll-reveal," because it's above the fold on load).
- **Lifecycle connector line** (`src/app/(public)/page.tsx`): a `motion.div` with `scaleX: 0 → 1`, `transform-origin: left`, revealed via `whileInView` alongside the lifecycle `MotionStagger` — this is the one place brand/clay color is used as a progress indicator rather than an action, per the named exception in `DESIGN_SYSTEM.md` §I.

If a third page needs either of these patterns, extract it into `src/components/motion/` at that point rather than copy-pasting the inline version — don't let bespoke code silently become the de facto second pattern.

## 7. Correct usage examples

```tsx
// Section with a staggered card grid — the standard pattern for any new content grid.
<MotionSection className="...">
  <MotionReveal variants={fadeUpSm}>
    <h2>Section heading</h2>
  </MotionReveal>
  <MotionStagger className="grid grid-cols-3 gap-4">
    {items.map((item) => (
      <MotionStaggerItem key={item.id}>
        <MotionCard><Card>{item.content}</Card></MotionCard>
      </MotionStaggerItem>
    ))}
  </MotionStagger>
</MotionSection>
```

## 8. Motion that should NOT be added

- Do not wrap every single `<p>`/`<span>` in its own `MotionReveal` — reveal at the heading/paragraph/card level, not per-word or per-line, or the page becomes visually noisy rather than premium.
- Do not add a second, different fade/rise variant per section "for variety" beyond the three provided (`fadeUp`, `fadeUpSm`, `fadeIn`) — vary *which* of the three you use, don't invent new distances/durations ad hoc.
- Do not add parallax to more than one element per page — it is a hero-only device.
- Do not make `FloatingElement` drift faster than `duration.ambient` (8s) or move more than ~10px — anything faster reads as jittery, not alive.
- Do not use `MotionMarquee` for anything the user needs to read in full (nav, pricing, CTAs).
- Do not animate `width`/`height`/`top`/`left`/`margin` — transform (`x`/`y`/`scale`) and `opacity` only, everywhere, for performance.
- Do not skip `useReducedMotionSafe` "because it's just a small animation" — every motion primitive checks it; a new bespoke animation must too.

## 9. Accessibility requirements

- `useReducedMotionSafe()` MUST gate every animation in this system — entrance sequencing, scroll reveal, stagger, hover lift, ambient drift, parallax, count-up, marquee. Reduced-motion users see the final, fully-legible state immediately, never a stuck-mid-animation or empty state.
- Keyboard focus rings (`focus-visible:ring-*`) are never suppressed, delayed, or animated away by a motion wrapper.
- No animation may delay the ability to read or click an element — entrance sequences must not gate interactivity behind their own completion (all CTAs remain real, clickable links throughout their entrance animation, not disabled until motion finishes).

## 10. Performance rules

- Transform + opacity only (see §8). No layout-triggering properties.
- Scroll reveals use `whileInView` (Framer Motion's Intersection-Observer-backed viewport detection) with `once: true` — never a manual scroll-position listener, never replays.
- `MotionCounter` re-renders only its own text node per animation frame (via `useMotionValueEvent`), not the parent tree.
- No heavy media (images/video) was introduced by this system — if a future task adds hero imagery, it must be lazy-loaded (`next/image` with default lazy behavior) independent of the motion system.
- Ambient loops (`FloatingElement`, `MotionMarquee`) use `repeat: Infinity` on transform-only properties, which the browser compositor handles off the main thread — safe to leave running indefinitely.

## 11. Mobile-specific behavior

- Cursor parallax (`useCursorParallax`) is pointer-driven; on touch devices there is no persistent hover/pointer-move stream, so it simply never activates — no separate touch-specific branch was needed or added.
- Stagger delays are the same across breakpoints; grids that collapse to 1 column on mobile still stagger correctly since `MotionStagger` staggers DOM children, not visual columns.
- Ambient drift distances (4–10px) and hero scale-in are deliberately subtle enough to not cause layout jitter on smaller viewports.
- The landing page's root wrapper uses `overflow-x-clip` to guarantee the small parallax offset (≤8px) can never introduce horizontal scroll on any viewport width.

## 12. Extending this system (instructions for future Codex tasks)

1. **Read this file and `DESIGN_SYSTEM.md` §I first.** Do not add motion to a new surface without checking both.
2. **Reuse existing primitives and tokens.** A new section needing entrance/scroll-reveal/stagger/hover-lift/count-up should compose the existing components from `src/components/motion/` — do not write new `motion.div` logic for a need already covered.
3. **Do not introduce a second animation library.** Framer Motion is the only one. If it genuinely cannot do something needed, that is a scoped, documented decision (a `PRODUCT_DECISIONS.md` entry), not a silent new dependency.
4. **Do not hardcode timings.** Every duration/delay/easing/distance must come from `src/lib/motion/tokens.ts`. If nothing fits, add a token there with a comment, in the same change.
5. **Every new animated element must pass through `useReducedMotionSafe`**, either via an existing primitive (which already does this) or a direct check if writing a bespoke sequence.
6. **New reusable patterns get extracted**, not copy-pasted. If you find yourself writing the same bespoke `motion.div` logic on a second page, move it into `src/components/motion/` with the same documentation style as the existing primitives.
7. **Verification for any motion change**: `npm run build`, `npx tsc --noEmit`, `npx eslint .`, `powershell -ExecutionPolicy Bypass -File scripts/verify.ps1`, plus a manual check that (a) reduced motion renders a fully static, legible page, (b) no horizontal overflow is introduced, (c) nothing blocks reading or clicking mid-animation.
