# Bookings Feature Module Architecture

> Version: v0.1.57
> Date: 2025-11-30
> Status: 🚧 In Progress (Refactoring)

## Overview

The Bookings feature manages all booking operations for admins including viewing, creating, updating, and managing customer bookings.

## Directory Structure

```
src/features/bookings/
├── ARCHITECTURE.md          # This file
├── components/
│   ├── index.ts             # Barrel export
│   ├── MonthCalendarView.tsx    # ✅ Extracted (208 lines)
│   ├── WeekView.tsx             # ✅ Extracted (169 lines)
│   ├── DayView.tsx              # ✅ Extracted (183 lines)
│   ├── ScheduleView.tsx         # ✅ Extracted (170 lines)
│   ├── BookingTable.tsx         # ⏳ TODO
│   ├── BookingFilters.tsx       # ⏳ TODO
│   ├── BookingStats.tsx         # ⏳ TODO
│   ├── AddBookingDialog.tsx     # ⏳ TODO
│   ├── BookingDetailsDialog.tsx # ⏳ TODO
│   ├── RefundDialog.tsx         # ⏳ TODO
│   ├── RescheduleDialog.tsx     # ⏳ TODO
│   └── AttendeeListDialog.tsx   # ⏳ TODO
├── hooks/
│   └── useBookingFilters.ts     # ⏳ TODO - Date range filtering
├── types/
│   └── index.ts             # ✅ Extracted (100 lines)
└── utils/
    └── index.ts             # ✅ Extracted (110 lines)
```

## Original File Analysis

**Source**: `src/pages/Bookings.tsx` (3,409 lines)

### Components to Extract

| Component | Lines | Priority | Status |
|-----------|-------|----------|--------|
| MonthCalendarView | 208 | High | ✅ Done |
| WeekView | 169 | High | ✅ Done |
| DayView | 183 | High | ✅ Done |
| ScheduleView | 170 | High | ✅ Done |
| AddBookingDialog | ~550 | High | ⏳ Pending |
| BookingDetailsDialog | ~210 | High | ⏳ Pending |
| RefundDialog | ~100 | Medium | ⏳ Pending |
| AttendeeListDialog | ~190 | Medium | ⏳ Pending |
| RescheduleDialog | ~130 | Medium | ⏳ Pending |
| CancelDialog | ~50 | Low | ⏳ Pending |

### Logic to Extract

| Function/Logic | Lines | Target File |
|----------------|-------|-------------|
| Date range filtering | ~100 | `hooks/useBookingFilters.ts` |
| Export functions | ~100 | `utils/exportUtils.ts` |
| adaptBookingFromSupabase | ~30 | `utils/index.ts` ✅ |
| formatCurrency/Date | ~20 | `utils/index.ts` ✅ |

## Types

```typescript
// types/index.ts
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';

export interface Booking {
  id: string;
  customer: string;
  email: string;
  phone: string;
  game: string;
  gameId?: string;
  date: string;
  time: string;
  groupSize: number;
  adults: number;
  children: number;
  amount: number;
  status: BookingStatus;
  paymentMethod: string;
  notes: string;
  // ... more fields
}
```

## Usage

```tsx
// Import types
import type { Booking, BookingStatus } from '../features/bookings/types';

// Import components
import { MonthCalendarView } from '../features/bookings/components';

// Import utilities
import { adaptBookingFromSupabase, formatCurrency } from '../features/bookings/utils';
```

## Data Flow

```
Bookings.tsx (main page)
    ↓
useBookings() hook → Supabase bookings table
    ↓
adaptBookingFromSupabase() → UI-friendly format
    ↓
View Components (MonthCalendarView, WeekView, etc.)
    ↓
Dialogs (AddBooking, Details, Refund, etc.)
```

## Related Files

- **Hook**: `src/hooks/useBookings.ts` - Supabase CRUD operations
- **Service**: `src/services/AdminBookingService.ts` - Admin booking creation
- **Original Page**: `src/pages/Bookings.tsx` - Main page (being refactored)

## Next Steps

1. Extract `WeekView`, `DayView`, `ScheduleView`
2. Extract `AddBookingDialog` (largest dialog ~550 lines)
3. Extract `BookingDetailsDialog`
4. Create `useBookingFilters` hook for date range logic
5. Update `Bookings.tsx` to use extracted components
6. Final cleanup and testing

## Contributing

When extracting components:
1. Max 200 lines per component file
2. Add JSDoc comments for AI agent readability
3. Update barrel export in `index.ts`
4. Add types to `types/index.ts`
5. Test after extraction
