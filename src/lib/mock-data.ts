import type {
  CommandCenterMetrics,
  CommandCenterWarning,
  Hackathon,
  ParticipantRegistration,
  ProposalSummary,
} from "@/types/domain";

export const hackathons: Hackathon[] = [
  {
    id: "hk_1",
    slug: "jordan-ai-builders-hackathon",
    title: "Jordan AI Builders Hackathon",
    organizerName: "42 Amman",
    description:
      "A 48-hour in-person build sprint for students and early-career builders across Jordan, focused on shipping working AI products across six tracks.",
    theme: "AI for Jordan",
    locationName: "42 Amman Campus",
    city: "Amman",
    mode: "in_person",
    startsAt: "2026-09-11T09:00:00+03:00",
    endsAt: "2026-09-13T18:00:00+03:00",
    registrationClosesAt: "2026-09-05T23:59:00+03:00",
    teamSizeMin: 2,
    teamSizeMax: 5,
    rulesMd:
      "Teams of 2-5. All code must be written during the event window. AI usage must be disclosed at submission. One submission per team.",
    prizes: ["1st place — 1,500 JOD", "2nd place — 800 JOD", "3rd place — 400 JOD", "Best Sponsor Track — 300 JOD"],
    timeline: [
      { label: "Registration opens", at: "2026-08-01" },
      { label: "Registration closes", at: "2026-09-05" },
      { label: "Opening ceremony", at: "2026-09-11 09:00" },
      { label: "Submission deadline", at: "2026-09-13 15:00" },
      { label: "Judging & awards", at: "2026-09-13 17:00" },
    ],
    coverGradient: "from-amber-800 via-amber-700 to-stone-900",
    status: "registration_open",
    matchingEnabled: true,
    tracks: [
      { id: "t1", name: "AI for Education", description: "Tools that help students and teachers." },
      { id: "t2", name: "Fintech", description: "Payments, lending, and financial inclusion." },
      { id: "t3", name: "Tourism Tech", description: "Discovery and experience tools for visitors to Jordan." },
      { id: "t4", name: "Health Tech", description: "Access, triage, and care coordination." },
      { id: "t5", name: "GovTech", description: "Public service delivery and transparency." },
      { id: "t6", name: "Sustainability", description: "Water, energy, and climate resilience." },
    ],
  },
  {
    id: "hk_2",
    slug: "usj-fintech-sprint",
    title: "University of Jordan Fintech Sprint",
    organizerName: "University of Jordan — Business Club",
    description: "A one-day campus hackathon exploring financial inclusion products for underbanked communities.",
    theme: "Fintech",
    locationName: "UJ Business School",
    city: "Amman",
    mode: "in_person",
    startsAt: "2026-08-20T09:00:00+03:00",
    endsAt: "2026-08-20T20:00:00+03:00",
    registrationClosesAt: "2026-08-15T23:59:00+03:00",
    teamSizeMin: 2,
    teamSizeMax: 4,
    rulesMd: "Teams of 2-4, current UJ students only.",
    prizes: ["1st place — 500 JOD", "2nd place — 250 JOD"],
    timeline: [
      { label: "Registration opens", at: "2026-08-01" },
      { label: "Event day", at: "2026-08-20" },
    ],
    coverGradient: "from-stone-800 via-stone-700 to-neutral-900",
    status: "registration_open",
    matchingEnabled: true,
    tracks: [
      { id: "t1", name: "Inclusion", description: "Products for underbanked communities." },
      { id: "t2", name: "SME Tools", description: "Tools for small business owners." },
    ],
  },
  {
    id: "hk_3",
    slug: "psut-hardware-hack",
    title: "PSUT Hardware & IoT Hack",
    organizerName: "Princess Sumaya University for Technology",
    description: "A hybrid hackathon pairing embedded systems with sustainability challenges.",
    theme: "Sustainability",
    locationName: "PSUT Engineering Labs",
    city: "Amman",
    mode: "hybrid",
    startsAt: "2026-10-02T09:00:00+03:00",
    endsAt: "2026-10-03T18:00:00+03:00",
    registrationClosesAt: "2026-09-25T23:59:00+03:00",
    teamSizeMin: 2,
    teamSizeMax: 5,
    rulesMd: "Teams of 2-5. Hardware kits provided on-site; remote teams may submit simulation-based entries.",
    prizes: ["1st place — 1,000 JOD", "Best Hardware Build — 400 JOD"],
    timeline: [
      { label: "Registration opens", at: "2026-08-15" },
      { label: "Registration closes", at: "2026-09-25" },
      { label: "Event", at: "2026-10-02" },
    ],
    coverGradient: "from-emerald-900 via-stone-800 to-neutral-900",
    status: "published",
    matchingEnabled: true,
    tracks: [
      { id: "t1", name: "Water Systems", description: "Monitoring and conservation." },
      { id: "t2", name: "Energy", description: "Efficiency and renewable integration." },
    ],
  },
];

export function getHackathonBySlug(slug: string): Hackathon | undefined {
  return hackathons.find((h) => h.slug === slug);
}

export const myRegistrations: ParticipantRegistration[] = [
  {
    hackathonSlug: "jordan-ai-builders-hackathon",
    hackathonTitle: "Jordan AI Builders Hackathon",
    status: "accepted",
    wantsMatching: true,
    nextAction: "Respond to your team proposal",
  },
  {
    hackathonSlug: "usj-fintech-sprint",
    hackathonTitle: "University of Jordan Fintech Sprint",
    status: "pending",
    wantsMatching: false,
    nextAction: "Waiting on organizer confirmation",
  },
];

export const myProposals: ProposalSummary[] = [
  {
    id: "prop_1",
    hackathonTitle: "Jordan AI Builders Hackathon",
    membersAccepted: 2,
    membersTotal: 4,
    expiresInHours: 19,
  },
];

export const commandCenterMetrics: CommandCenterMetrics = {
  registrations: 138,
  accepted: 121,
  checkedIn: 0,
  noShows: 0,
  matchingPoolSize: 54,
  proposalsPending: 6,
  proposalsApproved: 11,
  teamsFormed: 17,
  submissionsCount: 0,
  judgingProgressPct: 0,
  openMentorRequests: 0,
  sponsorOptInCount: 42,
};

export const commandCenterWarnings: CommandCenterWarning[] = [
  { id: "w1", severity: "warning", message: "6 proposals expire within 24 hours — nudge participants to respond." },
  { id: "w2", severity: "info", message: "GovTech track has only 3 registrants opted into matching so far." },
  { id: "w3", severity: "danger", message: "17 accepted participants have not completed their profile." },
];
