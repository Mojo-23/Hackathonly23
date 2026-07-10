import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldCheck, Trophy } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { EventFactsStrip } from "@/components/events/event-facts-strip";
import { getHackathonBySlug, hackathons } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return hackathons.map((h) => ({ slug: h.slug }));
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const hackathon = getHackathonBySlug(slug);

  if (!hackathon) {
    notFound();
  }

  return (
    <div>
      <div className={cn("bg-gradient-to-br", hackathon.coverGradient)}>
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="flex items-center gap-3">
            <StatusBadge status={hackathon.status} />
            <span className="text-sm text-white/80">{hackathon.organizerName}</span>
          </div>
          <h1 className="mt-3 max-w-2xl text-3xl font-semibold text-white sm:text-4xl">
            {hackathon.title}
          </h1>
          <p className="mt-3 max-w-xl text-white/85">{hackathon.description}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/events/${hackathon.slug}/register`}
              className={buttonVariants({ size: "lg" })}
            >
              Register now
            </Link>
            {hackathon.matchingEnabled ? (
              <Link
                href={`/events/${hackathon.slug}/matching`}
                className={buttonVariants({ size: "lg", variant: "secondary" })}
              >
                Join matching pool after registering
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-10 sm:px-6 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col gap-8">
          <EventFactsStrip hackathon={hackathon} />

          <section>
            <h2 className="text-lg font-semibold text-ink">Tracks</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {hackathon.tracks.map((track) => (
                <Card key={track.id} className="p-4">
                  <p className="text-sm font-semibold text-ink">{track.name}</p>
                  <p className="mt-1 text-sm text-ink-muted">{track.description}</p>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-ink">Timeline</h2>
            <ol className="mt-4 space-y-3 border-l border-border pl-5">
              {hackathon.timeline.map((item) => (
                <li key={item.label} className="relative text-sm">
                  <span className="absolute -left-[1.45rem] top-1 size-2.5 rounded-full bg-accent" />
                  <p className="font-medium text-ink">{item.label}</p>
                  <p className="text-ink-muted">{item.at}</p>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-ink">Rules</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">{hackathon.rulesMd}</p>
          </section>
        </div>

        <div className="flex flex-col gap-5">
          <Card className="p-5">
            <div className="flex items-center gap-2">
              <Trophy className="size-4 text-accent" strokeWidth={1.75} />
              <h3 className="text-sm font-semibold text-ink">Prizes</h3>
            </div>
            <ul className="mt-3 space-y-1.5 text-sm text-ink-muted">
              {hackathon.prizes.map((prize) => (
                <li key={prize}>{prize}</li>
              ))}
            </ul>
          </Card>

          <Card className="border-accent/30 bg-accent-soft/40 p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-accent" strokeWidth={1.75} />
              <h3 className="text-sm font-semibold text-ink">Privacy note</h3>
            </div>
            <p className="mt-2 text-sm text-ink-muted">
              Your phone number and email are never shown to other participants. If you join the
              matching pool, teammates only see your role, skills, university, and experience level
              until a proposed team is fully accepted.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
