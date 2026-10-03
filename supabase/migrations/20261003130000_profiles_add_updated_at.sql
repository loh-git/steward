-- The profiles_set_updated_at / financial_profiles_set_updated_at triggers (restored in
-- 20260520120000_profiles_and_financial_profiles.sql) assign new.updated_at on every UPDATE.
-- Databases whose profiles tables were created by hand before that migration existed can lack the
-- column, which makes every update fail with: record "new" has no field "updated_at".
-- Adding it is a no-op where it already exists.

alter table public.profiles
  add column if not exists updated_at timestamptz not null default now();

alter table public.financial_profiles
  add column if not exists updated_at timestamptz not null default now();
