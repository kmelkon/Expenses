# Web App Redesign: Warm & Organic Design System

A comprehensive redesign plan for the Expenses web app with a warm, approachable aesthetic for couples.

---

## Progress Tracker

### Phase Completion

- [x] **Phase 1**: Design System Foundation (globals.css, fonts, utilities)
- [x] **Phase 2**: Install Dependencies (shadcn/ui, Radix, lucide-react)
- [x] **Phase 3**: Core UI Components (Button, Card, Input, Dialog, Avatar, etc.)
- [x] **Phase 4**: Navigation Components (Bottom Tab Bar, App Shell, Header)
- [x] **Phase 5**: Month Picker (Navigator update + Grid Picker Modal)
- [x] **Phase 6**: Page Redesigns (Dashboard, Login, Settings, etc.)
- [x] **Phase 7**: Future Feature Placeholders (Insights page, Chart placeholders)

### Detailed Task Breakdown

#### Phase 1: Design System Foundation
- [x] Update `globals.css` with terracotta/sage color tokens
- [x] Add border radius, shadow, and animation CSS variables
- [x] Replace Geist with Nunito font in `layout.tsx`
- [x] Create `lib/utils.ts` with `cn()` utility

#### Phase 2: Install Dependencies
- [x] Install `class-variance-authority`, `clsx`, `tailwind-merge`
- [x] Install `lucide-react` for icons
- [x] Install Radix primitives (`@radix-ui/react-dialog`, `@radix-ui/react-select`, `@radix-ui/react-slot`)
- [x] Create `components.json` (shadcn/ui config)

#### Phase 3: Core UI Components
- [x] Create `button.tsx` (pill-shaped, bouncy, variants)
- [x] Create `card.tsx` (floating, 24px radius, soft shadow)
- [x] Update `input.tsx` (pill shape, warm focus ring)
- [x] Update `label.tsx` (Nunito styling)
- [x] Update `select.tsx` (Radix-based, styled)
- [x] Create `dialog.tsx` (modal with backdrop blur)
- [x] Create `avatar.tsx` (circular, initials, gradient bg)
- [x] Create `tabs.tsx` (horizontal with animated indicator)
- [x] Create `icons.tsx` (lucide wrapper)
- [x] Update `index.ts` exports

#### Phase 4: Navigation Components
- [x] Create `navigation/bottom-tab-bar.tsx` (4 tabs, center notch)
- [x] Create `layout/app-shell.tsx` (wraps header + tabs + content)
- [x] Simplify `header.tsx` (minimal: title + avatar only)

#### Phase 5: Month Picker
- [x] Update `month-navigator.tsx` (pill buttons, clickable label)
- [x] Create `month-picker.tsx` (4x3 grid modal)

#### Phase 6: Page Redesigns
- [x] Redesign `dashboard.tsx` (AppShell, floating cards, gradient bg)
- [x] Redesign `totals-table.tsx` (side-by-side payer cards with avatars)
- [x] Redesign `expense-list.tsx` (grouped by date, category badges)
- [x] Redesign `add-expense-button.tsx` (styled modal form)
- [x] Redesign `login/page.tsx` (warm gradient, pill button)
- [x] Redesign `setup/page.tsx` (step-by-step, floating cards)
- [x] Redesign `settings/page.tsx` (AppShell, profile section)
- [x] Redesign `settings/categories/page.tsx` (floating cards)
- [x] Redesign `settings/payers/page.tsx` (avatars, inline edit)

#### Phase 7: Future Feature Placeholders
- [x] Create `app/insights/page.tsx` (placeholder page)
- [x] Create `charts/donut-chart-placeholder.tsx`
- [x] Create `charts/line-chart-placeholder.tsx`

---

## Design Vision

### Aesthetic Summary
| Aspect | Choice |
|--------|--------|
| Overall Style | Warm & Approachable |
| Target Users | Couples/Partners |
| Color Palette | Terracotta & Sage |
| Typography | Nunito (rounded sans-serif) |
| Corner Radius | Pill-shaped (24px+) |
| Cards | Floating with soft shadows |
| Animations | Playful micro-interactions |
| Data Density | Spacious & Focused |

### Color Palette: Terracotta & Sage

```css
/* Primary - Terracotta */
--terracotta-50:  #fdf5f3;
--terracotta-100: #fbe9e4;
--terracotta-200: #f8d5cc;
--terracotta-300: #f2b8a8;
--terracotta-400: #e89075;
--terracotta-500: #d96b4a;  /* Primary */
--terracotta-600: #c5523b;
--terracotta-700: #a5422f;
--terracotta-800: #883a2c;
--terracotta-900: #71342a;

/* Secondary - Sage */
--sage-50:  #f6f7f4;
--sage-100: #e9ebe3;
--sage-200: #d4d8c8;
--sage-300: #b8c0a5;
--sage-400: #99a481;
--sage-500: #7c8a62;  /* Secondary */
--sage-600: #616e4d;
--sage-700: #4d573e;
--sage-800: #404734;
--sage-900: #373d2e;

/* Neutrals - Warm */
--warm-50:  #fdfcfa;
--warm-100: #f7f5f0;
--warm-200: #ede9e0;
--warm-300: #ddd7ca;
--warm-400: #c4bba8;
--warm-500: #a99d87;
--warm-600: #8f8270;
--warm-700: #766a5a;
--warm-800: #62584d;
--warm-900: #534a42;
```

### Design Tokens

```css
/* Border Radius */
--radius-sm: 8px;
--radius-md: 16px;
--radius-lg: 24px;
--radius-card: 24px;
--radius-modal: 32px;
--radius-pill: 9999px;

/* Shadows (warm-tinted) */
--shadow-sm: 0 2px 8px rgba(83, 74, 66, 0.06);
--shadow-md: 0 4px 16px rgba(83, 74, 66, 0.08);
--shadow-lg: 0 8px 32px rgba(83, 74, 66, 0.12);
--shadow-float: 0 12px 40px rgba(83, 74, 66, 0.15);

/* Animations */
--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
--duration-fast: 150ms;
--duration-normal: 250ms;
```

---

## Architecture

### Navigation Structure

```
Bottom Tab Bar:
[ Home ]  [ Insights ]  [ + (Notch) ]  [ Settings ]
```

- **Home**: Dashboard with totals + expense list
- **Insights**: Charts and analytics (placeholder initially)
- **Add** (center notch): Opens modal to add expense
- **Settings**: Profile, categories, payers, logout

### Component Hierarchy

```
AppShell
├── MinimalHeader (title + avatar)
├── Main Content Area
│   └── Page-specific content
└── BottomTabBar
    ├── HomeTab
    ├── InsightsTab
    ├── AddButton (raised in notch)
    └── SettingsTab
```

### Month Picker Interaction

1. User sees: `< June 2025 >`
2. Clicking prev/next arrows changes month
3. Clicking "June 2025" opens grid picker modal
4. Modal shows 4x3 grid of months for selected year
5. User selects month, modal closes

---

## File Changes Overview

### New Files
```
apps/web/src/
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── avatar.tsx
│   │   ├── tabs.tsx
│   │   └── icons.tsx
│   ├── navigation/
│   │   └── bottom-tab-bar.tsx
│   ├── layout/
│   │   └── app-shell.tsx
│   ├── charts/
│   │   ├── donut-chart-placeholder.tsx
│   │   └── line-chart-placeholder.tsx
│   └── month-picker.tsx
├── app/
│   └── insights/page.tsx
├── lib/
│   └── utils.ts
└── components.json
```

### Modified Files
```
apps/web/src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── login/page.tsx
│   ├── setup/page.tsx
│   └── settings/**/*.tsx
└── components/
    ├── ui/
    │   ├── input.tsx
    │   ├── label.tsx
    │   ├── select.tsx
    │   └── index.ts
    ├── dashboard.tsx
    ├── header.tsx
    ├── expense-list.tsx
    ├── month-navigator.tsx
    ├── totals-table.tsx
    └── add-expense-button.tsx
```

---

## Verification Steps

After each phase:

1. **Run dev server**: `pnpm dev:web`
2. **Visual inspection**: Check all modified pages
3. **Interactions**: Test buttons, modals, tab switching
4. **Run tests**: `cd apps/web && npm test`
5. **Build check**: `pnpm build:web`

Final verification:
- Navigate through all tabs
- Add an expense via modal
- Change months via picker
- Check settings pages
- Verify responsive behavior
