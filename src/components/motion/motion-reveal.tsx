"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { revealViewport } from "@/lib/motion/tokens";
import { fadeUp } from "@/lib/motion/variants";
import { useReducedMotionSafe } from "@/lib/motion/use-reduced-motion-safe";

export interface MotionRevealProps {
  children: ReactNode;
  /** Defaults to fadeUp. Pass fadeUpSm/fadeIn/scaleIn from lib/motion/variants for a different feel. */
  variants?: Variants;
  className?: string;
  /** Extra delay in seconds, e.g. for hand-tuned sequencing outside a MotionStagger. */
  delay?: number;
  as?: "div" | "section";
}

/**
 * The default scroll-reveal / entrance wrapper. Animates once when scrolled
 * into view (or immediately if already in view on load), never replays.
 * Fully inert when the user prefers reduced motion — children render in
 * their final state with no transform/opacity animation.
 */
export function MotionReveal({
  children,
  variants = fadeUp,
  className,
  delay = 0,
  as = "div",
}: MotionRevealProps) {
  const reducedMotion = useReducedMotionSafe();
  const MotionTag = as === "section" ? motion.section : motion.div;

  if (reducedMotion) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const resolvedVariants: Variants = delay
    ? {
        ...variants,
        visible: {
          ...(variants.visible as Record<string, unknown>),
          transition: {
            ...((variants.visible as { transition?: object })?.transition ?? {}),
            delay,
          },
        },
      }
    : variants;

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={revealViewport}
      variants={resolvedVariants}
    >
      {children}
    </MotionTag>
  );
}
