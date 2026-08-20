-- Patch: optional free-text note on a savings goal, capped at 500 characters.
alter table public.savings_goals
  add column if not exists notes text
    check (notes is null or char_length(notes) <= 500);
