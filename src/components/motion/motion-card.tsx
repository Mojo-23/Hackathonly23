"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { duration, easing, scale } from "@/lib/motion/tokens";
import { useReducedMotionSafe } from "@/lib/motion/use-reduced-motion-safe";

export interface MotionCardProps {
  children: ReactNode;
  className?: string;
}

/**
 * Hover-lift wrapper for card-shaped elements. Transform-only (translateY +
 * scale), never animates layout/box-shadow spread — safe to use around any
 * bordered card without fighting its own hover classes.
 * No-op under reduced motion (renders a plain div, relies on the card's own
 * CSS focus/hover border-color state instead).
 */
export function MotionCard({ children, className }: MotionCardProps) {
  const reducedMotion = useReducedMotionSafe();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      whileHover={{ y: -4, scale: scale.hoverLift }}
      whileTap={{ scale: scale.press }}
      transition={{ duration: duration.fast, ease: easing.standard }}
    >
      {children}
    </motion.div>
  );
}
