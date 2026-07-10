# Task Template

Copy this shape into `/tasks/current-task.md` for every new task. Fill every section — an empty section is an ambiguity Codex will have to guess at, and guessing is explicitly against the rules in `AGENTS.md`.

---

## Task ID
`PHASE3E-001`

## Phase reference
`/docs/PHASES.md` Phase 3 ("Auth, profiles, organizations") — this task adds database tests proving the already-approved identity foundation (`PHASE3B-001`, `PHASE3C-001`, `PHASE3D-001`) behaves as designed. It does not add or change any migration or product feature.

## Objective
Add committed pgTAP-style database tests under `supabase/tests/` that verify, against a **local** Supabase instance only, that `profiles`, `user_contacts`, their RLS policies, and the signup trigger behave exactly as the three approved identity migrations intend.

## Context
- `PHASE3B-001` (approved): `20260710120000_identity_foundation.sql` — `profiles` (identity/display) and `user_contacts` (private contact data), separated.
- `PHASE3C-001` (approved): `20260710130000_identity_rls.sql` — self-owned RLS on both tables.
- `PHASE3D-001` (approved): `20260710140000_signup_profile_trigger.sql` — `auth.users` signup trigger creates a minimal `profiles` row (id + `full_name` fallback chain), never touches `user_contacts`, never copies contact data.
- The human has already initialized local Supabase and run `npx supabase db reset` successfully, applying all three migrations above to the **local** instance. `npx supabase test db --help` confirms the local CLI's pgTAP test runner is available.
- This is the first task in the project authorized to run a local database operation. That authorization is narrow and explicit — see "Local vs. remote — read carefully" below.

## Local vs. remote — read carefully
This task authorizes exactly two commands, **against the local Supabase instance only**:
- `npx supabase db reset` (to get a clean local database matching the three approved migrations, so tests run against a known state)
- `npx supabase test db --local supabase/tests` (to run the tests you write)

Nothing else. No remote project connection, no `npx supabase db push`, no `npx supabase link`, no Supabase Studio/SQL Editor, no use of any `SUPABASE_SERVICE_ROLE_KEY`/URL pointing at a hosted project. If at any point running these commands seems to require or trigger a remote connection, stop and report it in the handoff rather than proceeding.

## In scope
- Create one or more pgTAP-style SQL test files under `supabase/tests/` (e.g. `supabase/tests/database/identity_foundation.test.sql`, or split into a few focused files — your judgment, explain the structure in the handoff), compatible with `npx supabase test db --local supabase/tests`.
- Tests should cover, at minimum:
  1. `profiles` table exists (in `public` schema).
  2. `user_contacts` table exists (in `public` schema).
  3. `profiles` does **not** have `email`, `phone`, or `whatsapp` columns (or any other contact-shaped column).
  4. `user_contacts` **does** have `email`, `phone`, and `whatsapp` columns.
  5. Row Level Security is enabled on `profiles`.
  6. Row Level Security is enabled on `user_contacts`.
  7. The signup trigger function (`public.create_profile_for_new_user`, or whatever it is actually named in `20260710140000_signup_profile_trigger.sql` — read the file, don't assume) exists.
  8. The `auth.users` trigger itself exists and is wired to that function.
  9. Behaviorally: inserting a synthetic row into `auth.users` (see "Testing expectations" below) results in exactly one new `profiles` row with `id` matching the inserted user and a non-null `full_name`.
  10. Behaviorally: that same insert does **not** create any row in `user_contacts`.
  11. Behaviorally: no email/phone/whatsapp value from the synthetic `auth.users` row appears anywhere in the resulting `profiles` row.
- Add a concise comment above each test (or test group) explaining what it verifies and why it matters (e.g. "contact data must never leak into profiles — see PRIVACY_MODEL.md").
- Where practical, include a check that no database object name created by the identity migrations contains the forbidden identifier (the string formed by `profile` + `_` + `id`) — e.g. by inspecting `information_schema`/`pg_catalog` object names relevant to these tables/functions/triggers. If this is impractical to express cleanly in pgTAP, say so in the handoff instead of forcing it.
- Run `npx supabase db reset` locally to get a clean baseline, then run `npx supabase test db --local supabase/tests` and iterate until it passes.

## Out of scope
- Any new or modified migration file — the schema/RLS/trigger are already approved and frozen for this task; if a test reveals a real defect in them, stop and report it rather than editing `supabase/migrations/`.
- Any remote Supabase connection, `db push`, `supabase link`, or SQL Editor use of any kind.
- Any auth UI, login/signup form, onboarding flow, or product UI change.
- `organizations`, `hackathons`, matching/team tables, contact-reveal logic, or sponsor/talent access of any kind.
- Any real user data — all `auth.users`/`profiles`/`user_contacts` rows used in tests must be obviously synthetic (test emails, placeholder names), never anything resembling a real person.
- Any secret, real API key, or real Supabase project URL/credential committed anywhere.
- Any edit to `/docs`, `AGENTS.md`, `CLAUDE.md`, `WORKFLOW.md`, or `scripts/*.ps1`.
- Any file outside `supabase/tests/` plus the standard `handoff/CODEX_SUMMARY.md` write (and the two authorized local CLI runs, which don't produce committed files beyond your test files).

## Relevant docs
- `docs/DATABASE.md` §1 (`profiles`, `user_contacts`) — column shapes and privacy levels the tests must verify against.
- `docs/PRIVACY_MODEL.md` §1 — why contact-data separation is load-bearing, not incidental, for these tests.
- `docs/RLS_ACCESS_MATRIX.md` — `profiles`/`user_contacts` rows, for what "RLS enabled, self-owned only" should mean in test form.
- `docs/PRODUCT_DECISIONS.md` D17 — the signup trigger's intended behavior (fallback chain, no `user_contacts` creation) that the behavioral tests must confirm.
- `supabase/migrations/20260710120000_identity_foundation.sql`, `20260710130000_identity_rls.sql`, `20260710140000_signup_profile_trigger.sql` — read these directly for exact table/column/function/trigger names; do not guess or assume names not confirmed by reading the files.

## Approvals on record
- [x] Database migration approved by human — **not applicable; no new migration in this task.** The three existing migrations remain frozen and unmodified.
- [x] Local-only database operations approved by human — **explicitly approved, narrowly.** The human has already run `npx supabase db reset` locally and confirmed `npx supabase test db --help` is available. This task is authorized to run `npx supabase db reset` and `npx supabase test db --local supabase/tests` against the **local** instance only. Remote connection, `db push`, `supabase link`, and SQL Editor use remain unapproved and forbidden.
- [ ] RLS / contact-reveal logic approved by human — not applicable; no RLS policy is created or modified in this task, only tested.

## Files expected to change
- One or more new files under `supabase/tests/` (e.g. `supabase/tests/database/identity_foundation.test.sql`)
- `handoff/CODEX_SUMMARY.md` (standard handoff write)

If the diff touches anything else, that is a deviation to flag, not a silent addition.

## Acceptance criteria
- [ ] Test file(s) exist under `supabase/tests/`, focused only on identity-foundation behavior (tables, RLS enablement, trigger existence and behavior) — nothing else.
- [ ] `npx supabase db reset` passes (local).
- [ ] `npx supabase test db --local supabase/tests` passes (local).
- [ ] No migration file was created or modified.
- [ ] No remote Supabase connection, `db push`, `supabase link`, or SQL Editor use occurred anywhere in this task.
- [ ] No real user data or real secret/credential appears anywhere in the diff.
- [ ] No forbidden identifier (the string formed by `profile` + `_` + `id`) appears anywhere in the diff.
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
- Tests must be safe to run repeatedly against a locally reset database — no dependence on state left over from a prior run.
- Synthetic `auth.users` rows inserted for behavioral tests must use obviously fake data (e.g. `test-signup-001@example.invalid`-style addresses, clearly placeholder names) and should be cleaned up after the test (explicit `delete`/rollback) or scoped inside a transaction that's rolled back, whichever fits the pgTAP pattern you use — explain your choice in the handoff.
- Tests must not depend on any remote Supabase state or network access — local only, as stated above.

## Verification steps
1. `npx supabase db reset` (local)
2. `npx supabase test db --local supabase/tests` (local)
3. `npm run build`
4. `npx tsc --noEmit`
5. `npx eslint .`
6. `powershell -ExecutionPolicy Bypass -File scripts/verify.ps1`

## Handoff notes expected
- List every test added, one line each, stating what it verifies.
- Confirm explicitly that all eleven behaviors listed under "In scope" are covered, or explain precisely which are not and why.
- State explicitly how synthetic test data is cleaned up (rollback vs. explicit delete) and confirm no real data was used.
- Confirm explicitly that only local Supabase commands were run, and quote the exact commands used.
- If the forbidden-identifier object-name check (item under "In scope") was impractical to express, say so explicitly rather than silently omitting it.
- Flag immediately, rather than working around, anything that seemed to require a migration change, an RLS change, or a remote connection to make a test pass.
