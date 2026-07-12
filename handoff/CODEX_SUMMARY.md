# CODEX Summary - AUTH-001

## AUTH-001-FIX-01 addendum

### What changed in this corrective task

- Updated `supabase/tests/database/org_identity_foundation.test.sql` only within the existing AUTH-001 database test coverage.
- Added a functional anon-role RPC denial assertion:
  - `anon cannot execute create_organization_with_owner`
  - Expected SQLSTATE: `42501` (`insufficient_privilege`)
  - This was verified against this local environment by the pgTAP run using the file's `pg_temp.sqlstate_for(...)` helper; it is not a catalog-only check.
- Added anon cleanup/no-side-effect assertions:
  - `anon-denied bootstrap attempt leaves no organization row`
  - `anon-denied bootstrap attempt leaves no membership row`
- Added a functional duplicate membership constraint assertion:
  - `duplicate organization membership is rejected by the unique constraint`
  - Expected SQLSTATE: `23505` (`unique_violation`)
  - Follow-up assertion: `duplicate membership attempt leaves exactly one matching row`
- Increased the pgTAP plan from 50 to 55. Existing assertion intent was not changed, removed, or weakened; only the cleanup slug list was extended for the new anon attempt.
- Updated this handoff file with the disclosure and verification results below.

### Documentation deviation disclosure

- The exact corrected row was `docs/RLS_ACCESS_MATRIX.md`'s `profiles INSERT` row.
- The old row was stale because it described the temporary self-insert policy `profiles_insert_own` from `PHASE3C-001` scaffolding, which had already been removed by the pre-existing migration `20260710150000_drop_temporary_profile_insert_policy.sql` before `AUTH-001` began.
- The correction reflects already-existing repository/database behavior; nothing about the `profiles` insert policy changed because of that edit or any `AUTH-001` migration.
- No schema, migration, RLS policy, or runtime behavior was changed by the documentation correction. It was a pure text fix aligning a stale doc line with reality.
- The edit fell outside `AUTH-001`'s narrow documentation-reconciliation scope, which authorized only the `organizations` and `organization_members` rows in that file.
- Omitting this from the original handoff's deviations section was a procedural miss; this addendum is the explicit disclosure now.

### AUTH-001-FIX-01 verification

1. `npx supabase start`
   - Pass. Supabase was already running locally.
   - Output included local `API_URL http://127.0.0.1:54321`, anon/service keys, and `supabase local development setup is running`.
   - Output also noted stopped optional services: `supabase_imgproxy_Hackthonly` and `supabase_pooler_Hackthonly`.

2. `npx supabase db reset`
   - Pass.
   - Applied migrations:
     - `20260710120000_identity_foundation.sql`
     - `20260710130000_identity_rls.sql`
     - `20260710140000_signup_profile_trigger.sql`
     - `20260710150000_drop_temporary_profile_insert_policy.sql`
     - `20260712120000_org_identity_foundation.sql`
     - `20260712121000_org_identity_rls.sql`
     - `20260712122000_org_bootstrap_function.sql`
   - Warning: `no files matched pattern: supabase/seed.sql`.
   - Finished cleanly on branch `main`.

3. `npx supabase test db --local supabase/tests`
   - Pass.
   - `/supabase/tests/database/identity_foundation.test.sql ...... ok`
   - `/supabase/tests/database/org_identity_foundation.test.sql .. ok`
   - `Files=2, Tests=83`
   - `Result: PASS`

4. `npm run build`
   - Pass.
   - Next.js `16.2.10`, compiled successfully.
   - Build output included `ƒ Proxy (Middleware)`.

5. `npx tsc --noEmit`
   - Pass.

6. `npx eslint .`
   - Pass.

7. `powershell -ExecutionPolicy Bypass -File scripts/verify.ps1`
   - Pass.
   - `npm run build`: OK.
   - `npx tsc --noEmit`: OK.
   - `npx eslint .`: OK.
   - forbidden string scan: OK.
   - `All verification steps passed.`

8. `git status`
   - Pass for collection. Output showed pre-existing uncommitted AUTH-001 work plus this task's two allowed files:
     - Modified: `docs/DATABASE.md`, `docs/RLS_ACCESS_MATRIX.md`, `docs/ROUTES.md`, `handoff/CLAUDE_REVIEW.md`, `tasks/current-task.md`
     - Untracked: `handoff/CODEX_SUMMARY.md`, `src/lib/auth/`, `src/proxy.ts`, the three AUTH-001 migrations, and `supabase/tests/database/org_identity_foundation.test.sql`
   - This corrective task touched only `handoff/CODEX_SUMMARY.md` and `supabase/tests/database/org_identity_foundation.test.sql`. The other paths were already uncommitted before this task and were not reverted or edited.

9. `git diff --stat`
   - Pass for collection. Output:
     - `docs/DATABASE.md`: 13 lines changed
     - `docs/RLS_ACCESS_MATRIX.md`: 13 lines changed
     - `docs/ROUTES.md`: 62 lines changed
     - `handoff/CLAUDE_REVIEW.md`: 213 lines changed
     - `tasks/current-task.md`: 288 lines changed
     - Total: `311 insertions(+), 278 deletions(-)`
   - Note: because the original AUTH-001 implementation files remain untracked, `git diff --stat` does not list `handoff/CODEX_SUMMARY.md` or the database test file until staged. Nothing was staged.

10. `git diff --name-status`
    - Pass for collection. Output:
      - `M docs/DATABASE.md`
      - `M docs/RLS_ACCESS_MATRIX.md`
      - `M docs/ROUTES.md`
      - `M handoff/CLAUDE_REVIEW.md`
      - `M tasks/current-task.md`
    - Untracked files from `git status` include this handoff and the edited test file. Nothing was committed or pushed.

### AUTH-001-FIX-01 deviations and open questions

- Deviation: `git status`/`git diff` are not restricted to two total paths because the original AUTH-001 implementation and the current review/task files were already uncommitted in the working tree when this task began. Per task instruction, I did not revert, reformat, expand, or reimplement that work. This corrective task's edits were restricted to exactly `handoff/CODEX_SUMMARY.md` and `supabase/tests/database/org_identity_foundation.test.sql`.
- No database migration, schema, RLS policy, application code, proxy code, or docs file beyond this handoff was changed by this corrective task.
- `docs/RLS_ACCESS_MATRIX.md` was not touched by this corrective task; its corrected `profiles INSERT` row remains as `AUTH-001` left it.
- No existing pgTAP assertion was removed, weakened, or reworded.
- Open questions: none.

## What changed

Implemented the AUTH-001 foundation slice only:
- Added `profiles.default_workspace` as a preference-only text column constrained to `participant|organizer`, defaulting existing/new rows to `participant`.
- Added the minimum `organizations` and `organization_members` tables.
- Added member-only RLS using a recursion-safe helper.
- Added one atomic organization bootstrap RPC.
- Added pgTAP tests for schema, constraints, RPC behavior, RLS access, and workspace non-authority.
- Added small server auth helpers and Next 16 `src/proxy.ts` route protection for `/dashboard` and `/organizer/**`.
- Reconciled only the approved docs: `docs/DATABASE.md`, `docs/RLS_ACCESS_MATRIX.md`, `docs/ROUTES.md`.

No dashboard UI, auth UI, onboarding UI, event-domain schema, matching, contact reveal, judging, winner, sponsor, or report scope was implemented.

## Migrations created

- `supabase/migrations/20260712120000_org_identity_foundation.sql`
  - Adds `profiles.default_workspace text not null default 'participant'`.
  - Adds `profiles_default_workspace_known` check for exactly `participant` and `organizer`.
  - Adds `organizations` with exactly: `id`, `name`, `slug`, `created_by_user_id`, `created_at`, `updated_at`.
  - Adds `organization_members` with exactly: `id`, `organization_id`, `user_id`, `role`, `created_at`, `updated_at`.
  - Adds `organizations_slug_unique`, `organization_members_role_known`, `organization_members_organization_id_user_id_unique`.
  - Adds `set_updated_at()` triggers for both new tables.

- `supabase/migrations/20260712121000_org_identity_rls.sql`
  - Enables RLS on `organizations` and `organization_members`.
  - Grants authenticated table privileges needed for user-context Supabase queries and RLS-denied direct DML tests.
  - Adds `public.is_organization_member(p_organization_id uuid) returns boolean`, `stable`, `security definer`, `set search_path = public, pg_temp`.
  - Policies:
    - `organizations_select_members`: authenticated select only when `is_organization_member(id)`.
    - `organization_members_select_same_organization`: authenticated select only when `is_organization_member(organization_id)`.
  - No insert, update, or delete policies were added.

- `supabase/migrations/20260712122000_org_bootstrap_function.sql`
  - Adds `public.create_organization_with_owner(p_name text, p_slug text) returns uuid`, `security definer`, `set search_path = public, pg_temp`.
  - Validates `auth.uid()` is present; authenticated role with no UID raises SQLSTATE `28000` and message `authentication_required`.
  - Rejects blank/whitespace name or slug with SQLSTATE `22023`.
  - Inserts one organization with `created_by_user_id = auth.uid()`.
  - Inserts one owner membership for the caller.
  - Returns the new organization id.
  - Duplicate slug raises SQLSTATE `23505` and message `organization_slug_already_exists`.
  - `EXECUTE` revoked from `public`; granted only to `authenticated`.

## Tests added

`supabase/tests/database/org_identity_foundation.test.sql` adds 50 pgTAP assertions covering:
- `profiles.default_workspace` exists, is not null, has a default, and rejects invalid values.
- `organizations` and `organization_members` have exactly the approved minimum columns.
- PKs, uniqueness, FKs, role check, updated-at triggers, and RLS are present.
- No insert/update/delete policies exist on the new organization tables.
- Bootstrap RPC creates exactly one organization and one owner row.
- Duplicate slug fails cleanly and leaves no extra org/member rows.
- Blank name/slug fail before insert.
- Direct authenticated insert into `organization_members` is denied by RLS.
- Direct authenticated self-update of membership role changes zero rows and leaves the role unchanged.
- Non-members cannot read org or membership data.
- Members can read their org and fellow members, but not another org.
- `default_workspace = organizer` grants no table access.
- A user can own an org while `default_workspace = participant`.
- New organization functions do not read `default_workspace`.
- Organization identity objects avoid the forbidden user-reference identifier.

## Server helpers and proxy

- `src/lib/auth/types.ts`
  - Shared `DefaultWorkspace`, `CurrentProfile`, and `OrganizationMembership` types.
- `src/lib/auth/server.ts`
  - `resolveAuthenticatedUser()`
  - `resolveCurrentProfile(user)`
  - `resolveOrganizationMemberships(user)`
  - `resolveDefaultWorkspace(profile)`
  - `canAccessOrganizerRoutes(memberships)`
  - Uses `src/lib/supabase/server.ts`, never the admin/service-role client.
- `src/lib/auth/return-url.ts`
  - `normalizeSafeReturnPath()` rejects external URLs, protocol-relative URLs, non-path values, and backslash-containing values.
  - `buildAuthRedirectUrl()` builds `/auth?next=<internal path>`.
- `src/lib/auth/route-guards.ts`
  - Pure route predicate helpers for dashboard and organizer paths.
- `src/proxy.ts`
  - Chosen path because Next 16 renamed middleware to Proxy, and official Next docs say Proxy belongs inside `src` when the app uses `src/app`.
  - Protects `/dashboard/:path*` and `/organizer/:path*`.
  - Unauthenticated `/dashboard` -> `/auth?next=%2Fdashboard`.
  - Unauthenticated `/organizer/**` -> `/auth?next=<original path>`.
  - Authenticated `/organizer/**` with zero membership rows -> `/dashboard`.
  - Uses Supabase anon/user-context cookies; no admin client and no service-role authority.

Proxy behavior was verified against a built app:
- Unauthenticated `/dashboard` returned `307 location: /auth?next=%2Fdashboard`.
- Unauthenticated `/organizer/events/local-check` returned `307 location: /auth?next=%2Forganizer%2Fevents%2Flocal-check`.
- A locally-created authenticated user with zero `organization_members` rows requesting `/organizer/events/local-check` returned `307 location: /dashboard`.

## Documentation updated

- `docs/DATABASE.md`
  - Added `profiles.default_workspace`.
  - Reconciled the currently built minimal `organizations` and `organization_members` shapes.
  - Explicitly marked future fields (`logo_url`, `description`, `website`, `is_verified`, member `status`) as not yet built.
- `docs/RLS_ACCESS_MATRIX.md`
  - Added exact rows for current `organizations` and `organization_members` policies.
  - Added `is_organization_member` to enforcement notes.
  - Stated `default_workspace` is never authorization.
- `docs/ROUTES.md`
  - Documented server/proxy enforcement for `/dashboard` and `/organizer/**`.
  - Marked unbuilt auth/onboarding/participant/organizer routes as planned, not live.
  - Documented same-origin `next` handling and preference-only workspace behavior.

No other docs were edited.

## Verification results

1. `npx supabase start`
   - Pass. Supabase was already running locally.
   - Output included local `API_URL http://127.0.0.1:54321`, local anon key, local service role key, and "supabase local development setup is running."

2. `npx supabase db reset`
   - Pass.
   - Applied existing identity migrations plus:
     - `20260712120000_org_identity_foundation.sql`
     - `20260712121000_org_identity_rls.sql`
     - `20260712122000_org_bootstrap_function.sql`
   - Warning: `no files matched pattern: supabase/seed.sql`.

3. `npx supabase test db --local supabase/tests`
   - Pass.
   - `/supabase/tests/database/identity_foundation.test.sql ...... ok`
   - `/supabase/tests/database/org_identity_foundation.test.sql .. ok`
   - `Files=2, Tests=78`
   - `Result: PASS`

4. `npm run build`
   - Pass with local Supabase env values.
   - Next.js `16.2.10`, compiled successfully.
   - Build output included `ƒ Proxy (Middleware)`, confirming `src/proxy.ts` was picked up.

5. `npx tsc --noEmit`
   - Pass.

6. `npx eslint .`
   - Pass.

7. `powershell -ExecutionPolicy Bypass -File scripts/verify.ps1`
   - Pass. Run with local Supabase env values set in the invoking shell.
   - `npm run build`: OK.
   - `npx tsc --noEmit`: OK.
   - `npx eslint .`: OK.
   - forbidden string scan: OK.
   - `All verification steps passed.`

8. `git status --short`
   - Before writing this handoff:
     - `M docs/DATABASE.md`
     - `M docs/RLS_ACCESS_MATRIX.md`
     - `M docs/ROUTES.md`
     - `?? src/lib/auth/`
     - `?? src/proxy.ts`
     - `?? supabase/migrations/20260712120000_org_identity_foundation.sql`
     - `?? supabase/migrations/20260712121000_org_identity_rls.sql`
     - `?? supabase/migrations/20260712122000_org_bootstrap_function.sql`
     - `?? supabase/tests/database/org_identity_foundation.test.sql`
   - This handoff file is now also added.

9. `git diff --stat`
   - Tracked files at time of collection:
     - `docs/DATABASE.md`: 13 lines changed.
     - `docs/RLS_ACCESS_MATRIX.md`: 13 lines changed.
     - `docs/ROUTES.md`: 62 lines changed.
     - Total: `50 insertions(+), 38 deletions(-)`.
   - Note: untracked new files are shown by `git status`, not `git diff --stat`, until staged.

10. `git diff --name-status`
   - Tracked files at time of collection:
     - `M docs/DATABASE.md`
     - `M docs/RLS_ACCESS_MATRIX.md`
     - `M docs/ROUTES.md`
   - Note: untracked new files are shown by `git status`, not `git diff --name-status`, until staged.

Additional checks:
- `rg 'supabase/admin|createAdminClient|service_role|SUPABASE_SERVICE_ROLE' src/lib/auth src/proxy.ts` found no matches.
- New migration/source scope scan found no event-domain, contact reveal, sponsor, winner, judging, invite, or `last_active_organization_id` additions.
- `src/app/(public)/**`, `src/app/(participant)/**`, and `src/app/organizer/**` were not modified.
- No package files were modified and no dependencies were added.
- No remote Supabase commands were run. Commands used were local only: `supabase start`, `supabase db reset`, and `supabase test db --local`.

## Files touched

- `docs/DATABASE.md`
- `docs/RLS_ACCESS_MATRIX.md`
- `docs/ROUTES.md`
- `src/lib/auth/types.ts`
- `src/lib/auth/server.ts`
- `src/lib/auth/return-url.ts`
- `src/lib/auth/route-guards.ts`
- `src/proxy.ts`
- `supabase/migrations/20260712120000_org_identity_foundation.sql`
- `supabase/migrations/20260712121000_org_identity_rls.sql`
- `supabase/migrations/20260712122000_org_bootstrap_function.sql`
- `supabase/tests/database/org_identity_foundation.test.sql`
- `handoff/CODEX_SUMMARY.md`

These are within the task's expected file list. The only shape difference from the estimate is that I used `src/proxy.ts` rather than a `middleware.ts` file because Next 16's current convention is Proxy.

## Deviations and judgment calls

- I granted `select, insert, update` table privileges on the new organization tables to `authenticated` while adding no insert/update policies. This lets Supabase's user-context client read through RLS and lets tests prove direct insert/update are denied by RLS rather than by missing table privileges. With no insert/update policies, direct DML remains denied.
- `create_organization_with_owner` trims name and slug but does not lowercase or otherwise normalize slug. The task left exact shape validation open; I kept it minimal to avoid adding product rules.
- `create_organization_with_owner` revokes execute from `public` and grants only `authenticated`. An authenticated role with no `auth.uid()` receives the clear `authentication_required` exception; anon cannot execute the function at all.
- `git grep profile_id` across the entire repo still finds pre-existing documentation/tooling references that describe the forbidden string rule. The required verification script's code scan passed; no new source or migration file contains that literal.

## Open questions for Claude/human review

- Confirm the table privilege choice is acceptable for this phase: privileges are broad enough for RLS to be the enforcement layer, but policies still deny direct insert/update/delete.
- Confirm the docs wording around planned-but-unbuilt routes is appropriately conservative.

## Explicit follow-ups not built

- Dashboard content and authenticated navigation.
- `/auth`, `/auth/callback`, and `/onboarding` UI/handlers.
- Organization invites and member management.
- Role update/promotion flows.
- Event registration and conflict-of-interest enforcement.
- Event-domain tables, matching, contact reveal, judging, winner publication, reports, sponsor access.
