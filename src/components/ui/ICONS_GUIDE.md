# BookingTMS Icon Library

Complete reference for all custom icons in the BookingTMS application.

## Available Icons

### 1. BookingTMS Brand Icon (Animated)

The official BookingTMS animated calendar icon with booking dots.

**Component**: `BookingTMSIcon`

**Features**:
- Animated calendar outline drawing effect
- Pulsing booking indicator dots
- Bouncing calendar rings
- Smooth, professional animations
- Customizable size and color

**Usage**:
```tsx
import { BookingTMSIcon } from '@/components/ui/icons';

// Basic usage
<BookingTMSIcon />

// Custom size
<BookingTMSIcon size={120} />

// With custom color (uses text color)
<BookingTMSIcon size={80} className="text-indigo-500" />

// Disable animation
<BookingTMSIcon size={80} animated={false} />
```

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `number` | `80` | Icon width/height in pixels |
| `className` | `string` | `''` | Additional CSS classes (use `text-*` for color) |
| `animated` | `boolean` | `true` | Enable/disable animations |

**Animation Details**:
- Calendar outline draws in 1.5s (infinite loop)
- Header line draws with 0.2s delay
- Calendar rings bounce vertically
- Booking dots pulse sequentially with staggered delays
- All animations use smooth easing curves

**Use Cases**:
- ✅ Loading screens
- ✅ Splash screens
- ✅ Brand identity
- ✅ Empty states
- ✅ Hero sections

---

### 2. BookingTMS Static Icon

Non-animated version of the BookingTMS icon for static displays.

**Component**: `BookingTMSIconStatic`

**Features**:
- Same design as animated version
- No animations (lightweight)
- Perfect for logos and avatars
- Customizable size and color

**Usage**:
```tsx
import { BookingTMSIconStatic } from '@/components/ui/icons';

// Basic usage
<BookingTMSIconStatic />

// In header/navbar
<BookingTMSIconStatic size={40} className="text-white" />

// As favicon or logo
<BookingTMSIconStatic size={32} className="text-indigo-600" />
```

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `number` | `80` | Icon width/height in pixels |
| `className` | `string` | `''` | Additional CSS classes (use `text-*` for color) |

**Use Cases**:
- ✅ Navigation bars
- ✅ Logos
- ✅ Favicons
- ✅ Avatars
- ✅ Email signatures
- ✅ Print materials

---

## Design Guidelines

### Color Usage

**Default (White)**:
- Use on dark backgrounds
- Loading screens
- Dark mode interfaces

```tsx
<BookingTMSIcon /> {/* White by default */}
```

**Brand Blue (#4f46e5)**:
- Use `className="text-indigo-600"` for light backgrounds
- Matches BookingTMS brand color

```tsx
<BookingTMSIcon className="text-indigo-600" />
```

**Custom Colors**:
- Use any Tailwind text color class
- Icon inherits `currentColor` when className includes `text-`

```tsx
<BookingTMSIcon className="text-emerald-500" />
<BookingTMSIcon className="text-gray-400" />
```

### Size Recommendations

| Context | Recommended Size | Example |
|---------|-----------------|---------|
| Loading Screen | `80-120px` | `<BookingTMSIcon size={80} />` |
| Hero Section | `120-200px` | `<BookingTMSIcon size={150} />` |
| Navigation Bar | `32-48px` | `<BookingTMSIconStatic size={40} />` |
| Button Icon | `20-24px` | `<BookingTMSIconStatic size={20} />` |
| Favicon | `16-32px` | `<BookingTMSIconStatic size={32} />` |

### Animation Guidelines

**When to Use Animated Version**:
- ✅ Loading states
- ✅ Splash screens
- ✅ Waiting indicators
- ✅ Brand showcases
- ✅ Hero sections (if appropriate)

**When to Use Static Version**:
- ✅ Navigation elements
- ✅ Logos
- ✅ Repeated instances (performance)
- ✅ Print materials
- ✅ Email templates
- ✅ Favicons

---

## Implementation Examples

### Loading Screen (Current)
```tsx
import { BookingTMSIcon } from '@/components/ui/icons';
import { motion } from 'motion/react';

export const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-[#0a0a0a] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <BookingTMSIcon size={80} animated={true} />
      </motion.div>
    </div>
  );
};
```

### Header Logo
```tsx
import { BookingTMSIconStatic } from '@/components/ui/icons';

export const Header = () => {
  return (
    <header className="bg-white dark:bg-[#0a0a0a] border-b">
      <div className="flex items-center gap-3 p-4">
        <BookingTMSIconStatic size={40} className="text-indigo-600 dark:text-white" />
        <h1>BookingTMS</h1>
      </div>
    </header>
  );
};
```

### Empty State
```tsx
import { BookingTMSIcon } from '@/components/ui/icons';

export const EmptyBookings = () => {
  return (
    <div className="text-center py-12">
      <BookingTMSIcon size={100} className="text-gray-300 mx-auto mb-4" animated={false} />
      <p className="text-gray-600">No bookings yet</p>
    </div>
  );
};
```

### Button Icon
```tsx
import { BookingTMSIconStatic } from '@/components/ui/icons';

export const BookNowButton = () => {
  return (
    <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg">
      <BookingTMSIconStatic size={20} />
      <span>Book Now</span>
    </button>
  );
};
```

---

## Performance Considerations

### Animated Icon
- Uses Motion (Framer Motion) for smooth animations
- 5 independent animation timelines (outline, header, rings, dots)
- Infinite loop animations
- **Recommendation**: Use sparingly (loading screens, splash screens)

### Static Icon
- Pure SVG (no animations)
- Lightweight and performant
- **Recommendation**: Use for logos, repeated instances

### Optimization Tips
1. **Use static version** when animation is not needed
2. **Limit animated instances** to 1-2 per page
3. **Consider disabling animation** on low-power devices
4. **Use appropriate sizes** (don't scale unnecessarily large icons)

---

## Accessibility

### ARIA Labels
Always include descriptive labels for screen readers:

```tsx
<div role="img" aria-label="BookingTMS Calendar Icon">
  <BookingTMSIcon />
</div>
```

### Reduced Motion
Respect user preferences for reduced motion:

```tsx
import { useReducedMotion } from 'motion/react';

const prefersReducedMotion = useReducedMotion();

<BookingTMSIcon animated={!prefersReducedMotion} />
```

### Focus Indicators
When used as interactive elements, ensure proper focus:

```tsx
<button className="focus:ring-2 focus:ring-indigo-500">
  <BookingTMSIconStatic size={24} />
</button>
```

---

## Dark Mode Support

Both icons automatically support dark mode:

```tsx
// Light mode: Use brand blue
<BookingTMSIcon className="text-indigo-600" />

// Dark mode: Use white (default)
<BookingTMSIcon />

// Responsive dark mode
<BookingTMSIcon className="text-indigo-600 dark:text-white" />
```

---

## Export Formats

To export the icon for external use:

### SVG Export
```tsx
// Copy the SVG code from BookingTMSIconStatic
// Remove motion components
// Save as booking-tms-icon.svg
```

### PNG Export
1. Render the icon at desired size
2. Use browser screenshot or canvas export
3. Save at 2x resolution for retina displays

### Favicon
```tsx
// Use 16x16, 32x32, 64x64 sizes
<BookingTMSIconStatic size={32} />
```

---

## Future Icons

As the icon library grows, additional icons will be documented here:

- [ ] BookingTMS Wordmark
- [ ] Calendar Grid Icon
- [ ] Booking Confirmation Icon
- [ ] Payment Success Icon
- [ ] Error State Icon

---

## Questions?

For icon requests or modifications, refer to:
- **Design System**: `/guidelines/DESIGN_SYSTEM.md`
- **Component Library**: `/guidelines/COMPONENT_LIBRARY.md`
- **Brand Guidelines**: Contact design team

---

**Last Updated**: November 4, 2025  
**Component Location**: `/components/ui/icons.tsx`  
**Used In**: LoadingScreen, (add more as implemented)
