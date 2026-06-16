-- Profiles (1:1 with auth.users) and financial_profiles (1:1 with profiles).
-- Run via Supabase SQL editor or: supabase db push

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text not null default '',
  last_name text not null default '',
  date_of_birth date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- financial_profiles
-- ---------------------------------------------------------------------------
create table public.financial_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  tax_year text not null default '2026/27',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index financial_profiles_user_id_idx on public.financial_profiles (user_id);

alter table public.financial_profiles enable row level security;

create policy "financial_profiles_select_own"
  on public.financial_profiles for select
  using (auth.uid() = user_id);

create policy "financial_profiles_insert_own"
  on public.financial_profiles for insert
  with check (auth.uid() = user_id);

create policy "financial_profiles_update_own"
  on public.financial_profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger financial_profiles_set_updated_at
  before update on public.financial_profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- auto-create profile on sign-up
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profiles for existing auth users (safe to re-run)
insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;
