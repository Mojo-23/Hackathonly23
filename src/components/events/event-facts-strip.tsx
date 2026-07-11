import { CalendarDays, MapPin, ShieldCheck, Users } from "lucide-react";
import type { Hackathon } from "@/types/domain";

const modeLabel: Record<Hackathon["mode"], string> = {
  in_person: "In-person",
  online: "Online",
  hybrid: "Hybrid",
};

function formatDateRange(startsAt: string, endsAt: string) {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const fmt = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return `${fmt.format(start)} - ${fmt.format(end)}`;
}

export function EventFactsStrip({ hackathon }: { hackathon: Hackathon }) {
  const facts = [
    { icon: CalendarDays, label: formatDateRange(hackathon.startsAt, hackathon.endsAt) },
    {
      icon: MapPin,
      label: `${hackathon.locationName}, ${hackathon.city} - ${modeLabel[hackathon.mode]}`,
    },
    { icon: Users, label: `Teams of ${hackathon.teamSizeMin}-${hackathon.teamSizeMax}` },
    { icon: ShieldCheck, label: "Privacy-first matching" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 rounded-card border border-border-default bg-background-default p-5 sm:grid-cols-2 lg:grid-cols-4">
      {facts.map((fact) => (
        <div key={fact.label} className="flex items-start gap-3">
          <fact.icon className="mt-1 size-4 shrink-0 text-text-secondary" strokeWidth={1.75} />
          <span className="text-body-sm font-medium text-text-primary">{fact.label}</span>
        </div>
      ))}
    </div>
  );
}
