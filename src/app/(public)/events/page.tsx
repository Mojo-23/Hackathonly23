"use client";

import { SectionHeader } from "@/components/ui/section-header";
import { EventCard } from "@/components/events/event-card";
import { MotionReveal } from "@/components/motion/motion-reveal";
import { MotionStagger, MotionStaggerItem } from "@/components/motion/motion-stagger";
import { MotionCard } from "@/components/motion/motion-card";
import { fadeUpSm } from "@/lib/motion/variants";
import { hackathons } from "@/lib/mock-data";

export default function EventsPage() {
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
        <MotionStagger className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {hackathons.map((h) => (
            <MotionStaggerItem key={h.id}>
              <MotionCard>
                <EventCard hackathon={h} />
              </MotionCard>
            </MotionStaggerItem>
          ))}
        </MotionStagger>
      </div>
    </div>
  );
}
