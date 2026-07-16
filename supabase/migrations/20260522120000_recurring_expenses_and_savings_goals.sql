-- Recurring expenses and savings goals (pre-populate monthly planner).

create table if not exists public.recurring_expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  label text not null,
  amount numeric(12, 2) not null check (amount >= 0),
  starts_from_year integer,
  starts_from_month integer check (starts_from_month between 1 and 12),
  ends_until_year integer,
  ends_until_month integer check (ends_until_month between 1 and 12),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  label text not null,
  amount numeric(12, 2) not null check (amount >= 0),
  starts_from_year integer,
  starts_from_month integer check (starts_from_month between 1 and 12),
  ends_until_year integer,
  ends_until_month integer check (ends_until_month between 1 and 12),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.recurring_expenses enable row level security;
alter table public.savings_goals enable row level security;

drop policy if exists "recurring_expenses_select_own" on public.recurring_expenses;
create policy "recurring_expenses_select_own"
  on public.recurring_expenses for select using (auth.uid() = user_id);
drop policy if exists "recurring_expenses_insert_own" on public.recurring_expenses;
create policy "recurring_expenses_insert_own"
  on public.recurring_expenses for insert with check (auth.uid() = user_id);
drop policy if exists "recurring_expenses_update_own" on public.recurring_expenses;
create policy "recurring_expenses_update_own"
  on public.recurring_expenses for update using (auth.uid() = user_id);
drop policy if exists "recurring_expenses_delete_own" on public.recurring_expenses;
create policy "recurring_expenses_delete_own"
  on public.recurring_expenses for delete using (auth.uid() = user_id);

drop policy if exists "savings_goals_select_own" on public.savings_goals;
create policy "savings_goals_select_own"
  on public.savings_goals for select using (auth.uid() = user_id);
drop policy if exists "savings_goals_insert_own" on public.savings_goals;
create policy "savings_goals_insert_own"
  on public.savings_goals for insert with check (auth.uid() = user_id);
drop policy if exists "savings_goals_update_own" on public.savings_goals;
create policy "savings_goals_update_own"
  on public.savings_goals for update using (auth.uid() = user_id);
drop policy if exists "savings_goals_delete_own" on public.savings_goals;
create policy "savings_goals_delete_own"
  on public.savings_goals for delete using (auth.uid() = user_id);

drop trigger if exists recurring_expenses_set_updated_at on public.recurring_expenses;
create trigger recurring_expenses_set_updated_at
  before update on public.recurring_expenses
  for each row execute function public.set_updated_at();

drop trigger if exists savings_goals_set_updated_at on public.savings_goals;
create trigger savings_goals_set_updated_at
  before update on public.savings_goals
  for each row execute function public.set_updated_at();

-- Optional: store per-month take-home override on monthly_entries
alter table public.monthly_entries
  add column if not exists take_home_salary numeric(12, 2);
