-- Monthly budget planner entries (incomes, outgoings, savings per month).
-- Safe to re-run: uses IF NOT EXISTS.

create table if not exists public.monthly_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  year integer not null,
  month integer not null check (month between 1 and 12),
  incomes jsonb not null default '[]'::jsonb,
  expenditures jsonb not null default '[]'::jsonb,
  savings jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, year, month)
);

create index if not exists monthly_entries_user_year_idx
  on public.monthly_entries (user_id, year);

alter table public.monthly_entries enable row level security;

drop policy if exists "monthly_entries_select_own" on public.monthly_entries;
create policy "monthly_entries_select_own"
  on public.monthly_entries for select
  using (auth.uid() = user_id);

drop policy if exists "monthly_entries_insert_own" on public.monthly_entries;
create policy "monthly_entries_insert_own"
  on public.monthly_entries for insert
  with check (auth.uid() = user_id);

drop policy if exists "monthly_entries_update_own" on public.monthly_entries;
create policy "monthly_entries_update_own"
  on public.monthly_entries for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "monthly_entries_delete_own" on public.monthly_entries;
create policy "monthly_entries_delete_own"
  on public.monthly_entries for delete
  using (auth.uid() = user_id);

drop trigger if exists monthly_entries_set_updated_at on public.monthly_entries;
create trigger monthly_entries_set_updated_at
  before update on public.monthly_entries
  for each row execute function public.set_updated_at();
