# PHASE-AUTH-001 (draft — not the active task)

**This file is a staged future task, not `tasks/current-task.md`.** Per `CLAUDE.md`'s one-active-task-at-a-time rule, this must not be copied into `current-task.md` until a human explicitly approves starting it — and, separately, until the specific migration and RLS approvals it requires (see "Approvals on record" below) are actually given. `tasks/current-task.md` remains "No active task" as of this writing. This document contains **requirements only — no code, no SQL, no migration text.**

---

## Task ID
`PHASE-AUTH-001` — Role-Aware Identity Foundation (Part 1: schema + signup/onboarding, no dashboards yet)

## Phase reference
`docs/PHASES.md` → "Next planned phase — Role-Aware Authentication and Dashboard Architecture." This task implements the *foundation* slice only (identity/role schema + onboarding flow) — it deliberately does not build the Organizer or Participant dashboards themselves, which should be follow-up tasks (`PHASE-AUTH-002`+) once this foundation exists and is reviewed.

## Objective
Give every user a `default_workspace`, let organizations invite new members, and route a user through onboarding into the correct starting context — without yet building either dashboard's actual content. This makes the auth/identity layer real and testable before UI work begins on top of it.

## Architecture this task must implement exactly as specified — no re-deriving
- `docs/architecture/DECISIONS.md` — the full ADR (AD-1 through AD-10). Do not deviate from any decision recorded there without stopping and flagging it back for review, even if an alternative seems locally cleaner.
- `docs/architecture/AUTH_ARCHITECTURE.md` — provider/method behavior (unchanged), lifecycle steps, post-login routing table (§5).
- `docs/architecture/ROLE_MODEL.md` — the four-scope role model; this task only touches Scope B (`default_workspace`) and prepares Scope C's invite gap (`organization_invites`). Scope D's `staff`/`volunteer` enum extension is **out of scope for this task** — defer to a later task.
- `docs/architecture/FUTURE_DATABASE_PLAN.md` §2 — the exact new schema items this task is allowed to build (and no others from that document without a new approval).
- `docs/architecture/RLS_STRATEGY.md` §1, §3, §11 — the "workspace is UI, not RLS" principle must hold in every policy this task writes.
- `docs/architecture/PRODUCT_FLOWS.md` §1–§6 — routing/redirect table this task's middleware/layout guards must match.

## In scope
- Migration: add `profiles.default_workspace` (enum `participant | organizer`, not null, default decided at implementation time — likely `participant` as the safer default for existing rows, but confirm with the human before assuming).
- Migration: add `profiles.last_active_organization_id` (nullable FK to `organizations`, `on delete set null`) — optional per `FUTURE_DATABASE_PLAN.md` §2, include only if it doesn't meaningfully expand this task's risk; if deferred, say so explicitly in the handoff rather than silently dropping it.
- Migration: new table `organization_invites` per `FUTURE_DATABASE_PLAN.md` §2 (columns: id, organization_id, invited_email or invited_user_id, role offered, status `pending|accepted|declined|expired`, invited_by_user_id, created_at, expiry — exact column list to be finalized against `docs/DATABASE.md`'s existing conventions, e.g. `id uuid pk default gen_random_uuid()`, `created_at timestamptz default now()`).
- RLS for `organization_invites`: invited user (if `invited_user_id` resolves, or by matching authenticated email) reads/accepts/declines own invite; inviting org's `owner`/`admin` create/revoke; no other access. Must be reviewed against `RLS_STRATEGY.md` §1 before being written.
- Onboarding flow updates: insert the `default_workspace` selection step and the conditional organization-creation-or-invite-acceptance step, per `AUTH_ARCHITECTURE.md` §4.
- Server-side routing/middleware: implement the post-login routing table from `AUTH_ARCHITECTURE.md` §5 and the deep-link/return-URL rules from `PRODUCT_FLOWS.md` §4–§6, including same-origin validation of the `next` parameter.
- Audit logging for `organization_invites` creation and acceptance, per `RLS_STRATEGY.md` §10.

## Out of scope (explicit)
- Building the Participant Dashboard or Organizer Dashboard UI/content — that's `PHASE-AUTH-002`+.
- The workspace switcher or organization switcher UI components — routing/redirect logic only in this task; the visible switcher affordance is a follow-up (and may be a Design Authority task, not a Codex task, depending on how much visual judgment it needs).
- `event_roles.role` enum extension (`staff`, `volunteer`) — deferred, per `ROLE_MODEL.md` §2 Scope D.
- **Enforcing** the conflict-of-interest boundary from `RLS_STRATEGY.md` §6 (manager-tier organizers barred from participating/judging/scoring in their own organization's events, by default). The *decision* is now binding and recorded — but no RLS policy, RPC check, or migration constraint implementing it is in scope for this task. It belongs to whichever future task builds `hackathon_applications` registration and `event_roles` judge-assignment enforcement; flag it there as a required check against the now-binding rule, do not build it here.
- `hackathons.visibility`, `hackathon_invites`, `organizations.category` — all explicitly deferred future items per `FUTURE_DATABASE_PLAN.md` §5, not this task.
- Any change to existing tables/policies not listed above — `docs/DATABASE.md` and `docs/RLS_ACCESS_MATRIX.md` remain authoritative for everything this task doesn't explicitly touch.
- Package/dependency changes beyond what's already in the project, unless a genuine need appears — flag it rather than adding silently.

## Approvals on record
- [ ] Database migration approved by human — **NOT YET GIVEN.** This task lists the required migrations (`default_workspace`, `last_active_organization_id`, `organization_invites`) but per `CLAUDE.md`'s standing rule, none may be written until the human explicitly approves this specific task, in a conversation, before Codex starts.
- [ ] RLS / contact-reveal logic approved by human — **NOT YET GIVEN.** The `organization_invites` RLS policies described above are new privacy-relevant surface (who can see/accept an invite) and require the same explicit sign-off as any other RLS work, per `CLAUDE.md`.

**This task must not be started until both boxes above are checked by the human, in writing, in the approval conversation for the task that supersedes this draft.**

## Files expected to change (best guess, not binding)
- `supabase/migrations/<timestamp>_role_aware_identity_foundation.sql` (new)
- `src/lib/supabase/` — types regeneration after migration
- `src/app/(auth)/onboarding/` — new workspace-choice + org-creation/invite-acceptance steps
- `src/middleware.ts` or route-group layout files under `src/app/(participant)/`, `src/app/(organizer)/` — routing table + `next` param handling
- `src/actions/organizations.ts` (or similar) — invite creation/acceptance server actions
- `docs/DATABASE.md`, `docs/RLS_ACCESS_MATRIX.md` — updated to reflect the new table/column/policies once implemented (documentation catch-up is part of this task, not a separate one)

## Acceptance criteria
- [ ] `profiles.default_workspace` exists, not-null, correctly defaulted for existing rows, settable during onboarding.
- [ ] `organization_invites` table exists with RLS matching `RLS_STRATEGY.md` §1/§3/§10; an invited user can see and act on their own pending invite and no one else's.
- [ ] A new participant-intent signup completes onboarding and lands on `/dashboard`, per the routing table.
- [ ] A new organizer-intent signup with zero orgs is routed into org-creation-or-invite-acceptance before reaching any organizer route.
- [ ] An organizer-intent signup that accepts a pending invite lands correctly scoped to that organization, without being able to see any other organization's data (manual RLS spot-check with 2 test orgs, per `docs/RLS_ACCESS_MATRIX.md` §Enforcement notes testing convention).
- [ ] A deep link to an `/organizer/*` or participant route while signed out redirects to `/auth?next=...` and correctly resumes after login.
- [ ] `next` parameter is rejected/ignored if it isn't a validated internal path (test with an external URL value).
- [ ] `git grep profile_id` returns nothing.
- [ ] No workspace/session value is read inside any new RLS policy or `security definer` function — spot-checked against `RLS_STRATEGY.md` §11.
- [ ] `docs/DATABASE.md` and `docs/RLS_ACCESS_MATRIX.md` updated to include the new table/columns/policies.

## Constraints (standing, copied from AGENTS.md — do not remove)
- `user_id` naming rule; `profiles.id` is the only exception; `profile_id` must not appear anywhere.
- No public marketplace, no public people browsing, no public contact reveal.
- No AI winner selection, no public negative scoring.
- No sponsor access to raw participant data without explicit opt-in.
- No new dependencies unless explicitly listed above.
- `/docs` is read-only unless this task says otherwise (this task explicitly authorizes updating `DATABASE.md` and `RLS_ACCESS_MATRIX.md` as part of its own scope, once implemented — no other doc).

## Verification steps
- `powershell -ExecutionPolicy Bypass -File scripts/verify.ps1`
- Manual RLS matrix spot-check with ≥2 test users across ≥2 organizations (one dual-role user: participant in org A's event, owner of org B) — confirm no cross-org leakage.
- Manual walk of the full onboarding → routing flow for both `default_workspace` choices, including the zero-orgs organizer path and the invite-acceptance path.

## Handoff notes expected
- Flag explicitly whether `last_active_organization_id` was included or deferred, and why.
- Flag any point where the routing table in `AUTH_ARCHITECTURE.md` §5 didn't cleanly cover a real case encountered during implementation (e.g., an org that was deleted between invite and acceptance) — these are exactly the kind of gap this architecture pass may have missed, and should come back to Claude for a documentation update, not be silently patched.
- Confirm the conflict-of-interest boundary from `RLS_STRATEGY.md` §6 (now a binding decision, but out of scope for enforcement in this task) was **not** implemented — decision recording is not the same as enforcement, and this task builds neither `hackathon_applications` registration nor `event_roles` judge assignment, so there is nothing in this task's own tables to check it against yet.
