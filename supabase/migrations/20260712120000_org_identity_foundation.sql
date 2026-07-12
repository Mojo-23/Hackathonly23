alter table public.profiles
add column default_workspace text not null default 'participant',
add constraint profiles_default_workspace_known
  check (default_workspace in ('participant', 'organizer'));

comment on column public.profiles.default_workspace is
  'Preference-only default landing workspace. Grants no authority and must never be used by RLS or security-definer authorization checks.';

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  created_by_user_id uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint organizations_slug_unique unique (slug)
);

comment on table public.organizations is
  'Minimum organization identity foundation. Branding, verification, billing, settings, and invite lifecycle fields are future work.';

create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint organization_members_role_known
    check (role in ('owner', 'admin', 'staff')),
  constraint organization_members_organization_id_user_id_unique
    unique (organization_id, user_id)
);

comment on table public.organization_members is
  'Organization-scoped organizer capability. Every membership row is active; invite and pending lifecycle fields are future work.';

create trigger organizations_set_updated_at
before update on public.organizations
for each row
execute function public.set_updated_at();

create trigger organization_members_set_updated_at
before update on public.organization_members
for each row
execute function public.set_updated_at();
