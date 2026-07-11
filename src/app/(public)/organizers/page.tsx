"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  FileCheck2,
  FolderGit2,
  Gavel,
  Handshake,
  Lock,
  QrCode,
  ShieldCheck,
  Trophy,
  UserCheck,
  Users,
  Users2,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { commandCenterMetrics } from "@/lib/mock-data";
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

const modules = [
  { icon: ClipboardCheck, label: "Registration" },
  { icon: Handshake, label: "Matching" },
  { icon: QrCode, label: "Check-in" },
  { icon: FolderGit2, label: "Submissions" },
  { icon: Gavel, label: "Judging" },
  { icon: Trophy, label: "Reports" },
];

const readinessChecklist = [
  { label: "QR check-in configured", detail: "Scanner + manual search ready for event day" },
  { label: "Judging criteria set", detail: "Weights confirmed, judges assigned" },
  { label: "Sponsor report template ready", detail: "Builds automatically from consented data" },
];

const credibilityStatements = [
  {
    icon: ShieldCheck,
    text: "Every reveal, check-in, and consent update is logged — organizers can't quietly \"forget\" what happened on event day.",
  },
  {
    icon: ClipboardCheck,
    text: "Consent is captured once, versioned, and never assumed on a participant's behalf.",
  },
  {
    icon: FileCheck2,
    text: "Reports are generated from real registrations and check-ins — not reconstructed afterward from memory and spreadsheets.",
  },
];

const lifecycleClusters = [
  {
    label: "Set up",
    steps: [
      { icon: ClipboardCheck, title: "Event setup", text: "Publish a credible event page with tracks, rules, and a system-generated cover — no design work required." },
      { icon: UserCheck, title: "Registration", text: "Collect applications with structured, comparable data instead of a form-response spreadsheet." },
      { icon: Lock, title: "Consent", text: "Mandatory and optional consent are visually separated and versioned at the point of collection." },
    ],
  },
  {
    label: "Form teams",
    steps: [
      { icon: Handshake, title: "Team formation", text: "Propose balanced teams from an opted-in pool, or let pre-formed teams register with an invite code. Contacts stay locked until every member accepts." },
    ],
  },
  {
    label: "Run the day",
    steps: [
      { icon: QrCode, title: "QR check-in", text: "Scan participants in seconds with a camera view and a manual fallback that's just as fast." },
      { icon: FolderGit2, title: "Submissions", text: "Autosaved, sectioned submission forms with a completeness meter — fewer half-finished entries to judge." },
    ],
  },
  {
    label: "Wrap up",
    steps: [
      { icon: Gavel, title: "Judging", text: "Weighted criteria, judge assignments, and a live progress view — winners are marked by humans, always." },
      { icon: Trophy, title: "Final report", text: "A print-grade report generated from the event's real numbers, ready to forward upward." },
      { icon: ShieldCheck, title: "Sponsor report", text: "A PII-free summary built only from participants who opted into sponsor sharing." },
    ],
  },
];

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
    span: true,
  },
  {
    icon: CheckCircle2,
    label: "Event-day readiness",
    caption: "Scanner, judging, and report template all configured ahead of time",
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
  },
];

const trustPromises = [
  { icon: Lock, title: "Contact data stays protected", text: "Phone, email, and WhatsApp are never shown to organizers or other participants until the audited reveal moment." },
  { icon: Users, title: "Participant data isn't freely exposed", text: "There is no public browsing of people — only an opted-in, event-scoped matching pool." },
  { icon: ShieldCheck, title: "Sponsor exports require opt-in", text: "A participant appears in a sponsor report only if they explicitly consented to be included." },
  { icon: UserCheck, title: "Organizer access is controlled", text: "Every organizer role sees exactly the data their role requires — nothing more, and every access is logged." },
  { icon: Users2, title: "No public marketplace", text: "Hackathonly is never an open directory of people looking for teams. Matching happens inside your event, not in public." },
];

const audiences = ["Universities", "Companies", "Incubators", "Communities", "Government & innovation programs"];

const heroText = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: duration.slow, ease: easing.entrance } },
};

const heroSequence = {
  hidden: {},
  visible: { transition: { staggerChildren: stagger.heroLine, delayChildren: 0.05 } },
};

export default function OrganizersLandingPage() {
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
              For organizers
            </motion.p>
            <motion.h1
              variants={heroText}
              className="mt-5 font-display text-display-lg font-semibold text-text-primary text-balance sm:text-display-xl"
            >
              Run the whole hackathon. Not five separate tools.
            </motion.h1>
            <motion.p
              variants={heroText}
              className="mx-auto mt-6 max-w-xl text-body text-text-secondary text-pretty"
            >
              Hackathonly is the operating layer for organizers — event setup, registration,
              privacy-first team formation, QR check-in, submissions, judging, and sponsor-ready
              reports, in one command center built for event day.
            </motion.p>
            <motion.div
              variants={heroText}
              className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3"
            >
              <Link
                href="/organizer/events/jordan-ai-builders-hackathon"
                className={buttonVariants({ size: "lg" })}
              >
                See the command center <ArrowRight className="size-4" strokeWidth={1.75} />
              </Link>
              <Link
                href="/events"
                className="group inline-flex items-center gap-1.5 text-body-sm font-medium text-text-secondary transition-colors duration-[var(--motion-fast)] hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-tint"
              >
                Browse live events
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
            transition={{ delay: duration.heroPanelDelay }}
            style={reducedMotion ? undefined : { x: parallax.x, y: parallax.y }}
            onPointerMove={parallax.onPointerMove}
            onPointerLeave={parallax.onPointerLeave}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-default px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-control bg-background-inverse text-text-inverse">
                  <ClipboardList className="size-4" strokeWidth={1.75} />
                </span>
                <div>
                  <p className="text-label font-medium uppercase tracking-label text-text-tertiary">
                    Organizer command center
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
                    reducedMotion
                      ? undefined
                      : { duration: duration.pulse, repeat: Infinity, ease: "easeInOut" }
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
                      index === 0
                        ? "flex items-center gap-2.5 rounded-control bg-brand-tint px-3 py-2 text-body-sm font-medium text-brand"
                        : "flex items-center gap-2.5 rounded-control px-3 py-2 text-body-sm text-text-secondary"
                    }
                  >
                    <module.icon className="size-4 shrink-0" strokeWidth={1.75} />
                    {module.label}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="border-b border-border-default p-6 md:border-b-0 md:border-e">
                  <p className="text-label font-medium uppercase tracking-label text-text-tertiary">
                    Registration health
                  </p>
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <FloatingElement distance={4} loopDuration={duration.ambient} delay={0}>
                      <ClipboardList className="size-4 text-text-tertiary" strokeWidth={1.75} />
                      <p className="mt-3 text-metric font-semibold tabular-nums text-text-primary">
                        <MotionCounter value={commandCenterMetrics.registrations} />
                      </p>
                      <p className="mt-1 text-body-sm text-text-secondary">Registered</p>
                    </FloatingElement>
                    <FloatingElement distance={4} loopDuration={duration.ambient + 1} delay={0.3}>
                      <CheckCircle2 className="size-4 text-text-tertiary" strokeWidth={1.75} />
                      <p className="mt-3 text-metric font-semibold tabular-nums text-text-primary">
                        <MotionCounter value={commandCenterMetrics.accepted} />
                      </p>
                      <p className="mt-1 text-body-sm text-text-secondary">Accepted</p>
                    </FloatingElement>
                    <FloatingElement distance={4} loopDuration={duration.ambient + 2} delay={0.6}>
                      <Handshake className="size-4 text-text-tertiary" strokeWidth={1.75} />
                      <p className="mt-3 text-metric font-semibold tabular-nums text-text-primary">
                        <MotionCounter value={commandCenterMetrics.matchingPoolSize} />
                      </p>
                      <p className="mt-1 text-body-sm text-text-secondary">In matching pool</p>
                    </FloatingElement>
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-label font-medium uppercase tracking-label text-text-tertiary">
                    Event-day readiness
                  </p>
                  <MotionStagger className="mt-4 space-y-3" staggerDelay={0.1} initialDelay={0.6}>
                    {readinessChecklist.map((item) => (
                      <MotionStaggerItem key={item.label} className="flex items-start gap-2.5">
                        <CheckCircle2
                          className="mt-0.5 size-4 shrink-0 text-status-success-fg"
                          strokeWidth={1.75}
                        />
                        <div className="min-w-0">
                          <p className="text-body-sm font-medium text-text-primary">{item.label}</p>
                          <p className="mt-0.5 text-body-sm text-text-secondary">{item.detail}</p>
                        </div>
                      </MotionStaggerItem>
                    ))}
                  </MotionStagger>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <MotionSection className="border-b border-border-default bg-background-sunken">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24">
          <MotionReveal variants={fadeUpSm} className="max-w-2xl">
            <p className="text-label font-medium uppercase tracking-label text-text-tertiary">
              Built to be trusted
            </p>
            <h2 className="mt-2 text-heading-lg font-semibold text-text-primary">
              The confidence comes from the audit trail, not a marketing claim
            </h2>
          </MotionReveal>
          <MotionStagger
            className="mt-8 divide-y divide-border-default rounded-card border border-border-default bg-background-default"
            staggerDelay={0.08}
          >
            {credibilityStatements.map((item) => (
              <MotionStaggerItem key={item.text} className="flex items-start gap-3 p-5">
                <item.icon className="mt-0.5 size-4 shrink-0 text-text-tertiary" strokeWidth={1.75} />
                <p className="text-body-sm text-text-secondary">{item.text}</p>
              </MotionStaggerItem>
            ))}
          </MotionStagger>
        </div>
      </MotionSection>

      <MotionSection className="border-b border-border-default bg-background-default">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <MotionReveal variants={fadeUpSm} className="max-w-2xl">
            <p className="text-label font-medium uppercase tracking-label text-text-tertiary">
              How it runs
            </p>
            <h2 className="mt-2 text-heading-lg font-semibold text-text-primary">
              Nine stages, one system — from first registration to the sponsor report
            </h2>
          </MotionReveal>
          <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {lifecycleClusters.map((cluster, clusterIndex) => (
              <div key={cluster.label}>
                <MotionReveal variants={clusterIndex === 0 ? fadeUpSm : fadeIn} delay={clusterIndex * 0.05}>
                  <p className="text-label font-medium uppercase tracking-label text-text-tertiary">
                    {cluster.label}
                  </p>
                </MotionReveal>
                <MotionStagger className="mt-4 space-y-5" staggerDelay={stagger.item}>
                  {cluster.steps.map((step) => (
                    <MotionStaggerItem key={step.title}>
                      <step.icon className="size-4 text-text-tertiary" strokeWidth={1.75} />
                      <p className="mt-2 text-body-sm font-semibold text-text-primary">{step.title}</p>
                      <p className="mt-1 text-body-sm text-text-secondary">{step.text}</p>
                    </MotionStaggerItem>
                  ))}
                </MotionStagger>
              </div>
            ))}
          </div>
        </div>
      </MotionSection>

      <MotionSection className="border-b border-border-default bg-background-sunken">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <MotionReveal variants={fadeUpSm} className="max-w-2xl">
            <p className="text-label font-medium uppercase tracking-label text-text-tertiary">
              What organizers actually see
            </p>
            <h2 className="mt-2 text-heading-lg font-semibold text-text-primary">
              Real product surfaces, not a raw admin table
            </h2>
          </MotionReveal>
          <MotionStagger
            className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
            staggerDelay={stagger.item}
          >
            {productSurfaces.map((surface) => (
              <MotionStaggerItem
                key={surface.label}
                className={surface.span ? "sm:col-span-2" : undefined}
              >
                <MotionCard className="h-full">
                  <div className="h-full rounded-card border border-border-default bg-background-default p-5">
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
          </MotionStagger>
        </div>
      </MotionSection>

      <MotionSection className="border-b border-border-default bg-background-default">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1fr_1.2fr]">
          <MotionReveal variants={fadeIn}>
            <p className="text-label font-medium uppercase tracking-label text-text-tertiary">
              Privacy and trust
            </p>
            <h2 className="mt-2 max-w-md text-heading-lg font-semibold text-text-primary">
              Your participants&apos; trust is the product, not a checkbox on the way to it
            </h2>
            <p className="mt-4 max-w-md text-body-sm text-text-secondary">
              Every promise below is enforced in how the system is built, not just stated in a
              privacy policy.
            </p>
          </MotionReveal>
          <MotionStagger className="divide-y divide-border-default border-t border-border-default" staggerDelay={0.08}>
            {trustPromises.map((promise) => (
              <MotionStaggerItem key={promise.title} className="flex gap-3 py-4">
                <promise.icon className="mt-0.5 size-4 shrink-0 text-text-tertiary" strokeWidth={1.75} />
                <div>
                  <p className="text-body-sm font-semibold text-text-primary">{promise.title}</p>
                  <p className="mt-0.5 text-body-sm text-text-secondary">{promise.text}</p>
                </div>
              </MotionStaggerItem>
            ))}
          </MotionStagger>
        </div>
      </MotionSection>

      <MotionSection className="border-b border-border-default bg-background-default">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-24">
          <MotionReveal variants={fadeUpSm}>
            <p className="text-label font-medium uppercase tracking-label text-text-tertiary">
              Built for every kind of organizer
            </p>
            <h2 className="mt-2 text-heading-lg font-semibold text-text-primary">
              One privacy-first foundation, every kind of organizer
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-body text-text-secondary text-pretty">
              <span className="font-semibold text-text-primary">Universities</span> run
              recruiting-season hackathons.{" "}
              <span className="font-semibold text-text-primary">Companies</span> run innovation
              sprints. <span className="font-semibold text-text-primary">Incubators</span> run
              venture-track programs.{" "}
              <span className="font-semibold text-text-primary">Communities</span> run weekend
              meetups. <span className="font-semibold text-text-primary">
                Government and innovation programs
              </span>{" "}
              run public-facing challenges. The same privacy-first foundation runs underneath all
              of them.
            </p>
          </MotionReveal>
          <MotionStagger className="mt-6 flex flex-wrap items-center justify-center gap-2" staggerDelay={0.05}>
            {audiences.map((audience) => (
              <MotionStaggerItem
                key={audience}
                className="rounded-pill border border-border-default bg-background-sunken px-3 py-1.5 text-body-sm font-medium text-text-primary"
              >
                {audience}
              </MotionStaggerItem>
            ))}
          </MotionStagger>
        </div>
      </MotionSection>

      <MotionSection className="bg-background-inverse">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center text-text-inverse sm:px-6 sm:py-24">
          <p className="text-label font-medium uppercase tracking-label text-text-inverse/70">
            Start with a live event
          </p>
          <h2 className="mx-auto mt-3 max-w-xl text-heading-lg font-semibold text-text-inverse">
            See how the command center runs an event from registration to report
          </h2>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/organizer/events/jordan-ai-builders-hackathon"
              className={buttonVariants({ size: "lg" })}
            >
              See the command center <ArrowRight className="size-4" strokeWidth={1.75} />
            </Link>
            <Link
              href="/events"
              className={buttonVariants({ size: "lg", variant: "secondary" })}
            >
              Browse live events
            </Link>
          </div>
          <Link
            href="/participants"
            className="mt-6 inline-flex items-center gap-1.5 text-body-sm font-medium text-text-inverse/70 transition-colors duration-[var(--motion-fast)] hover:text-text-inverse focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-inverse/40"
          >
            Looking for a team instead?
            <ArrowRight className="size-4" strokeWidth={1.75} />
          </Link>
        </div>
      </MotionSection>
    </div>
  );
}
