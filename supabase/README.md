# Supabase database setup

## Apply the migration

Run the SQL in `migrations/20260520120000_profiles_and_financial_profiles.sql` against your project:

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

Row Level Security restricts all access to `auth.uid() = id` / `user_id`.

New sign-ups get an empty `profiles` row via the `on_auth_user_created` trigger.

## App behaviour

- **Save** (`/setup` → Save & continue): upserts `profiles` + `financial_profiles`, sets a short-lived `financial-input` cookie draft
- **Load** (dashboard / setup): reads Supabase first, falls back to the cookie for in-progress drafts

Ensure `.env.local` includes `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
