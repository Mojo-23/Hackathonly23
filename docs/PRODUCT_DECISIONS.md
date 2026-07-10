# Hackathonly Jordan — Product Decisions Log

Decisions made at architecture time. Each is binding until explicitly revisited.

## D1 — Hybrid team formation: matching-first + pre-formed team registration (build both in Phase 5)
The brief's matching-first flow is the core. But **most Jordanian hackathon teams arrive pre-formed** (friends from the same university/club). An organizer whose platform can't register an existing 4-person team will reject the whole product on day one. So: registration forks into (a) solo → optional matching pool, (b) create team + invite code / join by code. Privacy holds: joining by code is an explicit mutual action, so contact reveal among members is consistent with the core promise. This is not an open marketplace — there is no browsing of people outside the opt-in pool, no cold-DM, no public contact info, so WhatsApp chaos is avoided. Build now, not later: it's ~15% extra work in Phase 5 and removes the biggest organizer objection.

## D2 — Versioned `consent_records` over boolean columns
Adopted (rationale in PRIVACY_MODEL.md §3). Booleans remain as denormalized cache only, writable solely through the consent RPC.

## D3 — No sponsor portal in V1
Organizer-generated sponsor report (page + export; optional tokenized share link). A portal is a new auth role, RLS surface, and onboarding cost for ~2–5 users/event whose need is met by a good report. Revisit when a paying sponsor demands self-serve. (Full rationale in ROUTES.md.)

## D4 — Matching logic: SQL filters candidates, TypeScript scores and assembles
Matching quality will need rapid iteration (weights, constraints, explanations). TS in a server action is testable and debuggable; SQL keeps the candidate set correct and cheap. Proposals always persist and require human acceptance — the algorithm proposes, people decide.

## D5 — Privacy-critical operations are Postgres RPCs, not server actions with multiple queries
`respond_to_proposal` (reveal), `check_in_participant`, `record_consent`, `get_revealed_contacts`. Reason: atomicity (reveal must be all-or-nothing), single audited choke point, immune to app-layer bugs bypassing checks.

## D6 — `event_roles` table instead of separate `judges` table
One per-event role table covers judges and mentors; less schema, same RLS pattern. Split only if judge metadata grows (bio, expertise areas for auto-assignment).

## D7 — Reports are JSONB snapshots, rendered as print-friendly pages; PDF deferred
Snapshot = reproducible, versioned, fast to render, and the print stylesheet gets us "PDF" via browser print for the demo. Real PDF/PPT export is a polish-phase add (likely serverless-rendered from the same snapshot). CSV exports are streamed route handlers from day one — organizers live in Excel; meet them there.

## D8 — Talent graph V1 = opt-in flow + consented organizer table + history views. No talent product yet
The moat is the accumulated, consented history. Store it correctly now (opt-ins, consents, derivable history views); build the search/browse product when there's data worth browsing. Building a talent UI over 40 profiles would look dead.

## D9 — AI is Phase 13, strictly after core data flows
AI summaries of empty tables are demos of nothing. Build the aggregates first (they're needed for the command center anyway); AI then narrates real numbers. Provider: Claude API, server-side, aggregated inputs only (PRIVACY_MODEL.md §7). Every AI card has a non-AI fallback so the platform is complete with `AI_ENABLED=false`.

## D10 — No platform admin UI in V1
`platform_admins` table + Supabase Studio. Org verification is a manual SQL update at current scale. Honest cost/benefit.

## D11 — Anonymous decline
Proposal members never see who declined. Small-market social dynamics (Jordan's tech scene is a village) make "X rejected you" actively harmful. Shown as "this proposal didn't complete."

## D12 — Check-in QR encodes a random token, not user identity
`check_in_token` is an opaque UUID per application. No PII in the QR, screenshot-shareable risk mitigated by single-use-per-event idempotency + organizer sees name/photo on scan for visual confirmation.

## D13 — English-first, Arabic-ready
UI copy in English for V1 (Jordan tech audience operates in English); fonts, layout (no hardcoded left/right — use logical CSS properties), and string structure chosen so Arabic/RTL is an i18n pass, not a redesign. Arabic report export is a strong early V2 item — sponsor/management reports in Arabic are a differentiator for banks/gov.

## D14 — One submission per team, editable until deadline, autosaved drafts
Prevents the "we emailed you a newer version" chaos. Late-submission grace is an organizer toggle later, not V1.

## D15 — Winners marked by humans, explicitly
`is_winner`/`winner_rank`/`winner_label` set by organizer action (audited). Ranking table informs; it never auto-crowns. Rejected forever: AI winner selection, public participant scoring, reliability rankings, negative labels (schema deliberately cannot store them).

## D16 — Naming rule accepted
`user_id` everywhere; `profiles.id` the sole exception. No technical objection; CI grep (`git grep profile_id` must return nothing) added to the checklist from Phase 3 onward.

## D17 — Identity creation path: trigger-created profile, onboarding-created contacts
Canonical account creation is hybrid. A Phase 3 signup trigger creates the minimal `profiles` row immediately when `auth.users` receives a new user, with `profiles.id = auth.uid()` and `full_name` populated from trusted auth metadata (`full_name`, then `name`) or the neutral placeholder `New participant` when metadata is absent. Onboarding must collect the real display name before event registration or matching. `user_contacts` is not trigger-created; onboarding inserts or updates the user's own contact row through the existing self-owned policy, and private contact data remains only in `user_contacts`. The current `profiles_insert_own` policy is scaffolding from `PHASE3C-001`, kept only until the signup trigger is implemented and verified; a later separately approved RLS migration should remove or tighten direct profile inserts. Next task: `PHASE3D-001` should implement the `auth.users` signup trigger described here and keep onboarding responsible for contact-row creation.

## Ideas proposed (mine), with build-now/later verdicts

**Build in V1 (cheap, high-leverage):**
- **Warnings feed** on the command center (rule-based: no-show spike, empty tracks, judge lag, mentor bottlenecks) — this is "event intelligence" made visible without AI. (Phase 6, extended each later phase.)
- **"2 of 4 accepted" proposal progress + expiry countdown** — urgency mechanics that make matching actually converge during a 48h event.
- **Completeness meter on submissions** — reduces the #1 judging pain: half-empty submissions.
- **Consent-source column in talent table** — makes the privacy story visible to organizers (trust as UI).

**Build soon after (V1.5):**
- **Post-event participant recap page** ("your hackathon record": team, project, result, shareable card) — this is what makes students share the platform; every shared card is acquisition.
- **Certificates of participation** (generated from check-in + submission data) — organizers are constantly asked for these; near-zero marginal cost once report data exists.
- **Organizer event templates** ("clone last event") — the retention feature for repeat organizers.

**Later (V2+):**
- Arabic report exports; sponsor share-link portal; multi-event org analytics (semester dashboards for universities); mentor expertise matching; team chat (only if WhatsApp displacement proves needed — likely not); alumni talent search for sponsors (needs density); public org profile pages as sales channel.

**Business model sketch:** free for student/university club events (≤100 participants) → paid per-event tier for corporate/NGO (command center + reports + talent export) → later, sponsor-side talent access as the premium SKU. The report is the artifact organizers forward upward; price against "what did the agency/intern cost you last time."
