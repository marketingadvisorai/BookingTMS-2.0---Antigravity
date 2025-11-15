# Game Schedule & Availability System - Complete Implementation

**Date:** November 16, 2025  
**Status:** 🚧 In Progress  
**Priority:** HIGH

---

## 📋 Overview

Complete implementation of game scheduling and availability features in the Add/Edit Game Wizard, with full integration to:
- ✅ Supabase database (schedule storage)
- ✅ Calendar widget (availability display)
- ✅ Stripe (payment scheduling)
- ✅ Real-time updates

---

## 🎯 Features to Implement

### 1. Operating Days (Step 5)
- [x] UI for selecting days (Mon-Sun toggles) - ✅ Already exists
- [ ] Save to Supabase `games.schedule` JSONB column
- [ ] Calendar widget reads and respects operating days
- [ ] Validation: At least one day must be selected

### 2. Operating Hours (Step 5)
- [x] UI for start/end time - ✅ Already exists
- [x] Toggle for "different hours per day" - ✅ Already exists
- [x] Per-day hour customization - ✅ Already exists
- [ ] Save to Supabase with proper validation
- [ ] Calendar widget generates time slots based on hours
- [ ] Validation: End time must be after start time

### 3. Time Slot Interval (Step 5)
- [x] UI dropdown (15/30/60/90 minutes) - ✅ Already exists
- [ ] Save to Supabase
- [ ] Calendar widget uses interval to generate booking slots
- [ ] Must be >= game duration to prevent overlaps

### 4. Advance Booking (Step 5)
- [x] UI input field (days) - ✅ Already exists
- [ ] Save to Supabase
- [ ] Calendar widget enforces advance booking limit
- [ ] Validation: 1-365 days

### 5. Custom Dates (Step 5)
- [x] UI for adding custom date/time - ✅ Already exists
- [x] List of custom dates with remove button - ✅ Already exists
- [ ] Save as JSON array to Supabase
- [ ] Calendar widget prioritizes custom dates over regular schedule
- [ ] Validation: No duplicate dates

### 6. Blocked Dates (Step 5)
- [x] UI for blocking dates - ✅ Already exists
- [x] Toggle for full day vs time range - ✅ Already exists
- [x] List of blocked dates with remove button - ✅ Already exists
- [ ] Save as JSON array to Supabase
- [ ] Calendar widget hides blocked slots
- [ ] Support both full-day and time-range blocks

---

## 🗄️ Database Schema

### Update `games` table

```sql
-- Add schedule column if not exists
ALTER TABLE games 
ADD COLUMN IF NOT EXISTS schedule JSONB DEFAULT '{}'::jsonb;

-- Schedule structure:
{
  "operatingDays": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  "startTime": "10:00",
  "endTime": "22:00",
  "slotInterval": 60,
  "advanceBooking": 30,
  "customHoursEnabled": false,
  "customHours": {
    "Monday": { "enabled": true, "startTime": "10:00", "endTime": "22:00" },
    "Tuesday": { "enabled": true, "startTime": "10:00", "endTime": "22:00" },
    ...
  },
  "customDates": [
    {
      "id": "custom-1234567890",
      "date": "2025-12-25",
      "startTime": "12:00",
      "endTime": "18:00"
    }
  ],
  "blockedDates": [
    "2025-12-24", // Full day block (string)
    {
      "date": "2025-12-26",
      "startTime": "14:00",
      "endTime": "16:00",
      "reason": "Maintenance"
    }
  ]
}

-- Add index for schedule queries
CREATE INDEX IF NOT EXISTS idx_games_schedule ON games USING gin (schedule);
```

---

## 🔧 Implementation Tasks

### Phase 1: Database Integration (Supabase MCP)

#### Task 1.1: Create Migration
```sql
-- File: supabase/migrations/add_game_schedule.sql
ALTER TABLE games 
ADD COLUMN IF NOT EXISTS schedule JSONB DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_games_schedule ON games USING gin (schedule);

-- Add validation function
CREATE OR REPLACE FUNCTION validate_game_schedule(schedule_data JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  -- Validate operating days
  IF NOT (schedule_data ? 'operatingDays') THEN
    RAISE EXCEPTION 'operatingDays is required';
  END IF;
  
  -- Validate time format
  IF NOT (schedule_data->>'startTime' ~ '^([01]?[0-9]|2[0-3]):[0-5][0-9]$') THEN
    RAISE EXCEPTION 'Invalid startTime format';
  END IF;
  
  IF NOT (schedule_data->>'endTime' ~ '^([01]?[0-9]|2[0-3]):[0-5][0-9]$') THEN
    RAISE EXCEPTION 'Invalid endTime format';
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
```

#### Task 1.2: Update `useGames` Hook
Update `src/hooks/useGames.ts` to handle schedule data:

```typescript
const createGame = async (gameData: Partial<Game>) => {
  // ... existing code ...
  
  // Build schedule object
  const schedule = {
    operatingDays: gameData.operatingDays || [],
    startTime: gameData.startTime || '10:00',
    endTime: gameData.endTime || '22:00',
    slotInterval: gameData.slotInterval || 60,
    advanceBooking: gameData.advanceBooking || 30,
    customHoursEnabled: gameData.customHoursEnabled || false,
    customHours: gameData.customHours || {},
    customDates: gameData.customDates || [],
    blockedDates: gameData.blockedDates || []
  };
  
  const mappedData = {
    // ... existing fields ...
    schedule: schedule
  };
  
  // Insert to Supabase
  const { data, error } = await supabase
    .from('games')
    .insert(mappedData)
    .select()
    .single();
    
  // ... rest of code ...
};
```

#### Task 1.3: Update Game Fetching
Ensure schedule data is loaded when fetching games:

```typescript
const fetchGames = async () => {
  const { data, error } = await supabase
    .from('games')
    .select(`
      *,
      venues(name)
    `)
    .eq('venue_id', venueId)
    .order('created_at', { ascending: false });
    
  if (data) {
    // Map schedule data back to flat structure
    const mapped = data.map(game => ({
      ...game,
      operatingDays: game.schedule?.operatingDays || [],
      startTime: game.schedule?.startTime || '10:00',
      endTime: game.schedule?.endTime || '22:00',
      slotInterval: game.schedule?.slotInterval || 60,
      advanceBooking: game.schedule?.advanceBooking || 30,
      customHoursEnabled: game.schedule?.customHoursEnabled || false,
      customHours: game.schedule?.customHours || {},
      customDates: game.schedule?.customDates || [],
      blockedDates: game.schedule?.blockedDates || []
    }));
    setGames(mapped);
  }
};
```

### Phase 2: Calendar Widget Integration

#### Task 2.1: Update Calendar Widget to Read Schedule
File: `src/components/widgets/CalendarWidget.tsx`

```typescript
// Import availability engine
import { generateTimeSlots, isDayOperating, isDateBlocked } from '@/utils/availabilityEngine';

// In component
useEffect(() => {
  if (!selectedGame || !selectedDate) return;
  
  // Extract schedule from game
  const schedule = {
    operatingDays: selectedGame.operatingDays,
    startTime: selectedGame.startTime,
    endTime: selectedGame.endTime,
    slotInterval: selectedGame.slotInterval,
    duration: selectedGame.duration,
    advanceBooking: selectedGame.advanceBooking
  };
  
  // Check if date is operating
  const customDates = selectedGame.customDates || [];
  if (!isDayOperating(selectedDate, schedule.operatingDays, customDates)) {
    setAvailableSlots([]);
    return;
  }
  
  // Check if date is blocked
  const blockedDates = selectedGame.blockedDates || [];
  if (isDateBlocked(selectedDate, blockedDates)) {
    setAvailableSlots([]);
    return;
  }
  
  // Generate time slots
  const slots = generateTimeSlots(
    selectedDate,
    schedule,
    blockedDates,
    existingBookings, // Fetch from bookings table
    customDates
  );
  
  setAvailableSlots(slots);
}, [selectedGame, selectedDate]);
```

#### Task 2.2: Disable Non-Operating Days in Calendar
```typescript
// In CalendarWidget date picker
<Calendar
  mode="single"
  selected={selectedDate}
  onSelect={setSelectedDate}
  disabled={(date) => {
    // Disable past dates
    if (date < new Date()) return true;
    
    // Check advance booking limit
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + (selectedGame?.advanceBooking || 30));
    if (date > maxDate) return true;
    
    // Check if day is operating
    if (!isDayOperating(date, selectedGame?.operatingDays, selectedGame?.customDates)) {
      return true;
    }
    
    // Check if date is fully blocked
    if (isDateBlocked(date, selectedGame?.blockedDates || [])) {
      return true;
    }
    
    return false;
  }}
/>
```

### Phase 3: Stripe Integration (Optional)

#### Task 3.1: Sync Schedule with Stripe Product Metadata
When creating/updating Stripe products, include schedule info:

```typescript
// In StripeProductService
async createProduct(gameData: any) {
  const product = await stripe.products.create({
    name: gameData.name,
    description: gameData.description,
    metadata: {
      venue_id: gameData.venue_id,
      game_id: gameData.id,
      duration: gameData.duration,
      operating_days: JSON.stringify(gameData.operatingDays),
      advance_booking: gameData.advanceBooking
      // Store minimal schedule info for reference
    }
  });
  
  return product;
}
```

### Phase 4: Validation & Error Handling

#### Task 4.1: Add Validation to AddGameWizard
```typescript
// In Step5Schedule validation
const validateSchedule = () => {
  const errors = [];
  
  // Operating days
  if (gameData.operatingDays.length === 0) {
    errors.push('Select at least one operating day');
  }
  
  // Time validation
  if (gameData.startTime >= gameData.endTime) {
    errors.push('End time must be after start time');
  }
  
  // Custom hours validation
  if (gameData.customHoursEnabled) {
    gameData.operatingDays.forEach(day => {
      const hours = gameData.customHours[day];
      if (hours.enabled && hours.startTime >= hours.endTime) {
        errors.push(`${day}: End time must be after start time`);
      }
    });
  }
  
  // Slot interval vs duration
  if (gameData.slotInterval < gameData.duration) {
    errors.push('Time slot interval cannot be shorter than game duration');
  }
  
  // Advance booking
  if (gameData.advanceBooking < 1 || gameData.advanceBooking > 365) {
    errors.push('Advance booking must be between 1 and 365 days');
  }
  
  // Custom dates validation
  gameData.customDates.forEach(cd => {
    if (cd.startTime >= cd.endTime) {
      errors.push(`Custom date ${cd.date}: End time must be after start time`);
    }
  });
  
  // Blocked dates validation
  gameData.blockedDates.forEach(bd => {
    if (typeof bd === 'object' && bd.startTime && bd.endTime) {
      if (bd.startTime >= bd.endTime) {
        errors.push(`Blocked date ${bd.date}: End time must be after start time`);
      }
    }
  });
  
  return errors;
};

// Before moving to next step
const handleNext = () => {
  if (currentStep === 5) {
    const errors = validateSchedule();
    if (errors.length > 0) {
      errors.forEach(err => toast.error(err));
      return;
    }
  }
  setCurrentStep(currentStep + 1);
};
```

#### Task 4.2: Real-time Validation in UI
```typescript
// Show warning if slot interval < duration
{gameData.slotInterval < gameData.duration && (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertDescription>
      Time slot interval ({gameData.slotInterval} min) is shorter than game duration ({gameData.duration} min). 
      This may cause booking overlaps. Consider setting interval to at least {gameData.duration} minutes.
    </AlertDescription>
  </Alert>
)}
```

---

## 🧪 Testing Checklist

### Unit Tests
- [ ] `availabilityEngine.ts` - all functions
- [ ] Schedule validation logic
- [ ] Time format conversion (12h ↔ 24h)

### Integration Tests
- [ ] Create game with custom schedule → Supabase
- [ ] Edit game schedule → Update Supabase
- [ ] Calendar widget loads schedule correctly
- [ ] Time slots generated correctly
- [ ] Blocked dates hide slots
- [ ] Custom dates override regular schedule

### E2E Tests
1. **Create Game with Schedule**
   - Navigate to Add Game Wizard
   - Fill all steps
   - Configure schedule (Step 5):
     - Select operating days
     - Set hours (10 AM - 10 PM)
     - Set slot interval (60 min)
     - Set advance booking (30 days)
     - Add custom date (Dec 25, 12 PM - 6 PM)
     - Block date (Dec 24, full day)
   - Complete wizard
   - Verify data in Supabase

2. **Calendar Widget Display**
   - Open calendar widget for game
   - Select operating day → See time slots
   - Select non-operating day → See "Not available"
   - Select blocked date → See "Blocked"
   - Select custom date → See custom hours
   - Verify advance booking limit

3. **Edit Existing Game**
   - Open game in edit mode
   - Verify schedule data pre-populated
   - Modify schedule
   - Save changes
   - Verify updates in Supabase

---

## 📊 Success Criteria

✅ **Database**
- Schedule data saves correctly to `games.schedule` JSONB
- Migration runs without errors
- Existing games don't break

✅ **UI**
- All schedule inputs functional
- Validation messages clear
- No console errors

✅ **Calendar Widget**
- Respects operating days
- Generates correct time slots
- Hides blocked dates
- Shows custom dates
- Enforces advance booking

✅ **Performance**
- Time slot generation < 100ms
- Calendar loads in < 500ms
- No unnecessary re-renders

---

## 🚀 Deployment Steps

1. **Apply Migration**
   ```bash
   supabase migration up
   ```

2. **Test in Development**
   - Create test games with various schedules
   - Verify calendar widget behavior

3. **Deploy to Staging**
   - Run migration
   - Test E2E scenarios
   - Check Sentry for errors

4. **Deploy to Production**
   - Run migration during maintenance window
   - Monitor logs
   - Have rollback plan ready

---

## 📝 Documentation

- [ ] Update `GAME_CREATION_GUIDE.md`
- [ ] Add schedule examples to docs
- [ ] Document availability engine API
- [ ] Add troubleshooting section

---

**Next Step:** Apply Supabase migration and update `useGames` hook
