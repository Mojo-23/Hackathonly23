# RLS Strategy — PHASE-AUTH-000

**Status: strategy narrative only. No SQL. No policies. No implementation.** Companion to `DECISIONS.md` AD-8. `docs/RLS_ACCESS_MATRIX.md` remains the authoritative, table-by-table access matrix — this document explains the *strategy* the role/workspace architecture (`ROLE_MODEL.md`, `DASHBOARD_ARCHITECTURE.md`) implies for it, and flags what changes versus what's ratified as-is.

---

## 1. Core principle, restated for this phase: workspace is UI, RLS is truth

The single most important strategic point this phase adds: **"which dashboard the user is currently viewing" has no RLS meaning whatsoever.** RLS policies are evaluated per-request against `auth.uid()` and the existing contextual-role helper functions (`is_event_organizer`, `is_event_judge`, `is_event_mentor`, `is_platform_admin`) — none of which need to know, and must never be given, a "current workspace" hint. A user sitting in the participant dashboard who happens to also be an org owner is still exactly as authorized to touch that org's data as if they'd navigated through the organizer dashboard to do it — because authorization was never routed through the UI in the first place. This means: **no new RLS boundary is required for "the organizer dashboard" or "the participant dashboard" as such.** They inherit whatever the underlying tables already enforce.

## 2. Ownership (unchanged)

`user_id = auth.uid()` for all self-owned data (`profiles`, `user_contacts`, `hackathon_applications`, `matching_preferences`, `submissions` via team membership, `mentor_requests` via team membership). Ratifying `docs/RLS_ACCESS_MATRIX.md` as-is — this phase does not touch ownership policies.

## 3. Organization isolation (unchanged, and the reason workspace isolation is "free")

`is_event_organizer(hackathon_id)` and the underlying `organization_members` join already scope every organizer-facing table to "organizations this user belongs to." Because `ROLE_MODEL.md` Scope C defines organizer capability as *exactly* this membership, and defines nothing else as conferring organizer access, there is no daylight between "can this user act as organizer for this org" (the RLS question) and "should this user be able to reach the organizer dashboard for this org" (the routing question, `PRODUCT_FLOWS.md` §4) — they are the same check, asked in two places for two different purposes (data access vs. UI reachability), and must be kept in sync by referencing the same underlying fact (`organization_members` membership), never two independently-maintained checks.

## 4. Participant isolation (unchanged)

A participant reads their own applications, teams (post-formation, safe fields), and revealed contacts only, per `docs/RLS_ACCESS_MATRIX.md` and `docs/PRIVACY_MODEL.md` §4. This phase does not change any of it — a participant's data exposure is identical whether or not they also happen to be an organizer elsewhere; the two capabilities never blend.

## 5. Cross-org access: none, by design, no exceptions this phase

An organizer of Organization A has zero read or write access to Organization B's data, under any condition — not through the workspace switcher (which only ever lists orgs the user actually belongs to, per `PRODUCT_FLOWS.md` §3), not through any new mechanism this phase introduces. Only `platform_admins` crosses organization boundaries, unchanged from the existing matrix.

## 6. Conflict-of-interest boundary: organizer access does not extend to participating, judging, or scoring in that same organization's events

**Status: binding decision, human-approved 2026-07-12.** This supersedes the earlier version of this section, which correctly identified the question but left it open with only a recommendation. It is now decided. As with every other rule in this document, **the decision is recorded here; no enforcement code, migration, or RLS policy is written in PHASE-AUTH-000.** Implementation is `PHASE-AUTH-001`'s (or a later phase's) job, gated on its own approval.

**The rule:**

1. **A user may organize events through organization membership and still participate in events owned by *other* organizations.** This is unchanged and unaffected — cross-org participation was never in question, only same-org conflict of interest.
2. **A user who holds owner/admin/staff (or any future equivalent "manager-tier") access in `organization_members` for a given organization must not participate in, judge, or score an event owned by that same organization, by default.** This is stricter than the previous recommendation in two ways, both intentional: it now covers *participation* as well as judging (the earlier draft would have allowed self-registration with a visible badge; that is no longer the default), and it applies to the full manager-tier of `organization_members.role` (`owner | admin | staff`, `ROLE_MODEL.md` §2 Scope C), not judging alone.
3. **Any future exception must be explicit, auditable, narrowly scoped, and must not silently bypass this boundary.** For example, a small club that genuinely wants its own organizers eligible to compete in their own event would need a deliberate, documented, per-event override mechanism (e.g., an explicit organizer action logged to `audit_logs`, visible to all participants of that event) — never a default, never a silent flag flip, and not designed in this phase. This phase records the *existence* of the exception path as a requirement for whoever designs it later; it does not design the mechanism itself.

**Where this boundary will need to be enforced, once a future phase implements it** (documented here for that phase to consult, not built now):
- `hackathon_applications` insert — should reject (or route to the exception path once one exists) a registration where the applicant has a manager-tier `organization_members` row for the event's `organization_id`.
- `event_roles` insert for `role = judge` (and, once added per `ROLE_MODEL.md` §2, `staff`/`volunteer` where relevant) — same check.
- `judge_scores` — inherits the boundary transitively from `judge_assignments`/`event_roles`, needs no separate check if the assignment-time check above holds.

**Why this is stricter than mere transparency:** the earlier "allow with a badge" framing treated this as a disclosure problem; the approved decision treats it as an eligibility problem — an organizer's structural power over an event (setting criteria, managing registration, seeing operational data) is a real conflict regardless of whether it's disclosed, so the default is exclusion, not disclosure. This is consistent with the platform's existing posture that structural safeguards, not visibility alone, are what "no gaming" claims should rest on (`docs/PRODUCT_DECISIONS.md` D15 — winners are marked by humans, explicitly, never algorithmically, for the same class of integrity reason).

## 7. Sponsor access (unchanged)

No direct table access, no portal, no authenticated sponsor role — ratifying `docs/PRODUCT_DECISIONS.md` D3 and `docs/RLS_ACCESS_MATRIX.md` exactly as they stand. The phase brief's mention of "Sponsor Viewer" in its example role list does not reopen this (see `ROLE_MODEL.md` §2 Scope D).

## 8. Judge access (unchanged today, plus the now-binding conflict-of-interest boundary in §6)

Assigned submissions only, no participant contacts — ratifying existing matrix. §6 above records a **binding** future constraint (no organizing and judging/scoring/participating in the same organization's event, by default) — it does not itself change today's `judge_assignments`/`judge_scores` policies as specified in `docs/RLS_ACCESS_MATRIX.md`; that document is updated only when a future phase actually implements the check.

## 9. Privacy boundaries (unchanged)

The contact-reveal mechanism (`docs/PRIVACY_MODEL.md` §4, `docs/DATABASE.md` `contact_reveals`) is untouched by this phase. A dual-role user's organizer access to registrant contact info still goes through the same audited RPC as any other organizer's — being also a participant confers no shortcut.

## 10. Future audit requirements

- **Workspace switches are not a security-relevant event and should not be written to `audit_logs`** (which is reserved for privacy/access-sensitive actions per `docs/PRIVACY_MODEL.md` §8) — switching dashboards reveals no data and grants no access; logging it would dilute the audit log's signal. If product analytics on workspace usage is ever wanted, that's a separate, non-`audit_logs` telemetry concern, out of scope here.
- **Organization invites** (`organization_invites`, `FUTURE_DATABASE_PLAN.md` §2) should be audit-logged on creation and acceptance — adding a new member to an organization is exactly the kind of access-granting event `audit_logs` already exists to capture (consistent with existing entries like `consent_change`, `winner_marked`).
- **If §6's future exception mechanism is ever implemented**, every use of it must write an `audit_logs` row (actor, organization, event, reason) — per §6.3, exceptions must be auditable by design, not just narrowly scoped. This is the one piece of §6 that does carry a concrete audit requirement, unlike ordinary workspace navigation above.

## 11. What must not be built

Restating for emphasis, since it's the single easiest mistake for a future implementation pass to make: **no "current workspace" column, session field, or context object may ever be read by an RLS policy or a `security definer` function.** Every authorization decision must be derivable from `auth.uid()` plus the existing membership/role tables alone. If a future policy seems to need to know "is this request coming from the organizer dashboard," that is a sign the policy is checking the wrong thing — it should be checking organization/event membership instead, which already answers the real question.
