# Claude Review — PHASE3D-001

## 1. Verdict

**APPROVE**

The trigger implements D17 exactly: correct fallback chain and order, zero contact-data contact, `user_contacts` untouched, `security definer` used with a sound justification and an explicit `search_path`, RLS left alone entirely. One low-severity edge case is noted below as an advisory for later, not a blocker.

## 2. Scope containment

**Held.** The new migration file was untracked, so I read it directly rather than relying on `git diff --stat` (per your instruction) — confirmed via `git status --short` (`?? supabase/migrations/20260710140000_signup_profile_trigger.sql`) and a full direct read. Diff is exactly that one file plus the standard `handoff/CODEX_SUMMARY.md` write. `git status --short docs/` returned nothing — `/docs` untouched, as required (this task, unlike `PHASE3B-002`/`PHASE3D-000`, was not granted a docs exception).

## 3. Exactly one new trigger migration

**Confirmed.** `find supabase/migrations -type f` lists exactly three files: the two prior approved migrations (`PHASE3B-001`, `PHASE3C-001`), plus this task's new `20260710140000_signup_profile_trigger.sql`.

## 4. `profiles.id = new.id`

**Confirmed by direct read.** `insert into public.profiles (id, full_name) values (new.id, ...)`.

## 5. `full_name` fallback chain

**Correct, exact order.** `coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'display_name', 'New participant')` — matches D17 and the task specification precisely, both in the expressions used and their order.

One edge case worth flagging as a future advisory, not a blocker: `coalesce` treats an empty string (`''`) as non-null, so if an identity provider ever supplies `raw_user_meta_data->>'full_name'` as an empty string rather than absent, this trigger would set `full_name = ''` rather than falling through to the next option or the placeholder. Not a violation of the task's literal spec (which asked for exactly this `coalesce` chain), and not something Google/typical OAuth metadata is likely to produce in practice, but worth a `nullif(..., '')`-style hardening if this becomes a real signup surface later.

## 6. No email/phone/whatsapp copied into `profiles`

**Confirmed.** Independently grepped the file for `email|phone|whatsapp|user_contacts`: the only two hits are inside comment lines explicitly stating those fields must never be copied into `profiles` — not in any executable statement. No `new.email` or equivalent appears anywhere.

## 7. `user_contacts` not created by this trigger

**Confirmed.** No reference to `public.user_contacts` anywhere in the file outside the explanatory comments. The insert touches only `public.profiles`.

## 8. `security definer` + explicit `search_path`

**Confirmed, and the choice is architecturally justified, not just present.** The function is `security definer` with `set search_path = public, pg_temp`. This is necessary, not optional decoration: a trigger firing on `auth.users` insert executes outside any authenticated user's session context (there is no valid `auth.uid()` yet for the row being created), so the existing `profiles_insert_own` RLS policy (`auth.uid() = id`) cannot be satisfied by the trigger's own execution context — `security definer` is the standard, correct mechanism to let this specific, narrow function bypass that gap. The `search_path` pin follows the standard Postgres/Supabase hardening pattern for `security definer` functions (prevents search-path-hijacking via a malicious object in an earlier-resolved schema).

## 9. `ON CONFLICT` / idempotency

**Handled safely.** `on conflict (id) do nothing` — a second invocation for the same `auth.users.id` is a no-op rather than an error or an overwrite of an existing profile. The migration also does `drop trigger if exists ... ` before creating it, which is good migration-file hygiene (safe to reason about even though nothing is applied in this task).

## 10. No RLS policies created or modified

**Confirmed.** Independently grepped for `create policy|drop policy|alter policy|enable row level security|disable row level security`: zero matches. `profiles_insert_own`, `profiles_select_own`, `profiles_update_own`, and both `user_contacts` policies from `PHASE3C-001` are untouched, exactly as D17 requires (that tightening is explicitly deferred).

## 11. Forbidden identifier

**Absent.** Independently grepped the full migration file for the string formed by `profile` + `_` + `id`: zero matches. (`create_profile_for_new_user`, `create_profile_after_signup` do not contain the forbidden substring.)

## 12. No live Supabase operation attempted

**Confirmed.** Static SQL file only; no CLI command, connection string, or apply/push/reset action appears anywhere in the diff or `CODEX_SUMMARY.md`.

## 13. Verification

**Passes, independently re-run.** `npm run build`, `npx tsc --noEmit`, `npx eslint .`, and the full `powershell -ExecutionPolicy Bypass -File scripts/verify.ps1` gate (including the forbidden-string scan) were all re-run fresh for this review and all passed cleanly.

## 14. Fixes needed

**None required to approve this task.** One advisory for a future task, not this one: consider `nullif(x, '')`-style hardening of the fallback chain against empty-string metadata values (see §5).

## Summary

PHASE3D-001 correctly and completely implements the trigger half of D17: minimal `profiles` row, exact fallback chain, zero contact-data contact, `user_contacts` left entirely to onboarding, RLS left entirely alone, `security definer` used for a real architectural reason with proper hardening. Approved. The RLS-tightening half of D17 (revisiting `profiles_insert_own` now that this trigger exists) remains correctly deferred to its own future, separately-approved task.
