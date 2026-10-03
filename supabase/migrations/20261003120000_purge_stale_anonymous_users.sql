-- Demo visitors sign in anonymously and get a seeded sample account. Supabase never cleans those
-- up itself, so delete them (and, via ON DELETE CASCADE, their profile and every child row) a
-- week after creation.
--
-- The is_anonymous filter matters: an anonymous user who later converts to a real account has
-- is_anonymous = false and must never be touched.
--
-- If `supabase db push` can't create the extension, enable pg_cron in Dashboard > Database >
-- Extensions and run the cron.schedule statement below in the SQL editor instead.

create extension if not exists pg_cron with schema pg_catalog;

-- cron.schedule upserts by job name, so re-running this replaces the job rather than duplicating it.
select cron.schedule(
  'purge-stale-anonymous-users',
  '15 3 * * *',
  $$
    delete from auth.users
    where id in (
      select id
      from auth.users
      where is_anonymous is true
        and created_at < now() - interval '7 days'
      limit 5000
    )
  $$
);
