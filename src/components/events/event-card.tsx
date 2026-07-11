import Link from "next/link";
import { ArrowUpRight, CalendarDays, MapPin, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
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
  return `${fmt.format(start)} - ${fmt.format(end)}`;
}

function getEventMark(title: string) {
  return title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

export function EventCard({ hackathon }: { hackathon: Hackathon }) {
  return (
    <Link href={`/events/${hackathon.slug}`} className="group block h-full focus-visible:outline-none">
      <Card className="flex h-full flex-col overflow-hidden transition-[border-color,box-shadow] duration-[var(--motion-fast)] group-hover:border-border-strong group-hover:shadow-raised group-focus-visible:border-brand group-focus-visible:ring-2 group-focus-visible:ring-brand-tint group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-background-default">
        <div className="flex h-32 flex-col justify-between border-b border-border-default bg-background-sunken p-4">
          <p className="text-label font-medium uppercase tracking-label text-text-tertiary">
            {hackathon.theme}
          </p>
          <div className="flex items-end justify-between gap-4">
            <p className="font-display text-heading-lg font-semibold text-text-primary">
              {getEventMark(hackathon.title)}
            </p>
            <p className="text-label font-medium uppercase tracking-label text-text-tertiary">
              {modeLabel[hackathon.mode]}
            </p>
          </div>
        </div>
        <div className="flex flex-1 flex-col p-5">
          <p className="text-body-sm font-medium text-text-secondary">{hackathon.organizerName}</p>
          <h3 className="mt-3 text-heading-sm font-semibold text-text-primary text-pretty transition-colors duration-[var(--motion-fast)] group-hover:text-brand">
            {hackathon.title}
          </h3>
          <dl className="mt-5 grid gap-3 border-t border-border-default pt-4 text-body-sm text-text-secondary">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4 shrink-0 text-text-tertiary" strokeWidth={1.75} />
              <dt className="sr-only">Dates</dt>
              <dd>{formatDateRange(hackathon.startsAt, hackathon.endsAt)}</dd>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0 text-text-tertiary" strokeWidth={1.75} />
              <dt className="sr-only">Location and mode</dt>
              <dd>
                {hackathon.city} - {modeLabel[hackathon.mode]}
              </dd>
            </div>
            <div className="flex items-center gap-2">
              <Users className="size-4 shrink-0 text-text-tertiary" strokeWidth={1.75} />
              <dt className="sr-only">Team size</dt>
              <dd>
                Teams of {hackathon.teamSizeMin}-{hackathon.teamSizeMax}
              </dd>
            </div>
          </dl>
          <div className="mt-auto flex items-end justify-between gap-3 pt-5">
            <StatusBadge status={hackathon.status} />
            <span className="inline-flex items-center gap-1 text-label font-medium uppercase tracking-label text-text-tertiary transition-colors duration-[var(--motion-fast)] group-hover:text-brand">
              View details
              <ArrowUpRight className="size-3.5" strokeWidth={1.75} />
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
