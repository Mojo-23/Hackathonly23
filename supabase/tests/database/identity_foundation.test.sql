-- Remove only this test's synthetic row if a prior local run was interrupted.
delete from public.user_contacts
where user_id = '11111111-1111-4111-8111-111111111111';

delete from public.profiles
where id = '11111111-1111-4111-8111-111111111111';

delete from auth.users
where id = '11111111-1111-4111-8111-111111111111';

begin;

select plan(25);

-- Identity tables must exist because profiles hold display data and user_contacts holds P3 contact data.
select has_table('public', 'profiles', 'public.profiles exists');
select has_table('public', 'user_contacts', 'public.user_contacts exists');

-- Contact data must never leak into profiles; see PRIVACY_MODEL.md section 1.
select hasnt_column('public', 'profiles', 'email', 'profiles has no email column');
select hasnt_column('public', 'profiles', 'phone', 'profiles has no phone column');
select hasnt_column('public', 'profiles', 'whatsapp', 'profiles has no whatsapp column');
select ok(
  not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and lower(column_name) ~ '(email|phone|whatsapp|contact)'
  ),
  'profiles has no contact-shaped columns'
);

-- Private contact fields belong in user_contacts, not profiles.
select has_column('public', 'user_contacts', 'email', 'user_contacts has email column');
select has_column('public', 'user_contacts', 'phone', 'user_contacts has phone column');
select has_column('public', 'user_contacts', 'whatsapp', 'user_contacts has whatsapp column');

-- RLS must be enabled on both identity tables so self-owned policies are enforceable.
select ok(
  exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'profiles'
      and c.relrowsecurity
  ),
  'profiles has row level security enabled'
);

select ok(
  exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'user_contacts'
      and c.relrowsecurity
  ),
  'user_contacts has row level security enabled'
);

-- Self-owned policies are the only identity-table access added by the approved RLS migration.
select ok(
  exists (
    select 1
    from pg_policy p
    join pg_class c on c.oid = p.polrelid
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'profiles'
      and p.polname = 'profiles_select_own'
      and p.polcmd = 'r'
  ),
  'profiles_select_own policy exists for select'
);

select ok(
  exists (
    select 1
    from pg_policy p
    join pg_class c on c.oid = p.polrelid
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'profiles'
      and p.polname = 'profiles_insert_own'
      and p.polcmd = 'a'
  ),
  'profiles_insert_own policy exists for insert'
);

select ok(
  exists (
    select 1
    from pg_policy p
    join pg_class c on c.oid = p.polrelid
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'profiles'
      and p.polname = 'profiles_update_own'
      and p.polcmd = 'w'
  ),
  'profiles_update_own policy exists for update'
);

select ok(
  exists (
    select 1
    from pg_policy p
    join pg_class c on c.oid = p.polrelid
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'user_contacts'
      and p.polname = 'user_contacts_select_own'
      and p.polcmd = 'r'
  ),
  'user_contacts_select_own policy exists for select'
);

select ok(
  exists (
    select 1
    from pg_policy p
    join pg_class c on c.oid = p.polrelid
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'user_contacts'
      and p.polname = 'user_contacts_insert_own'
      and p.polcmd = 'a'
  ),
  'user_contacts_insert_own policy exists for insert'
);

select ok(
  exists (
    select 1
    from pg_policy p
    join pg_class c on c.oid = p.polrelid
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'user_contacts'
      and p.polname = 'user_contacts_update_own'
      and p.polcmd = 'w'
  ),
  'user_contacts_update_own policy exists for update'
);

-- The signup trigger function must exist before auth.users can create a minimal profile row.
select ok(
  exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'create_profile_for_new_user'
      and p.pronargs = 0
      and p.prorettype = 'trigger'::regtype
  ),
  'create_profile_for_new_user trigger function exists'
);

-- The auth.users trigger must be wired to the approved function so signup creates identity only.
select ok(
  exists (
    select 1
    from pg_trigger t
    join pg_class c on c.oid = t.tgrelid
    join pg_namespace n on n.oid = c.relnamespace
    join pg_proc p on p.oid = t.tgfoid
    join pg_namespace pn on pn.oid = p.pronamespace
    where n.nspname = 'auth'
      and c.relname = 'users'
      and t.tgname = 'create_profile_after_signup'
      and not t.tgisinternal
      and pn.nspname = 'public'
      and p.proname = 'create_profile_for_new_user'
  ),
  'auth.users signup trigger is wired to create_profile_for_new_user'
);

-- A synthetic signup must create exactly one profile with a display name and no contact row.
insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  phone,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-4111-8111-111111111111',
  'authenticated',
  'authenticated',
  'test-signup-001@example.invalid',
  '+15550101001',
  crypt('synthetic-password-not-secret', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  jsonb_build_object(
    'full_name', 'Synthetic Signup Tester',
    'phone', '+15550101001',
    'whatsapp', '+15550101002'
  ),
  now(),
  now()
);

select is(
  (
    select count(*)::integer
    from public.profiles
    where id = '11111111-1111-4111-8111-111111111111'
  ),
  1,
  'signup creates exactly one profile row for the auth user'
);

select ok(
  (
    select full_name is not null and length(full_name) > 0
    from public.profiles
    where id = '11111111-1111-4111-8111-111111111111'
  ),
  'signup profile has a non-null full_name'
);

select is(
  (
    select full_name
    from public.profiles
    where id = '11111111-1111-4111-8111-111111111111'
  ),
  'Synthetic Signup Tester',
  'signup profile full_name comes from auth metadata'
);

select is(
  (
    select count(*)::integer
    from public.user_contacts
    where user_id = '11111111-1111-4111-8111-111111111111'
  ),
  0,
  'signup does not create a user_contacts row'
);

-- Contact values supplied by auth must not appear anywhere in the resulting profile row.
select ok(
  not exists (
    select 1
    from public.profiles p
    where p.id = '11111111-1111-4111-8111-111111111111'
      and row_to_json(p)::text like any (
        array[
          '%test-signup-001@example.invalid%',
          '%+15550101001%',
          '%+15550101002%'
        ]
      )
  ),
  'signup profile contains none of the synthetic contact values'
);

-- Identity migration objects must not introduce the forbidden user-reference identifier.
select ok(
  not exists (
    with relevant_names(object_name) as (
      select c.relname
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname in ('public', 'auth')
        and c.relname in ('profiles', 'user_contacts', 'users')

      union all

      select a.attname
      from pg_attribute a
      join pg_class c on c.oid = a.attrelid
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relname in ('profiles', 'user_contacts')
        and a.attnum > 0
        and not a.attisdropped

      union all

      select p.proname
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public'
        and p.proname in ('set_updated_at', 'create_profile_for_new_user')

      union all

      select t.tgname
      from pg_trigger t
      join pg_class c on c.oid = t.tgrelid
      join pg_namespace n on n.oid = c.relnamespace
      where not t.tgisinternal
        and (
          (n.nspname = 'public' and c.relname in ('profiles', 'user_contacts'))
          or (n.nspname = 'auth' and c.relname = 'users')
        )

      union all

      select p.polname
      from pg_policy p
      join pg_class c on c.oid = p.polrelid
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relname in ('profiles', 'user_contacts')
    )
    select 1
    from relevant_names
    where object_name like concat('%', 'profile', chr(95), 'id', '%')
  ),
  'identity migration object names avoid the forbidden user-reference identifier'
);

select * from finish();

rollback;
