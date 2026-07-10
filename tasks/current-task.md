# Task Template

Copy this shape into `/tasks/current-task.md` for every new task. Fill every section — an empty section is an ambiguity Codex will have to guess at, and guessing is explicitly against the rules in `AGENTS.md`.

---

## Task ID
`PHASE3D-001`

## Phase reference
`/docs/PHASES.md` Phase 3 ("Auth, profiles, organizations") — this task drafts the signup trigger decided in `PHASE3D-000` (`docs/PRODUCT_DECISIONS.md` D17). It does not apply anything, does not touch RLS, and does not touch `user_contacts`.

## Objective
Draft (write, do not apply) one new SQL migration that creates a trigger function and an `AFTER INSERT` trigger on `auth.users`, so that a minimal `public.profiles` row is created automatically for every new signup, exactly as decided in D17 — `full_name` from an auth-metadata fallback chain or a placeholder, `user_contacts` untouched, no contact data anywhere near `profiles`.

## Context
- `PHASE3B-001` (approved): created `profiles` (identity/display data, `full_name text not null`) and `user_contacts` (private contact data), no RLS.
- `PHASE3C-001` (approved): added self-owned RLS on both tables, including a `profiles_insert_own` policy explicitly described as temporary scaffolding.
- `PHASE3D-000` (approved, documentation-only): decided the identity creation strategy — D17 in `docs/PRODUCT_DECISIONS.md`. This task implements exactly the trigger half of that decision. The RLS-tightening half (removing/adjusting `profiles_insert_own` once this trigger exists) is explicitly **not** part of this task — it requires its own separately approved RLS migration later.

## In scope
- Create exactly one new SQL migration file under `supabase/migrations/`, timestamped later than `20260710130000_identity_rls.sql` (e.g. `supabase/migrations/20260710140000_signup_profile_trigger.sql` or similar reasonable later timestamp).
- Create (or `create or replace`) a trigger function that:
  - Runs on `auth.users` `after insert`, `for each row`.
  - Inserts one row into `public.profiles` with `id = new.id`.
  - Populates `full_name` using this exact fallback chain, in order:
    1. `new.raw_user_meta_data->>'full_name'`
    2. `new.raw_user_meta_data->>'name'`
    3. `new.raw_user_meta_data->>'display_name'`
    4. the literal placeholder `'New participant'`
  - Leaves every other `profiles` column at its column default / `null` (no attempt to populate `university`, `bio`, etc. — onboarding's job, not the trigger's).
  - Does **not** insert or reference `public.user_contacts` in any way.
  - Does **not** read or copy `new.email` or any other `auth.users` contact-shaped field into `profiles`.
  - Is reasonably idempotent/safe against being invoked more than once for the same user id — e.g. `on conflict (id) do nothing` on the `profiles` insert, or an equivalent guard. Use your judgment on the exact mechanism and explain the choice in the handoff.
- Create the `after insert on auth.users` trigger itself, wired to the function above.
- Use `security definer` **only if you determine it's actually needed** for the function to successfully insert into `public.profiles` from a trigger context — if you use it, the function **must** set `search_path` explicitly (e.g. `set search_path = public, pg_temp`) as a `create function ... set search_path = ...` clause or equivalent. If you judge `security definer` is not needed, say so explicitly in the handoff and explain why.
- SQL comments explaining: (a) why `user_contacts` is deliberately not created here (per D17, that's onboarding's responsibility), and (b) that contact data (email, phone, whatsapp) must never be copied into `profiles` by this or any future version of this trigger.

## Out of scope
- Applying, pushing, or resetting this or any migration (`supabase db push`, `supabase migration up`, `supabase db reset`, or any equivalent) — draft only.
- Any connection to a live Supabase project or database.
- Any RLS policy — no new policy, no modification to `profiles_insert_own`, `profiles_select_own`, `profiles_update_own`, or any `user_contacts` policy from `PHASE3C-001`. That tightening is explicitly deferred to a future, separately-approved task per D17.
- Any insert, reference, or write to `public.user_contacts` from this trigger.
- Any copying of `email`, `phone`, `whatsapp`, or any other contact-shaped value into `profiles`, from `auth.users` or anywhere else — `full_name` from the metadata fallback chain is the only value this trigger populates beyond `id`.
- Any auth UI, login/signup form, or onboarding flow.
- Any product UI change.
- `organizations`, `hackathons`, matching/team tables, contact-reveal logic, or sponsor/talent access of any kind.
- Any edit to `/docs`, `AGENTS.md`, `CLAUDE.md`, `WORKFLOW.md`, or `scripts/*.ps1`.
- Any file outside `supabase/migrations/` plus the standard `handoff/CODEX_SUMMARY.md` write.

## Relevant docs
- `docs/PRODUCT_DECISIONS.md` D17 — the decision this task implements; treat its wording as binding for the fallback chain, the "no `user_contacts`" rule, and the "temporary scaffolding" framing of the existing insert policy.
- `docs/DATABASE.md` §1 (`profiles`) and §13 data flow #1 ("Signup") — the trigger behavior these already describe; this migration should make that description true rather than contradict it.
- `docs/RLS_ACCESS_MATRIX.md` — `profiles INSERT` row, which already anticipates this trigger as the "D17 target"; this task does not need to edit it (that row already accounts for this migration existing eventually), but should not implement anything inconsistent with what it says.
- `supabase/migrations/20260710120000_identity_foundation.sql` — exact `profiles` column shapes/constraints (including `full_name text not null`) this trigger's insert must satisfy.
- `supabase/migrations/20260710130000_identity_rls.sql` — the existing self-owned RLS this trigger will coexist with (not modify).

## Approvals on record
- [x] Database migration approved by human — **approved to draft a migration file only.** Explicitly stated in this task: "This task is approved to draft a migration file only. It is NOT approved to apply, push, reset, or run the migration."
- [ ] RLS / contact-reveal logic approved by human — **not approved and not needed.** This task does not touch any RLS policy.

## Files expected to change
- One new file under `supabase/migrations/` (e.g. `supabase/migrations/20260710140000_signup_profile_trigger.sql`)
- `handoff/CODEX_SUMMARY.md` (standard handoff write)

If the diff touches anything else, that is a deviation to flag, not a silent addition.

## Acceptance criteria
- [ ] Exactly one new SQL migration file is created under `supabase/migrations/`.
- [ ] The trigger function inserts into `public.profiles` with `id = new.id` (from `auth.users`).
- [ ] The `full_name` fallback chain matches exactly: `raw_user_meta_data->>'full_name'` → `raw_user_meta_data->>'name'` → `raw_user_meta_data->>'display_name'` → `'New participant'`.
- [ ] `email` is never used as or copied into `full_name` or any other `profiles` column.
- [ ] The trigger does not insert into, reference, or otherwise touch `public.user_contacts`.
- [ ] No phone/email/whatsapp/contact-shaped value is copied into `profiles` anywhere in the migration.
- [ ] If `security definer` is used, the function has an explicit `search_path` setting; if not used, the handoff explains why it wasn't needed.
- [ ] No RLS policy is created, dropped, or modified anywhere in the migration.
- [ ] No Supabase CLI command or live database connection is attempted anywhere in this task.
- [ ] No forbidden identifier (the string formed by `profile` + `_` + `id`) appears anywhere in the diff.
- [ ] The migration is syntactically reasonable PostgreSQL/Supabase SQL (no live database to test against in this task — manual read for sanity).
- [ ] `npm run build` passes.
- [ ] `npx tsc --noEmit` passes.
- [ ] `npx eslint .` passes.
- [ ] `powershell -ExecutionPolicy Bypass -File scripts/verify.ps1` passes (all four steps).
- [ ] Codex writes `handoff/CODEX_SUMMARY.md`.

## Constraints (standing, copied from AGENTS.md — do not remove)
- `user_id` naming rule; `profiles.id` is the only exception; the forbidden identifier must not appear anywhere.
- No public marketplace, no public people browsing, no public contact reveal.
- No AI winner selection, no public negative scoring.
- No sponsor access to raw participant data without explicit opt-in.
- No new dependencies — this task is SQL-only, no `package.json` change of any kind.
- `/docs` is read-only for this task — no exception granted here.
- Do not weaken, remove, or bypass any workflow guard in `scripts/verify.ps1` or `scripts/run-codex-task.ps1`, and do not touch those files at all in this task.

## Verification steps
1. Read the drafted SQL yourself for syntactic sanity and correctness against D17's exact fallback chain (there is no live database to run it against in this task).
2. `npm run build`
3. `npx tsc --noEmit`
4. `npx eslint .`
5. `powershell -ExecutionPolicy Bypass -File scripts/verify.ps1`

## Handoff notes expected
- Confirm explicitly, in the summary itself, the exact fallback chain implemented and that it matches D17's order.
- Confirm explicitly that `user_contacts` is untouched by this trigger and that no contact-shaped field was copied into `profiles`.
- State explicitly whether `security definer` was used and why (or why not), and if used, quote the exact `search_path` setting applied.
- State explicitly what idempotency/safety mechanism was used for the insert (e.g. `on conflict do nothing`) and why that choice was made.
- Flag anything that felt like it required touching RLS to make the trigger work correctly — if so, stop and report rather than modifying a policy, since RLS changes are out of scope for this task.
