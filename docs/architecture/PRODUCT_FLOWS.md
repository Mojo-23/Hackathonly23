# Product Flows — PHASE-AUTH-000

**Status: architecture specification, not implemented.** Companion to `DECISIONS.md` AD-6. Covers navigation, routing, redirects, deep links, and return URLs for the role-aware auth system. No middleware, layout guard, or nav component exists yet beyond what the public-experience phase already shipped.

---

## 1. Navigation surfaces (four, not two)

| Surface | Who sees it | Contents | Status this phase |
|---|---|---|---|
| Anonymous public nav | Everyone, signed out | `Hackathons / Participants / Organizers / Blog`, `Sign in` / `Sign up` | **Unchanged** — already adopted, see prior phase's handoff |
| Participant nav | Signed-in user, in participant workspace | Dashboard, My Events, Proposals, Teams (via events), Profile; organizer-switch affordance if dual-capable | New, spec only |
| Organizer nav | Signed-in user, in organizer workspace | Org home, org switcher (if ≥2 orgs), event list, command-center subnav (existing, `docs/ROUTES.md`); participant-switch affordance always | New, spec only |
| (Future, not this phase) Judge/Mentor nav | Signed-in user with active `event_roles` row | Existing `(judge)`/`(mentor)` route groups per `docs/ROUTES.md` | Unchanged, out of scope here |

Dashboard never appears in the anonymous public nav, under any condition — this is a hard carry-over from the prior phase's binding decision and is restated here as a routing requirement, not just a nav-copy requirement: even a direct URL visit to `/dashboard` or `/organizer` while signed out must redirect to `/auth?next=<path>`, never render any dashboard shell first.

## 2. Workspace switcher — exact visibility rule

**Shown when:** the signed-in user has ≥1 row in `organization_members` (any role, any org). **Hidden when:** 0 rows. This is the *only* condition — it does not depend on `default_workspace`, since a participant-default user who later creates an org should immediately gain the switch affordance without changing their default.

**Behavior:** navigates between `/dashboard` (participant) and `/organizer` (organizer org home or last-active org). Does not mutate the session, does not re-authenticate, does not change `default_workspace` (that remains a separate, explicit account-settings action, not a side effect of navigating).

## 3. Organization switcher — exact visibility rule

**Shown when:** the signed-in user, currently in the organizer workspace, belongs to ≥2 organizations. **Hidden when:** 0 or 1. **Default selection:** `profiles.last_active_organization_id` if set and still valid (user still a member); else the most-recently-joined organization. Selecting a different org updates `last_active_organization_id` (optional convenience field, see `FUTURE_DATABASE_PLAN.md` §2 — not required for correctness, only for a smoother "return to where I left off" experience).

## 4. Routing and redirect table

Extends `AUTH_ARCHITECTURE.md` §5 with the deep-link and return-URL cases:

| Scenario | Behavior |
|---|---|
| Anonymous visits `/dashboard` or `/organizer/*` directly | Redirect to `/auth?next=<original path>` |
| Anonymous clicks "Register" on an event page | Redirect to `/auth?next=/events/[slug]/register`; after auth, land on the registration step directly, not the default dashboard |
| Authenticated, `initial_onboarding_completed_at is null` (`AUTH_ARCHITECTURE.md` §4a) | Routed to the onboarding workspace-choice step, regardless of destination — this check happens before any of the rows below are consulted, and before any `next` value is honored |
| Authenticated participant visits `/organizer/*` with 0 org memberships | Redirect to the organizer creation-or-recovery flow (`AUTH-002A` scope) — never a blank/broken organizer shell, and never `/dashboard` as a silent fallback (`DECISIONS.md` AD-11 Decision 2) |
| Authenticated participant visits `/organizer/*` with ≥1 org membership | Allowed — this is exactly the dual-role case; org membership, not `default_workspace`, gates access |
| Authenticated organizer-default user with 0 orgs, first login | Land on the organizer creation-or-recovery flow automatically (per `AUTH_ARCHITECTURE.md` §5 table) |
| Authenticated organizer-default (or dual-role) user with ≥1 org membership | Land on **`/organizer`** — the real, canonical organizer home (`AUTH-002-PRE`, `src/app/organizer/page.tsx`), not a placeholder or a different route standing in for it |
| Authenticated user visits a specific `/organizer/events/[eventId]/*` they are not a member of that event's org | 403 / not-found treatment (exact UX — 404 vs. "request access" — is an implementation-phase UX decision, not fixed here); never silently reveal the event exists to non-members beyond what public `/events/[slug]` already shows if published |
| `next` parameter present but points off-site or to a non-existent internal route | Ignored; fall back to the default routing table in `AUTH_ARCHITECTURE.md` §5 |
| Logout from either workspace | Session cleared, client-side workspace preference cleared, redirect to `/` |

## 5. Deep links

A deep link (e.g., a shared `/organizer/events/[eventId]/reports` URL, or a `/proposals/[proposalId]` link from a notification) must resolve correctly regardless of which workspace the recipient last had active, since the recipient may not have visited that workspace this session. Rule: **the destination route determines the workspace, not the other way around** — visiting an `/organizer/*` deep link always attempts organizer-context authorization (org membership check) even if the user's browser last showed the participant dashboard; visiting a `/dashboard`/`/proposals`/`/teams/*` deep link always uses participant context. This means the two route groups' layout guards are independent and stateless with respect to "which workspace was active before" — each checks its own required condition (org membership vs. simply "authenticated") on every request.

## 6. Return URL validation (security note)

The `next` parameter must be validated as same-origin and matching a known internal route shape before being honored — never redirect to an arbitrary external URL supplied via query string (open-redirect risk). This is a standard requirement, stated explicitly here because it hadn't previously been documented anywhere in the repo, and because it directly touches the auth flow this phase is architecting.

## 7. What this document does not cover

No component names, no exact copy, no visual treatment of the switchers (pill vs. dropdown vs. modal — a Design Authority decision for a future pass), and no middleware code. This document specifies **behavior and rules**, for `PHASE-AUTH-001.md` to turn into concrete implementation requirements.
