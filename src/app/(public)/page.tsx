"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  ClipboardCheck,
  ClipboardList,
  FileCheck2,
  FolderGit2,
  Gavel,
  GraduationCap,
  Handshake,
  Info,
  QrCode,
  Radar,
  ShieldCheck,
  Trophy,
  Users,
  Users2,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { EventCard } from "@/components/events/event-card";
import { commandCenterMetrics, commandCenterWarnings, hackathons, myProposals } from "@/lib/mock-data";
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

// Curated, locally-stored placeholder headshots (public/images/avatars/),
// approved by explicit human decision. Source and license for every file are
// recorded in public/images/SOURCE.md. Never hotlinked.
const previewQueue = [
  { name: "Layla H.", role: "Frontend", skill: "React / Design systems", status: "success" as const, avatar: "/images/avatars/layla-h.jpg" },
  { name: "Omar K.", role: "ML engineer", skill: "PyTorch / NLP", status: "success" as const, avatar: "/images/avatars/omar-k.jpg" },
  { name: "Sara M.", role: "Product", skill: "Research / Pitch", status: "pending" as const, avatar: "/images/avatars/sara-m.jpg" },
];

const modules = [
  { icon: ClipboardCheck, label: "Registration" },
  { icon: Handshake, label: "Matching" },
  { icon: QrCode, label: "Check-in" },
  { icon: FolderGit2, label: "Submissions" },
  { icon: Gavel, label: "Judging" },
  { icon: Trophy, label: "Reports" },
];

const previewStats = [
  { icon: ClipboardCheck, label: "Registrations", value: commandCenterMetrics.registrations },
  { icon: Users, label: "In matching pool", value: commandCenterMetrics.matchingPoolSize },
  { icon: Handshake, label: "Teams formed", value: commandCenterMetrics.teamsFormed },
  { icon: FileCheck2, label: "Sponsor opt-ins", value: commandCenterMetrics.sponsorOptInCount },
];

const proposal = myProposals[0];

const guarantees = [
  { value: "1", label: "audited RPC controls every contact reveal — never a client-side write" },
  { value: "0", label: "public profiles. Nobody is ever indexed or browsable outside their own event" },
  { value: "100%", label: "of consent versioned before a team is even proposed" },
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

const warningIcon = {
  info: { icon: Info, className: "text-status-info-fg" },
  warning: { icon: AlertTriangle, className: "text-status-warning-fg" },
  danger: { icon: AlertTriangle, className: "text-status-error-fg" },
} as const;

const productSurfaces = [
  {
    icon: ClipboardList,
    label: "Registration health",
    metric: commandCenterMetrics.accepted,
    caption: `${commandCenterMetrics.accepted} of ${commandCenterMetrics.registrations} applicants accepted`,
    span: true,
  },
  {
    icon: Users2,
    label: "Matching queue",
    metric: commandCenterMetrics.proposalsPending,
    caption: `${commandCenterMetrics.proposalsApproved} proposals approved, ${commandCenterMetrics.proposalsPending} awaiting response`,
  },
  {
    icon: QrCode,
    label: "Check-in status",
    caption: "Check-in opens on event day — 0 scanned so far",
  },
  {
    icon: FolderGit2,
    label: "Submission progress",
    caption: "Opens once team formation closes",
  },
  {
    icon: Gavel,
    label: "Judging readiness",
    caption: "Criteria and judges confirmed — scoring opens after submissions close",
  },
  {
    icon: ShieldCheck,
    label: "Sponsor-consented reporting",
    metric: commandCenterMetrics.sponsorOptInCount,
    caption: `${commandCenterMetrics.sponsorOptInCount} participants opted in — only they appear in sponsor exports`,
    span: true,
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
            className="mx-auto mt-20 max-w-6xl overflow-hidden rounded-overlay border border-border-strong bg-background-default shadow-overlay"
            initial="hidden"
            animate="visible"
            variants={scaleIn}
            transition={{ delay: duration.heroPanelDelay }}
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
                    reducedMotion ? undefined : { duration: duration.pulse, repeat: Infinity, ease: "easeInOut" }
                  }
                />
                Live
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr]">
              <div className="hidden flex-col gap-1 border-e border-border-default bg-background-sunken p-3 lg:flex">
                {modules.map((module, index) => (
                  <div
                    key={module.label}
                    className={
                      index === 1
                        ? "flex items-center gap-2.5 rounded-control bg-brand-tint px-3 py-2 text-body-sm font-medium text-brand"
                        : "flex items-center gap-2.5 rounded-control px-3 py-2 text-body-sm text-text-secondary"
                    }
                  >
                    <module.icon className="size-4 shrink-0" strokeWidth={1.75} />
                    {module.label}
                  </div>
                ))}
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
                        <Image
                          src={person.avatar}
                          alt={person.name}
                          width={44}
                          height={44}
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

                  {proposal ? (
                    <MotionReveal variants={fadeUpSm} delay={0.9} className="mt-5">
                      <p className="text-label font-medium uppercase tracking-label text-text-tertiary">
                        Your proposal
                      </p>
                      <div className="mt-3 rounded-card border border-border-default bg-background-sunken p-3.5">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-body-sm font-semibold text-text-primary">
                            {proposal.hackathonTitle}
                          </p>
                          <span className="shrink-0 rounded-pill bg-status-warning-tint px-2.5 py-1 text-label font-medium text-status-warning-fg">
                            Expires in {proposal.expiresInHours}h
                          </span>
                        </div>
                        <div className="mt-3 h-1.5 overflow-hidden rounded-pill bg-border-default">
                          <motion.div
                            className="h-full rounded-pill bg-status-success-fg"
                            initial={reducedMotion ? undefined : { scaleX: 0 }}
                            whileInView={
                              reducedMotion
                                ? undefined
                                : { scaleX: proposal.membersAccepted / proposal.membersTotal }
                            }
                            viewport={{ once: true }}
                            style={{
                              transformOrigin: "left",
                              scaleX: reducedMotion
                                ? proposal.membersAccepted / proposal.membersTotal
                                : undefined,
                            }}
                            transition={{ duration: duration.slow, ease: easing.standard, delay: 1 }}
                          />
                        </div>
                        <p className="mt-2 text-body-sm text-text-secondary">
                          {proposal.membersAccepted} of {proposal.membersTotal} teammates accepted
                        </p>
                      </div>
                    </MotionReveal>
                  ) : null}
                </div>

                <div className="grid grid-cols-2 divide-x divide-border-default border-t border-border-default lg:divide-y-0 lg:border-t-0">
                  {previewStats.map((stat, index) => (
                    <FloatingElement
                      key={stat.label}
                      className={index >= 2 ? "border-t border-border-default p-5" : "p-5"}
                      distance={4}
                      loopDuration={duration.ambient + index}
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
            </div>
          </motion.div>
        </div>
      </section>

      <MotionSection className="border-b border-border-default bg-background-default">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <MotionStagger
            className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-3"
            staggerDelay={0.1}
          >
            {guarantees.map((item) => (
              <MotionStaggerItem key={item.label}>
                <p className="font-display text-display-lg font-semibold text-text-primary">
                  {item.value}
                </p>
                <p className="mt-2 max-w-xs text-body-sm text-text-secondary">{item.label}</p>
              </MotionStaggerItem>
            ))}
          </MotionStagger>
        </div>
      </MotionSection>

      <MotionSection className="border-b border-border-default bg-background-sunken">
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
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <MotionReveal variants={fadeUpSm} className="max-w-2xl">
            <p className="text-label font-medium uppercase tracking-label text-text-tertiary">
              What organizers actually see
            </p>
            <h2 className="mt-2 text-heading-lg font-semibold text-text-primary">
              Every stage, one system — not a raw admin table
            </h2>
          </MotionReveal>
          <MotionStagger
            className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
            staggerDelay={stagger.item}
          >
            {productSurfaces.map((surface) => (
              <MotionStaggerItem
                key={surface.label}
                className={surface.span ? "sm:col-span-2" : undefined}
              >
                <MotionCard className="h-full">
                  <div className="h-full rounded-card border border-border-default bg-background-sunken p-5">
                    <surface.icon className="size-4 text-text-tertiary" strokeWidth={1.75} />
                    <p className="mt-4 text-label font-medium uppercase tracking-label text-text-tertiary">
                      {surface.label}
                    </p>
                    {surface.metric !== undefined ? (
                      <p className="mt-1 text-metric font-semibold tabular-nums text-text-primary">
                        <MotionCounter value={surface.metric} />
                      </p>
                    ) : null}
                    <p className="mt-2 text-body-sm text-text-secondary">{surface.caption}</p>
                  </div>
                </MotionCard>
              </MotionStaggerItem>
            ))}
            <MotionStaggerItem className="sm:col-span-2 lg:col-span-4">
              <div className="rounded-card border border-border-default bg-background-inverse p-5">
                <p className="text-label font-medium uppercase tracking-label text-text-inverse/70">
                  Warnings feed
                </p>
                <div className="mt-3 divide-y divide-text-inverse/10">
                  {commandCenterWarnings.map((warning) => {
                    const style = warningIcon[warning.severity];
                    return (
                      <div key={warning.id} className="flex items-start gap-2.5 py-2.5 first:pt-0 last:pb-0">
                        <style.icon className={`mt-0.5 size-4 shrink-0 ${style.className}`} strokeWidth={1.75} />
                        <p className="text-body-sm text-text-inverse/80">{warning.message}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </MotionStaggerItem>
          </MotionStagger>
        </div>
      </MotionSection>

      <MotionSection className="border-b border-border-default bg-background-sunken">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <MotionReveal variants={fadeUpSm} className="max-w-2xl">
            <p className="text-label font-medium uppercase tracking-label text-text-tertiary">
              Two ways in
            </p>
            <h2 className="mt-2 text-heading-lg font-semibold text-text-primary">
              Whichever side of the event you&apos;re on, this is built for you specifically
            </h2>
          </MotionReveal>
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <MotionReveal
              variants={fadeUpSm}
              className="flex flex-col rounded-overlay border border-border-default bg-background-default p-8 sm:p-10"
            >
              <span className="flex size-12 items-center justify-center rounded-control bg-background-sunken text-text-primary">
                <GraduationCap className="size-5" strokeWidth={1.75} />
              </span>
              <h3 className="mt-6 font-display text-heading-lg font-semibold text-text-primary">
                Going as a participant?
              </h3>
              <p className="mt-3 max-w-sm text-body-sm text-text-secondary">
                Never walk in without a team. See exactly how privacy-first matching finds you
                serious teammates, step by step.
              </p>
              <Link
                href="/participants"
                className={`${buttonVariants({ size: "lg", variant: "secondary" })} mt-8 w-fit`}
              >
                For participants <ArrowRight className="size-4" strokeWidth={1.75} />
              </Link>
            </MotionReveal>

            <MotionReveal
              variants={fadeUpSm}
              delay={0.1}
              className="flex flex-col rounded-overlay border border-border-default bg-background-default p-8 sm:p-10"
            >
              <span className="flex size-12 items-center justify-center rounded-control bg-background-sunken text-text-primary">
                <Building2 className="size-5" strokeWidth={1.75} />
              </span>
              <h3 className="mt-6 font-display text-heading-lg font-semibold text-text-primary">
                Organizing an event?
              </h3>
              <p className="mt-3 max-w-sm text-body-sm text-text-secondary">
                Replace Forms, Excel, and WhatsApp chasing with one command center — registration
                to the report you send sponsors.
              </p>
              <Link
                href="/organizers"
                className={`${buttonVariants({ size: "lg", variant: "secondary" })} mt-8 w-fit`}
              >
                For organizers <ArrowRight className="size-4" strokeWidth={1.75} />
              </Link>
            </MotionReveal>
          </div>
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

      <MotionSection className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-28">
        <div className="text-center">
          <MotionReveal variants={fadeUpSm}>
            <p className="text-label font-medium uppercase tracking-label text-text-tertiary">
              Start with a live event
            </p>
            <h2 className="mx-auto mt-3 max-w-2xl font-display text-display-lg font-semibold text-text-primary text-balance">
              Browse current hackathons, or see the organizer command center for yourself.
            </h2>
          </MotionReveal>
          <MotionReveal variants={fadeIn} delay={0.15}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
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
          </MotionReveal>
        </div>
      </MotionSection>
    </div>
  );
}
