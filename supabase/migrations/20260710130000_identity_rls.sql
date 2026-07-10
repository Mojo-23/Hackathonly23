alter table public.profiles enable row level security;
alter table public.user_contacts enable row level security;

-- Privacy stance for this migration:
-- - profiles has no public read policy yet; future public-safe profile reads require a separately approved safe view or RPC.
-- - user_contacts has no cross-user read policy; future contact reveal must use a separately approved, audited RPC.
-- - organizer, sponsor, talent, judge, and mentor access is intentionally not implemented here.

create policy profiles_select_own
on public.profiles
for select
to authenticated
using (auth.uid() = id);

comment on policy profiles_select_own on public.profiles is
  'Users can read only their own full profile row. No public, organizer, sponsor, talent, judge, mentor, or cross-user access is granted here.';

create policy profiles_insert_own
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

comment on policy profiles_insert_own on public.profiles is
  'Users can insert only their own profile row. This keeps onboarding possible until a signup trigger is separately approved and implemented.';

create policy profiles_update_own
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

comment on policy profiles_update_own on public.profiles is
  'Users can update only their own profile row. No delete policy is added in this migration.';

create policy user_contacts_select_own
on public.user_contacts
for select
to authenticated
using (auth.uid() = user_id);

comment on policy user_contacts_select_own on public.user_contacts is
  'Users can read only their own contact row. Cross-user contact reads are never granted by table policy.';

create policy user_contacts_insert_own
on public.user_contacts
for insert
to authenticated
with check (auth.uid() = user_id);

comment on policy user_contacts_insert_own on public.user_contacts is
  'Users can insert only their own contact row. Organizer, sponsor, talent, judge, mentor, and reveal access are explicitly future separately approved work.';

create policy user_contacts_update_own
on public.user_contacts
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

comment on policy user_contacts_update_own on public.user_contacts is
  'Users can update only their own contact row. No delete policy is added in this migration.';
