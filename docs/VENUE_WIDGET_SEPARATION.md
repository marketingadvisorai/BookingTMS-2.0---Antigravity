# Venue & Widget Separation Documentation

Version: 0.1.1  
Date: November 11, 2025

## Overview

This document explains the architectural separation between **Venue Management** (admin interface) and **Booking Widgets** (customer-facing templates).

---

## The Problem (Before Separation)

**Mixed Concerns:**
- Venues page was using CalendarWidgetSettings (a widget template)
- Admin management was confused with customer booking interface
- Widget templates were being modified for venue administration
- Code was tightly coupled and hard to maintain

```
❌ Before: Mixed Architecture
┌──────────────────────────────────────┐
│           Venues.tsx                  │
│  (Admin Management)                   │
├──────────────────────────────────────┤
│                                       │
│  Uses CalendarWidgetSettings  ←── ❌ │
│  (Customer template mixed with admin)│
│                                       │
│  Uses CalendarWidget for preview ←─ ❌│
│  (Template code in admin context)     │
│                                       │
└──────────────────────────────────────┘
```

---

## The Solution (After Separation)

**Clear Separation:**
- Venues = Admin management (create/edit venues and games)
- Booking Widgets = Customer templates (template gallery for future)
- Each has its own independent components
- No code sharing except core game data

```
✅ After: Separated Architecture

┌─────────────────────────────────┐      ┌──────────────────────────────┐
│   VENUE MANAGEMENT              │      │   BOOKING WIDGETS            │
│   (Admin Interface)             │      │   (Customer Templates)       │
├─────────────────────────────────┤      ├──────────────────────────────┤
│                                 │      │                              │
│  Venues.tsx                     │      │  BookingWidgets.tsx          │
│  ├─ VenueGamesManager  ✅      │      │  ├─ CalendarWidget          │
│  │  (Add/Edit/Delete games)    │      │  ├─ ListWidget              │
│  │                              │      │  ├─ GridWidget              │
│  ├─ VenuePreview  ✅           │      │  └─ SingleEventWidget       │
│  │  (Admin preview only)        │      │                              │
│  │                              │      │  (Template gallery)          │
│  └─ Game data from Supabase     │      │  (For future selection)      │
│                                 │      │                              │
└─────────────────────────────────┘      └──────────────────────────────┘
         │                                         │
         │                                         │
         └──────────── useGames Hook ─────────────┘
                    (Shared data layer)
```

---

## Architecture Components

### 1. Venue Management (Admin)

**Purpose:** Where venue owners manage their business

**Components:**

#### `VenueGamesManager.tsx`
```typescript
// Location: src/components/venue/VenueGamesManager.tsx
// Purpose: Admin interface for managing games

Features:
- Add new games (via wizard)
- Edit existing games
- Delete games
- View game details
- Real-time game list
- No customer-facing features
```

#### `VenuePreview.tsx`
```typescript
// Location: src/components/venue/VenuePreview.tsx
// Purpose: Admin preview of booking widget

Features:
- Shows how widget looks to customers
- Uses CalendarWidget internally (for accuracy)
- Admin-only context
- Preview disclaimer message
```

#### `Venues.tsx`
```typescript
// Location: src/pages/Venues.tsx
// Purpose: Main venue administration page

Features:
- Create venues
- Edit venue settings
- Manage games (via VenueGamesManager)
- Preview widget (via VenuePreview)
- Embed code generation
- Venue statistics
```

### 2. Booking Widgets (Customer Templates)

**Purpose:** Template gallery for different booking interfaces

**Components:**

#### `CalendarWidget.tsx`
```typescript
// Location: src/components/widgets/CalendarWidget.tsx
// Purpose: Calendar-style booking template

Features:
- Customer-facing design
- Date/time selection
- Game selection
- Booking flow
- Payment integration
```

#### `CalendarWidgetSettings.tsx`
```typescript
// Location: src/components/widgets/CalendarWidgetSettings.tsx
// Purpose: Settings for widget templates (FUTURE USE)

Note: Currently not used in venue management
Will be used for template customization later
```

#### Other Widgets
```
- ListWidget (list view)
- GridWidget (grid view)
- SingleEventWidget (single game booking)
- FareBookWidget (fare-based booking)
- etc.
```

---

## Data Flow

### Venue Management Flow

```
1. Admin opens Venues page
        ↓
2. Selects venue → Opens "Configure Widget"
        ↓
3. VenueGamesManager renders
        ↓
4. useGames(venueId) fetches games from Supabase
        ↓
5. Admin can:
   - Add game → AddGameWizard → createGame()
   - Edit game → AddGameWizard (edit mode) → updateGame()
   - Delete game → deleteGame()
        ↓
6. Click "Preview" → VenuePreview renders
        ↓
7. VenuePreview:
   - Fetches latest games
   - Converts to widget format
   - Renders CalendarWidget (for preview)
        ↓
8. Admin sees how customers will see the booking widget
```

### Customer Booking Flow (Separate)

```
1. Customer visits /embed/:key or booking page
        ↓
2. Embed page fetches venue by embed key
        ↓
3. Loads CalendarWidget with venue config
        ↓
4. Customer books directly
        ↓
5. No admin interface involved
```

---

## Key Differences

| Aspect | Venue Management | Booking Widgets |
|--------|------------------|-----------------|
| **Users** | Venue owners/admins | Customers |
| **Purpose** | Manage games/venue | Make bookings |
| **Components** | VenueGamesManager, VenuePreview | CalendarWidget, etc. |
| **Data Source** | Direct from Supabase | Via embed key lookup |
| **Features** | CRUD operations | Booking only |
| **UI Context** | Admin dashboard | Customer-facing |
| **Code Location** | `/components/venue/` | `/components/widgets/` |
| **Independence** | Fully independent | Fully independent |

---

## Benefits of Separation

### 1. **Clarity**
- Admin sees admin tools only
- Customers see booking interface only
- No confusion between contexts

### 2. **Maintainability**
- Changes to booking widgets don't affect admin
- Admin improvements don't impact customer experience
- Independent testing

### 3. **Scalability**
- Easy to add new widget templates
- Venue management can evolve separately
- Different teams can work on each

### 4. **Future-Ready**
- Widget gallery for template selection
- A/B testing different booking flows
- Custom widget per venue (future)

---

## Migration Notes

### What Changed

**Before:**
```typescript
// Venues.tsx used widget components directly
import CalendarWidgetSettings from '../components/widgets/CalendarWidgetSettings';
import { CalendarWidget } from '../components/widgets/CalendarWidget';

// Mixed admin and customer concerns
<CalendarWidgetSettings 
  config={venue.widgetConfig}
  onConfigChange={...}
/>
```

**After:**
```typescript
// Venues.tsx uses venue-specific components
import VenueGamesManager from '../components/venue/VenueGamesManager';
import VenuePreview from '../components/venue/VenuePreview';

// Clean separation
<VenueGamesManager 
  venueId={venue.id}
  venueName={venue.name}
/>
```

### No Breaking Changes

- Existing games continue to work
- Existing venues unchanged
- Customer booking flow unchanged
- Only admin interface improved

---

## Component Responsibilities

### VenueGamesManager
**Responsible for:**
- ✅ Adding games via wizard
- ✅ Editing games
- ✅ Deleting games
- ✅ Listing games
- ✅ Game data validation

**NOT responsible for:**
- ❌ Customer booking
- ❌ Widget template selection (future)
- ❌ Payment processing UI
- ❌ Embed code generation

### VenuePreview
**Responsible for:**
- ✅ Fetching current games
- ✅ Showing admin preview
- ✅ Using widget for accuracy

**NOT responsible for:**
- ❌ Game management
- ❌ Actual customer bookings
- ❌ Payment processing

### CalendarWidget (& other widgets)
**Responsible for:**
- ✅ Customer booking interface
- ✅ Date/time selection
- ✅ Payment flow
- ✅ Booking confirmation

**NOT responsible for:**
- ❌ Game CRUD operations
- ❌ Admin management
- ❌ Venue settings

---

## Future Enhancements

### 1. Widget Template Gallery
```typescript
// Future: BookingWidgets page
// Users can browse and select widget templates

<WidgetGallery>
  <WidgetTemplate name="Calendar View" />
  <WidgetTemplate name="List View" />
  <WidgetTemplate name="Grid View" />
  <WidgetTemplate name="Single Event" />
</WidgetGallery>

// Selected template stored in venue settings
venue.selectedTemplate = 'calendar-view';
```

### 2. Per-Venue Widget Customization
```typescript
// Future: Customize widget per venue
venue.widgetCustomization = {
  template: 'calendar-view',
  colors: { primary: '#2563eb' },
  features: { promoCode: true, giftCard: false },
  layout: 'compact'
};
```

### 3. A/B Testing
```typescript
// Future: Test different booking flows
venue.abTests = {
  'checkout-flow': {
    variant: 'single-page',
    enabled: true
  }
};
```

---

## File Structure

```
src/
├── components/
│   ├── venue/               # ✅ NEW: Venue management
│   │   ├── VenueGamesManager.tsx
│   │   └── VenuePreview.tsx
│   │
│   ├── widgets/             # Booking widgets (unchanged)
│   │   ├── CalendarWidget.tsx
│   │   ├── CalendarWidgetSettings.tsx
│   │   ├── ListWidget.tsx
│   │   └── ...
│   │
│   └── games/               # Game wizard (shared)
│       └── AddGameWizard.tsx
│
├── pages/
│   ├── Venues.tsx           # ✅ UPDATED: Uses venue components
│   ├── BookingWidgets.tsx   # Widget template gallery
│   └── Embed.tsx            # Customer booking page
│
└── hooks/
    └── useGames.ts          # Shared data layer
```

---

## Testing

### Test Venue Management

1. **Open Venues page**
2. **Click "Configure Widget"** on any venue
3. **Verify:**
   - VenueGamesManager renders
   - Games list shows
   - "Add Experience" button works
   - Can edit games
   - Can delete games

4. **Click "Preview"**
5. **Verify:**
   - VenuePreview renders
   - Shows admin disclaimer
   - Renders booking widget
   - Shows current games

### Test Booking Widgets (Unchanged)

1. **Navigate to `/embed/:key`**
2. **Verify:**
   - CalendarWidget renders
   - Can select games
   - Can book
   - Payment works

---

## Summary

**Separation Complete:**
- ✅ Venue Management = Admin tools (`/components/venue/`)
- ✅ Booking Widgets = Customer templates (`/components/widgets/`)
- ✅ Clear responsibilities
- ✅ Independent evolution
- ✅ No code duplication except data layer
- ✅ Future-ready for template gallery

**No UI/UX changes to venues - everything works the same, just better organized!**

---

**Last Updated:** November 11, 2025  
**Version:** 0.1.1  
**Status:** Complete
