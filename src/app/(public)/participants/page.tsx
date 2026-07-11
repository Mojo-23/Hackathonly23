"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Handshake,
  Lock,
  Shuffle,
  Trophy,
  UserCheck,
  Users,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { EventCard } from "@/components/events/event-card";
import { hackathons, myProposals } from "@/lib/mock-data";
import { MotionReveal } from "@/components/motion/motion-reveal";
import { MotionSection } from "@/components/motion/motion-section";
import { MotionStagger, MotionStaggerItem } from "@/components/motion/motion-stagger";
import { MotionCard } from "@/components/motion/motion-card";
import { fadeIn, fadeUpSm } from "@/lib/motion/variants";
import { duration, easing, stagger } from "@/lib/motion/tokens";
import { useReducedMotionSafe } from "@/lib/motion/use-reduced-motion-safe";

const poolAvatars = [
  { name: "Layla H.", avatar: "/images/avatars/layla-h.jpg" },
  { name: "Omar K.", avatar: "/images/avatars/omar-k.jpg" },
  { name: "Sara M.", avatar: "/images/avatars/sara-m.jpg" },
];

const painPoints = [
  "I want to join, but I don't have a team.",
  "My friends aren't interested this time.",
  "I don't know anyone else going.",
  "I don't want random strangers messaging me.",
];

const flowSteps = [
  { icon: ClipboardCheck, title: "Join the event", text: "Register solo or with friends — no team required to sign up." },
  { icon: UserCheck, title: "Build your profile", text: "Role, skills, and availability — visible only inside this event's own pool." },
  { icon: Shuffle, title: "Matched on complements", text: "We find people whose skills complete yours, not copy them." },
  { icon: Handshake, title: "Proposal sent", text: "You and your proposed teammates each get the same proposal to review." },
  { icon: CheckCircle2, title: "Everyone accepts", text: "Every member accepts individually. A decline never reveals who or why." },
  { icon: Users, title: "Team forms", text: "Once everyone's in, the team exists — official, inside the event." },
];

const trustFragments = [
  {
    icon: Shuffle,
    title: "Event-scoped, always",
    text: "Your profile lives inside this event's pool only — never a public, browsable directory.",
  },
  {
    icon: Handshake,
    title: "Complementary, not random",
    text: "Matching weighs role coverage, skill balance, and experience — not a swipe deck.",
  },
];

const proposal = myProposals[0];

const heroText = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: duration.slow, ease: easing.entrance } },
};

const heroSequence = {
  hidden: {},
  visible: { transition: { staggerChildren: stagger.heroLine, delayChildren: 0.05 } },
};

export default function ParticipantsPage() {
  const reducedMotion = useReducedMotionSafe();
  const featuredEvents = hackathons.slice(0, 3);

  return (
    <div className="overflow-x-clip bg-background-default text-text-primary">
      <section className="border-b border-border-default bg-background-default">
        <div className="mx-auto max-w-3xl px-4 pb-16 pt-20 text-center sm:px-6 sm:pb-20 sm:pt-28 lg:pt-32">
          <motion.div initial="hidden" animate="visible" variants={heroSequence}>
            <motion.p
              variants={heroText}
              className="text-label font-semibold uppercase tracking-label text-text-tertiary"
            >
              For participants
            </motion.p>
            <motion.h1
              variants={heroText}
              className="mt-5 font-display text-display-lg font-semibold text-text-primary text-balance sm:text-display-xl"
            >
              Not having a team yet is exactly who this is for.
            </motion.h1>
            <motion.p
              variants={heroText}
              className="mx-auto mt-6 max-w-xl text-body text-text-secondary text-pretty"
            >
              Hackathonly matches you with serious teammates inside your event&apos;s own pool — never
              a public directory, never a cold DM, never your number shared without your yes.
            </motion.p>
            <motion.div
              variants={heroText}
              className="mt-8 flex flex-wrap items-center justify-center gap-3"
            >
              <Link href="/events" className={buttonVariants({ size: "lg" })}>
                Browse events <ArrowRight className="size-4" strokeWidth={1.75} />
              </Link>
              <a
                href="#how-it-works"
                className={buttonVariants({ size: "lg", variant: "secondary" })}
              >
                See how matching works
              </a>
            </motion.div>

            <motion.div
              variants={heroText}
              className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
            >
              <div className="flex -space-x-3">
                {poolAvatars.map((person) => (
                  <Image
                    key={person.name}
                    src={person.avatar}
                    alt={person.name}
                    width={40}
                    height={40}
                    className="size-10 shrink-0 rounded-pill border-2 border-background-default object-cover"
                  />
                ))}
              </div>
              <p className="text-body-sm text-text-tertiary">
                Every match starts with a real profile — never a public one.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <MotionSection className="border-b border-border-default bg-background-sunken">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20">
          <MotionStagger className="grid grid-cols-1 gap-3 sm:grid-cols-2" staggerDelay={0.08}>
            {painPoints.map((quote) => (
              <MotionStaggerItem
                key={quote}
                className="rounded-card border border-border-default bg-background-default p-5"
              >
                <p className="font-display text-heading-md text-text-primary text-pretty">
                  &ldquo;{quote}&rdquo;
                </p>
              </MotionStaggerItem>
            ))}
          </MotionStagger>
          <MotionReveal variants={fadeIn} delay={0.3} className="mt-8 text-center">
            <p className="text-body-sm font-medium text-text-tertiary">
              That&apos;s the exact problem this was built to solve.
            </p>
          </MotionReveal>
        </div>
      </MotionSection>

      <MotionSection className="border-b border-border-default bg-background-default">
        <div id="how-it-works" className="mx-auto max-w-3xl scroll-mt-20 px-4 py-16 sm:px-6 sm:py-24">
          <MotionReveal variants={fadeUpSm} className="text-center">
            <p className="text-label font-medium uppercase tracking-label text-text-tertiary">
              How it actually works
            </p>
            <h2 className="mt-2 text-heading-lg font-semibold text-text-primary">
              From solo registration to a real team — no public profile, ever
            </h2>
          </MotionReveal>

          <div className="relative mt-12">
            <div
              className="absolute inset-y-0 start-5 hidden w-px bg-border-default sm:block"
              aria-hidden="true"
            />
            <motion.div
              className="absolute inset-y-0 start-5 hidden w-px origin-top bg-brand sm:block"
              aria-hidden="true"
              initial={reducedMotion ? undefined : { scaleY: 0 }}
              whileInView={reducedMotion ? undefined : { scaleY: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.6, ease: easing.standard }}
            />

            <MotionStagger className="relative space-y-8" staggerDelay={0.1}>
              {flowSteps.map((step, index) => (
                <MotionStaggerItem key={step.title} className="flex gap-5 sm:gap-6">
                  <span className="relative z-10 flex size-11 shrink-0 items-center justify-center rounded-pill border border-border-strong bg-background-default text-text-primary">
                    <step.icon className="size-4" strokeWidth={1.75} />
                  </span>
                  <div className="pt-1.5">
                    <p className="text-label font-medium tabular-nums text-text-tertiary">
                      Step {String(index + 1).padStart(2, "0")}
                    </p>
                    <p className="mt-1 text-heading-sm font-semibold text-text-primary">{step.title}</p>
                    <p className="mt-1 max-w-md text-body-sm text-text-secondary">{step.text}</p>
                  </div>
                </MotionStaggerItem>
              ))}

              <MotionStaggerItem className="flex gap-5 sm:gap-6">
                <span className="relative z-10 flex size-11 shrink-0 items-center justify-center rounded-pill border border-border-strong bg-background-default text-text-primary">
                  <Lock className="size-4" strokeWidth={1.75} />
                </span>
                <div className="min-w-0 flex-1 pt-1.5">
                  <p className="text-label font-medium tabular-nums text-text-tertiary">Step 07</p>
                  <p className="mt-1 text-heading-sm font-semibold text-text-primary">Contact unlocks</p>
                  <p className="mt-1 max-w-md text-body-sm text-text-secondary">
                    Only once every proposed teammate has accepted — never before.
                  </p>
                  <MotionReveal
                    variants={fadeIn}
                    className="mt-4 max-w-sm rounded-card border border-border-default bg-background-sunken p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-body-sm font-semibold text-text-primary">Layla H.</p>
                      <span className="rounded-pill bg-status-success-tint px-2.5 py-1 text-label font-medium text-status-success-fg">
                        4 of 4 accepted
                      </span>
                    </div>
                    <div className="mt-3 space-y-2">
                      <motion.p
                        className="text-body-sm text-text-primary"
                        initial={reducedMotion ? undefined : { filter: "blur(6px)", opacity: 0.6 }}
                        whileInView={reducedMotion ? undefined : { filter: "blur(0px)", opacity: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: duration.slow, ease: easing.standard, delay: 0.3 }}
                      >
                        +962 7X XXX XXXX
                      </motion.p>
                      <motion.p
                        className="text-body-sm text-text-primary"
                        initial={reducedMotion ? undefined : { filter: "blur(6px)", opacity: 0.6 }}
                        whileInView={reducedMotion ? undefined : { filter: "blur(0px)", opacity: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: duration.slow, ease: easing.standard, delay: 0.45 }}
                      >
                        layla@email.com
                      </motion.p>
                    </div>
                  </MotionReveal>
                </div>
              </MotionStaggerItem>

              <MotionStaggerItem className="flex gap-5 sm:gap-6">
                <span className="relative z-10 flex size-11 shrink-0 items-center justify-center rounded-pill border border-border-strong bg-background-inverse text-text-inverse">
                  <Trophy className="size-4" strokeWidth={1.75} />
                </span>
                <div className="pt-1.5">
                  <p className="text-label font-medium tabular-nums text-text-tertiary">Step 08</p>
                  <p className="mt-1 text-heading-sm font-semibold text-text-primary">
                    Ready for the hackathon
                  </p>
                  <p className="mt-1 max-w-md text-body-sm text-text-secondary">
                    Real teammates, confirmed before the doors even open.
                  </p>
                </div>
              </MotionStaggerItem>
            </MotionStagger>
          </div>
        </div>
      </MotionSection>

      <MotionSection className="border-b border-border-default bg-background-sunken">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20">
          <MotionStagger className="grid grid-cols-1 gap-6 sm:grid-cols-2" staggerDelay={0.1}>
            {trustFragments.map((fragment) => (
              <MotionStaggerItem
                key={fragment.title}
                className="rounded-overlay border border-border-default bg-background-default p-6"
              >
                <span className="flex size-10 items-center justify-center rounded-control bg-background-sunken text-text-primary">
                  <fragment.icon className="size-4" strokeWidth={1.75} />
                </span>
                <p className="mt-4 text-body-sm font-semibold text-text-primary">{fragment.title}</p>
                <p className="mt-1 text-body-sm text-text-secondary">{fragment.text}</p>
              </MotionStaggerItem>
            ))}
            {proposal ? (
              <MotionStaggerItem className="rounded-overlay border border-border-default bg-background-default p-6 sm:col-span-2">
                <p className="text-label font-medium uppercase tracking-label text-text-tertiary">
                  A real proposal, in progress
                </p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-body-sm font-semibold text-text-primary">{proposal.hackathonTitle}</p>
                  <span className="shrink-0 rounded-pill bg-status-warning-tint px-2.5 py-1 text-label font-medium text-status-warning-fg">
                    Expires in {proposal.expiresInHours}h
                  </span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-pill bg-border-default">
                  <motion.div
                    className="h-full rounded-pill bg-status-success-fg"
                    style={{ transformOrigin: "left" }}
                    initial={reducedMotion ? undefined : { scaleX: 0 }}
                    whileInView={
                      reducedMotion ? undefined : { scaleX: proposal.membersAccepted / proposal.membersTotal }
                    }
                    viewport={{ once: true }}
                    transition={{ duration: duration.slow, ease: easing.standard }}
                  />
                </div>
                <p className="mt-2 text-body-sm text-text-secondary">
                  {proposal.membersAccepted} of {proposal.membersTotal} teammates accepted — nobody sees who
                  hasn&apos;t responded yet.
                </p>
              </MotionStaggerItem>
            ) : null}
          </MotionStagger>
        </div>
      </MotionSection>

      <MotionSection className="border-b border-border-default bg-background-default">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <MotionReveal variants={fadeUpSm} className="max-w-2xl">
            <p className="text-label font-medium uppercase tracking-label text-text-tertiary">
              Live inventory
            </p>
            <h2 className="mt-2 text-heading-lg font-semibold text-text-primary">
              Hackathons you can register for today
            </h2>
          </MotionReveal>
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

      <MotionSection className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-28">
        <MotionReveal variants={fadeUpSm}>
          <p className="text-label font-medium uppercase tracking-label text-text-tertiary">
            Ready when you are
          </p>
          <h2 className="mx-auto mt-3 max-w-xl font-display text-display-lg font-semibold text-text-primary text-balance">
            Find your team before the hackathon does it for you.
          </h2>
        </MotionReveal>
        <MotionReveal variants={fadeIn} delay={0.15}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/events" className={buttonVariants({ size: "lg" })}>
              Browse events <ArrowRight className="size-4" strokeWidth={1.75} />
            </Link>
            <Link href="/organizers" className={buttonVariants({ size: "lg", variant: "secondary" })}>
              Organizing instead?
            </Link>
          </div>
        </MotionReveal>
      </MotionSection>
    </div>
  );
}
