# Expenses - Minimal Expense Tracking App

A minimal expense-tracking app for two people (Karam + Kazi) built with React Native and Expo.

## Features

- **Monthly Summary**: View expenses by month with navigation between months
- **Add Expenses**: Quick expense entry with amount, payer, date, category, and optional notes
- **Totals & Breakdowns**:
  - Monthly totals by person
  - Category breakdown showing spending by person and category
- **Local Storage**: Uses SQLite for local-only storage (sync-ready schema for future)
- **Configurable Categories & Payers**: Manage categories and payers through the Settings screen (no code changes required!)
- **Data Import/Export**: Backup and restore your expense data via JSON files

## Tech Stack

- **Framework**: Expo SDK 51+ with TypeScript
- **Navigation**: expo-router
- **Database**: expo-sqlite (raw SQL, stores money as integer cents)
- **State Management**: Zustand
- **Date Handling**: date-fns
- **Styling**: React Native components
- **Target Platform**: Android first (APK via EAS), iOS simulator for dev

## Getting Started

### Prerequisites

- Node.js (18+)
- npm or yarn
- Expo CLI
- For APK builds: EAS CLI

### Installation

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start the development server**

   ```bash
   npx expo start
   ```

3. **Run on Android**

   ```bash
   npm run android
   ```

4. **Run on iOS (simulator)**

   ```bash
   npm run ios
   ```

### Development

#### Database Seed Data

The app can seed sample expenses for testing in development mode. To enable seeding:

1. **Set the environment variable**

   Create or edit `.env` in the project root:

   ```env
   EXPO_PUBLIC_SEED=1
   ```

2. **Start the development server**

   ```bash
   npx expo start
   ```

   Seed data will only be inserted when both conditions are met:

   - Running in development mode (`__DEV__ === true`)
   - `EXPO_PUBLIC_SEED` environment variable is set to `'1'`

**Important**: Seed data will NOT run or ship in production builds. The seed logic is dynamically imported only in development, ensuring it's tree-shaken in production bundles.

#### Database Schema

**Note**: As of v2, categories and payers are now stored in the database and configurable via the Settings screen.

```sql
-- Expenses table
CREATE TABLE expenses (
  id TEXT PRIMARY KEY,                 -- UUID
  amount_cents INTEGER NOT NULL,      -- Money stored as cents
  paid_by TEXT NOT NULL,              -- References payers(id)
  date TEXT NOT NULL,                 -- 'YYYY-MM-DD'
  note TEXT NULL,                     -- Optional note
  category TEXT NOT NULL,             -- References categories(name)
  created_at TEXT NOT NULL,           -- ISO timestamp
  updated_at TEXT NOT NULL,           -- ISO timestamp
  deleted INTEGER NOT NULL DEFAULT 0, -- Soft delete flag
  dirty INTEGER NOT NULL DEFAULT 0,   -- Sync flag for future use
  FOREIGN KEY (paid_by) REFERENCES payers(id),
  FOREIGN KEY (category) REFERENCES categories(name)
);

-- Categories table (configurable via Settings)
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_order INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Payers table (configurable via Settings)
CREATE TABLE payers (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

**Default Categories**: Groceries, Rent, Mortgage, Electricity, Electricity network, Garbage collection, Internet, Bensin, House insurance, Car insurance, Eating out, Kid

**Default Payers**:

- `hubby` (Karam)
- `wifey` (Kazi)

## Building for Production

### Android APK

1. **Install EAS CLI** (if not already installed)

   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**

   ```bash
   eas login
   ```

3. **Build APK**

   ```bash
   eas build -p android --profile preview
   ```

The APK will be available for download from the EAS build dashboard.

### Configuration

- **App Name**: Expenses
- **Android Package**: com.karam.mvpexpenses
- **Currency**: SEK (Swedish Krona)

## Project Structure

```text
app/
  (tabs)/
    index.tsx        # Monthly Summary screen (Home)
    settings.tsx     # Settings screen (Categories & Payers management)
  _layout.tsx        # Root navigation layout
  add.tsx            # Add Expense modal
  edit/
    [id].tsx         # Edit Expense modal

src/
  db/
    sqlite.ts        # Database setup, migrations, and helpers
    expenseRepo.ts   # Expense CRUD + category/payer operations
    schema.ts        # TypeScript types for database entities

  store/
    useMonthStore.ts      # Zustand store for month navigation
    useSettingsStore.ts   # Zustand store for categories/payers

  utils/
    money.ts         # Money formatting utilities (SEK)
    date.ts          # Date handling utilities

  components/
    PayerChip.tsx        # User badge component
    CategoryPicker.tsx   # Category selection modal
    TotalsTables.tsx     # Summary tables component
    BottomNav.tsx        # Bottom navigation bar
```

## Usage

### Adding an Expense

1. Tap the **+** button on the main screen
2. Enter the **amount** in SEK (e.g., "123.45")
3. Select who **paid** (Karam or Kazi)
4. Set the **date** (defaults to today)
5. Choose a **category** from the predefined list
6. Add an optional **note**
7. Tap **Save**

### Viewing Monthly Data

- Use **‹** and **›** buttons to navigate between months
- View **total spending** by person
- See **category breakdown** in a detailed table
- Browse the **expense list** for the selected month

### Managing Categories and Payers

Navigate to the **Settings** tab to customize categories and payers:

#### Categories

- **View all categories** in display order
- **Add new categories** - just enter a name and tap "Add"
- **Delete categories** - tap the delete button (only allowed if no expenses use that category)
- Categories are instantly available in the expense entry form

#### Payers

- **View all payers** with their ID and display name
- **Add new payers** - enter a unique ID (lowercase, e.g., "john") and display name
- **Edit display names** - tap "Edit" to change how a payer's name appears
- **Delete payers** - tap "Delete" (only allowed if no expenses use that payer)
- The payer ID is used internally and cannot be changed once created

**Important**: Deleting a category or payer is only allowed if no expenses reference it. This prevents data integrity issues.

## Data Model

- **Categories**: Dynamically managed via Settings screen, stored in database
- **Payers**: Dynamically managed via Settings screen, stored in database
- **Currency**: All amounts in SEK, stored as integer cents
- **Dates**: ISO format (YYYY-MM-DD)
- **Storage**: Local SQLite database, schema prepared for future sync

## Implemented Features (v2)

✅ **Configurable Categories** - Add, delete, and reorder categories without code changes  
✅ **Configurable Payers** - Add, edit, and delete payers through the UI  
✅ **Data Export/Import** - Backup and restore via JSON files  
✅ **Database Migrations** - Automatic schema upgrades on app start

## Future Enhancements

- Cloud sync and backup
- Export to CSV/Excel
- Charts and analytics
- Multiple currencies
- Receipt attachments
- Push notifications
- Recurring expenses
- Budget tracking

## License

Private project for personal use.

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
