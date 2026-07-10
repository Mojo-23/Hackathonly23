# Claude Review — PHASE3C-001

## 1. Verdict

**APPROVE**

The migration is a clean, correctly-scoped, deny-by-default RLS draft covering exactly `profiles` and `user_contacts`, with every policy self-owned and nothing broader. One design choice (`profiles_insert_own`) is worth a deliberate human decision before the signup-trigger task lands, but it was explicitly invited by this task's own wording and reasoned about honestly in the handoff — not a defect.

## 2. Scope containment

**Held.** The new migration file was untracked, so I read it directly rather than relying on `git diff --stat` (per your instruction) — confirmed via `git status --short` (`?? supabase/migrations/20260710130000_identity_rls.sql`) and a direct read of its full contents. Diff is exactly that one file plus the standard `handoff/CODEX_SUMMARY.md` write. No `/docs` file touched (`git status --short docs/` returned nothing), no product UI, no other table, no organization/hackathon/matching schema, no auth UI, no contact-reveal function.

## 3. Exactly one new RLS migration

**Confirmed.** `find supabase/migrations -type f` lists exactly two files: `20260710120000_identity_foundation.sql` (from `PHASE3B-001`, unchanged) and the new `20260710130000_identity_rls.sql` from this task.

## 4. RLS enabled on both tables

**Confirmed by direct read.** Lines 1–2: `alter table public.profiles enable row level security;` and `alter table public.user_contacts enable row level security;`.

## 5. Policies self-owned only

**Confirmed.** All six policies (`select`/`insert`/`update` × two tables) are scoped `to authenticated` with `using`/`with check` expressions comparing against `auth.uid()` — no `to public`, no `to anon`, no `using (true)`/`with check (true)`. Independently grepped for those patterns: zero matches.

## 6. `profiles` access via `auth.uid() = id`

**Correct**, and consistent with `profiles.id` being the documented sole exception to the `user_id` naming rule. All three `profiles` policies use `auth.uid() = id`.

One design point worth surfacing, not blocking: `/docs/RLS_ACCESS_MATRIX.md`'s existing `profiles INSERT` row currently reads "❌ / trigger only" for participant — implying insertion was expected to happen via a signup trigger, not a direct self-insert RLS policy. This task's own wording explicitly anticipated this ("if you judge this is needed given a signup trigger may not exist yet; use your judgment and explain the choice") and Codex made the call transparently, with reasoning, exactly as invited. It is not a scope violation. But it does mean `profiles_insert_own` and the documented "trigger only" stance are now slightly out of sync, and a human should decide — before the signup-trigger task is scoped — whether this self-insert policy stays permanently (defense in depth alongside a trigger) or is meant to be superseded/removed once the trigger exists. Flagging as a decision point, not a fix.

## 7. `user_contacts` access via `user_id = auth.uid()`

**Correct.** All three `user_contacts` policies use `auth.uid() = user_id`, matching the naming rule and the `user_id references profiles(id)` relationship from `PHASE3B-001`.

## 8. No public `profiles` table access yet

**Confirmed.** Every `profiles` policy specifies `to authenticated`; there is no `select`/`insert`/`update` policy granted `to public` or `to anon`. The migration's own comment block states this explicitly as the intended stance, matching `/docs/RLS_ACCESS_MATRIX.md`'s note that public-safe profile reads must go through a future dedicated view/RPC, not the base table.

## 9. No public/cross-user/organizer/sponsor access to `user_contacts`

**Confirmed.** No policy on `user_contacts` references any role, table, or condition other than the row's own `user_id` matching `auth.uid()`. No organizer/sponsor/judge/mentor policy exists on either table. This matches `/docs/PRIVACY_MODEL.md`'s stance that cross-user contact access must go through an audited RPC (`get_revealed_contacts`), never a direct table grant.

## 10. No contact-reveal logic created

**Confirmed.** The migration contains only `alter table ... enable row level security` and `create policy` / `comment on policy` statements. No function, RPC, view, or trigger implementing reveal logic appears anywhere.

## 11. Forbidden identifier

**Absent.** Independently grepped the full migration file for the string formed by `profile` + `_` + `id`: zero matches. (Policy names like `profiles_select_own`, `profiles_insert_own` do not contain the forbidden substring.)

## 12. No live Supabase operation attempted

**Confirmed.** This is a static SQL file under `supabase/migrations/`; nothing in the diff or `CODEX_SUMMARY.md`'s verification section references a CLI command, connection string, or apply/push/reset action.

## 13. Absence of `DELETE` policies

**Intentional and acceptable for this phase.** Both tables have no `delete` policy — meaning no role (not even the owner) can delete rows directly under RLS as currently drafted; deletion would have to go through a future, separately-approved account-deletion flow (consistent with `/docs/PRIVACY_MODEL.md` §8's stated retention/deletion approach: anonymization, not a raw client-side delete). Codex stated this choice explicitly in the handoff rather than leaving it ambiguous, exactly as the task required.

## 14. Verification

**Passes, independently re-run.** `npm run build`, `npx tsc --noEmit`, `npx eslint .`, and the full `powershell -ExecutionPolicy Bypass -File scripts/verify.ps1` gate (including the forbidden-string scan, which now also covers the `supabase/` directory) were all re-run fresh for this review and all passed cleanly.

## 15. Fixes needed

**None required to approve this task.** One item to carry forward as a human decision, not a code fix: confirm before the signup-trigger task is scoped whether `profiles_insert_own` should remain alongside a future trigger or be reconsidered at that point — see §6.

## Summary

PHASE3C-001 delivers a correctly deny-by-default RLS draft for exactly the two approved tables, with no scope creep into reveal logic, organizer/sponsor access, or any other table. Approved. Carry the `profiles_insert_own` vs. signup-trigger question into the next identity-related task as an explicit decision, not a silent default.
