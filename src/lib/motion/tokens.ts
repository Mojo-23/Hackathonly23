/**
 * Single source of truth for animation timing/easing/distance.
 * Codex must reuse these constants — never hardcode a duration, delay,
 * easing curve, or translate distance inline in a component.
 * See docs/MOTION_SYSTEM.md before adding or changing any value here.
 */

export const duration = {
  /** Micro-interactions: hover/press feedback, focus rings. */
  fast: 0.15,
  /** Default transition for most entrance/hover animations. */
  base: 0.35,
  /** Section/hero entrance, larger elements. */
  slow: 0.6,
  /** Scroll-reveal fade/rise for headings, paragraphs, cards. */
  reveal: 0.5,
  /** Ambient/idle motion loops (floating elements, marquee). */
  ambient: 8,
  /** Slow opacity pulse loop for a "live"/status indicator dot. */
  pulse: 2,
  /** Delay before a hero's dominant preview panel begins its entrance, after the hero text sequence starts. */
  heroPanelDelay: 0.35,
} as const;

export const stagger = {
  /** Delay between list/grid children entering (cards, avatars, tags). */
  item: 0.08,
  /** Delay between hero text lines (eyebrow -> heading -> subhead -> CTAs). */
  heroLine: 0.12,
} as const;

export const distance = {
  /** Vertical rise used by fade-up reveals (px). */
  riseSm: 12,
  riseMd: 20,
  riseLg: 32,
} as const;

export const scale = {
  /** Dashboard/panel entrance scale-in start value. */
  panelIn: 0.96,
  /** Hover lift scale for cards. */
  hoverLift: 1.01,
  /** Press feedback scale for buttons/links. */
  press: 0.98,
} as const;

/**
 * Easing curves as cubic-bezier arrays (Framer Motion accepts number[4]).
 * `standard` = general-purpose ease-out, feels controlled, not springy.
 * `entrance` = slightly slower start, used for hero/section entrances.
 */
export const easing = {
  standard: [0.16, 1, 0.3, 1] as [number, number, number, number],
  entrance: [0.22, 1, 0.36, 1] as [number, number, number, number],
} as const;

/** Viewport options shared by every scroll-reveal usage — reveal once, don't replay. */
export const revealViewport = { once: true, margin: "-80px" } as const;
