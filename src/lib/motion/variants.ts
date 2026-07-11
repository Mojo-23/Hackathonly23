import type { Variants } from "framer-motion";
import { distance, duration, easing } from "./tokens";

/** Fade + rise. The default scroll-reveal and entrance variant. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: distance.riseMd },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.reveal, ease: easing.standard },
  },
};

/** Smaller rise, used for tightly-packed list rows (avatars, tags, feed lines). */
export const fadeUpSm: Variants = {
  hidden: { opacity: 0, y: distance.riseSm },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.base, ease: easing.standard },
  },
};

/** Plain opacity fade, no movement — used when a rise would compete with a sibling animation. */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: duration.base, ease: easing.standard } },
};

/** Scale-in from slightly below 1, used once for the hero dashboard preview panel. */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: duration.slow, ease: easing.entrance },
  },
};

/** Stagger container — apply to a parent, pair with fadeUp/fadeUpSm on children. */
export function staggerContainer(staggerDelay: number, initialDelay = 0): Variants {
  return {
    hidden: {},
    visible: {
      transition: { staggerChildren: staggerDelay, delayChildren: initialDelay },
    },
  };
}
