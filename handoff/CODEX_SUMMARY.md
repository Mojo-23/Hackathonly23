# CODEX SUMMARY

## Task
PHASE3E-001 - add local pgTAP-style database tests for the approved identity foundation migrations.

## What changed
- Added `supabase/tests/database/identity_foundation.test.sql`.
- The test file verifies the identity table split, RLS enablement and policy presence, signup trigger function and trigger wiring, trigger behavior, contact-data non-copying, and the forbidden identifier object-name guard.
- No migrations were created or modified.
- No docs, workflow files, scripts, package files, source UI files, or Supabase config files were changed.

## Files touched
- `supabase/tests/database/identity_foundation.test.sql`
- `handoff/CODEX_SUMMARY.md`

## Tests added
1. `public.profiles` table exists.
2. `public.user_contacts` table exists.
3. `profiles` has no `email` column.
4. `profiles` has no `phone` column.
5. `profiles` has no `whatsapp` column.
6. `profiles` has no other contact-shaped column name.
7. `user_contacts` has an `email` column.
8. `user_contacts` has a `phone` column.
9. `user_contacts` has a `whatsapp` column.
10. RLS is enabled on `profiles`.
11. RLS is enabled on `user_contacts`.
12. `profiles_select_own` exists for select.
13. `profiles_insert_own` exists for insert.
14. `profiles_update_own` exists for update.
15. `user_contacts_select_own` exists for select.
16. `user_contacts_insert_own` exists for insert.
17. `user_contacts_update_own` exists for update.
18. `public.create_profile_for_new_user()` exists as a trigger-returning function.
19. `auth.users` has `create_profile_after_signup` wired to `public.create_profile_for_new_user()`.
20. Inserting the synthetic auth user creates exactly one matching `profiles` row.
21. The created profile has a non-null `full_name`.
22. The created profile uses the expected metadata `full_name`.
23. The same signup creates zero `user_contacts` rows.
24. The created profile row contains none of the synthetic email, phone, or WhatsApp values.
25. Relevant identity migration object names avoid the forbidden user-reference identifier.

## Coverage of required in-scope behaviors
All eleven required behaviors are covered:
1. `profiles` table exists - covered by test 1.
2. `user_contacts` table exists - covered by test 2.
3. `profiles` does not have contact columns - covered by tests 3-6.
4. `user_contacts` has contact columns - covered by tests 7-9.
5. RLS enabled on `profiles` - covered by test 10.
6. RLS enabled on `user_contacts` - covered by test 11.
7. Signup trigger function exists - covered by test 18.
8. `auth.users` trigger exists and is wired to that function - covered by test 19.
9. Synthetic `auth.users` insert creates exactly one matching profile with non-null `full_name` - covered by tests 20-22.
10. The insert does not create a `user_contacts` row - covered by test 23.
11. Synthetic contact values do not appear in `profiles` - covered by test 24.

The optional object-name check was practical to express cleanly in pgTAP and is included as test 25.

## Synthetic data and cleanup
- Synthetic user id: `11111111-1111-4111-8111-111111111111`.
- Synthetic email: `test-signup-001@example.invalid`.
- Synthetic display name: `Synthetic Signup Tester`.
- Synthetic phone/WhatsApp values are placeholder `+1555...` values.
- The file pre-cleans only that fixed synthetic row in case a previous local run was interrupted.
- The actual test insert is inside `begin; ... rollback;`, so normal runs leave no synthetic data behind.
- No real user data, real API key, secret, hosted project URL, or credential was added.

## Commands run
Only these local Supabase commands were run:
- `npx supabase db reset`
- `npx supabase test db --local supabase/tests`

No remote Supabase command was run. No `db push`, project link, SQL Editor, or hosted project connection was used.

Additional required verification:
- `powershell -ExecutionPolicy Bypass -File scripts/verify.ps1`

## Verification results
- `npx supabase db reset` - passed. Supabase warned that `supabase/seed.sql` did not match any file, but the reset completed successfully and all three migrations applied locally.
- First `npx supabase test db --local supabase/tests` run - failed only because the pgTAP plan declared 26 tests while 25 ran. Assertions themselves had no failures.
- After correcting the plan count, `npx supabase test db --local supabase/tests` - passed: 1 file, 25 tests.
- `powershell -ExecutionPolicy Bypass -File scripts/verify.ps1` - passed all steps:
  - `npm run build` - passed.
  - `npx tsc --noEmit` - passed.
  - `npx eslint .` - passed.
  - Forbidden-string scan - passed.

## Deviations
- None from the task scope.
- The only notable output was the local reset seed warning described above; it did not block reset or tests.

## Open questions
- None.
