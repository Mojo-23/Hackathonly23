import { SectionHeader } from "@/components/ui/section-header";
import { EventCard } from "@/components/events/event-card";
import { hackathons } from "@/lib/mock-data";

export default function EventsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <SectionHeader
        eyebrow="Events"
        title="Hackathons across Jordan"
        description="Browse upcoming and past hackathons. Register solo and opt into matching, or bring a pre-formed team."
      />
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {hackathons.map((h) => (
          <EventCard key={h.id} hackathon={h} />
        ))}
      </div>
    </div>
  );
}
