# BookingTMS 2.0 - Database Schema Reference

> Last Updated: 2025-11-27
> Database: PostgreSQL via Supabase

---

## Core Tables

### `organizations`
Multi-tenant organization (business/venue owner).

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `name` | varchar | Organization name |
| `slug` | varchar | URL-friendly identifier |
| `owner_id` | uuid | FK to auth.users |
| `stripe_account_id` | varchar | Stripe Connect account |
| `stripe_customer_id` | varchar | Stripe customer ID |
| `settings` | jsonb | Organization settings |
| `created_at` | timestamptz | Created timestamp |
| `updated_at` | timestamptz | Updated timestamp |

### `organization_members`
Team members within an organization.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `organization_id` | uuid | FK to organizations |
| `user_id` | uuid | FK to auth.users |
| `role` | varchar | `owner`, `admin`, `staff` |
| `created_at` | timestamptz | Created timestamp |

### `venues`
Physical locations where activities take place.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `organization_id` | uuid | FK to organizations |
| `name` | varchar | Venue name |
| `address` | text | Full address |
| `city` | varchar | City |
| `state` | varchar | State/Province |
| `country` | varchar | Country code |
| `timezone` | varchar | IANA timezone |
| `is_active` | boolean | Active status |
| `created_at` | timestamptz | Created timestamp |

### `activities`
Bookable experiences (escape rooms, games, etc.).

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `organization_id` | uuid | FK to organizations |
| `venue_id` | uuid | FK to venues |
| `name` | varchar | Activity name |
| `description` | text | Full description |
| `tagline` | varchar | Short tagline |
| `image_url` | varchar | Cover image URL |
| `duration` | integer | Duration in minutes |
| `min_players` | integer | Minimum players |
| `max_players` | integer | Maximum players |
| `price` | decimal | Price per person |
| `child_price` | decimal | Child price (optional) |
| `currency` | varchar | Currency code (USD) |
| `difficulty` | varchar | `easy`, `medium`, `hard` |
| `is_active` | boolean | Active status |
| `stripe_product_id` | varchar | Stripe product ID |
| `stripe_price_id` | varchar | Stripe price ID |
| `created_at` | timestamptz | Created timestamp |

### `activity_sessions`
Available time slots for activities.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `activity_id` | uuid | FK to activities |
| `date` | date | Session date |
| `start_time` | time | Start time |
| `end_time` | time | End time |
| `capacity` | integer | Max bookings |
| `booked_count` | integer | Current bookings |
| `is_available` | boolean | Availability flag |
| `created_at` | timestamptz | Created timestamp |

### `bookings`
Customer bookings.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `organization_id` | uuid | FK to organizations |
| `activity_id` | uuid | FK to activities |
| `session_id` | uuid | FK to activity_sessions |
| `customer_name` | varchar | Customer name |
| `customer_email` | varchar | Customer email |
| `customer_phone` | varchar | Customer phone |
| `party_size` | integer | Number of guests |
| `booking_date` | date | Date of booking |
| `start_time` | time | Start time |
| `total_amount` | decimal | Total price |
| `status` | varchar | `pending`, `confirmed`, `cancelled` |
| `payment_status` | varchar | `pending`, `paid`, `refunded` |
| `stripe_payment_intent_id` | varchar | Stripe PI ID |
| `notes` | text | Internal notes |
| `created_at` | timestamptz | Created timestamp |

### `customers`
Customer records for CRM.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `organization_id` | uuid | FK to organizations |
| `email` | varchar | Email (unique per org) |
| `name` | varchar | Full name |
| `phone` | varchar | Phone number |
| `total_bookings` | integer | Booking count |
| `total_spent` | decimal | Lifetime value |
| `stripe_customer_id` | varchar | Stripe customer ID |
| `created_at` | timestamptz | First seen |
| `last_booking_at` | timestamptz | Last booking |

### `embed_configs`
Embeddable widget configurations.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `organization_id` | uuid | FK to organizations |
| `embed_key` | varchar | Unique public key |
| `name` | varchar | Config name |
| `description` | text | Description |
| `type` | varchar | Widget type |
| `target_type` | varchar | `activity`, `venue`, `multi` |
| `target_id` | uuid | Single target ID |
| `target_ids` | uuid[] | Multiple target IDs |
| `config` | jsonb | Widget configuration |
| `style` | jsonb | Widget styling |
| `is_active` | boolean | Active status |
| `view_count` | integer | Analytics: views |
| `booking_count` | integer | Analytics: bookings |
| `created_at` | timestamptz | Created timestamp |

---

## Enum Values

### `embed_configs.type`
- `booking-widget` - Full booking flow
- `calendar-widget` - Availability calendar
- `button-widget` - Book Now button
- `popup-widget` - Modal booking

### `embed_configs.target_type`
- `activity` - Single activity
- `venue` - All activities at venue
- `multi` - Selected activities

### `bookings.status`
- `pending` - Awaiting confirmation
- `confirmed` - Confirmed booking
- `cancelled` - Cancelled
- `completed` - Past booking

### `bookings.payment_status`
- `pending` - Awaiting payment
- `paid` - Payment received
- `refunded` - Refunded
- `failed` - Payment failed

---

## Row Level Security (RLS)

### Organization Isolation
All tenant tables use RLS to isolate data:

```sql
-- Example: activities table
CREATE POLICY "Users can view own org activities"
ON activities FOR SELECT
USING (organization_id IN (
  SELECT organization_id FROM organization_members
  WHERE user_id = auth.uid()
));
```

### Public Access (Widgets)
Embed widgets need public read access:

```sql
-- Public read for active activities
CREATE POLICY "Public can view active activities"
ON activities FOR SELECT
USING (is_active = true);
```

---

## Migrations

Migrations are numbered sequentially in `supabase/migrations/`:

| Number | Description |
|--------|-------------|
| 000 | Initial schema |
| 001 | Organization members |
| 002 | Booking columns |
| ... | ... |
| 055 | Public read for embed widgets |

### Running Migrations

```bash
# Push to Supabase
npx supabase db push

# Generate types
npx supabase gen types typescript --local > src/types/database.types.ts
```

---

## Indexes

Key indexes for performance:

```sql
-- Bookings by date
CREATE INDEX idx_bookings_date ON bookings(booking_date);

-- Activities by venue
CREATE INDEX idx_activities_venue ON activities(venue_id);

-- Sessions by activity and date
CREATE INDEX idx_sessions_activity_date ON activity_sessions(activity_id, date);

-- Embed configs by key
CREATE UNIQUE INDEX idx_embed_configs_key ON embed_configs(embed_key);
```

---

## Functions

### `generate_embed_key()`
Generates unique embed key for widgets.

```sql
CREATE OR REPLACE FUNCTION generate_embed_key()
RETURNS varchar AS $$
BEGIN
  RETURN 'emb_' || encode(gen_random_bytes(16), 'hex');
END;
$$ LANGUAGE plpgsql;
```

### `check_availability(activity_id, date, time, party_size)`
Checks if a slot is available.

```sql
CREATE OR REPLACE FUNCTION check_availability(
  p_activity_id uuid,
  p_date date,
  p_time time,
  p_party_size integer
) RETURNS boolean AS $$
-- Implementation
$$ LANGUAGE plpgsql;
```
