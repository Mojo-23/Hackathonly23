# Task Template

Copy this shape into `/tasks/current-task.md` for every new task. Fill every section — an empty section is an ambiguity Codex will have to guess at, and guessing is explicitly against the rules in `AGENTS.md`.

---

## Task ID
`PHASE3D-000`

## Phase reference
`/docs/PHASES.md` Phase 3 ("Auth, profiles, organizations") — this is a decision/documentation task that sits between the completed schema/RLS drafts (`PHASE3B-001`, `PHASE3C-001`) and the not-yet-started signup-trigger/auth-UI work. No code or schema changes belong in this task.

## Objective
Resolve, in writing, the identity-creation ambiguity flagged in the `PHASE3C-001` review: how `profiles` and `user_contacts` rows actually get created (trigger vs. client insert vs. hybrid), how `profiles.full_name` (currently `not null`, no default) gets populated at creation time, and whether the existing `profiles_insert_own` self-insert RLS policy is a permanent part of the design or scaffolding to be revisited. This task produces a decision, not code — the next task will implement whatever this one decides.

## Context
- `PHASE3B-001` (approved): created `profiles` (identity/display data, `full_name text not null`) and `user_contacts` (private contact data), no RLS.
- `PHASE3C-001` (approved): added self-owned RLS — including a `profiles_insert_own` policy (`with check (auth.uid() = id)`) — with the handoff explicitly noting this was chosen *because* no signup trigger exists yet, and the review flagged that `/docs/RLS_ACCESS_MATRIX.md`'s existing `profiles INSERT` row says "trigger only" for participants, which is now slightly out of sync with the actual policy.
- No signup trigger, auth UI, or onboarding flow exists anywhere in the repo yet. This task must settle the strategy before any of those are built, so the next implementation task isn't guessing.

## In scope
Documentation and decision-writing only:
- Write a clear decision covering all five points the human specified:
  1. Whether `profiles` rows are created by a database trigger on `auth.users` insert, by a client-side onboarding insert (using the existing `profiles_insert_own` RLS policy), or a hybrid (e.g., trigger creates a minimal row, onboarding fills the rest via update).
  2. Whether `user_contacts` rows are created by trigger or by client-side onboarding insert (using the existing `user_contacts_insert_own` policy).
  3. How `full_name` gets populated at creation time given its `not null` constraint with no default — e.g., derived from auth metadata at trigger time, a placeholder value, or nullable-until-onboarding (if the last option, note that it would require a follow-up migration, not implemented here).
  4. Whether the current `profiles_insert_own` RLS policy from `PHASE3C-001` should be kept permanently (e.g., as defense-in-depth alongside a trigger) or is scaffolding that a later, separately-approved migration should remove/tighten once a trigger exists.
  5. What the next implementation task should be, stated concretely enough that a future task file could be written directly from it (e.g., "PHASE3D-001: implement the `auth.users` signup trigger described above").
- If, and only if, needed to state this decision clearly and keep `/docs` internally consistent, update:
  - `/docs/DATABASE.md` — the `profiles`/`user_contacts` creation-path description (e.g. data flow #1/#2 in §13, and/or the `profiles` entry in §1).
  - `/docs/RLS_ACCESS_MATRIX.md` — the `profiles INSERT` row, so it states the actual decided creation path instead of the stale "trigger only" text, consistent with whatever `PHASE3C-001` actually implemented.
  - `/docs/PRIVACY_MODEL.md` — only if the creation-path decision affects anything it currently states about contact data separation (it should not need to, since this task does not change where contact data lives — but check).
  - `/docs/PRODUCT_DECISIONS.md` — add one new, short, clearly-numbered decision entry (the next available `D` number after `D16`) recording this identity-creation strategy, in the same style as the existing entries.
- Keep every edit concise and consistent with existing doc structure/tone — this is a decision write-up, not a rewrite of surrounding sections.

## Out of scope
- Any SQL file, migration, or schema change of any kind.
- Any RLS policy change (drafted or applied) — if the decision concludes the existing `profiles_insert_own` policy should eventually be removed or changed, say so as a recommendation for a future, separately-approved migration task; do not modify `supabase/migrations/` in this task.
- Any auth UI, signup/login flow, or onboarding form.
- Any Supabase connection, CLI command, or live database operation.
- Any product UI change.
- `organizations`, `hackathons`, matching/team tables, or contact-reveal logic of any kind.
- Any `/docs` file not named in "In scope" above.
- Any change to `AGENTS.md`, `CLAUDE.md`, `WORKFLOW.md`, `tasks/TASK_TEMPLATE.md`, or `scripts/*.ps1`.
- Any file outside the four named `/docs` files (only as needed) plus the standard `handoff/CODEX_SUMMARY.md` write.

## Relevant docs
- `/docs/DATABASE.md` §1 (`profiles`, `user_contacts`) and §13 data flows #1–2 — current creation-path description to reconcile.
- `/docs/RLS_ACCESS_MATRIX.md` — `profiles INSERT` row ("trigger only") that this decision must either confirm, correct, or explicitly supersede.
- `/docs/PRODUCT_DECISIONS.md` — existing style/numbering (`D1`–`D16`) for the new decision entry; also see `D16` (naming rule) and `D9`-style entries for tone.
- `handoff/CLAUDE_REVIEW.md` (the `PHASE3C-001` review) — the specific ambiguity this task must resolve, in the reviewer's own words.
- `supabase/migrations/20260710120000_identity_foundation.sql` and `supabase/migrations/20260710130000_identity_rls.sql` — the actual current schema/RLS state this decision must be consistent with (read-only reference; do not edit).

## Approvals on record
- [ ] Database migration approved by human — not applicable, no migration in this task.
- [ ] RLS / contact-reveal logic approved by human — not applicable, no RLS change in this task; this task may only *describe* a future RLS change as a recommendation.

## Files expected to change
- `/docs/PRODUCT_DECISIONS.md` (new decision entry — expected in all cases)
- `/docs/DATABASE.md` (only if needed to reconcile creation-path description)
- `/docs/RLS_ACCESS_MATRIX.md` (only if needed to correct the stale "trigger only" note)
- `/docs/PRIVACY_MODEL.md` (only if needed)
- `handoff/CODEX_SUMMARY.md` (standard handoff write)

If the diff touches any file outside this list, that is a deviation to flag, not a silent addition.

## Acceptance criteria
- [ ] A single, explicit, unambiguous decision exists (in `PRODUCT_DECISIONS.md`, cross-referenced from `DATABASE.md`/`RLS_ACCESS_MATRIX.md` as needed) covering all five points listed under "In scope" item 1.
- [ ] `/docs/RLS_ACCESS_MATRIX.md`'s `profiles INSERT` row no longer contradicts what `PHASE3C-001` actually implemented (either the row is corrected, or the decision explains why the row and the policy will diverge until a follow-up task, with that follow-up task named).
- [ ] The decision explicitly confirms contact data stays in `user_contacts` only — no walking back the `PHASE3B-001`/`PHASE3B-002` separation.
- [ ] The next implementation task is named concretely enough to be written as a task file directly from this decision.
- [ ] No forbidden identifier (the string formed by `profile` + `_` + `id`) appears anywhere in the diff.
- [ ] No SQL, RLS policy, product code, or UI change appears anywhere in the diff.
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
- No new dependencies — this task is documentation-only, no `package.json` change of any kind.
- `/docs` is read-only **except** for the four files named under "In scope," and only where the decision actually requires an edit — this is the explicit, scoped exception this task grants.
- Do not weaken, remove, or bypass any workflow guard in `scripts/verify.ps1` or `scripts/run-codex-task.ps1`, and do not touch those files at all in this task.

## Verification steps
1. `npm run build`
2. `npx tsc --noEmit`
3. `npx eslint .`
4. `powershell -ExecutionPolicy Bypass -File scripts/verify.ps1`
5. Re-read `/docs/RLS_ACCESS_MATRIX.md`'s `profiles INSERT` row and `supabase/migrations/20260710130000_identity_rls.sql` side by side to confirm they no longer silently contradict each other.

## Handoff notes expected
- State the decision for each of the five numbered points plainly, in the summary itself, not only by reference to the doc files.
- List exactly which `/docs` files were changed and, for each, a one-line summary; explicitly say if any of the optional three needed no change.
- Name the recommended next task (a concrete `PHASE3D-00N` description) so Claude can write it directly from this handoff.
- Flag anything that felt like it required an actual code/schema decision beyond documentation, so it isn't quietly resolved by prose alone.
