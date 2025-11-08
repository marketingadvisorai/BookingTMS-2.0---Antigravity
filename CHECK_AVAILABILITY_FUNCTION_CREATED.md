# Check Game Availability Function Created

## Error Fixed
**Error:** `Could not find the function public.check_game_availability`

The AdminBookingService was calling a function `check_game_availability` that didn't exist in the database.

## Root Cause
- AdminBookingService.ts calls `check_game_availability` RPC
- Database only had `get_game_availability` (different signature)
- `get_game_availability` returns a table of time slots
- `check_game_availability` needed to return a boolean for a specific slot

## Solution
Created the missing `check_game_availability` function in the database.

## Function Details

### Signature
```sql
CREATE FUNCTION check_game_availability(
  p_game_id UUID,
  p_booking_date DATE,
  p_start_time TIME,
  p_end_time TIME,
  p_exclude_booking_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
```

### Parameters
- `p_game_id` - UUID of the game to check
- `p_booking_date` - Date of the booking
- `p_start_time` - Start time of the booking slot
- `p_end_time` - End time of the booking slot
- `p_exclude_booking_id` - Optional booking ID to exclude (for updates)

### Return Value
- `TRUE` - Time slot is available
- `FALSE` - Time slot has conflicts

### Logic
Checks for overlapping bookings by:
1. Same game and date
2. Time ranges overlap
3. Not the excluded booking (for updates)
4. Status is not cancelled or no-show

**Overlap Detection:**
```sql
(booking_time < p_end_time AND end_time > p_start_time)
```

This catches all overlap scenarios:
- New booking starts during existing booking
- New booking ends during existing booking
- New booking completely contains existing booking
- Existing booking completely contains new booking

## Usage in AdminBookingService

```typescript
const { data: isAvailable, error: availError } = await supabase
  .rpc('check_game_availability', {
    p_game_id: params.game_id,
    p_booking_date: params.booking_date,
    p_start_time: params.start_time,
    p_end_time: params.end_time,
    p_exclude_booking_id: null,
  });

if (availError) throw availError;
if (!isAvailable) {
  throw new Error('Selected time slot is not available');
}
```

## Migration Applied
- **Migration Name:** `create_check_game_availability`
- **Version:** 012
- **Status:** ✅ Successfully applied

## Benefits

### ✅ Prevents Double Bookings
- Checks for conflicts before creating booking
- Ensures data integrity
- Better user experience

### ✅ Handles Edge Cases
- Excludes cancelled and no-show bookings
- Supports booking updates (exclude current booking)
- Accurate time overlap detection

### ✅ Performance
- Single database query
- Indexed on game_id and booking_date
- Fast conflict detection

## Testing

### Test Availability Check:
```sql
-- Check if 2:00 PM - 3:00 PM is available for a game on 2025-11-15
SELECT check_game_availability(
  'game-uuid-here'::UUID,
  '2025-11-15'::DATE,
  '14:00'::TIME,
  '15:00'::TIME,
  NULL
);
-- Returns: true (available) or false (conflict)
```

### Test Overlap Detection:
```sql
-- Scenario 1: Exact same time
-- Existing: 14:00 - 15:00
-- New:      14:00 - 15:00
-- Result:   CONFLICT ✓

-- Scenario 2: Partial overlap (start)
-- Existing: 14:00 - 15:00
-- New:      13:30 - 14:30
-- Result:   CONFLICT ✓

-- Scenario 3: Partial overlap (end)
-- Existing: 14:00 - 15:00
-- New:      14:30 - 15:30
-- Result:   CONFLICT ✓

-- Scenario 4: Completely contains
-- Existing: 14:00 - 15:00
-- New:      13:00 - 16:00
-- Result:   CONFLICT ✓

-- Scenario 5: Completely within
-- Existing: 14:00 - 15:00
-- New:      14:15 - 14:45
-- Result:   CONFLICT ✓

-- Scenario 6: No overlap (before)
-- Existing: 14:00 - 15:00
-- New:      13:00 - 14:00
-- Result:   AVAILABLE ✓

-- Scenario 7: No overlap (after)
-- Existing: 14:00 - 15:00
-- New:      15:00 - 16:00
-- Result:   AVAILABLE ✓
```

## Comparison with get_game_availability

### get_game_availability
```sql
-- Returns table of all time slots with availability status
get_game_availability(p_game_id UUID, p_date DATE)
RETURNS TABLE(time_slot TIME, is_available BOOLEAN, booking_id UUID)
```
**Use Case:** Display calendar with all available/unavailable slots

### check_game_availability
```sql
-- Returns boolean for specific time slot
check_game_availability(
  p_game_id UUID, 
  p_booking_date DATE, 
  p_start_time TIME, 
  p_end_time TIME,
  p_exclude_booking_id UUID
)
RETURNS BOOLEAN
```
**Use Case:** Validate specific booking before creation/update

## Related Files

1. **src/services/AdminBookingService.ts**
   - Calls `check_game_availability` RPC
   - Lines 102-114

2. **Database Migration**
   - Migration 012: `create_check_game_availability`
   - Creates the function
   - Grants permissions

## Summary

Created the missing `check_game_availability` function that:
- ✅ Returns boolean for specific time slot availability
- ✅ Handles time overlap detection correctly
- ✅ Excludes cancelled and no-show bookings
- ✅ Supports booking updates with exclude parameter
- ✅ Prevents double bookings
- ✅ Integrates seamlessly with AdminBookingService

**Admin booking creation now works without errors!** 🎉
