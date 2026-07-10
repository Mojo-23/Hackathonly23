# Hackathonly Jordan — Database Architecture

Postgres (Supabase). All tables in `public` schema, RLS enabled on every table (deny by default). Naming rule: `profiles.id` = `auth.users(id)`; every other reference is `user_id`. `profile_id` never appears.

Conventions: `id uuid primary key default gen_random_uuid()`, `created_at timestamptz default now()`, `updated_at` via trigger where rows mutate. Enums as Postgres enums. No migrations are created until explicitly approved.

Privacy levels used below: **P0** public · **P1** authenticated/event-scoped · **P2** private to owner + organizer · **P3** private to owner, revealed only by explicit mechanism (contact info, consent, audit).

---

## 1. Identity & access

### profiles (P2; contact fields P3)
Who a user is, platform-wide. One row per auth user, created by trigger on signup.
- `id uuid pk references auth.users(id)` — **the naming-rule exception**
- `full_name`, `email` (synced from auth), `phone` (P3), `university`, `major`, `graduation_year int`, `city` (governorate enum or text), `primary_role` enum (`frontend|backend|fullstack|mobile|ai_ml|data|design|product|business|cyber|hardware`), `skills text[]`, `experience_level` enum (`beginner|intermediate|advanced`), `github_url`, `linkedin_url`, `portfolio_url`, `bio`, `avatar_url`
- Ownership: the user. RLS: user reads/updates own row. Others **never** select this table directly — privacy-safe fields exposed via `public_profile` view / RPCs (no email/phone). Organizer access to registrant contact goes through application-scoped RPC, audited.
- Indexes: `(university)`, GIN `(skills)`.

### organizations (P1)
Organizer entities (university club, company, NGO).
- `id`, `name`, `slug unique`, `logo_url`, `description`, `website`, `is_verified bool default false` (platform admin sets), `created_by uuid → profiles(id)` *(column name `created_by_user_id`)*
- RLS: public read of verified orgs; members update; platform_admin all.

### organization_members (P1)
- `id`, `organization_id fk`, `user_id fk → profiles(id)`, `role` enum (`owner|admin|staff`), unique `(organization_id, user_id)`
- RLS: members read own org's members; owner/admin manage.

### platform_admins (P3)
- `user_id pk fk`. Read by security-definer helper `is_platform_admin()` only. No UI in V1.

### event_roles (P1) — judges & mentors per event
Single table instead of separate `judges` table; simpler and covers mentors too.
- `id`, `hackathon_id fk`, `user_id fk`, `role` enum (`judge|mentor`), `invited_by_user_id fk`, `status` enum (`invited|active|removed`), unique `(hackathon_id, user_id, role)`
- RLS: organizer of the event manages; the user reads own rows.

---

## 2. Hackathons

### hackathons (P0 when published)
- `id`, `organization_id fk`, `slug unique`, `title`, `description`, `theme`, `location_name`, `city`, `mode` enum (`in_person|online|hybrid`), `starts_at`, `ends_at`, `registration_opens_at`, `registration_closes_at`, `team_size_min int`, `team_size_max int`, `rules_md text`, `prizes jsonb`, `timeline jsonb` (array of {label, at}), `cover_url`, `status` enum (`draft|published|registration_open|registration_closed|live|judging|completed|archived`), `allow_preformed_teams bool default true`, `matching_enabled bool default true`
- RLS: anon reads `status <> 'draft'`; org members full manage; nobody else writes.
- Indexes: `(status, starts_at)`, `(organization_id)`.

### hackathon_tracks (P0)
- `id`, `hackathon_id fk`, `name`, `description`, `sort_order int`
- RLS follows parent hackathon.

### hackathon_applications (P2; consent flags P2; check_in_token P3)
The registration record — the spine of the whole system.
- `id`, `hackathon_id fk`, `user_id fk`, `status` enum (`pending|accepted|waitlisted|rejected|cancelled`), `track_preference_id fk null`, `answers jsonb` (organizer custom questions later), `wants_matching bool default false`, `consent_event_data bool not null`, `consent_terms bool not null`, `consent_sponsor_share bool default false` *(denormalized flags for cheap RLS; legal truth = consent_records)*, `check_in_token uuid unique default gen_random_uuid()`, `registered_as_team_name text null` (pre-formed team path), `created_at`
- Unique `(hackathon_id, user_id)`.
- RLS: user CRUD own (insert requires both mandatory consents true); event organizer reads/updates status for own events; check_in_token readable only by owner (to render their QR) — organizer validates it via RPC, never selects it.
- Indexes: `(hackathon_id, status)`, `(user_id)`.

---

## 3. Matching & teams

### matching_preferences (P1 — visible in privacy-safe form to pool)
Per user per hackathon.
- `id`, `hackathon_id fk`, `user_id fk`, `looking_for_roles text[]`, `preferred_track_id fk null`, `commitment_level` enum (`casual|serious|competitive`), `idea_status` enum (`has_idea|open_to_ideas`), `notes text` (shown to pool — user is told it's visible), unique `(hackathon_id, user_id)`
- RLS: owner CRUD; other **pool members of same event** read via `matching_pool` view (joins privacy-safe profile fields only: first name + last initial, role, skills, experience, university — no email/phone/full links); organizer reads all for the event.

### team_proposals (P1 within event)
- `id`, `hackathon_id fk`, `created_by` enum (`system|organizer`), `created_by_user_id fk null`, `status` enum (`pending|accepted|declined|expired|cancelled`), `rationale jsonb` (score breakdown for transparency), `expires_at timestamptz`
- RLS: members of the proposal + event organizer read; only server (RPC/action) writes.

### team_proposal_members (P1)
- `id`, `proposal_id fk`, `user_id fk`, `proposed_role text`, `response` enum (`pending|accepted|declined`), `responded_at`, unique `(proposal_id, user_id)`
- RLS: each member updates own `response` only (via RPC to enforce state machine); members + organizer read.

### teams (P1 within event)
- `id`, `hackathon_id fk`, `name`, `origin` enum (`matched|preformed|organizer_created`), `proposal_id fk null`, `status` enum (`active|disbanded`), unique `(hackathon_id, name)`
- RLS: event participants read team name/roster (privacy-safe); members update name; organizer manages.

### team_members (P1)
- `id`, `team_id fk`, `user_id fk`, `role_in_team text`, `is_captain bool`, unique `(team_id, user_id)`
- RLS: as teams.

### contact_reveals (P3, append-only)
Records that user A may see user B's contact info, and why.
- `id`, `hackathon_id fk`, `viewer_user_id fk`, `subject_user_id fk`, `reason` enum (`team_formed|proposal_all_accepted|organizer_grant`), `team_id fk null`, `created_at`, unique `(hackathon_id, viewer_user_id, subject_user_id)`
- Written **only** by the `accept_proposal` / `join_preformed_team` RPCs. Contact info is served by RPC `get_revealed_contacts(team_id)` which checks this table. Every write also writes `audit_logs`.

---

## 4. Check-in

### check_ins (P2)
- `id`, `hackathon_id fk`, `user_id fk`, `application_id fk`, `method` enum (`qr|manual`), `checked_in_by_user_id fk` (organizer), `created_at`, unique `(hackathon_id, user_id)`
- Written only via `check_in_participant(p_check_in_token / p_application_id)` RPC (validates event ownership, idempotent). RLS: organizer reads own event's; participant reads own row.

---

## 5. Submissions

### submissions (P1 within event; P0 optionally after event if organizer publishes)
- `id`, `hackathon_id fk`, `team_id fk unique per hackathon`, `title`, `problem text`, `solution text`, `track_id fk null`, `github_url`, `demo_url`, `slides_url`, `technologies text[]`, `ai_usage_disclosure text`, `status` enum (`draft|submitted`), `submitted_at`, `is_winner bool default false`, `winner_rank int null`, `winner_label text null` (e.g., "Best Fintech")
- RLS: team members CRUD while `draft` and hackathon not past deadline; organizer reads all + sets winner fields; judges read only via `judge_assignments` join.
- Index `(hackathon_id, status)`.

### submission_assets — deferred. `slides_url` + Supabase Storage bucket (`submissions/`, path-scoped policies) suffice for V1.

---

## 6. Judging

### judging_criteria (P1)
- `id`, `hackathon_id fk`, `name`, `description`, `weight numeric` (weights per event should sum to 1 — enforced in app), `max_score int default 10`, `sort_order`
- RLS: organizer manages; judges of event read.

### judge_assignments (P1)
- `id`, `hackathon_id fk`, `user_id fk` (judge), `submission_id fk`, `status` enum (`pending|completed`), unique `(user_id, submission_id)`
- RLS: organizer manages; judge reads own.

### judge_scores (P2)
- `id`, `assignment_id fk`, `criterion_id fk`, `score numeric`, `comment text`, unique `(assignment_id, criterion_id)`
- RLS: judge CRUD own until organizer locks judging; organizer reads all. Participants never read raw scores; they see published results only.

---

## 7. Mentors

### mentor_requests (P1 within event)
- `id`, `hackathon_id fk`, `team_id fk`, `created_by_user_id fk`, `category` enum (`frontend|backend|ai_api|deployment|ui_ux|pitch|business_model|hardware|data|cybersecurity`), `description text`, `status` enum (`open|assigned|resolved`), `assigned_mentor_user_id fk null`, `resolved_at`
- RLS: team members CRUD own; event mentors read open + own-assigned (see request + team name only, not member contacts); organizer full.
- `mentor_assignments` table: **not needed in V1** — `assigned_mentor_user_id` suffices; split later if multi-mentor.

---

## 8. Reports & exports

### report_snapshots (P2; sponsor kind excludes PII by construction)
- `id`, `hackathon_id fk`, `kind` enum (`final_report|sponsor_report`), `data jsonb` (typed by builder), `generated_by_user_id fk`, `generated_at`, `version int`
- Built by `finalize_report_snapshot` server code using aggregate RPCs; sponsor builder is a separate function whose output schema physically has no PII fields except opt-in talent summaries. RLS: org members read own; insert via server only.

Exports are not a table: CSV route handlers stream query results (organizer-authorized, audited via `audit_logs`).

---

## 9. Talent graph (foundation)

### talent_opt_ins (P3)
- `id`, `user_id fk`, `scope` enum (`global`) for V1 (per-event sharing already covered by `consent_sponsor_share` on application), `status` enum (`active|revoked`), `opted_at`, `revoked_at`
- RLS: owner CRUD; organizers/sponsor exports read only `active` rows via builder functions.

### Participation history — **views, not tables** in V1
`v_user_hackathon_history` (from applications+check_ins), `v_user_project_history` (from team_members+submissions incl. winner flags). Materialize later if needed. No score, reliability, or negative fields exist anywhere — the schema physically cannot express them.

---

## 10. Privacy & audit

### consent_records (P3, append-only — the legal source of truth)
- `id`, `user_id fk`, `hackathon_id fk null` (null = platform-level consent like talent opt-in), `consent_type` enum (`event_data_share|terms_privacy|matching_pool_visibility|sponsor_talent_share|talent_graph_opt_in`), `granted bool`, `consent_text_version text` (e.g., `v1.0-2026-07`), `created_at`
- Why table over booleans: consent text changes over time; withdrawal must be provable; sponsors/regulators ask "what exactly did they agree to and when." Booleans on `hackathon_applications` remain as denormalized cache for RLS speed; every flag change writes a record here (RPC-enforced).
- RLS: owner reads own; inserts via RPC only; no update/delete ever.

### audit_logs (P3)
- `id`, `actor_user_id fk null` (null = system), `hackathon_id fk null`, `action text` (e.g., `contact_reveal`, `csv_export`, `winner_marked`, `talent_export`, `check_in`, `consent_change`, `ai_summary_generated`), `target_type text`, `target_id uuid`, `metadata jsonb`, `created_at`
- Insert-only, via RPCs/service paths. Read: platform_admin; organizers read their event's logs (transparency feature).

---

## 11. AI

### ai_summaries (P2)
- `id`, `hackathon_id fk`, `kind` enum (`event_status|matching|missing_roles|attendance|mentor_bottlenecks|submission_completeness|judging_progress|report_draft|sponsor_impact`), `input_hash text` (cache key over the aggregate JSON), `content_md text`, `model text`, `generated_at`
- RLS: org members read own event's; written server-side only.

---

## 12. Entity relationship overview

```
organizations ─┬─ organization_members ─ profiles(auth.users)
               └─ hackathons ─┬─ hackathon_tracks
                              ├─ hackathon_applications ─ check_ins
                              ├─ matching_preferences
                              ├─ team_proposals ─ team_proposal_members
                              ├─ teams ─┬─ team_members
                              │         ├─ submissions ─ judge_scores (via judge_assignments)
                              │         └─ mentor_requests
                              ├─ event_roles (judge/mentor)
                              ├─ judging_criteria / judge_assignments
                              ├─ report_snapshots / ai_summaries
                              └─ contact_reveals
profiles ─ talent_opt_ins / consent_records / audit_logs
```

---

## 13. Data flows (16)

1. **Signup** — Supabase Auth → trigger inserts `profiles` (id = auth uid) → redirect to profile completion.
2. **Profile creation** — user updates own `profiles` row (RLS: self only). Contact fields never leave this table except via reveal RPC.
3. **Event registration** — server action validates consents → insert `hackathon_applications` + `consent_records` rows (one RPC, atomic).
4. **Consent recording** — every consent change (grant or revoke) appends `consent_records`; denormalized flag updated in same transaction.
5. **Matching opt-in** — `wants_matching=true` + `matching_pool_visibility` consent record + `matching_preferences` row → appears in `matching_pool` view (privacy-safe fields only).
6. **Proposal generation** — organizer (or participant "suggest for me" later) triggers server action → SQL filters candidates → TS scores/assembles → inserts `team_proposals` + members `pending`.
7. **Approval/decline** — member calls `respond_to_proposal` RPC → updates own response; any decline → proposal `declined`, members released to pool.
8. **Contact reveal** — last acceptance inside `respond_to_proposal` → transaction: proposal `accepted`, `teams` + `team_members` created, pairwise `contact_reveals` inserted, `audit_logs` written. UI then calls `get_revealed_contacts(team_id)`.
9. **QR check-in** — participant shows QR (their `check_in_token`) → organizer scanner posts token → `check_in_participant` RPC validates event + org membership → insert `check_ins` (idempotent) + audit.
10. **Submission** — team member creates/edits draft → `submit` action sets status+timestamp; edits lock at deadline/status.
11. **Mentor request** — team member inserts request → mentor claims (`assigned`) → marks `resolved`; dashboard aggregates by category.
12. **Judge scoring** — organizer assigns → judge upserts `judge_scores` per criterion → assignment `completed` when all criteria scored → ranking view computes weighted totals; organizer marks winners.
13. **Final report** — organizer clicks generate → aggregate RPCs (counts, university distribution, roles, tracks, mentor stats, judging summary, winners) → `report_snapshots(kind=final_report)` → report page renders snapshot.
14. **Sponsor report** — separate builder: aggregates + technologies + winners + opt-in talent summary (only `consent_sponsor_share` or active talent opt-in) → snapshot `kind=sponsor_report` → audited.
15. **Opt-in talent export** — organizer exports CSV of registrants **with sponsor-share consent only**; route handler double-checks flags row-by-row; audit logged with row count.
16. **AI summary** — server aggregates event stats to anonymized JSON → hash → cache check in `ai_summaries` → Claude API → store + render with "AI-generated" label. No PII in prompt, ever.
