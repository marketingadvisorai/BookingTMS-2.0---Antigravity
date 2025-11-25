# Collaboration Log

## 2025-11-25 - Activity Refactor Agent
- **Status**: Currently working on refactoring `game_id` to `activity_id` and resolving TypeScript errors.
- **Changes Made**:
  - Updated `VenueGamesManager.tsx` to use `AddEventWizard`.
  - Updated `ListWidget.tsx` to use `getAllActivities`.
  - Updated `GlobalDataSyncBridge.tsx` to sync activities.
  - Updated `useBookings.ts` to fix type errors.
  - Updated `AddEventWizard.tsx` initial state.
  - Updated `useDashboard.ts` to map `game_name` to `activity_name`.
- **Observations**:
  - Noticed schema updates in `src/types/supabase.ts` for `promo_codes` and `gift_cards` (likely by another agent).
  - Will avoid touching `promo_codes` and `gift_cards` related code to prevent conflicts.
  - Will continue to focus on `activity_id` refactoring and general type fixes in `src/pages/Venues.tsx` and other open files.
