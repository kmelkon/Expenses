# OurNest Web App Redesign Spec

## Overview

Visual redesign of 4 screens. No new functionality - placeholder UI for charts.

**App rename:** Expenses → OurNest
**Mobile nav:** Known broken in design HTML - fix later

---

## Design Tokens (from HTML)

### Colors

```
cream-bg:        #FDFBF7
charcoal-text:   #4A4543
light-grey-text: #948E8C
pastel-blue:     #D6EAF8
pastel-mint:     #DDF2D8
pastel-peach:    #FAE5D3
pastel-lavender: #E8DAEF
accent-primary:  #7FB3D5
accent-success:  #8FC99C
accent-warning:  #F7DC6F
```

### Border Radius

```
DEFAULT: 0.5rem
lg:      1rem
xl:      1.5rem
2xl:     2rem
3xl:     2.5rem
```

### Typography

**Headings:** Fraunces (variable serif, warm/friendly)

- Weights: 400, 600, 700, 800
- Use for: h1-h3, hero text, summary numbers

**Body:** Nunito Sans

- Weights: 300, 400, 600, 700
- Use for: paragraphs, labels, buttons, nav

**Icons:** Material Symbols Outlined (FILL 0/1, wght 400)

---

## Phase 1: Foundation

### Design Tokens

- [ ] Update `globals.css` with color palette from HTML
- [ ] Add border-radius tokens to Tailwind theme
- [ ] Add fonts in `layout.tsx`: Fraunces (headings) + Nunito Sans (body)
- [ ] Configure font CSS variables: `--font-heading`, `--font-body`
- [ ] Update metadata title to "OurNest"
- [ ] Add Material Symbols font link

### Shared UI Components

- [ ] Create `ui/button.tsx` - primary (charcoal), secondary (white border)
- [ ] Create `ui/card.tsx` - pastel background variants (mint, blue, peach, lavender)
- [ ] Create `ui/badge.tsx` - payer badges (Alex=lavender, Sam=warning)
- [ ] Update `ui/input.tsx`, `ui/select.tsx`, `ui/label.tsx` with warm palette

### Decorative Components

- [ ] Create `ournest-logo.tsx` - cottage icon + "OurNest" text
- [ ] Create `decorative-blob.tsx` - gradient blur circles from login HTML

**Files:**

- `src/app/globals.css`
- `src/app/layout.tsx`
- `src/components/ui/*.tsx`
- `src/components/ournest-logo.tsx`
- `src/components/decorative-blob.tsx`

---

## Phase 2: Login Page

### Layout (split, stack on mobile)

- [ ] Rewrite `login/page.tsx` with split layout
- [ ] Left panel: gradient bg, blurred blob circles, cottage icon in white circle, "OurNest" branding
- [ ] Right panel: OurNest badge, "Welcome Back." heading, Google button, terms footer
- [ ] Mobile: stack vertically (branding above form)

### Key Classes from HTML

```
Left panel:  bg-gradient-to-br from-pastel-peach/40 to-cream-bg
Icon circle: w-64 h-64 bg-white/60 backdrop-blur-sm rounded-full
Blob:        absolute w-[400px] h-[400px] bg-pastel-mint/30 rounded-full blur-3xl
Google btn:  border border-charcoal-text/10 hover:border-charcoal-text/30 rounded-xl
```

### Tests

- [ ] Create `login/page.test.tsx`
- [ ] Test: renders OurNest branding
- [ ] Test: renders Google sign-in button
- [ ] Test: renders terms/privacy links

**Files:**

- `src/app/login/page.tsx`
- `src/app/login/page.test.tsx`

---

## Phase 3: Dashboard

### Header

- [ ] Create `app-header.tsx`
- [ ] Left: cottage icon (pastel-peach bg) + "OurNest" text
- [ ] Center: pill nav (Dashboard | Expenses | Reports) - `bg-white/50 p-1.5 rounded-full`
- [ ] Right: user avatar with dropdown (settings, sign out)

### Welcome Section

- [ ] Create `welcome-section.tsx`
- [ ] "Hello, {name}." + subtitle
- [ ] "+ Log Expense" button: `bg-charcoal-text text-cream-bg rounded-full`

### Summary Card

- [ ] Create `summary-card.tsx` (replaces totals-table)
- [ ] Background: `bg-pastel-mint/40 rounded-3xl`
- [ ] Monthly total: `text-5xl font-black`
- [ ] Trend badge: `bg-white/50 rounded-full` with trending_up icon
- [ ] Per-person breakdown in white card

### Charts (placeholders)

- [ ] Create `spending-flow-chart.tsx` - copy SVG from HTML
- [ ] Background: `bg-pastel-blue/40 rounded-3xl`
- [ ] Create `category-breakdown.tsx` - conic-gradient donut from HTML
- [ ] Background: `bg-pastel-peach/40 rounded-3xl`

### Latest Transactions

- [ ] Create `latest-transactions.tsx`
- [ ] Background: `bg-pastel-lavender/30 rounded-3xl`
- [ ] Transaction row: `bg-white/60 hover:bg-white rounded-2xl`
- [ ] Merchant icon: `w-12 h-12 rounded-full bg-pastel-mint/50`
- [ ] Payer badge: `bg-pastel-lavender/50` (Alex) or `bg-accent-warning/30` (Sam)
- [ ] "View All Transactions" link → /expenses

### Dashboard Layout

- [ ] Update `dashboard.tsx` with new component composition
- [ ] Remove old header.tsx usage
- [ ] Keep existing data fetching logic

### Reports Placeholder

- [ ] Create `src/app/reports/page.tsx` - "Coming soon" page

### Tests

- [ ] Create `app-header.test.tsx`
- [ ] Create `welcome-section.test.tsx`
- [ ] Create `summary-card.test.tsx`
- [ ] Create `latest-transactions.test.tsx`

**Files:**

- `src/components/app-header.tsx`
- `src/components/welcome-section.tsx`
- `src/components/summary-card.tsx`
- `src/components/spending-flow-chart.tsx`
- `src/components/category-breakdown.tsx`
- `src/components/latest-transactions.tsx`
- `src/components/dashboard.tsx`
- `src/app/reports/page.tsx`

---

## Phase 4: Expenses List

### Page Structure

- [ ] Create `src/app/expenses/page.tsx` - server component with auth
- [ ] Create `expense-list-page.tsx` - AppHeader + MonthNavigator + list

### Expense List Styling

- [ ] Update `expense-list.tsx` with new design
- [ ] Merchant icon placeholder (initials in colored circle)
- [ ] Category as text label (not pill)
- [ ] Payer badge styling
- [ ] Row: `bg-white/60 hover:bg-white rounded-2xl`

### Month Navigator

- [ ] Update `month-navigator.tsx` with warm palette

**Files:**

- `src/app/expenses/page.tsx`
- `src/components/expense-list-page.tsx`
- `src/components/expense-list.tsx`
- `src/components/month-navigator.tsx`

---

## Phase 5: Settings + Cleanup

### Settings Pages

- [ ] Update `settings/page.tsx` - warm palette, rounded cards
- [ ] Update `settings/categories/page.tsx`
- [ ] Update `settings/payers/page.tsx`

### Add Expense Modal

- [ ] Update `add-expense-button.tsx` - charcoal FAB, warm modal styling

### Cleanup

- [ ] Delete `header.tsx` (replaced by app-header)
- [ ] Delete `totals-table.tsx` (replaced by summary-card)

**Files:**

- `src/app/settings/*.tsx`
- `src/components/add-expense-button.tsx`

---

## File Summary

### New (17)

```
src/components/ournest-logo.tsx
src/components/decorative-blob.tsx
src/components/app-header.tsx (+test)
src/components/welcome-section.tsx (+test)
src/components/summary-card.tsx (+test)
src/components/spending-flow-chart.tsx
src/components/category-breakdown.tsx
src/components/latest-transactions.tsx (+test)
src/components/expense-list-page.tsx
src/app/expenses/page.tsx
src/app/reports/page.tsx
src/app/login/page.test.tsx
```

### Modified (12)

```
src/app/globals.css
src/app/layout.tsx
src/app/login/page.tsx
src/components/dashboard.tsx
src/components/expense-list.tsx
src/components/month-navigator.tsx
src/components/add-expense-button.tsx
src/components/ui/input.tsx
src/components/ui/select.tsx
src/components/ui/label.tsx
src/app/settings/page.tsx
src/app/settings/categories/page.tsx
src/app/settings/payers/page.tsx
```

### Delete (2)

```
src/components/header.tsx
src/components/totals-table.tsx
```

---

## Phase 6: Expenses Tab Redesign

Based on new HTML design with search, filters, and date grouping.

### New Components

- [ ] Create `transaction-search.tsx` - search bar + filter buttons
  - Search input: `pl-12 pr-4 py-3 bg-white rounded-2xl shadow-sm`
  - Material search icon positioned left
  - Placeholder: "Search merchant, category or amount..."
  - Filter buttons: Category, User, Date (icons: category, person, date_range)
  - Button style: `bg-white hover:bg-white/80 rounded-xl shadow-sm`

### Expense List Grouping

- [ ] Update `expense-list.tsx` with date grouping
  - Group transactions by: Today, Yesterday, specific dates (Oct 22, etc.)
  - Date header: `text-xs font-bold text-light-grey-text uppercase tracking-wider`
  - Horizontal line after header text
  - Use `date-fns` for date comparison (isToday, isYesterday, format)

### Transaction Row Styling (from HTML)

- [ ] Update transaction row layout
  - Container: `bg-white/60 hover:bg-white rounded-2xl shadow-sm hover:shadow-md`
  - Border on hover: `border border-transparent hover:border-pastel-*/30`
  - Merchant icon: `w-12 h-12 rounded-full bg-pastel-*/50` with Material icon or initials
  - Category pill: `text-xs font-semibold bg-pastel-*/20 px-2 py-0.5 rounded-md`
  - Payer badge: `text-[10px] uppercase font-bold px-2 py-0.5 rounded-md tracking-wide`

### Page Header Update

- [ ] Update `expense-list-page.tsx` header section
  - Title: "Transactions" (not "Expenses")
  - Subtitle: "History of expenses for {Month}."
  - "Add New" button inline (charcoal, rounded-full) instead of FAB
  - Remove FAB from this page

### Search/Filter State

- [ ] Add search state to `expense-list-page.tsx`
  - `searchQuery` state for text search
  - Filter expenses client-side (merchant name, category, amount)
  - Pass filtered expenses to expense-list

### Delete Functionality (PRESERVE)

- [ ] Keep existing delete implementation:
  - `handleDelete(id)` with confirm dialog
  - Soft-delete: `update({ deleted: true, updated_at })`
  - Call `onRefresh()` after delete
  - Delete button: hover-visible trash icon

### Key Classes from HTML

```
Search input:   w-full pl-12 pr-4 py-3 bg-white rounded-2xl border-none shadow-sm
Filter btn:     px-4 py-3 bg-white hover:bg-white/80 rounded-xl shadow-sm
Date header:    text-xs font-bold text-light-grey-text uppercase tracking-wider
Transaction:    p-4 bg-white/60 hover:bg-white rounded-2xl shadow-sm hover:shadow-md
Merchant icon:  w-12 h-12 rounded-full bg-pastel-mint/50
Category pill:  text-xs font-semibold bg-pastel-mint/20 px-2 py-0.5 rounded-md
Payer badge:    text-[10px] uppercase font-bold bg-pastel-lavender/50 px-2 py-0.5 rounded-md
```

### Icon-Category Mapping

Map categories to Material icons and pastel colors:
- Groceries: shopping_cart, mint
- Dining: local_cafe, blue
- Utilities: bolt, warning
- Household: shopping_bag, peach
- Transport: local_gas_station, lavender
- Entertainment: movie, blue
- Default: receipt_long, mint

**Files:**

- `src/components/transaction-search.tsx` (new)
- `src/components/expense-list.tsx` (modify)
- `src/components/expense-list-page.tsx` (modify)

---

## Verification

Per phase:

1. `cd apps/web && npm test` - tests pass
2. `pnpm dev:web` - visual check
3. Browser devtools (playwriter) - mobile responsive check

Final:

1. All 4 screens match design screenshots
2. OAuth, add/delete expense still work
3. Mobile layouts correct (except nav - known issue)
