# Auth Architecture — PHASE-AUTH-000

**Status: architecture specification, not implemented.** Companion to `DECISIONS.md` (see AD-1, AD-2, AD-9 for the decision rationale this document specifies in detail). No code, migration, or RLS policy exists yet.

---

## 1. Provider and methods

Supabase Auth via `@supabase/ssr`, cookie-based SSR sessions — ratifying `docs/ARCHITECTURE.md` §3, not changing it.

- **Email + password.** Standard signup/login; Supabase handles hashing, reset flow.
- **Google OAuth.** Primary low-friction path for the Jordan student/professional audience.
- **Magic link.** Not V1. Deferred (not rejected) — see `DECISIONS.md` AD-2. Nothing in this architecture blocks adding it later; it plugs into the same `profiles` creation trigger as the other two methods.

Both V1 methods converge on the same post-auth path: Supabase issues a session → `auth.users` row exists → signup trigger creates a minimal `profiles` row (per `docs/PRODUCT_DECISIONS.md` D17, unchanged by this phase) → user is routed into onboarding if `profiles` is still incomplete.

## 2. What "account type" actually is

Per `DECISIONS.md` AD-1, there is no account type in the sense of a fork. There are exactly two new fields, added at different times:

- **`profiles.default_workspace`** — enum `participant | organizer`. Chosen once during onboarding (§4). Determines only the **default landing destination** after login (§5). Never consulted by RLS, never gates a capability, always changeable later (e.g., from `/profile` or account settings — exact surface is a UI decision for the implementation phase, not fixed here). **Implemented** — `AUTH-001`.
- **`profiles.initial_onboarding_completed_at`** — `timestamptz null`, **approved by the human 2026-07-12, not yet implemented — planned for `AUTH-002A` under separately approved migration.** `null` means the user has not yet completed the first-run workspace-selection flow described in §4; a timestamp means they have. This field is **workflow/preference state only**, exactly like `default_workspace` — it must never appear in an RLS policy predicate or a `security definer` authorization check, and it must never be treated as, or replace, `organization_members` as the source of organizer authority. See §4a for the precise semantics and the distinction from participant profile completeness.

Both fields are intentionally the *only* new identity-level concepts this phase introduces. Everything else (who can act as an organizer for which org, who can judge which event) is derived from existing membership tables (`organization_members`, `event_roles`), not from a field on `profiles`.

## 4a. `initial_onboarding_completed_at` — exact semantics (binding, human-approved 2026-07-12)

This section exists because `AUTH-002-PRE`'s architecture-decision gate surfaced a real, previously-unresolved gap: nothing in the original phase specified how a first-time user (who needs to see the workspace-choice step in §4.4) is distinguished from a returning user, and `default_workspace`'s `not null default 'participant'` shape means every profile "has" a workspace value from the instant it's created — there is no unset state to detect a first visit from. The human resolved this with a persisted, narrowly-scoped signal rather than a fragile heuristic (e.g., inferring "new" from the `full_name` placeholder) or silently dropping the onboarding gate.

**Column (planned, `AUTH-002A`):** `profiles.initial_onboarding_completed_at timestamptz null`.

**What it means:**
- `null` — the user has not yet completed the first-run "how will you mostly use Hackathonly" workspace-choice step from §4.4. They should be routed to that step, not straight to a dashboard, the next time they authenticate.
- A timestamp — the user has completed that step at least once. They are routed by the ordinary post-login routing table (§5) from then on, exactly as before this field existed.

**What it explicitly does NOT mean, stated three times because this is the exact thing to not get wrong:**
1. **It is not participant profile completeness.** A fuller participant profile — university, major, graduation year, GitHub/LinkedIn/portfolio links, primary role, skills, experience level, availability, matching preferences, and privacy/contact consent — is a separate, later concern, to be designed and implemented in `PROFILE-001`/`PROFILE-002`, not this phase. A participant can complete initial onboarding (pick "participant," land on `/dashboard`) and still be correctly blocked later from joining a matching pool or registering for an event until those separate, richer profile-completeness checks pass. `initial_onboarding_completed_at` answers exactly one question — "has this person ever been asked participant-vs-organizer" — and no other.
2. **It is not authorization.** Identical rule to `default_workspace`: never read by an RLS policy, never read by a `security definer` function, never a gate on any table access. Organizer authority remains derived exclusively from `organization_members` (`DECISIONS.md` AD-1, unchanged).
3. **It is not a role, account type, or capability flag.** No `profiles.role`, no `profiles.is_organizer`, no `account_type` — none of these exist, and this field does not become a disguised version of any of them. It is purely "has this person seen the first-run choice screen," nothing more.

**Why a persisted column and not a transient/session-derived signal:** a signup-path-based detection (e.g., "just signed up, so show onboarding") works cleanly for email/password but is unreliable for Google OAuth, where the callback route can't cleanly distinguish "just created" from "already existed" without a fragile timestamp-proximity heuristic. A durable, explicit column removes that ambiguity for both providers uniformly, at the cost of one nullable, non-authorization column — judged the better trade-off given the alternative was inventing a heuristic with a known failure mode.

## 3. Sessions and dual-role users

A session is one authenticated identity — never two. A dual-role user (participant activity + organizer capability) does not have two sessions or two logins; they have one session that can be **in** one of two workspace contexts at a time, tracked client-side (e.g., a cookie or local UI state noting "currently viewing: organizer, org X"), never server-authoritative. This matters because:

- Server-side authorization must never trust "which workspace the user says they're in" — every organizer-scoped request is authorized by `organization_members` membership at request time, regardless of what the UI currently displays. The workspace concept is a navigation convenience, not a security boundary (this is stated more fully in `RLS_STRATEGY.md` §1).
- Switching workspace is therefore just a client-side navigation event (go to `/organizer` vs `/dashboard`) gated by a layout-level check ("does this user have ≥1 organization_members row"), not a re-authentication or a session mutation.

## 4. Full lifecycle, step by step

1. **Anonymous.** No session. Public site only (`docs/PHASES.md`, public experience — unchanged by this phase). No Dashboard link exists anywhere in anonymous navigation.
2. **Signup.** User picks email+password or Google on `/auth`. On success, Supabase creates `auth.users`; the existing D17 trigger creates a minimal `profiles` row (`full_name` from OAuth metadata, or the `New participant` placeholder for email signup).
3. **Verification.** Email+password: Supabase's standard email-confirmation flow. **Policy, human-approved 2026-07-12:** local development may keep `enable_confirmations = false` (as this repo's `supabase/config.toml` currently has it) to keep local automated development and testing practical — a session is issued immediately on signup locally, with no confirmation gate. **Production requires email verification before the user completes initial onboarding** (i.e., before `initial_onboarding_completed_at` may be set) — this is a policy requirement for the hosted environment, not something this or any local-only phase implements; it does not change hosted Supabase configuration, does not use remote Supabase commands, and introduces no production keys. Google: no separate verification step — OAuth is the verification, in both environments.
4. **Onboarding** (`/onboarding`, existing route, gains one new step this phase). Order matters — identity basics before the workspace question, so the choice is made by someone who already feels like they have an account, not a stranger being interrogated (`DECISIONS.md` AD-2 rationale). **Whether a user is routed into this step at all, versus straight to their dashboard, is now determined by `initial_onboarding_completed_at` being `null`** (§4a) — not by any heuristic on profile fields:
   1. Identity basics: full name, university/organization affiliation, primary role, experience level — existing `profiles` fields, unchanged.
   2. **Workspace choice** (new): "How will you mostly use Hackathonly?" → sets `default_workspace` and, on completion of this step, sets `initial_onboarding_completed_at = now()`. Copy should make clear this is a starting point, not a lock — e.g., a one-line note that organizing and participating can both happen on the same account.
   3. If `default_workspace = organizer` **and** the user has zero `organization_members` rows: an organization creation-or-join step (create a new org, or accept a pending `organization_invites` row if one exists for their email — see `FUTURE_DATABASE_PLAN.md` §2). A user cannot land on an empty Organizer dashboard with nothing to manage — this step exists specifically to prevent that dead end. `initial_onboarding_completed_at` is set once the workspace choice itself is made (step 4.2), independent of whether this org step is completed immediately or resumed later — an organizer-intent user with zero orgs is routed to the org-creation-or-recovery flow by the routing table (§5) on every subsequent visit until they have ≥1 membership, but that is a routing consequence of membership count, not a reason to reopen the first-run gate.
   4. If `default_workspace = participant`: onboarding ends here; no org step forced. A participant can still create an organization later from within the app (e.g., an explicit "Start organizing" entry point in participant nav or account settings), at which point they become dual-role without ever having "switched account type."
5. **Role selection** — folded into step 4.2–4.3 above; not a separate lifecycle stage.
6. **Organization creation** — folded into step 4.3 above when needed; otherwise skipped.
7. **Dashboard routing** — deterministic, see §5.
8. **Logout.** Session cleared, redirect to `/` (public landing). No trace of workspace state persists that would leak which dashboard a now-anonymous browser last viewed (client-side workspace preference should be cleared on logout, not just the session cookie).
9. **Returning user.** Middleware refreshes session on every request (existing pattern, `docs/ROUTES.md` route-group layouts). Lands on `default_workspace`'s dashboard by default (§5), or resumes a `next` return URL if one is present (§5).

## 5. Post-login routing table

**First-run check happens before this table is consulted at all:** if `initial_onboarding_completed_at is null` (§4a), the user is routed to the onboarding workspace-choice step (§4.4), never directly into the table below — this is the "authenticated + initial onboarding incomplete → onboarding choice" case. Once `initial_onboarding_completed_at` is set (whether just now or on a prior visit), every subsequent authentication is a deterministic function of `default_workspace` and current organization membership count — never a hardcoded single redirect, and never a re-check of the onboarding gate:

| Case | `default_workspace` | Organization memberships | Lands on |
|---|---|---|---|
| Anonymous | — | — | Public auth entry (`/auth`), not any dashboard |
| First-run (onboarding incomplete) | — (not yet chosen) | — | Onboarding workspace-choice step (§4.4), regardless of any default column value |
| Completed, participant-first | `participant` | any | `/dashboard` (participant dashboard) |
| Completed, organizer-first, no org yet | `organizer` | 0 | Organization creation-or-recovery flow (`AUTH-002A`'s organizer onboarding action, or a future `/organizer/onboarding` step) — **never** `/organizer` itself, and never treated as an authorization gap; this is routing based on membership count, same as any other 0-membership case |
| Completed, organizer-first, with membership | `organizer` | 1 | **`/organizer`** — the canonical organizer home, human-approved 2026-07-12 (`AUTH-002-PRE` Decision 2). This route now exists (`src/app/organizer/page.tsx`, `AUTH-002-PRE`) as a real, minimal workspace shell — no placeholder/mock-data dead end. |
| Completed, organizer-first, multiple orgs | `organizer` | ≥2 | `/organizer` org home, with the organization switcher visible (`DASHBOARD_ARCHITECTURE.md` §3), defaulting to `last_active_organization_id` if set, else most-recently-joined |

**A newly bootstrapped organizer is never redirected to `/dashboard` as a fallback** — that temporary-fallback option, considered during `AUTH-002-PRE`'s architecture gate, was explicitly rejected by the human in favor of building the real `/organizer` route first (Decision 2). The participant and organizer experiences remain fully separate, including at this landing moment.

**Return URLs (`next` parameter):** if a user was redirected to `/auth` from a deep link (e.g., an unauthenticated visitor clicking "Register" on `/events/[slug]`), the original path is preserved as `?next=/events/[slug]/register` and validated against a same-origin allow-list before being honored post-login — this prevents open-redirect abuse via a crafted `next` value pointing off-site. If `next` is absent or fails validation, fall back to the table above.

## 6. Guarantees this architecture must preserve (carried over from the prior phase's binding decision, unchanged)

- Anonymous visitors never see a Dashboard link or reach Dashboard content, by any path.
- Role/workspace enforcement is server-side (middleware + layout guards + RLS), never client-UI-only.
- No account type is a permanent, unswitchable fork.
- A single migration will not be required to let an existing participant become an organizer, or vice versa — the capability model already supports it without a data migration, only a UI entry point (e.g., "Start organizing") needs to exist.

## 7. Notes for future international/company-hackathon scalability

Nothing in this auth architecture assumes Jordan, a university, or a public-only event. Google OAuth generalizes globally; email+password is provider-agnostic. The one place geography-specific work remains is i18n/RTL copy (`docs/PRODUCT_DECISIONS.md` D13, unchanged, unaffected by this phase) — not the auth model itself. Private/internal company hackathons are an organization-and-event-visibility question, not an auth-lifecycle question — see `DECISIONS.md` AD-10 and `FUTURE_DATABASE_PLAN.md` §5.
