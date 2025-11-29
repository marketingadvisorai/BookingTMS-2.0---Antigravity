# Bookings Feature Module Architecture

> Version: v0.1.63
> Date: 2025-11-30
> Status: ✅ Dialogs + Filters + Table View Extracted
> Main file reduced: 3,410 → 1,222 lines (-2,188 lines, 64% reduction)

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
│   ├── AddBookingDialog.tsx     # ✅ Extracted (245 lines)
│   ├── BookingDetailsDialog.tsx # ✅ Extracted (222 lines)
│   ├── RefundDialog.tsx         # ✅ Extracted (128 lines)
│   ├── RescheduleDialog.tsx     # ✅ Extracted (157 lines)
│   ├── CancelDialog.tsx         # ✅ Extracted (78 lines)
│   ├── AttendeeListDialog.tsx   # ✅ Extracted (210 lines)
│   ├── add-booking/             # AddBookingDialog step components
│   │   ├── index.ts             # Barrel export
│   │   ├── Step1CustomerInfo.tsx    # ✅ (75 lines)
│   │   ├── Step2BookingDetails.tsx  # ✅ (200 lines)
│   │   └── Step3PaymentConfirmation.tsx # ✅ (185 lines)
│   ├── BookingTableView.tsx     # ✅ Extracted (291 lines) - Table/list view
│   ├── BookingFilters.tsx       # ⏳ TODO (future)
│   └── BookingStats.tsx         # ⏳ TODO (future)
├── hooks/
│   ├── index.ts                 # Barrel export
│   └── useBookingFilters.ts     # ✅ Extracted (249 lines) - Date range filtering
├── types/
│   └── index.ts             # ✅ Extracted (100 lines)
└── utils/
    └── index.ts             # ✅ Extracted (110 lines)
```

## Original File Analysis

**Source**: `src/pages/Bookings.tsx` (Originally 3,409 lines → Now 1,528 lines)

### Extracted Components

| Component | Lines | Priority | Status |
|-----------|-------|----------|--------|
| MonthCalendarView | 208 | High | ✅ Done |
| WeekView | 169 | High | ✅ Done |
| DayView | 183 | High | ✅ Done |
| ScheduleView | 170 | High | ✅ Done |
| AddBookingDialog | 245 | High | ✅ Done (Nov 30, 2025) |
| BookingDetailsDialog | 222 | High | ✅ Done (Nov 30, 2025) |
| RefundDialog | 128 | Medium | ✅ Done (Nov 30, 2025) |
| RescheduleDialog | 157 | Medium | ✅ Done (Nov 30, 2025) |
| CancelDialog | 78 | Medium | ✅ Done (Nov 30, 2025) |
| AttendeeListDialog | 210 | Medium | ✅ Done (Nov 30, 2025) |

### AddBookingDialog Sub-Components

| Component | Lines | Purpose |
|-----------|-------|---------|
| Step1CustomerInfo | 75 | Customer name, email, phone |
| Step2BookingDetails | 200 | Venue, game, date, time, group size |
| Step3PaymentConfirmation | 185 | Payment method, summary, confirmation |

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

## Completed Steps

1. ✅ Extract `WeekView`, `DayView`, `ScheduleView` - Done
2. ✅ Extract `AddBookingDialog` with step components - Done (Nov 30, 2025)
3. ✅ Extract `BookingDetailsDialog` - Done (Nov 30, 2025)
4. ✅ Extract all other dialogs (Refund, Reschedule, Cancel, AttendeeList) - Done (Nov 30, 2025)
5. ✅ Update `Bookings.tsx` to use extracted components - Done (Nov 30, 2025)
6. ✅ Create `useBookingFilters` hook - Done (Nov 30, 2025) - 249 lines, removed ~127 lines from main

## Future Steps

1. Extract `BookingTable` component for table view
2. Extract `BookingFilters` component for search/filter UI
3. Extract `BookingStats` component for statistics cards
4. Remove seed data (mock bookings) once real data is stable
5. Connect RefundDialog to Stripe refund edge function

## Contributing

When extracting components:
1. Max 200 lines per component file
2. Add JSDoc comments for AI agent readability
3. Update barrel export in `index.ts`
4. Add types to `types/index.ts`
5. Test after extraction
