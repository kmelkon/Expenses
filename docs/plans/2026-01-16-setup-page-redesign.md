# Setup Page Redesign

## Overview

Redesign `/setup` page with warm OurNest visual style. Three views with in-page transitions.

---

## Views

### 1. Selection (default)

**Layout:**
- Sticky header: OurNest logo + user avatar
- Welcome: "Welcome, {firstName}." + subtitle
- Two cards side-by-side (stack on mobile)
- "Log out of account" button at bottom
- Footer with copyright

**Cards:**

| Start a Home | Join a Home |
|--------------|-------------|
| `potted_plant` icon | `key` icon |
| Mint blobs | Blue blobs |
| Spinning decorative dots | Spinning decorative dots |
| Hover: lift, shadow, arrow | Same |

### 2. Create Form

**Container:** `max-w-[480px] rounded-[2.5rem] shadow-soft-xl`

**Content:**
- `potted_plant` icon in cream square
- "Name your household" heading
- Input: `bg-cream-bg rounded-2xl py-5 px-6`
- "Create Home" button: mint bg, arrow icon
- "Back to options" link

**Behavior:**
- `supabase.rpc("create_household", { p_name })`
- Error below input
- Success → `router.push("/")`

### 3. Join Form

**Container:** Same as Create

**Content:**
- `key` icon in blue square with ring
- "Enter invite code" heading
- Input: centered, `text-4xl tracking-[0.6em] maxLength={6}`
- "Join Home" button: accent-primary bg
- "Back" link

**Behavior:**
- `supabase.rpc("join_household", { p_join_code })`
- Error below input
- Success → `router.push("/")`

---

## State

```typescript
type SetupView = "select" | "create" | "join";
const [view, setView] = useState<SetupView>("select");
```

---

## Key Classes

```
// Card container
bg-white rounded-3xl p-10 hover:shadow-2xl hover:-translate-y-1

// Animated blob
absolute w-40 h-40 bg-pastel-mint/30 rounded-full
group-hover:scale-110 transition-transform duration-700

// Spinning dots
animate-[spin_10s_linear_infinite]

// Form card
bg-white rounded-[2.5rem] p-8 md:p-12 shadow-soft-xl

// Input
bg-cream-bg border-none rounded-2xl py-5 px-6
focus:ring-2 focus:ring-pastel-mint/50

// Join code input
text-4xl font-bold tracking-[0.6em] text-center
border-2 border-pastel-blue/30

// Primary button (create)
bg-pastel-mint hover:bg-[#ccebc5] rounded-2xl py-4

// Primary button (join)
bg-accent-primary text-white rounded-xl py-4
```

---

## Files

- `src/app/setup/page.tsx` - rewrite with new design

---

## Dependencies

- Existing: `@/lib/supabase/client`, `@/components/ui`
- User name from Supabase auth session
