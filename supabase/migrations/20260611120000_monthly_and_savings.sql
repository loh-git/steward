-- Monthly entries and savings items
-- Run via Supabase SQL editor or supabase db push

-- monthly_entries: per-user per-month data
create table public.monthly_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  year integer not null,
  month integer not null,
  incomes jsonb default '[]'::jsonb,
  expenditures jsonb default '[]'::jsonb,
  savings_allocations jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, year, month)
);

alter table public.monthly_entries enable row level security;

create policy monthly_entries_select_own
  on public.monthly_entries for select
  using (user_id = auth.uid()::uuid);

create policy monthly_entries_insert_own
  on public.monthly_entries for insert
  with check (user_id = auth.uid()::uuid);

create policy monthly_entries_update_own
  on public.monthly_entries for update
  using (user_id = auth.uid()::uuid)
  with check (user_id = auth.uid()::uuid);

-- savings_items: persistent savings goals
create table public.savings_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  monthly_amount numeric not null default 0,
  start_year integer not null,
  start_month integer not null,
  end_year integer,
  end_month integer,
  current_balance numeric default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.savings_items enable row level security;

create policy savings_items_select_own
  on public.savings_items for select
  using (user_id = auth.uid()::uuid);

create policy savings_items_insert_own
  on public.savings_items for insert
  with check (user_id = auth.uid()::uuid);

create policy savings_items_update_own
  on public.savings_items for update
  using (user_id = auth.uid()::uuid)
  with check (user_id = auth.uid()::uuid);

-- triggers to update updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger monthly_entries_set_updated_at
  before update on public.monthly_entries
  for each row execute function public.set_updated_at();

create trigger savings_items_set_updated_at
  before update on public.savings_items
  for each row execute function public.set_updated_at();
