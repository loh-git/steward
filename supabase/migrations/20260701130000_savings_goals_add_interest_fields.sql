alter table public.savings_goals
  add column if not exists current_balance numeric(12, 2) not null default 0,
  add column if not exists earns_interest boolean not null default false,
  add column if not exists interest_rate numeric(5, 2) not null default 0,
  add column if not exists uses_variable_amount boolean not null default false; 