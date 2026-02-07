# API Documentation

This document describes the API structure, query functions, and data flow for the Expenses web application.

## Overview

The web app uses:
- **Backend**: Supabase (PostgreSQL with Row Level Security)
- **Authentication**: Supabase Auth with Google OAuth
- **API Style**: Server-side queries using Supabase client
- **State**: Zustand for client-side state management

## Table of Contents

- [Authentication](#authentication)
- [Database Schema](#database-schema)
- [Query Functions](#query-functions)
- [Security](#security)
- [Error Handling](#error-handling)

## Authentication

### Flow

```
1. User clicks "Sign in with Google"
2. Redirected to Google OAuth consent screen
3. After approval, redirected back with auth code
4. Supabase exchanges code for session tokens
5. Session stored in HTTP-only cookies
6. Middleware validates session on each request
```

### Protected Routes

All routes except `/login` and `/setup` require authentication:

```typescript
// middleware.ts checks auth before page load
export async function middleware(request: NextRequest) {
  const { user } = await createClient();
  
  if (!user && !publicPaths.includes(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}
```

### Session Management

- **Storage**: HTTP-only cookies (secure, not accessible via JavaScript)
- **Refresh**: Automatic token refresh by Supabase client
- **Expiry**: 1 hour (access token), 7 days (refresh token)

## Database Schema

### Tables

#### `households`

Groups users who share expenses.

| Column      | Type         | Description                    |
|-------------|--------------|--------------------------------|
| id          | UUID         | Primary key                    |
| name        | TEXT         | Household name                 |
| join_code   | TEXT         | Unique code for inviting users |
| created_at  | TIMESTAMPTZ  | Creation timestamp             |

#### `profiles`

User profiles linked to Supabase Auth.

| Column        | Type         | Description                     |
|---------------|--------------|--------------------------------|
| id            | UUID         | Primary key (refs auth.users)  |
| household_id  | UUID         | Household membership (nullable)|
| email         | TEXT         | User email                     |
| display_name  | TEXT         | User's display name            |
| payer_id      | TEXT         | Links to payers table          |
| created_at    | TIMESTAMPTZ  | Creation timestamp             |
| updated_at    | TIMESTAMPTZ  | Last update timestamp          |

#### `expenses`

Main expense records.

| Column        | Type         | Description                        |
|---------------|--------------|-----------------------------------|
| id            | UUID         | Primary key                       |
| household_id  | UUID         | Owner household (refs households) |
| amount_cents  | INTEGER      | Amount in cents (never float!)    |
| paid_by       | TEXT         | Payer ID                          |
| date          | DATE         | Expense date (YYYY-MM-DD)         |
| note          | TEXT         | Optional note                     |
| category      | TEXT         | Category name                     |
| created_at    | TIMESTAMPTZ  | Creation timestamp                |
| updated_at    | TIMESTAMPTZ  | Last update timestamp             |
| deleted       | BOOLEAN      | Soft delete flag                  |
| created_by    | UUID         | User who created (refs profiles)  |

#### `categories`

Per-household expense categories.

| Column         | Type         | Description                        |
|----------------|--------------|-----------------------------------|
| id             | UUID         | Primary key                       |
| household_id   | UUID         | Owner household                   |
| name           | TEXT         | Category name (unique per household)|
| display_order  | INTEGER      | Sort order                        |
| icon           | TEXT         | Optional icon identifier          |
| color          | TEXT         | Optional color hex code           |
| created_at     | TIMESTAMPTZ  | Creation timestamp                |

#### `payers`

Per-household payers (people).

| Column         | Type         | Description                        |
|----------------|--------------|-----------------------------------|
| id             | TEXT         | Payer ID (e.g., "hubby")          |
| household_id   | UUID         | Owner household                   |
| display_name   | TEXT         | Display name (e.g., "Karam")      |
| created_at     | TIMESTAMPTZ  | Creation timestamp                |

**Primary Key**: (id, household_id) - Composite key

### Row Level Security (RLS)

All tables enforce RLS policies to prevent data leaks:

```sql
-- Example: Expenses table policy
CREATE POLICY "Users can view own household expenses"
ON expenses FOR SELECT
USING (
  household_id IN (
    SELECT household_id FROM profiles 
    WHERE id = auth.uid()
  )
);

-- Similar policies exist for INSERT, UPDATE, DELETE
```

**Critical**: Every query MUST filter by `household_id` to leverage RLS.

## Query Functions

All query functions are in `src/lib/queries/expense-queries.ts`.

### `getExpensesForRange`

Fetch expenses within a date range.

```typescript
async function getExpensesForRange(
  supabase: SupabaseClient,
  householdId: string,
  startDate: string,  // 'YYYY-MM-DD'
  endDate: string     // 'YYYY-MM-DD'
): Promise<ExpenseRow[]>
```

**Example**:
```typescript
const expenses = await getExpensesForRange(
  supabase,
  user.household_id,
  '2024-01-01',
  '2024-01-31'
);
```

**Returns**: Array of `ExpenseRow` objects, sorted by date ascending.

**Errors**: Throws if Supabase query fails.

---

### `getExpensesForMonth`

Fetch expenses for a specific month.

```typescript
async function getExpensesForMonth(
  supabase: SupabaseClient,
  householdId: string,
  month: string  // 'YYYY-MM'
): Promise<ExpenseRow[]>
```

**Example**:
```typescript
const expenses = await getExpensesForMonth(
  supabase,
  user.household_id,
  '2024-01'
);
```

**Implementation**: Uses `monthBounds()` utility to calculate start/end dates, then calls `getExpensesForRange()`.

---

### `getExpensesForMonths`

Fetch expenses for multiple months efficiently.

```typescript
async function getExpensesForMonths(
  supabase: SupabaseClient,
  householdId: string,
  months: string[]  // ['YYYY-MM', 'YYYY-MM', ...]
): Promise<Map<string, ExpenseRow[]>>
```

**Example**:
```typescript
const expenseMap = await getExpensesForMonths(
  supabase,
  user.household_id,
  ['2024-01', '2024-02', '2024-03']
);

const janExpenses = expenseMap.get('2024-01') || [];
const febExpenses = expenseMap.get('2024-02') || [];
```

**Returns**: Map keyed by month string, values are expense arrays.

**Optimization**: Single query for entire date range, then groups by month client-side.

---

### `getExpensesWithPreviousMonth`

Fetch current month + previous month (useful for trends).

```typescript
async function getExpensesWithPreviousMonth(
  supabase: SupabaseClient,
  householdId: string,
  currentMonth: string  // 'YYYY-MM'
): Promise<{ current: ExpenseRow[]; previous: ExpenseRow[] }>
```

**Example**:
```typescript
const { current, previous } = await getExpensesWithPreviousMonth(
  supabase,
  user.household_id,
  '2024-02'
);

const trend = calculateTrend(current, previous);
```

**Use Case**: Dashboard showing current spending vs. last month.

## Security

### Required Filters

**All queries must include `household_id` filter**:

```typescript
// ✅ Good: Filtered by household
const { data } = await supabase
  .from('expenses')
  .select('*')
  .eq('household_id', householdId)
  .eq('deleted', false);

// ❌ Bad: No household filter - SECURITY RISK!
const { data } = await supabase
  .from('expenses')
  .select('*')
  .eq('deleted', false);
```

### Input Validation

**Always validate inputs before querying**:

```typescript
import { validateAddExpense } from '@expenses/shared';

// Validate before adding
const result = validateAddExpense(input);
if (!result.valid) {
  throw new Error(result.errors.join(', '));
}

// Safe to proceed
await supabase.from('expenses').insert({
  ...input,
  household_id: householdId,
});
```

### Household Verification

**Verify user belongs to household before operations**:

```typescript
async function verifyHouseholdAccess(
  supabase: SupabaseClient,
  userId: string,
  householdId: string
): Promise<boolean> {
  const { data } = await supabase
    .from('profiles')
    .select('household_id')
    .eq('id', userId)
    .single();
    
  return data?.household_id === householdId;
}
```

## Error Handling

### Query Errors

All Supabase queries should handle errors:

```typescript
try {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('household_id', householdId);
    
  if (error) throw error;
  
  return data || [];
} catch (error) {
  console.error('Failed to fetch expenses:', error);
  throw new Error('Failed to fetch expenses');
}
```

### Authentication Errors

```typescript
// Check if user is authenticated
const { data: { user }, error } = await supabase.auth.getUser();

if (error || !user) {
  redirect('/login');
}
```

### Validation Errors

```typescript
const result = validateAddExpense(input);

if (!result.valid) {
  // Return validation errors to client
  return {
    success: false,
    errors: result.errors,
  };
}
```

## Best Practices

### 1. Server Components

Fetch data in Server Components when possible:

```typescript
// app/dashboard/page.tsx
export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const expenses = await getExpensesForMonth(
    supabase,
    user.household_id,
    getCurrentMonth()
  );
  
  return <ExpenseList expenses={expenses} />;
}
```

### 2. Client Components

Use client components for interactivity:

```typescript
// components/add-expense-form.tsx
"use client";

export function AddExpenseForm() {
  async function handleSubmit(input: AddExpenseInput) {
    const result = validateAddExpense(input);
    if (!result.valid) {
      setErrors(result.errors);
      return;
    }
    
    await addExpense(input);
  }
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

### 3. Caching

Use Next.js caching for expensive queries:

```typescript
import { unstable_cache } from 'next/cache';

const getCachedExpenses = unstable_cache(
  async (householdId: string, month: string) => {
    return getExpensesForMonth(supabase, householdId, month);
  },
  ['expenses-by-month'],
  { revalidate: 60 } // Cache for 60 seconds
);
```

### 4. Optimistic Updates

For better UX, update UI before server response:

```typescript
const [expenses, setExpenses] = useState<ExpenseRow[]>([]);

async function addExpense(input: AddExpenseInput) {
  // Optimistic update
  const tempExpense = { ...input, id: 'temp-' + Date.now() };
  setExpenses(prev => [...prev, tempExpense]);
  
  try {
    const newExpense = await saveExpense(input);
    // Replace temp with real
    setExpenses(prev => 
      prev.map(e => e.id === tempExpense.id ? newExpense : e)
    );
  } catch (error) {
    // Revert on error
    setExpenses(prev => 
      prev.filter(e => e.id !== tempExpense.id)
    );
    throw error;
  }
}
```

## Future Enhancements

- **Real-time Subscriptions**: Listen for expense changes
- **Pagination**: For large datasets
- **Aggregation Queries**: Pre-calculated totals
- **GraphQL**: Consider GraphQL for complex queries
- **API Rate Limiting**: Prevent abuse

---

**Last Updated**: 2026-02-07
