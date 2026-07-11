"use client";

import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Trophy } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { EventFactsStrip } from "@/components/events/event-facts-strip";
import { ThemeCoverIcon } from "@/components/events/theme-cover-icon";
import { MotionReveal } from "@/components/motion/motion-reveal";
import { MotionSection } from "@/components/motion/motion-section";
import { MotionStagger, MotionStaggerItem } from "@/components/motion/motion-stagger";
import { fadeIn, fadeUpSm, scaleIn } from "@/lib/motion/variants";
import { coverPhotoBySlug, getCoverTone } from "@/lib/event-cover";
import type { Hackathon } from "@/types/domain";

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

export function EventDetailContent({ hackathon }: { hackathon: Hackathon }) {
  const coverPhoto = coverPhotoBySlug[hackathon.slug];
  const tone = coverPhoto ? null : getCoverTone(hackathon.id);

  return (
    <div className="bg-background-default pb-24 text-text-primary sm:pb-0">
      <section className="border-b border-border-default bg-background-default">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:items-end">
            <MotionReveal variants={fadeUpSm} className="lg:col-span-2">
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
            </MotionReveal>

            <MotionReveal
              variants={scaleIn}
              delay={0.15}
              className="overflow-hidden rounded-card border border-border-default"
            >
              <div
                className={`relative flex aspect-video flex-col justify-between p-5 ${tone ? tone.wrapper : ""}`}
              >
                {coverPhoto ? (
                  <>
                    <Image
                      src={coverPhoto}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 33vw, 100vw"
                      className="object-cover"
                    />
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-background-inverse/85 via-background-inverse/10 to-transparent"
                      aria-hidden="true"
                    />
                  </>
                ) : (
                  <ThemeCoverIcon
                    theme={hackathon.theme}
                    className={`absolute -bottom-6 -end-6 size-32 ${tone!.icon}`}
                  />
                )}
                <span
                  className={`relative size-8 border-s border-t ${coverPhoto ? "border-text-inverse/50" : tone!.corner}`}
                  aria-hidden="true"
                />
                <div className="relative flex items-end justify-between gap-4">
                  <p className={`font-display text-display-lg font-semibold ${coverPhoto ? "text-text-inverse" : tone!.mark}`}>
                    {getEventMark(hackathon.title)}
                  </p>
                  <span
                    className={`mb-1 size-6 shrink-0 border-b border-e ${coverPhoto ? "border-text-inverse/50" : tone!.corner}`}
                    aria-hidden="true"
                  />
                </div>
              </div>
              <div className="bg-background-sunken p-6 sm:p-8">
                <p className="text-label font-medium uppercase tracking-label text-text-tertiary">
                  Event identity
                </p>
                <dl className="mt-6 grid grid-cols-2 gap-4">
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
            </MotionReveal>
          </div>
        </div>
      </section>

      <MotionReveal variants={fadeIn} as="section" className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
        <EventFactsStrip hackathon={hackathon} />
      </MotionReveal>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 pb-16 sm:px-6 sm:pb-24 lg:grid-cols-3 lg:gap-8">
        <div className="flex flex-col gap-16 lg:col-span-2">
          <MotionSection>
            <MotionReveal variants={fadeUpSm} className="max-w-2xl">
              <p className="text-label font-medium uppercase tracking-label text-text-tertiary">
                Tracks
              </p>
              <h2 className="mt-2 text-heading-lg font-semibold text-text-primary">Choose your build lane</h2>
              <p className="mt-3 text-body-sm text-text-secondary">
                Tracks give teams a focused problem space while keeping the event open to different
                skills and ideas.
              </p>
            </MotionReveal>
            <MotionStagger className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2" staggerDelay={0.08}>
              {hackathon.tracks.map((track) => (
                <MotionStaggerItem key={track.id}>
                  <Card className="p-5">
                    <p className="text-heading-sm font-semibold text-text-primary">{track.name}</p>
                    <p className="mt-2 text-body-sm text-text-secondary">{track.description}</p>
                  </Card>
                </MotionStaggerItem>
              ))}
            </MotionStagger>
          </MotionSection>

          <MotionSection>
            <MotionReveal variants={fadeUpSm} className="max-w-2xl">
              <p className="text-label font-medium uppercase tracking-label text-text-tertiary">
                Timeline
              </p>
              <h2 className="mt-2 text-heading-lg font-semibold text-text-primary">Key dates</h2>
            </MotionReveal>
            <MotionStagger className="mt-8" staggerDelay={0.08}>
              <ol className="space-y-4">
                {hackathon.timeline.map((item, index) => (
                  <MotionStaggerItem key={item.label}>
                    <li className="flex gap-4">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-control border border-border-default bg-background-sunken text-label font-medium tabular-nums text-text-secondary">
                        {index + 1}
                      </span>
                      <div className="pt-1">
                        <p className="text-heading-sm font-semibold text-text-primary">{item.label}</p>
                        <p className="mt-1 text-body-sm text-text-secondary">{item.at}</p>
                      </div>
                    </li>
                  </MotionStaggerItem>
                ))}
              </ol>
            </MotionStagger>
          </MotionSection>

          <MotionSection>
            <div className="max-w-2xl">
              <p className="text-label font-medium uppercase tracking-label text-text-tertiary">
                Rules
              </p>
              <h2 className="mt-2 text-heading-lg font-semibold text-text-primary">Participation rules</h2>
              <p className="mt-4 max-w-prose text-body text-text-secondary text-pretty">
                {hackathon.rulesMd}
              </p>
            </div>
          </MotionSection>
        </div>

        <aside className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
          <MotionReveal variants={fadeUpSm} delay={0.1}>
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
          </MotionReveal>

          <MotionReveal variants={fadeUpSm} delay={0.18}>
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
          </MotionReveal>
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
