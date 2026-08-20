-- Closed historical windows of salary/tax-code/pension changes.
-- Every row represents a PAST period that has definitively ended; the live
-- financial_profiles.payload always holds "what applies now and going forward".

create table if not exists public.salary_changes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  annual_income numeric(12, 2) not null check (annual_income >= 0),
  tax_code text not null,
  pension jsonb not null,
  effective_from_year integer,
  effective_from_month integer check (effective_from_month between 1 and 12),
  ends_until_year integer not null,
  ends_until_month integer not null check (ends_until_month between 1 and 12),
  created_at timestamptz not null default now(),
  -- effective_from_year/month must be both-null or both-set, never one-only
  check ((effective_from_year is null) = (effective_from_month is null)),
  -- when set, the window must not be inverted
  check (
    effective_from_year is null
    or (effective_from_year * 12 + effective_from_month)
       <= (ends_until_year * 12 + ends_until_month)
  )
);

create index if not exists salary_changes_user_ends_idx
  on public.salary_changes (user_id, ends_until_year desc, ends_until_month desc);

alter table public.salary_changes enable row level security;

grant usage on schema public to authenticated;
grant all on table public.salary_changes to authenticated;

drop policy if exists "salary_changes_select_own" on public.salary_changes;
create policy "salary_changes_select_own"
  on public.salary_changes for select
  using (auth.uid() = user_id);

drop policy if exists "salary_changes_insert_own" on public.salary_changes;
create policy "salary_changes_insert_own"
  on public.salary_changes for insert
  with check (auth.uid() = user_id);

drop policy if exists "salary_changes_delete_own" on public.salary_changes;
create policy "salary_changes_delete_own"
  on public.salary_changes for delete
  using (auth.uid() = user_id);
