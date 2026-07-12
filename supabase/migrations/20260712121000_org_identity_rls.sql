alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;

grant select, insert, update on public.organizations to authenticated;
grant select, insert, update on public.organization_members to authenticated;

create or replace function public.is_organization_member(p_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.organization_members organization_members
    where organization_members.organization_id = p_organization_id
      and organization_members.user_id = auth.uid()
  );
$$;

comment on function public.is_organization_member(uuid) is
  'RLS helper for organization-scoped reads. Uses auth.uid() and organization_members only; does not read workspace preferences.';

revoke all on function public.is_organization_member(uuid) from public;
grant execute on function public.is_organization_member(uuid) to authenticated;

create policy organizations_select_members
on public.organizations
for select
to authenticated
using (public.is_organization_member(id));

comment on policy organizations_select_members on public.organizations is
  'Organization rows are visible only to authenticated users who are members of that specific organization.';

create policy organization_members_select_same_organization
on public.organization_members
for select
to authenticated
using (public.is_organization_member(organization_id));

comment on policy organization_members_select_same_organization on public.organization_members is
  'Members may read membership rows only for organizations where they have their own membership row.';
