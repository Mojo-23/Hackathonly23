"use client";

import { useMotionValue, useSpring, type MotionValue } from "framer-motion";
import { useCallback, type PointerEvent as ReactPointerEvent } from "react";
import { useReducedMotionSafe } from "./use-reduced-motion-safe";

export interface CursorParallax {
  x: MotionValue<number>;
  y: MotionValue<number>;
  onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerLeave: () => void;
}

/**
 * Gentle cursor-based parallax for a single container. Returns spring-smoothed
 * x/y motion values (in px, capped by `maxOffset`) plus pointer handlers to
 * spread onto the container element.
 *
 * Returns a frozen, always-zero parallax (handlers are no-ops) when the user
 * prefers reduced motion — callers do not need their own reduced-motion check.
 */
export function useCursorParallax(maxOffset = 10): CursorParallax {
  const reducedMotion = useReducedMotionSafe();
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 60, damping: 20, mass: 0.6 });
  const y = useSpring(rawY, { stiffness: 60, damping: 20, mass: 0.6 });

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (reducedMotion) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      const relativeX = (event.clientX - bounds.left) / bounds.width - 0.5;
      const relativeY = (event.clientY - bounds.top) / bounds.height - 0.5;
      rawX.set(relativeX * maxOffset * 2);
      rawY.set(relativeY * maxOffset * 2);
    },
    [reducedMotion, maxOffset, rawX, rawY],
  );

  const onPointerLeave = useCallback(() => {
    rawX.set(0);
    rawY.set(0);
  }, [rawX, rawY]);

  return { x, y, onPointerMove, onPointerLeave };
}
