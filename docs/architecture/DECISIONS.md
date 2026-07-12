# PHASE-AUTH-000 — Architecture Decision Record

**Status:** architecture-only. Nothing in this document, or any document it links to, has been implemented. No migration, RLS policy, auth code, or UI has been written as part of this phase.

**Author:** Claude, acting as Principal Software Architect / Product Architect per `CLAUDE.md`'s planner/architect authority for backend and infrastructure work.

**Scope:** this is the first backend architecture phase after the public experience (`docs/PHASES.md` → "Public experience redesign ✅ (adopted)") was officially adopted. It answers the ten questions posed in the phase brief and produces the artifact set Codex will later implement against.

This file is the executive decision log — one entry per topic, each with the alternatives considered, the recommendation, and why. The supporting documents (`AUTH_ARCHITECTURE.md`, `ROLE_MODEL.md`, `DASHBOARD_ARCHITECTURE.md`, `PRODUCT_FLOWS.md`, `FUTURE_DATABASE_PLAN.md`, `RLS_STRATEGY.md`) contain the full specification each decision implies. Where an existing doc (`docs/DATABASE.md`, `docs/RLS_ACCESS_MATRIX.md`, `docs/PRODUCT_DECISIONS.md`, `docs/ROUTES.md`) already made a relevant call, that call is treated as binding precedent, not re-litigated — this ADR either **ratifies** it explicitly or **extends** it where the phase brief's questions go further than the existing docs do. Every such case is called out.

---

## AD-1 — Identity model: one identity, contextual capabilities, no account fork

**Question:** should a user always have exactly one account? Can they own multiple organizations? Can they participate and organize simultaneously? Can they switch? Should "Organizer" be a role, or should organization membership define permissions?

**Alternatives considered:**

1. **Hard account fork at signup** — a user is permanently either a "Participant account" or an "Organizer account," stored as an immutable type, with separate signup paths and no way to hold both. Rejected: contradicts the phase brief's own requirement to "consider whether a person can hold both roles in the future," and is factually wrong for the target market — a university club president who *organizes* their club's hackathon is exactly the kind of person who also *participates* in a hackathon at a partner university. A hard fork would force them into two separate accounts, which breaks identity, breaks the future talent graph (`docs/PRODUCT_DECISIONS.md` D8), and is expensive to unwind later (migrating a real user's history across two account rows is a genuinely hard, risky migration).
2. **Global `role` enum on `profiles`** (`participant | organizer | admin`) mutated in place when a user "becomes" an organizer. Rejected: a global mutable role column collapses the moment a person needs to be both at once, and it duplicates information that already exists structurally — `organization_members` already tells you who can act as an organizer, for which org, at what level. A second, parallel source of truth for "is this person an organizer" invites the two to drift out of sync (e.g., last org membership removed but the flag never flipped).
3. **One identity, capabilities derived from context (recommended).** A user has exactly **one `profiles` row for life** (unchanged from the existing schema — this is not new). "Participant" is not a stored role at all: any authenticated user can register for a hackathon, so participation capability is implicit and universal, evidenced by the existence of `hackathon_applications` rows, not by a flag. "Organizer" capability is **derived from `organization_members` membership** — a user is "acting as organizer" for exactly the organizations where they hold a row in that table (already true of the existing schema, §DATABASE.md §1). Nothing about being a participant blocks becoming an organizer, or vice versa — they are independent, additive capabilities on the same identity, not mutually exclusive states.

**Decision: option 3.** A person can own or belong to multiple organizations (already permitted by the existing schema — no uniqueness constraint prevents a user from appearing in `organization_members` for several `organization_id`s). A person can participate and organize simultaneously, including — a genuinely new observation this phase surfaces — potentially participating in *their own organization's* event, which is flagged as an open product-policy question in `RLS_STRATEGY.md` §6, not resolved here.

**One new, narrow addition to identity data** (a column, not a new table, not a new role system): `profiles.default_workspace` (`participant | organizer`), chosen once at onboarding, used **only** to pick which dashboard a user lands on immediately after login. It is a UX default, not a permission gate, not exclusive, and changeable later from account settings. Full rationale in `AUTH_ARCHITECTURE.md` §2 and `ROLE_MODEL.md` §1.

**Why this is the cleanest architecture:** it requires zero migration if a participant later organizes (they just create/join an org — the capability appears automatically), it matches the schema that already exists (no retrofit), and it makes "can a person hold both roles" not a future feature to build, but a fact that's already true today of the identity model — only the *dashboard UI* needs to catch up, which is exactly what `DASHBOARD_ARCHITECTURE.md` and `PRODUCT_FLOWS.md` specify.

---

## AD-2 — Signup flow: hybrid email + Google, account-type choice deferred to onboarding

**Question:** email? password? Google? magic link? hybrid? When is account type chosen — before signup, after signup, or during onboarding?

**Alternatives considered (auth method):**

1. **Email + password only.** Rejected as sole method: highest signup friction of the available options; password reuse/reset support burden; nothing about the Jordan target audience (university students, corporate/NGO organizers) favors it over federated auth.
2. **Google OAuth only.** Rejected as sole method: excludes users who prefer or are institutionally required to use a non-Google email (some university and government-affiliated email systems), and removes a fallback if OAuth has an outage or a user's Google account is unusable in-session.
3. **Magic link only.** Rejected: elegant on paper, but email deliverability and latency in the Jordan market is not reliable enough to be a sole path (spam filtering on university/corporate mail is inconsistent), and it doesn't fully replace password because organizers may want to hand out event-day credentials without depending on live email access at a venue with weak connectivity.
4. **Hybrid: email + password, and Google OAuth, both first-class (recommended).** This is what `docs/ARCHITECTURE.md` §3 already committed to ("Supabase Auth via `@supabase/ssr`; email/password + Google OAuth") — this ADR **ratifies** that decision rather than reopening it, because nothing in this phase's brief surfaces a reason to change it. Magic link is noted as a plausible V2 addition (low implementation cost on top of Supabase Auth) but not required for V1; it does not change the account/role architecture either way, so it is deferred rather than decided against on principle.

**Decision (auth method): hybrid email+password + Google, ratifying the existing stack decision. Magic link deferred, not rejected.**

**Alternatives considered (when account type is chosen):**

1. **Before signup** (e.g., two different "Sign up as Participant" / "Sign up as Organizer" buttons/forms on the landing page). Rejected: this *is* the hard-fork pattern from AD-1 in disguise — it implies two different signup flows, duplicates auth logic, and pressures a visitor to declare an identity before they've even created an account, which is exactly backwards for a person who will turn out to be both. It also fights the existing public IA (`docs/ROUTES.md` already has separate `/participants` and `/organizers` *marketing* pages, but those are informational, not signup forks).
2. **Immediately after signup, before any onboarding content** (a single interstitial "Are you a Participant or Organizer?" screen with nothing else). Rejected as the *only* onboarding step: it's the right question but the wrong isolation — asking it with zero context before the user has even entered their name reads as an interrogation, not an introduction, and doesn't let the product explain what each choice means.
3. **During onboarding, after identity basics, before dashboard routing (recommended).** The existing `/onboarding` route (`docs/ROUTES.md` §Auth) already sits exactly here in the flow — this ADR **extends** it (not replaces it) by inserting the `default_workspace` choice as one of its steps, alongside the identity fields onboarding already collects (name, university, role, skills per `docs/DATABASE.md` §1 `profiles`). Full flow in `AUTH_ARCHITECTURE.md` §4.

**Decision (timing): during onboarding**, presented with brief, honest framing (e.g., "How will you mostly use Hackathonly?" with a note that this can be changed later and doesn't lock anything).

---

## AD-3 — Role model: contextual roles over a global RBAC table

**Question:** design the permission model for Participant, Organizer, Organization Owner, Organization Admin, Judge, Mentor, Volunteer, Staff, Sponsor Viewer, etc. Roles? Capabilities? Permissions? Organization memberships? Separate tables?

**Alternatives considered:**

1. **Generic fine-grained permissions engine** — a `permissions` table + `role_permissions` + `user_permissions` allowing arbitrary capability grants, admin-configurable. Rejected: this is the over-engineering trap the brief warns against implicitly by asking for "the cleanest scalable model," not the most flexible one. At Hackathonly's actual scale (dozens of orgs, single-digit roles per context), a generic ACL engine adds a whole subsystem (UI to manage it, migration complexity, RLS policies that must consult it dynamically instead of a cheap enum check) to solve a flexibility problem that doesn't exist yet. `docs/RLS_ACCESS_MATRIX.md` §Enforcement notes already commits to `security definer` helper functions over one-line-readable policies — a dynamic permissions engine works against that simplicity goal.
2. **One flat global role enum per user** (`participant | organizer | judge | mentor | admin`). Rejected: collapses under multi-context reality immediately — a person can be a judge for one event and a mentor for another in the same week (existing `event_roles` schema already allows this per-event, correctly). A flat global enum can't express "judge for event A, mentor for event B, ordinary participant for event C."
3. **Contextual roles, layered by scope, using the tables that already exist plus small additions (recommended).** Four independent layers, each answering "what can this user do, and where":
   - **Platform layer:** `platform_admins` (existing, unchanged) — cross-organization administrative access.
   - **Identity layer:** `default_workspace` (new, from AD-1) — UX default only, confers no permission.
   - **Organization layer:** `organization_members.role` (existing: `owner | admin | staff`) — controls what a user can do *inside a specific organization* (create/edit hackathons, manage org members, later: billing). This is where "Organization Owner" and "Organization Admin" from the brief's example list already live — they are not new roles, they are the existing `organization_members.role` enum, correctly scoped.
   - **Event layer:** `event_roles` (existing: `judge | mentor`) — controls what a user can do *inside a specific event*, independent of organization membership (a judge is not necessarily an org member). This ADR recommends **extending the enum** (schema note, not implementation) to add `staff` and `volunteer` as the brief's examples request — both fit the exact same per-event, non-org-member shape as judge/mentor. **Sponsor Viewer is explicitly not added here or anywhere** — `docs/PRODUCT_DECISIONS.md` D3 already rejected a sponsor portal/auth-role for V1, and nothing in this phase's brief overrides that; sponsors remain recipients of organizer-generated reports only, never an authenticated role. This is a ratification of D3, called out explicitly because the brief's example list could be misread as reopening it.

**Decision: option 3 — contextual roles across four scopes, using existing tables (`platform_admins`, `organization_members`, `event_roles`) plus one new column (`default_workspace`) and one enum extension (`event_roles.role` gains `staff`, `volunteer`).** No new permissions table, no new roles table. Full model in `ROLE_MODEL.md`.

**"Participant" is deliberately not a role anywhere in this model** — it is the default capability every authenticated identity has, evidenced by data (applications, teams, submissions), not granted by a row. This is consistent with `docs/DATABASE.md`, which has never had a `participants` table.

---

## AD-4 — Organizations: unchanged, ratified

**Question:** should organizers create organizations? Can organizations own multiple hackathons? Can multiple admins manage one organization? Can someone belong to several organizations?

**Decision: yes to all four — this is already the existing schema (`docs/DATABASE.md` §1 `organizations`, `organization_members`; §2 `hackathons.organization_id`).** This phase does not change the organization model. The one gap this phase surfaces: **there is currently no invite mechanism for organizations** — `organization_members` rows exist, but nothing in the current schema describes how a second admin gets added short of a direct (currently-unspecified) insert path. This is flagged as a new required table, `organization_invites`, in `FUTURE_DATABASE_PLAN.md` §2 — a genuine gap, not a redesign of anything that already works.

---

## AD-5 — Dashboards: two independent experiences sharing one design system, not one dashboard with modes

**Question:** one dashboard with modes, or two independent applications? Tradeoffs?

**Alternatives considered:**

1. **One dashboard, mode-switched** — a single `/dashboard` route that renders different content based on `default_workspace` or a runtime toggle, sharing layout chrome and switching only the body. Rejected: this is exactly the shape the phase brief's Product Vision section argues against — "These are NOT the same experience. They are two products sharing one platform." A single route with conditional rendering tends toward one of two failure modes in practice: either it grows a tangle of `if (isOrganizer)` branches that make the component impossible to reason about and impossible to RLS-gate cleanly at the route level, or it gets abstracted into "modes" that are really just two components wearing one route's clothing — at which point you've built option 2 anyway, with worse routing.
2. **Two fully independent applications** (separate deployments, separate codebases, possibly separate subdomains). Rejected as overkill: Hackathonly is one product with one design system, one auth provider, one deployment target (`docs/ARCHITECTURE.md` §7 — Vercel + Supabase). Splitting deployments buys isolation the product doesn't need yet and multiplies operational cost (two build pipelines, two places to keep the design system in sync, cross-app auth handoff complexity) for no corresponding benefit at this scale.
3. **Two independent route-group experiences within one Next.js app, sharing the component/design-system layer (recommended).** This is already the shape `docs/ROUTES.md` committed to: `(participant)` and `(organizer)` are already separate route groups with separate layouts, separate navigation, separate landing routes (`/dashboard` vs `/organizer`). This ADR **ratifies and sharpens** that existing decision: the two dashboards are to be built and reasoned about as **two separate products that happen to share a design system, an identity provider, and a deployment**, not as one dashboard with a role flag. Concretely: no shared "Dashboard" component branching on role; each route group owns its own layout, nav, and page components, importing shared primitives (`StatusBadge`, `MetricCard`, motion primitives, etc.) the same way both already plan to.

**Decision: option 3.** Full specification, including how a dual-role user moves between the two without them merging into a single confusing surface, in `DASHBOARD_ARCHITECTURE.md`.

---

## AD-6 — Navigation, routing, redirects: role-aware, workspace-switch as an explicit affordance, server-enforced

**Question:** anonymous/authenticated/participant/organizer navigation, org switcher, workspace switcher, routing, redirects, deep links, return URLs.

**Decision, in summary (full detail in `PRODUCT_FLOWS.md`):**

- **Anonymous nav is unchanged** from the already-adopted public experience (`Hackathons / Participants / Organizers / Blog`, no Dashboard link) — this phase does not touch it.
- **Authenticated nav forks by which dashboard the user is currently in** — participant nav and organizer nav are two distinct nav components, not one nav with conditional items, consistent with AD-5.
- **Workspace switcher** (participant ↔ organizer) appears only for dual-capability users — i.e., only rendered when the signed-in user has ≥1 `organization_members` row. A participant-only user never sees it; there is nothing to switch to.
- **Organization switcher** (within the organizer dashboard) appears only when a user belongs to ≥2 organizations.
- **Post-login routing** is a deterministic function of `default_workspace` and current `organization_members` count — not a redirect to a static route. Table in `AUTH_ARCHITECTURE.md` §5.
- **Return URLs** use a validated `next` query parameter (same-origin allow-list only, to prevent open-redirect) — standard pattern, not a new mechanism, but stated explicitly here because it wasn't previously documented.
- **Role enforcement for all of the above is server-side** — middleware/layout guards decide what's reachable; navigation UI only decides what's *shown*. This is a hard requirement carried over unchanged from the binding decision recorded in the prior phase's `handoff/CLAUDE_IMPLEMENTATION_SUMMARY.md`.

---

## AD-7 — Database planning: extend, don't redesign

**Question:** list every table the future system will likely require, grouped, with responsibilities. No migrations.

**Decision:** `docs/DATABASE.md` already specifies the large majority of this system in detail (12 groups, 16 data flows) and remains the source of truth for everything it already covers. This phase's `FUTURE_DATABASE_PLAN.md` does two things only: (1) restates the existing groups at a summary level so this ADR set is self-contained and reviewable without cross-referencing a second document for every line, and (2) calls out the **specific new items this phase's questions surface** that `DATABASE.md` does not yet have: `profiles.default_workspace` (column), `organization_invites` (table, from AD-4), an optional `profiles.last_active_organization_id` (column, pure UX convenience, explicitly marked optional/deferrable), and a **Notifications** table group (net-new — dashboards for both personas will need it, and it doesn't exist in `DATABASE.md` yet). No table already specified in `DATABASE.md` is redesigned, renamed, or removed by this phase.

---

## AD-8 — RLS strategy: existing pattern holds; workspace isolation is UI-layer; conflict-of-interest boundary is now binding

**Question:** ownership, organization isolation, participant isolation, cross-org access, sponsor access, judge access, privacy boundaries, future audit requirements — no SQL.

**Decision:** `docs/RLS_ACCESS_MATRIX.md`'s existing deny-by-default, contextual-role pattern (`is_event_organizer`, `is_event_judge`, `is_event_mentor`, `is_platform_admin` security-definer helpers) is **ratified and extended, not replaced**. What this phase adds:

- **Workspace isolation is a UI/routing concern, not a new RLS boundary.** Because "organizer" is derived from `organization_members` (AD-1) and every organization-scoped table already checks that membership, there is no new privacy boundary to invent for "the organizer dashboard" as such — it inherits the org-scoping RLS that already exists per table. This is a deliberate simplification this ADR is making explicit: **do not build a parallel "workspace" permission layer** — route guards decide what UI is reachable, existing table-level RLS decides what data is readable, and the two must never be allowed to drift (route guard says yes, RLS says no, is an acceptable fail-safe; the reverse is a bug).
- **Conflict-of-interest boundary — binding decision, human-approved 2026-07-12 (supersedes the earlier open-question framing of this ADR):** a user holding owner/admin/staff (manager-tier) access in `organization_members` for an organization must not participate in, judge, or score an event owned by that same organization, by default. Cross-organization participation is unaffected. Any future exception must be explicit, auditable, narrowly scoped, and never a silent default. Full rule and enforcement-point notes in `RLS_STRATEGY.md` §6. **This phase records the decision only — no RLS policy, RPC check, or migration enforcing it is written until a future, separately-approved phase implements it.**
- **Sponsor and judge access boundaries are otherwise unchanged** — ratifying `docs/PRIVACY_MODEL.md` §5 and `docs/RLS_ACCESS_MATRIX.md` as-is, aside from the conflict-of-interest boundary above.

Full detail in `RLS_STRATEGY.md`.

---

## AD-9 — Authentication lifecycle: onboarding gains one step, everything else is confirmed as-is

**Question:** anonymous → signup → verification → onboarding → role selection → organization creation → dashboard routing → logout → returning user.

**Decision:** the lifecycle `docs/ROUTES.md` and `docs/ARCHITECTURE.md` already imply is correct and is ratified; this phase's only substantive addition is inserting the `default_workspace` choice and, for organizer-intent users with zero organizations, an organization-creation-or-join step, into the existing `/onboarding` route before first dashboard routing. Full step-by-step in `AUTH_ARCHITECTURE.md` §4.

---

## AD-10 — Future scalability: the model is already geography- and org-type-agnostic; two additive fields cover what's missing

**Question:** multiple universities, international hackathons, company hackathons, private hackathons, internal company events, incubators, accelerators.

**Decision:** the identity/role/organization model from AD-1–AD-4 makes no assumption anywhere about Jordan, universities, or public-only events — `organizations` is already a generic entity type, and multi-org membership already supports one person operating across a university club, a company, and an accelerator simultaneously. Two genuinely new, purely additive fields are recommended for later phases (not this one) to fully cover the brief's scalability list: `hackathons.visibility` (`public | unlisted | private`, for company-internal/invite-only events — currently every published hackathon is implicitly public) and a corresponding `hackathon_invites` table for the private case. Both are additive — no existing table or policy needs to change to support them later. Full reasoning in `FUTURE_DATABASE_PLAN.md` §5 and `AUTH_ARCHITECTURE.md` §7.

---

---

## AD-11 — First-run onboarding signal and canonical organizer destination (human-approved 2026-07-12, `AUTH-002-PRE`)

**Question, surfaced by `AUTH-002A`'s architecture-decision gate, not by the original ten:** how is a first-time user (needs the workspace-choice onboarding step) distinguished from a returning user, given `default_workspace` always has a value? And: the routing table names `/organizer` as the organizer landing destination, but does that route actually exist?

**Decision 1 — persisted first-run signal.** `profiles.initial_onboarding_completed_at timestamptz null` — approved for `AUTH-002A` implementation under a separately approved migration; **not implemented by `AUTH-002-PRE`**. `null` means the first-run workspace-choice step has not been completed; a timestamp means it has. Alternatives considered: a generic `onboarding_completed` boolean (rejected — the timestamp is no more expensive to store and is more useful for audit/support than a boolean, and "onboarding" as a single boolean invites conflating this narrow first-run signal with the much larger, later participant-profile-completeness concern); inferring first-run status from existing signals like the `full_name` placeholder (rejected — unreliable for Google signups, which get a real name immediately, and was never an approved semantic); no persisted signal at all, relying on the signup code path alone (rejected — unreliable for OAuth, where the callback route can't cleanly distinguish new from returning without a fragile heuristic). Full semantics in `AUTH_ARCHITECTURE.md` §4a — critically, this field is **not** participant profile completeness (that's `PROFILE-001`/`PROFILE-002`, later), and **not** authorization (same rule as `default_workspace`, AD-1).

**Decision 2 — `/organizer` is the canonical, real organizer destination, built now, not deferred.** The routing table (`AUTH_ARCHITECTURE.md` §5) already named `/organizer` as the landing route for an organizer-first user with ≥1 membership, but `docs/ROUTES.md` (post-`AUTH-001`) recorded it as not yet built — a real gap the gate caught before `AUTH-002A` could build an organizer-onboarding action with nowhere real to redirect to. Alternative considered and explicitly rejected: redirecting a freshly-bootstrapped organizer to `/dashboard` as a temporary fallback until a real `/organizer` page shipped. Rejected because it would violate AD-5's "two separate products" framing at exactly the moment it matters most (a brand-new organizer's very first landing) and because a fallback like this tends to become permanent by inertia. Resolved instead by building a real, minimal, honest `/organizer` workspace shell in `AUTH-002-PRE` itself (`src/app/organizer/page.tsx`) — no mock data, no dead buttons, an honest "workspace ready" empty state — so the canonical destination genuinely exists before any onboarding action is built to redirect to it.

**Decision 3 — email verification policy, environment-scoped.** Local development may run with `enable_confirmations = false` (already true of this repo's `supabase/config.toml`) for practical automated testing. Production requires email verification to complete before a user may complete initial onboarding (i.e., before `initial_onboarding_completed_at` may be set). This is a policy statement for a future hosted-environment configuration pass, not something `AUTH-002-PRE` or any local-only phase implements — no hosted Supabase configuration was touched, no remote command was run, no production key was introduced.

**Consequences:** `AUTH-002A` may now proceed to specify the migration adding `initial_onboarding_completed_at` and the organizer-onboarding action's redirect target (`/organizer`, now real) without either of the two gaps that previously blocked it.

---

## Summary table

| # | Topic | Decision | New schema this phase implies (not built) |
|---|---|---|---|
| 1 | Identity model | One identity; capabilities derived from context, not a global role | `profiles.default_workspace` |
| 2 | Signup flow | Hybrid email+Google (ratified); account-type chosen during onboarding | none |
| 3 | Role model | Contextual roles across 4 scopes (platform/identity/org/event) | `event_roles` enum gains `staff`, `volunteer` |
| 4 | Organizations | Unchanged; multi-org, multi-admin, multi-membership all already supported | `organization_invites` |
| 5 | Dashboards | Two independent route-group experiences, shared design system | none (routing/UI only) |
| 6 | Navigation | Role-aware nav, workspace/org switchers gated on capability, server-enforced | none (routing/UI only) |
| 7 | Database planning | Extend `DATABASE.md`, don't redesign it | see `FUTURE_DATABASE_PLAN.md` |
| 8 | RLS strategy | Existing pattern holds; workspace isolation is UI-layer; conflict-of-interest boundary now binding (no self-org participation/judging/scoring by default) | none this phase (future enforcement point flagged) |
| 9 | Auth lifecycle | Existing lifecycle ratified; onboarding gains the workspace-choice step | none |
| 10 | Future scalability | Already supported; two additive fields cover remaining gaps | `hackathons.visibility`, `hackathon_invites` |

Nothing in this table has been implemented. See `PHASE-AUTH-001.md` for what Codex should build first, once this ADR is approved.
