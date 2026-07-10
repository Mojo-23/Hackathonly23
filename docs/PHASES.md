# Hackathonly Jordan — Phased Implementation Roadmap

Rules: every phase ends demoable; migrations per phase, applied only after approval; RLS work ships with the tables it protects, never later; every phase's DoD includes the access-matrix spot-check and `git grep profile_id` returning nothing.

## Phase 1 — Docs & source of truth ✅ (this commit)
Goal: architecture agreed before code. DoD: user approves docs, stack, and decisions D1–D16.

## Phase 2 — Foundation & design skeleton
- **Features:** Next.js 15 + TS + Tailwind v4 + shadcn init; design tokens (type, color, status palette, dark mode); `AppShell`, `SiteHeader/Footer`, `StatusBadge`, `MetricCard`, `EmptyState`, skeletons/error states; landing page + `/events` + `/events/[slug]` on typed mock data; `/privacy`, `/terms` v1 text.
- **Tables:** none. **RLS:** none. **Risk:** over-designing — timebox the design system to the token set + 6 primitives.
- **DoD:** deployed to Vercel; landing + event page look premium on mobile and desktop; mock data shaped exactly like future DB types.

## Phase 3 — Auth, profiles, organizations
- **Features:** Supabase project; email+Google auth via `@supabase/ssr`; middleware + role-group layouts; onboarding flow; `/profile`; org creation + members; generated DB types.
- **Tables:** `profiles` (+ signup trigger), `organizations`, `organization_members`, `platform_admins`, `consent_records` (terms consent recorded at signup), `audit_logs` (skeleton + helper).
- **RLS:** profiles self-only; `public_profile` view; org policies; helper fns (`is_platform_admin`, etc.).
- **Testing:** two test users + one org; verify cross-user profile SELECT fails.
- **Risk:** auth edge cases (email confirm, OAuth callback) — build with both providers from the start.

## Phase 4 — Hackathons, registration, consent
- **Features:** organizer event wizard (`/organizer/events/new`), publish flow; real `/events` + `/events/[slug]`; registration with `ConsentCheckboxGroup`; `/my-events`; participants table + status management; seed script: Jordan AI Builders Hackathon, 6 tracks, 10 universities, ~40 fake participants.
- **Tables:** `hackathons`, `hackathon_tracks`, `hackathon_applications`; `record_consent` RPC.
- **RLS:** public read published; organizer manage own; applicant self CRUD with consent guard.
- **DoD:** end-to-end: create event → publish → register with consents → appears in organizer table → status change → consent records verifiable.
- **Risk:** consent UX friction — one screen, clear language, optional unchecked.

## Phase 5 — Matching, proposals, contact reveal (the signature phase)
- **Features:** matching preferences + pool opt-in; pool view (privacy-safe cards); organizer generate-proposals action (TS scoring: role coverage, skill complement, experience balance, university mix) + manual proposal builder; proposal accept/decline with progress + expiry; `respond_to_proposal` RPC (atomic reveal + team creation); `ContactRevealPanel`; **pre-formed team path** (create/join by invite code, reveal on join); team pages.
- **Tables:** `matching_preferences`, `team_proposals`, `team_proposal_members`, `teams`, `team_members`, `contact_reveals`; `matching_pool` view.
- **RLS:** the hardest of the project — pool view scoping, member-only proposal access, reveal-gated contact RPC. Full matrix test with 4 test users.
- **DoD:** demo: 4 solo users register → pool → proposal → 4 accepts → contacts revealed → team exists; decline path releases silently; invite-code team also reveals correctly.
- **Risk:** scoring quality with tiny pools — organizer manual builder is the fallback; state-machine bugs — RPC owns all transitions, no client writes.

## Phase 6 — Organizer command center v1
- **Features:** `/organizer/events/[eventId]` metrics grid (registrations, accepted, pool, proposals pending/approved, teams) via aggregate RPCs; warnings feed v1; event subnav; create prod Supabase project.
- **Tables:** none new (aggregate functions). **DoD:** numbers update live-ish (revalidate on action); warnings fire on seeded conditions.

## Phase 7 — QR check-in
- **Features:** participant `MyEventQr`; organizer scanner page (camera) + manual search; `check_in_participant` RPC; attendance metrics + no-show warning on command center.
- **Tables:** `check_ins`.
- **Testing:** scan phone-to-laptop for real; duplicate scan idempotent; token from another event rejected.
- **Risk:** camera permissions/browser quirks — manual fallback is first-class, not an afterthought.

## Phase 8 — Submissions
- **Features:** team submission form (autosave draft, completeness meter, AI disclosure), submit + deadline lock; organizer submissions table; command-center counts.
- **Tables:** `submissions` (+ storage bucket for slides if needed).
- **DoD:** member submits; non-member blocked (RLS test); organizer sees completeness.

## Phase 9 — Judging
- **Features:** criteria editor (weights), judge invites (`event_roles`), assignments, judge app (list + score form), progress view, ranking table, mark winners (audited).
- **Tables:** `event_roles`, `judging_criteria`, `judge_assignments`, `judge_scores`.
- **RLS:** judge sees assigned only — matrix-test with a judge account.
- **DoD:** 2 judges score 3 submissions → ranking correct vs hand-computed → winners marked.

## Phase 10 — Mentor requests
- **Features:** team request form; mentor queue (claim/resolve); organizer bottleneck view; command-center count + warning.
- **Tables:** `mentor_requests` (event_roles already exists).
- **DoD:** open → assigned → resolved lifecycle; mentor sees no contacts.

## Phase 11 — Final reports & exports
- **Features:** report snapshot builder (all aggregates: registrations, check-ins/no-shows, teams, submissions, universities, roles, tracks, mentor summary, judging summary, winners); print-friendly report page; snapshot history; CSV exports hub (registrations, check-ins, teams, submissions, scores) as streamed handlers, audited.
- **Tables:** `report_snapshots`.
- **DoD:** one click → complete professional report; browser-print produces a clean document; CSVs open correctly in Excel (UTF-8 BOM for Arabic names!).

## Phase 12 — Sponsor report & talent foundation
- **Features:** sponsor snapshot builder (aggregates + opt-in talent summary only — PII-free output type); sponsor report page; talent opt-in flow on `/profile` + per-event sponsor-share consent surfaced; organizer talent table (consented rows, consent-source column) + audited export; optional tokenized share link.
- **Tables:** `talent_opt_ins` (+ history views).
- **DoD:** non-consented user provably absent from talent table and export; sponsor report contains zero PII.

## Phase 13 — AI operational intelligence
- **Features:** `EventAggregates` builder (reuses Phase 6/11 RPCs); prompt builder (typed, PII-impossible); Claude API integration server-side; `AiSummaryCard` on command center (event status, missing roles, mentor bottlenecks, judging progress); AI report draft panel (organizer edits before save); caching by input hash; `AI_ENABLED` flag + numeric fallbacks.
- **Tables:** `ai_summaries`.
- **DoD:** summaries accurate against seeded data; flag off → platform fully functional; prompt inspection shows no PII.

## Phase 14 — Polish & demo readiness
- **Features:** landing polish + `/organizers` pitch page; empty/loading/error audit; mobile pass (check-in + participant flows especially); dark-mode audit; seed a full realistic demo event (10 universities, 60 participants, 12 teams, 10 submissions, scored, winners, reports generated); demo script; performance pass (indexes verified against query plans); security pass (full access matrix re-run, service-role usage audit).
- **DoD:** a 7-minute demo tells the whole story: register → match → reveal → check in → submit → judge → report → sponsor report → AI summary.

## Sequencing notes
- Phases 7–10 are largely independent after 6; they can be reordered for demo deadlines (e.g., pull 11 earlier if a pitch needs reports).
- Cut line for a minimal credible demo: Phases 2–8 + a hand-built report page. Everything after strengthens; nothing before is skippable.
