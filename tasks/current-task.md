# Task Template

Copy this shape into `/tasks/current-task.md` for every new task. Fill every section — an empty section is an ambiguity Codex will have to guess at, and guessing is explicitly against the rules in `AGENTS.md`.

---

## Task ID
`PHASE3B-001`

## Phase reference
`/docs/PHASES.md` Phase 3 ("Auth, profiles, organizations") — this task covers only drafting the identity/profile foundation migration file. It does not apply it, does not add RLS, and does not touch auth UI, organizations, or any later Phase 3 feature.

## Objective
Draft (write, do not apply) one SQL migration that creates a clean, privacy-first identity foundation: a `profiles` table for identity/profile data and a separate `user_contacts` table for contact data, so that phone/email/WhatsApp never lives in the same table participants and organizers query for profile display. No RLS, no live database operation.

## Context
Phase 3a is complete and approved: Supabase dependencies, `.env.example` placeholders, and `src/lib/supabase/{client,server,admin}.ts` scaffolding exist, but nothing calls them yet. No migration, RLS policy, auth UI, live Supabase connection, or profile form exists anywhere in the repo yet. This task is the first schema work in the project.

## Architecture correction — read before writing SQL
`/docs/DATABASE.md` §1 currently describes `profiles` with `phone` as a direct column (marked P3). **This task intentionally deviates from that**, per explicit human instruction: contact fields (`email`, `phone`, `whatsapp`) must live in a new, separate `user_contacts` table instead, because the platform's core privacy promise (no contact info before a reveal condition is met) is safer to enforce against a table that holds *only* contact data than against columns mixed into a table also used for general profile display. This task does not update `/docs/DATABASE.md` — `/docs` stays read-only for this task, per the standing rule. Do not treat the discrepancy between this migration and the current `DATABASE.md` text as an error to resolve yourself; it is a known, approved divergence that a human will reconcile in `/docs` in a separate step. Do not modify `/docs` to "fix" this.

## In scope
- Create exactly one new SQL migration file under `supabase/migrations/`, named with a timestamp prefix following Supabase CLI convention (e.g. `supabase/migrations/20260710120000_identity_foundation.sql` — pick a reasonable timestamp; it does not need to match any real applied state since nothing will be applied).
- In that migration, create:
  - **`profiles`** — `id uuid primary key references auth.users(id)` (the sole naming-rule exception), `full_name`, `university`, `major`, `graduation_year`, `governorate`, `city`, `bio`, `github_url`, `linkedin_url`, `portfolio_url`, `experience_level`, `primary_role`, `looking_for_team`, `created_at`, `updated_at`. No contact fields of any kind.
  - **`user_contacts`** — `id`, `user_id uuid references profiles(id) on delete cascade`, `email`, `phone`, `whatsapp`, `preferred_contact_method`, `created_at`, `updated_at`.
- Reasonable column types/constraints: e.g. `graduation_year` as a bounded integer, `experience_level` and `primary_role` as either a `check` constraint or a Postgres `enum` (your choice — pick one and be consistent), `preferred_contact_method` similarly constrained to a small known set (e.g. `email`/`phone`/`whatsapp`), `updated_at` defaulting to `now()`.
- A shared `updated_at` trigger/function (e.g. a small `set_updated_at()` function used by both tables via `BEFORE UPDATE` triggers) if that keeps the migration clean — fine to add as a small reusable helper within this same file.
- Reasonable indexes (e.g. on `user_contacts.user_id`, and on `profiles.university` if it mirrors `/docs/DATABASE.md`'s existing indexing note) and a uniqueness constraint on `user_contacts.user_id` (one contact row per user).
- SQL comments (`COMMENT ON TABLE` / inline `--` comments) explaining: that `profiles` is identity/display data, that `user_contacts` is private and must never be exposed publicly, and that future contact-reveal logic must read from `user_contacts`, never from `profiles`.

## Out of scope
- Applying, pushing, or resetting this or any migration (`supabase db push`, `supabase migration up`, `supabase db reset`, or any equivalent).
- Any connection to a live Supabase project or database.
- Any RLS policy (`enable row level security`, `create policy`, etc.) — tables are created with RLS left for a dedicated, separately-approved task.
- `organizations`, `organization_members`, `hackathons`, `hackathon_tracks`, `hackathon_applications`, or any matching/team table.
- Any auth UI, login/signup flow, or session handling.
- Any profile form or other product UI change.
- Any contact-reveal logic of any kind (function, RPC, or otherwise) — this task only separates the data; it does not gate access to it.
- Any sponsor/talent access logic.
- Any edit to `/docs`, `AGENTS.md`, `CLAUDE.md`, `WORKFLOW.md`, or `scripts/*.ps1`.
- Any file outside `supabase/migrations/` plus the standard `handoff/CODEX_SUMMARY.md` write.

## Relevant docs
- `/docs/DATABASE.md` §1 (`profiles`) — read for column intent and privacy-level conventions, but **do not follow its contact-field placement**; see "Architecture correction" above.
- `/docs/DATABASE.md` header — naming rule (`profiles.id` is the sole exception to `user_id`) and privacy-level convention (P0–P3) this migration's comments should reference informally.
- `/docs/PRIVACY_MODEL.md` §1 (data classification) and §4 (contact reveal mechanism) — background on why contact data must be separable; this task lays the groundwork, it does not implement the reveal mechanism itself.

## Approvals on record
- [x] Database migration approved by human — **approved to draft a migration file only.** Explicitly stated in this task by the human: "This task is approved to draft a migration file only. It is NOT approved to apply, push, reset, or run the migration."
- [ ] RLS / contact-reveal logic approved by human — **not approved.** No RLS policy of any kind may be written in this task.

## Files expected to change
- One new file under `supabase/migrations/` (e.g. `supabase/migrations/20260710120000_identity_foundation.sql`)
- `handoff/CODEX_SUMMARY.md` (standard handoff write)

If the diff touches anything else, that is a deviation to flag, not a silent addition.

## Acceptance criteria
- [ ] Migration file exists under `supabase/migrations/` and is syntactically reasonable PostgreSQL/Supabase SQL.
- [ ] `profiles.id` is `uuid primary key references auth.users(id)`.
- [ ] `user_contacts.user_id` references `profiles(id)`, with `on delete cascade`.
- [ ] All required `profiles` columns are present, and **no** contact field (`email`, `phone`, `whatsapp`, or similar) exists on `profiles`.
- [ ] All required `user_contacts` columns are present.
- [ ] No RLS policy, `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`, or `CREATE POLICY` statement appears anywhere in the migration.
- [ ] No Supabase CLI command (push/reset/migration up, or any live connection) is run as part of this task.
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
- No new dependencies unless explicitly listed above (none are authorized by this task — it is SQL only).
- `/docs` is read-only unless this task says otherwise (it does not — see "Architecture correction" above).
- Do not weaken, remove, or bypass any workflow guard in `scripts/verify.ps1` or `scripts/run-codex-task.ps1`.

## Verification steps
1. Read the drafted SQL yourself for syntactic sanity (there is no live database to run it against in this task).
2. `npm run build`
3. `npx tsc --noEmit`
4. `npx eslint .`
5. `powershell -ExecutionPolicy Bypass -File scripts/verify.ps1`

## Handoff notes expected
- Confirm explicitly that no contact field exists on `profiles` and that `user_contacts` holds all of them.
- Confirm explicitly that no RLS statement and no live Supabase command appears anywhere in the change.
- Note whether you used a Postgres `enum` or a `check` constraint for `experience_level`/`primary_role`/`preferred_contact_method`, and why, so a human can decide whether to standardize this pattern for later migrations.
- Flag explicitly, in the open-questions section, that `/docs/DATABASE.md` still describes the old (pre-correction) `profiles` shape with `phone` inline, and that a human/Claude will need to update that doc in a separate, dedicated step — do not attempt to reconcile it yourself.
