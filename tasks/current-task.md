# Task: AUTH-002A — Authentication Backend and Onboarding Actions

## Task ID
`PHASE-AUTH-002A` (implementation task `AUTH-002A`)

## Phase reference
`docs/architecture/DECISIONS.md` AD-11, `docs/architecture/AUTH_ARCHITECTURE.md` §4/§4a/§5, `handoff/CLAUDE_IMPLEMENTATION_SUMMARY.md` (AUTH-002-PRE) — both blocking gaps from the earlier `DECISION_REQUIRED` are resolved and both dependencies this task needs (the `initial_onboarding_completed_at` semantics, the real `/organizer` route) now exist. This task builds the backend half of `PHASE-AUTH-002`; the visual half (`AUTH-002B`) is explicitly out of scope here and belongs to Claude.

## Objective
Implement email/password sign-up and sign-in, Google OAuth initiation and callback, sign-out, and the two first-run onboarding actions (participant, organizer) — entirely server-side, with one narrowly scoped migration, no UI, no scope beyond what's listed below.

## Binding identity architecture — do not deviate without stopping and flagging back for review

1. One auth identity per person. No second identity system.
2. **Do not add:** `profiles.role`, `profiles.is_organizer`, `account_type`, `onboarding_completed` (boolean), `participant_profile_complete`, `last_active_organization_id`, any organization-invitation table, any skills table, any profile-completion field. The **only** approved schema change is named in "Migration" below.
3. The same account may participate and organize — nothing in this task may create a structure that prevents that.
4. Organizer authority derives exclusively from `organization_members`. `profiles.default_workspace` is preference-only. `profiles.initial_onboarding_completed_at` is workflow-only. Neither may appear in an RLS policy predicate or a `security definer` authorization check, and neither may be read as, or substitute for, `organization_members` membership.
5. Client-provided role, workspace, or onboarding-state values are never trusted as authorization — every decision this task makes is re-derived server-side from `auth.uid()` and table state on each request.
6. No `service-role`/admin Supabase client (`src/lib/supabase/admin.ts`) may be imported by any new user-facing authentication or onboarding code path.

Full reasoning: `docs/architecture/DECISIONS.md` AD-1, AD-11; `docs/architecture/AUTH_ARCHITECTURE.md` §2, §4, §4a, §5; `docs/architecture/RLS_STRATEGY.md` §1, §11.

## Approved authentication providers
**Approved:** email + password, Google OAuth. **Not approved, do not implement:** magic links, phone authentication, any other OAuth provider.

## Migration — the only schema change approved for this task

One migration, adding exactly:
```
profiles.initial_onboarding_completed_at timestamptz null
```
Requirements:
- Nullable, **no default** (unlike `default_workspace`, which has `default 'participant'` — this column must have no default; existing and newly-created profiles alike start `null`).
- No `check` constraint needed (any valid `timestamptz` or `null` is acceptable — there is no closed value set to enforce, unlike `default_workspace`).
- No new table. No trigger that sets this column automatically on any event (signup, first login, etc.) — it is set **only** by the participant/organizer onboarding actions (below), as an explicit consequence of a user completing that specific step, never as a side effect of anything else.
- No RLS policy may reference it. The **existing** `profiles_update_own` policy (`supabase/migrations/20260710130000_identity_rls.sql`) already permits a user to update their own `profiles` row with no column-level restriction — confirm by inspection that this existing policy is sufficient for a user to set their own `initial_onboarding_completed_at` and that **no RLS migration is needed** for this task. If inspection reveals this assumption is wrong (e.g., a column-level grant or a narrower policy blocks it), **stop and report** rather than writing a new RLS policy — RLS changes are not approved for this task.
- Must apply cleanly from a fresh `supabase db reset` alongside all prior migrations.
- Filename: `supabase/migrations/<new timestamp, later than 20260712122000>_profiles_initial_onboarding_completed_at.sql` — pick the actual timestamp per the repo's existing convention.

## A. Migration — documentation reconciliation (authorized, narrow)
- `docs/DATABASE.md` §1 `profiles` — add the new column to the existing field list, following the same prose style already used for `default_workspace`, explicitly noting it is workflow state only, no default, and gates nothing.
- `docs/RLS_ACCESS_MATRIX.md` — add a one-line note (near the existing `profiles UPDATE` row or in enforcement notes) confirming the existing self-update policy already covers this column and that no new policy was added, consistent with `AUTH_ARCHITECTURE.md` §4a stating the field is never read by RLS.
- `docs/ROUTES.md` — update only if live route behavior actually changes (it will — see "Route and action file plan" below); do not touch anything else in that file.
- **Do not edit any `docs/architecture/*.md` file.** Those are Claude's. If anything in them looks inaccurate once this is implemented, report it in `CODEX_SUMMARY.md`, do not fix it.

## Route and action file plan — read before writing code

`docs/ROUTES.md`'s existing convention states `/auth/callback` is a route handler and "everything else is server actions in `src/actions/*`" (a directory that does not exist yet in this repo). **This task deliberately deviates from that closing line, narrowly and for a stated reason:** Next.js Server Actions are normally invoked by a bound `<form action={...}>` in a real page. This task is explicitly forbidden from building any UI, so there is no form to bind to, and no test runner (`package.json` has no Jest/Vitest/Playwright, and none may be added) exists to invoke a server action directly. To keep every piece of this task **executably verifiable** — matching the standard this repo has already held itself to (`AUTH-001`'s proxy behavior was verified via real `curl` requests against a running `npm run start`, not just read from source) — implement the core logic as plain, framework-agnostic async functions, and wrap each in a thin Next.js Route Handler purely so it is `curl`-testable now. **`AUTH-002B` (Claude, a future design phase) decides the final calling convention** — it may keep these as route handlers called via `fetch` from real forms, or refactor them into bound Server Actions reusing the same underlying logic; that is explicitly not decided by this task.

**Core logic (plain exported async functions, no `"use server"` directive, unit-referenceable):**
- `src/lib/auth/errors.ts` (new) — the typed result/error contracts (see §J below).
- `src/lib/auth/sign-up.ts` (new) — email/password sign-up logic.
- `src/lib/auth/sign-in.ts` (new) — email/password sign-in logic **and** Google OAuth initiation logic (or split into a second file, `src/lib/auth/oauth.ts`, if that reads cleaner — Codex's call, report which was chosen).
- `src/lib/auth/sign-out.ts` (new) — sign-out logic.
- `src/lib/auth/onboarding.ts` (new) — participant onboarding, organizer onboarding, and a shared internal "finalize onboarding preference" helper (used by both, and by the organizer partial-failure recovery path in §H).
- `src/lib/auth/routing.ts` (new) — the post-auth destination decision function (§F).
- `src/lib/auth/types.ts` (existing, edit) — extend `CurrentProfile` with `initial_onboarding_completed_at: string | null`; add any new small types the above files need, only if they don't already fit naturally in `errors.ts`/`routing.ts`.

**Thin route-handler wrappers (each does request parsing + calls one core-logic function + maps the result to a response — no business logic duplicated here):**
- `src/app/(auth)/auth/callback/route.ts` (new) — `GET`, matches the existing `docs/ROUTES.md` `/auth/callback` entry exactly, required by Next.js/Supabase OAuth convention (this one is not a deviation — it was already documented as a route handler).
- `src/app/(auth)/auth/sign-up/route.ts` (new) — `POST`.
- `src/app/(auth)/auth/sign-in/route.ts` (new) — `POST`.
- `src/app/(auth)/auth/sign-in/google/route.ts` (new) — `GET`, redirects the browser to Google's consent screen.
- `src/app/(auth)/auth/sign-out/route.ts` (new) — `POST`.
- `src/app/(auth)/onboarding/participant/route.ts` (new) — `POST`.
- `src/app/(auth)/onboarding/organizer/route.ts` (new) — `POST`.

If, after inspection, Codex judges a different file split is clearly better (e.g., merging two of the above `src/lib/auth/*.ts` files), that's an acceptable deviation — report exactly what was done and why in `CODEX_SUMMARY.md`. The **route paths** above are not negotiable (they must match exactly, since `docs/ROUTES.md` will be updated to document them); the **internal file organization** under `src/lib/auth/` has minor Codex discretion.

## B. Email/password sign-up (`src/lib/auth/sign-up.ts`)

- Accepts email, password, and *only* already-approved safe signup metadata — full name. Nothing else (no university, GitHub, skills, availability — those don't exist as inputs anywhere in this task).
- Validates all fields server-side (non-empty email matching a basic shape check, password meeting the local Supabase project's `minimum_password_length` from `supabase/config.toml`, full name non-empty if provided).
- Normalizes email safely (trim, lowercase) before calling Supabase — do not invent a bespoke email-validation regex beyond a basic shape check; rely on Supabase's own validation for the rest.
- Uses the existing SSR user-context client (`src/lib/supabase/server.ts`) — never `src/lib/supabase/admin.ts`.
- Never logs or returns the password in any response, error, or log line.
- **Distinguishes local vs. production confirmation behavior:** inspect the Supabase JS client's sign-up response — when email confirmation is required (production), `data.session` is `null` and `data.user` is non-null with `identities` reflecting a pending confirmation; when it's disabled (local, `enable_confirmations = false`, confirmed present in this repo's `supabase/config.toml`), a session is issued immediately. The function must correctly report which happened (e.g., an `email_confirmation_required` result category vs. a success-with-session result) rather than assuming one universally. **Do not implement or change hosted confirmation email templates/behavior** — this task only needs to correctly *react* to whichever behavior the connected Supabase project (local, always, for this task's own testing) currently exhibits.
- Returns a typed, UI-safe result (§J) — never a raw Supabase error object, stack trace, or SQL text.
- Preserves a validated internal `next` destination (via the return-URL logic in §K) only for use after a session actually exists — a confirmation-pending signup has nothing to redirect into yet.
- **Does not** create `organizations`, `organization_members`, or any participant-profile field beyond what the existing signup trigger already does (full name via `auth.users` metadata, per `D17`/the existing `create_profile_for_new_user` trigger — unchanged, not touched by this task).

## C. Email/password sign-in (`src/lib/auth/sign-in.ts`)

- Validates email and password are present (shape only — the actual credential check is Supabase's job).
- Calls Supabase password sign-in via the existing SSR client.
- Never logs the password or the full credential payload.
- On failure, returns a single generic `invalid_credentials` result (§J) regardless of whether the email exists, the password is wrong, or the account is unconfirmed in a way Supabase itself doesn't already distinguish via a documented error code — do not construct novel logic that leaks account existence beyond whatever Supabase's own API already reveals.
- On success: resolves the authenticated user's `profiles` row (reuse `resolveCurrentProfile` from `src/lib/auth/server.ts`, extended per the type change above), reads `initial_onboarding_completed_at` and `default_workspace`, resolves `organization_members` rows (reuse `resolveOrganizationMemberships`), and calls the routing decision function (§F, `src/lib/auth/routing.ts`) to choose the destination.
- Honors a safe validated internal `next` path only when the routing decision function says it's permissible to override the default destination with it (see §F's exact rule — a `next` value never bypasses the first-run onboarding check).
- Never treats `default_workspace` as permission — confirm by inspection that `sign-in.ts` never gates access to anything based on it; it is passed to the routing function purely as a preference input.

## D. Google OAuth initiation (`src/lib/auth/sign-in.ts` or `oauth.ts`)

- Supports Google only — no provider parameter that could be set to anything else.
- Builds the correct callback URL (pointing at `/auth/callback`, §E) via Supabase's `signInWithOAuth({ provider: "google", options: { redirectTo: ... } })` pattern, using the existing SSR client and existing env-var patterns (`src/lib/env.ts`) — no new environment variable is introduced by this function itself.
- Preserves a validated internal `next` destination by encoding it into the `redirectTo` URL's own query string (so it survives the round trip to Google and back) — validated the same way as everywhere else in this task (§K), never trusted raw.
- Rejects external and protocol-relative redirect targets at the point of accepting a `next` value, before it's ever encoded into the OAuth URL.
- Does not expose OAuth state, authorization codes, provider tokens, or raw provider error detail in any response this function returns.
- **Known, expected, and acceptable testing limitation — do not attempt to work around it:** this repo's local `supabase/config.toml` has no `[auth.external.google]` block configured (confirmed by inspection — only a disabled `[auth.external.apple]` template exists), and this task does **not** authorize adding one. A full, live, browser-driven Google OAuth round trip cannot be exercised in this local environment without real Google Cloud OAuth credentials, which do not belong in this repository and are not this task's concern to provision. Verify what *can* be verified locally without real credentials: that the initiation function is called correctly, builds a syntactically valid Google authorization URL with the correct `redirectTo`, and returns a redirect response — not that Google's consent screen actually completes. State this limitation plainly in `CODEX_SUMMARY.md`; it is not a gap to apologize for or attempt to fake around with mock credentials.

## E. OAuth callback (`src/app/(auth)/auth/callback/route.ts`)

- `GET` route handler, matching the Next.js App Router Route Handler convention already used correctly by this repo (confirm current Next.js version conventions the same way `AUTH-001` confirmed the `src/proxy.ts` convention before assuming a path — do not assume `route.ts` naming/location without checking against the installed Next.js version's actual documented behavior).
- Accepts the Supabase authorization `code` query parameter.
- Missing code: handled safely — a typed `callback_error` result, redirect to a safe default (the approved `/auth` login destination), never a raw 500 or an unhandled exception.
- Exchanges the code for a session using the existing SSR client's code-exchange method (e.g., `exchangeCodeForSession`) — never the admin client.
- Invalid or expired code: same safe `callback_error` handling as missing code — never expose the raw Supabase error, the code itself, or any token in the response or in logs.
- On success: resolves user, profile (including `initial_onboarding_completed_at`), and memberships (same resolvers as §C), calls the routing decision function (§F) to choose a destination, and redirects there.
- Preserves a safe `next` value only when present and valid (§K) — the callback must decode/validate whatever `next` was encoded into the OAuth URL by §D, not trust it blindly just because it round-tripped through Google.
- **Does not use `created_at`, `updated_at`, or `last_sign_in_at` as a heuristic for "is this a new user."** The **only** first-run signal is `initial_onboarding_completed_at is null` (per `AUTH_ARCHITECTURE.md` §4a, `DECISIONS.md` AD-11) — the callback route must not attempt to infer newness any other way, for either provider.
- No redirect loop: verify by tracing that every exit path (missing code, invalid code, successful exchange + any routing outcome) terminates in exactly one redirect, never routes back into `/auth/callback` itself.

## F. Post-auth routing decision (`src/lib/auth/routing.ts`)

One function, e.g. `resolvePostAuthDestination(input): string`, taking only trusted, already-resolved inputs — never raw request data:
- the authenticated user (confirmation that one exists is the caller's job, not this function's)
- current profile (including `initial_onboarding_completed_at`, `default_workspace`)
- organization memberships (array, already fetched via the RLS-respecting client)
- a validated internal `next` path, or `null`

Required behavior, in this exact priority order:
1. **`initial_onboarding_completed_at is null`** → the approved onboarding destination. Use the exact path already named in `docs/ROUTES.md` (`/onboarding`) — do not invent a different path, and do not build any page there; the backend may return this string as a redirect target even though visiting it renders nothing yet (that's `AUTH-002B`'s job). This check happens **before** any `next` value is honored — a first-run user is never routed straight into an arbitrary `next` destination, onboarding always wins.
2. **Onboarding complete, `default_workspace = 'participant'`** → `/dashboard`, unless a valid `next` is present, in which case honor `next` instead (a returning participant deep-linking somewhere specific should land there, not be forced through the default). This is true **regardless of membership count** — a participant-preference user who also happens to own an organization still defaults to `/dashboard` (case 6 below is the same row, stated separately in the brief for clarity — do not implement it as a separate code path from this one).
3. **Onboarding complete, `default_workspace = 'organizer'`, ≥1 membership** → `/organizer`, unless a valid `next` is present, in which case honor `next`.
4. **Onboarding complete, `default_workspace = 'organizer'`, 0 memberships** → a safe recovery destination — **`/dashboard`**, not `/organizer` under any circumstance. (This is a narrower, more specific case than `AUTH_ARCHITECTURE.md` §5's original "organizer, 0 memberships → org-creation-or-recovery flow" language — since this task does not build a dedicated recovery-flow *page*, and `/dashboard` is the one real, already-existing, always-safe destination, use it here. This is a deliberate, documented simplification for this backend-only phase, not a contradiction of the architecture doc — note it explicitly in `CODEX_SUMMARY.md` so `AUTH-002B` knows a richer recovery UI is still open work, not something this task quietly closed.)

A `next` value is **never** honored in place of the onboarding redirect (case 1), and honoring `next` never substitutes for the membership check in case 3/4 — landing on `/organizer` via `next` still requires ≥1 real membership; if `next` points at `/organizer` but the user has zero memberships, case 4 wins and `/dashboard` is returned instead, `next` is discarded. State this explicitly in `CODEX_SUMMARY.md` with the exact precedence, since it's the single most safety-critical rule in this function: **a valid internal path never grants authorization; the destination route's own guard (`src/proxy.ts`, unchanged) makes the final call regardless of what this function returns.**

## G. Participant onboarding action (`src/lib/auth/onboarding.ts`, `completeParticipantOnboarding`)

- Requires an authenticated user (caller-verified, this function fails safely with `unauthenticated` if not).
- Updates **only** the current user's own `profiles` row: `default_workspace = 'participant'`, `initial_onboarding_completed_at = now()`. No other column touched.
- Uses the existing RLS-respecting SSR client — the existing `profiles_update_own` policy is what makes this legal; no new grant is needed.
- Creates no organization, no membership row, no role, no account-type marker.
- Does not touch, set, or reference any participant-profile-completeness field — none exist yet, and this function must not invent one.
- On success, returns a destination: `/dashboard`, or a validated `next` if one was supplied and passes §K.
- Returns a typed, UI-safe error (§J) on failure — e.g., `unauthenticated`, `profile_update_failed`.

## H. Organizer onboarding action (`src/lib/auth/onboarding.ts`, `completeOrganizerOnboarding`)

- Requires an authenticated user.
- Validates organization name (non-empty, reasonable length — reuse the same shape-check discipline as the existing `create_organization_with_owner` RPC's own validation, don't duplicate stricter rules the RPC doesn't itself enforce).
- Normalizes and validates the organization slug — inspect `docs/DATABASE.md`/the existing migration for any implied slug shape (the RPC itself does not enforce a shape beyond non-blank, per `AUTH-001`'s implementation) and keep normalization minimal and consistent with what the RPC already accepts; do not invent new slug rules the RPC doesn't already enforce, since mismatched validation between this function and the RPC would be a real bug (e.g., silently rejecting a slug this function considers "invalid" that the RPC would have accepted, or vice versa).
- Calls the **existing** `create_organization_with_owner` RPC (`AUTH-001`, unchanged) — never a direct `organizations` or `organization_members` insert from application code, and never accepts an owner `user_id` from any input; the RPC itself derives the owner from `auth.uid()`.

**Required sequencing, exactly:**
1. Call `create_organization_with_owner(name, slug)`. If it fails (duplicate slug → `23505`; validation → `22023`; unauthenticated → `28000`), map to the appropriate typed error (§J) and stop — nothing else runs.
2. On success, the organization and the caller's owner `organization_members` row now exist (the RPC is already atomic for this part, per `AUTH-001`'s review — unchanged).
3. Call the same "finalize onboarding preference" helper used by `completeParticipantOnboarding` — update `profiles`: `default_workspace = 'organizer'`, `initial_onboarding_completed_at = now()`.
4. On success, return the destination `/organizer` (never `/dashboard` — per `AUTH-002-PRE` Decision 2, a newly bootstrapped organizer is never sent to the participant dashboard as a fallback, and this route now genuinely exists).

**Partial-failure model — document this exactly, do not invent a fake distributed transaction:** the RPC call (step 1) and the profile update (step 3) are two separate database round trips from application code and cannot share one transaction. If step 1 succeeds and step 3 fails:
- **Do not** retry step 1 — the organization and owner membership already exist; calling the RPC again with the same slug would hit the duplicate-slug error and produce a confusing, wrong-cause failure for what is actually a step-3 problem.
- **Do** return a distinct, typed, recoverable error (`profile_update_failed`, §J) that still communicates the organization was created successfully (e.g., include the new organization id in the error payload, not just the failure).
- **Document explicitly in `CODEX_SUMMARY.md`** that in this exact partial-failure state, the user already has real, functioning organizer authority (the `organization_members` row exists and is what `src/proxy.ts` and every RLS policy actually check) even though their `profiles` preference/onboarding-timestamp columns may still be stale — this is safe, not a security gap, because authority was never derived from those columns (binding architecture point 4). The correct recovery path is simply re-invoking the "finalize onboarding preference" step alone (the same shared helper from step 3) — not re-running organization bootstrap — whenever the user next attempts onboarding completion or whenever `AUTH-002B` builds a retry affordance. This function does not need to auto-retry; it needs to fail in a way that makes a later, correct, org-creation-free retry possible.
- Never expose the raw SQL, constraint name, or internal RPC error text to the caller — map every failure through §J's typed contract.

## I. Sign-out (`src/lib/auth/sign-out.ts`, `src/app/(auth)/auth/sign-out/route.ts`)

- Signs out the current Supabase session via the existing SSR client (`auth.signOut()`).
- Handles an already-signed-out user safely — calling sign-out with no active session must not throw or return an unhandled error; treat it as a successful no-op.
- Redirects to `/` (the existing, live public landing route) — a fixed, safe, internal destination, never a client-suppliable one.
- Does not accept any redirect-target input from the request at all (unlike the other actions, sign-out has no legitimate reason to honor a `next` value — keep this one deliberately simple and non-configurable).
- Does not rely only on client-side state — the actual Supabase session cookie is cleared server-side by this call; do not implement this as a client-only "forget the token" operation.

## J. Error contracts (`src/lib/auth/errors.ts`)

A small, closed, typed result contract — do not build a generic/extensible error framework. Something in this shape (exact naming is Codex's call, but the categories and the "never expose" list are not):

```
type AuthActionErrorKind =
  | "validation_error"
  | "invalid_credentials"
  | "email_confirmation_required"
  | "unauthenticated"
  | "callback_error"
  | "duplicate_organization_slug"
  | "organization_creation_failed"
  | "profile_update_failed"
  | "unsafe_redirect_ignored"
  | "unknown_error";

type AuthActionError = { kind: AuthActionErrorKind; message: string; meta?: Record<string, unknown> };
type AuthActionResult<T> = { ok: true; data: T } | { ok: false; error: AuthActionError };
```

Every function in §B–§I returns (or, for route handlers, maps to an HTTP response from) this shape or an equivalent as narrow. **Never include**, in any error `message` or `meta`: SQL text, raw Supabase/Postgres error objects, stack traces, passwords, authorization codes, access tokens, refresh tokens, or any secret/env value. `meta` may carry safe structured detail only (e.g., `{ organizationId: "..." }` for the partial-failure case in §H) — audit every `meta` payload for this before finalizing.

## K. Safe redirect hardening

Reuse `src/lib/auth/return-url.ts`'s existing `normalizeSafeReturnPath`/`buildAuthRedirectUrl` (`AUTH-001`, already reviewed and live-tested against exactly this attack list) — do not rewrite it from scratch, but strengthen it if any of the following is found to not already be rejected (report which, if any, required a change):
- `https://evil.example.com`, `http://evil.example.com` — external URLs.
- `//evil.example.com` — protocol-relative.
- Encoded protocol-relative variants (e.g., `/%2F%2Fevil.example.com`, `\/\/evil.example.com`).
- Backslash-based path tricks (e.g., `/\evil.example.com`).
- `javascript:` URLs.
- Malformed or empty values.

Valid internal paths that **must** be accepted (when syntactically safe): `/dashboard`, `/organizer`, `/events/example`, `/onboarding`. Restate the existing, already-correct rule from `AUTH-001`: **a valid internal path never grants authorization** — every one of §C/§E/§F/§G/§H's uses of a validated `next` still lets the destination's own guard (`src/proxy.ts`, or the routing function's own membership check in §F case 3/4) make the final call.

**Required executable proof, not just code review:** write a small, focused verification (pgTAP is not the right tool for pure TS logic with no DB dependency — use a plain Node-executable check, e.g. a short script run via `node --experimental-strip-types` or by compiling via `tsc` to a scratch location and running with plain `node`, whichever this Next.js/TypeScript version's toolchain already supports without adding a package; do not add `tsx`/`ts-node`/any test runner). If no clean no-new-dependency way to execute TypeScript directly exists in this toolchain, fall back to `curl`-based runtime verification of the route handlers that consume this function (§E's callback with a malicious `next`, for example) as the executable proof instead, and say so plainly in `CODEX_SUMMARY.md` — don't force an awkward tooling workaround to avoid admitting that.

## No UI scope — restated, binding

Do not create or design: sign-in page, sign-up page, onboarding-choice page UI, Google login button UI, participant/organizer choice cards, organization-creation form UI, authenticated navigation, participant dashboard UI, organizer dashboard additions, workspace switcher, any animation or styling. Every file this task creates is a route handler, a plain server-only function, a migration, or a test file. If implementing any of §B–§I is found to structurally require a page to exist (e.g., a route handler that can't compile without a sibling `page.tsx`), **stop and report the exact dependency** rather than creating one — this should not actually happen for `route.ts` files, but the instruction is restated here because it mattered for `AUTH-002-PRE`'s `/organizer` page and could recur.

## Database approval boundary

**Approved:** the one migration in "Migration" above; local pgTAP tests for it and for the behaviors listed in "Testing requirements." **Not approved:** any other column, any new table, any RLS policy change, any remote Supabase operation (`supabase link`, `supabase db push`, hosted SQL Editor work, production keys, hosted configuration changes). If implementation reveals an RLS change is actually required (see the migration section's explicit stop-and-report instruction), **do not implement it** — report the exact requirement in `CODEX_SUMMARY.md` and stop; a separate task will seek that approval.

## Testing requirements

Inspect existing tooling before writing tests — `package.json` currently has no test runner beyond `supabase test db` (pgTAP) and TypeScript/ESLint; do not add one.

**Database-level (pgTAP, new file `supabase/tests/database/initial_onboarding_state.test.sql`, following the existing files' structure/style — synthetic UUIDs, cleanup-then-`begin`/`plan`/`rollback` pattern):**
- Migration applies from a fresh `supabase db reset` (verified via the standard reset command, not a dedicated assertion).
- `profiles.initial_onboarding_completed_at` exists, is `timestamptz`, is nullable, and has **no default** (distinct from `default_workspace`'s `default 'participant'` — assert this difference explicitly, don't just assert nullability).
- A freshly-created profile (via the existing signup trigger) has `initial_onboarding_completed_at is null`.
- An authenticated user can update their own `initial_onboarding_completed_at` through the existing `profiles_update_own` RLS policy (functional test — simulate the authenticated role/JWT-claim pattern already established in `supabase/tests/database/org_identity_foundation.test.sql`, not a catalog check).
- Setting `initial_onboarding_completed_at` (and `default_workspace = 'organizer'`) grants **no** organization table access without a real membership row — same non-authority pattern already proven for `default_workspace` alone in `org_identity_foundation.test.sql`, extended to confirm the new column doesn't change that outcome either.
- No RLS policy anywhere references `initial_onboarding_completed_at` in its definition text (reuse the existing `pg_get_functiondef`/policy-text-scan technique already in `org_identity_foundation.test.sql` for `default_workspace`, applied to this column).
- Naming scan: the literal string `profile_id` does not appear in any new migration/test object name (same technique as every prior migration's test file).

**Application-level (executable, not just read — via the `curl`-against-`npm run start` technique already proven in `AUTH-001`'s and `AUTH-001`'s reviews, using a cookie jar to carry a session across a multi-request sequence where needed):**
- Callback with missing `code` → safe redirect, no crash, no leaked internals.
- Callback with an invalid/garbage `code` → same safe handling.
- A malicious `next` value (reuse the exact attack list from §K) attempted against at least one real endpoint that accepts `next` (e.g., sign-in or callback) → rejected/ignored, never honored.
- Unauthenticated request to `/onboarding/participant` and `/onboarding/organizer` → `unauthenticated` error, no side effect.
- A successful local sign-up (session issued immediately, per this repo's `enable_confirmations = false`) followed by a successful participant onboarding call → profile updated correctly, verified by a follow-up authenticated read.
- The organizer onboarding path, end to end: sign up a fresh synthetic user locally → call `/onboarding/organizer` → confirm (via direct DB read in the same verification pass, or a subsequent authenticated request) that exactly one organization and one owner membership exist, and that `initial_onboarding_completed_at`/`default_workspace` were updated.
- Duplicate slug via the organizer onboarding endpoint → typed `duplicate_organization_slug`-equivalent safe error, not a raw constraint error.
- Sign-out → subsequent authenticated request with the same cookie jar is correctly treated as unauthenticated.
- The routing decision function (§F), exercised either via direct function-level checks (if an executable no-new-dependency way exists, per §K's fallback guidance) or via the sign-in/callback endpoints across the 4 priority cases in §F — confirm the exact precedence (onboarding-incomplete beats everything; organizer-with-zero-membership never reaches `/organizer`).
- No file under `src/lib/auth/**` or `src/app/(auth)/**` imports `src/lib/supabase/admin.ts` (a direct grep, same technique `AUTH-001` already used and documented).

Use local Supabase only. Do not use hosted Supabase. Do not commit test credentials — synthetic test users follow the existing `*.invalid` email convention already used throughout `supabase/tests/database/`.

## Files Codex may create or modify — exact and exhaustive

**New:**
- `supabase/migrations/<timestamp>_profiles_initial_onboarding_completed_at.sql`
- `supabase/tests/database/initial_onboarding_state.test.sql`
- `src/lib/auth/errors.ts`
- `src/lib/auth/sign-up.ts`
- `src/lib/auth/sign-in.ts` (and/or `src/lib/auth/oauth.ts`, Codex's choice, report which)
- `src/lib/auth/sign-out.ts`
- `src/lib/auth/onboarding.ts`
- `src/lib/auth/routing.ts`
- `src/app/(auth)/auth/callback/route.ts`
- `src/app/(auth)/auth/sign-up/route.ts`
- `src/app/(auth)/auth/sign-in/route.ts`
- `src/app/(auth)/auth/sign-in/google/route.ts`
- `src/app/(auth)/auth/sign-out/route.ts`
- `src/app/(auth)/onboarding/participant/route.ts`
- `src/app/(auth)/onboarding/organizer/route.ts`

**Existing, may edit:**
- `src/lib/auth/types.ts` (extend `CurrentProfile`)
- `docs/DATABASE.md` (§A)
- `docs/RLS_ACCESS_MATRIX.md` (§A)
- `docs/ROUTES.md` (mark the new routes above as built, correcting their current "planned" status; touch nothing else in the file)
- `handoff/CODEX_SUMMARY.md`

No other file. Not `docs/architecture/*.md`. Not `tasks/current-task.md`. Not `handoff/CLAUDE_REVIEW.md`.

## Forbidden — explicit

- `package.json`, `package-lock.json`, any dependency installation.
- `src/lib/supabase/admin.ts` usage anywhere in new user-facing code; service-role keys anywhere.
- Any remote Supabase command (`supabase link`, `supabase db push`, hosted SQL Editor, production keys, hosted configuration change).
- Any redesign of `src/app/(public)/**`, the participant dashboard (`src/app/(participant)/**`), or `src/app/organizer/page.tsx`/`src/app/organizer/events/[eventId]/**`.
- Any sign-in/sign-up/onboarding UI, any styling, any animation.
- University, GitHub, skills, availability, matching preferences, or any other participant-profile-completion field or table.
- `organization_invites`, `last_active_organization_id`, any `event_roles` change.
- Event schema, registration schema, matching, teams, contact reveal, submissions, judging, scoring, winner publication, reports, sponsor features.
- `supabase/config.toml` changes of any kind, including adding a `[auth.external.google]` block — see §D's explicit note on why this is not needed and not authorized.

## Verification steps (all required, in this order)
1. `npx supabase start`
2. `npx supabase db reset`
3. `npx supabase test db --local supabase/tests`
4. `npm run build`
5. `npx tsc --noEmit`
6. `npx eslint .`
7. `powershell -ExecutionPolicy Bypass -File scripts/verify.ps1`
8. `git status`
9. `git diff --stat`
10. `git diff --name-status`

Plus the focused runtime checks listed under "Testing requirements" — include actual command output/evidence (or a faithful pass/fail summary per check) in `CODEX_SUMMARY.md`, not just "all passed."

## Acceptance criteria
- [ ] Migration applies cleanly from a fresh `supabase db reset`.
- [ ] Only `profiles.initial_onboarding_completed_at` was added — no other column, table, or policy.
- [ ] The column is `timestamptz`, nullable, with **no default** (verified distinct from `default_workspace`'s default).
- [ ] No RLS policy references `initial_onboarding_completed_at` (verified by the policy-text-scan test, not just by not writing one).
- [ ] Email/password sign-up exists and correctly distinguishes local (session issued) vs. production-shaped (confirmation-pending) behavior.
- [ ] Email/password sign-in exists, returns a generic `invalid_credentials` error on failure, never leaks account existence beyond Supabase's own behavior.
- [ ] Google OAuth initiation exists, builds a correct redirect, and the local-testing limitation (no configured provider) is documented, not worked around.
- [ ] The callback route exchanges a valid code safely and handles missing/invalid codes without crashing or leaking internals.
- [ ] Sign-out works server-side, handles an already-signed-out user safely, redirects to `/`.
- [ ] First-run routing uses `initial_onboarding_completed_at is null` exclusively — no `created_at`/`updated_at`/`last_sign_in_at` heuristic exists anywhere in the diff.
- [ ] Participant onboarding sets exactly `default_workspace = 'participant'` and `initial_onboarding_completed_at = now()`, creates no organization/membership, grants no organizer access.
- [ ] Organizer onboarding calls `create_organization_with_owner` (never a direct insert), and organizer authority is demonstrably derived only from the resulting `organization_members` row, not from the profile columns.
- [ ] A successful organizer onboarding ends at `/organizer`.
- [ ] An organizer-preference user with zero memberships is never routed to `/organizer` (routes to `/dashboard` instead, per §F case 4).
- [ ] `default_workspace` and `initial_onboarding_completed_at` are proven, by test, to grant no table access on their own.
- [ ] The full redirect attack list in §K is proven rejected, not just described as rejected.
- [ ] No `src/lib/supabase/admin.ts` import exists anywhere under `src/lib/auth/**` or the new `src/app/(auth)/**` route handlers.
- [ ] No UI/design file was created; no `src/app/(public)/**`, participant dashboard, or existing organizer page/layout was touched.
- [ ] No participant-profile-completion field, event, registration, matching, team, judging, or sponsor scope appears anywhere in the diff.
- [ ] `npm run build`, `npx tsc --noEmit`, `npx eslint .`, `supabase test db --local`, and `verify.ps1` all pass.
- [ ] `git diff --name-status`/`git status` show changes restricted to exactly the files listed in "Files Codex may create or modify."
- [ ] `handoff/CODEX_SUMMARY.md` is complete per the list below.
- [ ] Nothing committed, nothing pushed.

## Handoff requirements (`handoff/CODEX_SUMMARY.md`)

Must include: exact migration filename and column definition; exact auth providers implemented; exact callback route path; exact list of every action/helper/route-handler file created, with a one-line purpose each; participant onboarding behavior; organizer onboarding sequencing and the exact partial-failure model from §H (including the recovery-path explanation); how membership grants organizer authority (with a pointer to the specific test proving it); how `default_workspace` is preference-only and how `initial_onboarding_completed_at` is workflow-only (with pointers to the specific tests proving both); sign-out behavior; safe-redirect behavior and which attack-list items were verified how; the exact error contract shape used; every test and runtime check performed with actual results; all files changed; all ten verification commands run with results; deviations from this task and why; risks; explicit deferred-to-`AUTH-002B` list (at minimum: all UI, the richer organizer zero-membership recovery flow noted in §F case 4, the Google OAuth live-credential gap noted in §D); and an explicit, plain-language confirmation that no skills/profile-completion/event/matching/judging/dashboard-UI scope was implemented.

Stop after writing the handoff. Do not start another task. Do not commit. Do not push.
