# Test Plan - Expenses App

This document outlines the comprehensive testing strategy for the Expenses monorepo.

## Overview

| Package | Framework | Test Types | Status |
|---------|-----------|------------|--------|
| `packages/shared` | Vitest | Unit | **Done** (49 tests) |
| `apps/web` | Vitest + Testing Library | Unit, Integration | **Setup Complete** (3 tests) |
| `apps/mobile` | Jest + RNTL | Unit, Integration | Planned |

---

## Phase 1: Shared Package (packages/shared)

### Setup
- [x] Install Vitest as dev dependency
- [x] Create `vitest.config.ts`
- [x] Add test scripts to package.json
- [x] Verify tests run correctly

### Money Utilities (`src/utils/money.ts`)

#### `formatSEK(cents: number): string`
- [x] Returns "0.00 SEK" for 0 cents
- [x] Returns "1.00 SEK" for 100 cents
- [x] Returns "123.45 SEK" for 12345 cents
- [x] Handles negative amounts correctly
- [x] Handles large amounts (millions)

#### `formatAmount(cents: number): string`
- [x] Formats using Swedish locale (comma as decimal separator)
- [x] Returns "0,00" for 0 cents
- [x] Returns "1 234,56" for 123456 cents (thousand separator)
- [x] Handles edge cases (negative, very large numbers)

#### `parseAmountInput(s: string): number | null`
- [x] Parses "123.45" to 12345 cents
- [x] Parses "123,45" (Swedish format) to 12345 cents
- [x] Returns 0 for empty string (current behavior)
- [x] Parses whole numbers correctly
- [x] Handles multiple dots (keeps first dot)
- [x] Strips non-numeric characters (e.g., "SEK", currency symbols)
- [x] Rounds to nearest cent

#### `centsToInputValue(cents: number): string`
- [x] Returns "0.00" for 0 cents
- [x] Returns "123.45" for 12345 cents
- [x] Always returns 2 decimal places

### Date Utilities (`src/utils/date.ts`)

#### `toYYYYMM(date: Date): string`
- [x] Returns correct format for any date
- [x] Handles year boundaries (Dec -> Jan)
- [x] Pads month with leading zero

#### `toYYYYMMDD(date: Date): string`
- [x] Returns correct ISO date format
- [x] Pads day and month correctly

#### `monthBounds(yyyyMM: string): [string, string]`
- [x] Returns correct start date (first of month)
- [x] Returns correct end date (last of month)
- [x] Handles February (28/29 days)
- [x] Handles months with 30 and 31 days
- [x] Handles year boundaries

#### `getPreviousMonth(yyyyMM: string): string`
- [x] Returns previous month correctly
- [x] Handles January -> December year rollback
- [x] Maintains YYYY-MM format

#### `getNextMonth(yyyyMM: string): string`
- [x] Returns next month correctly
- [x] Handles December -> January year rollover
- [x] Maintains YYYY-MM format

#### `getCurrentMonth(): string`
- [x] Returns current month in YYYY-MM format
- [x] Matches system date

#### `getTodayYYYYMMDD(): string`
- [x] Returns today in YYYY-MM-DD format

#### `formatMonthDisplay(yyyyMM: string): string`
- [x] Returns "January 2025" format
- [x] Handles all months correctly

#### `formatExpenseDate(yyyyMMDD: string): string`
- [x] Returns "Jan 15" format
- [x] Handles all months correctly

---

## Phase 2: Web App (apps/web)

### Setup
- [x] Install Vitest + @testing-library/react + jsdom
- [x] Create `vitest.config.ts` with Next.js support
- [x] Add test scripts to package.json
- [x] Create test utilities (render with providers)

### Components

#### `MonthNavigator`
- [x] Displays formatted month name
- [x] Previous button triggers onPrevious callback
- [x] Next button triggers onNext callback

#### `TotalsTable`
- [ ] Renders payer totals correctly
- [ ] Formats amounts using formatAmount
- [ ] Shows grand total
- [ ] Handles empty summary gracefully

#### `ExpenseList`
- [ ] Renders list of expenses
- [ ] Shows formatted amounts
- [ ] Shows formatted dates
- [ ] Handles empty list with appropriate message
- [ ] Delete button calls onRefresh after delete

#### `AddExpenseButton`
- [ ] Opens form on click
- [ ] Validates required fields
- [ ] Submits to Supabase correctly
- [ ] Calls onAdded after successful submit
- [ ] Shows loading state during submission

#### `Header`
- [ ] Displays user email
- [ ] Shows household name
- [ ] Logout navigates to login page

### Pages

#### Login Page
- [ ] Renders Google sign-in button
- [ ] Redirects to dashboard when authenticated

#### Setup Page
- [ ] Create household flow works
- [ ] Join household flow works
- [ ] Validates join code format

#### Settings Pages
- [ ] Categories page renders category list
- [ ] Can add new category
- [ ] Can delete unused category
- [ ] Payers page renders payer list
- [ ] Can update payer display name

---

## Phase 3: Mobile App (apps/mobile)

### Setup
- [ ] Configure Jest for React Native
- [ ] Install @testing-library/react-native
- [ ] Mock expo-sqlite for unit tests
- [ ] Add test scripts to package.json

### Database Layer (`src/db/expenseRepo.ts`)

#### Expense CRUD
- [ ] `addExpense` inserts with correct fields
- [ ] `getExpensesByMonth` filters by date range
- [ ] `getExpenseById` returns single expense
- [ ] `updateExpense` updates correct fields
- [ ] `deleteExpense` soft-deletes (sets deleted=1)

#### Month Summary
- [ ] `getMonthSummary` calculates totals correctly
- [ ] Groups by payer correctly
- [ ] Groups by category correctly

#### Export/Import
- [ ] `exportDatabase` returns all data
- [ ] `isValidDatabaseExport` validates structure
- [ ] `isValidDatabaseExport` rejects invalid data
- [ ] `importDatabase` replaces all data

#### Categories
- [ ] `getAllCategories` returns ordered list
- [ ] `addCategory` appends at end
- [ ] `deleteCategory` fails if in use

#### Payers
- [ ] `getAllPayers` returns all payers
- [ ] `addPayer` validates ID format
- [ ] `deletePayer` fails if in use

### Zustand Stores

#### `useMonthStore`
- [ ] Initial state has current month
- [ ] `setSelectedMonth` updates state
- [ ] `loadMonthData` fetches expenses and summary
- [ ] `refreshData` reloads current month

#### `useSettingsStore`
- [ ] Loads categories on init
- [ ] Loads payers on init
- [ ] Provides category/payer lookup

#### `useAppearanceStore`
- [ ] Persists theme preference
- [ ] Toggles between light/dark

#### `useAuthStore`
- [ ] Stores session
- [ ] Provides sign-out functionality

### Components

#### `BottomNav`
- [ ] Renders navigation tabs
- [ ] Highlights active tab

#### `CategoryPicker`
- [ ] Displays all categories
- [ ] Calls onSelect with correct category

#### `PayerChip`
- [ ] Displays payer name
- [ ] Toggles selection on press

#### `TotalsTables`
- [ ] Renders summary data
- [ ] Formats amounts correctly

---

## Phase 4: Integration Tests

### Web + Supabase
- [ ] Full expense CRUD flow
- [ ] Month navigation loads correct data
- [ ] Multi-user household isolation (RLS)

### Mobile + SQLite
- [ ] Full expense CRUD flow
- [ ] Data persists across sessions
- [ ] Export/Import round-trip

---

## Test Commands

```bash
# Run all tests
pnpm test

# Run shared package tests
pnpm test:shared

# Run web tests
pnpm test:web

# Run mobile tests (when configured)
cd apps/mobile && npm test

# Watch mode
pnpm --filter @expenses/shared test:watch
pnpm --filter @expenses/web test:watch

# Coverage
pnpm --filter @expenses/shared test:coverage
```

---

## Current Test Summary

| Package | Tests | Passing | Coverage |
|---------|-------|---------|----------|
| packages/shared | 49 | 49 | - |
| apps/web | 3 | 3 | - |
| apps/mobile | 0 | - | - |
| **Total** | **52** | **52** | - |

---

## Coverage Goals

| Package | Target Coverage |
|---------|-----------------|
| packages/shared | 95%+ (pure functions) |
| apps/web | 80%+ |
| apps/mobile | 70%+ |

---

## Testing Best Practices

1. **Test behavior, not implementation** - Focus on what the function does, not how
2. **One assertion per test** - Makes failures easier to diagnose
3. **Descriptive test names** - Should read like documentation
4. **Arrange-Act-Assert** - Structure tests consistently
5. **Mock external dependencies** - Supabase, SQLite, navigation
6. **Test edge cases** - Empty arrays, null values, boundaries
