"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useReducedMotionSafe } from "@/lib/motion/use-reduced-motion-safe";

export interface MotionMarqueeProps {
  children: ReactNode;
  className?: string;
  /** Full-loop duration in seconds. Keep slow (>= 30s) — this must read as ambient, not a ticker. */
  durationSeconds?: number;
}

/**
 * Slow, continuous horizontal marquee. Renders `children` twice back-to-back
 * and animates a -50% translateX loop so the seam is invisible.
 * Not currently used on any page (no logo/social-proof row exists in mock
 * data yet) — available for a future sponsor/university logo strip.
 * Renders a plain static row under reduced motion.
 */
export function MotionMarquee({ children, className, durationSeconds = 40 }: MotionMarqueeProps) {
  const reducedMotion = useReducedMotionSafe();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className="overflow-hidden">
      <motion.div
        className={`flex w-max ${className ?? ""}`}
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: durationSeconds, repeat: Infinity, ease: "linear" }}
      >
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0" aria-hidden="true">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
