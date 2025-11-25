# Venues Module Architecture

> **Version**: 0.1.20  
> **Last Updated**: November 25, 2025  
> **Status**: Production

---

## 1. Overview

The Venues module manages physical locations within the multi-tenant BookingTMS system. Each venue belongs to an organization and contains multiple bookable activities. Venues serve as the primary entry point for customer booking widgets.

---

## 2. Entity Relationship Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ENTITY HIERARCHY                                   │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│  ORGANIZATIONS   │
│  (Tenant Root)   │
├──────────────────┤
│ id (PK)          │
│ name             │
│ company_name     │
│ subscription_plan│
│ stripe_account_id│
│ venues_count     │◄─────── Auto-updated by trigger
└────────┬─────────┘
         │
         │ 1:N (One org has many venues)
         ▼
┌──────────────────┐
│     VENUES       │
│ (Physical Loc)   │
├──────────────────┤
│ id (PK)          │
│ organization_id  │◄────── FK to organizations
│ name             │
│ slug (unique)    │
│ embed_key (uniq) │◄────── Auto-generated, used for widgets
│ timezone         │◄────── Critical for session times
│ operating_hours  │◄────── JSONB: venue-level defaults
│ settings         │◄────── JSONB: widget config, type, etc.
│ status           │
│ primary_color    │
└────────┬─────────┘
         │
         │ 1:N (One venue has many activities)
         ▼
┌──────────────────┐
│   ACTIVITIES     │
│ (Bookable Items) │
├──────────────────┤
│ id (PK)          │
│ venue_id (FK)    │◄────── FK to venues (CASCADE DELETE)
│ organization_id  │
│ name             │
│ schedule (JSONB) │◄────── Activity-level schedule overrides
│ price            │
│ is_active        │
└────────┬─────────┘
         │
         │ 1:N (One activity has many sessions)
         ▼
┌──────────────────┐        ┌──────────────────┐
│ ACTIVITY_SESSIONS│        │    CUSTOMERS     │
│ (Time Slots)     │        │                  │
├──────────────────┤        ├──────────────────┤
│ id (PK)          │        │ id (PK)          │
│ activity_id (FK) │        │ organization_id  │
│ venue_id (FK)    │◄───────│ venue_id (FK)    │ (SET NULL on delete)
│ start_time       │        │ email            │
│ capacity_remain  │        │ name             │
└────────┬─────────┘        └──────────────────┘
         │
         │ N:1 (Many bookings per session)
         ▼
┌──────────────────┐
│    BOOKINGS      │
├──────────────────┤
│ id (PK)          │
│ session_id (FK)  │
│ activity_id (FK) │
│ venue_id (FK)    │◄────── FK to venues (SET NULL on delete)
│ customer_id (FK) │
│ organization_id  │
│ party_size       │
│ status           │
└──────────────────┘
```

---

## 3. Database Schema

### 3.1 venues Table

```sql
CREATE TABLE venues (
    -- Primary Key
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relationships
    organization_id     UUID NOT NULL REFERENCES organizations(id),
    created_by          UUID REFERENCES auth.users(id),
    
    -- Core Identity
    name                VARCHAR(255) NOT NULL,
    slug                VARCHAR(255) NOT NULL UNIQUE,
    embed_key           VARCHAR(255) NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    
    -- Location
    address             TEXT,
    city                VARCHAR(100),
    state               VARCHAR(100),
    zip                 VARCHAR(20),
    country             VARCHAR(100),
    
    -- Contact
    phone               VARCHAR(50),
    email               VARCHAR(255),
    
    -- Configuration
    capacity            INTEGER,
    timezone            VARCHAR(100) DEFAULT 'UTC',
    status              VARCHAR(50) DEFAULT 'active',  -- active, inactive, maintenance
    primary_color       VARCHAR(20),                   -- Hex color for widget
    base_url            TEXT,                          -- Custom domain for embeds
    
    -- Extended Data (JSONB)
    settings            JSONB DEFAULT '{}',
    operating_hours     JSONB DEFAULT '{
        "monday": {"open": "09:00", "close": "17:00", "closed": false},
        "tuesday": {"open": "09:00", "close": "17:00", "closed": false},
        ...
    }',
    
    -- Media
    images              TEXT[] DEFAULT '{}',
    description         TEXT,
    amenities           TEXT[] DEFAULT '{}',
    
    -- Denormalized (for performance)
    organization_name   VARCHAR(255),
    company_name        VARCHAR(255),
    staff_count         INTEGER DEFAULT 0,
    location_count      INTEGER DEFAULT 0,
    
    -- Soft Delete
    is_deleted          BOOLEAN DEFAULT false,
    deleted_at          TIMESTAMPTZ,
    
    -- Timestamps
    created_at          TIMESTAMPTZ DEFAULT now(),
    updated_at          TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_venues_organization ON venues(organization_id);
CREATE INDEX idx_venues_embed_key ON venues(embed_key);
CREATE INDEX idx_venues_slug ON venues(slug);
CREATE INDEX idx_venues_status ON venues(status) WHERE status = 'active';
```

### 3.2 settings JSONB Structure

```typescript
interface VenueSettings {
    // Venue Type
    type: 'escape-room' | 'smash-room' | 'axe-throwing' | 'laser-tag' | 
          'vr-experience' | 'arcade' | 'other';
    
    // Description (HTML allowed)
    description: string;
    
    // Website URL
    website: string;
    
    // Widget Configuration
    widgetConfig: {
        theme: 'light' | 'dark';
        primaryColor: string;
        showPrices: boolean;
        showAvailability: boolean;
        activities: ActivityWidgetConfig[];
    };
    
    // Booking Rules
    bookingRules?: {
        advanceBookingDays: number;      // How far ahead can book
        minAdvanceHours: number;         // Minimum hours before session
        cancellationHours: number;       // Hours before to allow cancel
        requireDeposit: boolean;
        depositPercentage: number;
    };
    
    // Social Links
    socialLinks?: {
        facebook?: string;
        instagram?: string;
        twitter?: string;
    };
}
```

### 3.3 operating_hours JSONB Structure

```typescript
interface OperatingHours {
    monday:    { open: string; close: string; closed: boolean };
    tuesday:   { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday:  { open: string; close: string; closed: boolean };
    friday:    { open: string; close: string; closed: boolean };
    saturday:  { open: string; close: string; closed: boolean };
    sunday:    { open: string; close: string; closed: boolean };
}
// Times in 24-hour format: "09:00", "22:00"
```

---

## 4. Data Flow Diagrams

### 4.1 Venue Creation Flow

```
┌──────────┐    1. Create     ┌─────────────────┐    2. Insert      ┌──────────┐
│   UI     │ ──────────────── │  useVenues      │ ───────────────── │ Supabase │
│ (Dialog) │                  │  (Hook)         │                   │    DB    │
└──────────┘                  └─────────────────┘                   └──────────┘
     │                               │                                    │
     │ VenueFormData                 │                                    │
     │ {name, type, ...}             │                                    │
     ▼                               ▼                                    │
┌──────────────────────────────────────────────────────────────────┐     │
│                     mapUIVenueToDB()                             │     │
│                                                                  │     │
│  Input:                          Output:                         │     │
│  • name                          • name                          │     │
│  • type                          • slug (auto-generated)         │     │
│  • description                   • organization_id               │     │
│  • address, phone, email         • settings.type                 │     │
│  • primaryColor                  • settings.description          │     │
│  • isActive                      • primary_color                 │     │
│                                  • status: 'active'/'inactive'   │     │
└──────────────────────────────────────────────────────────────────┘     │
                                     │                                    │
                                     ▼                                    │
                         ┌───────────────────────┐                       │
                         │  Database Trigger     │                       │
                         │                       │                       │
                         │  • embed_key = UUID   │◄──────────────────────┘
                         │  • updated_at = now() │
                         │  • org.venues_count++ │
                         └───────────────────────┘
```

### 4.2 Widget Embed Flow

```
┌─────────────────┐     1. Embed Code      ┌─────────────────────────────────┐
│ External Site   │ ◄─────────────────────  │ Admin: Venues > Embed Code      │
│ (Customer)      │                         │                                 │
└────────┬────────┘                         │ <script src="embed.js">         │
         │                                  │ BookingTMS.init({key: 'xxx'})   │
         │ 2. Load Widget                   └─────────────────────────────────┘
         ▼
┌─────────────────┐     3. Fetch by key    ┌─────────────────────────────────┐
│  /embed?widget  │ ─────────────────────► │ SupabaseBookingService          │
│  &key=xxx       │                        │ .getVenueByEmbedKey(key)        │
└────────┬────────┘                        └───────────────┬─────────────────┘
         │                                                 │
         │                                                 ▼
         │                                 ┌─────────────────────────────────┐
         │ 4. Return venue + activities    │ Database Query:                 │
         │◄─────────────────────────────── │ SELECT * FROM venues            │
         │                                 │ WHERE embed_key = 'xxx'         │
         │                                 │ AND status = 'active'           │
         ▼                                 └─────────────────────────────────┘
┌─────────────────┐
│ CalendarWidget  │     5. Show Activities & Calendar
│ or SingleEvent  │────────────────────────────────────►
└─────────────────┘
```

### 4.3 Venue Update Flow

```
┌──────────┐    1. Edit Click   ┌─────────────────┐
│ Venues   │ ──────────────────►│ Edit Dialog     │
│ Page     │                    │ (Pre-filled)    │
└──────────┘                    └────────┬────────┘
                                         │
                                         │ 2. Save
                                         ▼
                                ┌─────────────────┐    3. RLS Check
                                │ useVenues       │────────────────┐
                                │ .updateVenue()  │                │
                                └────────┬────────┘                │
                                         │                         ▼
                                         │           ┌─────────────────────────┐
                                         │           │ Policy: Can only update │
                                         │           │ if user's org matches   │
                                         │           │ venue.organization_id   │
                                         │           └─────────────────────────┘
                                         │
                                         ▼
                                ┌─────────────────┐
                                │ Real-time       │────► All subscribed clients
                                │ Broadcast       │      update automatically
                                └─────────────────┘
```

---

## 5. Service Layer Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              UI LAYER                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────────────────┐     │
│  │  Venues.tsx    │  │ VenueCard.tsx  │  │ VenueWidgetSettings.tsx    │     │
│  │  (Main Page)   │  │ (Display)      │  │ (Widget Config Dialog)     │     │
│  └───────┬────────┘  └───────┬────────┘  └───────────────┬────────────┘     │
│          │                   │                           │                   │
│          └───────────────────┴───────────────────────────┘                   │
│                              │                                               │
├──────────────────────────────┼───────────────────────────────────────────────┤
│                         HOOK LAYER                                           │
├──────────────────────────────┼───────────────────────────────────────────────┤
│                              ▼                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                   useVenueManagement()                              │    │
│  │  (Business Logic + State Management)                                │    │
│  │                                                                     │    │
│  │  • venues[]           • handleCreateVenue()                         │    │
│  │  • selectedVenue      • handleUpdateVenue()                         │    │
│  │  • formData           • handleDeleteVenue()                         │    │
│  │  • dialog states      • handleUpdateWidgetConfig()                  │    │
│  │  • permissions        • toggleVenueStatus()                         │    │
│  └────────────────────────────────┬────────────────────────────────────┘    │
│                                   │                                          │
│                                   ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      useVenues()                                    │    │
│  │  (Database Hook with Real-time Sync)                                │    │
│  │                                                                     │    │
│  │  • fetchVenues()      • Real-time subscription                      │    │
│  │  • createVenue()      • Automatic refresh                           │    │
│  │  • updateVenue()      • Error handling                              │    │
│  │  • deleteVenue()      • Toast notifications                         │    │
│  └────────────────────────────────┬────────────────────────────────────┘    │
│                                   │                                          │
├───────────────────────────────────┼──────────────────────────────────────────┤
│                           UTILITY LAYER                                      │
├───────────────────────────────────┼──────────────────────────────────────────┤
│                                   │                                          │
│  ┌────────────────────────┐       │       ┌────────────────────────┐        │
│  │   venueMappers.ts      │◄──────┴──────►│   venueConstants.ts    │        │
│  │                        │               │                        │        │
│  │  • mapDBVenueToUI()    │               │  • VENUE_TYPES[]       │        │
│  │  • mapUIVenueToDB()    │               │  • DEFAULT_FORM_DATA   │        │
│  │  • generateVenueSlug() │               │  • DEFAULT_VENUE_COLOR │        │
│  └────────────────────────┘               └────────────────────────┘        │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                           TYPE LAYER                                         │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────┐      │
│  │                    types/venue/index.ts                           │      │
│  │                                                                   │      │
│  │  • Venue interface          • VenueFormData interface             │      │
│  │  • VenueInput type          • VenueTypeOption interface           │      │
│  └───────────────────────────────────────────────────────────────────┘      │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────┐      │
│  │                    types/venueWidget.ts                           │      │
│  │                                                                   │      │
│  │  • VenueWidgetConfig        • ActivityWidgetConfig                │      │
│  │  • normalizeVenueWidgetConfig()                                   │      │
│  └───────────────────────────────────────────────────────────────────┘      │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. File Structure

```
src/
├── pages/
│   └── Venues.tsx                    # Main venues page (UI)
│
├── hooks/
│   └── venue/
│       ├── useVenues.ts              # Database operations + real-time
│       └── useVenueManagement.ts     # Business logic + state
│
├── types/
│   ├── venue/
│   │   └── index.ts                  # Venue, VenueInput, VenueFormData
│   └── venueWidget.ts                # Widget configuration types
│
├── utils/
│   └── venue/
│       ├── venueMappers.ts           # DB ↔ UI transformations
│       ├── venueConstants.ts         # Static config (types, defaults)
│       └── venueEmbedUtils.ts        # Embed code generation
│
├── services/
│   └── venue.service.ts              # VenueService class (legacy)
│
├── lib/
│   └── embed/
│       └── VenueEmbedManager.ts      # Embed URL & code generation
│
└── components/
    ├── venue/
    │   ├── VenueCard.tsx             # Card display component
    │   ├── VenueEmbedPreview.tsx     # Embed preview with device sim
    │   └── VenueWidgetSettings.tsx   # Widget configuration dialog
    └── widgets/
        └── CalendarWidget.tsx        # Public booking widget
```

---

## 7. RLS (Row Level Security) Policies

```sql
-- Enable RLS
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;

-- Tenant Isolation: Users can only see/edit venues in their org
CREATE POLICY "Tenant Isolation: Venues"
ON venues FOR ALL
TO authenticated
USING (
    organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid()
    )
);

-- Public Read: Anonymous can read active venues (for widgets)
CREATE POLICY "Public Read: Venues for booking widgets"
ON venues FOR SELECT
TO anon
USING (status = 'active');

-- System Admin: Can access all venues
CREATE POLICY "System Admin Full Access"
ON venues FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'system-admin'
    )
);
```

---

## 8. Trigger Functions

### 8.1 Auto-Update Organization Venues Count

```sql
CREATE OR REPLACE FUNCTION update_org_venues_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE organizations
        SET venues_count = COALESCE(venues_count, 0) + 1
        WHERE id = NEW.organization_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE organizations
        SET venues_count = GREATEST(COALESCE(venues_count, 0) - 1, 0)
        WHERE id = OLD.organization_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_org_venues_count_trigger
AFTER INSERT OR DELETE ON venues
FOR EACH ROW EXECUTE FUNCTION update_org_venues_count();
```

### 8.2 Auto-Generate Embed Key (if not using column default)

```sql
CREATE OR REPLACE FUNCTION generate_venue_embed_key()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.embed_key IS NULL THEN
        NEW.embed_key := uuid_generate_v4()::text;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_venue_embed_key_trigger
BEFORE INSERT ON venues
FOR EACH ROW EXECUTE FUNCTION generate_venue_embed_key();
```

---

## 9. Real-Time Configuration

```sql
-- Add venues to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE venues;
```

```typescript
// In useVenues.ts
const subscription = supabase
    .channel('venues-changes')
    .on('postgres_changes',
        { event: '*', schema: 'public', table: 'venues' },
        (payload) => {
            console.log('Venue changed:', payload);
            fetchVenues(); // Refresh on any change
        }
    )
    .subscribe();
```

---

## 10. Permission Matrix

| Action              | system-admin | super-admin | beta-owner | admin | manager | staff |
|---------------------|:------------:|:-----------:|:----------:|:-----:|:-------:|:-----:|
| Create Venue        | ✅           | ✅          | ✅         | ✅    | ✅      | ✅    |
| Edit Venue          | ✅           | ✅          | ✅         | ✅    | ✅      | ❌    |
| Delete Venue        | ✅           | ✅          | ✅         | ✅    | ❌      | ❌    |
| View All Venues     | ✅           | ❌          | ❌         | ❌    | ❌      | ❌    |
| Configure Widget    | ✅           | ✅          | ✅         | ✅    | ✅      | ❌    |
| Generate Embed Code | ✅           | ✅          | ✅         | ✅    | ✅      | ✅    |

---

## 11. Performance Considerations

1. **Indexes**: Created on `organization_id`, `embed_key`, `slug`, `status`
2. **Partial Index**: Active venues only (`WHERE status = 'active'`)
3. **Denormalization**: `organization_name`, `company_name` stored for display
4. **Real-time Debounce**: Auto-refresh on subscription, but fetch is debounced
5. **Lazy Loading**: Widget uses `loading="lazy"` attribute

---

## 12. Integration Points

### 12.1 With Activities Module

```typescript
// When venue is deleted, cascade to activities
ON DELETE CASCADE → activities
// Activities reference venue_id and inherit timezone
```

### 12.2 With Organizations Module

```typescript
// Venue creation updates org.venues_count via trigger
// Venue displays org.company_name for admin visibility
```

### 12.3 With Booking Widget

```typescript
// Widget fetches venue by embed_key
// Uses venue.primary_color, venue.settings.widgetConfig
// Uses venue.timezone for session time display
```

---

## 13. Future Improvements

- [ ] Multi-location support (venues under venues)
- [ ] Venue analytics dashboard
- [ ] Custom domain support for embeds
- [ ] Venue-level payment settings (separate Stripe accounts)
- [ ] Venue staff management
