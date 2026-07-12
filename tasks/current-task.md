# Task: AUTH-001-FIX-01 — Disclose Documentation Deviation and Harden Database Tests

## Task ID
`AUTH-001-FIX-01` — a corrective follow-up within `PHASE-AUTH-001`, not a new phase.

**This is a review-required fix, not new work.** The original `AUTH-001` implementation (three migrations, `src/lib/auth/**`, `src/proxy.ts`, the three doc reconciliations, `supabase/tests/database/org_identity_foundation.test.sql`, `handoff/CODEX_SUMMARY.md`) remains **uncommitted in the working tree and must not be reverted, reformatted, expanded, or reimplemented.** Every file not explicitly named below as allowed is out of bounds for this task, including files from the original implementation that already look "close enough to touch."

## Phase reference
`docs/PHASES.md` → "Next planned phase — Role-Aware Authentication and Dashboard Architecture," foundation slice. Same phase as `AUTH-001`; this task closes the two findings from `handoff/CLAUDE_REVIEW.md`'s `APPROVE_WITH_FIXES` verdict on that implementation.

## Objective
Close the two findings from the completed `PHASE-AUTH-001` review — an undisclosed (but factually correct) documentation edit, and two security-relevant controls that are proven correct manually but not yet proven automatically by the test suite — without touching any schema, RLS, application, proxy, or documentation file.

## Review result being addressed
`handoff/CLAUDE_REVIEW.md` returned **APPROVE_WITH_FIXES**. The architecture, schema, RLS policies, bootstrap RPC, server helpers, proxy behavior, and all 78 existing tests passed review without qualification. Only the two items below are open. Nothing else about the original implementation is in scope for discussion, re-review, or change in this task.

## Required correction 1 — disclose the documentation deviation

**Do not touch `docs/RLS_ACCESS_MATRIX.md` again.** The correction Codex made there (the `profiles INSERT` row) is factually correct, reflects a policy that was already dropped by an earlier migration, and must remain exactly as it is.

What's missing is disclosure. Add an addendum to `handoff/CODEX_SUMMARY.md` — under "Deviations and judgment calls," or a new clearly-labeled subsection if that reads better — stating plainly:
- The exact row corrected: `docs/RLS_ACCESS_MATRIX.md`'s `profiles INSERT` row.
- Why the old row was stale: it described a temporary self-insert policy (`profiles_insert_own`, from `PHASE3C-001` scaffolding) that was already removed by the pre-existing migration `20260710150000_drop_temporary_profile_insert_policy.sql`, before `AUTH-001` began.
- That the correction reflects already-existing repository/database behavior — nothing about `profiles` insert policy changed as a result of this edit or any `AUTH-001` migration.
- That no schema, migration, RLS policy, or runtime behavior was changed by this documentation correction — it is a pure text fix to bring a stale doc line in line with reality.
- That the edit fell outside `AUTH-001`'s narrowly stated documentation-reconciliation scope (which authorized only the `organizations`/`organization_members` rows in that file).
- That omitting this from the original handoff's deviations section was a procedural miss, and this addendum is that disclosure, made explicitly now.

Keep it factual and concise — a short paragraph or a few bullet points, not a narrative. This is paperwork, not new analysis.

## Required correction 2 — functional anon RPC denial test

Modify only `supabase/tests/database/org_identity_foundation.test.sql`. Add one real functional pgTAP assertion proving `anon` cannot execute `create_organization_with_owner` — not a catalog check.

Requirements:
- Actually invoke `public.create_organization_with_owner(...)` under the effective `anon` role/context this test file already uses elsewhere for role-switching (the existing `set local role authenticated; select set_config('request.jwt.claim.sub', ...)` pattern is the model to follow — for this test, the role should be `anon`, and no `request.jwt.claim.sub` should be set, matching how an actual anonymous client session behaves locally).
- The expected failure must be a **permission** denial (Postgres `insufficient_privilege`, SQLSTATE `42501` — this is what a real local run of this exact scenario produces; confirm this is in fact what's raised in this environment before hardcoding it, using the same `pg_temp.sqlstate_for(...)` helper this file already defines), not an authentication-required (`28000`) or input-validation (`22023`) error — the point of this test is that `anon` never gets far enough to reach the function body's own checks, because `EXECUTE` was never granted to it.
- Must leave no `organizations` or `organization_members` row behind regardless of outcome — assert row counts are unchanged after the attempt, the same way the existing duplicate-slug and invalid-input tests already do.
- Must run safely inside the surrounding test transaction (the file already wraps everything in `begin; ... rollback;` — do not add a nested transaction or anything that would interfere with that).
- Must `reset role` (and clear `request.jwt.claim.sub` back to `''`, matching the existing convention throughout the file) immediately after the assertion, before any subsequent test runs.

## Required correction 3 — functional duplicate membership rejection test

Same file. Add one real functional assertion proving the `organization_members (organization_id, user_id)` unique constraint rejects a duplicate row **at the database level**, independent of and distinct from the existing RLS-denial test (which proves an *authenticated non-member* can't insert at all — this new test proves that even a row which *would* pass RLS/ownership checks still can't duplicate an existing `(organization_id, user_id)` pair).

Requirements:
- Reuse an organization and membership row already established earlier in this test file (e.g., `org_a` and its existing owner membership) rather than creating new synthetic fixtures, unless reuse would make the test's intent unclear — in which case create a minimal, clearly-scoped new organization/user pair following the file's existing synthetic-UUID and cleanup-block conventions.
- Attempt a second `organization_members` insert with the same `organization_id` + `user_id` as an existing row, under a role/context that **bypasses RLS** (e.g., no `set local role authenticated` — run as the test's default/superuser context, the same way the file's setup/cleanup blocks and the earlier `insert into public.organization_members (...) select ... 'staff'` fixture-seeding insert at line ~432 already do) — this is deliberately a raw constraint test, not another RLS test, so it must not be confused with or duplicate correction 2's or the existing direct-insert-denied test's role-switching.
- Expect SQLSTATE `23505` (`unique_violation`) via the same `pg_temp.sqlstate_for(...)` helper already used for the duplicate-slug test.
- Confirm the failure is actually the unique constraint and not something else reached first (e.g., a foreign-key or check-constraint failure) — the safest way is to reuse a `(organization_id, user_id)` pair that's already known-valid (already has a successful row), so the only thing that can fail is the uniqueness.
- Assert no duplicate row persists afterward (a count of matching `organization_members` rows for that `(organization_id, user_id)` pair equals `1`, not `2`).
- Must not remove, weaken, or alter any existing RLS test in this file — this is an addition, not a replacement.

## Files Codex may modify — exact and exhaustive
- `handoff/CODEX_SUMMARY.md`
- `supabase/tests/database/org_identity_foundation.test.sql`

No other file. Not `tasks/current-task.md`, not `handoff/CLAUDE_REVIEW.md` — both are Claude's/the human's to update, not Codex's.

## Forbidden — explicit
- Any migration file (existing or new) — this task adds test coverage for existing, already-correct behavior; it does not change what the database does.
- `docs/DATABASE.md`, `docs/RLS_ACCESS_MATRIX.md`, `docs/ROUTES.md` — no further edits to any of the three, including the already-approved-but-undisclosed row from correction 1. That correction stands as-is; only the disclosure is missing, and disclosure belongs in the handoff, not in another doc edit.
- Any file under `src/`, including `src/proxy.ts` and everything in `src/lib/auth/`.
- `package.json`, `package-lock.json`, any dependency change.
- Any `docs/architecture/*.md` file.
- Any application page.
- `tasks/current-task.md`, `handoff/CLAUDE_REVIEW.md`.
- Reverting, reformatting, or otherwise touching any part of the original `AUTH-001` diff not explicitly named in corrections 1–3 above — e.g., do not "clean up" the test file's existing structure, do not re-order existing assertions, do not touch the three original migrations even to add a comment.
- Any remote Supabase operation (`supabase link`, `supabase db push`, production keys, manual SQL Editor work) — local-only, same standing rule as `AUTH-001`.

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

Include actual output (or a faithful pass/fail summary per step) for all ten in the updated `handoff/CODEX_SUMMARY.md`.

## Acceptance criteria
- [ ] `handoff/CODEX_SUMMARY.md` contains an explicit, factual documentation-deviation disclosure covering all six points listed in "Required correction 1."
- [ ] `docs/RLS_ACCESS_MATRIX.md`'s corrected `profiles INSERT` row remains exactly as `AUTH-001` left it — untouched by this task.
- [ ] A real `anon`-role invocation of `create_organization_with_owner` is denied by permission (SQLSTATE `42501`, confirmed against this environment's actual behavior, not assumed) — proven by a new pgTAP assertion, not a catalog/privilege-metadata check.
- [ ] The anon-denial test leaves no `organizations` or `organization_members` row behind.
- [ ] A duplicate `organization_members (organization_id, user_id)` insert attempt, run in a context that bypasses RLS, fails with SQLSTATE `23505` — proven by a new pgTAP assertion, distinct in mechanism from the existing authenticated-non-member RLS-denial test.
- [ ] No duplicate `organization_members` row persists after that assertion.
- [ ] Every existing assertion in `org_identity_foundation.test.sql` — direct-insert-denied, self-promotion-denied, member/non-member visibility, cross-org isolation, bootstrap atomicity, `default_workspace` non-authority, naming scan, everything from the original 78 — remains present and passing, unmodified in intent.
- [ ] `npx supabase test db --local supabase/tests` reports a test count of at least 80 (78 existing + the ≥2 new assertions from corrections 2–3), `Result: PASS`.
- [ ] `npx supabase db reset` completes cleanly from zero with no manual intervention.
- [ ] `npm run build`, `npx tsc --noEmit`, `npx eslint .`, and `powershell -ExecutionPolicy Bypass -File scripts/verify.ps1` all pass.
- [ ] `git diff --name-status` (plus `git status` for untracked-vs-modified distinction) shows changes restricted to exactly `handoff/CODEX_SUMMARY.md` and `supabase/tests/database/org_identity_foundation.test.sql` — nothing else, not even a re-touched original file with no net content change.
- [ ] No migration, schema, RLS policy, application code, proxy code, or documentation file (beyond the one authorized `CODEX_SUMMARY.md` update) was changed.
- [ ] Nothing committed, nothing pushed.

## Handoff notes expected (update within `handoff/CODEX_SUMMARY.md`)
- The documentation-deviation disclosure addendum itself (correction 1), placed clearly, not buried.
- The exact new test assertion names/descriptions added for corrections 2 and 3, and the exact SQLSTATEs each expects.
- Confirmation that the SQLSTATE used for the anon-denial test was verified against this environment's actual raised error, not assumed from general Postgres knowledge.
- Updated total test count and file-count summary (e.g., "Files=2, Tests=N, Result: PASS") from the actual `supabase test db` run.
- Commands actually run, with pass/fail per verification step.
- Confirmation that no existing test assertion was altered, removed, or weakened.
- Confirmation that the diff is restricted to exactly the two allowed files.
- Any deviation from this task and why, or an explicit "none" if there were none.

Stop after updating the handoff. Do not start another task. Do not commit. Do not push.
