"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { revealViewport, stagger } from "@/lib/motion/tokens";
import { fadeUpSm, staggerContainer } from "@/lib/motion/variants";
import { useReducedMotionSafe } from "@/lib/motion/use-reduced-motion-safe";

export interface MotionStaggerProps {
  children: ReactNode;
  className?: string;
  /** Seconds between each child. Defaults to stagger.item (0.08s). */
  staggerDelay?: number;
  initialDelay?: number;
}

/**
 * Grid/list container that staggers its MotionStaggerItem children into view
 * on scroll. Use for card grids, avatar rows, tag lists — anywhere multiple
 * siblings should not all appear in the same frame.
 */
export function MotionStagger({
  children,
  className,
  staggerDelay = stagger.item,
  initialDelay = 0,
}: MotionStaggerProps) {
  const reducedMotion = useReducedMotionSafe();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={revealViewport}
      variants={staggerContainer(staggerDelay, initialDelay)}
    >
      {children}
    </motion.div>
  );
}

export interface MotionStaggerItemProps {
  children: ReactNode;
  className?: string;
  variants?: Variants;
}

/** Direct child of MotionStagger. Falls back to plain markup under reduced motion. */
export function MotionStaggerItem({
  children,
  className,
  variants = fadeUpSm,
}: MotionStaggerItemProps) {
  const reducedMotion = useReducedMotionSafe();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div className={className} variants={variants}>
      {children}
    </motion.div>
  );
}
