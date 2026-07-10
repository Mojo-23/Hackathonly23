import Link from "next/link";
import {
  ArrowRight,
  Lock,
  QrCode,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { EventCard } from "@/components/events/event-card";
import { hackathons } from "@/lib/mock-data";

const howItWorks = [
  {
    icon: Users,
    title: "Register solo",
    description: "Sign up for a hackathon and tell us your role, skills, and what you're looking for in teammates.",
  },
  {
    icon: Sparkles,
    title: "Get proposed a team",
    description: "We (or the organizer) propose a balanced team. Everyone reviews and accepts or declines.",
  },
  {
    icon: Lock,
    title: "Contact reveals on acceptance",
    description: "Nobody's phone or email is shared until every proposed teammate accepts. No open marketplace, no cold DMs.",
  },
];

const organizerFeatures = [
  { icon: QrCode, title: "QR check-in", description: "Scan participants in seconds and track no-shows live." },
  { icon: Trophy, title: "Judging built in", description: "Criteria, assignments, scores, and a ranked results view." },
  { icon: Sparkles, title: "One-click reports", description: "A professional final report and sponsor impact summary, generated from real data." },
];

export default function LandingPage() {
  const featuredEvents = hackathons.slice(0, 3);

  return (
    <div>
      <section className="border-b border-border bg-paper">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">
            Built for Jordanian hackathons
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl md:text-6xl">
            Going solo to a hackathon?
            <br />
            Get matched with a serious team.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-ink-muted">
            Hackathonly Jordan is the event intelligence platform for organizers and participants —
            privacy-first team formation for students, and a full command center for organizers, from
            registration to sponsor reports.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/events" className={buttonVariants({ size: "lg" })}>
              Browse events <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/organizer/events/jordan-ai-builders-hackathon"
              className={buttonVariants({ size: "lg", variant: "secondary" })}
            >
              For organizers
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <SectionHeader
          eyebrow="How matching works"
          title="No contact details until everyone says yes"
          description="Team formation is matching-first and privacy-first — not an open marketplace, not a public directory."
        />
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
          {howItWorks.map((step, i) => (
            <Card key={step.title} className="p-6">
              <div className="flex items-center gap-3">
                <span className="flex size-8 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent">
                  {i + 1}
                </span>
                <step.icon className="size-5 text-ink-subtle" strokeWidth={1.75} />
              </div>
              <h3 className="mt-4 text-base font-semibold text-ink">{step.title}</h3>
              <p className="mt-1.5 text-sm text-ink-muted">{step.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-paper-raised">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <SectionHeader
            eyebrow="Upcoming events"
            title="Hackathons across Jordan"
            action={
              <Link href="/events" className="text-sm font-medium text-accent hover:underline">
                View all events →
              </Link>
            }
          />
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredEvents.map((h) => (
              <EventCard key={h.id} hackathon={h} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <SectionHeader
          eyebrow="For organizers"
          title="Run your event from one command center"
          description="Replace Google Forms, Excel, and WhatsApp chaos with registration, check-in, submissions, judging, mentor requests, and reports in one place."
        />
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
          {organizerFeatures.map((feature) => (
            <Card key={feature.title} className="p-6">
              <feature.icon className="size-5 text-accent" strokeWidth={1.75} />
              <h3 className="mt-4 text-base font-semibold text-ink">{feature.title}</h3>
              <p className="mt-1.5 text-sm text-ink-muted">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
