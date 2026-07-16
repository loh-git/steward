-- Create recurring_expenses table for the recurring budget UI.
-- This migration is safe to re-run and includes the columns used by the app.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

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

create index if not exists recurring_expenses_user_created_idx
  on public.recurring_expenses (user_id, created_at);

alter table public.recurring_expenses enable row level security;

grant usage on schema public to authenticated;
grant all on table public.recurring_expenses to authenticated;

drop policy if exists "recurring_expenses_select_own" on public.recurring_expenses;
create policy "recurring_expenses_select_own"
  on public.recurring_expenses for select
  using (auth.uid() = user_id);

drop policy if exists "recurring_expenses_insert_own" on public.recurring_expenses;
create policy "recurring_expenses_insert_own"
  on public.recurring_expenses for insert
  with check (auth.uid() = user_id);

drop policy if exists "recurring_expenses_update_own" on public.recurring_expenses;
create policy "recurring_expenses_update_own"
  on public.recurring_expenses for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "recurring_expenses_delete_own" on public.recurring_expenses;
create policy "recurring_expenses_delete_own"
  on public.recurring_expenses for delete
  using (auth.uid() = user_id);

drop trigger if exists recurring_expenses_set_updated_at on public.recurring_expenses;
create trigger recurring_expenses_set_updated_at
  before update on public.recurring_expenses
  for each row execute function public.set_updated_at();
