# Codex Summary

## Task
`PHASE3B-001`

## What changed
- Added one draft Supabase migration: `supabase/migrations/20260710120000_identity_foundation.sql`.
- Created `public.profiles` for identity/display data only:
  - `id uuid primary key references auth.users(id)`
  - `full_name`, university/education/location fields, bio/link fields, role/experience fields, `looking_for_team`, and timestamps.
  - No contact fields exist on `profiles`.
- Created `public.user_contacts` for private contact data:
  - `user_id uuid not null references public.profiles(id) on delete cascade`
  - `email`, `phone`, `whatsapp`, `preferred_contact_method`, and timestamps.
  - A unique constraint enforces one contact row per user. That unique constraint also provides the indexed lookup path for `user_id`.
- Added a shared `public.set_updated_at()` trigger function and update triggers for both tables.
- Added comments documenting that `profiles` is display data and that private contact reads must come from `user_contacts`, not `profiles`.

I used check constraints rather than Postgres enum types for `experience_level`, `primary_role`, and `preferred_contact_method`. That keeps this first draft simple and easy to change before the schema is ever applied; Claude/human can still standardize on enum types in a later approved migration task if desired.

## Files touched
- `supabase/migrations/20260710120000_identity_foundation.sql`
- `handoff/CODEX_SUMMARY.md`

## Verification
- Manual SQL sanity read: passed.
- Confirmed no RLS enablement or policy statements were added.
- Confirmed no live Supabase command was run.
- `powershell -ExecutionPolicy Bypass -File scripts/verify.ps1`: passed.
  - `npm run build`: OK
  - `npx tsc --noEmit`: OK
  - `npx eslint .`: OK
  - forbidden naming scan: OK

## Deviations
- None from the task scope. No docs, workflow files, scripts, UI, auth code, RLS policy, contact-reveal function, or live database operation was added.

## Open questions
- `/docs/DATABASE.md` still documents the older shape with contact data inline on `profiles`. This task explicitly approved the migration-only divergence and kept `/docs` read-only, so Claude/human should reconcile the doc in a separate dedicated step.
