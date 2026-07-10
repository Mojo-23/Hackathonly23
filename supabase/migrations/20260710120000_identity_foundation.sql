create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id),
  full_name text not null,
  university text,
  major text,
  graduation_year integer,
  governorate text,
  city text,
  bio text,
  github_url text,
  linkedin_url text,
  portfolio_url text,
  experience_level text,
  primary_role text,
  looking_for_team boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint profiles_graduation_year_bounds
    check (graduation_year is null or graduation_year between 1900 and 2100),
  constraint profiles_experience_level_known
    check (
      experience_level is null
      or experience_level in ('beginner', 'intermediate', 'advanced')
    ),
  constraint profiles_primary_role_known
    check (
      primary_role is null
      or primary_role in (
        'frontend',
        'backend',
        'fullstack',
        'mobile',
        'ai_ml',
        'data',
        'design',
        'product',
        'business',
        'cyber',
        'hardware'
      )
    )
);

comment on table public.profiles is
  'Identity and display profile data. This table intentionally contains no email, phone, WhatsApp, or other private contact fields.';
comment on column public.profiles.id is
  'References auth.users(id). This is the only allowed exception to the project-wide user_id naming rule.';

create table public.user_contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  email text,
  phone text,
  whatsapp text,
  preferred_contact_method text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint user_contacts_user_id_unique unique (user_id),
  constraint user_contacts_email_shape
    check (email is null or position('@' in email) > 1),
  constraint user_contacts_preferred_contact_method_known
    check (
      preferred_contact_method is null
      or preferred_contact_method in ('email', 'phone', 'whatsapp')
    )
);

comment on table public.user_contacts is
  'Private P3 contact data. Never expose this table publicly; future contact-reveal reads must use user_contacts, never profiles.';

create index profiles_university_idx on public.profiles (university);

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create trigger user_contacts_set_updated_at
before update on public.user_contacts
for each row
execute function public.set_updated_at();
