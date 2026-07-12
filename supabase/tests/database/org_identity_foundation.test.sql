delete from public.organization_members
where user_id in (
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2',
  'cccccccc-cccc-4ccc-8ccc-ccccccccccc3',
  'dddddddd-dddd-4ddd-8ddd-ddddddddddd4',
  'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee5'
);

delete from public.organizations
where slug in ('org-a', 'org-b', 'invalid-org', 'duplicate-org', 'anon-org');

delete from public.profiles
where id in (
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2',
  'cccccccc-cccc-4ccc-8ccc-ccccccccccc3',
  'dddddddd-dddd-4ddd-8ddd-ddddddddddd4',
  'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee5'
);

delete from auth.users
where id in (
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2',
  'cccccccc-cccc-4ccc-8ccc-ccccccccccc3',
  'dddddddd-dddd-4ddd-8ddd-ddddddddddd4',
  'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee5'
);

begin;

select plan(55);

create function pg_temp.sqlstate_for(p_sql text)
returns text
language plpgsql
as $$
begin
  execute p_sql;
  return '00000';
exception
  when others then
    return sqlstate;
end;
$$;

create temporary table org_identity_test_ids (
  key text primary key,
  id uuid not null
) on commit drop;

grant select, insert, update, delete on org_identity_test_ids to authenticated;

select has_column('public', 'profiles', 'default_workspace', 'profiles.default_workspace exists');
select col_not_null('public', 'profiles', 'default_workspace', 'profiles.default_workspace is not null');
select col_has_default('public', 'profiles', 'default_workspace', 'profiles.default_workspace has a default');
select has_check('public', 'profiles', 'profiles has a check constraint for default_workspace');

select has_table('public', 'organizations', 'public.organizations exists');
select columns_are(
  'public',
  'organizations',
  array[
    'id',
    'name',
    'slug',
    'created_by_user_id',
    'created_at',
    'updated_at'
  ],
  'organizations has exactly the approved minimum columns'
);
select col_is_pk('public', 'organizations', 'id', 'organizations.id is primary key');
select col_is_unique('public', 'organizations', array['slug'], 'organizations.slug is unique');
select fk_ok(
  'public',
  'organizations',
  'created_by_user_id',
  'public',
  'profiles',
  'id',
  'organizations.created_by_user_id references profiles.id'
);
select has_trigger('public', 'organizations', 'organizations_set_updated_at', 'organizations has updated_at trigger');

select has_table('public', 'organization_members', 'public.organization_members exists');
select columns_are(
  'public',
  'organization_members',
  array[
    'id',
    'organization_id',
    'user_id',
    'role',
    'created_at',
    'updated_at'
  ],
  'organization_members has exactly the approved minimum columns'
);
select col_is_pk('public', 'organization_members', 'id', 'organization_members.id is primary key');
select col_is_unique(
  'public',
  'organization_members',
  array['organization_id', 'user_id'],
  'organization_members is unique per organization and user'
);
select has_check('public', 'organization_members', 'organization_members has a role check constraint');
select has_trigger(
  'public',
  'organization_members',
  'organization_members_set_updated_at',
  'organization_members has updated_at trigger'
);

select ok(
  exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'organizations'
      and c.relrowsecurity
  ),
  'organizations has row level security enabled'
);

select ok(
  exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'organization_members'
      and c.relrowsecurity
  ),
  'organization_members has row level security enabled'
);

select has_function(
  'public',
  'is_organization_member',
  array['uuid'],
  'is_organization_member helper exists'
);
select has_function(
  'public',
  'create_organization_with_owner',
  array['text', 'text'],
  'create_organization_with_owner RPC exists'
);

select ok(
  not exists (
    select 1
    from pg_policy p
    join pg_class c on c.oid = p.polrelid
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname in ('organizations', 'organization_members')
      and p.polcmd = 'a'
  ),
  'no insert policies exist on organization tables'
);

select ok(
  not exists (
    select 1
    from pg_policy p
    join pg_class c on c.oid = p.polrelid
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname in ('organizations', 'organization_members')
      and p.polcmd = 'w'
  ),
  'no update policies exist on organization tables'
);

select ok(
  not exists (
    select 1
    from pg_policy p
    join pg_class c on c.oid = p.polrelid
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname in ('organizations', 'organization_members')
      and p.polcmd = 'd'
  ),
  'no delete policies exist on organization tables'
);

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
    'authenticated',
    'authenticated',
    'org-user-a@example.invalid',
    crypt('synthetic-password-not-secret', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    jsonb_build_object('full_name', 'Organization User A'),
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2',
    'authenticated',
    'authenticated',
    'org-user-b@example.invalid',
    crypt('synthetic-password-not-secret', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    jsonb_build_object('full_name', 'Organization User B'),
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'cccccccc-cccc-4ccc-8ccc-ccccccccccc3',
    'authenticated',
    'authenticated',
    'org-user-c@example.invalid',
    crypt('synthetic-password-not-secret', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    jsonb_build_object('full_name', 'Organization User C'),
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'dddddddd-dddd-4ddd-8ddd-ddddddddddd4',
    'authenticated',
    'authenticated',
    'org-user-d@example.invalid',
    crypt('synthetic-password-not-secret', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    jsonb_build_object('full_name', 'Organization User D'),
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee5',
    'authenticated',
    'authenticated',
    'org-user-e@example.invalid',
    crypt('synthetic-password-not-secret', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    jsonb_build_object('full_name', 'Organization User E'),
    now(),
    now()
  );

select is(
  (
    select count(*)::integer
    from public.profiles
    where id in (
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
      'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2',
      'cccccccc-cccc-4ccc-8ccc-ccccccccccc3',
      'dddddddd-dddd-4ddd-8ddd-ddddddddddd4',
      'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee5'
    )
      and default_workspace = 'participant'
  ),
  5,
  'signup-created profiles default to participant workspace'
);

select is(
  pg_temp.sqlstate_for($$
    update public.profiles
    set default_workspace = 'judge'
    where id = 'cccccccc-cccc-4ccc-8ccc-ccccccccccc3'
  $$),
  '23514',
  'database rejects default_workspace outside participant and organizer'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', true);

insert into org_identity_test_ids (key, id)
select 'org_a', public.create_organization_with_owner('Organization A', 'org-a');

reset role;
select set_config('request.jwt.claim.sub', '', true);

select is(
  (
    select count(*)::integer
    from public.organizations
    where slug = 'org-a'
  ),
  1,
  'bootstrap creates exactly one organization row'
);

select is(
  (
    select count(*)::integer
    from public.organization_members organization_members
    join org_identity_test_ids ids on ids.id = organization_members.organization_id
    where ids.key = 'org_a'
      and organization_members.user_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1'
      and organization_members.role = 'owner'
  ),
  1,
  'bootstrap creates exactly one owner membership row'
);

select is(
  (
    select created_by_user_id
    from public.organizations
    where slug = 'org-a'
  ),
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1'::uuid,
  'bootstrap sets created_by_user_id to auth.uid()'
);

select is(
  pg_temp.sqlstate_for(format(
    $sql$
      insert into public.organization_members (organization_id, user_id, role)
      values (%L, 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'owner')
    $sql$,
    (select id from org_identity_test_ids where key = 'org_a')
  )),
  '23505',
  'duplicate organization membership is rejected by the unique constraint'
);

select is(
  (
    select count(*)::integer
    from public.organization_members
    where organization_id = (select id from org_identity_test_ids where key = 'org_a')
      and user_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1'
  ),
  1,
  'duplicate membership attempt leaves exactly one matching row'
);

reset role;
select set_config('request.jwt.claim.sub', '', true);
set local role anon;

select is(
  pg_temp.sqlstate_for($$
    select public.create_organization_with_owner('Anonymous Organization', 'anon-org')
  $$),
  '42501',
  'anon cannot execute create_organization_with_owner'
);

reset role;
select set_config('request.jwt.claim.sub', '', true);

select is(
  (
    select count(*)::integer
    from public.organizations
    where slug = 'anon-org'
  ),
  0,
  'anon-denied bootstrap attempt leaves no organization row'
);

select is(
  (
    select count(*)::integer
    from public.organization_members organization_members
    join public.organizations organizations
      on organizations.id = organization_members.organization_id
    where organizations.slug = 'anon-org'
  ),
  0,
  'anon-denied bootstrap attempt leaves no membership row'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2', true);

insert into org_identity_test_ids (key, id)
select 'org_b', public.create_organization_with_owner('Organization B', 'org-b');

reset role;
select set_config('request.jwt.claim.sub', '', true);

set local role authenticated;
select set_config('request.jwt.claim.sub', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2', true);

select is(
  pg_temp.sqlstate_for($$
    select public.create_organization_with_owner('Duplicate Organization', 'org-a')
  $$),
  '23505',
  'duplicate bootstrap slug fails cleanly'
);

reset role;
select set_config('request.jwt.claim.sub', '', true);

select is(
  (
    select count(*)::integer
    from public.organizations
    where slug = 'org-a'
  ),
  1,
  'duplicate slug leaves no extra organization row'
);

select is(
  (
    select count(*)::integer
    from public.organization_members organization_members
    join public.organizations organizations
      on organizations.id = organization_members.organization_id
    where organizations.slug = 'org-a'
  ),
  1,
  'duplicate slug leaves no extra membership row'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', 'cccccccc-cccc-4ccc-8ccc-ccccccccccc3', true);

select is(
  pg_temp.sqlstate_for($$
    select public.create_organization_with_owner('   ', 'invalid-org')
  $$),
  '22023',
  'blank organization name is rejected'
);

select is(
  pg_temp.sqlstate_for($$
    select public.create_organization_with_owner('Invalid Organization', '   ')
  $$),
  '22023',
  'blank organization slug is rejected'
);

reset role;
select set_config('request.jwt.claim.sub', '', true);

select is(
  (
    select count(*)::integer
    from public.organizations
    where slug = 'invalid-org'
  ),
  0,
  'invalid bootstrap inputs leave no organization row'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '', true);

select is(
  pg_temp.sqlstate_for($$
    select public.create_organization_with_owner('No Caller Organization', 'no-caller')
  $$),
  '28000',
  'authenticated role with no auth.uid is rejected clearly'
);

reset role;
select set_config('request.jwt.claim.sub', '', true);

insert into public.organization_members (organization_id, user_id, role)
select id, 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee5', 'staff'
from org_identity_test_ids
where key = 'org_a';

set local role authenticated;
select set_config('request.jwt.claim.sub', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2', true);

select is(
  pg_temp.sqlstate_for(format(
    $sql$
      insert into public.organization_members (organization_id, user_id, role)
      values (%L, 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2', 'staff')
    $sql$,
    (select id from org_identity_test_ids where key = 'org_a')
  )),
  '42501',
  'authenticated direct insert into organization_members is denied by RLS'
);

reset role;
select set_config('request.jwt.claim.sub', '', true);

set local role authenticated;
select set_config('request.jwt.claim.sub', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', true);

with updated as (
  update public.organization_members
  set role = 'admin'
  where organization_id = (select id from org_identity_test_ids where key = 'org_a')
    and user_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1'
  returning 1
)
select is(
  (select count(*)::integer from updated),
  0,
  'authenticated user cannot update their own membership role'
);

reset role;
select set_config('request.jwt.claim.sub', '', true);

select is(
  (
    select role
    from public.organization_members
    where organization_id = (select id from org_identity_test_ids where key = 'org_a')
      and user_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1'
  ),
  'owner',
  'self-promotion attempt leaves owner role unchanged'
);

update public.profiles
set default_workspace = 'organizer'
where id = 'dddddddd-dddd-4ddd-8ddd-ddddddddddd4';

set local role authenticated;
select set_config('request.jwt.claim.sub', 'dddddddd-dddd-4ddd-8ddd-ddddddddddd4', true);

select is(
  (
    select count(*)::integer
    from public.organizations
    where id = (select id from org_identity_test_ids where key = 'org_a')
  ),
  0,
  'non-member cannot read organization row'
);

select is(
  (
    select count(*)::integer
    from public.organization_members
    where organization_id = (select id from org_identity_test_ids where key = 'org_a')
  ),
  0,
  'non-member cannot read organization membership rows'
);

select is(
  (
    select count(*)::integer
    from public.organizations
  ),
  0,
  'organizer default workspace grants no organization table access without membership'
);

reset role;
select set_config('request.jwt.claim.sub', '', true);

set local role authenticated;
select set_config('request.jwt.claim.sub', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', true);

select is(
  (
    select count(*)::integer
    from public.organizations
    where id = (select id from org_identity_test_ids where key = 'org_a')
  ),
  1,
  'member can read own organization row'
);

select is(
  (
    select count(*)::integer
    from public.organization_members
    where organization_id = (select id from org_identity_test_ids where key = 'org_a')
  ),
  2,
  'member can read fellow members in own organization'
);

select is(
  (
    select count(*)::integer
    from public.organizations
    where id = (select id from org_identity_test_ids where key = 'org_b')
  ),
  0,
  'member cannot read a different organization row'
);

select is(
  (
    select count(*)::integer
    from public.organization_members
    where organization_id = (select id from org_identity_test_ids where key = 'org_b')
  ),
  0,
  'member cannot read a different organization membership roster'
);

reset role;
select set_config('request.jwt.claim.sub', '', true);

select is(
  (
    select default_workspace
    from public.profiles
    where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1'
  ),
  'participant',
  'organization owner can still have participant as default workspace'
);

select is(
  (
    select count(*)::integer
    from public.organization_members
    where user_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1'
  ),
  1,
  'default workspace and organization membership are independent'
);

select ok(
  not exists (
    with relevant_names(object_name) as (
      select c.relname
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relname in ('profiles', 'organizations', 'organization_members')

      union all

      select a.attname
      from pg_attribute a
      join pg_class c on c.oid = a.attrelid
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relname in ('profiles', 'organizations', 'organization_members')
        and a.attnum > 0
        and not a.attisdropped

      union all

      select p.proname
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public'
        and p.proname in ('is_organization_member', 'create_organization_with_owner')

      union all

      select pol.polname
      from pg_policy pol
      join pg_class c on c.oid = pol.polrelid
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relname in ('organizations', 'organization_members')
    )
    select 1
    from relevant_names
    where object_name like concat('%', 'profile', chr(95), 'id', '%')
  ),
  'organization identity objects avoid the forbidden user-reference identifier'
);

select ok(
  not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name in ('role', 'is_organizer')
  ),
  'profiles has no role or organizer authority column'
);

select ok(
  not exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in ('is_organization_member', 'create_organization_with_owner')
      and pg_get_functiondef(p.oid) like '%default_workspace%'
  ),
  'security-definer organization functions do not read default_workspace'
);

select * from finish();

rollback;
