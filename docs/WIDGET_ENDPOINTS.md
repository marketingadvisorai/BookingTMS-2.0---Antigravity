# Widget Embed Endpoints Architecture

> **Version**: 0.1.22  
> **Last Updated**: November 25, 2025  
> **Status**: Production

---

## 1. Overview

BookingTMS provides two primary widget types for embedding booking functionality:

| Widget Type | Purpose | Component | Use Case |
|-------------|---------|-----------|----------|
| **Venue Calendar** | All activities in a venue | `CalendarWidget` | Main booking page |
| **Single Activity** | One specific activity | `CalendarSingleEventBookingPage` | Activity-specific embed |

---

## 2. Embed URL Reference

### 2.1 Venue Calendar Widget

Shows all activities for a venue with calendar-based booking.

```
/embed?widget=calendar&key={venue_embed_key}&color={hex}&theme={light|dark}
```

| Parameter | Required | Description | Example |
|-----------|----------|-------------|---------|
| `widget` | Yes | Widget type | `calendar` |
| `key` | Yes | Venue embed key (UUID) | `abc12345-...` |
| `color` | No | Primary color (hex, no #) | `2563eb` |
| `theme` | No | Light or dark mode | `light` |
| `mode` | No | Display mode | `fullpage` |

**Example URL:**
```
https://yourapp.com/embed?widget=calendar&key=abc12345-6789-0abc-def0-123456789abc&color=2563eb&theme=light
```

---

### 2.2 Single Activity Widget

Shows one specific activity with its booking calendar.

```
/embed?widget=singlegame&activityId={uuid}&key={venue_embed_key}&color={hex}&theme={light|dark}
```

| Parameter | Required | Description | Example |
|-----------|----------|-------------|---------|
| `widget` | Yes | Widget type | `singlegame`, `booking`, `calendar-booking` |
| `activityId` | Yes | Activity UUID | `def12345-...` |
| `key` | Recommended | Venue embed key | `abc12345-...` |
| `venueId` | Optional | Venue UUID (fallback) | `xyz12345-...` |
| `color` | No | Primary color | `2563eb` |
| `theme` | No | Light/dark mode | `dark` |

**Example URL:**
```
https://yourapp.com/embed?widget=singlegame&activityId=def12345-6789-0abc-def0-123456789abc&key=abc12345-6789-0abc-def0-123456789abc&color=ff5733&theme=dark
```

---

## 3. Data Flow Diagrams

### 3.1 Venue Widget Flow

```
┌─────────────────┐    1. Load URL          ┌─────────────────┐
│  External Site  │ ────────────────────────► │   /embed page   │
│  (iframe)       │                          │                 │
└─────────────────┘                          └────────┬────────┘
                                                      │
                                                      │ 2. Parse params
                                                      │    widget=calendar
                                                      │    key=xxx
                                                      ▼
                                             ┌─────────────────┐
                                             │ fetchWidgetConfig│
                                             │                 │
                                             └────────┬────────┘
                                                      │
                                 3. SupabaseBookingService.getVenueWidgetConfig(key)
                                                      │
                                                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         Supabase Database                               │
├─────────────────────────────────────────────────────────────────────────┤
│  venues                                                                 │
│  WHERE embed_key = 'xxx' AND status = 'active'                         │
│  ───────────────────────────────────────────────────────────────────── │
│  activities                                                             │
│  WHERE venue_id = venue.id AND is_active = true                        │
└────────────────────────────────────────────────────────────────────────┘
                                                      │
                                                      │ 4. Return venue + activities
                                                      ▼
                                             ┌─────────────────┐
                                             │ CalendarWidget  │
                                             │ (BookingWizard) │
                                             └─────────────────┘
```

### 3.2 Single Activity Widget Flow

```
┌─────────────────┐    1. Load URL          ┌─────────────────┐
│  External Site  │ ────────────────────────► │   /embed page   │
│  (iframe)       │                          │                 │
└─────────────────┘                          └────────┬────────┘
                                                      │
                                                      │ 2. Parse params
                                                      │    widget=singlegame
                                                      │    activityId=xxx
                                                      ▼
                                             ┌─────────────────┐
                                             │ fetchWidgetConfig│
                                             │                 │
                                             └────────┬────────┘
                                                      │
                            3. SupabaseBookingService.getActivityWidgetConfig(activityId)
                                                      │
                                                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         Supabase Database                               │
├─────────────────────────────────────────────────────────────────────────┤
│  activities                                                             │
│  WHERE id = 'xxx' AND is_active = true                                 │
│  ───────────────────────────────────────────────────────────────────── │
│  venues (joined)                                                        │
│  WHERE id = activity.venue_id                                          │
└────────────────────────────────────────────────────────────────────────┘
                                                      │
                                                      │ 4. Return activity + venue
                                                      ▼
                                        ┌───────────────────────────┐
                                        │ CalendarSingleEventBooking│
                                        │ Page                      │
                                        └───────────────────────────┘
```

---

## 4. Component Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          Embed.tsx (Router)                              │
├─────────────────────────────────────────────────────────────────────────┤
│  • Parses URL parameters                                                │
│  • Fetches data via SupabaseBookingService                              │
│  • Routes to appropriate widget component                               │
│  • Handles real-time subscriptions                                      │
│  • Manages theme and primary color                                      │
└─────────────────────────────────────────────────────────────────────────┘
         │                                             │
         │ widget=calendar                             │ widget=singlegame
         ▼                                             ▼
┌─────────────────────────┐               ┌─────────────────────────────┐
│     CalendarWidget      │               │ CalendarSingleEventBooking  │
│                         │               │ Page                        │
├─────────────────────────┤               ├─────────────────────────────┤
│  • Shows all activities │               │  • Shows single activity    │
│  • Activity selection   │               │  • Full activity details    │
│  • Calendar view        │               │  • Calendar + time slots    │
│  • Multi-step booking   │               │  • Single-step booking      │
└──────────┬──────────────┘               └──────────────┬──────────────┘
           │                                             │
           ▼                                             │
┌─────────────────────────┐                              │
│     BookingWizard       │◄─────────────────────────────┘
├─────────────────────────┤
│  Step 1: Select Game    │
│  Step 2: Select Date    │
│  Step 3: Select Time    │
│  Step 4: Party Size     │
│  Step 5: Customer Info  │
│  Step 6: Payment        │
│  Step 7: Confirmation   │
└─────────────────────────┘
```

---

## 5. Service Methods

### SupabaseBookingService

```typescript
// Venue-level embed (uses embed_key)
static async getVenueWidgetConfig(embedKey: string) {
  // 1. Fetch venue by embed_key
  // 2. Fetch all active activities for venue
  // 3. Merge widget config from venue.settings
  // 4. Return { venue, activities, widgetConfig }
}

// Activity-level embed (uses activityId)
static async getActivityWidgetConfig(activityId: string) {
  // 1. Fetch activity by ID
  // 2. Fetch associated venue
  // 3. Return { activity, venue, widgetConfig }
}

// Individual methods
static async getVenueByEmbedKey(embedKey: string)
static async getVenueActivities(venueId: string)
static async getActivityById(activityId: string)
```

---

## 6. Embed Code Generation

### 6.1 For Venues (VenueEmbedManager)

**Location:** `/src/lib/embed/VenueEmbedManager.ts`

```typescript
// SDK method (recommended)
generateSDKEmbedCode(config, baseUrl, venueName)

// Iframe method
generateIframeEmbedCode(config, baseUrl, venueName)

// Script method (auto-resize)
generateScriptEmbedCode(config, baseUrl, venueName)

// React/Next.js
generateReactEmbedCode(config, baseUrl, venueName)

// WordPress
generateWordPressCode(config, baseUrl, venueName)
```

### 6.2 For Activities (EmbedManager)

**Location:** `/src/lib/embed/EmbedManager.ts`

```typescript
// SDK method (recommended)
generateEmbedCode(config, baseUrl)

// Iframe method
generateIframeCode(config, baseUrl)

// React/Next.js
generateReactCode(config, baseUrl)

// Full-page URL
generateFullPageUrl(config, baseUrl)
```

---

## 7. Admin UI Integration

### 7.1 Venue Embed Settings

**Location:** Venues page → Widget Settings Dialog

```
┌─────────────────────────────────────────┐
│        Widget Settings Dialog           │
├─────────────────────────────────────────┤
│  Embed Key: abc12345-...  [Copy]        │
│                                         │
│  Primary Color: [#2563eb]               │
│  Theme: [Light ▼]                       │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  Embed Code:                            │
│  ┌─────────────────────────────────┐   │
│  │ <iframe src="..." ...></iframe> │   │
│  └─────────────────────────────────┘   │
│  [Copy Code]  [Preview]                 │
│                                         │
└─────────────────────────────────────────┘
```

### 7.2 Activity Embed Settings

**Location:** Activity Wizard → Step 7 (Widget & Embed)

```
┌─────────────────────────────────────────┐
│        Widget & Embed Settings          │
├─────────────────────────────────────────┤
│  Activity: [Mystery Manor]              │
│                                         │
│  Preview:                               │
│  ┌─────────────────────────────────┐   │
│  │ [ActivityPreviewCard]           │   │
│  │ (Shows customer-facing view)    │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Embed Options:                         │
│  [x] HTML  [ ] React  [ ] WordPress     │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ <div id="booking-widget">       │   │
│  │ <script>BookingTMS.init(...)    │   │
│  └─────────────────────────────────┘   │
│  [Copy Code]  [Open Full Preview]       │
│                                         │
└─────────────────────────────────────────┘
```

---

## 8. Real-Time Updates

Both widgets subscribe to real-time changes:

```typescript
// Subscriptions in Embed.tsx
const channel = supabase
  .channel(`widget-${venueId}`)
  .on('postgres_changes', { table: 'activities' }, ...)
  .on('postgres_changes', { table: 'activity_sessions' }, ...)
  .on('postgres_changes', { table: 'venues' }, ...)
  .subscribe();
```

**What triggers updates:**
- Activity created/updated/deleted
- Session capacity changed (booking made)
- Venue settings modified

---

## 9. PostMessage Events

Widgets communicate with parent pages via PostMessage:

| Event | Direction | Payload |
|-------|-----------|---------|
| `BOOKINGTMS_WIDGET_LOADED` | Widget → Parent | `{ widget, key }` |
| `BOOKINGTMS_RESIZE` | Widget → Parent | `{ height }` |
| `BOOKINGTMS_BOOKING_COMPLETE` | Widget → Parent | `{ bookingId, confirmation }` |
| `BOOKINGTMS_ERROR` | Widget → Parent | `{ code, message }` |

---

## 10. Security

### RLS Policies (Public Access)

```sql
-- Venues: Public can read active venues
CREATE POLICY "Public Read: Venues for booking widgets"
ON venues FOR SELECT TO anon
USING (status = 'active');

-- Activities: Public can read active activities
CREATE POLICY "Public Read: Activities for booking widgets"
ON activities FOR SELECT TO anon
USING (is_active = true);

-- Sessions: Public can read available sessions
CREATE POLICY "Public Read: Activity Sessions"
ON activity_sessions FOR SELECT TO anon
USING (true);
```

### Sandbox Attributes

All iframes use security sandboxing:
```html
sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
```

---

## 11. Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| "Widget not found" | Invalid embed key | Verify key in venue settings |
| "Activity not found" | Invalid activity ID | Check activity is published and active |
| "No experiences available" | No active activities | Publish activities for the venue |
| Widget not resizing | PostMessage blocked | Check CORS and sandbox settings |
| Theme not applying | Color without # | Use hex without # prefix |

---

## 12. Migration Notes

### From Legacy `games` to `activities`

The system uses `activities` table (renamed from `games`). For backward compatibility:

```typescript
// Both are set in config
widgetConfig: {
  activities: [...],  // New
  games: [...],       // Legacy compatibility
}
```

---

## 13. File References

| File | Purpose |
|------|---------|
| `/src/pages/Embed.tsx` | Main embed router |
| `/src/components/widgets/CalendarWidget.tsx` | Venue booking widget |
| `/src/components/widgets/CalendarSingleEventBookingPage.tsx` | Activity booking widget |
| `/src/components/widgets/ActivityPreviewCard.tsx` | Admin preview (no booking) |
| `/src/services/SupabaseBookingService.ts` | Data fetching service |
| `/src/lib/embed/EmbedManager.ts` | Activity embed code generator |
| `/src/lib/embed/VenueEmbedManager.ts` | Venue embed code generator |
