# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

UK employees/earners who want to know their real take-home pay and plan a monthly budget around it. Currently the developer's own finances (used as live test data during development), with the explicit intent to open the product to other UK earners over time — not scoped as a personal-only tool.

## Product Purpose

Steward helps UK earners understand their true take-home pay after tax, National Insurance, pension, and student loan deductions, and plan a monthly budget — income, recurring expenses, and savings goals — around that real number, instead of guessing from gross salary or maintaining a spreadsheet.

## Positioning

Accurate UK-specific payroll calculation and flexible monthly budget planning are equally central — neither is the "real" product with the other bolted on:

- **Payroll accuracy**: England/Wales/NI and Scottish tax bands, non-standard tax codes (BR, D0, D1, NT, K-codes), the >£100k personal allowance taper, multiple pension schemes (auto-enrolment, salary sacrifice, employer, personal) including qualifying-earnings banding, and all current student loan plans (1, 2, 4 Scotland, 5, postgraduate).
- **Planning flexibility**: recurring expenses and savings goals auto-populate every applicable month, but any individual month can override the amount (or zero it out) without changing the underlying recurring/goal definition or losing it for other months.

Most budgeting tools do one or the other — generic spend-tracking apps don't model UK payroll deductions accurately, and payroll calculators don't feed into ongoing budget planning. Steward does both in one place.

## Operating Context

Sign-up/login via Supabase auth → one-time setup flow (salary, tax code, region, pension, student loans, bonus/overtime, salary sacrifice) → dashboard (take-home breakdown, income/outgoings/savings trend chart, quick access to yearly/monthly views) → Recurring Expenses and Savings Goals pages (define the recurring items that auto-populate months) → Yearly Planner (grid of all months) or Monthly Detail view (zoomed single month, edit incomes/outgoings/savings, override recurring items for just that month) → Settings (profile summary, account-level info; dev-only destructive "clear test data" tools, hidden in production).

## Capabilities and Constraints

- UK tax years supported: 2024/25, 2025/26, 2026/27. Rates for years HMRC hasn't published yet are the developer's own frozen/projected estimates, not guaranteed-accurate published figures — the app should not present these as authoritative HMRC numbers.
- Income tax: rUK and Scottish bands, personal allowance taper above £100k, tax code parsing including flat-rate (BR/D0/D1), no-tax (NT), and K-codes.
- National Insurance, pension contributions (percentage or fixed amount; auto-enrolment/salary-sacrifice/employer/personal schemes; optional qualifying-earnings banding), student loan repayment across all current UK plans, overtime, bonus, salary sacrifice, taxable benefits, blind person's allowance.
- Monthly planner: incomes, expenditures (outgoings), and savings, each able to hold manual entries plus auto-generated lines from Recurring Expenses / Savings Goals; auto-generated lines support per-month overrides that persist independently of the recurring/goal default.
- Confirmed constraint: UK tax/payroll rules only — not a multi-country tool.
- Undecided: whether multi-user features (household sharing, collaboration) are ever added is open, not ruled out or committed to.

## Brand Commitments

Product name is **Steward**. No logo or other binding visual/brand assets exist yet.

## Evidence on Hand

No testimonials, case studies, press, or real third-party user data exist yet — the product is in active development, currently exercised with the developer's own data. Settings intentionally includes dev-only tools to clear that test data; future design/product work should not assume production traffic or real customer evidence exists until this section is updated.

## Product Principles

1. Payroll accuracy and monthly planning flexibility are equally core — improvements to one should not come at the expense of the other.
2. Stay scoped to UK tax/payroll rules rather than diluting focus chasing multi-country support.
3. A recurring commitment (expense or goal) must be editable for a single month without corrupting its ongoing default for every other month — real life should be able to flex around the plan without the plan losing its baseline.
4. Even while still developer-facing, decisions should keep a broader future UK-earner audience in mind, not just the current single user.
