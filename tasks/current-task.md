# Task Template

Copy this shape into `/tasks/current-task.md` for every new task. Fill every section — an empty section is an ambiguity Codex will have to guess at, and guessing is explicitly against the rules in `AGENTS.md`.

---

## Task ID
`PHASE3B-002`

## Phase reference
`/docs/PHASES.md` Phase 3 ("Auth, profiles, organizations") — this task is documentation-only cleanup following `PHASE3B-001`. It does not add code, schema, or RLS; it brings `/docs` back in sync with a migration that was already drafted and approved.

## Objective
Update `/docs` so it accurately describes the approved `profiles` / `user_contacts` split from `PHASE3B-001`, instead of the older, now-stale description where contact fields lived directly on `profiles`.

## Context
`PHASE3B-001` was reviewed and approved (`handoff/CLAUDE_REVIEW.md`, verdict APPROVE). It created `supabase/migrations/20260710120000_identity_foundation.sql`, which:
- Creates `profiles` for identity/display data only (`full_name`, `university`, `major`, `graduation_year`, `governorate`, `city`, `bio`, `github_url`, `linkedin_url`, `portfolio_url`, `experience_level`, `primary_role`, `looking_for_team`, timestamps) — no contact fields.
- Creates a separate `user_contacts` table (`id`, `user_id references profiles(id) on delete cascade`, `email`, `phone`, `whatsapp`, `preferred_contact_method`, timestamps) for all private contact data.
- Adds no RLS yet (deliberately deferred to a separate, separately-approved task).

That review flagged, as an explicit open item, that `/docs/DATABASE.md` still describes the old shape (contact fields inline on `profiles`) and needs reconciling in its own dedicated step. This is that step.

## Important exception to the standing rule
`AGENTS.md` and the task template both say `/docs` is read-only by default. **This task is the explicit, scoped exception** for exactly the files listed under "In scope" below — nothing else in `/docs` may be touched.

## In scope
Documentation edits only, limited to:
- **`/docs/DATABASE.md`** — update the `profiles` section to remove contact fields (`phone`, and any other contact-field mentions) and to match the columns actually created in the migration; add a `user_contacts` section describing it as private (P3) contact data, its columns, and its `user_id → profiles(id) on delete cascade` relationship. Add a short note that this shape was corrected in `PHASE3B-001` (with a pointer to the migration filename) so the history is traceable, not silently rewritten.
- **`/docs/RLS_ACCESS_MATRIX.md`** — only where needed to acknowledge `user_contacts` as a private-contact-data table that will need its own RLS row once RLS is approved (do not draft the actual policy — this is a documentation acknowledgment only, since no RLS exists yet).
- **`/docs/PRIVACY_MODEL.md`** — only where needed so its description of contact data storage matches the new split (e.g. wherever it currently implies contact fields live on `profiles`).
- **`/docs/PRODUCT_DECISIONS.md`** — only if an existing decision entry (e.g. one describing the original `profiles` shape) needs a clarifying note; do not invent a new numbered decision unless one doesn't already exist to amend, and if you do add one, keep it short and clearly mark it as amending/superseding, not contradicting silently.
- Keep every edit concise — this is a reconciliation pass, not a rewrite. Preserve existing document structure, tone, and section numbering; change only what's factually wrong now.

## Out of scope
- Any SQL file, migration, or schema change of any kind.
- Any RLS policy (drafted or applied).
- Any product code under `src/`.
- Any UI/UX change.
- Any Supabase connection or live database operation.
- Any change to `AGENTS.md`, `CLAUDE.md`, `WORKFLOW.md`, `tasks/TASK_TEMPLATE.md`, or `scripts/*.ps1` — the Claude/Codex workflow itself is not part of this task.
- Any `/docs` file not explicitly named in "In scope" above (e.g. `ARCHITECTURE.md`, `ROUTES.md`, `COMPONENTS.md`, `PHASES.md`, `RISKS.md` should not be touched unless you discover a factual contact-field error in one of them specifically caused by this same stale-shape issue — if so, stop and flag it in the handoff rather than editing it silently).

## Relevant docs
- `/docs/DATABASE.md` §1 (`profiles`) — the section to correct.
- `supabase/migrations/20260710120000_identity_foundation.sql` — the actual approved schema; treat this file as the source of truth for what the docs should say, not the other way around.
- `handoff/CLAUDE_REVIEW.md` (the `PHASE3B-001` review) — background on why the split was made and what was explicitly flagged as needing reconciliation.
- `/docs/PRIVACY_MODEL.md` §1 and §4 — data classification and contact-reveal mechanism sections likely to reference contact data location.
- `/docs/RLS_ACCESS_MATRIX.md` — table-group rows that will need a `user_contacts` acknowledgment.

## Approvals on record
- [ ] Database migration approved by human — not applicable, no migration in this task.
- [ ] RLS / contact-reveal logic approved by human — not applicable, no RLS or reveal logic in this task; `RLS_ACCESS_MATRIX.md` may only be updated to *acknowledge* the new table exists, not to add an actual policy.

## Files expected to change
- `/docs/DATABASE.md`
- `/docs/RLS_ACCESS_MATRIX.md` (only if needed)
- `/docs/PRIVACY_MODEL.md` (only if needed)
- `/docs/PRODUCT_DECISIONS.md` (only if needed)
- `handoff/CODEX_SUMMARY.md` (standard handoff write)

If the diff touches any file outside this list, that is a deviation to flag, not a silent addition.

## Acceptance criteria
- [ ] `/docs/DATABASE.md` no longer implies `email`/`phone`/`whatsapp` fields live on `profiles`.
- [ ] `/docs/DATABASE.md` clearly describes `user_contacts` as private (P3) contact data, with its columns and its `user_id → profiles(id)` relationship.
- [ ] A short note exists (in `DATABASE.md` or `PRODUCT_DECISIONS.md`) that `PHASE3B-001` intentionally changed the earlier `profiles` shape, pointing at the migration file.
- [ ] The naming rule is preserved everywhere touched: `profiles.id` is the only exception to `user_id`.
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
- `/docs` is read-only **except** for the specific files and edits authorized under "In scope" above — this is the explicit, scoped exception this task grants.
- Do not weaken, remove, or bypass any workflow guard in `scripts/verify.ps1` or `scripts/run-codex-task.ps1`, and do not touch those files at all in this task.

## Verification steps
1. `npm run build`
2. `npx tsc --noEmit`
3. `npx eslint .`
4. `powershell -ExecutionPolicy Bypass -File scripts/verify.ps1`
5. Re-read the edited sections of `/docs/DATABASE.md` side by side with `supabase/migrations/20260710120000_identity_foundation.sql` to confirm they now match column-for-column.

## Handoff notes expected
- List exactly which `/docs` files were changed and, for each, a one-line summary of what changed.
- Confirm explicitly that no SQL, RLS, product code, or UI file appears in the diff.
- Confirm explicitly that the `profiles`/`user_contacts` column lists in `DATABASE.md` now match the migration file exactly.
- If `RLS_ACCESS_MATRIX.md`, `PRIVACY_MODEL.md`, or `PRODUCT_DECISIONS.md` needed no changes, say so explicitly rather than leaving it ambiguous whether they were checked.
