"use client";

import { useReducedMotion } from "framer-motion";

/**
 * SSR-safe wrapper around Framer Motion's useReducedMotion.
 * The underlying hook returns null until it can read the media query after
 * mount, so this coerces that to `false` for the server render and the
 * first client paint (identical on both, no hydration mismatch), then
 * updates to the real value one effect tick later.
 *
 * Any component that runs ambient motion, parallax, or count-up MUST check
 * this hook and skip/short-circuit that behavior when it returns true.
 */
export function useReducedMotionSafe(): boolean {
  const prefersReduced = useReducedMotion();
  return prefersReduced ?? false;
}
