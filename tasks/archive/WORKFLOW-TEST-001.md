# Task Template

Copy this shape into `/tasks/current-task.md` for every new task. Fill every section — an empty section is an ambiguity Codex will have to guess at, and guessing is explicitly against the rules in `AGENTS.md`.

---

## Task ID
`WORKFLOW-TEST-001`

## Phase reference
None — this is not a `/docs/PHASES.md` product task. It is a one-time dry run of the Claude/Codex/human loop described in `WORKFLOW.md`, to confirm the pipeline (task → implementation → verify → handoff) works end to end before any real product work is issued through it.

## Objective
Confirm Codex can read `AGENTS.md`, `/docs`, and this task file, then produce exactly one new file — nothing else — and hand off correctly.

## In scope
- Create the file `handoff/WORKFLOW_TEST.md`.
- Its contents should simply state that the workflow test passed, and list the verification commands Codex ran (i.e. the commands invoked from `scripts/verify.ps1`: `npm run build`, `npx tsc --noEmit`, `npx eslint .`, and the `profile_id` forbidden-string scan).

## Out of scope
- Any product code under `src/`.
- Any file under `/docs`.
- `package.json` or any dependency change.
- Anything Supabase-related.
- Any database migration.
- Any authentication code.
- Any file other than `handoff/WORKFLOW_TEST.md` and the standard `handoff/CODEX_SUMMARY.md` handoff write.

## Relevant docs
None — this task deliberately touches no product surface, so no `/docs` section applies. `WORKFLOW.md` and `AGENTS.md` govern the process itself.

## Approvals on record
- [ ] Database migration approved by human — not applicable, none requested.
- [ ] RLS / contact-reveal logic approved by human — not applicable, none requested.

## Files expected to change
- `handoff/WORKFLOW_TEST.md` (new file)
- `handoff/CODEX_SUMMARY.md` (new/updated, standard handoff write)

If the diff touches anything else, that is a failure of this test, not a valid deviation.

## Acceptance criteria
- [x] `handoff/WORKFLOW_TEST.md` exists.
- [x] It states that the workflow test passed.
- [x] It lists the verification commands that were run.
- [x] No file under `src/`, `/docs`, or `package.json` was modified.
- [x] No Supabase, migration, or auth-related file was created or modified.
- [x] `git diff` shows only `handoff/WORKFLOW_TEST.md` and `handoff/CODEX_SUMMARY.md`.

## Constraints (standing, copied from AGENTS.md — do not remove)
- `user_id` naming rule; `profiles.id` is the only exception; `profile_id` must not appear anywhere.
- No public marketplace, no public people browsing, no public contact reveal.
- No AI winner selection, no public negative scoring.
- No sponsor access to raw participant data without explicit opt-in.
- No new dependencies unless explicitly listed above.
- `/docs` is read-only unless this task says otherwise.

## Verification steps
Run `powershell -File scripts/verify.ps1` and record its output (or the individual commands it runs) in `handoff/WORKFLOW_TEST.md`.

## Handoff notes expected
Confirm explicitly in `CODEX_SUMMARY.md` that only `handoff/WORKFLOW_TEST.md` was created and nothing else was touched — this task exists specifically to test that scope containment holds.

---

## Archive note

**Status: COMPLETE — reviewed and approved.**
See `handoff/CODEX_SUMMARY.md` for Codex's execution report and `handoff/CLAUDE_REVIEW.md` for the review verdict (APPROVE). Archived here so `tasks/current-task.md` could be cleared for the next task. This file is a historical record — do not treat it as an active task.
