create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  -- Per D17, onboarding creates public.user_contacts through the user's own policy.
  -- This signup trigger only creates identity/display data needed by public.profiles.
  -- Contact data such as email, phone, and whatsapp must never be copied into
  -- public.profiles by this trigger or any future version of it.
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'display_name',
      'New participant'
    )
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists create_profile_after_signup on auth.users;

create trigger create_profile_after_signup
after insert on auth.users
for each row
execute function public.create_profile_for_new_user();
