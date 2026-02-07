# Architecture Documentation

This document explains the architectural decisions, patterns, and structure of the Expenses project.

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Monorepo Structure](#monorepo-structure)
- [Data Layer](#data-layer)
- [Authentication & Authorization](#authentication--authorization)
- [State Management](#state-management)
- [Key Design Decisions](#key-design-decisions)
- [Future Considerations](#future-considerations)

## Overview

Expenses is a multi-platform expense tracking application built as a pnpm monorepo with:

- **Mobile App**: React Native/Expo app with offline-first SQLite storage
- **Web App**: Next.js dashboard with Supabase backend
- **Shared Package**: Common TypeScript types and utilities

### Design Goals

1. **Simplicity**: Minimal UI, easy to use
2. **Multi-tenant**: Support multiple households
3. **Offline-First**: Mobile app works without internet
4. **Type Safety**: Full TypeScript with strict mode
5. **Testability**: Comprehensive test coverage
6. **Security**: Input validation, RLS, proper auth

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client Layer                        │
├────────────────────────┬────────────────────────────────┤
│   Mobile App (Expo)    │    Web App (Next.js)          │
│   - React Native UI    │    - Server Components        │
│   - SQLite Local DB    │    - Client Components        │
│   - Zustand State      │    - API Routes               │
│   - Offline-First      │    - Zustand State            │
└────────────────────────┴────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Shared Package (@expenses/shared)          │
│   - Type Definitions (ExpenseRow, PayerRow, etc.)      │
│   - Utility Functions (money, date formatting)         │
│   - Validation Logic (input validators)                │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   Backend Services                      │
├────────────────────────┬────────────────────────────────┤
│   SQLite (Mobile)      │    Supabase (Web)             │
│   - Local storage      │    - PostgreSQL database      │
│   - Migrations         │    - Row Level Security       │
│   - Future: Sync       │    - Real-time subscriptions  │
└────────────────────────┴────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Authentication (Supabase Auth)             │
│   - Google OAuth                                        │
│   - Session Management                                  │
│   - PKCE Flow (Mobile)                                  │
└─────────────────────────────────────────────────────────┘
```

## Monorepo Structure

### Why Monorepo?

- **Code Sharing**: Types and utilities shared between mobile and web
- **Consistency**: Single source of truth for business logic
- **Atomic Changes**: Update types across all packages in one commit
- **Simplified Dependencies**: Manage versions centrally

### Package Layout

```
expenses-monorepo/
├── apps/
│   ├── mobile/          # React Native/Expo mobile app
│   │   ├── app/         # Expo Router routes
│   │   ├── src/
│   │   │   ├── components/   # Reusable UI components
│   │   │   ├── db/           # SQLite database layer
│   │   │   ├── store/        # Zustand state management
│   │   │   ├── theme/        # Theme system (colors, tokens)
│   │   │   ├── utils/        # Mobile-specific utilities
│   │   │   └── features/     # Feature-specific code
│   │   └── assets/      # Images, fonts
│   │
│   └── web/             # Next.js web dashboard
│       ├── src/
│       │   ├── app/          # Next.js App Router pages
│       │   ├── components/   # React components
│       │   ├── lib/          # Utilities, queries, hooks
│       │   └── middleware.ts # Auth middleware
│       └── public/      # Static assets
│
└── packages/
    └── shared/          # Shared types and utilities
        └── src/
            ├── types.ts      # TypeScript types
            ├── validators.ts # Input validation
            └── utils/        # Date, money utilities
```

## Data Layer

### Mobile: SQLite

**Why SQLite?**
- Offline-first: Works without internet
- Fast: Local database queries
- Mature: Well-tested, stable
- Future-proof: Prepared for sync

**Schema Design**

```sql
-- Expenses: Main data table
CREATE TABLE expenses (
  id TEXT PRIMARY KEY,              -- UUID
  amount_cents INTEGER NOT NULL,    -- Money as integer cents
  paid_by TEXT NOT NULL,            -- References payers(id)
  date TEXT NOT NULL,               -- 'YYYY-MM-DD'
  note TEXT NULL,
  category TEXT NOT NULL,           -- References categories(name)
  created_at TEXT NOT NULL,         -- ISO timestamp
  updated_at TEXT NOT NULL,
  deleted INTEGER NOT NULL DEFAULT 0, -- Soft delete
  dirty INTEGER NOT NULL DEFAULT 0,   -- Sync flag
  FOREIGN KEY (paid_by) REFERENCES payers(id),
  FOREIGN KEY (category) REFERENCES categories(name)
);

-- Categories: User-configurable expense categories
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_order INTEGER NOT NULL,
  created_at TEXT NOT NULL
);

-- Payers: People who pay for expenses
CREATE TABLE payers (
  id TEXT PRIMARY KEY,              -- e.g., "hubby", "wifey"
  display_name TEXT NOT NULL,       -- e.g., "Karam", "Kazi"
  created_at TEXT NOT NULL
);

-- Settings: App configuration
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
```

**Migration Strategy**

Versioned migrations in `apps/mobile/src/db/sqlite.ts`:
- Version tracked via `PRAGMA user_version`
- Migrations run on app start
- Backwards compatible (no data loss)

### Web: Supabase (PostgreSQL)

**Why Supabase?**
- Managed PostgreSQL: No server maintenance
- Row Level Security: Built-in multi-tenant security
- Real-time: WebSocket subscriptions (future)
- Auth Integration: Google OAuth built-in

**Schema Design**

```sql
-- Households: Group of users sharing expenses
CREATE TABLE households (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  join_code TEXT UNIQUE NOT NULL,  -- For inviting users
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles: User accounts linked to Supabase auth
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
  household_id UUID REFERENCES households,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  payer_id TEXT,                    -- Links to payers
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expenses: Same structure as mobile, plus household_id
CREATE TABLE expenses (
  id UUID PRIMARY KEY,
  household_id UUID NOT NULL REFERENCES households,
  amount_cents INTEGER NOT NULL,
  paid_by TEXT NOT NULL,
  date DATE NOT NULL,
  note TEXT,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users
);

-- Categories: Per-household categories
CREATE TABLE categories (
  id UUID PRIMARY KEY,
  household_id UUID NOT NULL REFERENCES households,
  name TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(household_id, name)
);

-- Payers: Per-household payers
CREATE TABLE payers (
  id TEXT NOT NULL,                 -- e.g., "hubby"
  household_id UUID NOT NULL REFERENCES households,
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id, household_id)
);
```

**Row Level Security (RLS)**

All queries must filter by `household_id`:

```sql
-- RLS Policy Example
CREATE POLICY "Users can view own household expenses"
ON expenses FOR SELECT
USING (
  household_id IN (
    SELECT household_id FROM profiles 
    WHERE id = auth.uid()
  )
);
```

### Data Synchronization (Future)

The `dirty` flag in mobile SQLite prepares for future sync:

1. User makes changes offline → `dirty = 1`
2. App comes online → Query dirty records
3. Push to Supabase → If successful, set `dirty = 0`
4. Conflict resolution: Last-write-wins or user prompt

## Authentication & Authorization

### Mobile: Google OAuth + Supabase

```
┌─────────┐                    ┌──────────┐                ┌──────────┐
│  User   │────(1) Tap login───▶│  Mobile  │────(2) OAuth──▶│  Google  │
└─────────┘                    │   App    │◀───(3) Token───┘  OAuth   │
                               └──────────┘                └──────────┘
                                    │   ▲
                         (4) Auth   │   │ (6) Session
                          with PKCE │   │
                                    ▼   │
                               ┌──────────┐
                               │ Supabase │
                               │   Auth   │
                               └──────────┘
```

**Implementation**:
- Uses `expo-auth-session` with PKCE flow
- Tokens stored in `expo-secure-store`
- Session refreshed automatically
- Callback URL: `expenses://auth/callback`

### Web: Server-Side Auth

```
┌─────────┐                    ┌──────────┐                ┌──────────┐
│  User   │────(1) Login───────▶│ Next.js  │────(2) OAuth──▶│  Google  │
└─────────┘                    │   Web    │◀───(3) Token───┘  OAuth   │
                               └──────────┘                └──────────┘
                                    │   ▲
                                    │   │
                         (4) Create │   │ (5) Set
                          Supabase  │   │  Cookie
                           Session  │   │
                                    ▼   │
                               ┌──────────┐
                               │ Supabase │
                               │   Auth   │
                               └──────────┘
```

**Implementation**:
- Middleware checks auth on all protected routes
- Server/Client Supabase clients for different contexts
- Cookies for session management
- Automatic redirect to login if unauthenticated

## State Management

### Zustand Stores

**Why Zustand?**
- Simple: No boilerplate
- TypeScript: Full type support
- Performant: Selective re-renders
- Flexible: Works with React and React Native

**Store Architecture**

```typescript
// Pattern: State + Actions
interface MonthStore {
  // State
  selectedMonth: string;
  expenses: ExpenseRow[];
  loading: boolean;
  error: string | null;
  
  // Actions
  setSelectedMonth: (month: string) => void;
  loadMonthData: () => Promise<void>;
  addExpense: (input: AddExpenseInput) => Promise<void>;
}
```

**Stores**:

1. **`useMonthStore`**: Month navigation and expense data
2. **`useSettingsStore`**: Categories and payers
3. **`useAuthStore`**: Authentication state
4. **`useAppearanceStore`**: Theme preferences

### Data Flow

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│  Component   │────Read──▶│  Zustand     │◀───Load───│  Database    │
│  (UI Layer)  │         │   Store      │         │  (SQLite/    │
│              │◀──Update──│              │────Save───▶│  Supabase)   │
└──────────────┘         └──────────────┘         └──────────────┘
```

## Key Design Decisions

### 1. Money as Integer Cents

**Decision**: Store all money as integer cents, not floats.

**Rationale**:
- Floating-point arithmetic is imprecise
- `0.1 + 0.2 !== 0.3` in JavaScript
- Financial calculations require exact precision

**Implementation**:
```typescript
// Store: 12345 cents
// Display: "123.45 SEK"
const cents = parseAmountInput("123.45"); // → 12345
const display = formatSEK(12345);         // → "123.45 SEK"
```

### 2. Dates as Strings (YYYY-MM-DD)

**Decision**: Store dates as ISO format strings, not Date objects.

**Rationale**:
- Date objects have timezone issues
- Strings are portable across systems
- SQLite uses TEXT for dates
- Easy to query by month: `date LIKE '2024-01%'`

### 3. Soft Deletes

**Decision**: Use `deleted` flag instead of hard deletes.

**Rationale**:
- Preserve data for audit trails
- Enable undo functionality
- Support data sync (sync deletions)
- Prevent foreign key violations

### 4. Pnpm Workspaces

**Decision**: Use pnpm monorepo instead of separate repos.

**Rationale**:
- Single source of truth for types
- Simplified dependency management
- Atomic commits across packages
- Better code sharing

### 5. Validation in Shared Package

**Decision**: Centralize validation logic in `packages/shared`.

**Rationale**:
- Consistent validation rules
- Reuse between mobile and web
- Testable in isolation
- Type-safe validators

### 6. Theme System (Mobile)

**Decision**: Centralized theme with hooks (`useColors`, `useSpacing`).

**Rationale**:
- Easy to support light/dark modes
- Consistent design tokens
- Avoids hardcoded colors
- Accessible theme switching

## Future Considerations

### Planned Features

1. **Data Synchronization**
   - Mobile ↔ Supabase sync
   - Conflict resolution
   - Offline queue

2. **Analytics & Charts**
   - Spending trends
   - Category breakdowns
   - Budget tracking

3. **Export/Import**
   - CSV export
   - PDF reports
   - Data portability

### Scalability

**Current Limitations**:
- Mobile: SQLite scales to ~100K expenses easily
- Web: Supabase free tier (500MB database)
- No pagination (assumes monthly views small enough)

**Scaling Strategy**:
- Add pagination for large datasets
- Implement data archiving
- Use Supabase connection pooling
- Cache frequently accessed data

### Performance

**Optimizations**:
- Query only current month data
- Index on `date` and `household_id`
- Lazy load expense details
- Memoize expensive calculations

### Security

**Current Measures**:
- Input validation
- Parameterized queries
- Row Level Security
- Secure token storage

**Future Enhancements**:
- Rate limiting
- Audit logging
- Encryption at rest (mobile)
- 2FA support

## Testing Strategy

### Test Pyramid

```
        ┌───────────┐
       / E2E Tests  / (Few, slow, expensive)
      ├────────────┤
     / Integration / (Some, medium)
    ├─────────────┤
   / Unit Tests   / (Many, fast, cheap)
  └──────────────┘
```

**Current State**:
- ✅ Shared package: 93 unit tests
- ✅ Web app: 6 test files (components, calculations)
- ❌ Mobile app: No tests yet

**Target**:
- 80%+ code coverage on shared and web
- Component tests for critical UI
- Integration tests for auth flows

## Documentation

**Maintained Documents**:
- `README.md`: Getting started, features
- `CONTRIBUTING.md`: Development workflow
- `SECURITY.md`: Security practices
- `ARCHITECTURE.md`: This document
- `ROADMAP.md`: Planned features

**Code Documentation**:
- JSDoc comments on public APIs
- Inline comments for complex logic
- Type annotations everywhere

## Decision Log

| Date       | Decision                     | Rationale                           |
|------------|------------------------------|-------------------------------------|
| 2024-11    | Use pnpm monorepo            | Code sharing, type consistency      |
| 2024-12    | Add Supabase for web         | Multi-tenant, managed backend       |
| 2025-01    | Centralize validation        | Consistency, reusability            |
| 2026-02    | Add comprehensive docs       | Maintainability, onboarding         |

---

**Last Updated**: 2026-02-07  
**Version**: 2.0
