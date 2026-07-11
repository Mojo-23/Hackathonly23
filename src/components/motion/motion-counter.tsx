"use client";

import { animate, useInView, useMotionValue, useMotionValueEvent } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { duration as durationTokens } from "@/lib/motion/tokens";
import { useReducedMotionSafe } from "@/lib/motion/use-reduced-motion-safe";

export interface MotionCounterProps {
  /** Final integer value to count up to. */
  value: number;
  className?: string;
  /** Optional formatter, e.g. (n) => n.toLocaleString(). Defaults to Math.round. */
  format?: (value: number) => string;
}

/**
 * Counts up from 0 to `value` once, when scrolled into view. Never replays
 * on subsequent scrolls in/out. Renders the final value immediately (no
 * animation) under reduced motion.
 */
export function MotionCounter({ value, className, format }: MotionCounterProps) {
  const reducedMotion = useReducedMotionSafe();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const motionValue = useMotionValue(0);
  const [animatedDisplay, setAnimatedDisplay] = useState(0);

  useMotionValueEvent(motionValue, "change", (latest) => {
    setAnimatedDisplay(Math.round(latest));
  });

  useEffect(() => {
    if (reducedMotion || !inView) return;

    const controls = animate(motionValue, value, {
      duration: durationTokens.slow,
      ease: "easeOut",
    });
    return () => controls.stop();
  }, [inView, value, reducedMotion, motionValue]);

  const display = reducedMotion ? value : animatedDisplay;
  const formatted = format ? format(display) : String(display);

  return (
    <span ref={ref} className={className}>
      {formatted}
    </span>
  );
}
