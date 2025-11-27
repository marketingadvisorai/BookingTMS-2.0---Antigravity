# Booking System Architecture

> **Version**: 2.1 | **Updated**: Nov 27, 2025

## Overview

Enterprise-grade booking system designed for scalability, reliability, and real-time performance. Features modular widget architecture with Edge caching and multi-tier Stripe pricing.

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **One Stripe Product per Activity** | Multiple prices (adult, child, custom) under one product |
| **Multi-Tier Pricing** | Adult + Child + Custom prices with lookup keys |
| **Edge Caching** | 5-min cache for activities, 2-min for venues |
| **Real-time Subscriptions** | 500ms debounce for high-traffic widgets |
| **Modular Components** | Files ≤250 lines; clear separation of concerns |
| **Schedule in Settings JSONB** | Single source of truth in `activities.settings` |

## Entity Relationship Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Organization   │────▶│     Venue       │────▶│    Activity     │
│                 │ 1:N │                 │ 1:N │                 │
│ - id            │     │ - id            │     │ - id            │
│ - name          │     │ - embed_key     │     │ - schedule JSONB│
│ - status        │     │ - timezone      │     │ - stripe_price_id│
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │ 1:N
                                                         ▼
                        ┌─────────────────┐     ┌─────────────────┐
                        │ Slot Reservation│◀────│ Activity Session│
                        │                 │ 1:N │                 │
                        │ - id            │     │ - id            │
                        │ - session_id    │     │ - start_time    │
                        │ - party_size    │     │ - capacity_total│
                        │ - expires_at    │     │ - capacity_remaining│
                        │ - status        │     └────────┬────────┘
                        └─────────────────┘              │ 1:N
                                                         ▼
                        ┌─────────────────┐     ┌─────────────────┐
                        │    Customer     │◀────│    Booking      │
                        │                 │ 1:N │                 │
                        │ - id            │     │ - id            │
                        │ - email         │     │ - booking_number│
                        │ - name          │     │ - session_id    │
                        │ - phone         │     │ - total_amount  │
                        └─────────────────┘     │ - status        │
                                                └─────────────────┘
```

## Session Generation

### Schedule Configuration (Activity)
```json
{
  "operatingDays": ["Monday", "Tuesday", "Wednesday", ...],
  "startTime": "09:00",
  "endTime": "22:00",
  "slotInterval": 60,
  "customHours": {
    "Saturday": { "enabled": true, "startTime": "10:00", "endTime": "23:00" }
  }
}
```

### Automatic Session Generation
- **Function**: `generate_activity_sessions(activity_id, start_date, days_ahead)`
- **Cron Job**: Runs daily at 2 AM to generate sessions 30 days ahead
- **Idempotent**: Won't create duplicate sessions

## Slot Reservation System

### 10-Minute Checkout Timeout
To prevent inventory holding and ensure fair access:

1. **Reserve Slot**: `reserve_slot(session_id, party_size, email)`
   - Creates temporary reservation
   - Reduces `capacity_remaining` immediately
   - Returns `reservation_id` and `expires_at` (10 minutes)

2. **Confirm Reservation**: `confirm_reservation(reservation_id)`
   - Called after successful payment
   - Changes status to 'confirmed'

3. **Auto-Release**: `release_expired_reservations()`
   - Cron job runs every minute
   - Restores capacity for expired reservations

### Flow Diagram
```
Customer Selects Slot
        │
        ▼
┌───────────────────┐
│ reserve_slot()    │◀─── Returns reservation_id + expires_at
└───────┬───────────┘
        │
        ▼
┌───────────────────┐
│ 10-Minute Timer   │
│ Shown to Customer │
└───────┬───────────┘
        │
        ├──── Payment Success ────▶ confirm_reservation() ──▶ Create Booking
        │
        └──── Timeout/Cancel ────▶ release_expired_reservations() ──▶ Slot Available
```

## Double-Booking Prevention

### Database Level
1. **Row-Level Locking**: `FOR UPDATE` on session rows during reservation
2. **Atomic Transactions**: All capacity updates in single transaction
3. **Check Constraints**: `capacity_remaining >= 0`

### Application Level
1. **Pre-Check**: `check_slot_availability()` before showing slot
2. **Real-Time Updates**: Supabase subscriptions update UI instantly
3. **Optimistic Locking**: Re-verify availability at booking time

## Widget Architecture

### Embed Types

| Type | URL Pattern | Component | Use Case |
|------|-------------|-----------|----------|
| Single Activity | `/embed?widget=singlegame&activityId={id}` | `CalendarSingleEventBookingPage` | Dedicated activity page |
| Venue Calendar | `/embed?widget=calendar&key={embed_key}` | `VenueBookingWidget` | All venue activities |
| Activity Preview | `/embed?widget=booking&activityId=preview` | `ActivityPreviewCard` | Admin preview |

### Widget API (Edge Function)

**Endpoint**: `/functions/v1/widget-api`

| Query Param | Description |
|-------------|-------------|
| `activityId` | Single activity embed |
| `embedKey` | Venue embed (all activities) |
| `date` | YYYY-MM-DD for availability |
| `color` | Hex color (without #) |
| `theme` | `light` or `dark` |

**Caching**:
- Activity: `max-age=300` (5 min)
- Venue: `max-age=120` (2 min)
- Availability: No cache (real-time)

### Data Flow

```
Widget Loads
    │
    ▼
┌───────────────────────┐
│ Widget API (Edge)     │◀─── CDN Cache (5 min)
│ - Single query JOIN   │
│ - Returns normalized  │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ WidgetApiClient       │
│ - In-memory cache     │
│ - TypeScript types    │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ useWidgetRealtime     │
│ - Supabase subscribe  │
│ - 500ms debounce      │
│ - Auto-refresh        │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ Widget Component      │
│ - Activity or Venue   │
│ - BookingWizard       │
│ - Stripe Checkout     │
└───────────────────────┘
```

### Frontend Service Files

| File | Lines | Purpose |
|------|-------|---------|
| `/src/lib/widget/WidgetApiClient.ts` | ~240 | API client with caching |
| `/src/lib/widget/useWidgetRealtime.ts` | ~200 | Real-time subscription hook |
| `/src/components/widgets/VenueBookingWidget.tsx` | ~230 | Multi-activity venue widget |

### Real-Time Updates
- **Activities Table**: Price/schedule changes
- **Sessions Table**: Capacity changes from bookings
- **Venues Table**: Theme/settings changes
- **Debounce**: 500ms to prevent excessive updates

## Security

### RLS Policies
```sql
-- Public can read sessions for booking
CREATE POLICY "Public can read sessions" ON activity_sessions
    FOR SELECT USING (true);

-- Public can reserve slots
CREATE POLICY "Public can manage reservations" ON slot_reservations
    FOR ALL USING (true);

-- Only venue owner can modify sessions
CREATE POLICY "Owner can manage sessions" ON activity_sessions
    FOR ALL TO authenticated
    USING (organization_id IN (SELECT org_id FROM user_organizations WHERE user_id = auth.uid()));
```

### Widget Security
- **CORS**: Restricted to allowed domains
- **Rate Limiting**: Edge function rate limits
- **Input Validation**: All inputs sanitized

## Scalability

### Database
- **Indexes**: On session start_time, activity_id, capacity_remaining
- **Partitioning**: Sessions can be partitioned by date range
- **Connection Pooling**: Supabase built-in pooler

### Caching
- **Session Data**: Cached in-memory with real-time invalidation
- **Schedule Data**: Cached at CDN level

### Load Handling
- **Concurrent Bookings**: Row-level locking ensures consistency
- **Read Replicas**: Supabase supports read replicas for scale

## Stripe Integration

### Product Strategy

**One Product per Activity** - Session-specific data passed via metadata:

```
Activity: "Mystery Manor" 
  └── Stripe Product: prod_xxx
       └── Stripe Price: price_xxx ($30/person)
            └── Checkout Session Metadata:
                 - session_id: "uuid"
                 - booking_date: "2025-01-15"
                 - start_time: "14:00"
                 - party_size: "4"
```

### Checkout Flow

```
Customer Selects Slot → Create Checkout Session → Stripe Hosted Checkout → Webhook → Create Booking
```

**Metadata passed to Stripe**:
- `activity_id`, `venue_id`, `organization_id`
- `session_id` (activity_sessions table row)
- `booking_date`, `start_time`, `end_time`
- `party_size`, `customer_name`, `customer_phone`

### Edge Functions

| Function | Purpose |
|----------|---------|
| `create-checkout-session` | Creates Stripe checkout with metadata |
| `verify-checkout-session` | Verifies payment, creates booking |
| `stripe-webhook` | Handles payment events |

## API Endpoints

### Session Management
| Function | Description |
|----------|-------------|
| `generate_activity_sessions(id, date, days)` | Generate sessions for activity |
| `check_slot_availability(session_id, party_size)` | Check if slot available |
| `reserve_slot(session_id, party_size, email)` | Reserve slot for 10 minutes |
| `confirm_reservation(reservation_id)` | Confirm after payment |
| `release_expired_reservations()` | Release expired reservations |

### Widget API
| Endpoint | Description |
|----------|-------------|
| `GET /widget-api?activityId={id}` | Single activity config |
| `GET /widget-api?embedKey={key}` | Venue config (all activities) |
| `GET /widget-api?activityId={id}&date={date}` | With availability |

### Dashboard
| Function | Description |
|----------|-------------|
| `get_upcoming_bookings(limit)` | Get upcoming bookings |
| `get_weekly_bookings_trend()` | Get 7-day booking trend |

## Maintenance

### Cron Jobs
| Job | Schedule | Purpose |
|-----|----------|---------|
| Release Expired | Every minute | Free up unreserved slots |
| Generate Sessions | Daily 2 AM | Create sessions 30 days ahead |

### Monitoring
- **Supabase Dashboard**: Query performance, RLS hits
- **Edge Function Logs**: Payment errors, booking failures
- **Alerts**: Configure alerts for failed bookings

---

## Step 5 Schedule → Widget Sync Architecture

### Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        ADMIN WIZARD (Step 5)                            │
│  Step5Schedule.tsx → updateActivityData() → activityData state         │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    AddServiceItemWizard.tsx                             │
│  activityData → handleSubmit() → onComplete(data)                       │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        Events.tsx                                        │
│  handleAddComplete() → useServiceItems.createServiceItem()              │
│                                                                          │
│  Maps to settings JSONB:                                                │
│  - operatingDays, startTime, endTime, slotInterval                      │
│  - advanceBooking, customHours, customDates, blockedDates               │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    ActivityService.createActivity()                      │
│                                                                          │
│  1. Save to activities table (settings JSONB)                           │
│  2. Call StripeIntegrationService.syncNewActivity()                     │
│  3. Call SessionService.generateSessions(id, 90)                        │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          ▼                      ▼                      ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   activities     │  │ activity_sessions│  │     Stripe       │
│   table          │  │     table        │  │   (Product +     │
│                  │  │                  │  │    Prices)       │
│ settings JSONB:  │  │ Generated from   │  │                  │
│ - operatingDays  │  │ schedule:        │  │ - productId      │
│ - startTime      │  │ - date           │  │ - adultPriceId   │
│ - endTime        │  │ - start_time     │  │ - childPriceId   │
│ - slotInterval   │  │ - end_time       │  │ - customPrices[] │
│ - blockedDates   │  │ - capacity       │  │                  │
│ - customHours    │  │ - status         │  │ Prices in USD    │
└────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘
         │                     │                     │
         └─────────────────────┼─────────────────────┘
                               │
                               ▼ Real-time subscription
┌─────────────────────────────────────────────────────────────────────────┐
│                        WIDGET (Customer-facing)                          │
│                                                                          │
│  Embed.tsx → SupabaseBookingService.getActivityWidgetConfig()           │
│            → normalizeActivityForWidget()                                │
│                                                                          │
│  Extracts from settings:                                                │
│  - schedule.operatingDays → Calendar shows green/red dates              │
│  - schedule.blockedDates → Red blocked dates                            │
│  - schedule.customHours → Blue dot indicator                            │
│  - stripePrices → Adult/Child/Custom pricing for checkout               │
└─────────────────────────────────────────────────────────────────────────┘
```

### Settings JSONB Structure

```typescript
// activities.settings JSONB
{
  // Schedule (Step 5)
  operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  startTime: '09:00',
  endTime: '21:00',
  slotInterval: 60,  // minutes
  advanceBooking: 30, // days
  customHoursEnabled: false,
  customHours: {
    'Saturday': { enabled: true, startTime: '10:00', endTime: '18:00' }
  },
  customDates: [
    { id: '1', date: '2025-12-25', startTime: '12:00', endTime: '17:00' }
  ],
  blockedDates: [
    { id: '1', date: '2025-12-31', reason: 'New Year Eve' }
  ],
  
  // Other settings
  child_price: 25,
  min_age: 8,
  requiresWaiver: true,
  // ...
}
```

---

## Stripe Multi-Tier Pricing Architecture

### Price Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        STRIPE PRODUCT                                    │
│                    (One per Activity)                                    │
│                                                                          │
│  product_id: prod_xxx                                                   │
│  name: "Escape Room Experience"                                         │
│  metadata: { activity_id, venue_id, organization_id }                   │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   ADULT PRICE    │  │   CHILD PRICE    │  │  CUSTOM PRICE    │
│                  │  │                  │  │                  │
│ price_id: price_a│  │ price_id: price_c│  │ price_id: price_v│
│ lookup_key:      │  │ lookup_key:      │  │ lookup_key:      │
│   activity_{id}_ │  │   activity_{id}_ │  │   activity_{id}_ │
│   adult          │  │   child          │  │   custom_{name}  │
│ amount: $35.00   │  │ amount: $25.00   │  │ amount: $50.00   │
│ currency: usd    │  │ currency: usd    │  │ currency: usd    │
│                  │  │                  │  │                  │
│ metadata:        │  │ metadata:        │  │ metadata:        │
│   tier_type:adult│  │   tier_type:child│  │   tier_type:custom│
│   display_name:  │  │   display_name:  │  │   display_name:  │
│     Adult        │  │     Child        │  │     VIP Pass     │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

### Checkout Flow with Multi-Tier Pricing

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        BOOKING WIDGET                                    │
│                                                                          │
│  BookingSidebar.tsx                                                      │
│  ├── Adults: 2 × $35.00 = $70.00                                        │
│  ├── Children: 1 × $25.00 = $25.00                                      │
│  └── Total: $95.00                                                      │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    CheckoutService.createCheckoutSession()               │
│                                                                          │
│  params: {                                                              │
│    adultPriceId: 'price_xxx_adult',                                     │
│    adultQuantity: 2,                                                    │
│    childPriceId: 'price_xxx_child',                                     │
│    childQuantity: 1,                                                    │
│    customerEmail: 'user@example.com',                                   │
│    successUrl: '/booking/success',                                      │
│    cancelUrl: '/booking/cancel',                                        │
│    metadata: { session_id, booking_date, start_time }                   │
│  }                                                                       │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              Edge Function: create-checkout-session                      │
│                                                                          │
│  Builds line_items:                                                     │
│  [                                                                       │
│    { price: 'price_xxx_adult', quantity: 2 },                           │
│    { price: 'price_xxx_child', quantity: 1 }                            │
│  ]                                                                       │
│                                                                          │
│  Creates Stripe Checkout Session with:                                  │
│  - line_items (multi-tier)                                              │
│  - mode: 'payment'                                                      │
│  - success_url, cancel_url                                              │
│  - metadata (for webhook processing)                                    │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    STRIPE CHECKOUT PAGE                                  │
│                                                                          │
│  Order Summary:                                                         │
│  ├── Adult × 2                          $70.00                          │
│  ├── Child × 1                          $25.00                          │
│  └── Total                              $95.00                          │
│                                                                          │
│  [Pay $95.00]                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

### Webhook Processing

```
checkout.session.completed
        │
        ▼
Edge Function: verify-checkout-session
        │
        ├── Extract metadata (session_id, booking_date, party_size)
        │
        ├── Create booking in database
        │
        ├── Update session capacity_remaining
        │
        └── Send confirmation email
```

---

## Real-Time Sync

### Subscribed Tables

| Table | Events | Purpose |
|-------|--------|---------|
| `activities` | INSERT, UPDATE, DELETE | Schedule changes |
| `activity_sessions` | INSERT, UPDATE, DELETE | Capacity changes |
| `venues` | UPDATE | Theme/config changes |
| `bookings` | INSERT, UPDATE | Capacity updates |

### Debounce Strategy

```typescript
// Embed.tsx
const DEBOUNCE_MS = 500;
let debounceTimer: NodeJS.Timeout;

const debouncedRefresh = () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    fetchWidgetConfig();
  }, DEBOUNCE_MS);
};

// Subscribe to changes
supabase.channel('widget-updates')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'activities' }, debouncedRefresh)
  .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_sessions' }, debouncedRefresh)
  .subscribe();
```
