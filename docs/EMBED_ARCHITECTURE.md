# Embed System Architecture

> **Version**: 0.1.17  
> **Last Updated**: November 25, 2025

---

## Overview

The embed system allows venues and activities to be embedded on external websites via iframe or script tags.

---

## Embed URL Format

### Venue Embed (All Activities)
```
/embed?widget=calendar&key={venue_embed_key}&color={hex}&theme={light|dark}
```

**Parameters:**
| Parameter | Required | Description |
|-----------|----------|-------------|
| `widget` | Yes | Widget type: `calendar` for venue |
| `key` | Yes | Venue embed key (e.g., `emb_abc123`) |
| `color` | No | Primary color hex (without #) |
| `theme` | No | `light` or `dark` |

### Activity Embed (Single Activity)
```
/embed?widget=booking&key={venue_embed_key}&activityId={id}&venueId={id}&color={hex}&theme={light|dark}
```

**Parameters:**
| Parameter | Required | Description |
|-----------|----------|-------------|
| `widget` | Yes | Widget type: `booking`, `singlegame`, or `calendar-booking` |
| `key` | Yes | Venue embed key |
| `activityId` | Yes | Activity UUID |
| `venueId` | No | Venue UUID (optional, for validation) |
| `color` | No | Primary color hex |
| `theme` | No | `light` or `dark` |
| `mode` | No | `fullpage` for full-page styling |

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL WEBSITE                              │
│                                                                  │
│  <iframe src="https://app.com/embed?widget=calendar&key=emb_..." │
│          ...></iframe>                                           │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                        ROUTER (router.tsx)                       │
│                                                                  │
│  /embed → Embed component                                        │
│  (Must be BEFORE /:slug catch-all route)                         │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Embed.tsx                                 │
│                                                                  │
│  1. Parse URL parameters (widget, key, theme, activityId, etc.) │
│  2. Fetch venue config via SupabaseBookingService                │
│  3. Set up real-time subscriptions                               │
│  4. Render appropriate widget component                          │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              SupabaseBookingService.getVenueWidgetConfig()       │
│                                                                  │
│  1. Query venues table by embed_key                              │
│  2. Query activities table by venue_id                           │
│  3. Merge widget config with activity data                       │
│  4. Return { venue, activities, widgetConfig }                   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     WIDGET COMPONENTS                            │
│                                                                  │
│  widget=calendar → CalendarWidget                                │
│  widget=booking  → CalendarSingleEventBookingPage               │
│  widget=singlegame → CalendarSingleEventBookingPage             │
│  widget=farebook → FareBookWidget (default)                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Key Files

| File | Purpose |
|------|---------|
| `src/router.tsx` | Routes `/embed` to Embed component |
| `src/pages/Embed.tsx` | Main embed page - parses params, fetches data |
| `src/services/SupabaseBookingService.ts` | Fetches venue and activity data |
| `src/lib/embed/EmbedManager.ts` | Generates embed URLs and code for activities |
| `src/lib/embed/VenueEmbedManager.ts` | Generates embed URLs and code for venues |
| `src/utils/venue/venueEmbedUtils.ts` | Utility functions for venue embeds |
| `src/components/widgets/CalendarWidget.tsx` | Venue calendar widget |
| `src/components/widgets/CalendarSingleEventBookingPage.tsx` | Single activity booking widget |
| `src/components/widgets/VenueEmbedPreview.tsx` | Admin preview for venue embeds |
| `src/components/events/steps/Step7WidgetEmbedNew.tsx` | Activity wizard embed step |

---

## Embed Code Generation

### For Venues (from Venues.tsx)
```typescript
import { generateEmbedCode } from '../utils/venue/venueEmbedUtils';

const code = generateEmbedCode(venue, 'light');
```

### For Activities (from Step7WidgetEmbedNew.tsx)
```typescript
import { generateEmbedCode } from '../../../lib/embed/EmbedManager';

const code = generateEmbedCode({
  activityId: activity.id,
  venueId: venue.id,
  embedKey: venue.embedKey,
  primaryColor: '#2563eb',
  theme: 'light',
}, baseUrl);
```

---

## Database Schema

### Venues Table (embed_key)
```sql
venues (
  id UUID PRIMARY KEY,
  embed_key TEXT UNIQUE, -- Auto-generated: 'emb_' + random string
  status TEXT DEFAULT 'active',
  ...
)

-- Trigger auto-generates embed_key on insert
CREATE OR REPLACE FUNCTION auto_generate_venue_embed_key()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.embed_key IS NULL OR NEW.embed_key = '' THEN
    NEW.embed_key := 'emb_' || encode(gen_random_bytes(6), 'hex');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## Common Issues & Solutions

### 1. "Venue Not Found" Error
**Cause:** Schema cache stale or embed key not found  
**Solution:** 
- Verify venue status is 'active'
- Check embed_key format (should be `emb_xxx`)
- Direct query replaced RPC to avoid cache issues

### 2. Activity Not Loading
**Cause:** activityId not parsed from URL  
**Solution:** Embed.tsx now parses `activityId` and `venueId` params

### 3. /:slug Catching /embed
**Cause:** Router order - catch-all route before specific routes  
**Solution:** `/embed` route added before `/:slug` in router.tsx

---

## PostMessage API

The embed communicates with parent via postMessage:

```javascript
// Widget loaded
{ type: 'BOOKINGTMS_WIDGET_LOADED', widget, key }

// Height resize
{ type: 'BOOKINGTMS_RESIZE', height }
{ type: 'resize-iframe', height }

// Booking complete
{ type: 'BOOKING_COMPLETE', payload: { bookingId, ... } }
```

---

## Testing Embeds

### Test Venue Embed
```
http://localhost:3000/embed?widget=calendar&key=emb_loynyx2s5hh3&theme=light
```

### Test Activity Embed
```
http://localhost:3000/embed?widget=booking&key=emb_loynyx2s5hh3&activityId={uuid}&theme=light
```
