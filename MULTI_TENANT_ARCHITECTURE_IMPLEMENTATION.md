# Multi-Tenant Architecture Implementation

## Overview
Comprehensive multi-tenant, multi-venue database architecture with calendar support and data isolation.

## Architecture Design

### Data Hierarchy
```
Organization (Company)
  └── Venues (Physical Locations)
      ├── Venue Calendars (Operating Hours & Availability)
      └── Games (Escape Room Experiences)
          └── Game Calendars (Game-Specific Schedules)
              └── Bookings (Customer Reservations)
```

### Core Principles
1. **Multi-Tenancy**: Complete data isolation per organization
2. **Denormalization**: Strategic caching of names for performance
3. **Calendar Hierarchy**: Flexible scheduling at venue and game levels
4. **Stripe Integration**: Full metadata tracking for payments
5. **Data Integrity**: Foreign keys with cascading deletes

## Database Schema

### Tables Created/Updated

#### 1. **venue_calendars**
Master calendar for each venue.
- `organization_id`: Organization ownership
- `venue_id`: Associated venue
- `operating_hours`: JSONB - Weekly schedule
- `timezone`: Default timezone
- `is_default`: One default calendar per venue

#### 2. **game_calendars**
Game-specific scheduling.
- `organization_id`: Organization ownership
- `venue_id`: Associated venue
- `game_id`: Associated game
- `venue_calendar_id`: Parent calendar
- `custom_hours`: Override venue hours
- `blocked_dates`: JSONB array of blocked dates
- `pricing_rules`: Time-based dynamic pricing

#### 3. **bookings** (Enhanced)
Added fields:
- `organization_name`: Denormalized
- `venue_name`: Denormalized
- `game_name`: Denormalized
- `venue_calendar_id`: Calendar reference
- `game_calendar_id`: Calendar reference
- `booking_metadata`: JSONB - Complete context

#### 4. **games** (Enhanced)
Added fields:
- `organization_id`: Organization ownership
- `organization_name`: Denormalized
- `venue_name`: Denormalized
- `calendar_id`: Associated game calendar
- `stripe_metadata`: JSONB - Stripe sync data

#### 5. **venues** (Enhanced)
Added fields:
- `organization_name`: Denormalized
- `company_name`: Denormalized

#### 6. **payments** (Enhanced)
Added fields:
- `organization_id`: Organization ownership
- `venue_id`: Associated venue
- `game_id`: Associated game
- Metadata automatically populated via triggers

#### 7. **customers** (Enhanced)
Added fields:
- `first_name`: Split from full_name
- `last_name`: Split from full_name
- `preferred_venue_id`: For segmentation
- `customer_metadata`: JSONB

#### 8. **stripe_sync_log** (New)
Audit log for Stripe operations:
- `organization_id`: Organization ownership
- `entity_type`: 'product', 'price', 'customer', 'payment'
- `stripe_id`: Stripe object ID
- `action`: 'create', 'update', 'delete', 'sync'
- `status`: 'pending', 'success', 'failed'

#### 9. **organizations** (Enhanced)
Added fields:
- `company_name`: Alternative company name
- `display_name`: Display name for UI

## Metadata Strategy

### Denormalized Fields
To optimize query performance and reporting:

1. **Bookings**: Store organization_name, venue_name, game_name
2. **Games**: Store organization_name, venue_name
3. **Venues**: Store organization_name, company_name

### Auto-Population Triggers
- `populate_booking_names()`: Auto-fill names on booking insert/update
- `populate_game_names()`: Auto-fill names on game insert/update
- `populate_venue_names()`: Auto-fill names on venue insert/update
- `populate_payment_metadata()`: Auto-fill payment context

## Calendar System

### Venue Calendar Features
- Default operating hours (Monday-Sunday)
- Timezone management
- Booking buffer times
- Advance booking limits
- Cancellation policies

### Game Calendar Features
- Inherits from venue calendar or custom hours
- Blocked dates with reasons
- Multiple bookings per slot support
- Buffer before/after games
- Time-based pricing rules

### Availability Engine
Function: `get_game_calendar_slots(calendar_id, date)`
Returns:
- Available time slots
- Current bookings count
- Maximum capacity
- Availability status

## Stripe Integration

### Metadata Included in Stripe Objects

#### Products (Games)
```json
{
  "game_id": "uuid",
  "game_name": "Escape Room Name",
  "organization_id": "uuid",
  "organization_name": "Company Name",
  "company_name": "DBA Name",
  "venue_id": "uuid",
  "venue_name": "Venue Name",
  "calendar_id": "uuid",
  "calendar_name": "Calendar Name",
  "duration": "60",
  "difficulty": "Medium"
}
```

#### Payments
```json
{
  "booking_id": "uuid",
  "booking_number": "BK-12345",
  "confirmation_code": "CONF-ABC123",
  "organization_id": "uuid",
  "organization_name": "Company Name",
  "venue_id": "uuid",
  "venue_name": "Venue Name",
  "game_id": "uuid",
  "game_name": "Game Name",
  "calendar_id": "uuid"
}
```

## Row-Level Security (RLS)

### Organization Isolation
All tables enforce organization-based RLS:
```sql
USING (
  organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  )
)
```

### Public Access for Widgets
- `venue_calendars`: Public read for active calendars
- `game_calendars`: Public read for active calendars
- Function-based access for widget bookings

## TypeScript Types

### Calendar Types
New file: `src/types/calendar.ts`
- `VenueCalendar`
- `GameCalendar`
- `OperatingHours`
- `CalendarSlot`
- `PricingRule`
- `BlockedDate`

### Updated Types
- `IBooking`: Added calendar references and denormalized names
- `Game`: Added organization, venue, calendar fields
- `Venue`: Added organization fields
- Stripe metadata interfaces updated

## API Functions

### Calendar Functions
- `create_default_venue_calendar(venue_id)`: Auto-create default calendar
- `create_game_calendar(game_id, venue_calendar_id)`: Create game schedule
- `get_game_calendar_slots(calendar_id, date)`: Get available slots
- `is_venue_open(venue_id, date, time)`: Check if venue is open

### Metadata Functions
- `get_booking_stripe_metadata(booking_id)`: Get complete booking context
- `get_game_stripe_metadata(game_id)`: Get complete game context
- `log_stripe_sync(...)`: Log Stripe operations

### Helper Functions
- `populate_booking_names()`: Auto-fill booking context
- `populate_game_names()`: Auto-fill game context
- `populate_venue_names()`: Auto-fill venue context
- `populate_payment_metadata()`: Auto-fill payment context

## Migration Files

1. **020_multi_tenant_calendar_architecture.sql**
   - Creates calendar tables
   - Adds calendar references to bookings
   - Adds denormalized name fields
   - Creates triggers for auto-population
   - Sets up RLS policies

2. **021_update_stripe_metadata_fields.sql**
   - Adds organization/venue/game to payments
   - Adds first_name/last_name to customers
   - Creates stripe_sync_log table
   - Adds metadata helper functions

## Frontend Updates

### Updated Components
- `useGames.ts`: Fetches and sends organization/venue metadata
- `stripeProductService.ts`: Includes multi-tenant metadata
- Booking types include calendar references

### New Requirements
When creating games:
- System automatically fetches venue details
- Sends complete metadata to Stripe
- Links game to default venue calendar

## Usage Examples

### Creating a Venue with Calendar
```typescript
// 1. Create venue (automatically generates embed_key and slug)
const venue = await createVenue({
  organization_id: 'org-uuid',
  name: 'Downtown Escape Room',
  address: '123 Main St',
  timezone: 'America/New_York'
});

// 2. Default calendar is auto-created via trigger
// OR manually create custom calendar
const calendar = await create_default_venue_calendar(venue.id);
```

### Creating a Game with Calendar
```typescript
// 1. Create game
const game = await createGame({
  venue_id: 'venue-uuid',
  name: 'Haunted Mansion',
  price: 35.00,
  duration: 60
});

// 2. Game calendar is created automatically
// Includes organization/venue metadata in Stripe
```

### Querying Bookings with Full Context
```sql
SELECT 
  b.*,
  b.organization_name,  -- No join needed!
  b.venue_name,         -- No join needed!
  b.game_name           -- No join needed!
FROM bookings b
WHERE b.organization_id = 'org-uuid'
  AND b.booking_date >= CURRENT_DATE
ORDER BY b.booking_date, b.booking_time;
```

## Data Isolation Guarantees

### Organization Level
- Each organization's data is completely isolated
- RLS policies enforce access control
- No cross-organization data access

### Venue Level
- Venues belong to single organization
- Games belong to single venue
- Bookings reference both venue and game

### Calendar Level
- Venue calendars belong to single venue
- Game calendars belong to single game
- Automatic parent-child relationships

## Performance Optimizations

### Indexes Created
- Composite indexes: `(organization_id, venue_id, date)`
- Calendar lookups: `(venue_id, is_default)`
- Multi-tenant queries: `(organization_id, email)`

### Denormalization Benefits
- Avoid joins for common queries
- Faster reporting and analytics
- Simplified widget queries

### Query Patterns
```sql
-- Fast booking lookup with context
SELECT * FROM bookings 
WHERE organization_id = ? 
  AND venue_id = ? 
  AND booking_date = ?;

-- Uses: idx_bookings_org_venue_date
```

## Testing Checklist

- [ ] Create organization
- [ ] Create venue (verify calendar auto-created)
- [ ] Create game (verify metadata sent to Stripe)
- [ ] Create booking (verify names auto-populated)
- [ ] Verify RLS isolation between organizations
- [ ] Test calendar availability queries
- [ ] Verify Stripe sync logging
- [ ] Test widget bookings with calendar
- [ ] Verify payment metadata population

## Next Steps

1. **Apply Migrations**
   ```bash
   # Apply to your Supabase project
   supabase db push
   ```

2. **Update Environment**
   - Ensure organization_id exists for all venues
   - Backfill denormalized fields if needed

3. **Frontend Integration**
   - Update components to use new calendar types
   - Add calendar selection UI
   - Implement availability calendar view

4. **Monitoring**
   - Monitor stripe_sync_log for errors
   - Check denormalized fields stay in sync
   - Verify calendar queries performance

## Benefits

✅ **Complete Data Isolation**: Each organization's data is separate  
✅ **Scalable**: Support unlimited organizations, venues, and games  
✅ **Fast Queries**: Denormalized fields avoid expensive joins  
✅ **Flexible Calendars**: Per-venue and per-game scheduling  
✅ **Stripe Integration**: Full context in all payment metadata  
✅ **Audit Trail**: Complete Stripe sync logging  
✅ **Conflict Prevention**: Calendar-based availability checks  
✅ **Future-Proof**: Extensible metadata structure  

