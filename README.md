# Expenses - Minimal Expense Tracking App

A minimal expense-tracking app for two people (Karam + Kazi) built with React Native and Expo.

## Features

- **Monthly Summary**: View expenses by month with navigation between months
- **Add Expenses**: Quick expense entry with amount, payer, date, category, and optional notes
- **Totals & Breakdowns**:
  - Monthly totals by person
  - Category breakdown showing spending by person and category
- **Local Storage**: Uses SQLite for local-only storage (sync-ready schema for future)
- **Hardcoded Users**: Karam (you) and Kazi (partner)
- **Predefined Categories**: Groceries, Rent, Mortgage, Electricity, etc.

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

The app includes seed data for testing in development mode. On first run, it will create sample expenses for the current month.

#### Database Schema

```sql
CREATE TABLE expenses (
  id TEXT PRIMARY KEY,                 -- UUID
  amount_cents INTEGER NOT NULL,      -- Money stored as cents
  paid_by TEXT NOT NULL,              -- 'you' or 'partner'
  date TEXT NOT NULL,                 -- 'YYYY-MM-DD'
  note TEXT NULL,                     -- Optional note
  category TEXT NOT NULL,             -- From predefined categories
  created_at TEXT NOT NULL,           -- ISO timestamp
  updated_at TEXT NOT NULL,           -- ISO timestamp
  deleted INTEGER NOT NULL DEFAULT 0, -- Soft delete flag
  dirty INTEGER NOT NULL DEFAULT 0    -- Sync flag for future use
);
```

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
  _layout.tsx         # Root navigation layout
  index.tsx          # Monthly Summary screen
  add.tsx            # Add Expense screen

src/
  db/
    sqlite.ts        # Database setup and helpers
    expenseRepo.ts   # Expense CRUD operations

  store/
    useMonthStore.ts # Zustand store for month state

  utils/
    money.ts         # Money formatting utilities
    date.ts          # Date handling utilities
    seedData.ts      # Development seed data

  components/
    PayerChip.tsx      # User badge component
    CategoryPicker.tsx # Category selection modal
    TotalsTables.tsx   # Summary tables component
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

## Data Model

- **Users**: Hardcoded as 'you' (Karam) and 'partner' (Kazi)
- **Categories**: Fixed list of common expense categories
- **Currency**: All amounts in SEK, stored as integer cents
- **Dates**: ISO format (YYYY-MM-DD)
- **Storage**: Local SQLite database, schema prepared for future sync

## Future Enhancements (v1+)

- Cloud sync and backup
- Export to CSV
- Charts and analytics
- Custom categories
- Multiple currencies
- Receipt attachments
- Push notifications

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
