# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A minimal expense-tracking app for two people built as a pnpm monorepo with three packages:
- **apps/mobile**: Expo/React Native app (primary)
- **apps/web**: Next.js web dashboard
- **packages/shared**: Shared TypeScript types and utilities

## Common Commands

```bash
# Install dependencies (always use this registry)
pnpm install --registry https://registry.npmjs.org/

# Mobile development
pnpm start:mobile              # Start Expo dev server
cd apps/mobile && npm run android   # Run on Android
cd apps/mobile && npm run ios       # Run on iOS simulator

# Web development
pnpm dev:web                   # Start Next.js dev server
pnpm build:web                 # Build for production

# Linting
pnpm lint                      # Lint all packages
cd apps/mobile && npm run lint -- --fix  # Auto-fix mobile

# Production builds
eas build -p android --profile preview   # Android APK via EAS
```

## Web App Testing (TDD)

Follow Test-Driven Development for the web app:
1. Write failing tests first
2. Implement minimal code to pass
3. Refactor while keeping tests green

```bash
cd apps/web && npm test              # Run test suite
cd apps/web && npm test -- --watch   # Watch mode
```

Colocate test files as `*.test.ts(x)` alongside source files or under `src/__tests__/`.

## Architecture

### Data Layer
- **Mobile**: SQLite with raw SQL (no ORM) via `expo-sqlite`
- **Web/Sync**: Supabase (PostgreSQL) with Row Level Security
- **Money**: Always stored as integer cents, never floats
- **Dates**: ISO format strings ('YYYY-MM-DD')

### Key Patterns
```typescript
// Money handling - use utilities from @expenses/shared
const cents = parseAmountInput("123.45");  // Returns 12345
const display = formatSEK(12345);          // Returns "123.45 SEK"

// Month navigation uses YYYY-MM format strings
useMonthStore.setSelectedMonth("2024-01");
```

### State Management
- **Zustand stores**: `useMonthStore` (expenses/navigation), `useSettingsStore` (categories/payers), `useAppearanceStore` (theme), `useAuthStore` (session)
- Month changes auto-trigger data loading via store subscriptions

### Database Schema (Supabase)
Multi-tenant via `household_id`:
- `households`: Groups users sharing expenses (join via `join_code`)
- `profiles`: User profiles linked to Supabase auth
- `expenses`: Main data table with soft delete (`deleted` flag)
- `categories`, `payers`: Household-scoped configuration

### Authentication
- Supabase Auth with Google OAuth via `expo-auth-session`
- Sessions persisted via `expo-secure-store` with PKCE
- URL scheme: `expenses://auth/callback`

### Theming
- Centralized in `src/theme/`; use `useTheme()`, `useColors()` hooks
- Reference semantic tokens (`colors.text`, `colors.surface`), not hex values
- Regenerate styles on theme change: `useMemo(() => createStyles(theme), [theme])`

## Environment Variables

Required in `.env` or EAS secrets:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
- `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`
- `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`

## Code Style

- TypeScript everywhere, 2-space indent, double quotes
- Components in PascalCase, hooks as `useName`
- SQL and formatting logic in `src/db/` and `src/utils/`
- Follow repository pattern in `expenseRepo.ts` for database operations

## Commit Style

Conventional commits: `feat:`, `fix:`, `chore:` with imperative mood, subject <= 72 chars.
