-- Patch: how often a recurring expense recurs, in months (1 = every month, the
-- existing/default behaviour). Anchored to starts_from (or created_at if unset).
alter table public.recurring_expenses
  add column if not exists interval_months integer not null default 1
    check (interval_months >= 1);
