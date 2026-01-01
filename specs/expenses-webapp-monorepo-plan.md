# Expenses Web App - Implementation Plan

## Overview
Create a Next.js web app that shares data with the existing Expo mobile app via Supabase. Both apps will sync to Supabase PostgreSQL as the single source of truth.

**Key Decisions:**
- **Data Sharing**: Shared household model - both you and your wife see all expenses
- **Styling**: Tailwind CSS (fast, modern, great for web)

## Architecture Decision

```
┌─────────────────────────────────────────────────────────────────┐
│                         MONOREPO                                │
├─────────────────────────────────────────────────────────────────┤
│  apps/                                                          │
│    ├── mobile/          (existing Expo app, moved here)         │
│    └── web/             (new Next.js app)                       │
│                                                                 │
│  packages/                                                      │
│    └── shared/          (shared types, constants, utils)        │
│                                                                 │
│  supabase/                                                      │
│    └── migrations/      (database migrations)                   │
└─────────────────────────────────────────────────────────────────┘
```

## Key Files to Reference

**Current Mobile App Structure:**
- `src/db/schema.ts` - Types for Category, PayerId, ExpenseRow
- `src/db/expenseRepo.ts` - CRUD operations, data interfaces
- `src/db/sqlite.ts` - SQLite schema (tables: expenses, categories, payers, app_settings)
- `src/db/supabaseClient.ts` - Supabase client setup
- `src/store/useAuthStore.ts` - Auth state management
- `src/lib/useGoogleSignIn.ts` - OAuth flow
- `src/theme/` - Theming system
- `app/(tabs)/index.tsx` - Main dashboard
- `app/add.tsx` - Add expense form

---

## Phase 1: Supabase Backend Setup

### 1.1 Create Supabase Tables
Create PostgreSQL tables matching the SQLite schema:

```sql
-- households (for sharing between users)
CREATE TABLE households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- users profile (linked to auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  household_id UUID REFERENCES households(id),
  display_name TEXT NOT NULL,
  payer_id TEXT, -- maps to payers.id for this user
  created_at TIMESTAMPTZ DEFAULT now()
);

-- payers (hubby, wifey)
CREATE TABLE payers (
  id TEXT PRIMARY KEY,
  household_id UUID REFERENCES households(id) NOT NULL,
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- categories
CREATE TABLE categories (
  id TEXT NOT NULL,
  household_id UUID REFERENCES households(id) NOT NULL,
  name TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (id, household_id)
);

-- expenses
CREATE TABLE expenses (
  id TEXT PRIMARY KEY,
  household_id UUID REFERENCES households(id) NOT NULL,
  amount_cents INTEGER NOT NULL,
  paid_by TEXT NOT NULL,
  date DATE NOT NULL,
  note TEXT,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id)
);
```

### 1.2 Row Level Security (RLS)
Enable RLS so users only see their household's data:

```sql
-- Enable RLS on all tables
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access expenses from their household
CREATE POLICY "Users can access their household expenses"
  ON expenses FOR ALL
  USING (
    household_id IN (
      SELECT household_id FROM profiles WHERE id = auth.uid()
    )
  );
```

### 1.3 Database Functions
Create helper functions for common operations (e.g., get month summary).

---

## Phase 2: Monorepo Setup

### 2.1 Restructure Project
```bash
# Create new structure
mkdir -p apps/mobile apps/web packages/shared supabase/migrations

# Move current mobile app
mv app/ src/ assets/ apps/mobile/
mv package.json apps/mobile/
mv tsconfig.json apps/mobile/
mv app.json apps/mobile/
# ... etc
```

### 2.2 Create Root package.json
```json
{
  "name": "expenses-monorepo",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "web": "npm run dev --workspace=apps/web",
    "mobile": "npm run start --workspace=apps/mobile"
  }
}
```

### 2.3 Create Shared Package
Extract from mobile and share:
- **Types**: ExpenseRow, CategoryRow, PayerRow, MonthSummary, etc.
- **Constants**: Date formats, validation rules
- **Utils**: money.ts (formatAmount, parseAmountInput), date.ts

---

## Phase 3: Web App Implementation

### 3.1 Initialize Next.js App
```bash
cd apps/web
npx create-next-app@latest . --typescript --tailwind --eslint --app
npm install @supabase/supabase-js @supabase/ssr zustand date-fns
```

### 3.2 Core Pages & Components

| Route | Description | Status |
|-------|-------------|--------|
| `/` | Dashboard (monthly view, expense list, totals) | Done |
| `/add` | Add expense (modal/page) | Done (modal) |
| `/edit/[id]` | Edit expense | - |
| `/settings` | Settings menu | Done |
| `/settings/categories` | Manage categories | Done |
| `/settings/payers` | Manage payers | Done |
| `/settings/data` | Export/import | - |
| `/login` | Google OAuth login | Done |
| `/setup` | Household setup (create/join) | Done |

### 3.3 Component Structure
```
apps/web/src/
├── app/
│   ├── layout.tsx          # Root layout with auth provider
│   ├── page.tsx            # Dashboard (/)
│   ├── add/page.tsx        # Add expense
│   ├── edit/[id]/page.tsx  # Edit expense
│   ├── settings/
│   │   ├── page.tsx        # Settings menu
│   │   ├── categories/page.tsx
│   │   ├── payers/page.tsx
│   │   └── data/page.tsx
│   └── login/page.tsx      # Login page
├── components/
│   ├── expense-list.tsx
│   ├── expense-card.tsx
│   ├── month-navigator.tsx
│   ├── totals-table.tsx
│   ├── expense-form.tsx
│   ├── category-picker.tsx
│   └── payer-chip.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts       # Browser client
│   │   ├── server.ts       # Server client
│   │   └── middleware.ts   # Auth middleware
│   ├── hooks/
│   │   ├── use-expenses.ts
│   │   ├── use-categories.ts
│   │   └── use-payers.ts
│   └── stores/
│       ├── month-store.ts
│       └── auth-store.ts
└── styles/
    └── globals.css
```

### 3.4 Authentication Flow
Use Supabase's built-in Google OAuth (simpler than mobile):

```typescript
// Login with Google
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`
  }
});
```

### 3.5 Middleware (Route Protection)
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const supabase = createServerClient(...);
  const { data: { session } } = await supabase.auth.getSession();

  if (!session && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}
```

---

## Phase 4: Mobile App Updates (Sync)

### 4.1 Add Supabase Sync to Mobile
The mobile app currently uses SQLite locally. Add sync logic:

1. **On expense add/edit/delete**: Push to Supabase immediately (if online)
2. **On app start**: Pull latest from Supabase, merge with local
3. **Offline support**: Queue changes locally, sync when online

### 4.2 Sync Strategy
Use `updated_at` timestamps for conflict resolution (last-write-wins):

```typescript
async function syncExpenses() {
  // 1. Push dirty local records to Supabase
  const dirtyRecords = await query("SELECT * FROM expenses WHERE dirty = 1");
  for (const record of dirtyRecords) {
    await supabase.from('expenses').upsert(record);
    await exec("UPDATE expenses SET dirty = 0 WHERE id = ?", [record.id]);
  }

  // 2. Pull remote changes since last sync
  const lastSync = await getLastSyncTime();
  const { data } = await supabase
    .from('expenses')
    .select('*')
    .gt('updated_at', lastSync);

  // 3. Merge into local SQLite
  for (const expense of data) {
    await upsertLocalExpense(expense);
  }
}
```

---

## Phase 5: Deployment

### 5.1 Vercel Deployment
1. Connect GitHub repo to Vercel
2. Set root directory to `apps/web`
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 5.2 Supabase Configuration
1. Enable Google OAuth in Supabase Dashboard
2. Add authorized redirect URLs:
   - `https://your-app.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback`
3. Configure RLS policies

---

## Implementation Order

1. [x] **Supabase Backend** - Tables, RLS, seed data
2. [x] **Monorepo Setup** - Restructure, shared package
3. [x] **Web App Scaffold** - Next.js, auth, basic routing
4. [x] **Core Features** - Dashboard, add/edit, month navigation
5. [x] **Settings** - Categories, payers management
6. [ ] **Polish** - Theming, responsive design
7. [ ] **Mobile Sync** - Update mobile app to sync with Supabase
8. [ ] **Deploy** - Vercel + production Supabase config

---

## Considerations

### Free Tier Limits
| Service | Limit | Your Usage |
|---------|-------|------------|
| Supabase DB | 500MB | ~1KB per expense, years of headroom |
| Supabase Auth | 50K MAU | 2 users |
| Vercel Bandwidth | 100GB/mo | Minimal for 2 users |

### Security
- RLS ensures users only see their household's data
- Supabase handles auth tokens securely
- No secrets exposed to client (anon key is safe)

### Household Setup (Simplified for 2 users)
Since this is just for you and your wife:
1. First login (you) auto-creates a household
2. Share a simple join code with your wife
3. She signs in with Google → enters code → joins your household
4. Both now see all shared expenses

Alternatively, we can hardcode the household during setup since it's just 2 users.

---

## Tech Stack Summary

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14+ (App Router) |
| Styling | Tailwind CSS |
| State | Zustand (same as mobile) |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth (Google OAuth) |
| Hosting | Vercel (free tier) |
| Package Manager | pnpm (for monorepo workspaces) |
