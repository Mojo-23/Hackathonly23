import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldCheck, Trophy } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { EventFactsStrip } from "@/components/events/event-facts-strip";
import { getHackathonBySlug, hackathons } from "@/lib/mock-data";

export function generateStaticParams() {
  return hackathons.map((h) => ({ slug: h.slug }));
}

function getEventMark(title: string) {
  return title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
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
    <div className="bg-background-default pb-24 text-text-primary sm:pb-0">
      <section className="border-b border-border-default bg-background-default">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:items-end">
            <div className="lg:col-span-2">
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={hackathon.status} />
                <span className="text-body-sm text-text-secondary">{hackathon.organizerName}</span>
              </div>
              <h1 className="mt-4 max-w-3xl text-heading-lg font-display font-semibold text-text-primary text-balance sm:text-display-lg">
                {hackathon.title}
              </h1>
              <p className="mt-5 max-w-2xl text-body text-text-secondary text-pretty">
                {hackathon.description}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
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

            <div className="relative overflow-hidden rounded-card border border-border-default bg-background-sunken p-6 sm:p-8">
              <span
                className="absolute start-4 top-4 size-8 border-s border-t border-text-primary"
                aria-hidden="true"
              />
              <span
                className="absolute bottom-4 end-4 size-8 border-b border-e border-text-primary"
                aria-hidden="true"
              />
              <p className="text-label font-medium uppercase tracking-label text-text-tertiary">
                Event identity
              </p>
              <p className="mt-8 font-display text-display-lg font-semibold text-text-primary">
                {getEventMark(hackathon.title)}
              </p>
              <dl className="mt-8 grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-label font-medium uppercase tracking-label text-text-tertiary">
                    Theme
                  </dt>
                  <dd className="mt-1 text-body-sm font-medium text-text-primary">{hackathon.theme}</dd>
                </div>
                <div>
                  <dt className="text-label font-medium uppercase tracking-label text-text-tertiary">
                    City
                  </dt>
                  <dd className="mt-1 text-body-sm font-medium text-text-primary">{hackathon.city}</dd>
                </div>
                <div>
                  <dt className="text-label font-medium uppercase tracking-label text-text-tertiary">
                    Teams
                  </dt>
                  <dd className="mt-1 text-body-sm font-medium text-text-primary">
                    {hackathon.teamSizeMin}-{hackathon.teamSizeMax}
                  </dd>
                </div>
                <div>
                  <dt className="text-label font-medium uppercase tracking-label text-text-tertiary">
                    Register by
                  </dt>
                  <dd className="mt-1 text-body-sm font-medium text-text-primary">
                    {formatDate(hackathon.registrationClosesAt)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
        <EventFactsStrip hackathon={hackathon} />
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 pb-16 sm:px-6 sm:pb-24 lg:grid-cols-3 lg:gap-8">
        <div className="flex flex-col gap-16 lg:col-span-2">
          <section>
            <div className="max-w-2xl">
              <p className="text-label font-medium uppercase tracking-label text-text-tertiary">
                Tracks
              </p>
              <h2 className="mt-2 text-heading-lg font-semibold text-text-primary">Choose your build lane</h2>
              <p className="mt-3 text-body-sm text-text-secondary">
                Tracks give teams a focused problem space while keeping the event open to different
                skills and ideas.
              </p>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {hackathon.tracks.map((track) => (
                <Card key={track.id} className="p-5">
                  <p className="text-heading-sm font-semibold text-text-primary">{track.name}</p>
                  <p className="mt-2 text-body-sm text-text-secondary">{track.description}</p>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <div className="max-w-2xl">
              <p className="text-label font-medium uppercase tracking-label text-text-tertiary">
                Timeline
              </p>
              <h2 className="mt-2 text-heading-lg font-semibold text-text-primary">Key dates</h2>
            </div>
            <ol className="mt-8 space-y-4">
              {hackathon.timeline.map((item, index) => (
                <li key={item.label} className="flex gap-4">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-control border border-border-default bg-background-sunken text-label font-medium tabular-nums text-text-secondary">
                    {index + 1}
                  </span>
                  <div className="pt-1">
                    <p className="text-heading-sm font-semibold text-text-primary">{item.label}</p>
                    <p className="mt-1 text-body-sm text-text-secondary">{item.at}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <div className="max-w-2xl">
              <p className="text-label font-medium uppercase tracking-label text-text-tertiary">
                Rules
              </p>
              <h2 className="mt-2 text-heading-lg font-semibold text-text-primary">Participation rules</h2>
              <p className="mt-4 max-w-prose text-body text-text-secondary text-pretty">
                {hackathon.rulesMd}
              </p>
            </div>
          </section>
        </div>

        <aside className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <span className="flex size-8 items-center justify-center rounded-control bg-background-sunken text-text-primary">
                <Trophy className="size-4" strokeWidth={1.75} />
              </span>
              <h3 className="text-heading-sm font-semibold text-text-primary">Prizes</h3>
            </div>
            <ul className="mt-5 space-y-3 text-body-sm text-text-secondary">
              {hackathon.prizes.map((prize) => (
                <li key={prize} className="border-t border-border-default pt-3 first:border-t-0 first:pt-0">
                  {prize}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="border-border-strong p-5">
            <div className="flex items-center gap-3">
              <span className="flex size-8 items-center justify-center rounded-control bg-background-sunken text-text-primary">
                <ShieldCheck className="size-4" strokeWidth={1.75} />
              </span>
              <h3 className="text-heading-sm font-semibold text-text-primary">Privacy note</h3>
            </div>
            <p className="mt-4 text-body-sm text-text-secondary text-pretty">
              Your phone number and email are never shown to other participants. If you join the
              matching pool, teammates only see your role, skills, university, and experience level
              until a proposed team is fully accepted.
            </p>
          </Card>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border-default bg-background-default p-4 sm:hidden">
        <Link
          href={`/events/${hackathon.slug}/register`}
          className={`${buttonVariants({ size: "lg" })} w-full`}
        >
          Register now
        </Link>
      </div>
    </div>
  );
}
