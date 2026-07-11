"use client";

import { useMemo, useState } from "react";
import { SectionHeader } from "@/components/ui/section-header";
import { EventCard } from "@/components/events/event-card";
import { MotionReveal } from "@/components/motion/motion-reveal";
import { MotionStagger, MotionStaggerItem } from "@/components/motion/motion-stagger";
import { MotionCard } from "@/components/motion/motion-card";
import { fadeUpSm } from "@/lib/motion/variants";
import { hackathons } from "@/lib/mock-data";

export default function EventsPage() {
  const themes = useMemo(() => Array.from(new Set(hackathons.map((h) => h.theme))), []);
  const [activeTheme, setActiveTheme] = useState<string | null>(null);
  const visibleEvents = activeTheme ? hackathons.filter((h) => h.theme === activeTheme) : hackathons;

  return (
    <div className="bg-background-default text-text-primary">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <MotionReveal variants={fadeUpSm}>
          <SectionHeader
            eyebrow="Events"
            title="Hackathons across Jordan"
            description="Browse upcoming and past hackathons. Register solo and opt into matching, or bring a pre-formed team."
          />
        </MotionReveal>

        <MotionReveal variants={fadeUpSm} delay={0.1} className="mt-6 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTheme(null)}
            aria-pressed={activeTheme === null}
            className={
              activeTheme === null
                ? "rounded-pill bg-background-inverse px-3 py-1.5 text-body-sm font-medium text-text-inverse transition-colors duration-[var(--motion-fast)]"
                : "rounded-pill border border-border-default bg-background-default px-3 py-1.5 text-body-sm font-medium text-text-secondary transition-colors duration-[var(--motion-fast)] hover:text-text-primary"
            }
          >
            All hackathons
          </button>
          {themes.map((theme) => (
            <button
              key={theme}
              type="button"
              onClick={() => setActiveTheme(theme === activeTheme ? null : theme)}
              aria-pressed={activeTheme === theme}
              className={
                activeTheme === theme
                  ? "rounded-pill bg-background-inverse px-3 py-1.5 text-body-sm font-medium text-text-inverse transition-colors duration-[var(--motion-fast)]"
                  : "rounded-pill border border-border-default bg-background-default px-3 py-1.5 text-body-sm font-medium text-text-secondary transition-colors duration-[var(--motion-fast)] hover:text-text-primary"
              }
            >
              {theme}
            </button>
          ))}
        </MotionReveal>

        <MotionStagger key={activeTheme ?? "all"} className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleEvents.map((h) => (
            <MotionStaggerItem key={h.id}>
              <MotionCard>
                <EventCard hackathon={h} />
              </MotionCard>
            </MotionStaggerItem>
          ))}
        </MotionStagger>

        {visibleEvents.length === 0 ? (
          <p className="mt-10 text-body-sm text-text-tertiary">
            No hackathons match that filter right now — check back soon.
          </p>
        ) : null}
      </div>
    </div>
  );
}
