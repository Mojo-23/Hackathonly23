# Task: AUTH-001 — Identity, Organization Membership, and Auth Routing Foundation

## Task ID
`PHASE-AUTH-001` (implementation task `AUTH-001`)

**This supersedes the draft at `tasks/PHASE-AUTH-001.md`.** That draft included `organization_invites` and a `last_active_organization_id` convenience column; this active task narrows scope further per explicit human instruction — **neither is in scope here.** The draft file should be treated as superseded background context only; this document is the binding contract. If a future task needs invites, it will be scoped separately.

## Phase reference
`docs/PHASES.md` → "Next planned phase — Role-Aware Authentication and Dashboard Architecture," specifically the foundation slice described in `handoff/CLAUDE_IMPLEMENTATION_SUMMARY.md` §7 item 1 ("schema foundation... no dashboard UI").

## Objective
Give every user a `default_workspace` preference, let a user atomically create an organization and become its owner, and enforce — server-side, via RLS and route guards — that organizer capability is derived solely from `organization_members` membership, never from a stored role or client claim. No dashboard content, no onboarding UI, no event-domain schema.

## Binding architecture — do not deviate without stopping and flagging back for review

1. One auth identity per person. No second `profiles`-like table, no account fork.
2. A user may participate and organize with the same account — nothing in this task may create a structure that prevents that.
3. **Do not add:** `profiles.role`, `profiles.is_organizer`, any permanent exclusive participant/organizer enum, or any mechanism that lets client-supplied data declare authorization.
4. Organizer authority is derived exclusively from a valid `organization_members` row. No shortcut, cache, or denormalized flag that could drift from that table.
5. `profiles.default_workspace` is preference-only. It may influence redirect *destination*; it must never appear in a `WHERE` clause, `USING`, or `WITH CHECK` of any RLS policy or `SECURITY DEFINER` function, and it must never gate table access.
6. Participant and Organizer remain separate application experiences (existing `(participant)` route group and `src/app/organizer` — this task does not merge them, does not add a mode toggle, and does not modify their existing page/layout content).
7. Anonymous visitors do not see Dashboard, under any path — this must be a server-enforced redirect, not a client conditional.
8. Authorization is enforced server-side and by RLS. No policy or guard may trust a header, cookie value, or client-submitted field as an authorization signal — only `auth.uid()` and table state.
9. The browser must never be trusted to declare account role, organization role, organization ownership, or organizer capability. Every one of those must be re-derived server-side on every request that needs it.
10. Out of scope, structurally, not just by omission: contact reveal, sponsor access, matching, events/hackathons, judging, winner publication, reports. Do not create any table, column, policy, or helper that touches these domains, even speculatively.

Full reasoning for all of the above: `docs/architecture/DECISIONS.md` (AD-1, AD-3, AD-4, AD-5, AD-6, AD-8), `docs/architecture/AUTH_ARCHITECTURE.md`, `docs/architecture/ROLE_MODEL.md`, `docs/architecture/RLS_STRATEGY.md` (especially §1 and §11 — "workspace is UI, RLS is truth" and "what must not be built").

## Conflict-of-interest note (context only — not implemented this task)
`docs/architecture/RLS_STRATEGY.md` §6 records a binding decision that manager-tier organizers must not participate/judge/score in their own organization's events by default. **This task does not touch `hackathon_applications` or `event_roles` and does not implement any part of that rule** — it is noted here only so Codex does not mistake its absence for an oversight. It belongs to whichever future task builds event registration.

## Approvals on record

The human has explicitly approved, for this task, **local-only**:
- [x] Database migrations required for this task's minimum schema (below) — approved.
- [x] RLS policies required for this task's tables — approved.
- [x] Local database tests (`supabase/tests/database/`) — approved.
- [x] Server-side auth/membership/workspace helper code (no UI) — approved.
- [x] The specific `docs/DATABASE.md`, `docs/RLS_ACCESS_MATRIX.md`, and `docs/ROUTES.md` reconciliation described in "Documentation reconciliation required" below — approved, scoped to exactly that section. No other documentation file is approved for editing unless a future task lists it for a concrete reason.

**Not approved, and explicitly forbidden — see "Forbidden" below for the full list:** any remote Supabase operation (`supabase link`, `supabase db push`, production keys, manual SQL Editor work), package additions, dashboard visual implementation, auth UI implementation, event-domain tables.

## Minimum database scope

### `profiles.default_workspace` (new column on existing `profiles` table)
- Type: `text`, `not null`.
- Accepted values, enforced by a `check` constraint following this repo's existing constraint style (see `profiles_experience_level_known` / `profiles_primary_role_known` in `supabase/migrations/20260710120000_identity_foundation.sql` for the pattern to match): exactly `'participant'` and `'organizer'`. No other value may be accepted.
- Default: `'participant'` — the safer default per `docs/architecture/AUTH_ARCHITECTURE.md` §5 (an organizer-default user with zero orgs requires a bootstrap step this task doesn't build UI for; defaulting new/existing rows to `'participant'` avoids stranding anyone).
- Existing rows: since `profiles` may already have rows (from the signup trigger), the migration must backfill/default them to `'participant'` as part of adding the `not null` column — do not leave existing rows null or require a separate manual backfill step.
- Grants no authority. It must not be read by any RLS policy, any `SECURITY DEFINER` function, or any authorization decision in this task's server helpers — only by the redirect-destination helper described below.

### `organizations` (new table — minimum subset, not the full future shape)
Minimum fields only, deliberately smaller than the fuller shape already sketched in `docs/DATABASE.md` §1 `organizations` (which includes `logo_url`, `description`, `website`, `is_verified`):
- `id uuid primary key default gen_random_uuid()`
- `name text not null`
- `slug text not null` — unique, following the repo's existing `unique` constraint conventions
- `created_by_user_id uuid not null references public.profiles(id)` — naming rule: this is a user reference, so it is `_user_id`, not `_by` alone or `_by_id`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()` with the existing `set_updated_at()` trigger (already defined in `20260710120000_identity_foundation.sql` — reuse it, do not redefine it)
- No `logo_url`, `description`, `website`, `is_verified`, or any billing/branding/sponsor/settings field. These remain a documented future addition — see "Documentation reconciliation required" below.

### `organization_members` (new table — minimum subset)
- `id uuid primary key default gen_random_uuid()`
- `organization_id uuid not null references public.organizations(id) on delete cascade`
- `user_id uuid not null references public.profiles(id) on delete cascade`
- `role text not null` — `check` constraint restricting to exactly `'owner'`, `'admin'`, `'staff'` (matching `docs/architecture/ROLE_MODEL.md` §2 Scope C; matching the enum already named in `docs/DATABASE.md` §1)
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()` with `set_updated_at()` trigger
- `unique (organization_id, user_id)` — a person holds at most one role row per organization
- **No `status` column in this task.** No invite/pending lifecycle exists yet (that's `organization_invites`, explicitly deferred, not this task) — every row this task can create is immediately active, created only by the bootstrap function below. If a future task adds invites, it can add a status column then; do not add one speculatively now.

Naming rule check for all of the above: `profiles.id` remains the only exception; every reference above is correctly `_user_id`. The literal string `profile_id` must not appear in any new migration, function, policy, column, or index name.

## Organization bootstrap — single atomic RPC

Define one `SECURITY DEFINER` Postgres function, e.g. `public.create_organization_with_owner(p_name text, p_slug text)`, that in one transaction:
1. Validates the caller is authenticated (`auth.uid()` is not null) — raise a clear exception otherwise; do not silently no-op.
2. Validates `p_name` and `p_slug` are non-empty (basic shape checks — exact validation strictness is an implementation detail, but empty/whitespace-only values must be rejected).
3. Inserts one `organizations` row with `created_by_user_id = auth.uid()`.
4. Inserts one `organization_members` row for that new organization with `user_id = auth.uid()`, `role = 'owner'`.
5. Returns the new organization's id (or the full row — Codex's choice, document whichever is chosen).

Requirements:
- **`security definer`**, with **`set search_path = public, pg_temp`** (fixed search path — follow the exact pattern already used in `create_profile_for_new_user` in `supabase/migrations/20260710140000_signup_profile_trigger.sql`).
- **Atomicity:** a single function invocation is one statement from the caller's perspective and therefore already transactional in Postgres — do not split this into two client-side calls (one insert to `organizations`, then a separate insert to `organization_members`). If the function needs to also revoke `EXECUTE` from `anon` (only `authenticated` should be able to call it), state that explicitly in the handoff.
- **Duplicate slug handling:** must fail cleanly (either let the `unique` constraint violation propagate with a clear error, or check first and raise a descriptive exception — Codex's choice, but the behavior must be deterministic and tested).
- **Invalid input handling:** empty/null name or slug rejected before any insert is attempted.
- **No membership escalation path:** this function must be the *only* way an `organization_members` row can ever be created in this task's scope — there must be no RLS `insert` policy on `organization_members` that would allow any other path (see RLS requirements below).

## RLS requirements — exact policies

Both new tables (`organizations`, `organization_members`) must have RLS **enabled** (`alter table ... enable row level security`) with no permissive default.

**Recursion warning (must be handled correctly):** a policy on `organization_members` that queries `organization_members` directly to check "is this user a member of this org" will self-reference and either recurse or behave incorrectly under RLS. Follow the same pattern `docs/RLS_ACCESS_MATRIX.md` §Enforcement notes already establishes for `is_event_organizer` et al.: a `security definer`, `stable`, search-path-pinned helper function (e.g. `public.is_organization_member(p_organization_id uuid) returns boolean`) that queries membership without going back through the calling policy's RLS context, and have policies call that helper rather than embedding a raw self-join.

**`organizations` table:**
- `select`: members only — a row is visible only to users who have a matching `organization_members` row (via the helper function above). **No public/anonymous read policy in this task** — this is a deliberate, documented narrowing versus `docs/DATABASE.md`'s eventual "public read of verified orgs" (that policy assumes an `is_verified` column this task does not build; adding public read without it would expose organization existence with no gate). See "Documentation reconciliation required."
- `insert`: **no policy** — creation happens exclusively through `create_organization_with_owner`.
- `update`: **no policy in this task** — org editing is out of scope (no organization management UI this task, per "Forbidden").
- `delete`: **no policy in this task.**

**`organization_members` table:**
- `select`: a user may read `organization_members` rows for organizations where they are themselves a member (via the same `is_organization_member` helper) — i.e., a member can see their fellow members' `role`, not just their own row. A user with no membership in an org sees nothing for that org.
- `insert`: **no policy** — membership creation happens exclusively through `create_organization_with_owner`. This is what makes "arbitrary membership insertion is denied" and "self-promotion is denied" true structurally, not just by convention.
- `update`: **no policy in this task** — role changes (e.g., an owner promoting a staff member to admin) are explicitly deferred; do not build this even though it may seem like an obvious adjacent need. This is what makes "users cannot update their own membership role" true structurally.
- `delete`: **no policy in this task.**

**Explicit minimum principles this must satisfy (from the approved requirements — verify each, don't just implement and hope):**
- RLS enabled on both new tables. ✓ (above)
- Users cannot give themselves owner/admin/staff access outside the bootstrap function. ✓ (no insert policy)
- Users cannot update their own membership role. ✓ (no update policy at all)
- Users cannot create arbitrary memberships. ✓ (no insert policy)
- Non-members cannot read private organization/membership data. ✓ (member-only select via helper)
- Members may read only explicitly approved data — no extra columns, no cross-org leakage. ✓ (scoped by org membership)
- Organization creation happens only through the bootstrap function. ✓
- Browser code never receives service-role authority — this task's server helpers (below) must use the existing SSR/user-context client (`src/lib/supabase/server.ts`), never `src/lib/supabase/admin.ts`, for anything a user-facing request path touches.
- `default_workspace` cannot grant organization access — verify no policy or helper function reads it.
- No blanket authenticated insert/update policy anywhere in this task's migrations.
- No broad "all organizers" policy — every check is scoped to a specific `organization_id`, never "is this user an organizer of *anything*."

## Future database plan reconciliation
Per `docs/architecture/FUTURE_DATABASE_PLAN.md` §2, this task implements exactly two of the listed items (`profiles.default_workspace`, and the `organizations`/`organization_members` foundation) and deliberately **not** `organization_invites` or `profiles.last_active_organization_id` — both remain future work, unchanged from that document. Do not build either.

## Server-side application foundation

Inspect existing helpers first: `src/lib/supabase/server.ts` (SSR user-context client, existing, reuse as-is), `src/lib/supabase/admin.ts` (service-role, existing — do not use it in any of this task's new code paths), `src/lib/supabase/client.ts` (browser client, existing — not relevant to server-side authorization). No `middleware.ts` currently exists in the repo, and neither `src/app/(participant)/layout.tsx` nor `src/app/organizer/events/[eventId]/layout.tsx` currently perform any auth check at all (confirmed by inspection — both are pre-existing placeholder UI over mock data from the earlier design phase; this task does not add content to either, see "Forbidden," but the routing/redirect enforcement below is exactly what currently doesn't exist and is this task's job to add without touching those files' content).

Build, at minimum, small and independently testable/readable:
- **Resolve authenticated user** — a helper wrapping `createClient()` from `server.ts` + `auth.getUser()`, returning the user or null. Do not re-implement session handling; use the existing SSR client.
- **Resolve current profile** — given a resolved user, fetch their `profiles` row (existing table, existing RLS — no changes needed there).
- **Resolve organization memberships** — given a resolved user, fetch their `organization_members` rows (id, organization_id, role) — used to determine organizer-route accessibility. Must query through the same RLS-respecting SSR client, not the admin client, since a user is always authorized to see their own memberships under the `select` policy above.
- **Resolve default workspace** — read `profiles.default_workspace` for redirect-destination purposes only (see binding architecture point 5 — never for authorization).
- **Determine organizer-route accessibility** — a pure function of "does this user have ≥1 organization_members row" (per `docs/architecture/PRODUCT_FLOWS.md` §2's switcher-visibility rule and `AUTH_ARCHITECTURE.md` §5's routing table) — not a function of `default_workspace`.
- **Route guard / redirect foundation** — implement as Next.js middleware, since this is the only mechanism available to enforce "anonymous visitors do not see Dashboard" server-side without editing the existing placeholder page/layout content in `(participant)` or `organizer`. **Path is not fixed by this task.** Inspect the actual project structure (this repo uses a `src/app/` directory) and the installed Next.js version (`package.json` — currently `"next": "16.2.10"`) and place the middleware file at whichever location that version of Next.js actually resolves for a project with a `src/` directory — do not assume repository-root `middleware.ts` is correct just because it's the commonly-cited default; verify against the framework's own docs/behavior for this project's structure before choosing. Whatever path is chosen must be confirmed working (middleware actually invoked — verify by observing the redirect behavior below actually occurring, not just by the file existing) before handoff, and the exact final path must be stated plainly in `handoff/CODEX_SUMMARY.md`. Required behavior:
  - Any request to `/dashboard` (and, going forward, other `(participant)` routes as they're added) while unauthenticated → redirect to `/auth?next=<original path>`. (`/auth` does not need to exist as a built page yet — see "Forbidden" — the redirect target and its validation logic are this task's job; the page itself is not.)
  - Any request to `/organizer/**` while unauthenticated → redirect to `/auth?next=<original path>`, same as above.
  - Any request to `/organizer/**` while authenticated but with zero `organization_members` rows → redirect to `/dashboard` (the one dashboard destination that does exist and requires no organization). Do not invent or redirect to an organization-creation page — that UI is out of scope this task.
  - Requests to `(public)` routes and any other currently-public route are unaffected — do not add auth checks there.
- **Safe return URL (`next`) handling** — per `docs/architecture/PRODUCT_FLOWS.md` §6: validate that a `next` value is a same-origin, internal path before honoring it on redirect back after auth; reject/ignore anything else (external URL, protocol-relative `//`, etc.) rather than redirecting to it.

Where these live is Codex's call within `src/lib/` (e.g. `src/lib/auth/` as a new directory) — keep them small, focused, and named clearly; this is foundation code a later task will build UI on top of, not a place to over-abstract for hypothetical future needs.

## Documentation reconciliation required (explicitly authorized, scoped to exactly this)

Update, as part of this task (not a separate one):
- `docs/DATABASE.md` §1 — add `profiles.default_workspace`, and add the minimal `organizations`/`organization_members` shape actually built, clearly noting (in the existing prose style) that `logo_url`, `description`, `website`, `is_verified` on `organizations`, and any `status` column on `organization_members`, remain future additions not yet implemented — do not delete or contradict the fuller future shape already sketched there, annotate it as "not yet built" instead.
- `docs/RLS_ACCESS_MATRIX.md` — add rows for `organizations` and `organization_members` matching the exact policies implemented above.
- `docs/ROUTES.md` — document **only** the routing behavior this task actually introduces, nothing more:
  - `/dashboard` is an authenticated route (unauthenticated requests are redirected, per below).
  - `/organizer/**` is an authenticated **and** organization-membership-gated route — authenticated users with no valid `organization_members` row cannot enter it.
  - Anonymous requests to either are redirected to the approved login/onboarding redirect target, carrying a validated, same-origin `next`/return parameter (per `docs/architecture/PRODUCT_FLOWS.md` §6) — do not name or imply a specific built `/auth` or `/onboarding` page exists; describe the redirect target as the approved future login destination if no such page exists yet in the repo.
  - `profiles.default_workspace` may influence the default post-auth destination but **grants no permission** — state this explicitly, mirroring binding architecture point 5 of this task.
  - Route enforcement is **server-side/middleware-based** — explicitly note this is not client-hidden navigation, consistent with binding architecture points 7–9.
  - Do **not** document any participant dashboard content, auth page, onboarding page, or organizer route as already implemented/live if it does not actually exist in the repository at the time this task's diff lands — Codex must verify each named route against the actual repo tree before writing the doc update, not against this task's plan.
  - Any route this doc mentions that isn't built yet must be explicitly labeled future/planned, never described as live.

No other doc may be edited. `docs/architecture/*.md` are not to be modified by this task — they are Claude's, and any inaccuracy found should be reported in the handoff, not silently fixed.

## Files expected to change (best guess, not exhaustive — if the real diff differs meaningfully, explain why in the handoff)
- `supabase/migrations/<new timestamp>_org_identity_foundation.sql` (schema: `default_workspace`, `organizations`, `organization_members`)
- `supabase/migrations/<new timestamp>_org_identity_rls.sql` (RLS enable + policies + helper function(s))
- `supabase/migrations/<new timestamp>_org_bootstrap_function.sql` (the `create_organization_with_owner` RPC)
- `supabase/tests/database/org_identity_foundation.test.sql` (new test file, following the existing `identity_foundation.test.sql` structure/style)
- `src/lib/auth/*.ts` (new — session/profile/membership/workspace/guard helpers)
- Next.js middleware file (new — exact path determined by Codex per the framework-appropriate location for this project's structure and installed Next.js version; see "Server-side application foundation")
- `docs/DATABASE.md`, `docs/RLS_ACCESS_MATRIX.md`, `docs/ROUTES.md` (edited, per above)
- `handoff/CODEX_SUMMARY.md` (new/overwritten, per standard process)

## Forbidden — explicit
- Any change to `src/app/(public)/**` (public pages, design system, motion) — not touched by this task.
- `docs/DESIGN_SYSTEM.md`, `docs/MOTION_SYSTEM.md` or anything they govern.
- `package.json`, `package-lock.json`, or any dependency installation — this task uses only what's already installed.
- Any remote Supabase command: `supabase link`, `supabase db push`, anything touching production keys or the hosted project, manual Supabase Studio/SQL Editor work. **This task is local-only** — `supabase start` / `supabase db reset` / `supabase test db --local` against the local dev stack only.
- Event schema, registration schema (`hackathons`, `hackathon_applications`, etc.), matching/team schema, contact reveal, submissions, judges, scoring, winners/results, sponsor reports — all explicitly out of scope, not to be created even as stubs.
- `organization_invites`, `profiles.last_active_organization_id` — deferred, not this task (see "Future database plan reconciliation").
- Dashboard visual implementation — do not add to or restyle `src/app/(participant)/**` or `src/app/organizer/**` page/layout content. Middleware-level route protection is in scope; page content is not.
- Auth UI (`/auth`, `/onboarding` pages) — not built this task.
- Full authenticated navigation, organization management UI, event management UI.
- Blog changes, image changes — unrelated to this task, not touched.

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

Include the actual output (or a faithful summary with pass/fail per step) of all ten in `handoff/CODEX_SUMMARY.md` — not just "all passed."

## Acceptance criteria
- [ ] Migrations apply cleanly from a fresh `supabase db reset` (zero to current state, no manual intervention).
- [ ] `profiles.default_workspace` exists, `not null`, constrained to exactly `'participant'` / `'organizer'`, existing rows correctly defaulted.
- [ ] Inserting a `default_workspace` value outside the two allowed values is rejected by the database (not just by application code).
- [ ] `organizations` and `organization_members` exist with exactly the minimum columns specified above — no extra fields.
- [ ] `create_organization_with_owner` creates exactly one organization and exactly one `owner` membership row, atomically, in one call.
- [ ] Calling the bootstrap function twice with the same slug fails cleanly (no partial state left behind either time).
- [ ] A direct `insert` into `organization_members` attempted by an authenticated user (bypassing the function) is denied by RLS.
- [ ] A direct `update` of `organization_members.role` by the row's own user is denied by RLS (self-promotion impossible).
- [ ] A user with no membership in organization A cannot `select` any row of A's `organization_members` or (per the policy above) A's `organizations` row.
- [ ] A member of organization A can `select` A's members and A's organization row; cannot see organization B's data unless also a member there.
- [ ] Organizer capability is demonstrably derived only from `organization_members` — no column, cache, or helper duplicates this fact.
- [ ] No `profiles.role`, no `profiles.is_organizer`, no exclusive account-type enum exists anywhere in the diff.
- [ ] `default_workspace` is confirmed (by test) to grant no table access — e.g., a `'organizer'`-default user with zero memberships still cannot read any organization's data.
- [ ] A user can simultaneously hold an `organization_members` row and have `hackathon_applications`-style "just a participant" status conceptually — this task doesn't build `hackathon_applications`, so demonstrate this instead by confirming nothing in the new schema prevents a user from both owning an org and having `default_workspace = 'participant'` (i.e., the two are independent, per binding architecture point 2).
- [ ] `git grep profile_id` returns nothing; naming verification (`scripts/verify.ps1`'s forbidden-string scan) passes.
- [ ] `npm run build`, `npx tsc --noEmit`, `npx eslint .` all pass with zero errors.
- [ ] No remote Supabase command appears anywhere in the commands actually run (confirm in the handoff).
- [ ] No file under `src/app/(public)/**`, `src/app/(participant)/**` (beyond nothing — should be untouched), `src/app/organizer/**` (beyond nothing — should be untouched), or any dashboard page/layout was modified.
- [ ] No event-domain table, column, or policy was created.
- [ ] `docs/DATABASE.md`, `docs/RLS_ACCESS_MATRIX.md`, and `docs/ROUTES.md` updated exactly as scoped above; no other doc touched.
- [ ] `docs/ROUTES.md` accurately reflects the middleware/server-enforced access rules introduced by this task — no unrelated route documented as changed, no route claimed to exist unless it actually exists in the repository at the time of the diff, and `default_workspace` documented explicitly as preference-only, never as authorization.
- [ ] `handoff/CODEX_SUMMARY.md` written.
- [ ] The full diff (`git diff --name-status`) contains only files from the "Files expected to change" list above, or any deviation is explained in the handoff.

## Handoff notes expected (in `handoff/CODEX_SUMMARY.md`)
- Exact migrations created (filenames + one-line purpose each).
- Exact tables/columns/constraints added, verbatim enough for Claude to diff against this task without re-reading the SQL line by line.
- Exact function/RPC behavior: signature, `security definer` + `search_path` confirmation, what it validates, what it returns, exact error behavior for duplicate slug / invalid input / unauthenticated call.
- Exact RLS policies added, per table, and the recursion-avoidance helper function's exact definition/signature.
- Exact tests added (list of test names/assertions, mirroring the acceptance criteria above).
- Exact server helpers added (file list + one-line purpose each) and exact middleware behavior implemented, including the **exact final middleware file path chosen and why** (per the framework-appropriate location determined during implementation, not assumed in advance by this task).
- Files changed (should match `git diff --name-status`).
- Commands actually run, with pass/fail per verification step.
- Any deviation from this task and why.
- Any risk or judgment call made without a clear existing pattern to follow (e.g., exact error-handling shape in the bootstrap function).
- Explicit follow-up list: what the next task (dashboard content, `organization_invites`, role-update capability, conflict-of-interest enforcement) should pick up, without Codex having built any of it.
- Explicit confirmation, in plain words: no dashboard, event, matching, or judging scope was implemented in this task.

Stop after writing the handoff. Do not start another task. Do not commit. Do not push.
