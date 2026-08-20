-- Patch: add optional note explaining a per-month take-home override.
alter table public.monthly_entries
  add column if not exists take_home_salary_note text;

notify pgrst, 'reload schema';
