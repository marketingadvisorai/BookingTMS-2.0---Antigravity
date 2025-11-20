# Events & Rooms Settings - Widget Selector Implementation

**Date**: November 4, 2025  
**Component**: `/components/games/AddGameWizard.tsx`  
**Status**: ✅ Complete

---

## Overview

Updated the Add Game/Room wizard to include widget selection functionality in the media upload step. The step has been renamed from "Media Upload" to "Media & Widget" and now includes a comprehensive widget selector.

---

## 🎯 Changes Made

### 1. **Step Renamed**
```tsx
// ❌ BEFORE
{ id: 4, name: 'Media Upload', icon: ImageIcon }

// ✅ AFTER
{ id: 4, name: 'Media & Widget', icon: ImageIcon }
```

### 2. **GameData Interface Updated**
Added `selectedWidget` field to the GameData interface:

```tsx
// Step 4: Media & Widget
coverImage: string;
galleryImages: string[];
videos: string[];
selectedWidget: string;  // ✅ NEW FIELD
```

### 3. **Default Widget Selection**
Set default widget to 'calendar-single-event' in initial state:

```tsx
const [gameData, setGameData] = useState<GameData>(initialData || {
  // ... other fields ...
  coverImage: '',
  galleryImages: [],
  videos: [],
  selectedWidget: 'calendar-single-event',  // ✅ DEFAULT
  // ... other fields ...
});
```

---

## 📋 Available Widgets

The widget selector includes **6 different booking widgets**:

### 1. **Calendar Single Event / Room Booking Page Widget** ⭐ **DEFAULT**
- **Widget ID**: `calendar-single-event`
- **Icon**: CalendarDays
- **Description**: Full-page calendar view with time slots and booking details. Perfect for single events or room bookings.
- **Badge**: "Default" (blue badge when selected)

### 2. **List Widget**
- **Widget ID**: `list-widget`
- **Icon**: FileText
- **Description**: Simple list view showing available time slots. Clean and straightforward booking experience.

### 3. **Multi-Step Widget**
- **Widget ID**: `multi-step-widget`
- **Icon**: Sparkles
- **Description**: Guided step-by-step booking process. Ideal for complex bookings with multiple options.

### 4. **Quick Book Widget**
- **Widget ID**: `quick-book-widget`
- **Icon**: Clock
- **Description**: Fast one-click booking experience. Perfect for simple, time-sensitive bookings.

### 5. **Calendar Widget**
- **Widget ID**: `calendar-widget`
- **Icon**: Calendar
- **Description**: Month/week calendar view with availability. Great for recurring events and date selection.

### 6. **FareBook Widget**
- **Widget ID**: `farebook-widget`
- **Icon**: Star
- **Description**: FareHarbor-inspired design with modern aesthetics. Professional booking experience.

---

## 🎨 UI/UX Design

### Widget Selection Card Layout

```tsx
<Card>
  <CardHeader>
    <CardTitle>Booking Widget</CardTitle>
    <CardDescription>Choose which booking widget to use for this event/room</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Widget options */}
  </CardContent>
</Card>
```

### Individual Widget Option Design

Each widget option features:

1. **Click to Select**: Entire card is clickable
2. **Visual States**:
   - **Unselected**: Gray border, white background, hover effect
   - **Selected**: Blue border, light blue background, checkmark icon
3. **Content Layout**:
   - Icon (left) with color change when selected
   - Title (bold when selected)
   - Description (gray text)
   - Check icon (right) when selected
   - "Default" badge for Calendar Single Event widget

### Styling Details

```tsx
// Unselected state
className="border-gray-200 hover:border-blue-300 hover:bg-gray-50"

// Selected state
className="border-blue-500 bg-blue-50"

// Icon colors
unselected: text-gray-600
selected: text-blue-600

// Title text
unselected: text-gray-700
selected: text-gray-900
```

---

## 💡 User Experience Flow

### Step 4: Media & Widget

1. **Cover Image Upload** (required)
   - Click to upload high-quality cover image
   - Preview with remove option on hover

2. **Gallery Images** (optional)
   - Add multiple images
   - Grid display with remove buttons
   - Add more images button

3. **Videos** (optional)
   - Upload promotional or gameplay videos
   - List view with remove options

4. **Widget Selection** ⭐ **NEW**
   - Visual cards showing all available widgets
   - "Calendar Single Event / Room Booking Page Widget" pre-selected
   - Click any widget card to change selection
   - Visual feedback with blue highlight and checkmark
   - Default badge shown on Calendar Single Event widget
   - Info message at bottom

---

## 🔄 Widget Selection Behavior

### How It Works

```tsx
// Click handler
onClick={() => updateGameData('selectedWidget', 'widget-id')}

// Conditional styling
className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
  gameData.selectedWidget === 'widget-id'
    ? 'border-blue-500 bg-blue-50'  // Selected
    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'  // Unselected
}`}

// Conditional check icon
{gameData.selectedWidget === 'widget-id' && (
  <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
)}
```

### Visual Feedback

1. **On Hover** (unselected): Border changes to light blue, background to light gray
2. **On Click**: 
   - Previous selection loses blue styling
   - New selection gains blue border + background
   - Check icon appears
   - If Calendar Single Event, "Default" badge shows
3. **Transition**: Smooth animation with `transition-all`

---

## 📊 Widget Comparison

| Widget | Use Case | Complexity | Best For |
|--------|----------|------------|----------|
| **Calendar Single Event** ⭐ | Single events, room bookings | Medium | Default choice, versatile |
| **List Widget** | Simple time slot selection | Low | Quick bookings, simple events |
| **Multi-Step Widget** | Complex bookings | High | Events with many options |
| **Quick Book Widget** | Fast bookings | Very Low | Urgent/time-sensitive bookings |
| **Calendar Widget** | Recurring events | Medium | Classes, recurring sessions |
| **FareBook Widget** | Professional bookings | Medium | Tour companies, professional services |

---

## 🎯 Info Message

At the bottom of the widget selection card:

```tsx
<div className="pt-4 border-t border-gray-200">
  <p className="text-xs text-gray-500 flex items-center gap-1">
    <Info className="w-3 h-3" />
    The selected widget will be used on your booking page. You can change this later in settings.
  </p>
</div>
```

This reassures users they can change the widget later if needed.

---

## 🔗 Integration Points

### Where the Widget Selection is Used

The `selectedWidget` value will be used to:

1. **Determine which booking widget to display** on the customer-facing booking page
2. **Configure widget-specific settings** in the Booking Widgets page
3. **Generate appropriate embed code** for website integration
4. **Store in game/room database record** for persistence

### Example Usage

```tsx
// In booking page component
const renderBookingWidget = () => {
  switch (gameData.selectedWidget) {
    case 'calendar-single-event':
      return <CalendarSingleEventBookingPage {...props} />;
    case 'list-widget':
      return <ListWidget {...props} />;
    case 'multi-step-widget':
      return <MultiStepWidget {...props} />;
    case 'quick-book-widget':
      return <QuickBookWidget {...props} />;
    case 'calendar-widget':
      return <CalendarWidget {...props} />;
    case 'farebook-widget':
      return <FareBookWidget {...props} />;
    default:
      return <CalendarSingleEventBookingPage {...props} />;
  }
};
```

---

## ✅ Testing Checklist

### Functionality
- [x] Step name updated to "Media & Widget"
- [x] Widget selector appears in Step 4
- [x] Calendar Single Event widget is pre-selected by default
- [x] Clicking widget cards changes selection
- [x] Visual feedback works (blue border, checkmark)
- [x] "Default" badge appears on Calendar Single Event widget
- [x] All 6 widgets are selectable
- [x] Selection persists when navigating between steps

### Visual Design
- [x] Widget cards have proper spacing
- [x] Icons display correctly
- [x] Text is readable and properly aligned
- [x] Hover states work on all cards
- [x] Selected state is visually distinct
- [x] Info message at bottom is clear
- [x] Responsive design works on mobile

### User Experience
- [x] Easy to understand which widget is selected
- [x] Clear descriptions help user make informed choice
- [x] Default selection makes sense for most use cases
- [x] Smooth transitions between selections
- [x] No jarring layout shifts when selecting

---

## 📱 Mobile Responsiveness

The widget selector is fully responsive:

```tsx
// Card padding already responsive from design system
<Card>
  <CardHeader className="p-3 sm:p-4 md:p-6">
  
// Widget option cards stack properly on mobile
<div className="flex items-start justify-between gap-3">
  // Icon + text on left, checkmark on right
</div>

// Text wraps naturally on small screens
<p className="text-sm text-gray-600">
  Full-page calendar view with time slots...
</p>
```

---

## 🚀 Future Enhancements (Optional)

### Potential Additions

1. **Widget Preview**
   - Show small preview/screenshot of each widget
   - Modal popup with larger preview on click

2. **Widget Recommendations**
   - Smart suggestions based on event type
   - "Recommended for your event type" badge

3. **Customization Link**
   - Direct link to widget settings from selector
   - "Customize this widget" button

4. **Widget Analytics**
   - Show conversion rates for each widget type
   - Help users make data-driven decisions

5. **A/B Testing**
   - Allow testing multiple widgets
   - Automatic optimization based on performance

---

## 📖 Related Documentation

- **Component**: `/components/games/AddGameWizard.tsx`
- **Widgets**: 
  - `/components/widgets/CalendarSingleEventBookingPage.tsx`
  - `/components/widgets/ListWidget.tsx`
  - `/components/widgets/MultiStepWidget.tsx`
  - `/components/widgets/QuickBookWidget.tsx`
  - `/components/widgets/CalendarWidget.tsx`
  - `/components/widgets/FareBookWidget.tsx`
- **Booking Widgets Page**: `/pages/BookingWidgets.tsx`

---

## 🎉 Summary

✅ **Step Renamed**: "Media Upload" → "Media & Widget"  
✅ **Widget Selector Added**: 6 widget options with visual selection  
✅ **Default Widget**: Calendar Single Event / Room Booking Page Widget  
✅ **Visual Design**: Professional card-based UI with hover/selected states  
✅ **User Friendly**: Clear descriptions, visual feedback, default badge  
✅ **Fully Functional**: Selection updates gameData, persists through navigation  

The Events & Rooms settings now provide a comprehensive widget selection experience, allowing users to choose the perfect booking widget for their needs with "Calendar Single Event / Room Booking Page Widget" as the smart default choice!

---

**Last Updated**: November 4, 2025  
**Maintained By**: BookingTMS Development Team
