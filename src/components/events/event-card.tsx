import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  Cpu,
  Leaf,
  MapPin,
  Radar,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Hackathon } from "@/types/domain";

const modeLabel: Record<Hackathon["mode"], string> = {
  in_person: "In-person",
  online: "Online",
  hybrid: "Hybrid",
};

// Placeholder/demo cover photography, hotlinked from Unsplash's CDN
// (images.unsplash.com, direct verified photo IDs — no API key required).
// This is a deliberate, explicitly-requested exception to
// docs/DESIGN_SYSTEM.md §C/§K ("no stock photography, system-generated
// covers only") — flagged in handoff/CLAUDE_IMPLEMENTATION_SUMMARY.md as an
// open item, since real Hackathonly event photography doesn't exist yet.
// Assigned per event by index (not by exact visual subject match — image
// content couldn't be verified visually before use), so each card gets a
// distinct, stable photo.
const coverPhotoIds = [
  "1550439062-609e1531270e",
  "1519389950473-47ba0277781c",
  "1497366216548-37526070297c",
  "1518770660439-4636190af475",
];

function getCoverPhotoUrl(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash += id.charCodeAt(i);
  const photoId = coverPhotoIds[hash % coverPhotoIds.length];
  return `https://images.unsplash.com/photo-${photoId}?w=800&h=450&fit=crop&auto=format&q=80`;
}

// Small thematic badge layered over the photo — since the underlying stock
// photo's exact subject isn't guaranteed to match the event's theme, this
// icon+label chip is what actually and reliably communicates "AI" / "FinTech"
// / "Sustainability" / etc. at a glance.
const themeIcon: { match: RegExp; icon: typeof Cpu }[] = [
  { match: /ai|intelligen/i, icon: Cpu },
  { match: /fintech|financ|payment/i, icon: Wallet },
  { match: /sustain|water|energy|climate/i, icon: Leaf },
  { match: /hardware|iot|robot/i, icon: Wrench },
];

function ThemeCoverIcon({ theme, className }: { theme: string; className: string }) {
  const Icon = themeIcon.find((entry) => entry.match.test(theme))?.icon ?? Radar;
  return <Icon className={className} strokeWidth={1.75} aria-hidden="true" />;
}

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
        <div className="relative flex aspect-video flex-col justify-between overflow-hidden border-b border-border-default bg-background-sunken p-4">
          {/* eslint-disable-next-line @next/next/no-img-element -- external hotlinked placeholder photo, next/image would require a next.config remotePatterns change out of this task's scope */}
          <img
            src={getCoverPhotoUrl(hackathon.id)}
            alt=""
            loading="lazy"
            className="absolute inset-0 size-full object-cover transition-transform duration-[var(--motion-slow)] ease-out motion-safe:group-hover:scale-105"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-background-inverse/85 via-background-inverse/10 to-transparent"
            aria-hidden="true"
          />
          <span
            className="absolute start-4 top-4 size-6 border-s border-t border-text-inverse/50"
            aria-hidden="true"
          />
          <span
            className="absolute bottom-4 end-4 size-6 border-b border-e border-text-inverse/50"
            aria-hidden="true"
          />
          <span className="relative inline-flex w-fit items-center gap-1.5 rounded-pill bg-background-inverse/70 px-2.5 py-1 text-label font-medium uppercase tracking-label text-text-inverse">
            <ThemeCoverIcon theme={hackathon.theme} className="size-3.5" />
            {hackathon.theme}
          </span>
          <div className="relative flex items-end justify-between gap-4">
            <p className="font-display text-display-lg font-semibold text-text-inverse">
              {getEventMark(hackathon.title)}
            </p>
            <p className="text-label font-medium uppercase tracking-label text-text-inverse/80">
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
