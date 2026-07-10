# Claude Review — PHASE3B-001

## 1. Verdict

**APPROVE**

The migration is clean, correctly separates identity from contact data, stays entirely within the draft-only approval boundary, and every acceptance criterion is independently verified true — not just trusted from `CODEX_SUMMARY.md`. One forward-looking design note is flagged below for the *next* task (the signup trigger), not as a defect in this one.

## 2. Scope containment

**Held.** Diff is exactly `supabase/migrations/20260710120000_identity_foundation.sql` plus the standard `handoff/CODEX_SUMMARY.md` write — confirmed via `git status --short`. No `/docs`, no `AGENTS.md`/`CLAUDE.md`/`WORKFLOW.md`, no `scripts/*.ps1`, no auth UI, no profile form, no organizations/hackathons/matching tables, no contact-reveal logic. Codex also correctly declined to "fix" the now-stale `DATABASE.md` contact-field description, exactly as instructed, and surfaced it as an open question for a human/Claude to reconcile separately instead of guessing.

## 3. One migration file only

**Confirmed.** `find supabase -type f` returns exactly one file: `supabase/migrations/20260710120000_identity_foundation.sql`.

## 4. `profiles` / `user_contacts` separation

**Correct.** `profiles` holds only identity/display columns (`full_name`, `university`, `major`, `graduation_year`, `governorate`, `city`, `bio`, `github_url`, `linkedin_url`, `portfolio_url`, `experience_level`, `primary_role`, `looking_for_team`, timestamps). `user_contacts` is a distinct table keyed by `user_id`, holding `email`, `phone`, `whatsapp`, `preferred_contact_method`. This is exactly the architecture correction the task specified.

## 5. No contact fields inside `profiles`

**Confirmed by direct read of the SQL**, not just Codex's claim — the `profiles` column list contains no `email`, `phone`, or `whatsapp` field anywhere.

## 6. `profiles.id` → `auth.users(id)`

**Correct.** `id uuid primary key references auth.users(id)`, with a `comment on column` explicitly documenting it as the sole exception to the `user_id` naming rule.

## 7. `user_contacts.user_id` → `profiles(id)`

**Correct.** `user_id uuid not null references public.profiles(id) on delete cascade`, plus a `unique (user_id)` constraint enforcing one contact row per user.

## 8. Forbidden identifier

**Absent.** Independently grepped the migration file for the string formed by `profile` + `_` + `id`: zero matches. (Constraint names like `profiles_graduation_year_bounds` and `user_contacts_user_id_unique` do not contain the forbidden substring — checked character-by-character, not just eyeballed.)

## 9. RLS policies

**None present.** Independently grepped for `row level security`, `create policy` (case-insensitive): zero matches. No `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` anywhere.

## 10. Live Supabase operations

**None attempted.** This is a plain SQL file under `supabase/migrations/`; no CLI command, connection string, or apply/push/reset action appears in the diff or is referenced in `CODEX_SUMMARY.md`'s verification section. Nothing in this task could have touched a live database — there is no code path here that invokes the Supabase CLI or any client.

## 11. Constraints / indexes / triggers

**Reasonable, with one forward-looking note (not a defect in this file):**
- `graduation_year` bounded via `check` (1900–2100) — sane.
- `experience_level`, `primary_role`, `preferred_contact_method` constrained via `check (... in (...))` rather than Postgres `enum` types. Codex's stated reasoning (easier to iterate before the schema is ever applied) is sound for a draft; worth a human decision on whether to standardize on `enum` before this is actually applied, but not wrong as drafted.
- `user_contacts_email_shape` — a light `position('@' in email) > 1` sanity check, not full validation; appropriate for a draft, real validation belongs at the application layer.
- `user_contacts_user_id_unique` — correctly doubles as the lookup index for `user_id`; a separate explicit index would have been redundant, and Codex's summary correctly explains why one wasn't added.
- `profiles_university_idx` — matches `/docs/DATABASE.md`'s existing indexing intent for `profiles.university`.
- Shared `set_updated_at()` trigger function used by both tables — clean, avoids duplicated trigger logic.
- **Note for the next task, not this one:** `profiles.full_name` is `not null` with no default. `/docs/DATABASE.md`'s data flow #1 describes a signup trigger inserting a `profiles` row immediately on `auth.users` creation, before onboarding. If that trigger is implemented as currently documented, it will need to either supply a `full_name` value at insert time (e.g., derived from auth metadata, or a placeholder) or this constraint will need to become nullable with app-level enforcement of "must complete profile before joining a pool." This isn't a fix needed in this migration — it's a design decision the signup-trigger task must make deliberately rather than discover by a failing insert.

## 12. Verification

**Passes, independently re-run.** `npm run build`, `npx tsc --noEmit`, `npx eslint .`, and the full `powershell -ExecutionPolicy Bypass -File scripts/verify.ps1` gate (all four internal steps, including the forbidden-string scan) were all re-run fresh for this review and all passed cleanly.

## 13. Fixes needed

**None required to approve this task.** The one item worth carrying forward is the `full_name not null` / signup-trigger interaction noted in §11 — recommend the next Phase 3 task (the `auth.users` signup trigger) explicitly decide how that column gets populated at insert time, rather than leaving it to be discovered as a runtime failure once a live database exists.

## Summary

PHASE3B-001 is a clean, correctly-scoped draft migration that delivers exactly the privacy-architecture correction it was asked for. Approved. Two follow-up items for separate, dedicated tasks (not this one): (a) reconcile `/docs/DATABASE.md`'s `profiles` description with this new `user_contacts` split, and (b) decide `full_name`'s population strategy when the signup trigger task is scoped.
