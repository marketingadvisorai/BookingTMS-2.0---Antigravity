# Handover: Activity Refactoring

## Status
The codebase is currently undergoing a refactoring from "Game" to "Activity" terminology to support multi-niche use cases (e.g., Escape Rooms, Salons, Classes).

### Completed
- **Sidebar**: Updated `Sidebar.tsx` to show "Activities" instead of "Events / Rooms".
- **Terminology Hook**: Updated `useTerminology.ts` to default to "Activity" / "Activities".
- **Events Page**: Verified that the `/events` page now displays "Activities" in the header.
- **Waiver Form**: Updated `WaiverForm.tsx` to use `assignedActivities` and `Activity` labels.
- **Booking Engine Test**: Updated `BookingEngineTest.tsx` to use `activities` in the dummy config.
- **Supabase Types**: Added missing RPC definitions and table types to `src/types/supabase.ts`.
- **Hooks**: Refactored `useDashboard.ts`, `useBookings.ts`, and `useStaff.ts` to use "Activity" terminology and added `as any` casts to resolve persistent Supabase type errors.

### Pending / To Do
1.  **TypeScript Errors**:
    - `src/components/widgets/settings/tabs/SEOSettingsTab.tsx`: Reports `TS17004: Cannot use JSX unless the '--jsx' flag is provided`. This might be a configuration issue or a false positive in the check, as the file is `.tsx`.
    - `src/hooks/useStaff.ts`: Some `as any` casts were added, but a few lint errors might persist regarding `never` types if strict typing is re-enabled without the casts.
    - `src/lib/validation/codeValidation.ts`: Contains `as any` casts to bypass type checks.
2.  **Widget Refactoring**:
    - `ResolvexWidget.tsx`: Still uses `Game` terminology heavily. Needs a full refactor to `Activity`.
    - `FareBookWidget.tsx` & `FareBookSingleEventWidget.tsx`: Likely need similar updates.
    - `Embed.tsx`: Check for `games` vs `activities` usage in embed config parsing.
3.  **Database**:
    - Ensure the `waiver_templates` table has the `assigned_activities` column (migrated from `assigned_games`).
    - Ensure the `waiver_records` table has the `activity` column (migrated from `game_name` or `game`).
    - Verify `activities` table schema matches the types in `src/types/supabase.ts`.

### Key Files Modified
- `src/components/layout/Sidebar.tsx`
- `src/hooks/useTerminology.ts`
- `src/pages/WaiverForm.tsx`
- `src/pages/BookingEngineTest.tsx`
- `src/hooks/useStaff.ts`
- `src/hooks/useDashboard.ts`
- `src/hooks/useBookings.ts`
- `src/types/supabase.ts`

## Next Steps for AI Agent
1.  **Resolve SEOSettingsTab Error**: Investigate why `tsc` is complaining about JSX in this specific file.
2.  **Refactor Widgets**: Systematically go through `src/components/widgets/` and update "Game" to "Activity".
3.  **Verify Database Schema**: Check if migrations are needed for `waiver_templates` and `waiver_records` columns.
4.  **Remove `as any`**: Once types are stable, try to remove `as any` casts and fix the underlying type definitions in `src/types/supabase.ts`.
