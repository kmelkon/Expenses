# Expenses App - AI Coding Instructions

This is a minimal expense tracking app for two hardcoded users (Karam/"hubby" and Kazi/"wifey") built with Expo/React Native.

## Guidelines

ALWAYS create TODOs before starting a new task. Follow the TODOs to completion.

## Architecture Overview

- **Data Layer**: SQLite with raw SQL (no ORM) - money stored as integer cents, dates as 'YYYY-MM-DD' strings
- **State**: Zustand store (`useMonthStore`) manages month navigation and expense data
- **Navigation**: expo-router with file-based routing (Stack navigator)
- **Currency**: SEK (Swedish Krona) only, formatted with `formatSEK()` utility

## Key Patterns & Conventions

### Money Handling

Always use integer cents internally, never floating point:

```typescript
// Input: "123.45" -> Store: 12345 cents -> Display: "123.45 SEK"
const cents = parseAmountInput("123.45"); // Returns 12345
const display = formatSEK(12345); // Returns "123.45 SEK"
```

### User Identity System

Users are hardcoded as PayerId types: `"hubby"` (Karam) or `"wifey"` (Kazi). See `PayerChip` component for display mapping.

### Database Schema

Expenses table designed for future sync with `dirty` and `deleted` flags:

- `amount_cents`: INTEGER (never float)
- `paid_by`: TEXT CHECK constraint ('hubby'|'wifey')
- `date`: TEXT ('YYYY-MM-DD')
- `category`: TEXT with CHECK constraint (see `CATEGORIES` in sqlite.ts)
- `dirty`, `deleted`: INTEGER flags for future cloud sync

### Month Navigation

Central pattern using YYYY-MM format strings:

- `useMonthStore` handles month state and auto-loads data on month change
- Date utilities in `src/utils/date.ts` handle month arithmetic and boundaries
- UI shows formatted month names via `formatMonthDisplay()`

## Critical Development Workflows

### Local Development

```bash
npx expo start          # Start dev server
npm run android         # Android development
npm run ios             # iOS simulator
```

### Production Builds

```bash
eas build -p android --profile preview  # APK build via EAS
```

### Database Operations

- Initialize via `openDB()` in app startup (`app/_layout.tsx`)
- All queries through `src/db/expenseRepo.ts` repository pattern
- Seeds test data automatically in `__DEV__` mode

## Component Architecture

### Screen Components (`app/`)

- `index.tsx`: Monthly summary with navigation, expense list, totals tables
- `add.tsx`: Modal form for expense entry with category picker

### Reusable Components (`src/components/`)

- `PayerChip`: User badge with hardcoded styling (blue for "hubby", purple for "wifey")
- `CategoryPicker`: Modal with predefined category list from sqlite.ts
- `TotalsTables`: Summary tables showing totals by person and by category

## Integration Points

### Zustand Store Pattern

State automatically refreshes on month changes:

```typescript
setSelectedMonth(newMonth); // Triggers loadMonthData() automatically
```

### Expo Router Navigation

Modal presentation for add screen, uses push navigation:

```typescript
router.push("/add"); // Opens modal
router.back(); // Closes modal, triggers parent refresh
```

## Common Tasks

### Adding New Categories

1. Update `CATEGORIES` array in `src/db/sqlite.ts`
2. Update CHECK constraint in table schema
3. Consider migration for existing data

### Modifying Money Display

Use existing utilities in `src/utils/money.ts` - never work with floats directly

### Database Queries

Follow repository pattern in `expenseRepo.ts` - use `runSQL()` helpers, not direct SQLite calls

### Month Data Loading

Always use `useMonthStore` actions - they handle loading states and error handling automatically
