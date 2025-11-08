# Booking Database Column Fixes

## Errors Fixed
1. **Error:** `column b.party_size does not exist`
2. **Error:** `column c.full_name does not exist`

The `get_bookings_with_details` RPC and `AdminBookingService` were using incorrect column names that didn't match the actual database schema.

## Root Cause
The database schema uses different column names than what the code was referencing:

**Bookings Table:**
- ❌ `party_size` → ✅ `players`
- ❌ `booking_number` → ✅ `confirmation_code`
- ❌ `start_time` → ✅ `booking_time`

**Customers Table:**
- ❌ `full_name` → ✅ `first_name` + `last_name` (separate columns)
- ❌ `organization_id` → ✅ Does not exist in customers table

## Fixes Applied

### 1. ✅ Fixed `get_bookings_with_details` RPC (Migrations 010 & 011)

**File:** `src/supabase/migrations/008_add_get_bookings_with_details.sql`

**Changes:**
```sql
-- Before
b.party_size as players,
b.booking_number as confirmation_code,
COALESCE(c.full_name, c.email)::VARCHAR as customer_name,

-- After
b.players,
b.confirmation_code,
COALESCE(TRIM(CONCAT(c.first_name, ' ', c.last_name)), c.email)::VARCHAR as customer_name,
```

**Applied Migrations:**
- Migration 010: `fix_get_bookings_with_details_column_names` - Fixed bookings columns
- Migration 011: `fix_customer_name_concatenation` - Fixed customer name concatenation
- Status: ✅ Successfully applied

### 2. ✅ Fixed `AdminBookingService.createAdminBooking`

**File:** `src/services/AdminBookingService.ts`

**Changes to Booking Creation:**
```typescript
// Before
.insert({
  organization_id: venue.organization_id,
  booking_number: bookingNumber,
  start_time: params.start_time,
  party_size: params.adults + params.children,
  discount_amount: 0,
  final_amount: params.total_amount,
  ...
})

// After
.insert({
  confirmation_code: bookingNumber,
  booking_time: params.start_time,
  players: params.adults + params.children,
  deposit_amount: 0,
  ...
})
```

**Key Changes:**
- ✅ Removed `organization_id` (not in bookings table)
- ✅ Changed `booking_number` → `confirmation_code`
- ✅ Changed `start_time` → `booking_time`
- ✅ Changed `party_size` → `players`
- ✅ Changed `discount_amount`/`final_amount` → `deposit_amount`

### 3. ✅ Fixed `AdminBookingService.findOrCreateCustomer`

**File:** `src/services/AdminBookingService.ts`

**Changes to Customer Creation:**
```typescript
// Before
.from('customers')
.insert({
  organization_id: organizationId,
  full_name: name,
  email: email,
  phone: phone,
  segment: 'new',
})

// After
// Split name into first and last name
const nameParts = name.trim().split(/\s+/);
const firstName = nameParts[0] || '';
const lastName = nameParts.slice(1).join(' ') || '';

.from('customers')
.insert({
  first_name: firstName,
  last_name: lastName,
  email: email,
  phone: phone,
  status: 'active',
})
```

**Key Changes:**
- ✅ Removed `organization_id` (not in customers table)
- ✅ Changed `full_name` → `first_name` + `last_name` (split logic)
- ✅ Removed `segment` field (not in customers table)
- ✅ Added `status: 'active'`
- ✅ Fixed customer lookup to not use `organization_id` filter
- ✅ Changed `.single()` to `.maybeSingle()` to avoid errors when no customer exists

## Database Schema Reference

### Bookings Table Columns:
```
id                  uuid
venue_id            uuid
game_id             uuid
customer_id         uuid
booking_date        date
booking_time        time without time zone
end_time            time without time zone
players             integer              ← Was referenced as party_size
status              character varying
total_amount        numeric
deposit_amount      numeric              ← Was referenced as discount_amount
payment_status      character varying
payment_method      character varying
transaction_id      character varying
notes               text
customer_notes      text
internal_notes      text
confirmation_code   character varying    ← Was referenced as booking_number
metadata            jsonb
created_by          uuid
created_at          timestamp with time zone
updated_at          timestamp with time zone
source              character varying
ticket_types        jsonb
promo_code          character varying
```

### Customers Table Columns:
```
id                  uuid
first_name          character varying    ← Separate field
last_name           character varying    ← Separate field
email               character varying
phone               character varying
date_of_birth       date
address             text
city                character varying
state               character varying
zip                 character varying
country             character varying
total_bookings      integer
total_spent         numeric
status              character varying
notes               text
metadata            jsonb
created_by          uuid
created_at          timestamp with time zone
updated_at          timestamp with time zone
```

**Note:** No `full_name` or `organization_id` columns exist in customers table.

## Impact

### Before Fix:
- ❌ Bookings page failed to load
- ❌ Console error: `column b.party_size does not exist`
- ❌ Could not create bookings via admin panel

### After Fix:
- ✅ Bookings page loads successfully
- ✅ RPC returns booking data correctly
- ✅ Admin can create bookings via Add Booking dialog
- ✅ All column references match actual database schema

## Testing

### Verify RPC Works:
```sql
SELECT * FROM get_bookings_with_details(NULL, NULL, NULL, NULL);
```

### Verify Booking Creation:
1. Open Bookings page
2. Click "Add New Booking"
3. Fill in customer details
4. Select venue, game, date, time
5. Complete booking
6. ✅ Booking should be created successfully

## Related Files
- `src/supabase/migrations/008_add_get_bookings_with_details.sql` - RPC definition
- `src/services/AdminBookingService.ts` - Booking creation service
- `src/pages/Bookings.tsx` - Bookings page UI
- `src/hooks/useBookings.ts` - Bookings data hook

## Summary
All database column name mismatches have been fixed. The bookings page now loads correctly and admin booking creation works end-to-end with Supabase.
