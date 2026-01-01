# Repository Guidelines

## Project Structure & Module Organization

- `app/` hosts Expo Router routes; `(tabs)/index.tsx` drives the monthly dashboard, `add.tsx` and `edit/[id].tsx` handle modal forms, `auth/index.tsx` provides the sign-in screen, and `_layout.tsx` wires navigation with authentication gating.
- `app/(tabs)/settings/` contains settings sub-routes: `index.tsx` (main menu), `appearance.tsx` (theme selection), `categories.tsx`, `payers.tsx`, `data-management.tsx`, `developer.tsx`, and `about.tsx`.
- `src/components/` provides reusable UI (e.g. `CategoryPicker.tsx`, `PayerChip.tsx`, `TotalsTables.tsx`), `src/store/` contains Zustand stores (`useMonthStore.ts`, `useSettingsStore.ts`, `useAppearanceStore.ts`, `useAuthStore.ts`), and `src/utils/` keeps formatting helpers (`money.ts`, `date.ts`).
- `src/db/` holds SQLite access (`sqlite.ts`, `expenseRepo.ts`, `settingsRepo.ts`, `schema.ts`) and the Supabase client (`supabaseClient.ts`); this should remain the single source of persistence and backend logic. Use `src/dev/seed.ts` for fixture seeding.
- `src/theme/` provides the centralized theming system: `colors.ts` (light/dark palettes), `tokens.ts` (spacing, typography), `ThemeProvider.tsx` (context and hooks), and `index.ts` (exports).
- `src/lib/` contains standalone hooks like `useGoogleSignIn.ts` for OAuth integration.
- `src/features/` organizes feature-specific screens; `auth/SignInScreen.tsx` handles Google sign-in UI.
- `assets/images/` stores shared imagery, while `app-example/` mirrors the starter template and includes `scripts/reset-project.js` used by `npm run reset-project`.

## Build, Test, and Development Commands

- `npm install` installs dependencies; rerun after updating Expo SDK or native modules. always use this registry when running `npm install`: `--registry https://registry.npmjs.org/`
- `npm start` (alias `npx expo start`) launches the bundler; pair with Expo Go or device simulators.
- `npm run android`, `npm run ios`, and `npm run web` target specific platforms; ensure the corresponding emulator/simulator is booted first.
- `npm run lint` runs `expo lint` with the Expo ESLint config; append `-- --fix` to auto-format.
- `npm run reset-project` restores the pristine starter by copying from `app-example/`; commit your work before using it.

## Authentication & Environment Setup

- Authentication uses Supabase with Google OAuth via `expo-auth-session`. The `useAuthStore` manages session state, while `useGoogleSignIn` handles the OAuth flow.
- The root layout (`app/_layout.tsx`) gates the app behind authentication; unauthenticated users see `SignInScreen`, authenticated users access the main tab navigator.
- Supabase sessions are persisted securely via `expo-secure-store` with PKCE flow enabled.
- Required environment variables (set in `.env` or EAS secrets):
  - `EXPO_PUBLIC_SUPABASE_URL` – Supabase project URL
  - `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` – Supabase anon/public key
  - `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` – Google OAuth web client ID
  - `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` – Google OAuth iOS client ID
  - `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` – Google OAuth Android client ID
- The app uses the `expenses` URL scheme for OAuth callbacks (`expenses://auth/callback`).

## Theming & Appearance

- The centralized theme system lives in `src/theme/`; use `useTheme()`, `useColors()`, `useSpacing()`, and `useTypography()` hooks to access theme values.
- Light and dark palettes are defined in `colors.ts`; always reference semantic tokens (e.g. `colors.text`, `colors.surface`) rather than hardcoding hex values.
- User theme preference (light/dark/system) is persisted in SQLite via `useAppearanceStore` and `settingsRepo.ts`.
- Wrap styled components with `useMemo(() => createStyles(theme), [theme])` to regenerate styles when theme changes.

## Coding Style & Naming Conventions

- Use TypeScript everywhere, prefer `const`, and keep component files in PascalCase (`TotalsTables.tsx`); hooks and stores follow `useName` patterns.
- Stick to 2-space indentation, double quotes, and trailing commas as enforced by the Expo lint preset; keep imports ordered from packages to relative paths.
- Localized SQL or formatting logic lives under `src/db/` and `src/utils/`; avoid duplicating helper code inside screens.
- For new screens, use the theme system from `src/theme/` rather than inline colors; follow the pattern in `SignInScreen.tsx` for theme-aware styling.

## Testing Guidelines

- No automated suite ships yet; exercise features through the Expo dev client and the Settings → Developer Tools seeding flow before raising a PR.
- When introducing tests, colocate `*.test.ts` files alongside the subject module or under `src/__tests__/`, use `@testing-library/react-native`, and document how to run them in the PR.

## Commit & Pull Request Guidelines

- Follow the existing history style (`feat: add manual data seeding controls`, `fix: ...`); keep the subject ≤72 characters and write in the imperative mood.
- Reference related issues or tickets in the body, and summarise behavioural changes plus manual test steps (device, platform, seed data applied).
- For UI work, attach before/after screenshots or short screen recordings; for database changes, include migration notes and seeding expectations.
- Ensure lint passes locally and mention any remaining TODOs so reviewers can track follow-ups.
