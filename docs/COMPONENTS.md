# Hackathonly Jordan — Component & Design Architecture

## 1. Design system direction

**Identity:** "Event intelligence" — the product should feel like a serious operations tool with a warm public face. Two moods, one system:
- **Public/participant surface:** editorial, spacious, confident. Big type, real hierarchy, event pages structured like TAIKAI's (hero → key facts strip → timeline → tracks → prizes → rules → CTA) but visually our own.
- **Organizer/judge/mentor surface:** command-center density. Metric cards, status badges, live tables, warning feed. This is where "premium tool" is proven.

**Tokens:**
- Type: Geist or Inter for Latin; pick an Arabic-compatible companion now (IBM Plex Sans Arabic) so the i18n phase doesn't force a redesign. Strong scale contrast (display 3rem+ vs 0.8125rem table text).
- Color: near-black ink base (`#0A0A0B` range), warm off-white paper, **one** accent (recommended: a deep desert-amber or Jordan-flag-adjacent crimson used sparingly — status colors do the rest). Dark mode for organizer surfaces from day one (event-day check-in happens in dim halls).
- Semantic status palette used everywhere: pending / accepted / declined / open / resolved / live / completed — same badge component across all modules; this consistency is what makes it feel like one system.
- Radius small (6–8px), 1px borders over shadows, generous whitespace on public pages, tight 8px grid on dashboards. No gradient soup, no glassmorphism — that's what "AI-generated-looking" means.

**Stack:** Tailwind v4 + shadcn/ui as the base primitives (button, dialog, table, form, toast, tabs, badge, command), wrapped in our own domain components below. shadcn code is owned and restyled to our tokens — it will not look like default shadcn.

## 2. Component inventory (by domain)

### Layout & navigation
`SiteHeader`, `SiteFooter`, `AppShell` (sidebar + topbar for role areas), `RoleSidebar` (organizer/judge/mentor variants), `EventSubnav` (tabs across command-center pages), `Breadcrumbs`, `UserMenu`.

### Shared primitives
`StatusBadge` (single source of all statuses), `MetricCard` (value, label, delta, warning state), `DataTable` (sortable, filterable, server-paginated; used by participants/submissions/talent/scores), `EmptyState` (icon, message, CTA — every list has one), `LoadingSkeleton` variants, `ErrorState` (retry), `ConfirmDialog`, `CopyField`, `SectionHeader`, `Stepper` (wizards), `TimelineList`.

### Landing
`Hero` (wedge headline), `HowMatchingWorks` (3-step privacy story), `EventGrid`, `OrganizerPitchSection`, `TrustStrip` (privacy promises), `UniversityLogosRow` (seed-data credibility).

### Events
`EventCard` (cover, org, date, mode badge, registration status), `EventHero`, `EventFactsStrip` (date/location/mode/team size), `TrackCard`, `PrizeList`, `RulesSection` (markdown), `EventTimeline`, `RegistrationCTA` (state-aware: open/closed/registered), `PrivacyNote`.

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
