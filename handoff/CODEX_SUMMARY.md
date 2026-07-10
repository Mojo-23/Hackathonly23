# Codex Summary - PHASE3D-000

## What changed

Documented the identity creation decision in D17 and reconciled the database and RLS docs with the current `PHASE3C-001` policy state.

Decision recorded:

1. `profiles` rows should be created by a Phase 3 database trigger on `auth.users` insert.
2. `user_contacts` rows should be created by client-side onboarding through the existing self-owned insert policy.
3. `profiles.full_name` is seeded by the trigger from auth metadata (`full_name`, then `name`) or the neutral placeholder `New participant`; onboarding must collect the real display name before registration or matching.
4. The current `profiles_insert_own` policy is scaffolding from `PHASE3C-001`; after the signup trigger is implemented and verified, a separately approved RLS migration should remove or tighten direct profile inserts.
5. Recommended next task: `PHASE3D-001` should implement the `auth.users` signup trigger described in D17 and keep onboarding responsible for contact-row creation.

The decision explicitly keeps private contact data in `user_contacts` only.

## Files touched

- `docs/PRODUCT_DECISIONS.md` - added D17 with the hybrid identity creation strategy and next task.
- `docs/DATABASE.md` - updated the `profiles` and `user_contacts` creation-path descriptions plus data flows #1-2.
- `docs/RLS_ACCESS_MATRIX.md` - corrected the `profiles INSERT` row to reflect current self-owned scaffolding and the D17 trigger target; updated the `user_contacts` note to reflect existing self-owned policies.
- `handoff/CODEX_SUMMARY.md` - replaced the prior handoff with this one.

`docs/PRIVACY_MODEL.md` was checked and did not need an edit because it already states that private contact fields live only in `user_contacts`.

## Verification

Ran:

- `npm run build` - passed.
- `npx tsc --noEmit` - passed.
- `npx eslint .` - passed.
- `powershell -ExecutionPolicy Bypass -File scripts/verify.ps1` - passed all steps, including the forbidden identifier scan.

Task-specific consistency check:

- Re-read `docs/RLS_ACCESS_MATRIX.md`'s `profiles INSERT` row against `supabase/migrations/20260710130000_identity_rls.sql`.
- Confirmed the doc now states that `PHASE3C-001` currently permits own inserts while D17 names the signup-trigger target and later RLS tightening.

## Deviations

None. No SQL, RLS policy, product code, UI, task, script, or dependency file was changed.

## Open questions

None for this documentation task. The actual trigger and later RLS tightening still require separately scoped tasks and approvals.
