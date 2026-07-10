import Link from "next/link";
import { MapPin, Users, CalendarDays } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";
import type { Hackathon } from "@/types/domain";

const modeLabel: Record<Hackathon["mode"], string> = {
  in_person: "In-person",
  online: "Online",
  hybrid: "Hybrid",
};

function formatDateRange(startsAt: string, endsAt: string) {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const fmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });
  return `${fmt.format(start)} – ${fmt.format(end)}`;
}

export function EventCard({ hackathon }: { hackathon: Hackathon }) {
  return (
    <Link href={`/events/${hackathon.slug}`}>
      <Card className="group h-full overflow-hidden transition-shadow hover:shadow-sm">
        <div className={cn("h-28 bg-gradient-to-br", hackathon.coverGradient)} />
        <div className="flex flex-col gap-3 p-5">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-medium text-ink-subtle">{hackathon.organizerName}</p>
            <StatusBadge status={hackathon.status} />
          </div>
          <h3 className="text-lg font-semibold leading-snug text-ink group-hover:text-accent">
            {hackathon.title}
          </h3>
          <p className="line-clamp-2 text-sm text-ink-muted">{hackathon.description}</p>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-ink-muted">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-3.5" strokeWidth={1.75} />
              {formatDateRange(hackathon.startsAt, hackathon.endsAt)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5" strokeWidth={1.75} />
              {hackathon.city} · {modeLabel[hackathon.mode]}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users className="size-3.5" strokeWidth={1.75} />
              Teams of {hackathon.teamSizeMin}–{hackathon.teamSizeMax}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
