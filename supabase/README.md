# Supabase database setup

## Apply the migration

Run the SQL in `migrations/` against your project in order (profiles, financial_profiles, monthly_entries, recurring/savings goals, then any patch migrations):

1. Open the [Supabase Dashboard](https://supabase.com/dashboard) → your project → **SQL Editor**
2. Paste the migration file contents and **Run**

Or, if you use the Supabase CLI locally:

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

## Tables

| Table | Purpose |
|-------|---------|
| `profiles` | One row per `auth.users` id — name, date of birth |
| `financial_profiles` | One row per user — full calculation payload as `jsonb` |
| `monthly_entries` | Per-month incomes, outgoings, and savings (`jsonb` arrays) |

Row Level Security restricts all access to `auth.uid() = id` / `user_id`.

New sign-ups get an empty `profiles` row via the `on_auth_user_created` trigger.

## App behaviour

- **Save** (`/setup` → Save & continue): upserts `profiles` + `financial_profiles`, sets a short-lived `financial-input` cookie draft
- **Load** (dashboard / setup): reads Supabase first, falls back to the cookie for in-progress drafts

Ensure `.env.local` includes `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

## Troubleshooting

If saving monthly entries fails with **"Could not find the 'savings' column of 'monthly_entries'"**, your table was created before the savings column was added. Inspect columns:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'monthly_entries'
ORDER BY ordinal_position;
```

Then run `migrations/20260523120000_monthly_entries_add_savings_column.sql` in the SQL Editor (safe to re-run — uses `IF NOT EXISTS`).
