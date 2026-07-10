# Task Template

Copy this shape into `/tasks/current-task.md` for every new task. Fill every section — an empty section is an ambiguity Codex will have to guess at, and guessing is explicitly against the rules in `AGENTS.md`.

---

## Task ID
`PHASE3C-001`

## Phase reference
`/docs/PHASES.md` Phase 3 ("Auth, profiles, organizations") — this task drafts the RLS policies for the identity foundation created in `PHASE3B-001` and documented in `PHASE3B-002`. It does not apply anything, and does not touch any table beyond `profiles`/`user_contacts`.

## Objective
Draft (write, do not apply) one new SQL migration that enables Row Level Security on `profiles` and `user_contacts` and adds strictly self-owned policies, so both tables move from "RLS-less" to "deny-by-default with narrow, explicit self-access" — nothing broader.

## Context
- `PHASE3B-001` (approved): created `supabase/migrations/20260710120000_identity_foundation.sql` — `profiles` (identity/display data) and `user_contacts` (private contact data: email, phone, whatsapp, preferred_contact_method), with no RLS yet.
- `PHASE3B-002` (approved): reconciled `/docs/DATABASE.md`, `/docs/PRIVACY_MODEL.md`, and `/docs/RLS_ACCESS_MATRIX.md` with that split. `RLS_ACCESS_MATRIX.md` currently carries a note that `user_contacts` "needs its own access-matrix row and separately approved RLS policy before implementation" — this task is that approved RLS policy work, for these two tables only.
- No auth UI, profile form, organizations, hackathons, matching/team tables, or contact-reveal logic exist anywhere in the repo yet.

## In scope
- Create exactly one new SQL migration file under `supabase/migrations/`, named with a later timestamp prefix than `20260710120000_identity_foundation.sql` (e.g. `supabase/migrations/20260710130000_identity_rls.sql` or similar — pick a reasonable, later timestamp).
- `alter table public.profiles enable row level security;`
- `alter table public.user_contacts enable row level security;`
- Policies on `profiles`, all scoped to `auth.uid() = id` (the sole naming-rule exception column):
  - `select` — a user may read their own profile row.
  - `insert` — a user may insert their own profile row (`with check (auth.uid() = id)`), if you judge this is needed given a signup trigger may not exist yet; use your judgment and explain the choice in the handoff.
  - `update` — a user may update their own profile row.
  - No `delete` policy unless you have a specific, stated reason — if omitted, say so explicitly in the handoff rather than leaving it unaddressed.
- Policies on `user_contacts`, all scoped to `auth.uid() = user_id`:
  - `select` — a user may read their own contact row.
  - `insert` — a user may insert their own contact row (`with check (auth.uid() = user_id)`).
  - `update` — a user may update their own contact row.
  - Same note on `delete` as above.
- SQL comments explaining the privacy stance: no public read on `profiles` yet, no cross-user read on `user_contacts` ever via these policies, no organizer/sponsor/talent access yet — those are explicitly future, separately-approved work (a dedicated safe view/RPC for public-safe profile reads, and an audited RPC for contact reveal — neither implemented here).

## Out of scope
- Applying, pushing, or resetting this or any migration (`supabase db push`, `supabase migration up`, `supabase db reset`, or any equivalent) — draft only.
- Any connection to a live Supabase project or database.
- Any RLS policy or table other than `profiles` and `user_contacts` — no `organizations`, `organization_members`, `hackathons`, `hackathon_tracks`, `hackathon_applications`, matching/team tables, or anything else.
- Any public/anonymous read policy on either table.
- Any cross-user read policy on `user_contacts` (no organizer, sponsor, judge, mentor, or "reveal" access — that is explicitly deferred to a future, separately-approved RPC-based mechanism, not a table policy).
- Any broad `authenticated`-role read policy on `user_contacts` (e.g. `using (true)` for any authenticated user) — self-owned only.
- Any auth UI, login/signup flow, session handling, or profile form.
- Any contact-reveal function, RPC, or view.
- Any sponsor/talent access logic.
- Any edit to `/docs`, `AGENTS.md`, `CLAUDE.md`, `WORKFLOW.md`, or `scripts/*.ps1`.
- Any product UI change.
- Any file outside `supabase/migrations/` plus the standard `handoff/CODEX_SUMMARY.md` write.

## Relevant docs
- `/docs/RLS_ACCESS_MATRIX.md` — `profiles` row (identity table) and the `user_contacts` acknowledgment note added in `PHASE3B-002`; this task should make the actual policies consistent with what that matrix already describes (self-only access, no public/cross-user reads).
- `/docs/DATABASE.md` §1 — `profiles` and `user_contacts` column definitions and ownership statements this task's policies must match.
- `/docs/PRIVACY_MODEL.md` §1 and §4 — P3 classification and the stated future reveal mechanism (`get_revealed_contacts` RPC) that this task must not attempt to implement, only leave room for.
- `supabase/migrations/20260710120000_identity_foundation.sql` — the table shapes these policies apply to; treat it as the source of truth for column names.

## Approvals on record
- [x] Database migration approved by human — **approved to draft an RLS migration file only.** Explicitly stated in this task by the human: "This task is approved to draft an RLS migration file only. It is NOT approved to apply, push, reset, or run the migration."
- [x] RLS / contact-reveal logic approved by human — **approved, narrowly.** Explicitly stated: self-owned RLS policies on `profiles` and `user_contacts` only, drafted (not applied), not connected to a live database. This approval does **not** extend to contact-reveal logic, organizer/sponsor/talent access, or any table beyond these two — those remain unapproved.

## Files expected to change
- One new file under `supabase/migrations/` (e.g. `supabase/migrations/20260710130000_identity_rls.sql`)
- `handoff/CODEX_SUMMARY.md` (standard handoff write)

If the diff touches anything else, that is a deviation to flag, not a silent addition.

## Acceptance criteria
- [ ] Exactly one new SQL migration file is created under `supabase/migrations/`.
- [ ] `alter table ... enable row level security` is present for both `profiles` and `user_contacts`.
- [ ] Every policy on both tables is scoped to the authenticated owner only (`auth.uid() = id` for `profiles`, `auth.uid() = user_id` for `user_contacts`) — no public, anonymous, or broad-authenticated policy of any kind.
- [ ] No policy grants any user read access to another user's `profiles` or `user_contacts` row.
- [ ] No organizer, sponsor, judge, mentor, or "reveal" policy is added.
- [ ] No Supabase CLI command or live database connection is attempted anywhere in this task.
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
- No new dependencies — this task is SQL-only, no `package.json` change of any kind.
- `/docs` is read-only for this task — no exception granted here.
- Do not weaken, remove, or bypass any workflow guard in `scripts/verify.ps1` or `scripts/run-codex-task.ps1`, and do not touch those files at all in this task.

## Verification steps
1. Read the drafted SQL yourself for syntactic sanity and policy-scope correctness (there is no live database to run it against in this task).
2. `npm run build`
3. `npx tsc --noEmit`
4. `npx eslint .`
5. `powershell -ExecutionPolicy Bypass -File scripts/verify.ps1`

## Handoff notes expected
- List every policy created, per table, in one line each (table, operation, `using`/`with check` expression).
- Confirm explicitly that no policy allows cross-user or public/anonymous access to either table.
- State explicitly whether `delete` policies were included or intentionally omitted, and why.
- State explicitly which choice was made for `profiles insert` (self-insert policy vs. relying solely on a future signup trigger) and the reasoning, so a human can confirm it before any auth-flow task depends on it.
- Confirm explicitly that no live Supabase command or connection was attempted.
