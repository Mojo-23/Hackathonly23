# CODEX SUMMARY

## Task
PHASE3D-002 - drop the temporary `profiles_insert_own` policy after signup-trigger profile creation was implemented and verified.

## What changed
- Added `supabase/migrations/20260710150000_drop_temporary_profile_insert_policy.sql`.
- Updated `supabase/tests/database/identity_foundation.test.sql` so the existing policy test now asserts `profiles_insert_own` is absent.
- Left the signup trigger and all earlier identity migrations unchanged.

Exact drop statement used:
```sql
drop policy profiles_insert_own on public.profiles;
```

## Files touched
- `supabase/migrations/20260710150000_drop_temporary_profile_insert_policy.sql`
- `supabase/tests/database/identity_foundation.test.sql`
- `handoff/CODEX_SUMMARY.md`

## Policy scope confirmation
- `profiles_select_own` is byte-for-byte unchanged in `supabase/migrations/20260710130000_identity_rls.sql`.
- `profiles_update_own` is byte-for-byte unchanged in `supabase/migrations/20260710130000_identity_rls.sql`.
- `user_contacts_select_own`, `user_contacts_insert_own`, and `user_contacts_update_own` are byte-for-byte unchanged in `supabase/migrations/20260710130000_identity_rls.sql`.
- The new migration drops only `profiles_insert_own` on `public.profiles`.

## Tests changed
- Changed the pgTAP assertion named `profiles_insert_own policy exists for insert` to assert absence instead: `profiles_insert_own policy is absent for insert`.
- `plan()` count before: `select plan(28);`
- `plan()` count after: `select plan(28);`
- Signup-trigger behavior tests still run unchanged, including:
  - `signup creates exactly one profile row for the auth user`
  - `signup profile full_name comes from auth metadata`
  - all three fallback branches for `name`, `display_name`, and `New participant`
  - `signup does not create a user_contacts row`
  - `signup profile contains none of the synthetic contact values`

## Commands run
Only local Supabase commands were run:
- `npx supabase db reset`
- `npx supabase test db --local supabase/tests`

No remote Supabase connection, `db push`, `supabase link`, SQL Editor, or hosted database command was used.

Additional verification:
- `npm run build`
- `npx tsc --noEmit`
- `npx eslint .`
- `powershell -ExecutionPolicy Bypass -File scripts/verify.ps1`

## Verification results
- `npx supabase db reset` - passed; all migrations applied locally, including `20260710150000_drop_temporary_profile_insert_policy.sql`.
- `npx supabase test db --local supabase/tests` - passed: 1 file, 28 tests.
- `npm run build` - passed.
- `npx tsc --noEmit` - passed.
- `npx eslint .` - passed.
- `powershell -ExecutionPolicy Bypass -File scripts/verify.ps1` - passed all four steps, including the forbidden-string scan.

## Deviations
None.

## Open questions / follow-up
- Future task: update `docs/RLS_ACCESS_MATRIX.md` so the `profiles INSERT` row reflects that the D17 tightening has now happened. This task did not edit `/docs`, per scope.
