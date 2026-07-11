"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  GraduationCap,
  Handshake,
  Lock,
  QrCode,
  Radar,
  ShieldCheck,
  Trophy,
  UserCheck,
  Users,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { EventCard } from "@/components/events/event-card";
import { commandCenterMetrics, hackathons } from "@/lib/mock-data";
import { MotionReveal } from "@/components/motion/motion-reveal";
import { MotionSection } from "@/components/motion/motion-section";
import { MotionStagger, MotionStaggerItem } from "@/components/motion/motion-stagger";
import { MotionCard } from "@/components/motion/motion-card";
import { MotionCounter } from "@/components/motion/motion-counter";
import { FloatingElement } from "@/components/motion/floating-element";
import { fadeIn, fadeUpSm, scaleIn } from "@/lib/motion/variants";
import { duration, easing, stagger } from "@/lib/motion/tokens";
import { useCursorParallax } from "@/lib/motion/use-cursor-parallax";
import { useReducedMotionSafe } from "@/lib/motion/use-reduced-motion-safe";

// Placeholder/demo headshots via pravatar.cc (purpose-built for exactly this
// use — stable, realistic, license-free placeholder portraits). A deliberate,
// explicitly-requested exception to docs/DESIGN_SYSTEM.md §C/§K's no-stock-
// photography rule; see handoff/CLAUDE_IMPLEMENTATION_SUMMARY.md.
const previewQueue = [
  { name: "Layla H.", role: "Frontend", skill: "React / Design systems", status: "success" as const, avatar: "https://i.pravatar.cc/96?img=47" },
  { name: "Omar K.", role: "ML engineer", skill: "PyTorch / NLP", status: "success" as const, avatar: "https://i.pravatar.cc/96?img=12" },
  { name: "Sara M.", role: "Product", skill: "Research / Pitch", status: "pending" as const, avatar: "https://i.pravatar.cc/96?img=25" },
];

const previewStats = [
  { icon: ClipboardCheck, label: "Registrations", value: commandCenterMetrics.registrations },
  { icon: Users, label: "In matching pool", value: commandCenterMetrics.matchingPoolSize },
  { icon: Handshake, label: "Teams formed", value: commandCenterMetrics.teamsFormed },
  { icon: FileCheck2, label: "Sponsor opt-ins", value: commandCenterMetrics.sponsorOptInCount },
];

const previewFeed = [
  { icon: CheckCircle2, tone: "success" as const, text: "Team proposal accepted — 4 of 4 members confirmed" },
  { icon: AlertTriangle, tone: "warning" as const, text: "6 proposals expire within 24 hours" },
  { icon: Lock, tone: "info" as const, text: "Contact details stay locked until full team acceptance" },
];

const participantPromises = [
  {
    icon: UserCheck,
    title: "A serious profile, not a public listing",
    text: "Your role, skills, and availability help this event form stronger teams — visible only inside that event's pool.",
  },
  {
    icon: Handshake,
    title: "Every proposal needs consent",
    text: "Accept or decline a proposed team. A decline never exposes who blocked the match.",
  },
  {
    icon: Lock,
    title: "Contact reveal is earned",
    text: "Phone, email, and WhatsApp stay locked until every proposed teammate accepts.",
  },
];

const organizerModules = [
  "Applications",
  "Matching pool",
  "Proposals",
  "QR check-in",
  "Submissions",
  "Judging",
  "Mentor requests",
  "Sponsor reports",
];

const lifecycle = [
  {
    icon: ClipboardCheck,
    stage: "Launch",
    text: "Publish a credible event page with a system-generated cover, tracks, and clear team rules.",
  },
  {
    icon: Users,
    stage: "Register",
    text: "Collect applications with consent separated from optional sharing — a real roster, not exposed contacts.",
  },
  {
    icon: Handshake,
    stage: "Form teams",
    text: "Propose teams from an opted-in, event-scoped pool. Participants see safe fields, then decide.",
  },
  {
    icon: QrCode,
    stage: "Run the day",
    text: "QR check-in, mentor requests, submissions, and judging run together — no spreadsheets, no WhatsApp chasing.",
  },
  {
    icon: Trophy,
    stage: "Report",
    text: "Generate sponsor-safe reports from measured outcomes — aggregates and consented talent only.",
  },
];

const heroText = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: duration.slow, ease: easing.entrance } },
};

const heroSequence = {
  hidden: {},
  visible: { transition: { staggerChildren: stagger.heroLine, delayChildren: 0.05 } },
};

const statusPillClass: Record<"success" | "warning" | "info", string> = {
  success: "text-status-success-fg",
  warning: "text-status-warning-fg",
  info: "text-status-info-fg",
};

export default function LandingPage() {
  const featuredEvents = hackathons.slice(0, 3);
  const reducedMotion = useReducedMotionSafe();
  const parallax = useCursorParallax(8);

  return (
    <div className="overflow-x-clip bg-background-default text-text-primary">
      <section className="border-b border-border-default bg-background-default">
        <div className="mx-auto max-w-6xl px-4 pb-20 pt-20 sm:px-6 sm:pb-28 sm:pt-28 lg:pt-32">
          <motion.div
            className="mx-auto max-w-3xl text-center"
            initial="hidden"
            animate="visible"
            variants={heroSequence}
          >
            <motion.p
              variants={heroText}
              className="text-label font-semibold uppercase tracking-label text-text-tertiary"
            >
              Built for Jordanian hackathons
            </motion.p>
            <motion.h1
              variants={heroText}
              className="mt-5 font-display text-display-lg font-semibold text-text-primary text-balance sm:text-display-xl"
            >
              The operating system for hackathons in Jordan.
            </motion.h1>
            <motion.p
              variants={heroText}
              className="mx-auto mt-6 max-w-xl text-body text-text-secondary text-pretty"
            >
              Participants find serious teammates through privacy-first matching. Organizers run
              registration, check-in, submissions, judging, and sponsor reporting from one command
              center. No public people marketplace, ever.
            </motion.p>
            <motion.div
              variants={heroText}
              className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3"
            >
              <Link href="/events" className={buttonVariants({ size: "lg" })}>
                Browse events <ArrowRight className="size-4" strokeWidth={1.75} />
              </Link>
              <Link
                href="/organizer/events/jordan-ai-builders-hackathon"
                className="group inline-flex items-center gap-1.5 text-body-sm font-medium text-text-secondary transition-colors duration-[var(--motion-fast)] hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-tint"
              >
                For organizers
                <ArrowRight
                  className="size-4 transition-transform duration-[var(--motion-fast)] group-hover:translate-x-1"
                  strokeWidth={1.75}
                />
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            className="mx-auto mt-20 max-w-5xl overflow-hidden rounded-overlay border border-border-strong bg-background-default shadow-overlay"
            initial="hidden"
            animate="visible"
            variants={scaleIn}
            transition={{ delay: 0.35 }}
            style={reducedMotion ? undefined : { x: parallax.x, y: parallax.y }}
            onPointerMove={parallax.onPointerMove}
            onPointerLeave={parallax.onPointerLeave}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-default px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-control bg-background-inverse text-text-inverse">
                  <Radar className="size-4" strokeWidth={1.75} />
                </span>
                <div>
                  <p className="text-label font-medium uppercase tracking-label text-text-tertiary">
                    Event intelligence OS
                  </p>
                  <p className="text-body-sm font-semibold text-text-primary">
                    Jordan AI Builders Hackathon
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-pill bg-status-success-tint px-3 py-1 text-label font-medium uppercase tracking-label text-status-success-fg">
                <motion.span
                  className="size-1.5 rounded-pill bg-status-success-fg"
                  aria-hidden="true"
                  animate={reducedMotion ? undefined : { opacity: [1, 0.4, 1] }}
                  transition={
                    reducedMotion ? undefined : { duration: 2, repeat: Infinity, ease: "easeInOut" }
                  }
                />
                Live
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr]">
              <div className="border-b border-border-default p-6 lg:border-b-0 lg:border-e">
                <p className="text-label font-medium uppercase tracking-label text-text-tertiary">
                  Team formation queue
                </p>
                <MotionStagger className="mt-4 space-y-3" staggerDelay={0.1} initialDelay={0.6}>
                  {previewQueue.map((person) => (
                    <MotionStaggerItem
                      key={person.name}
                      className="flex items-center gap-3 rounded-card border border-border-default bg-background-sunken p-3"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element -- external hotlinked placeholder photo, next/image would require a next.config remotePatterns change out of this task's scope */}
                      <img
                        src={person.avatar}
                        alt={person.name}
                        loading="lazy"
                        className="size-11 shrink-0 rounded-pill border border-border-strong object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-body-sm font-semibold text-text-primary">
                          {person.name}
                        </p>
                        <p className="truncate text-body-sm text-text-secondary">
                          {person.role} · {person.skill}
                        </p>
                      </div>
                      <span
                        className={
                          person.status === "success"
                            ? "shrink-0 rounded-pill bg-status-success-tint px-2.5 py-1 text-label font-medium text-status-success-fg"
                            : "shrink-0 rounded-pill bg-status-warning-tint px-2.5 py-1 text-label font-medium text-status-warning-fg"
                        }
                      >
                        {person.status === "success" ? "Accepted" : "Pending"}
                      </span>
                    </MotionStaggerItem>
                  ))}
                </MotionStagger>

                <p className="mt-5 text-label font-medium uppercase tracking-label text-text-tertiary">
                  Live signals
                </p>
                <MotionStagger className="mt-3 space-y-2.5" staggerDelay={0.1} initialDelay={0.9}>
                  {previewFeed.map((item) => (
                    <MotionStaggerItem key={item.text} className="flex items-start gap-2.5">
                      <item.icon
                        className={`mt-0.5 size-4 shrink-0 ${statusPillClass[item.tone]}`}
                        strokeWidth={1.75}
                      />
                      <p className="text-body-sm text-text-secondary">{item.text}</p>
                    </MotionStaggerItem>
                  ))}
                </MotionStagger>
              </div>

              <div className="grid grid-cols-2 divide-x divide-border-default border-t border-border-default lg:divide-y-0 lg:border-t-0">
                {previewStats.map((stat, index) => (
                  <FloatingElement
                    key={stat.label}
                    className={index >= 2 ? "border-t border-border-default p-5" : "p-5"}
                    distance={4}
                    loopDuration={9 + index}
                    delay={index * 0.4}
                  >
                    <stat.icon className="size-4 text-text-tertiary" strokeWidth={1.75} />
                    <p className="mt-4 text-metric font-semibold tabular-nums text-text-primary">
                      <MotionCounter value={stat.value} />
                    </p>
                    <p className="mt-1 text-body-sm text-text-secondary">{stat.label}</p>
                  </FloatingElement>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <MotionSection className="border-b border-border-default bg-background-default">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <MotionReveal variants={fadeUpSm}>
              <p className="text-label font-medium uppercase tracking-label text-text-tertiary">
                Live inventory
              </p>
              <h2 className="mt-2 text-heading-lg font-semibold text-text-primary">
                Hackathons you can register for today
              </h2>
            </MotionReveal>
            <MotionReveal variants={fadeIn} delay={0.15}>
              <Link
                href="/events"
                className="group inline-flex items-center gap-1.5 text-body-sm font-medium text-text-primary transition-colors duration-[var(--motion-fast)] hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-tint"
              >
                View all events
                <ArrowRight
                  className="size-4 transition-transform duration-[var(--motion-fast)] group-hover:translate-x-1"
                  strokeWidth={1.75}
                />
              </Link>
            </MotionReveal>
          </div>
          <MotionStagger className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredEvents.map((hackathon) => (
              <MotionStaggerItem key={hackathon.id}>
                <MotionCard>
                  <EventCard hackathon={hackathon} />
                </MotionCard>
              </MotionStaggerItem>
            ))}
          </MotionStagger>
        </div>
      </MotionSection>

      <MotionSection className="border-b border-border-default bg-background-default">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <MotionReveal variants={fadeIn}>
            <p className="font-display text-heading-lg font-medium leading-snug text-text-primary text-balance sm:text-display-lg">
              No public marketplace. No cold DMs. No contact shared until
              everyone says yes.
            </p>
          </MotionReveal>
        </div>
      </MotionSection>

      <MotionSection className="border-b border-border-default bg-background-sunken">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2">
          <MotionReveal
            variants={fadeUpSm}
            className="rounded-overlay border border-border-default bg-background-default p-6 sm:p-8"
          >
            <span className="flex size-11 items-center justify-center rounded-control bg-background-sunken text-text-primary">
              <GraduationCap className="size-5" strokeWidth={1.75} />
            </span>
            <h2 className="mt-5 text-heading-lg font-semibold text-text-primary">
              For participants: real teammates, not a directory
            </h2>
            <p className="mt-3 max-w-md text-body-sm text-text-secondary">
              Matching is opted-in and event-scoped. There is no public people browser, no cold
              outreach, and no public contact reveal — ever.
            </p>
            <MotionStagger className="mt-6 space-y-4 border-t border-border-default pt-6" staggerDelay={0.08}>
              {participantPromises.map((promise) => (
                <MotionStaggerItem key={promise.title} className="flex gap-3">
                  <promise.icon className="mt-0.5 size-4 shrink-0 text-text-tertiary" strokeWidth={1.75} />
                  <div>
                    <p className="text-body-sm font-semibold text-text-primary">{promise.title}</p>
                    <p className="mt-0.5 text-body-sm text-text-secondary">{promise.text}</p>
                  </div>
                </MotionStaggerItem>
              ))}
            </MotionStagger>
          </MotionReveal>

          <MotionReveal
            variants={fadeUpSm}
            delay={0.1}
            className="rounded-overlay border border-border-default bg-background-default p-6 sm:p-8"
          >
            <span className="flex size-11 items-center justify-center rounded-control bg-background-sunken text-text-primary">
              <Building2 className="size-5" strokeWidth={1.75} />
            </span>
            <h2 className="mt-5 text-heading-lg font-semibold text-text-primary">
              For organizers: one command center, not five tools
            </h2>
            <p className="mt-3 max-w-md text-body-sm text-text-secondary">
              Replace Forms, Excel, and WhatsApp chasing with a single operating layer from
              registration to the report you send sponsors.
            </p>
            <MotionStagger
              className="mt-6 flex flex-wrap gap-2 border-t border-border-default pt-6"
              staggerDelay={0.05}
            >
              {organizerModules.map((module) => (
                <MotionStaggerItem
                  key={module}
                  className="rounded-pill border border-border-default bg-background-sunken px-3 py-1.5 text-body-sm font-medium text-text-primary"
                >
                  {module}
                </MotionStaggerItem>
              ))}
            </MotionStagger>
          </MotionReveal>
        </div>
      </MotionSection>

      <MotionSection className="border-b border-border-default bg-background-default">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <MotionReveal variants={fadeUpSm} className="max-w-2xl">
            <p className="text-label font-medium uppercase tracking-label text-text-tertiary">
              How it runs
            </p>
            <h2 className="mt-2 text-heading-lg font-semibold text-text-primary">
              The full event lifecycle, in order
            </h2>
          </MotionReveal>
          <div className="relative mt-8">
            <div className="absolute inset-x-0 top-9 hidden h-px bg-border-default lg:block" aria-hidden="true" />
            <motion.div
              className="absolute inset-x-0 top-9 hidden h-px origin-left bg-brand lg:block"
              aria-hidden="true"
              initial={reducedMotion ? undefined : { scaleX: 0 }}
              whileInView={reducedMotion ? undefined : { scaleX: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 1.1, ease: easing.standard }}
            />
            <MotionStagger
              className="relative grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5"
              staggerDelay={0.12}
            >
              {lifecycle.map((step, index) => (
                <MotionStaggerItem
                  key={step.stage}
                  className="rounded-card border border-border-default bg-background-default p-5"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex size-9 items-center justify-center rounded-control bg-background-sunken text-text-primary">
                      <step.icon className="size-4" strokeWidth={1.75} />
                    </span>
                    <span className="text-label font-medium tabular-nums text-text-tertiary">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <p className="mt-4 text-body-sm font-semibold text-text-primary">{step.stage}</p>
                  <p className="mt-1.5 text-body-sm text-text-secondary">{step.text}</p>
                </MotionStaggerItem>
              ))}
            </MotionStagger>
          </div>
        </div>
      </MotionSection>

      <MotionSection className="border-b border-border-default bg-background-inverse">
        <div className="mx-auto max-w-6xl px-4 py-16 text-text-inverse sm:px-6 sm:py-20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <MotionReveal variants={fadeUpSm}>
              <p className="text-label font-medium uppercase tracking-label text-text-tertiary">
                Command center
              </p>
              <h2 className="mt-2 max-w-lg text-heading-lg font-semibold text-text-inverse">
                Operational risk, visible before event day gets noisy
              </h2>
            </MotionReveal>
            <span className="inline-flex w-fit items-center gap-1.5 rounded-pill border border-text-inverse/15 px-3 py-1 text-label font-medium uppercase tracking-label text-text-inverse/80">
              Event day ready
            </span>
          </div>
          <MotionStagger
            className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-card border border-text-inverse/10 bg-text-inverse/10 lg:grid-cols-4"
            staggerDelay={0.08}
          >
            <MotionStaggerItem className="bg-background-inverse p-5">
              <ShieldCheck className="size-4 text-text-inverse/60" strokeWidth={1.75} />
              <p className="mt-4 text-metric font-semibold tabular-nums text-text-inverse">
                <MotionCounter value={commandCenterMetrics.accepted} />
              </p>
              <p className="mt-1 text-body-sm text-text-inverse/70">Accepted participants</p>
            </MotionStaggerItem>
            <MotionStaggerItem className="bg-background-inverse p-5">
              <Handshake className="size-4 text-text-inverse/60" strokeWidth={1.75} />
              <p className="mt-4 text-metric font-semibold tabular-nums text-text-inverse">
                <MotionCounter value={commandCenterMetrics.proposalsPending} />
              </p>
              <p className="mt-1 text-body-sm text-text-inverse/70">Proposals expiring soon</p>
            </MotionStaggerItem>
            <MotionStaggerItem className="bg-background-inverse p-5">
              <Trophy className="size-4 text-text-inverse/60" strokeWidth={1.75} />
              <p className="mt-4 text-metric font-semibold tabular-nums text-text-inverse">
                <MotionCounter value={commandCenterMetrics.teamsFormed} />
              </p>
              <p className="mt-1 text-body-sm text-text-inverse/70">Teams formed</p>
            </MotionStaggerItem>
            <MotionStaggerItem className="bg-background-inverse p-5">
              <FileCheck2 className="size-4 text-text-inverse/60" strokeWidth={1.75} />
              <p className="mt-4 text-metric font-semibold tabular-nums text-text-inverse">
                <MotionCounter value={commandCenterMetrics.sponsorOptInCount} />
              </p>
              <p className="mt-1 text-body-sm text-text-inverse/70">Sponsor-consented talent</p>
            </MotionStaggerItem>
          </MotionStagger>
          <MotionReveal variants={fadeIn} delay={0.2}>
            <p className="mt-6 max-w-2xl text-body-sm text-text-inverse/70">
              Sponsor exports are constrained to opted-in participants only — everyone else stays
              out of raw talent data, by construction.
            </p>
          </MotionReveal>
        </div>
      </MotionSection>

      <MotionSection className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-label font-medium uppercase tracking-label text-text-tertiary">
              Start with a live event
            </p>
            <h2 className="mt-2 max-w-xl text-heading-lg font-semibold text-text-primary">
              Browse current hackathons, or see the organizer command center for yourself.
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/events" className={buttonVariants({ size: "lg" })}>
              Browse events <ArrowRight className="size-4" strokeWidth={1.75} />
            </Link>
            <Link
              href="/organizer/events/jordan-ai-builders-hackathon"
              className={buttonVariants({ size: "lg", variant: "secondary" })}
            >
              View organizer demo
            </Link>
          </div>
        </div>
      </MotionSection>
    </div>
  );
}
