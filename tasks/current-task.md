# Task Template

Copy this shape into `/tasks/current-task.md` for every new task. Fill every section — an empty section is an ambiguity Codex will have to guess at, and guessing is explicitly against the rules in `AGENTS.md`.

---

## Task ID
`PHASE3E-002`

## Phase reference
`/docs/PHASES.md` Phase 3 ("Auth, profiles, organizations") — this task closes the test-coverage advisory raised in the `PHASE3E-001` review. It adds tests only; no schema, RLS, or trigger behavior changes.

## Objective
Extend the local pgTAP test suite so all four branches of the signup trigger's `full_name` fallback chain (from D17 / `20260710140000_signup_profile_trigger.sql`) are exercised by a real synthetic `auth.users` insert, not just the first branch.

## Context
- `PHASE3E-001` (approved): added `supabase/tests/database/identity_foundation.test.sql`, including a behavioral test of the signup trigger that supplies `raw_user_meta_data->>'full_name'` and confirms it lands in `profiles.full_name`.
- The `PHASE3E-001` review approved the task but flagged, as an explicit advisory (not a blocker): only the primary fallback branch (`full_name`) is exercised. The `name`, `display_name`, and final placeholder (`'New participant'`) branches from the trigger's `coalesce(...)` chain are not yet covered by any test.
- The trigger itself (`supabase/migrations/20260710140000_signup_profile_trigger.sql`) is already approved and frozen — this task tests it, it does not change it.

## In scope
- Add pgTAP test coverage for the three remaining `full_name` fallback branches, each via its own synthetic `auth.users` insert with a distinct synthetic UUID:
  1. `raw_user_meta_data` containing `name` but not `full_name` → `profiles.full_name` should equal that `name` value.
  2. `raw_user_meta_data` containing `display_name` but neither `full_name` nor `name` → `profiles.full_name` should equal that `display_name` value.
  3. `raw_user_meta_data` containing none of `full_name`/`name`/`display_name` (e.g. an empty object, or a key unrelated to any of the three) → `profiles.full_name` should equal the literal placeholder `'New participant'`.
- You may either extend the existing `supabase/tests/database/identity_foundation.test.sql` file with these additional cases, or add a new focused file (e.g. `supabase/tests/database/signup_trigger_fallback.test.sql`) — your judgment; explain the choice in the handoff. If you extend the existing file, update its `select plan(N)` count to match the new total test count exactly (the `PHASE3E-001` handoff noted this exact mistake had to be caught and fixed once already — get the count right the first time).
- Each new synthetic `auth.users` row must use its own distinct fixed UUID (do not reuse `11111111-1111-4111-8111-111111111111` from `PHASE3E-001` — pick clearly distinct, obviously-synthetic UUIDs for each of the three new cases) and obviously-fake email/metadata values, consistent with the conventions already established in `PHASE3E-001` (e.g. `.invalid`-TLD emails).
- Reuse the same cleanup pattern already established in `PHASE3E-001` (pre-test guard delete for the specific synthetic ids, then the actual test body inside `begin; ... rollback;`) so these tests are safe to run repeatedly and leave no residue.
- Add a short comment above each new test explaining which fallback branch it exercises.

## Out of scope
- Any change to `supabase/migrations/` — the trigger's logic is already approved; if a new test reveals it doesn't actually behave as documented, stop and report that as a finding rather than editing the migration.
- Any change to `/docs`.
- Any RLS policy change.
- Any auth UI, login/signup form, onboarding flow, or product UI change.
- Any remote Supabase connection, `db push`, `supabase link`, or SQL Editor use of any kind — local only, same boundary as `PHASE3E-001`.
- Any real user data, real secret, or real credential anywhere.
- Any test unrelated to this specific fallback-chain coverage gap (do not expand scope into testing other parts of the identity foundation already covered by `PHASE3E-001`, and do not start testing anything outside the signup trigger).
- Any file outside `supabase/tests/` plus the standard `handoff/CODEX_SUMMARY.md` write.

## Relevant docs
- `docs/PRODUCT_DECISIONS.md` D17 — the exact fallback chain and order this task must test against.
- `supabase/migrations/20260710140000_signup_profile_trigger.sql` — read directly for the exact `coalesce(...)` expression and column/function names; do not guess.
- `supabase/tests/database/identity_foundation.test.sql` — the existing test file and its established synthetic-data/cleanup conventions to follow.
- `handoff/CLAUDE_REVIEW.md` (the `PHASE3E-001` review) — the specific advisory this task resolves, in the reviewer's own words.

## Approvals on record
- [x] Database migration approved by human — **not applicable; no migration in this task.** The trigger remains frozen and unmodified.
- [x] Local-only database operations approved by human — **explicitly approved, narrowly, same boundary as `PHASE3E-001`.** This task is authorized to run `npx supabase db reset` and `npx supabase test db --local supabase/tests` against the **local** instance only. Remote connection, `db push`, `supabase link`, and SQL Editor use remain unapproved and forbidden.
- [ ] RLS / contact-reveal logic approved by human — not applicable; no RLS policy is created or modified in this task.

## Files expected to change
- `supabase/tests/database/identity_foundation.test.sql` (extended) **or** one new file under `supabase/tests/database/` (e.g. `supabase/tests/database/signup_trigger_fallback.test.sql`) — pick one approach, not both, and say which in the handoff.
- `handoff/CODEX_SUMMARY.md` (standard handoff write)

If the diff touches anything else, that is a deviation to flag, not a silent addition.

## Acceptance criteria
- [ ] A test exists proving the `name` fallback branch works when `full_name` is absent.
- [ ] A test exists proving the `display_name` fallback branch works when both `full_name` and `name` are absent.
- [ ] A test exists proving the `'New participant'` placeholder is used when none of the three metadata keys are present.
- [ ] Each new test uses its own distinct synthetic UUID, not reused across cases and not the UUID already used in `PHASE3E-001`.
- [ ] No real user data, secret, or credential appears anywhere in the diff.
- [ ] No forbidden identifier (the string formed by `profile` + `_` + `id`) appears anywhere in the diff, including as a literal in any new SQL.
- [ ] No migration, RLS policy, doc, or product/UI file appears anywhere in the diff.
- [ ] `npx supabase db reset` passes (local).
- [ ] `npx supabase test db --local supabase/tests` passes (local), with a correct `plan()` count.
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
- No new dependencies — this task is SQL test files only, no `package.json` change of any kind.
- `/docs` is read-only for this task — no exception granted here.
- Do not weaken, remove, or bypass any workflow guard in `scripts/verify.ps1` or `scripts/run-codex-task.ps1`, and do not touch those files at all in this task.

## Testing expectations
- Tests must be safe to run repeatedly against a locally reset database, same as `PHASE3E-001`.
- Each new synthetic `auth.users` row must use obviously fake data and be cleaned up via the established rollback/guard-delete pattern.
- Tests must not depend on any remote Supabase state or network access — local only.

## Verification steps
1. `npx supabase db reset` (local)
2. `npx supabase test db --local supabase/tests` (local)
3. `npm run build`
4. `npx tsc --noEmit`
5. `npx eslint .`
6. `powershell -ExecutionPolicy Bypass -File scripts/verify.ps1`

## Handoff notes expected
- State which approach was taken (extended existing file vs. new file) and why.
- List each new test added, one line each, stating which fallback branch it covers.
- Confirm the final `plan()` count matches the actual number of tests run, and state the before/after test counts.
- Confirm explicitly that all three previously-uncovered branches (`name`, `display_name`, placeholder) are now covered, alongside the primary `full_name` branch already covered by `PHASE3E-001`.
- Confirm explicitly that only local Supabase commands were run, and quote them.
- Confirm no real data, secret, or credential was used.
