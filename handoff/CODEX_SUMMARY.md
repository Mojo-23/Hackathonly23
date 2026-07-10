# Codex Summary - PHASE3D-001

## What changed

Drafted one new SQL migration:

- `supabase/migrations/20260710140000_signup_profile_trigger.sql`

The migration creates `public.create_profile_for_new_user()` and wires it to an `after insert` trigger on `auth.users`.

The function inserts only `id` and `full_name` into `public.profiles`, leaving all other profile columns at their defaults or `null`.

Implemented `full_name` fallback chain, in D17/task order:

1. `new.raw_user_meta_data->>'full_name'`
2. `new.raw_user_meta_data->>'name'`
3. `new.raw_user_meta_data->>'display_name'`
4. `'New participant'`

No email, phone, whatsapp, or other contact-shaped field is read from `auth.users` or copied into `public.profiles`.

`public.user_contacts` is untouched by the trigger. The SQL comments explicitly state that onboarding owns contact-row creation and that contact data must never be copied into `public.profiles`.

## Security and idempotency

Used `security definer` because the trigger runs from the `auth.users` insert path and must be able to create the self-owned `public.profiles` row despite the current authenticated-user RLS policy shape. The function pins its search path with:

```sql
set search_path = public, pg_temp
```

The insert uses:

```sql
on conflict (id) do nothing
```

This makes the trigger safe if it is invoked more than once for the same auth user id, without overwriting an existing profile row.

## Files touched

- `supabase/migrations/20260710140000_signup_profile_trigger.sql`
- `handoff/CODEX_SUMMARY.md`

## Verification

Manual SQL sanity check:

- Confirmed the migration creates one function and one `after insert on auth.users` trigger.
- Confirmed the fallback chain matches the task exactly.
- Confirmed no RLS policy is created, dropped, or modified.
- Confirmed no Supabase CLI command or live database connection was attempted.

Ran:

- `powershell -ExecutionPolicy Bypass -File scripts/verify.ps1` - passed.

The verification script passed all steps:

- `npm run build`
- `npx tsc --noEmit`
- `npx eslint .`
- forbidden identifier scan

## Deviations

None.

## Open questions

None. No RLS tightening was attempted; that remains deferred to a separately approved task.
