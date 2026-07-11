"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { duration } from "@/lib/motion/tokens";
import { useReducedMotionSafe } from "@/lib/motion/use-reduced-motion-safe";

export interface FloatingElementProps {
  children: ReactNode;
  className?: string;
  /** Vertical drift distance in px. Keep small (4-10px) — this is ambient, not a headline animation. */
  distance?: number;
  /** Loop duration in seconds. Keep slow (>= 6s) so it reads as "alive," not restless. */
  loopDuration?: number;
  delay?: number;
}

/**
 * Slow, continuous vertical drift for decorative "floating" UI elements
 * (e.g. the profile chips inside the hero preview panel). Entirely disabled
 * under reduced motion — renders static children.
 *
 * Do not use this for anything the user needs to read precisely or click
 * quickly; it is ambient set-dressing only.
 */
export function FloatingElement({
  children,
  className,
  distance = 6,
  loopDuration = duration.ambient,
  delay = 0,
}: FloatingElementProps) {
  const reducedMotion = useReducedMotionSafe();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      animate={{ y: [0, -distance, 0] }}
      transition={{
        duration: loopDuration,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}
