# Web App Redesign: Pastel Hero Cards & Transaction Layout

## Overview

Redesign the expense tracking web app with:
- Unified hero total card with trend indicator and per-payer breakdown
- Two-line transaction layout wrapped in pastel card (keeping date grouping)
- Pastel color palette as CSS variables
- More generous rounded corners
- Header badge pattern for month navigator

**Approach: Test-Driven Development (TDD)**
- Write failing tests FIRST for each component/function
- Implement minimal code to pass tests
- Refactor while keeping tests green

---

## Phase 1: CSS Foundation

**Files:** `apps/web/src/app/globals.css`

- [x] Add pastel color variables to `:root`:
  ```css
  --pastel-mint: #DDF2D8;
  --pastel-peach: #FAE5D3;
  --pastel-blue: #D6EAF8;
  --pastel-lavender: #E8DAEF;
  ```
- [x] Add category badge color variables:
  ```css
  --pastel-category-food: #FDE2E4;
  --pastel-category-transport: #D4E6F1;
  --pastel-category-utilities: #FCF3CF;
  --pastel-category-entertainment: #E8DAEF;
  --pastel-category-shopping: #D5F5E3;
  --pastel-category-other: #F2F4F4;
  ```
- [x] Update border radius scale:
  ```css
  --radius-card: 32px;  /* was 24px */
  --radius-2xl: 40px;
  --radius-3xl: 48px;
  ```
- [x] Add pastel colors to `@theme inline` block for Tailwind

---

## Phase 2: Card Component Enhancement (TDD)

**Files:** `apps/web/src/components/ui/card.tsx`, `apps/web/src/components/ui/card.test.tsx`

### Step 1: Write failing tests FIRST
- [x] Create `card.test.tsx` with tests for:
  - Default variant renders with white background
  - Mint variant renders with `--pastel-mint` background
  - Peach variant renders with `--pastel-peach` background
  - Blue variant renders with `--pastel-blue` background
  - Lavender variant renders with `--pastel-lavender` background
  - Transparent variant has no background/shadow

### Step 2: Implement
- [x] Add `variant` prop using `class-variance-authority`:
  - `default` → white background
  - `mint` → `--pastel-mint`
  - `peach` → `--pastel-peach`
  - `blue` → `--pastel-blue`
  - `lavender` → `--pastel-lavender`
  - `transparent` → no background, no shadow
- [x] Update Card interface to extend `VariantProps<typeof cardVariants>`

### Step 3: Verify
- [x] Run tests - all pass

---

## Phase 3: Shared Utility Functions (TDD)

**Files:** `packages/shared/src/utils/money.ts`, `packages/shared/src/utils/money.test.ts`, `packages/shared/src/index.ts`

### Step 1: Write failing tests FIRST
- [ ] Add tests for `splitAmount(cents)`:
  - `splitAmount(324050)` → `{ main: "3 240", decimal: "50" }`
  - `splitAmount(12345)` → `{ main: "123", decimal: "45" }`
  - `splitAmount(0)` → `{ main: "0", decimal: "00" }`
- [ ] Add tests for `calculateTrendPercentage(current, previous)`:
  - `(12000, 10000)` → `{ percentage: 20, direction: "up" }`
  - `(8000, 10000)` → `{ percentage: 20, direction: "down" }`
  - `(10000, 10000)` → `{ percentage: 0, direction: "neutral" }`
  - `(10000, 0)` → `{ percentage: 0, direction: "neutral" }` (handles zero)

### Step 2: Implement
- [ ] Add `splitAmount(cents)` function:
  - Returns `{ main: string, decimal: string }`
  - Formats main with Swedish locale (space thousands separator)
- [ ] Add `calculateTrendPercentage(current, previous)` function:
  - Returns `{ percentage: number, direction: "up" | "down" | "neutral" }`
- [ ] Export new functions from `packages/shared/src/index.ts`

### Step 3: Verify
- [ ] Run tests - all pass

---

## Phase 4: Hero Total Card Component (TDD)

**Files:** `apps/web/src/components/hero-total-card.tsx` (new), `apps/web/src/components/hero-total-card.test.tsx` (new)

### Step 1: Write failing tests FIRST
- [ ] Create `hero-total-card.test.tsx` with tests for:
  - Renders total split into main and decimal parts
  - Does NOT show currency symbol in total
  - Shows trend pill when `previousMonthTotal` is provided
  - Hides trend pill when no previous data
  - Trend pill shows correct direction (up/down)
  - Displays per-payer breakdown with names and amounts
  - Uses mint background (Card variant="mint")

### Step 2: Implement
- [ ] Create `HeroTotalCard` component with props:
  - `summary: MonthSummary`
  - `previousMonthTotal?: number`
  - `payers: PayerRow[]`
- [ ] Display total with split styling:
  - Main number: large (text-5xl), bold
  - Decimal: smaller (text-2xl), muted color
  - NO currency symbol in the total
- [ ] Add trend pill below total:
  - Red pill with up arrow for increase
  - Green pill with down arrow for decrease
  - Show "X% vs last month"
- [ ] Per-payer breakdown row:
  - Smaller than main total (text-lg)
  - Centered, separated by border-t
  - Show payer name below their amount
- [ ] Use `variant="mint"` for the card background

### Step 3: Verify
- [ ] Run tests - all pass

---

## Phase 5: Transaction List Redesign (TDD)

**Files:** `apps/web/src/components/expense-list.tsx`, `apps/web/src/components/expense-list.test.tsx`

### Step 1: Write/update failing tests FIRST
- [ ] Update tests for new layout requirements:
  - Wraps transactions in a peach-colored card
  - **KEEPS date grouping** with date headers
  - Each transaction has two-line layout
  - Shows category badge with 2-letter initials
  - Shows payer tag (colored pill) under amount
  - **KEEPS delete button** visible
  - Shows "View All Transactions" button at bottom

### Step 2: Implement
- [ ] Wrap date-grouped sections in single `Card variant="peach"`
- [ ] **KEEP date grouping** with date headers inside the card
- [ ] Redesign each transaction row (two lines):
  ```
  Line 1: [XX badge]  {note or "—"}          -{amount}    [delete]
  Line 2:             {category} • {date}    [Payer tag]
  ```
- [ ] Category badge:
  - First 2 letters of category, uppercase
  - 32x32px rounded square
  - Pastel background with darker text
- [ ] Payer tag:
  - Small pill under amount (right side of line 2)
  - Terracotta for first payer, Sage for second
- [ ] **KEEP delete button** (move to right side of line 1)
- [ ] Add "View All Transactions" button at bottom (placeholder, ghost variant)
- [ ] Keep note field but leave space for future merchant name
- [ ] Update empty state to use `variant="peach"`

### Step 3: Verify
- [ ] Run tests - all pass

---

## Phase 6: Month Navigator Badge Pattern (TDD)

**Files:** `apps/web/src/components/month-navigator.tsx`, `apps/web/src/components/month-navigator.test.tsx`

### Step 1: Write failing tests FIRST
- [ ] Create/update tests for:
  - Shows calendar icon in a circle container
  - Shows month in uppercase format
  - Maintains existing picker functionality

### Step 2: Implement
- [ ] Update center button to badge pattern:
  - Icon in circle (terracotta-100 bg, terracotta-600 icon)
  - Uppercase month label with tracking-wider
- [ ] Layout: `[icon-circle] JANUARY 2024`
- [ ] Keep existing functionality (opens picker on click)

### Step 3: Verify
- [ ] Run tests - all pass

---

## Phase 7: Dashboard Integration

**Files:** `apps/web/src/components/dashboard.tsx`

- [ ] Import `HeroTotalCard` instead of `TotalsTable`
- [ ] Add previous month total fetching:
  - Calculate previous month string
  - Query sum of expenses for previous month
  - Pass as `previousMonthTotal` prop
- [ ] Update component rendering to use new components
- [ ] Keep `TotalsTable` file for reference (can delete later)

---

## Phase 8: Final Testing & Verification

- [ ] Run `cd apps/web && npm test` - all tests pass
- [ ] Run `pnpm dev:web` and verify visually:
  - [ ] Hero card displays with mint background
  - [ ] Total shows main,decimal format without currency symbol
  - [ ] Trend pill shows correctly (or hidden if no previous data)
  - [ ] Per-payer breakdown visible below total
  - [ ] Transaction list wrapped in peach card
  - [ ] **Date grouping preserved** with date headers
  - [ ] Two-line transaction rows render correctly
  - [ ] Category badges show 2-letter initials
  - [ ] Payer tags show with correct colors
  - [ ] **Delete button still visible and functional**
  - [ ] "View All Transactions" button at bottom
  - [ ] Month navigator shows icon-in-circle pattern
  - [ ] Rounded corners feel more generous
- [ ] Test responsive behavior on mobile viewport
- [ ] Run `pnpm build:web` - no build errors

---

## Critical Files Summary

| File | Action |
|------|--------|
| `apps/web/src/app/globals.css` | Modify - add colors, update radius |
| `apps/web/src/components/ui/card.tsx` | Modify - add variant prop |
| `apps/web/src/components/ui/card.test.tsx` | Create - tests for variants |
| `packages/shared/src/utils/money.ts` | Modify - add splitAmount, calculateTrendPercentage |
| `packages/shared/src/utils/money.test.ts` | Modify - add tests |
| `packages/shared/src/index.ts` | Modify - export new functions |
| `apps/web/src/components/hero-total-card.tsx` | Create - new hero card |
| `apps/web/src/components/hero-total-card.test.tsx` | Create - tests |
| `apps/web/src/components/expense-list.tsx` | Modify - two-line layout, keep grouping |
| `apps/web/src/components/expense-list.test.tsx` | Modify - update tests |
| `apps/web/src/components/month-navigator.tsx` | Modify - badge pattern |
| `apps/web/src/components/dashboard.tsx` | Modify - integration |

---

## Notes

- **Delete functionality**: KEPT - delete button remains visible on each transaction row
- **Date grouping**: KEPT - transactions still grouped by date within the peach wrapper card
- **Merchant name**: Row layout is future-ready. Currently shows note or em-dash placeholder.
- **TDD**: Each phase follows Red-Green-Refactor: write failing tests → implement → verify
