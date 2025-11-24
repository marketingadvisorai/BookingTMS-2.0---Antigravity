# Current Task List & Requirements

## 1. Immediate TypeScript Error Resolution (High Priority)
The following files still contain TypeScript errors and need to be fixed to ensure a clean build (`npx tsc --noEmit`). These are mostly due to the "Game" vs "Activity" rename and missing type definitions.

### **Hooks**
- [ ] `src/hooks/useWidgets.ts`: Fix type mismatches in widget configuration.
- [ ] `src/hooks/venue/useVenues.ts`: Fix return types and Supabase query typing.
- [ ] `src/modules/inventory/hooks/useInventory.ts`: Update to use `Activity` types.

### **Services & Libs**
- [ ] `src/lib/bookings/bookingService.ts`: **CRITICAL**. Update booking logic to reference `activity_id` instead of `game_id` and fix type errors.
- [ ] `src/lib/payments/checkoutService.ts`: Update Stripe checkout session creation to use `activity` metadata.
- [ ] `src/lib/supabase/hooks.ts`: Fix generic type constraints.
- [ ] `src/modules/inventory/services/inventoryService.ts`: align with `ActivityService`.

### **Pages**
- [ ] `src/pages/Bookings.tsx`: Update booking list to show "Activity" details.
- [ ] `src/pages/BookingSuccess.tsx`: Fix type errors in confirmation display.
- [ ] `src/pages/Media.tsx`: Fix media upload types.

**Requirement**: Systematically go through these files and apply type fixes. Use `as any` only as a temporary bridge until `supabase.ts` is updated.

---

## 2. "Game" to "Activity" Refactoring (Strategic)
We are in the middle of renaming "Game" to "Activity" across the codebase. This is the root cause of most current errors.

- [ ] **`src/hooks/useGames.ts`**: Rename this file to `useActivities.ts`. Update all internal logic to query the `activities` table.
- [ ] **`src/types/supabase.ts`**: **CRITICAL REQUIREMENT**. This file is out of sync. It defines `games` but the DB has `activities`.
    - **Action**: Run `npx supabase gen types typescript --project-id <your-project-id> > src/types/supabase.ts` OR manually update the interface definitions.
- [ ] **UI Updates**: Search for user-facing strings "Game" and replace with "Activity" where appropriate.

---

## 3. Feature Completion: Activity Wizard & Widgets
Based on your open files, these areas need final polish:

- [ ] **`AddServiceItemWizard`**:
    - Verify `Step1BasicInfo.tsx`, `Step5Schedule.tsx`, `Step6PaymentSettings.tsx` are saving correctly to the `activities` table.
    - Ensure `TimeSlotGrid.tsx` correctly reads `activity` schedule rules.
- [ ] **Widget Settings**:
    - Update `ServiceItemsSettingsTab.tsx` to fetch and display `activities`.
    - Update `AvailabilitySettingsTab.tsx` to handle activity-based availability.

---

## 4. Verification Steps
1.  **Type Check**: Run `npx tsc --noEmit` until it returns zero errors.
2.  **Build Check**: Run `npm run build` to verify production build.
3.  **Manual Test**:
    - Create a new Organization.
    - Create a new Activity (using the Wizard).
    - Create a Booking for that Activity.
