-- Patch: add missing columns to monthly_entries (safe if table was created earlier without them).
-- Run in Supabase SQL Editor if you see "Could not find the 'savings' column" errors.

alter table public.monthly_entries
  add column if not exists savings jsonb not null default '[]'::jsonb;

alter table public.monthly_entries
  add column if not exists take_home_salary numeric(12, 2);

-- Reload PostgREST schema cache (Supabase usually picks this up within seconds).
notify pgrst, 'reload schema';
