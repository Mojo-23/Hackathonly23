# Hackathonly Jordan — Component & Design Architecture

## 1. Design system direction

> **Visual source of truth: `docs/DESIGN_SYSTEM.md` (Sandstone Editorial, decision D18).** This file covers component *architecture* (inventory, code organization, data rules); all visual rules — colors, typography, spacing, radii, shadows, motion, anti-slop doctrine, page direction — live in `DESIGN_SYSTEM.md` and win over anything here if they ever conflict.

**Identity:** "Event intelligence" — a serious operations tool with a warm public face. Two registers, one system (defined in `DESIGN_SYSTEM.md` §A):
- **Public/participant register:** editorial, spacious, confident. Display type, real hierarchy, event pages following the information contract (cover band → facts strip → tracks → timeline → prizes/rules → CTA).
- **Organizer/judge/mentor register:** command-center density. Metric cards, status badges, live tables, warnings feed — calm, ink-and-stone, numbers-forward.

**Token summary (full specification and normative rules in `DESIGN_SYSTEM.md` §§D–G):**
- Ground: pure white (`#FFFFFF`); ink text (`#191714`); one Petra-clay accent (`#A03D21`) under the ≤3-per-screen rationing law; warm-stone neutrals. **Light-only in V1** — no dark mode (the organizer scanner screen may later be locally dark-styled; that is a per-screen style, not a theme). This supersedes the earlier warm-paper/dark-mode guidance that previously lived here.
- Type: General Sans (display, marketing surfaces only) + Inter (everything in-app), self-hosted; IBM Plex Sans Arabic reserved for i18n. Tabular numerals mandatory wherever data lives.
- Semantic status palette used everywhere via the single `StatusBadge` component: pending / accepted / declined / open / resolved / live / completed — this consistency is what makes it feel like one system.
- Closed sets: five radii (6/8/10/14/999), two shadows, 4px spacing scale, three text weights. 1px borders over shadows. No gradients, no glassmorphism, no illustration.

**Stack:** Tailwind v4 + shadcn/ui as the base primitives (button, dialog, table, form, toast, tabs, badge, command), wrapped in our own domain components below. shadcn code is owned and restyled to `DESIGN_SYSTEM.md`'s tokens — it will not look like default shadcn.

## 2. Component inventory (by domain)

### Layout & navigation
`SiteHeader`, `SiteFooter`, `AppShell` (sidebar + topbar for role areas), `RoleSidebar` (organizer/judge/mentor variants), `EventSubnav` (tabs across command-center pages), `Breadcrumbs`, `UserMenu`.

### Shared primitives
`StatusBadge` (single source of all statuses), `MetricCard` (value, label, delta, warning state), `DataTable` (sortable, filterable, server-paginated; used by participants/submissions/talent/scores), `EmptyState` (icon, message, CTA — every list has one), `LoadingSkeleton` variants, `ErrorState` (retry), `ConfirmDialog`, `CopyField`, `SectionHeader`, `Stepper` (wizards), `TimelineList`.

### Landing
`Hero` (wedge headline), `HowMatchingWorks` (3-step privacy story), `EventGrid`, `OrganizerPitchSection`, `TrustStrip` (privacy promises), `UniversityLogosRow` (seed-data credibility).

### Events
`EventCard` (system-generated typographic cover per `DESIGN_SYSTEM.md` §C/§H — never dependent on organizer uploads; org, date, mode badge, registration status, fixed anatomy), `EventHero` (system cover band + title lockup), `EventFactsStrip` (date/location/mode/team size), `TrackCard`, `PrizeList`, `RulesSection` (markdown), `EventTimeline`, `RegistrationCTA` (state-aware: open/closed/registered; sticky-bottom on mobile), `PrivacyNote`.

### Profile & registration
`ProfileForm` (sectioned: identity, education, skills, links), `SkillsInput` (tag input w/ suggestions), `RoleSelect`, `ConsentCheckboxGroup` (mandatory vs optional visually distinct, links to versioned text), `ConsentHistoryList`, `TalentOptInPanel` (explains exactly what's shared), `RegistrationWizard` (solo vs pre-formed team fork), `TeamInviteCodePanel`.

### Matching
`MatchingPreferencesForm`, `PoolCard` (privacy-safe: display name, role chip, skills, experience, university — deliberately **no** photo-of-contact-info), `PoolGrid` w/ filters, `ProposalCard` (members, roles, rationale, expiry countdown), `ProposalResponseBar` (accept/decline + status of others as "2 of 4 accepted", never who declined), `ContactRevealPanel` (locked → revealed states; the product's signature moment — make the unlock feel earned), `MatchRationale` (why these people: role coverage viz).

### Organizer command center
`CommandCenterGrid` (metric cards), `WarningsFeed` (rule-based alerts: "12 accepted not checked in", "Track X has 0 submissions", "3 judges behind"), `ParticipantsTable` (+ consent flag column, status actions), `MatchingControlPanel` (pool stats, generate button, proposal monitor), `ManualProposalBuilder` (drag pool members into a draft team), `LiveCounter` (check-in day).

### Check-in
`QrScanner` (camera view + result toast, keeps scanning), `ManualCheckInSearch`, `MyEventQr` (participant's QR w/ brightness hint), `AttendanceStats`.

### Submissions & judging
`SubmissionForm` (sectioned, autosave draft, completeness meter), `SubmissionCard/Detail`, `AiDisclosureField`, `CriteriaEditor` (weights sum validation), `JudgeAssignmentTable`, `ScoreForm` (per-criterion sliders/inputs + comment), `JudgingProgress` (per-judge, per-submission heat), `RankingTable` (weighted totals), `WinnerMarker`.

### Mentors
`MentorRequestForm` (category select + description), `MentorRequestCard` (status, category badge, claim/resolve actions), `BottleneckChart` (requests by category).

### Reports & talent
`ReportSection` (title + content blocks, print-friendly), `ReportCoverPage`, `StatBlock`, `DistributionChart` (universities, roles, tracks — follow dataviz skill when built), `WinnersShowcase`, `SponsorImpactSummary`, `TalentTable` (consented rows only, consent-source column), `ExportButton` (dataset + row-count preview + audit notice), `SnapshotHistoryList`.

### AI (Phase 13)
`AiSummaryCard` (labeled "AI-generated", regenerate button, fallback to plain stats when disabled), `ReportDraftPanel` (AI draft → organizer edits → save).

## 3. Component rules

1. Domain components live in `src/components/<domain>/`; primitives in `src/components/ui/`.
2. Server components by default; `"use client"` only for interactivity (scanner, forms, tables with client filtering).
3. No component fetches its own data — pages fetch, components render (props typed from generated Supabase types).
4. Every async page has `loading.tsx` (skeletons) and `error.tsx`.
5. All statuses render through `StatusBadge` — no ad-hoc colored spans.
6. Privacy-sensitive components (`PoolCard`, `ContactRevealPanel`, `TalentTable`) take *already-filtered* data and additionally never accept email/phone props unless the reveal type is present — typed so misuse fails compilation (`RevealedContact` type only produced by the reveal RPC wrapper).
