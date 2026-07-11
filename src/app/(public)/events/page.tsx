import { SectionHeader } from "@/components/ui/section-header";
import { EventCard } from "@/components/events/event-card";
import { hackathons } from "@/lib/mock-data";

export default function EventsPage() {
  return (
    <div className="bg-background-default text-text-primary">
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <SectionHeader
          eyebrow="Events"
          title="Hackathons across Jordan"
          description="Browse upcoming and past hackathons. Register solo and opt into matching, or bring a pre-formed team."
        />
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {hackathons.map((h) => (
            <EventCard key={h.id} hackathon={h} />
          ))}
        </div>
      </main>
    </div>
  );
}
