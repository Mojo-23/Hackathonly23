# Hackathonly Jordan — RLS / Access Matrix

Deny-by-default: RLS enabled on every table; no policy = no access. Roles are contextual, not global: `organizer` = member of the org owning the hackathon (`is_event_organizer(hackathon_id)` helper, security definer). `judge`/`mentor` = active row in `event_roles` for that event. `sponsor_viewer` has **no direct table access in V1** — sponsors receive organizer-generated snapshots/exports only. `platform_admin` = row in `platform_admins`.

Legend: ✅ allowed · 🔶 allowed with condition · ❌ denied · RPC = only through security-definer function (never direct DML).

## Identity

| Table | anon | participant | organizer | judge | mentor | platform_admin |
|---|---|---|---|---|---|---|
| profiles SELECT | ❌ | 🔶 own row full; others only via `public_profile` view (no contact data) | 🔶 registrants of own events via RPC for safe profile fields | ❌ (names via submission views only) | ❌ | ✅ |
| profiles INSERT | ❌ | 🔶 own currently (`PHASE3C-001` scaffolding); D17 target is signup trigger, then separately approved RLS tightening | — | — | — | — |
| profiles UPDATE | ❌ | 🔶 own | ❌ | ❌ | ❌ | ✅ |
| profiles DELETE | ❌ | 🔶 own (account deletion flow, cascades per PRIVACY_MODEL) | ❌ | ❌ | ❌ | ✅ |
| organizations R / W | ✅ verified only / ❌ | ✅ verified / ❌ | 🔶 own org / own org (owner-admin) | ❌ | ❌ | ✅ |
| organization_members | ❌ | 🔶 own memberships | 🔶 own org read; owner/admin manage | ❌ | ❌ | ✅ |
| event_roles | ❌ | 🔶 own rows | 🔶 own events manage | 🔶 own row | 🔶 own row | ✅ |

`user_contacts` is a private P3 contact-data table added in `PHASE3B-001`. `PHASE3C-001` grants authenticated users self-owned SELECT/INSERT/UPDATE only (`user_id = auth.uid()`), so D17 assigns contact-row creation to onboarding. No organizer, judge, mentor, sponsor, public, or cross-user contact access exists; future reveal or organizer contact reads still require separately approved audited RPCs.

## Hackathons & registration

| Table | anon | participant | organizer | judge | mentor |
|---|---|---|---|---|---|
| hackathons SELECT | 🔶 status ≠ draft | 🔶 same | ✅ own | 🔶 assigned events | 🔶 assigned events |
| hackathons I/U/D | ❌ | ❌ | 🔶 own org | ❌ | ❌ |
| hackathon_tracks | follows parent | follows parent | 🔶 own manage | read | read |
| hackathon_applications SELECT | ❌ | 🔶 own | 🔶 own events | ❌ | ❌ |
| hackathon_applications INSERT | ❌ | 🔶 self, reg window open, both mandatory consents true | ❌ | ❌ | ❌ |
| hackathon_applications UPDATE | ❌ | 🔶 own (cancel, matching flag via RPC) | 🔶 status only, own events | ❌ | ❌ |
| check_in_token | ❌ | 🔶 own only | ❌ direct — validate via RPC | ❌ | ❌ |

## Matching & teams

| Table | participant | organizer | notes |
|---|---|---|---|
| matching_preferences | 🔶 own CRUD; pool peers read via `matching_pool` view (privacy-safe fields, same event, both opted in) | 🔶 own events read | view exposes: display name, role, skills, experience, university, notes — never email/phone/full profile |
| team_proposals | 🔶 read if member | 🔶 own events read; create via action | writes via server/RPC only |
| team_proposal_members | 🔶 read if member of proposal; update own response via RPC | 🔶 read | state machine in `respond_to_proposal` |
| teams / team_members | 🔶 event participants read roster (safe fields); members update team name | 🔶 own events manage | |
| contact_reveals | 🔶 read rows where viewer = self | 🔶 own events read | INSERT via RPC only; never update/delete |
| contact info of teammates | 🔶 via `get_revealed_contacts(team_id)` RPC — checks reveal row exists | ✅ via audited RPC | the only path to another user's contact fields in `user_contacts` |

## Check-in, submissions, judging, mentors

| Table | participant | organizer | judge | mentor |
|---|---|---|---|---|
| check_ins | 🔶 read own | 🔶 own events read; insert via RPC | ❌ | ❌ |
| submissions SELECT | 🔶 own team | ✅ own events | 🔶 assigned only (join judge_assignments) | ❌ |
| submissions I/U | 🔶 team member, status=draft, before deadline | 🔶 winner fields + admin edits | ❌ | ❌ |
| judging_criteria | 🔶 read (published) | 🔶 own manage | read | ❌ |
| judge_assignments | ❌ | 🔶 own manage | 🔶 own read | ❌ |
| judge_scores | ❌ (published results only, via results view when organizer publishes) | 🔶 own events read | 🔶 own CRUD until judging locked | ❌ |
| mentor_requests | 🔶 own team CRUD | ✅ own events | ❌ | 🔶 event's open + own-assigned; update status of own-assigned |

## Reports, talent, privacy, AI

| Table | participant | organizer | platform_admin | notes |
|---|---|---|---|---|
| report_snapshots | ❌ | 🔶 own events read; insert via server | ✅ | sponsor kind: PII-free by builder construction |
| talent_opt_ins | 🔶 own CRUD | 🔶 aggregate/consented reads via builder fns | ✅ | never raw-listed to sponsors |
| consent_records | 🔶 read own; insert via RPC | ❌ direct (aggregates via fns) | ✅ | append-only, no U/D for anyone |
| audit_logs | ❌ | 🔶 own events read | ✅ | insert via RPC/service only |
| ai_summaries | ❌ | 🔶 own events read | ✅ | server-side writes only |

## Enforcement notes

1. Helper functions (`is_event_organizer`, `is_event_judge`, `is_event_mentor`, `is_platform_admin`, `is_team_member`) are `security definer`, `stable`, and search-path pinned — RLS policies stay one-line readable.
2. Anything crossing user boundaries (reveal, check-in, proposal response, consent, report snapshot) is an RPC with explicit checks + audit write; direct DML on those tables is denied even to authenticated users.
3. Service-role key usage is confined to `src/lib/supabase/admin.ts`; each caller function is named, reviewed, and audit-logged.
4. Every policy gets a test note in the migration PR: "as role X, attempt Y, expect Z." Minimum manual matrix run before each phase's definition-of-done.
5. Storage buckets: `avatars` (public read, owner write), `event-covers` (public read, org write), `submissions` (team + organizer + assigned judge read, team write) — mirrored path-based policies.
