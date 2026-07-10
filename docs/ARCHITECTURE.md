# Hackathonly Jordan — System Architecture

> Source of truth: this `/docs` set. Repo was verified empty on 2026-07-10 — no stale files, no prior plans, no conflicting documents.

## 1. Product statement

Hackathonly Jordan is the event intelligence operating system for Jordanian hackathons. Participant wedge: privacy-first teammate matching for solo participants. Organizer value: one command center from registration to sponsor report. The real competitor is Google Forms + Excel + WhatsApp, not TAIKAI/Devpost.

## 2. Strategic review (honest CTO view)

**Is the direction strong?** Yes, with one correction. The two-sided framing (participant wedge → organizer B2B) is the right shape for Jordan: organizers pay (or at least adopt), participants supply the network effect. The privacy-first contact-reveal promise is genuinely differentiated — nobody in the region leads with it, and it maps to a real pain (students dumped into 200-person WhatsApp groups).

**Strongest wedge:** Not matching alone. The strongest wedge is **the organizer command center with QR check-in and instant reports**, because the buyer is the organizer and their pain (chaos, no attendance data, no sponsor report) is felt every single event. Matching is the participant-side hook that makes organizers say "our participants prefer this platform." Ship them together in the demo; sell the command center.

**Biggest risk:** Cold start + scope. A matching pool with 8 people produces bad matches; a 16-module platform half-built impresses nobody. Mitigation: the phased plan makes every phase demoable, and matching degrades gracefully (organizer-driven proposals work at any pool size).

**Too broad?** The *vision* is fine; the *V1* must be ruthless. Non-negotiable for V1: events, registration+consent, matching+reveal, command center, QR check-in, submissions, basic judging, report page. Delayed: sponsor portal, PDF/PPT export, Arabic i18n, mentor matching sophistication, AI (last, on top of clean data), talent graph UI (foundation tables only).

**What would I simplify?** Mentor requests V1 is a ticket queue, nothing more. Judging V1 is criteria + scores + a ranking table — no normalization curves, no multi-round. Sponsor reporting V1 is an organizer-generated page, no sponsor login.

**What would I strengthen?** Reports. A one-click, professional, Arabic-ready event report is the feature that makes a Jordanian university club or bank CSR team say "we need this" — it's what they show *their* boss. It should be first-class, not an afterthought.

**Commercial sellability in Jordan:** free for university clubs (distribution), paid for banks/telecom/NGO innovation events (Zain, Orange, Umniah, CPF, Injaz-style orgs). The sponsor impact report is the monetization lever — sponsors fund hackathons and currently get nothing measurable back.

## 3. Tech stack decision

Repo is empty, so the stack is ours to choose. **Verdict: the expected stack is correct.** 

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 15 App Router + TypeScript | SSR for public event pages (SEO), server actions for mutations, one deployable |
| Styling | Tailwind CSS v4 + shadcn/ui | Premium look fast; shadcn is owned code, not a dependency trap |
| Auth | Supabase Auth via `@supabase/ssr` | Email/password + Google OAuth; cookie-based SSR sessions |
| DB | Supabase Postgres + RLS | RLS is the privacy model's enforcement layer, not an add-on |
| Deploy | Vercel + Supabase cloud | Zero-ops, fine at Jordan-hackathon scale (hundreds/event, not millions) |
| AI (later) | Claude API server-side only | Never client-side; aggregated inputs only (see PRIVACY_MODEL.md) |

**Risks of this stack and mitigations:**
- *RLS complexity* — the #1 real risk. Mitigation: RLS_ACCESS_MATRIX.md is written before any migration; every policy has a matching test note; cross-user reads go through `security definer` RPCs with explicit checks, never wide policies.
- *Server actions sprawl* — mitigation: actions live in `src/actions/<domain>.ts`, thin wrappers around validated logic; anything transactional or privacy-critical (contact reveal, team finalization, check-in) is a Postgres function called via RPC so it's atomic and RLS-independent-but-audited.
- *Vendor lock-in (Supabase)* — acceptable trade; schema is plain Postgres, exit path exists.
- *Vercel serverless limits for exports* — reports are snapshot-based JSON + CSV streaming; PDF deferred (print CSS first). No long-running jobs needed in V1.

**Dependencies to add:** `zod` (all input validation), `@supabase/supabase-js` + `@supabase/ssr`, `lucide-react`, `qrcode` (server-side QR render), `html5-qrcode` or `@zxing/browser` (scanner), `date-fns`. **Avoid:** ORMs (Prisma/Drizzle duplicate what Supabase types + SQL give us and fight RLS), heavy state managers (Redux/Zustand — server components + forms suffice), tRPC (server actions cover it), any PDF lib in V1.

**Where logic lives (decision):**
- **Server actions** — all mutations initiated from UI (register, submit, score, request mentor).
- **Route handlers** — only for: auth callback, QR check-in scan endpoint, CSV export streaming, future webhooks.
- **Postgres functions (RPC)** — atomic/privacy-critical operations: `accept_proposal` (checks all-accepted → reveals contacts → creates team, one transaction), `check_in_participant`, `finalize_report_snapshot`, aggregate stat functions for dashboards.
- **Matching logic** — hybrid: SQL does candidate filtering (same event, opted in, not teamed), TypeScript does scoring/team assembly in a server action (easier to iterate, test, and explain). Proposals persist to DB; humans (organizer or participants) confirm. Matching is never auto-final.

## 4. Product layers

| Layer | Users | Purpose | V1 scope | Privacy risk |
|---|---|---|---|---|
| Public site | Anonymous | Discover events, trust-building, register CTA | Full: landing, events list, event page, privacy/terms | None — public data only |
| Participant app | Participants | Profile, register, match, team, submit, mentor help | Full | Contact exposure — mitigated by reveal gating |
| Organizer command center | Organizers | Run the event end-to-end | Full (lean per module) | Highest data access — scoped to own org's events, audited |
| Judge app | Judges | Score assigned submissions | Lean: assignment list + score form | Sees submissions only, never participant contacts |
| Mentor app | Mentors | Claim/resolve requests | Lean: request queue | Sees request + team name only |
| Sponsor/report layer | Organizers (V1), sponsors (V2 portal) | Impact proof | Organizer-generated report page + export | Aggregates + opt-in talent only |
| Talent graph | Participants (opt-in), organizers | Long-term moat | Foundation tables + opt-in flow + organizer talent table; no public talent site |
| Platform admin | Us | Org verification, support | Minimal: SQL/Supabase Studio + `platform_admins` table; no admin UI in V1 |
| AI ops intelligence | Organizers | Summaries, report drafts | Phase 13 — after data flows exist | Must never see raw PII — see PRIVACY_MODEL.md |

## 5. High-level system diagram

```
Browser (participant / organizer / judge / mentor)
   │  RSC + server actions + route handlers
   ▼
Next.js on Vercel ──── Claude API (Phase 13, aggregated data only)
   │
   ├─ @supabase/ssr (user-context client → RLS enforced)
   └─ service-role client (server-only: exports, AI aggregation, admin) — every use audited
   ▼
Supabase: Auth │ Postgres (RLS + RPC functions) │ Storage (avatars, event covers, slides)
```

Two Supabase clients, strict rule: the **user client** (anon key + session) is default everywhere; the **service client** is allowed only inside a small `src/lib/supabase/admin.ts` used by named, reviewed functions (CSV export, AI aggregation, report snapshot), each of which writes an `audit_logs` row.

## 6. Module architectures (summary — details in DATABASE.md / ROUTES.md)

- **Auth:** Supabase email+password and Google OAuth. On first login, a trigger creates `profiles` row. Middleware refreshes session; layout-level guards per role area.
- **Registration/consent:** `hackathon_applications` + append-only `consent_records` (versioned consent text). Denormalized boolean flags on the application row for cheap RLS checks; `consent_records` is the legal source of truth.
- **Matching:** opt-in pool → organizer clicks "generate proposals" (or auto-suggest) → server action scores candidates (role coverage, skill complement, experience balance, university mix) → `team_proposals` + members with `pending` status → each member accepts/declines → all-accept triggers `accept_proposal` RPC: creates `teams`, `team_members`, `contact_reveals` rows atomically. Contact info is *only* readable through the reveal path.
- **QR check-in:** each application gets a random `check_in_token` (UUID, not guessable, not the user id). Organizer scanner page reads QR → server action validates token belongs to this event → inserts `check_ins` row (idempotent). Manual fallback: search by name/email. No hardware, no badge printing in V1.
- **Submissions:** one submission per team per hackathon (draft → submitted). Team members edit; organizers read all; judges read assigned only.
- **Judging:** organizer defines `judging_criteria` (name, weight, max score); assigns judges to submissions (`judge_assignments`); judges score per criterion + comment; ranking view = weighted totals. Humans decide winners; organizer marks winners explicitly.
- **Mentor requests:** team creates request (category, description) → status open/assigned/resolved → mentor or organizer claims → dashboard shows category bottlenecks.
- **Reports:** `report_snapshots` (JSONB, typed builder) — final report and sponsor report are two snapshot kinds. Regenerable; rendered as a clean print-friendly page; CSV exports stream per dataset. Sponsor snapshot contains aggregates + opt-in talent only, enforced at builder level and reviewed.
- **Talent graph:** `talent_opt_ins` (per-user, revocable, versioned via consent_records) + history views derived from applications/teams/submissions/awards. No scoring, no negative labels — enforced by simply never storing such fields.
- **AI:** server-only summary generation over pre-aggregated JSON (counts, distributions, statuses — no names, no contacts). Results cached in `ai_summaries` with input hash. Feature-flagged; every AI card has a non-AI numeric fallback. See PRIVACY_MODEL.md §AI.
- **Audit:** `audit_logs` written by RPCs and service-role paths for: contact reveals, exports, consent changes, check-ins, winner marking, talent data access.

## 7. Deployment & environments

- `main` → Vercel production; PR previews auto. One Supabase project for dev, one for prod (create prod at Phase 6+). Migrations via Supabase CLI (`supabase/migrations/*.sql`), applied only after explicit approval per §clean-repo rules.
- Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server only), `ANTHROPIC_API_KEY` (Phase 13), `NEXT_PUBLIC_SITE_URL`.

## 8. Naming rule (binding)

`profiles.id` references `auth.users(id)` — the only place. Everywhere else (FKs, function params, RPC args, TS variables): `user_id`. The string `profile_id` must not appear in the repo. Verdict: this rule creates **no technical problems** — it's the convention I'd pick anyway; a CI grep guard will enforce it.

## 9. Data flows

See DATABASE.md §Data flows for the 16 numbered flows (signup → AI summary).

## 10. Design direction

See COMPONENTS.md §Design system. Short version: TAIKAI-inspired structure (hero → timeline → tracks → prizes → CTA), but our own identity — dark-ink editorial base, one confident accent, generous whitespace, real typography (e.g., a strong grotesque + Arabic-ready companion like IBM Plex Sans Arabic for later), status badges and metric cards as the visual signature of the "command center" feel. Premium ≠ gradients everywhere; premium = hierarchy, density control, and consistent components.
