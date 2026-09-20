# Steward

A ledger for UK take-home pay and monthly budgeting — built because I was tired of guessing my real take-home pay from gross salary and maintaining a spreadsheet to plan around it.

## Disclaimer

I am not qualified to give financial advice, and this app cannot be guaranteed to be 100% correct.

## What it does

Steward calculates what UK earners actually take home after tax, National Insurance, pension, and student loan deductions, then lets you plan a monthly budget — income, recurring expenses, and savings goals — around that real number instead of the gross figure on your contract.

The two halves are treated as equally important, not one bolted onto the other:

- **Payroll accuracy** — England/Wales/NI and Scottish income tax bands, non-standard tax codes (BR, D0, D1, NT, K-codes), the >£100k personal allowance taper, multiple pension schemes (auto-enrolment, salary sacrifice, employer, personal) including qualifying-earnings banding, and every current UK student loan plan (1, 2, 4 Scotland, 5, postgraduate). Tax-year boundaries (6 April, not 1 January) are resolved per calendar month, so a "2026" yearly view correctly spans two real tax years instead of applying one flat rate to all twelve.
- **Planning flexibility** — recurring expenses and savings goals auto-populate every applicable month they apply to (including custom recurrence, e.g. "every 3 months," not just monthly), but any individual month can override the amount, add a one-off note, or zero it out entirely without touching the underlying recurring definition or losing it for every other month.

A few other things worth a look if you're skimming the code:

- Savings goals project a month-by-month balance forward to their own end date, compounding interest monthly or annually depending on the goal.
- Salary history is tracked as closed date windows, so a pay rise applies from a specified month onward while past months keep reflecting what you actually earned then — not a single flat number retroactively applied everywhere.
- The setup flow is a fully animated multi-step wizard (Motion/Framer Motion) rather than one long form, with free-jump navigation between steps.
- A custom UI design ("The Working Ledger" — vintage, confident) rather than an off-the-shelf UI kit.

## Tech stack

- **Next.js 16** (App Router, Server Components, Server Actions) + **React 19** + **TypeScript**
- **Supabase** (Postgres + Auth) with Row Level Security on every user-scoped table
- **Tailwind CSS v4** for styling, **Motion** for the setup wizard's animation, **Recharts** for the dashboard trend chart

## Status

Actively developed, currently exercised with test data rather than a live user base. Tax years beyond what HMRC has officially published (e.g. the far end of 2026/27) use my own frozen/projected estimates, clearly not guaranteed-accurate government figures.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll need a Supabase project for the schema/migrations and required environment variables.
