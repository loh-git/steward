
alter table public.savings_goals enable row level security;

grant usage on schema public to authenticated;
grant all on table public.savings_goals to authenticated;

drop policy if exists "savings_goals_select_own" on public.savings_goals;
create policy "savings_goals_select_own"
  on public.savings_goals for select
  using (auth.uid() = user_id);

drop policy if exists "savings_goals_insert_own" on public.savings_goals;
create policy "savings_goals_insert_own"
  on public.savings_goals for insert
  with check (auth.uid() = user_id);

drop policy if exists "savings_goals_update_own" on public.savings_goals;
create policy "savings_goals_update_own"
  on public.savings_goals for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "savings_goals_delete_own" on public.savings_goals;
create policy "savings_goals_delete_own"
  on public.savings_goals for delete
  using (auth.uid() = user_id);

drop trigger if exists savings_goals_set_updated_at on public.savings_goals;
create trigger savings_goals_set_updated_at
  before update on public.savings_goals
  for each row execute function public.set_updated_at();
