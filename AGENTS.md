# Repository Guidelines

## Project Structure & Module Organization

- `app/` hosts Expo Router routes; `(tabs)/index.tsx` drives the monthly dashboard, `add.tsx` and `edit/[id].tsx` handle modal forms, and `_layout.tsx` wires navigation.
- `src/components/` provides reusable UI (e.g. `CategoryPicker.tsx`), `src/store/` contains Zustand stores (`useMonthStore.ts`, `useSettingsStore.ts`), and `src/utils/` keeps formatting helpers (`money.ts`, `date.ts`).
- `src/db/` holds SQLite access (`sqlite.ts`, `expenseRepo.ts`, `schema.ts`) that should remain the single source of persistence logic; use `src/dev/seed.ts` for fixture seeding.
- `assets/images/` stores shared imagery, while `app-example/` mirrors the starter template and includes `scripts/reset-project.js` used by `npm run reset-project`.

## Build, Test, and Development Commands

- `npm install` installs dependencies; rerun after updating Expo SDK or native modules. always use this registry when running `npm install`: `--registry https://registry.npmjs.org/`
- `npm start` (alias `npx expo start`) launches the bundler; pair with Expo Go or device simulators.
- `npm run android`, `npm run ios`, and `npm run web` target specific platforms; ensure the corresponding emulator/simulator is booted first.
- `npm run lint` runs `expo lint` with the Expo ESLint config; append `-- --fix` to auto-format.
- `npm run reset-project` restores the pristine starter by copying from `app-example/`; commit your work before using it.

## Coding Style & Naming Conventions

- Use TypeScript everywhere, prefer `const`, and keep component files in PascalCase (`TotalsTables.tsx`); hooks and stores follow `useName` patterns.
- Stick to 2-space indentation, double quotes, and trailing commas as enforced by the Expo lint preset; keep imports ordered from packages to relative paths.
- Localized SQL or formatting logic lives under `src/db/` and `src/utils/`; avoid duplicating helper code inside screens.

## Testing Guidelines

- No automated suite ships yet; exercise features through the Expo dev client and the Settings → Developer Tools seeding flow before raising a PR.
- When introducing tests, colocate `*.test.ts` files alongside the subject module or under `src/__tests__/`, use `@testing-library/react-native`, and document how to run them in the PR.

## Commit & Pull Request Guidelines

- Follow the existing history style (`feat: add manual data seeding controls`, `fix: ...`); keep the subject ≤72 characters and write in the imperative mood.
- Reference related issues or tickets in the body, and summarise behavioural changes plus manual test steps (device, platform, seed data applied).
- For UI work, attach before/after screenshots or short screen recordings; for database changes, include migration notes and seeding expectations.
- Ensure lint passes locally and mention any remaining TODOs so reviewers can track follow-ups.
