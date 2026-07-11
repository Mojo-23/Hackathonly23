"use client";

import { useMemo, useState } from "react";
import {
  ClipboardCheck,
  GraduationCap,
  Handshake,
  Lock,
  Search,
  ShieldCheck,
  Trophy,
  Users2,
  Wrench,
} from "lucide-react";
import { MotionReveal } from "@/components/motion/motion-reveal";
import { MotionSection } from "@/components/motion/motion-section";
import { MotionStagger, MotionStaggerItem } from "@/components/motion/motion-stagger";
import { fadeUpSm } from "@/lib/motion/variants";
import { coverTone } from "@/lib/event-cover";

// Editorial content for Hackathonly's own resource hub — not fabricated
// user data, not fake stats/testimonials. These are the platform's own
// planned articles; excerpts are real, original copy, not filler.
const categories = [
  "Getting started",
  "Privacy",
  "Product",
  "Organizers",
  "Builder guides",
  "Community",
  "Sponsors",
];

const featured = {
  category: "Getting started",
  icon: Trophy,
  title: "Why participate in hackathons?",
  excerpt:
    "A weekend hackathon compresses a year of learning into 48 hours — a real deadline, a real team, and a real thing to show for it. Here's what students in Jordan actually get out of showing up.",
  readTime: "6 min read",
};

const posts = [
  {
    category: "Privacy",
    icon: Lock,
    title: "Why Hackathonly is privacy-first",
    excerpt:
      "No public people directory, no cold DMs, no contact shared until every teammate says yes. Here's the actual mechanism behind that promise — not just the pitch.",
    readTime: "5 min read",
  },
  {
    category: "Product",
    icon: Handshake,
    title: "How team matching works",
    excerpt:
      "Matching isn't a swipe deck. It's role coverage, skill complement, and experience balance, scored per event — then a human-reviewable proposal, never an automatic assignment.",
    readTime: "4 min read",
  },
  {
    category: "Organizers",
    icon: ClipboardCheck,
    title: "How organizers run successful hackathons",
    excerpt:
      "The best-run events aren't the ones with the biggest prize pool — they're the ones where nobody is chasing a spreadsheet at 2am. A field guide from event day operations.",
    readTime: "7 min read",
  },
  {
    category: "Builder guides",
    icon: Wrench,
    title: "Building your first MVP",
    excerpt:
      "You have 48 hours and six people's worth of ideas. Here's how to cut scope ruthlessly, ship something that actually runs, and still sleep for four hours.",
    readTime: "8 min read",
  },
  {
    category: "Builder guides",
    icon: Trophy,
    title: "Winning hackathon strategies",
    excerpt:
      "Judges remember clarity, not cleverness. Notes on picking a problem worth solving, demoing under pressure, and what actually moves a scoresheet.",
    readTime: "6 min read",
  },
  {
    category: "Community",
    icon: GraduationCap,
    title: "Student success stories",
    excerpt:
      "Where Hackathonly teams go after the weekend ends — new co-founders, new internships, new skills proven under a deadline. Real stories, as they're ready to share them.",
    readTime: "5 min read",
  },
  {
    category: "Sponsors",
    icon: ShieldCheck,
    title: "Sponsor case studies",
    excerpt:
      "What a sponsor actually gets from backing a university hackathon in Jordan — and why the report matters more than the banner.",
    readTime: "5 min read",
  },
  {
    category: "Community",
    icon: Users2,
    title: "Community updates",
    excerpt:
      "New universities, new organizers, new tracks — what's changing across the Jordanian hackathon scene this season.",
    readTime: "3 min read",
  },
];

export default function BlogPage() {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const filteredPosts = useMemo(() => {
    if (!normalizedQuery) return posts;
    return posts.filter(
      (post) =>
        post.title.toLowerCase().includes(normalizedQuery) ||
        post.excerpt.toLowerCase().includes(normalizedQuery) ||
        post.category.toLowerCase().includes(normalizedQuery),
    );
  }, [normalizedQuery]);

  return (
    <div className="bg-background-default text-text-primary">
      <section className="border-b border-border-default bg-background-default">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <MotionReveal variants={fadeUpSm}>
            <p className="text-label font-semibold uppercase tracking-label text-text-tertiary">
              Blog
            </p>
            <h1 className="mt-5 font-display text-display-lg font-semibold text-text-primary text-balance sm:text-display-xl">
              Notes on running — and surviving — a hackathon in Jordan
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-body text-text-secondary text-pretty">
              A working resource for students, builders, organizers, and sponsors across the
              Jordanian hackathon ecosystem. Practical, specific, and written by people who run
              these events, not marketing copy.
            </p>
          </MotionReveal>
          <MotionReveal variants={fadeUpSm} delay={0.05} className="mx-auto mt-8 max-w-md">
            <div className="relative">
              <Search
                className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-text-tertiary"
                strokeWidth={1.75}
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search articles"
                aria-label="Search blog articles"
                className="h-11 w-full rounded-pill border border-border-strong bg-background-default ps-11 pe-4 text-body-sm text-text-primary placeholder:text-text-tertiary focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-tint"
              />
            </div>
          </MotionReveal>
          <MotionStagger className="mt-8 flex flex-wrap items-center justify-center gap-2" staggerDelay={0.04}>
            {categories.map((category) => (
              <MotionStaggerItem key={category}>
                <button
                  type="button"
                  onClick={() => setQuery(category)}
                  className="rounded-pill border border-border-default bg-background-sunken px-3 py-1.5 text-body-sm font-medium text-text-secondary transition-colors duration-[var(--motion-fast)] hover:text-text-primary"
                >
                  {category}
                </button>
              </MotionStaggerItem>
            ))}
          </MotionStagger>
        </div>
      </section>

      <MotionSection className="border-b border-border-default bg-background-sunken">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <MotionReveal variants={fadeUpSm}>
            <div className="overflow-hidden rounded-overlay border border-border-default bg-background-default shadow-overlay">
              <div className={`relative flex aspect-[21/9] flex-col justify-between p-6 sm:p-8 ${coverTone[0].wrapper}`}>
                <featured.icon
                  className={`absolute -bottom-10 -end-10 size-48 ${coverTone[0].icon}`}
                  strokeWidth={1.25}
                  aria-hidden="true"
                />
                <span className={`relative w-fit rounded-pill bg-background-default/10 px-3 py-1 text-label font-medium uppercase tracking-label ${coverTone[0].eyebrow}`}>
                  {featured.category}
                </span>
                <div className="relative">
                  <h2 className={`max-w-xl font-display text-display-lg font-semibold ${coverTone[0].mark}`}>
                    {featured.title}
                  </h2>
                </div>
              </div>
              <div className="p-6 sm:p-8">
                <p className="max-w-2xl text-body text-text-secondary text-pretty">{featured.excerpt}</p>
                <p className="mt-4 text-body-sm text-text-tertiary">Hackathonly Team · {featured.readTime}</p>
              </div>
            </div>
          </MotionReveal>
        </div>
      </MotionSection>

      <MotionSection className="border-b border-border-default bg-background-default">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          {normalizedQuery ? (
            <p className="mb-6 text-body-sm text-text-tertiary">
              {filteredPosts.length} result{filteredPosts.length === 1 ? "" : "s"} for &ldquo;{query}&rdquo;
            </p>
          ) : null}
          <MotionStagger
            key={normalizedQuery}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            staggerDelay={0.06}
          >
            {filteredPosts.map((post, index) => {
              const tone = coverTone[index % coverTone.length];
              return (
                <MotionStaggerItem key={post.title}>
                  <div className="flex h-full flex-col overflow-hidden rounded-card border border-border-default bg-background-default">
                    <div className={`relative flex aspect-video flex-col justify-between p-4 ${tone.wrapper}`}>
                      <post.icon
                        className={`absolute -bottom-6 -end-6 size-28 ${tone.icon}`}
                        strokeWidth={1.25}
                        aria-hidden="true"
                      />
                      <span className={`relative w-fit rounded-pill px-2.5 py-1 text-label font-medium uppercase tracking-label ${tone.eyebrow}`}>
                        {post.category}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="text-heading-sm font-semibold text-text-primary text-pretty">
                        {post.title}
                      </h3>
                      <p className="mt-2 text-body-sm text-text-secondary">{post.excerpt}</p>
                      <p className="mt-auto pt-4 text-body-sm text-text-tertiary">
                        Hackathonly Team · {post.readTime}
                      </p>
                    </div>
                  </div>
                </MotionStaggerItem>
              );
            })}
          </MotionStagger>
          {filteredPosts.length === 0 ? (
            <p className="py-10 text-center text-body-sm text-text-tertiary">
              No articles match &ldquo;{query}&rdquo; yet — try a different word or{" "}
              <button
                type="button"
                onClick={() => setQuery("")}
                className="font-medium text-text-primary underline underline-offset-2 hover:text-brand"
              >
                clear the search
              </button>
              .
            </p>
          ) : (
            <MotionReveal variants={fadeUpSm} delay={0.1} className="mt-10 text-center">
              <p className="text-body-sm text-text-tertiary">
                More on organizer playbooks, matching mechanics, and community stories —
                publishing through the season.
              </p>
            </MotionReveal>
          )}
        </div>
      </MotionSection>
    </div>
  );
}
