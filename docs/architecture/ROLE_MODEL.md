# Role Model — PHASE-AUTH-000

**Status: architecture specification, not implemented.** Companion to `DECISIONS.md` AD-3. No table, enum change, or RLS policy exists yet — this document specifies what they should look like when a future, separately-approved phase builds them.

---

## 1. Principle: roles are contextual, not global

This is not a new principle — `docs/RLS_ACCESS_MATRIX.md` line 1 already states "Roles are contextual, not global." This document makes that principle explicit as the load-bearing design rule for the whole identity/role system, and shows how every role the phase brief asked about (Participant, Organizer, Organization Owner, Organization Admin, Judge, Mentor, Volunteer, Staff, Sponsor Viewer) fits into it.

A user's capabilities at any moment are the union of four independent, differently-scoped signals. None of them is a single "role" column on `profiles`.

## 2. The four scopes

### Scope A — Platform
**Table:** `platform_admins` (existing, unchanged). **Grants:** cross-organization administrative access (org verification, support). **Who:** Hackathonly staff only. Not touched by this phase.

### Scope B — Identity (new, minimal)
**Field:** `profiles.default_workspace` (new column, enum `participant | organizer`). **Grants:** nothing. It is a UX default (which dashboard to land on), not a capability. This is the only new thing at this scope — deliberately, per `DECISIONS.md` AD-1, to avoid recreating a global role column under a different name.

### Scope C — Organization
**Table:** `organization_members` (existing, unchanged: `role` enum `owner | admin | staff`, unique per `(organization_id, user_id)`). **Grants**, per role, within that specific organization only:
- `owner` — full control: edit org, manage all members (including other owners/admins), create/edit/publish/delete the org's hackathons, eventually billing.
- `admin` — create/edit/publish the org's hackathons, manage `staff`-level members, cannot remove owners or delete the org.
- `staff` — operate events (participants table, check-in, judging setup) but cannot manage org membership or org-level settings.

This is where "Organization Owner" and "Organization Admin" from the phase brief's example list already live — they are not new roles this phase invents, they are this existing enum, correctly scoped to a single organization. A user can hold different roles in different organizations simultaneously (e.g., `owner` of their university club, `staff` in a company's hackathon they help run part-time) — the unique constraint is per-org, not global, so this falls out for free.

### Scope D — Event
**Table:** `event_roles` (existing: `hackathon_id`, `user_id`, `role` enum `judge | mentor`, `status` `invited | active | removed`). **Recommendation this phase: extend the enum** to `judge | mentor | staff | volunteer` — both new values fit the exact same shape (per-event, not necessarily an org member, invited by an organizer). This is a schema note for the future implementation task, not a change made now.
- `judge` — assigned submissions only, no participant contacts (unchanged, `docs/PRIVACY_MODEL.md` §5).
- `mentor` — open/assigned mentor requests + team name only, no contacts (unchanged).
- `staff` (new) — event-day operational access (e.g., check-in scanning) without full organizer/org-membership rights — useful for volunteers an organizer wants to deputize for one event without adding them to the organization itself.
- `volunteer` (new) — narrowest: likely read-only or single-purpose (e.g., check-in only), exact capability set to be defined when this is actually built; included here only to confirm the *shape* (event-scoped, not org-scoped) is right, not to finalize its permissions.

**Sponsor Viewer is explicitly excluded from this scope, and from every other scope.** `docs/PRODUCT_DECISIONS.md` D3 rejected a sponsor auth role/portal for V1; nothing in this phase changes that. Sponsors remain report recipients only. This is called out explicitly because the phase brief's example list includes "Sponsor Viewer" and a less careful reading could treat that as reopening D3 — it does not.

### Participant — deliberately absent from all four scopes
There is no `participant` role anywhere in this model. Any authenticated user can register for a hackathon (`hackathon_applications` insert, subject to existing consent-gated RLS, unchanged). Participation is evidenced by data, not granted by a role row — consistent with `docs/DATABASE.md`, which has never had a `participants` table.

## 3. Why not a generic permissions engine

Considered and rejected in `DECISIONS.md` AD-3. Restated briefly here for implementers: a configurable `permissions`/`role_permissions` system trades a handful of enum values and `security definer` helper functions (cheap, readable, matching the existing `docs/RLS_ACCESS_MATRIX.md` enforcement notes) for a dynamic system that has to be queried at policy-evaluation time, administered through some UI that doesn't exist and isn't needed yet, and tested combinatorially. Nothing in the current or foreseeable (per AD-10) product needs per-user custom permission grants — every real-world need in the brief's example list is already covered by scope C or D above. Build the flexible system if and when a concrete need appears that these four scopes can't express; don't build it speculatively.

## 4. Resulting capability matrix (illustrative, not exhaustive — full detail remains `docs/RLS_ACCESS_MATRIX.md`'s job)

| Role/scope | Can create hackathons | Can manage org members | Can score submissions | Can see participant contacts | Can check people in |
|---|---|---|---|---|---|
| Participant (implicit) | No | No | No | Only revealed teammates | No |
| `organization_members.owner`/`admin` | Yes, own org | Yes, own org | No (unless also assigned judge) | Via audited organizer RPC, own events | Yes, own events |
| `organization_members.staff` | No (create), Yes (operate) | No | No | Via audited organizer RPC, own events | Yes, own events |
| `event_roles.judge` | No | No | Yes, assigned only | No | No |
| `event_roles.mentor` | No | No | No | No | No |
| `event_roles.staff`/`volunteer` (proposed) | No | No | No | No | Likely yes (to be scoped later) |
| `platform_admins` | Yes, any org | Yes, any org | No | Via audited path only | No |

## 5. Dual-role example, worked through the model

A user who is `owner` of "AI Club — University of Jordan" (Scope C) and has `default_workspace = participant` (Scope B) and has registered for a hackathon run by a *different* organization (an ordinary `hackathon_applications` row, no role needed) is, simultaneously and without conflict:
- An organizer for their own club's events (Scope C grants it).
- An ordinary participant in someone else's event (no role needed — implicit).
- Defaulting to the participant dashboard on login (Scope B says so), with an organizer-workspace switch available in nav because Scope C membership exists.

No field anywhere had to change to make this true — it is already representable by the existing schema plus the one new `default_workspace` column. This is the concrete proof that AD-1's "capabilities derived from context" model satisfies the brief's dual-role requirement without new machinery.
