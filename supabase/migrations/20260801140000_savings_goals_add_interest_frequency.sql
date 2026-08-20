-- Patch: how often interest compounds for a savings goal (monthly vs annually).
alter table public.savings_goals
  add column if not exists interest_frequency text not null default 'annually';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'savings_goals_interest_frequency_check'
  ) then
    alter table public.savings_goals
      add constraint savings_goals_interest_frequency_check
      check (interest_frequency in ('monthly', 'annually'));
  end if;
end $$;

notify pgrst, 'reload schema';
