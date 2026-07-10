-- public.profiles rows are now created exclusively by create_profile_for_new_user,
-- so the temporary self-insert policy is no longer needed.
drop policy profiles_insert_own on public.profiles;
