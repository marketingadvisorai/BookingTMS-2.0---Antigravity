# Embed Pro 2.0 - Enterprise Architecture

> **Last Updated:** Nov 27, 2025 | **Version:** v2.1.0

## Overview

Embed Pro 2.0 is an independent, modular widget embedding system that allows organizations to embed booking widgets on their websites. It is completely separate from the legacy `Embed.tsx` system.

## Entity Relationship Diagram (ERD)

```
┌─────────────────────┐       ┌─────────────────────┐
│   embed_configs     │       │    organizations    │
├─────────────────────┤       ├─────────────────────┤
│ id (PK)             │───────│ id (PK)             │
│ organization_id (FK)│       │ name                │
│ embed_key (unique)  │       │ slug                │
│ name                │       └─────────────────────┘
│ type                │
│ target_type         │       ┌─────────────────────┐
│ target_id (FK)      │───┬───│    activities       │
│ target_ids[]        │   │   ├─────────────────────┤
│ config (JSONB)      │   │   │ id (PK)             │
│ style (JSONB)       │   │   │ venue_id (FK)       │
│ is_active           │   │   │ name                │
│ created_at          │   │   │ description         │
│ updated_at          │   │   │ price               │
└─────────────────────┘   │   │ duration            │
                          │   │ schedule (JSONB)    │
                          │   │ stripe_product_id   │
                          │   └─────────────────────┘
                          │
                          │   ┌─────────────────────┐
                          └───│      venues         │
                              ├─────────────────────┤
                              │ id (PK)             │
                              │ organization_id (FK)│
                              │ name                │
                              │ address, city, state│
                              │ primary_color       │
                              │ timezone            │
                              └─────────────────────┘
```

## Module Structure

```
/src/modules/embed-pro/
├── ARCHITECTURE.md              # This file
├── index.ts                     # Module exports
│
├── pages/
│   └── EmbedProPage.tsx         # Main embed route component (< 100 lines)
│
├── containers/
│   └── EmbedProContainer.tsx    # Data orchestration container (< 200 lines)
│
├── widgets/
│   ├── index.ts                 # Widget exports
│   ├── BookingWidgetPro.tsx     # Full booking widget (< 250 lines)
│   ├── CalendarWidgetPro.tsx    # Calendar-only widget (< 200 lines)
│   └── ButtonWidgetPro.tsx      # Button trigger widget (< 150 lines)
│
├── widget-components/
│   ├── index.ts                 # Component exports
│   ├── WidgetHeader.tsx         # Activity/venue header (< 100 lines)
│   ├── WidgetCalendar.tsx       # Calendar grid (< 200 lines)
│   ├── WidgetTimeSlots.tsx      # Time slot selection (< 150 lines)
│   ├── WidgetPartySize.tsx      # Party size selector (< 100 lines)
│   ├── WidgetCheckout.tsx       # Checkout form (< 200 lines)
│   ├── WidgetSuccess.tsx        # Success confirmation (< 100 lines)
│   └── WidgetError.tsx          # Error state (< 80 lines)
│
├── hooks/
│   ├── index.ts                 # Hook exports
│   ├── useEmbedProData.ts       # Data fetching (< 150 lines)
│   ├── useBookingFlow.ts        # Booking state machine (< 200 lines)
│   └── useCalendarState.ts      # Calendar selection (< 100 lines)
│
├── services/
│   ├── index.ts                   # Service exports
│   ├── embedProData.service.ts    # Orchestrator (< 200 lines)
│   ├── availability.service.ts    # Real-time slot availability (< 220 lines)
│   ├── widgetData.normalizer.ts   # Data transformation (< 200 lines)
│   ├── checkoutPro.service.ts     # Stripe checkout (< 180 lines)
│   ├── embedConfig.service.ts     # Config CRUD (< 170 lines)
│   ├── analytics.service.ts       # Widget analytics (< 150 lines)
│   └── preview.service.ts         # Preview mode (< 180 lines)
│
├── types/
│   ├── index.ts                 # Type exports
│   ├── embed-config.types.ts    # Config types (existing)
│   └── widget.types.ts          # Widget-specific types (< 150 lines)
│
└── utils/
    ├── index.ts                 # Utility exports
    └── dateUtils.ts             # Date/time helpers (< 100 lines)
```

## Data Flow

```
1. URL Request
   /embed-pro?key=emb_abc123&theme=light
   
2. EmbedProPage.tsx
   - Parse URL params
   - Render EmbedProContainer
   
3. EmbedProContainer.tsx
   - Call useEmbedProData(embedKey)
   - Handle loading/error states
   - Route to correct widget by type
   
4. useEmbedProData.ts
   - embedProDataService.getConfigByKey()
   - embedProDataService.getTargetData()
   - Return normalized WidgetData
   
5. Widget Component (e.g., BookingWidgetPro)
   - Receive widgetData
   - Render booking flow
   - Use useBookingFlow for state
   
6. Checkout → Stripe → Success
```

## URL Parameters

| Param   | Type    | Required | Description                    |
|---------|---------|----------|--------------------------------|
| key     | string  | Yes      | Embed key from embed_configs   |
| theme   | string  | No       | 'light' or 'dark'              |
| preview | boolean | No       | Preview mode (no real booking) |

## Widget Types

| Type            | Description                              | Route To           |
|-----------------|------------------------------------------|---------------------|
| booking-widget  | Full booking with calendar + checkout    | BookingWidgetPro   |
| calendar-widget | Calendar showing availability            | CalendarWidgetPro  |
| button-widget   | Button that opens popup                  | ButtonWidgetPro    |
| inline-widget   | Inline embedded widget                   | BookingWidgetPro   |
| popup-widget    | Modal/popup widget                       | BookingWidgetPro   |

## Target Types

| Type           | Description                    | Data Fetched              |
|----------------|--------------------------------|---------------------------|
| activity       | Single activity booking        | Activity + parent Venue   |
| venue          | All activities at venue        | Venue + all Activities    |
| multi-activity | Selected activities            | Multiple Activities       |

## Styling

CSS Variables are used for theming:
```css
--ep-primary: Primary brand color
--ep-secondary: Secondary color
--ep-background: Background color
--ep-text: Text color
--ep-border-radius: Border radius
--ep-font-family: Font family
```

## Route Configuration

Add to App.tsx routes:
```tsx
<Route path="/embed-pro" element={<EmbedProPage />} />
```

## Preview Integration

EmbedPreviewPanel uses:
```
/embed-pro?key={embed_key}&preview=true&theme={theme}
```

## Cross-Browser & Zero-Downtime Design

### Browser Compatibility
- **No modern-only APIs** without fallbacks
- Date formatting uses manual arrays, not `toLocaleDateString()` options
- CSS uses widely supported properties (no CSS Container Queries)
- ES6+ is transpiled via Vite for IE11+ support

### Graceful Degradation
```
1. Real availability → Database sessions (activity_sessions)
   ↓ (if error)
2. Fallback slots → Schedule-based generation
   ↓ (if error)
3. Error message → "Unable to load availability"
```

### Retry Logic
- Network failures automatically retry (2 attempts)
- 500ms delay between retries
- Silent fallback to cached/generated data

### Zero-Downtime Patterns
- Widgets work offline with generated slots
- No hard dependencies on external services
- Supabase RLS allows anonymous reads
- Assets served via CDN with long cache headers

## Service Architecture (Modular)

```
embedProData.service.ts (Orchestrator)
    ├── getWidgetData()          → Main entry point
    ├── getConfigByKey()         → Fetch embed config
    ├── getActivityWithVenue()   → Activity + venue
    ├── getVenueWithActivities() → Venue + all activities
    └── delegates to:
        ├── widgetData.normalizer.ts  → Transform DB → Widget format
        └── availability.service.ts   → Real-time slot availability
            ├── getAvailableSlots()
            ├── checkSessionAvailability()
            └── getDateRangeAvailability()
```
