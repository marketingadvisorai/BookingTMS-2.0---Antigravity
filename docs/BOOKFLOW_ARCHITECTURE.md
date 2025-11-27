# BookFlow Widget Architecture

## Overview

BookFlow is a modern, embeddable booking widget system that allows venues to embed booking functionality on external websites. It replaces legacy FareHarbor-style widgets with a clean, maintainable architecture.

## ERD (Entity Relationship Diagram)

```
┌─────────────────────┐
│   organizations     │
├─────────────────────┤
│ id (PK)             │
│ name                │
│ status              │
└─────────┬───────────┘
          │ 1
          │
          ├──────────────────┬────────────────────┐
          │                  │                    │
          ▼ many             ▼ many               ▼ many
┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐
│      venues         │ │     activities      │ │   embed_configs     │
├─────────────────────┤ ├─────────────────────┤ ├─────────────────────┤
│ id (PK)             │ │ id (PK)             │ │ id (PK)             │
│ organization_id (FK)│ │ organization_id (FK)│ │ organization_id (FK)│
│ name                │ │ venue_id (FK)       │ │ name                │
│ slug                │ │ name                │ │ embed_key (unique)  │
│ primary_color       │ │ price               │ │ type                │
│ timezone            │ │ duration            │ │ target_type         │
│ settings (jsonb)    │ │ schedule (jsonb)    │ │ target_id           │
│ status              │ │ is_active           │ │ config (jsonb)      │
└─────────────────────┘ └─────────────────────┘ │ style (jsonb)       │
          │                       │             │ is_active           │
          │                       │             └─────────────────────┘
          │ 1                     │                       │
          │                       │                       │
          └───────────────────────┘                       │
                    ▲                                     │
                    │                                     │
                    └─────────────────────────────────────┘
                              target_id references
                         (activity.id OR venue.id)
```

## Widget Types

| Type | target_type | Description |
|------|-------------|-------------|
| `booking-widget` | `activity` | Single activity booking (calendar + time + players) |
| `booking-widget` | `venue` | Venue booking (activity selector + calendar + time + players) |
| `calendar-widget` | `activity` | Calendar-only view for single activity |
| `button-widget` | any | "Book Now" button that opens popup |

## Data Flow

```
1. External Site loads embed script
        ↓
2. Script loads /embed?key=emb_xxx
        ↓
3. Embed.tsx fetches embed_config by key
        ↓
4. Based on target_type:
   - activity → BookFlowSingle
   - venue → BookFlowVenue
        ↓
5. Widget fetches live data from activities/venues
        ↓
6. User selects date/time/players → Stripe Checkout
```

## File Structure

```
src/components/widgets/bookflow/
├── index.ts                    # Re-exports all components
├── types.ts                    # TypeScript interfaces (~80 lines)
│
├── BookFlowWidget.tsx          # Main entry (~100 lines)
│   → Routes to Single or Venue based on targetType
│
├── BookFlowSingle/
│   ├── index.tsx              # Single activity widget (~200 lines)
│   └── BookFlowSingleCheckout.tsx  # Checkout step (~180 lines)
│
├── BookFlowVenue/
│   ├── index.tsx              # Venue widget (~200 lines)
│   ├── ActivitySelector.tsx   # Activity picker (~120 lines)
│   └── BookFlowVenueCheckout.tsx   # Checkout step (~180 lines)
│
├── components/
│   ├── BookFlowCalendar.tsx   # Calendar component (~150 lines)
│   ├── BookFlowTimeSlots.tsx  # Time picker (~120 lines)
│   ├── BookFlowPlayerCount.tsx # Player count (~100 lines)
│   ├── BookFlowHeader.tsx     # Widget header (~80 lines)
│   └── BookFlowPricing.tsx    # Price display (~100 lines)
│
├── hooks/
│   ├── useBookFlowActivity.ts # Activity data hook (~80 lines)
│   ├── useBookFlowVenue.ts    # Venue data hook (~80 lines)
│   ├── useBookFlowSlots.ts    # Available slots hook (~100 lines)
│   └── useBookFlowCheckout.ts # Checkout logic (~120 lines)
│
└── services/
    └── bookflow.service.ts    # API calls (~150 lines)
```

## Component Hierarchy

```
<BookFlowWidget>
  ├── targetType === 'activity'
  │   └── <BookFlowSingle>
  │         ├── <BookFlowHeader />
  │         ├── <BookFlowCalendar />
  │         ├── <BookFlowTimeSlots />
  │         ├── <BookFlowPlayerCount />
  │         ├── <BookFlowPricing />
  │         └── <BookFlowSingleCheckout />
  │
  └── targetType === 'venue'
      └── <BookFlowVenue>
            ├── <BookFlowHeader />
            ├── <ActivitySelector />
            ├── <BookFlowCalendar />
            ├── <BookFlowTimeSlots />
            ├── <BookFlowPlayerCount />
            ├── <BookFlowPricing />
            └── <BookFlowVenueCheckout />
```

## Styling Strategy

- Uses Tailwind CSS for styling
- Primary color passed via CSS variable `--bf-primary`
- Responsive design (mobile-first)
- Dark mode support via `dark:` classes

## Integration Points

1. **Embed Pro Dashboard** → Creates/manages embed_configs
2. **Embed Page** → Loads embed_configs and renders BookFlowWidget
3. **Activities Table** → Source of activity data
4. **Venues Table** → Source of venue data
5. **Sessions Table** → Available time slots
6. **Stripe** → Payment processing
