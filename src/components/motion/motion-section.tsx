"use client";

import type { ReactNode } from "react";
import { MotionReveal } from "./motion-reveal";
import { fadeUp } from "@/lib/motion/variants";

export interface MotionSectionProps {
  children: ReactNode;
  className?: string;
}

/**
 * Thin, semantic wrapper around MotionReveal for whole `<section>` entrances.
 * Prefer this at the section root; use MotionReveal directly for headings/
 * paragraphs and MotionStagger for grids inside the section.
 */
export function MotionSection({ children, className }: MotionSectionProps) {
  return (
    <MotionReveal as="section" variants={fadeUp} className={className}>
      {children}
    </MotionReveal>
  );
}
