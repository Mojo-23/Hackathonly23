create or replace function public.create_organization_with_owner(
  p_name text,
  p_slug text
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_name text := nullif(btrim(p_name), '');
  v_slug text := nullif(btrim(p_slug), '');
  v_organization_id uuid;
begin
  if v_user_id is null then
    raise exception 'authentication_required'
      using errcode = '28000';
  end if;

  if v_name is null then
    raise exception 'organization_name_required'
      using errcode = '22023';
  end if;

  if v_slug is null then
    raise exception 'organization_slug_required'
      using errcode = '22023';
  end if;

  insert into public.organizations (name, slug, created_by_user_id)
  values (v_name, v_slug, v_user_id)
  returning id into v_organization_id;

  insert into public.organization_members (organization_id, user_id, role)
  values (v_organization_id, v_user_id, 'owner');

  return v_organization_id;
exception
  when unique_violation then
    raise exception 'organization_slug_already_exists'
      using errcode = '23505';
end;
$$;

comment on function public.create_organization_with_owner(text, text) is
  'Atomically creates an organization and an owner membership for auth.uid(). Returns the organization id.';

revoke all on function public.create_organization_with_owner(text, text) from public;
grant execute on function public.create_organization_with_owner(text, text) to authenticated;
