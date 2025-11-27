# Current Task List & Requirements

## 1. Immediate TypeScript Error Resolution ✅ COMPLETED (Nov 27, 2025)
All TypeScript errors have been fixed. The codebase now passes `npx tsc --noEmit` with zero errors.

### **Fixed Issues**
- [x] `src/hooks/venue/useVenueManagement.ts`: Fixed type mismatches between VenueFormData/VenueInput and DBVenue types.
  - Added default timezone value for VenueInput creation
  - Applied proper type casting for mapUIVenueToDB return values
- [x] All other files now type-check correctly

### **Build Status**
- `npx tsc --noEmit` → ✅ Zero errors
- `npm run build` → ✅ Success (4.09s)

---

## 2. "Game" to "Activity" Refactoring (Partially Complete)
The core migration is done. `useGames.ts` is now a backward-compatibility wrapper.

- [x] **`src/hooks/useActivities.ts`**: Created and active - queries `activities` table
- [x] **`src/hooks/useGames.ts`**: Now a deprecated wrapper around `useActivities.ts` for backward compatibility
- [~] **Components using useGames**: 6 files still import useGames (low priority - wrapper handles this)
  - `VenueGamesManager.tsx`, `AdvancedSettingsTab.tsx`, `Bookings.tsx`, `BookingsDatabase.tsx`, `GamesDatabase.tsx`, `SystemAdminDashboard.tsx`
- [ ] **UI Updates**: Search for user-facing strings "Game" and replace with "Activity" where appropriate

---

## 3. Feature Completion: Activity Wizard & Widgets ✅ VERIFIED
Architecture review shows all components are correctly integrated:

- [x] **`AddServiceItemWizard`**: Uses `ActivityService.createActivity()` → saves to `activities` table
- [x] **`Step5Schedule.tsx`**: Updates `activityData` → stored in `settings` JSONB
- [x] **`useServiceItems` hook**: Uses `ActivityService.listActivities(venueId)` → queries `activities` table
- [x] **`ServiceItemsSettingsTab.tsx`**: Uses `useServiceItems` hook → fetches activities correctly
- [x] **`AvailabilitySettingsTab.tsx`**: Handles custom dates and blocked dates via config

---

## 4. Verification Status ✅ ALL PASSED
1.  **Type Check**: `npx tsc --noEmit` → ✅ Zero errors
2.  **Build Check**: `npm run build` → ✅ Success (4.09s)
3.  **Manual Test**: Ready for testing
    - Create a new Organization
    - Create a new Activity (using the Wizard)
    - Create a Booking for that Activity
