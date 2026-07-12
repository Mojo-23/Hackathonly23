# Future Database Plan — PHASE-AUTH-000

**Status: planning only. No migrations. No SQL. No implementation.** Companion to `DECISIONS.md` AD-7. This document does two things: (1) summarizes the table groups `docs/DATABASE.md` already fully specifies, so this ADR set is self-contained, and (2) lists, precisely, the small number of new items this phase's questions surface that `DATABASE.md` does not yet have. **`docs/DATABASE.md` remains the authoritative source for every table's exact columns, RLS, and indexes** — nothing here overrides it; where this document and `DATABASE.md` overlap, `DATABASE.md` wins.

---

## 1. Existing table groups (from `docs/DATABASE.md`, unchanged by this phase)

| Group | Tables | Responsibility |
|---|---|---|
| **Identity** | `profiles`, `user_contacts`, `platform_admins` | Who a user is, platform-wide; private contact data separated from display identity |
| **Organizations** | `organizations`, `organization_members` | Organizer entities and their membership/roles |
| **Events** | `hackathons`, `hackathon_tracks`, `hackathon_applications`, `event_roles` | The hackathon itself, its tracks, registrations, and per-event judge/mentor roles |
| **Teams & Matching** | `matching_preferences`, `team_proposals`, `team_proposal_members`, `teams`, `team_members`, `contact_reveals` | Opt-in pool, proposal generation/response, team formation, gated contact reveal |
| **Check-in** | `check_ins` | Attendance, QR + manual |
| **Submissions** | `submissions` | One per team per hackathon, draft→submitted |
| **Judging** | `judging_criteria`, `judge_assignments`, `judge_scores` | Criteria, assignment, scoring, ranking |
| **Mentors** | `mentor_requests` | Team-initiated help queue |
| **Reports & exports** | `report_snapshots` | Final + sponsor report snapshots; CSV exports are streamed, not stored |
| **Talent graph** | `talent_opt_ins` (+ history views) | Opt-in, revocable long-term participation history |
| **Privacy & audit** | `consent_records`, `audit_logs` | Append-only legal consent trail and cross-boundary access log |
| **AI** | `ai_summaries` | Cached, server-generated operational summaries |

Full column-level detail, RLS, and indexes for every table above: `docs/DATABASE.md`. Not restated here.

## 2. New items this phase's architecture requires (not yet in `DATABASE.md`)

| Item | Kind | Group | Responsibility | Required for | Optional? |
|---|---|---|---|---|---|
| `profiles.default_workspace` | New column on existing table | Identity | Enum `participant \| organizer`; onboarding-chosen dashboard default (`DECISIONS.md` AD-1) | Post-login routing (`AUTH_ARCHITECTURE.md` §5) | **Required** — the load-bearing field of this whole phase |
| `organization_invites` | New table | Organizations | Pending invitations to join an organization (email or user_id target, inviting org, role offered, status `pending\|accepted\|declined\|expired`, expiry) | Onboarding org-join step (`AUTH_ARCHITECTURE.md` §4.4), multi-admin org growth (`DECISIONS.md` AD-4) | **Required** — currently the only way to add a second org member is undocumented; this closes a real gap |
| `profiles.last_active_organization_id` | New column on existing table | Identity | Nullable FK to `organizations`; remembers which org to default the switcher to | Organization switcher UX (`PRODUCT_FLOWS.md` §3) | **Optional** — pure convenience; system works correctly (falls back to most-recently-joined) without it |
| `event_roles.role` gains `staff`, `volunteer` | Enum extension on existing table | Events | Event-scoped operational roles narrower than org membership (`ROLE_MODEL.md` §2, Scope D) | Fulfills the phase brief's example role list | **Required if those two roles are to exist at all**; if the future implementation phase decides Volunteer/Staff aren't needed yet, this can be deferred without blocking anything else in this plan |
| **Notifications group** (new, unnamed tables — deliberately not designed in detail here) | New table group | Notifications | Both dashboards will eventually need in-app/email notifications (proposal received, event published, deadline approaching) | Not required for auth/role architecture itself — flagged here only because it's a foreseeable near-future group with zero current design, so it isn't invented ad hoc later without an ADR | **Deferred** — explicitly out of scope for this phase; listed only so its absence is a documented decision, not an oversight |

## 3. Items considered and explicitly not added

- **A `user_sessions_context` or similar table to persist "current workspace" server-side.** Rejected — per `AUTH_ARCHITECTURE.md` §3 and `RLS_STRATEGY.md` §1, workspace is a client-side navigation convenience, never a server-trusted value; persisting it in the database would wrongly imply it has authorization weight. `last_active_organization_id` (above) is the only server-persisted hint, and it's explicitly a default, not an authorization gate.
- **A generic `permissions` / `role_permissions` table.** Rejected — see `ROLE_MODEL.md` §3 and `DECISIONS.md` AD-3.
- **A `participants` table.** Rejected — participation is evidenced by `hackathon_applications`, not a role/membership row. Unchanged from the existing schema's design.

## 4. Messaging — explicitly not planned

`docs/PRODUCT_DECISIONS.md` (Later, V2+ section) already notes team chat is "only if WhatsApp displacement proves needed — likely not." This phase does not add a messaging group, and does not treat its absence as a gap — it's a standing, deliberate non-decision, restated here for completeness since the phase brief's example group list mentioned "Messaging."

## 5. Forward-looking additions for AD-10 (future scalability) — not this phase, not urgent

- **`hackathons.visibility`** (new column, enum `public | unlisted | private`) — enables company-internal/invite-only events. Currently every published hackathon is implicitly public; this is additive and doesn't change any existing row's behavior (default `public`).
- **`hackathon_invites`** (new table) — the private-event counterpart to `organization_invites`, same shape (invite target, event, status, expiry). Needed only once `visibility = private` is actually built.
- **`organizations.category`** (optional, new column, enum or free text) — cosmetic/analytics only (university club vs. company vs. NGO vs. incubator), no access-control implication. Lowest priority item in this entire document.

None of these five items in this section are required for `PHASE-AUTH-001` — they are recorded here so a future scalability push has a documented starting point instead of re-deriving the same conclusions.
