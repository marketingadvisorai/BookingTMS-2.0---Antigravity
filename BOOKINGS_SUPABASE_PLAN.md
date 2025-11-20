# Bookings Page Supabase Integration Plan

## Current Status
The Bookings page (`src/pages/Bookings.tsx`) currently uses:
- ❌ localStorage for storing bookings
- ❌ Mock/seed data for initial bookings
- ❌ Local state mutations (no database sync)
- ❌ Hardcoded games data
- ❌ localStorage for staff list

## Target State
Replace with full Supabase integration:
- ✅ useBookings hook for real-time booking data
- ✅ useGames hook for game metadata
- ✅ useVenues hook for venue data
- ✅ useAuth for staff/user data
- ✅ AdminBookingService for creating bookings
- ✅ All mutations (reschedule, cancel, check-in/out) sync to Supabase
- ✅ Bookings from embedded widgets appear automatically

## Implementation Steps

### Step 1: Add Supabase Hooks ✅
```typescript
import { useBookings } from '../hooks/useBookings';
import { useGames } from '../hooks/useGames';
import { useVenues } from '../hooks/useVenues';
import { useAuth } from '../lib/auth/AuthContext';
import { AdminBookingService } from '../services/AdminBookingService';
```

### Step 2: Replace localStorage with Supabase Data
```typescript
// OLD: localStorage
const [bookings, setBookings] = useState<Booking[]>([]);
useEffect(() => {
  const stored = localStorage.getItem('admin_bookings');
  // ...
}, []);

// NEW: Supabase
const { bookings: sbBookings, loading, updateBooking, cancelBooking } = useBookings();
const bookings = sbBookings.map(adaptBookingFromSupabase);
```

### Step 3: Adapter Function
Convert Supabase `BookingWithDetails` to UI `Booking` format:
```typescript
const adaptBookingFromSupabase = (sb: any): Booking => ({
  id: sb.confirmation_code || sb.id,
  customer: sb.customer_name || 'Unknown',
  email: sb.customer_email || '',
  phone: sb.customer_phone || '',
  game: sb.game_name || 'Unknown Game',
  date: sb.booking_date || '',
  time: sb.booking_time || '',
  groupSize: sb.players || 0,
  adults: sb.players || 0,
  children: 0,
  amount: Number(sb.total_amount) || 0,
  status: (sb.status || 'pending') as any,
  paymentMethod: sb.payment_method || 'Credit Card',
  notes: sb.notes || '',
  assignedStaffId: sb.metadata?.assigned_staff_id,
  checkInTime: sb.metadata?.check_in_time,
  checkOutTime: sb.metadata?.check_out_time,
});
```

### Step 4: Replace Games Data
```typescript
// OLD: Hardcoded
const gamesData = [
  { id: 1, name: 'Mystery Manor', color: '#8b5cf6' },
  // ...
];

// NEW: From Supabase
const { games } = useGames();
const gamesData = games.map(g => ({
  id: g.id,
  name: g.name,
  color: gameColors[g.name] || '#6b7280'
}));
```

### Step 5: Replace Staff List
```typescript
// OLD: localStorage
const [staffList, setStaffList] = useState([]);
useEffect(() => {
  const staffRaw = localStorage.getItem('admin_staff');
  // ...
}, []);

// NEW: From useAuth
const { users } = useAuth();
const staffList = users
  .filter(u => u.role !== 'staff')
  .map(u => ({ id: u.id, name: u.email }));
```

### Step 6: Wire Mutations to Supabase

#### Reschedule
```typescript
const confirmReschedule = async (dateStr: string, timeStr: string) => {
  const sbBooking = sbBookings.find(b => 
    b.confirmation_code === selectedBooking.id
  );
  if (sbBooking) {
    await updateBooking(sbBooking.id, {
      booking_date: dateStr,
      start_time: timeStr
    });
  }
  toast.success('Booking rescheduled');
};
```

#### Cancel
```typescript
const confirmCancel = async (reason?: string) => {
  const sbBooking = sbBookings.find(b => 
    b.confirmation_code === selectedBooking.id
  );
  if (sbBooking) {
    await cancelBooking(sbBooking.id, reason, false);
  }
  toast.success('Booking cancelled');
};
```

#### Check-in/Check-out
```typescript
const checkIn = async (bookingId: string) => {
  const sbBooking = sbBookings.find(b => b.confirmation_code === bookingId);
  if (sbBooking) {
    await updateBooking(sbBooking.id, {
      status: 'in-progress',
      metadata: {
        ...sbBooking.metadata,
        check_in_time: new Date().toISOString()
      }
    });
  }
  toast.success('Checked in');
};
```

#### Assign Staff
```typescript
const assignStaff = async (bookingId: string, staffId: string) => {
  const sbBooking = sbBookings.find(b => b.confirmation_code === bookingId);
  if (sbBooking) {
    await updateBooking(sbBooking.id, {
      metadata: {
        ...sbBooking.metadata,
        assigned_staff_id: staffId
      }
    });
  }
  toast.success('Staff assigned');
};
```

### Step 7: Add Booking (Admin)
Use AdminBookingService for creating bookings:
```typescript
const handleCreateBooking = async (formData: any) => {
  try {
    await AdminBookingService.createBooking({
      venueId: formData.venue,
      gameId: formData.game,
      customerEmail: formData.email,
      customerName: formData.customer,
      customerPhone: formData.phone,
      bookingDate: formData.date,
      bookingTime: formData.time,
      players: formData.adults + formData.children,
      notes: formData.notes,
      paymentMethod: formData.paymentMethod
    });
    toast.success('Booking created successfully');
  } catch (error) {
    toast.error('Failed to create booking');
  }
};
```

### Step 8: Loading States
```typescript
if (loading || gamesLoading || venuesLoading) {
  return <PageLoadingScreen message="Loading bookings..." />;
}
```

### Step 9: Remove localStorage Effects
Delete all `localStorage.getItem` and `localStorage.setItem` calls.

### Step 10: Real-time Sync
The hooks already have real-time subscriptions, so bookings from embedded widgets will appear automatically!

## Testing Checklist

- [ ] Bookings load from Supabase on page mount
- [ ] Bookings from embedded widgets appear in admin
- [ ] Reschedule updates Supabase and UI
- [ ] Cancel updates Supabase and UI
- [ ] Check-in/out updates Supabase and UI
- [ ] Staff assignment updates Supabase and UI
- [ ] Add booking creates in Supabase
- [ ] Calendar views show correct data
- [ ] Filters work with live data
- [ ] Export works with live data
- [ ] Real-time updates reflect immediately

## Benefits

1. **Single Source of Truth** - All data in Supabase
2. **Real-time Sync** - Embedded bookings appear instantly
3. **No Data Loss** - No localStorage limitations
4. **Multi-user Support** - All admins see same data
5. **Audit Trail** - Database tracks all changes
6. **Scalable** - No browser storage limits

## Migration Notes

- Existing localStorage bookings will be ignored
- Admin should create test bookings via embed to verify
- Old seed data removed
- All mutations now async (await required)
