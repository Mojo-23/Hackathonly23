# Claude Implementation Summary — PHASE-AUTH-000: Role-Aware Authentication & Product Architecture

**Date:** 2026-07-12
**Author:** Claude, acting as Principal Software Architect / Product Architect (per `CLAUDE.md`'s planner/architect authority for backend and infrastructure work).
**Scope:** architecture and documentation only. No backend, database, migration, RLS, auth, UI, or package code was written or modified this phase.

This document replaces all prior `CLAUDE_IMPLEMENTATION_SUMMARY.md` content (the previous version covered the public-experience adoption/consolidation pass, which remains a valid historical record — its substance is preserved in `docs/PHASES.md`'s "Public experience redesign ✅ (adopted)" entry and is not repeated here).

---

## 1. What this phase covered

The first backend architecture phase after the public experience was officially adopted. Per the phase brief: design the complete authentication and account architecture needed to support Hackathonly's two fundamentally different user journeys (Participant, Organizer) as "two products sharing one platform" — without implementing any of it. This document, its seven companion architecture documents, and the staged future task file are the deliverable.

## 2. Files created (all new — nothing existing was modified except `docs/PHASES.md`, see §6)

| File | Purpose |
|---|---|
| `docs/architecture/DECISIONS.md` | The executive ADR — ten numbered decisions (AD-1 through AD-10), each with alternatives considered, chosen approach, and rationale |
| `docs/architecture/AUTH_ARCHITECTURE.md` | Provider/methods, identity model detail, full auth lifecycle, post-login routing table |
| `docs/architecture/ROLE_MODEL.md` | The four-scope contextual role model (platform/identity/organization/event), capability matrix |
| `docs/architecture/DASHBOARD_ARCHITECTURE.md` | Participant vs. Organizer dashboard information architecture, why they're two experiences not one |
| `docs/architecture/PRODUCT_FLOWS.md` | Navigation surfaces, workspace/org switchers, routing/redirect table, deep links, return-URL security |
| `docs/architecture/FUTURE_DATABASE_PLAN.md` | Full table-group inventory (existing groups summarized + new items this phase requires), no SQL |
| `docs/architecture/RLS_STRATEGY.md` | Narrative RLS strategy, the "workspace is UI, not RLS" principle, one flagged open policy question |
| `tasks/PHASE-AUTH-001.md` | Staged (not active) future Codex implementation task — requirements only, no code, explicitly blocked on human approval |

## 3. Decisions made (summary — full reasoning in `docs/architecture/DECISIONS.md`)

1. **Identity model:** one identity per person, for life. No account fork. "Organizer" is not a stored role — it's derived from `organization_members` membership, which already exists in the schema. One new field, `profiles.default_workspace`, records which dashboard a user defaults to; it confers no permission.
2. **Signup flow:** ratifies the existing hybrid email+password + Google decision (`docs/ARCHITECTURE.md` §3). Account-type (workspace) choice happens during onboarding, after identity basics, not before or immediately at signup.
3. **Role model:** four independent, differently-scoped layers — platform (`platform_admins`), identity (`default_workspace`, UX-only), organization (`organization_members.role`: owner/admin/staff), event (`event_roles.role`, recommended extension to add `staff`/`volunteer`). No generic permissions engine. Sponsor Viewer explicitly excluded — ratifies `docs/PRODUCT_DECISIONS.md` D3 (no sponsor auth role).
4. **Organizations:** unchanged — multi-org, multi-admin, multi-membership already supported by the existing schema. One real gap found: no invite mechanism exists yet (`organization_invites` is a new required table).
5. **Dashboards:** two independent route-group experiences (`(participant)`, `(organizer)` — already the shape `docs/ROUTES.md` committed to) sharing one design system, not one dashboard with a role flag.
6. **Navigation:** role-aware nav, workspace switcher (visible only if ≥1 org membership) and org switcher (visible only if ≥2 orgs), all server-enforced, with a validated `next` return-URL pattern.
7. **Database planning:** `docs/DATABASE.md` remains authoritative for everything it already specifies (12 table groups, 16 data flows). This phase adds only: `profiles.default_workspace`, `organization_invites`, optionally `profiles.last_active_organization_id`, an `event_roles` enum extension, and flags a future Notifications group as a documented gap (not built).
8. **RLS strategy:** existing deny-by-default, contextual-helper-function pattern (`docs/RLS_ACCESS_MATRIX.md`) holds unchanged. Core new principle made explicit: workspace/UI context must never be read by any RLS policy — authorization is always derived from `auth.uid()` plus membership tables. One open product-policy question flagged, not resolved: should an organizer be allowed to register as a participant or serve as a judge in their own organization's event? (Recommendation given, human sign-off required before any enforcement is built.)
9. **Auth lifecycle:** existing lifecycle (`docs/ROUTES.md`, `docs/ARCHITECTURE.md`) ratified; onboarding gains the workspace-choice step and, conditionally, an organization-creation-or-invite-acceptance step.
10. **Future scalability:** the identity/role/organization model is already geography- and org-type-agnostic. Two additive fields (`hackathons.visibility`, `hackathon_invites`) are recommended for a later phase to fully cover private/company-internal events — neither required now, neither changes anything existing.

## 4. Alternatives rejected (see `docs/architecture/DECISIONS.md` for full reasoning on each)

- **Hard account fork at signup** (permanent Participant-or-Organizer account type) — rejected, breaks the dual-role requirement and is expensive to unwind later for real users.
- **Global mutable `role` column** on `profiles` — rejected, duplicates what `organization_members` already tells you and risks drifting out of sync.
- **Generic fine-grained permissions engine** (configurable ACL tables) — rejected as over-engineering for the actual scale and needs; four contextual scopes using existing tables are sufficient.
- **One dashboard with role-conditional modes** — rejected; contradicts the phase brief's own "two products sharing one platform" framing and tends toward either an unmanageable branching component or a de-facto two-app split with worse routing.
- **Two fully independent applications/deployments** — rejected as overkill; one Next.js app with two route groups (already the existing shape) achieves the separation without operational duplication.
- **Choosing account type before or immediately at signup** — rejected; both add friction or force a premature/adversarial framing for a person who may turn out to be both participant and organizer.
- **Persisting "current workspace" server-side as an authorization signal** — rejected; workspace must remain a client-side UX convenience only, never trusted by RLS (this is the single most important guardrail this phase establishes for future implementers).

## 5. Risks and open questions

- **Organizer-as-participant / organizer-as-judge conflict of interest** (`docs/architecture/RLS_STRATEGY.md` §6) — genuinely open, requires a human product-policy decision before `PHASE-AUTH-001` or any later phase implements judge-assignment enforcement. A recommendation is given (allow self-registration with a visible "organizer of this event" flag; disallow self-judging by default) but is explicitly not treated as decided.
- **`organization_invites` is new schema, not previously anywhere in `docs/DATABASE.md`** — a genuine gap found during this phase, not a redesign of anything that worked before. Flagged clearly so it isn't mistaken for scope creep when `PHASE-AUTH-001` eventually builds it.
- **Notifications** is a foreseeable near-future table group with zero design yet — deliberately deferred, not designed here, to avoid inventing it ad hoc without its own ADR later.
- **Exact UX treatment** of the workspace/org switchers (dropdown vs. pill vs. modal, copy, placement) is explicitly left to a future Design Authority pass — this phase specifies visibility rules and behavior only, not visuals.

## 6. Documentation touched

- `docs/PHASES.md` — no change required this phase; the "Next planned phase — Role-Aware Authentication and Dashboard Architecture" entry already added in the prior consolidation pass correctly anticipated this work and needs no edit. Verified by re-reading it before starting this phase.
- All seven new `docs/architecture/*.md` files are new; nothing in `docs/DATABASE.md`, `docs/RLS_ACCESS_MATRIX.md`, `docs/PRODUCT_DECISIONS.md`, `docs/PRIVACY_MODEL.md`, `docs/ROUTES.md`, or `docs/ARCHITECTURE.md` was edited — every decision in this phase either ratifies what those documents already say (called out explicitly, decision by decision, in `DECISIONS.md`) or adds something genuinely new without contradicting them. This was verified by reading all six of those documents in full before writing anything.

## 7. Recommended implementation order

1. **`PHASE-AUTH-001`** (staged at `tasks/PHASE-AUTH-001.md`, not active) — schema foundation (`default_workspace`, `organization_invites`, optionally `last_active_organization_id`) + onboarding flow + routing/redirect middleware. No dashboard UI.
2. **A follow-up phase** (not yet drafted) — Participant Dashboard content, built against the now-real `default_workspace`/routing foundation.
3. **A follow-up phase** (not yet drafted) — Organizer Dashboard content, including the org switcher UI and the command-center surface already specified in `docs/ROUTES.md`/`docs/ARCHITECTURE.md`.
4. **Only after both dashboards exist and are stable:** the `event_roles` enum extension (`staff`, `volunteer`) and the organizer-conflict-of-interest policy decision from `RLS_STRATEGY.md` §6 — neither blocks 1–3, so both should wait rather than add scope to the foundation task.

## 8. What Codex will implement first, and what should wait

**First (once approved):** `PHASE-AUTH-001` exactly as scoped in `tasks/PHASE-AUTH-001.md` — schema + onboarding + routing, nothing more. Both required approvals (migration, RLS) are explicitly marked **not yet given** in that file; a human must approve them before Codex starts.

**Should wait:**
- Any dashboard UI (needs its own task and, likely, Design Authority involvement for the switcher components).
- The `event_roles` enum extension (`staff`, `volunteer`) — no consumer for it yet.
- Any enforcement of the organizer-conflict-of-interest question — needs a human product decision first, not just a technical implementation.
- `hackathons.visibility` / `hackathon_invites` / `organizations.category` — all explicitly future-scalability items, no current product need.
- A Notifications table group — undesigned, would be invented ad hoc if built now.

---

No backend, database, migration, RLS, auth, frontend, or package file was created, modified, or deleted this phase, other than the eight new documentation/task files listed in §2. Nothing was committed or pushed.
