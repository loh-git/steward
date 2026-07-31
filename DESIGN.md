---
name: Steward
description: A chartered accountant's live ledger for UK take-home pay and monthly budgeting.
colors:
  primary: "#8a1f2e"
  primary-hover: "#6e1824"
  primary-tint: "#a32638"
  income: "#194933"
  income-tint: "#1f5940"
  savings: "#7e6225"
  savings-tint: "#9c7a2e"
  ink-heading: "#1a1714"
  ink-body: "#6b6255"
  ink-label: "#786d5c"
  border: "#d9d3c7"
  divider: "#ede8de"
  canvas: "#f1ede3"
  card: "#fffdf9"
  strongroom: "#17211c"
  strongroom-inset: "#2c3b32"
typography:
  display:
    fontFamily: "Libre Caslon Text, Georgia, serif"
    fontWeight: 700
    lineHeight: 1.2
  body:
    fontFamily: "Public Sans, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Public Sans, Arial, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    letterSpacing: "0.03em"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  full: "9999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  card:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.lg}"
    padding: "20px 24px"
---

# Design System: Steward

## Overview

**Creative North Star: "The Working Ledger"**

Steward is a chartered accountant's live analysis ledger, not a museum antique. The system reads as paper that is actually being worked: hairline ruled columns, black-ink structure, and a confident red-ink accent standing in for the pen a bookkeeper reaches for when something needs attention — a correction, a total, a call to action. Vintage character comes from ruling, ink color, and letterform, never from yellowed paper, gold leaf, or faux distressing. The working surface stays a crisp, barely-warm paper white so it never tires the eye across long sessions of budgeting.

This replaced an earlier generic-SaaS violet system that the product owner explicitly flagged as reading "AI-coded." The Working Ledger was chosen deliberately against that failure mode: it commits to a real, citable material world (double-entry bookkeeping, banknote engraving, ledger stamps) rather than a default startup palette, and it avoids the equally predictable "vintage ledger" cliché of honeyed cream paper and decorative gold serif type.

**Key Characteristics:**
- Three ink colors do real semantic work: ledger red (outgoings, corrections, primary actions), bottle green (income), brass (savings) — never decorative, always meaningful.
- A dark "strongroom" surface (not navy-tech-dashboard, but ink-black with a whisper of green) is reserved for the two places money matters most: the take-home hero panel and the persistent sidebar.
- Corners are crisp, not soft — a hairline-and-rule vocabulary stands in for the rounded-pill SaaS default.
- Display type (Libre Caslon Text) appears only at headings and hero figures; dense data stays in a disciplined workhorse sans (Public Sans) for legibility.

## Colors

Three saturated inks carry meaning; everything else is a warm, restrained neutral scale built for long reading sessions, not a bright accent-everywhere palette.

### Primary
- **Ledger Red** (`#8a1f2e`, tint `#a32638`, deep `#6e1824`): the accent that used to be violet. Primary buttons, active nav/tab states, links, delete affordances, and — deliberately, doing double duty the way a real ledger's red ink does — the outgoings/negative category color throughout charts, badges, and row amounts.

### Secondary
- **Bottle Green** (`#194933`, tint `#1f5940`): income, positive amounts, success confirmations. Reads as banknote-green "in the black," not mint or pastel.

### Tertiary
- **Brass** (`#7e6225`, tint `#9c7a2e`): savings goals. A muted brass-ink tone, not gold leaf — ties to ledger stamp ink and brass fittings rather than costume-vintage gilding.

### Neutral
- **Ink 900** (`#1a1714`): headings, primary text — warm near-black, evokes iron-gall ink rather than pure digital black.
- **Ink 600 / Ink 500** (`#6b6255` / `#786d5c`): body copy and secondary labels.
- **Ink 200 / Ink 100** (`#d9d3c7` / `#ede8de`): card borders and subtle internal dividers — a warm hairline-rule color, not cool slate-grey.
- **Paper Canvas** (`#f1ede3`): the page background. Deliberately not honeyed cream — a desaturated warm off-white, closer to "aged paper under good light" than "golden parchment."
- **Paper Card** (`#fffdf9`): elevated surfaces (cards, forms, table cells) sit one step lighter than canvas.
- **Strongroom 900 / 500** (`#17211c` / `#2c3b32`): the dark surface family, used only for the sidebar and the take-home hero panel — ink-black with a green undertone, read as a vault door rather than a tech dashboard.

### Named Rules
**The Double-Duty Red Rule.** Ledger red is both the primary interactive accent and the outgoings/negative semantic color — never two separate reds. This mirrors how a real ledger's red ink means both "pay attention" and "this is a debit."

**The No-Cream Rule.** No background in the system uses a honeyed/golden cream tone. Vintage character comes from ruling, ink, and type, never from paper tint — this is the system's explicit defense against the most predictable "vintage ledger" AI rendering.

## Typography

**Display Font:** Libre Caslon Text (with Georgia, serif fallback)
**Body Font:** Public Sans (with Arial, sans-serif fallback)

**Character:** Caslon is the historical face of British institutional print — banknotes, government documents, legal typesetting — used here only at headings and the one or two hero figures (the take-home pay numbers) that deserve ceremony. Public Sans is a disciplined, form-legible workhorse (designed for government digital services) that carries every dense, data-heavy surface: tables, forms, badges, row amounts.

### Hierarchy
- **Display** (700, 1.75–2.25rem, 1.2 line-height): page titles, card section titles, the take-home hero figures. font-display everywhere it appears.
- **Body** (400, 0.875rem, 1.5 line-height): the default for all UI text, form fields, table cells, and row labels.
- **Label** (600, 0.6875rem, uppercase, tracking-wide): small section headers inside planner columns ("MANUAL INCOMES", "RECURRING EXPENSES") and stat-tile captions.

### Named Rules
**The Ceremony-Only Rule.** Display type is reserved for headings and hero figures. Dense tabular data — amounts in rows, table cells, form inputs — always stays in the body sans for legibility at small sizes; Caslon's numeral character is handsome but not built for scanning a column of figures quickly.

## Layout

Responsive container widths follow content density: `max-w-6xl` for the dashboard and its data-dense grid views, `max-w-3xl` for single-column management pages (Expenses, Savings, Settings), `max-w-sm` for auth forms. The dominant rhythm is "stack on mobile, grid on desktop": `grid-cols-1` collapsing from `lg:grid-cols-2` (dashboard top row), `lg:grid-cols-3` (planner columns), or `lg:grid-cols-4` (summary tiles). Spacing steps in use: 8px/12px/16px/24px/32px, applied consistently as `gap-2` through `gap-8` and matching padding scales.

## Elevation & Depth

Mostly flat. Cards carry only `shadow-sm`, a whisper of lift against the canvas. Two things earn more: the take-home hero panel (`shadow-lg`, on top of its own dark strongroom surface and border) and the month-detail modal (`shadow-2xl`, the strongest elevation in the system, reserved for the one true overlay). Elevation is used sparingly and correlates with how much the surface interrupts or matters, not decoratively.

### Named Rules
**The Earned-Shadow Rule.** A surface's shadow weight should track its importance: flat by default, `shadow-lg` for the one hero figure on the page, `shadow-2xl` reserved for modal overlays. Don't add shadow to a card just to make it "pop."

## Shapes

Corners are crisp, not soft. The radius scale is deliberately smaller than a typical SaaS default: `rounded` (4px) for the majority of buttons, inputs, and small pills/tabs; `rounded-md` (6px) for fieldsets and secondary containers; `rounded-lg` (8px) for cards and top-level containers; `rounded-full` reserved for genuinely circular things (icon roundels, avatar-style badges) — not stretched into pill-shaped buttons or tags the way the old system used it. Borders are 1px hairlines in the warm `ink-200`/`ink-100` family, standing in for a ledger's ruled lines.

## Components

### Buttons
- **Shape:** `rounded` (4px) — crisp, not pill-shaped.
- **Primary:** `bg-ledger-600` / `hover:bg-ledger-700`, white text, `px-4 py-2`. Used for the dominant action regardless of surrounding category color (Save, Add, Sign In).
- **Category add-buttons:** the `+` buttons on income/expense/savings rows use the matching category color (bottle for income, ledger for outgoings, brass for savings) rather than always defaulting to primary red — the one deliberate exception to the "primary red for actions" rule, because these buttons are conceptually "add to this specific category."
- **Secondary/Ghost:** `border border-ink-200`, `text-ink-600`, `hover:bg-ink-50` — used for Cancel and other de-emphasized actions.

### Chips / Badges
- **Style:** `bg-{category}-100 text-{category}-700`, `rounded` (not full) — reads as a stamped label rather than a soft pill.

### Cards / Containers
- **Corner Style:** `rounded-lg` (8px).
- **Background:** `paper-card` (`#fffdf9`) on `paper-canvas` (`#f1ede3`).
- **Shadow Strategy:** `shadow-sm` by default; see Elevation & Depth for exceptions.
- **Border:** 1px `border-ink-200`.
- **Internal Padding:** 20–24px (`p-5`/`p-6`).

### Inputs / Fields
- **Style:** `border border-ink-200`, `rounded` (4px), `bg-paper-card`.
- **Focus:** `focus:ring-2 focus:ring-ledger-500`.
- **Error:** border and helper text switch to the `ledger` family (never a separate red) — consistent with the Double-Duty Red Rule.

### Navigation (Sidebar)
- **Style:** `bg-strongroom-900`, `border-strongroom-500`. Each destination's icon carries its own category tint (dashboard = bottle, expenses = ledger, savings = brass, compare/settings = neutral white/70–50) against a shared white label. Active state: `bg-strongroom-500` with a `ring-ledger-400/40` — the ledger accent marks "you are here" even inside the dark surface.

### Take-home Hero Panel (signature component)
The one deliberately dramatic surface in the system: `bg-strongroom-900`, white/bottle-tinted text, `shadow-lg`. It's the same dark "strongroom" family as the sidebar, reinforcing that this is where the money itself lives — everywhere else in the system stays light and legible; this panel is where the system allows itself to feel weighty.

## Do's and Don'ts

### Do:
- **Do** use ledger red for both the primary interactive accent and the outgoings/negative semantic meaning — they're the same color on purpose.
- **Do** reserve Libre Caslon Text for headings and hero figures only; keep dense data in Public Sans.
- **Do** keep the paper canvas/card neutrals warm but restrained — never honeyed cream, never cool slate-grey.
- **Do** use the strongroom dark surface only for the sidebar and the take-home panel; it's a signature device, not a general dark-mode.

### Don't:
- **Don't** reintroduce violet, or any generic SaaS purple/indigo accent — it's the exact identity this system replaced.
- **Don't** use honeyed cream, parchment, or gold-leaf tones anywhere — the vintage character comes from ruling and ink, not paper tint.
- **Don't** default to dark mode for ordinary surfaces; dark stays confined to the two strongroom surfaces.
- **Don't** use `rounded-full` on buttons or tags — reserve full rounding for genuinely circular icon containers.
