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

Per `DECISIONS.md` AD-1, there is no account type in the sense of a fork. There is exactly one new field:

- **`profiles.default_workspace`** — enum `participant | organizer`. Chosen once during onboarding (§4). Determines only the **default landing destination** after login (§5). Never consulted by RLS, never gates a capability, always changeable later (e.g., from `/profile` or account settings — exact surface is a UI decision for the implementation phase, not fixed here).

This single field is intentionally the *only* new identity-level concept this phase introduces. Everything else (who can act as an organizer for which org, who can judge which event) is derived from existing membership tables (`organization_members`, `event_roles`), not from a field on `profiles`.

## 3. Sessions and dual-role users

A session is one authenticated identity — never two. A dual-role user (participant activity + organizer capability) does not have two sessions or two logins; they have one session that can be **in** one of two workspace contexts at a time, tracked client-side (e.g., a cookie or local UI state noting "currently viewing: organizer, org X"), never server-authoritative. This matters because:

- Server-side authorization must never trust "which workspace the user says they're in" — every organizer-scoped request is authorized by `organization_members` membership at request time, regardless of what the UI currently displays. The workspace concept is a navigation convenience, not a security boundary (this is stated more fully in `RLS_STRATEGY.md` §1).
- Switching workspace is therefore just a client-side navigation event (go to `/organizer` vs `/dashboard`) gated by a layout-level check ("does this user have ≥1 organization_members row"), not a re-authentication or a session mutation.

## 4. Full lifecycle, step by step

1. **Anonymous.** No session. Public site only (`docs/PHASES.md`, public experience — unchanged by this phase). No Dashboard link exists anywhere in anonymous navigation.
2. **Signup.** User picks email+password or Google on `/auth`. On success, Supabase creates `auth.users`; the existing D17 trigger creates a minimal `profiles` row (`full_name` from OAuth metadata, or the `New participant` placeholder for email signup).
3. **Verification.** Email+password: Supabase's standard email-confirmation flow (unchanged, existing Supabase default). Google: no separate verification step — OAuth is the verification.
4. **Onboarding** (`/onboarding`, existing route, gains one new step this phase). Order matters — identity basics before the workspace question, so the choice is made by someone who already feels like they have an account, not a stranger being interrogated (`DECISIONS.md` AD-2 rationale):
   1. Identity basics: full name, university/organization affiliation, primary role, experience level — existing `profiles` fields, unchanged.
   2. **Workspace choice** (new): "How will you mostly use Hackathonly?" → sets `default_workspace`. Copy should make clear this is a starting point, not a lock — e.g., a one-line note that organizing and participating can both happen on the same account.
   3. If `default_workspace = organizer` **and** the user has zero `organization_members` rows: an organization creation-or-join step (create a new org, or accept a pending `organization_invites` row if one exists for their email — see `FUTURE_DATABASE_PLAN.md` §2). A user cannot land on an empty Organizer dashboard with nothing to manage — this step exists specifically to prevent that dead end.
   4. If `default_workspace = participant`: onboarding ends here; no org step forced. A participant can still create an organization later from within the app (e.g., an explicit "Start organizing" entry point in participant nav or account settings), at which point they become dual-role without ever having "switched account type."
5. **Role selection** — folded into step 4.2–4.3 above; not a separate lifecycle stage.
6. **Organization creation** — folded into step 4.3 above when needed; otherwise skipped.
7. **Dashboard routing** — deterministic, see §5.
8. **Logout.** Session cleared, redirect to `/` (public landing). No trace of workspace state persists that would leak which dashboard a now-anonymous browser last viewed (client-side workspace preference should be cleared on logout, not just the session cookie).
9. **Returning user.** Middleware refreshes session on every request (existing pattern, `docs/ROUTES.md` route-group layouts). Lands on `default_workspace`'s dashboard by default (§5), or resumes a `next` return URL if one is present (§5).

## 5. Post-login routing table

Deterministic function of `default_workspace` and current organization membership count — never a hardcoded single redirect:

| `default_workspace` | Organization memberships | Lands on |
|---|---|---|
| `participant` | any | `/dashboard` (participant dashboard) |
| `organizer` | 0 | `/organizer/onboarding` (create-or-join-org step, if not already completed) |
| `organizer` | 1 | `/organizer/events/[most recent or only org]` or `/organizer` org home — exact choice (org home vs. jump straight to an event) is a UX decision for `DASHBOARD_ARCHITECTURE.md`, not fixed here |
| `organizer` | ≥2 | `/organizer` org home, with the organization switcher visible, defaulting to `last_active_organization_id` if set, else most-recently-joined |

**Return URLs (`next` parameter):** if a user was redirected to `/auth` from a deep link (e.g., an unauthenticated visitor clicking "Register" on `/events/[slug]`), the original path is preserved as `?next=/events/[slug]/register` and validated against a same-origin allow-list before being honored post-login — this prevents open-redirect abuse via a crafted `next` value pointing off-site. If `next` is absent or fails validation, fall back to the table above.

## 6. Guarantees this architecture must preserve (carried over from the prior phase's binding decision, unchanged)

- Anonymous visitors never see a Dashboard link or reach Dashboard content, by any path.
- Role/workspace enforcement is server-side (middleware + layout guards + RLS), never client-UI-only.
- No account type is a permanent, unswitchable fork.
- A single migration will not be required to let an existing participant become an organizer, or vice versa — the capability model already supports it without a data migration, only a UI entry point (e.g., "Start organizing") needs to exist.

## 7. Notes for future international/company-hackathon scalability

Nothing in this auth architecture assumes Jordan, a university, or a public-only event. Google OAuth generalizes globally; email+password is provider-agnostic. The one place geography-specific work remains is i18n/RTL copy (`docs/PRODUCT_DECISIONS.md` D13, unchanged, unaffected by this phase) — not the auth model itself. Private/internal company hackathons are an organization-and-event-visibility question, not an auth-lifecycle question — see `DECISIONS.md` AD-10 and `FUTURE_DATABASE_PLAN.md` §5.
