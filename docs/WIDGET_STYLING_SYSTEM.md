# Widget Styling System

## Overview

The BookFlow widget styling system provides comprehensive customization options for developers to seamlessly integrate booking widgets into their websites. This system supports:

- **Theme Presets**: Pre-built themes for quick setup
- **CSS Variable Injection**: Dynamic theming without conflicts
- **Developer-Friendly Options**: Match any website design
- **Stripe Connect Integration**: Secure checkout with connected accounts

## Module Structure

```
/src/modules/embed-pro/styles/
├── index.ts           - Module exports
├── types.ts           - TypeScript definitions
├── constants.ts       - Styling constants (shadows, fonts, colors)
├── presets.ts         - Theme presets (Liquid Glass, Minimal, etc.)
├── cssVariables.ts    - CSS variable generation & injection
├── utils.ts           - Color utilities and helpers
└── animations.ts      - CSS and Framer Motion animations
```

## Quick Start

### Using Theme Presets

```tsx
import { useWidgetStyling } from '@/modules/embed-pro/hooks';

// Apply a preset theme
const { styles, setTheme } = useWidgetStyling({
  theme: 'liquid-glass-light',  // or 'liquid-glass-dark', 'minimal-light'
  colorMode: 'auto',  // 'light', 'dark', or 'auto' (system preference)
});
```

### Custom Primary Color

```tsx
const { styles, setPrimaryColor } = useWidgetStyling();

// Change the primary brand color
setPrimaryColor('#FF5722');
```

### Custom CSS

```tsx
const { styles } = useWidgetStyling({
  customCSS: `
    .bookflow-widget {
      max-width: 500px;
      margin: 0 auto;
    }
    .bookflow-widget .bw-button {
      text-transform: uppercase;
    }
  `,
});
```

## Available Theme Presets

| Theme ID | Name | Description |
|----------|------|-------------|
| `liquid-glass-light` | Liquid Glass | Modern glassmorphism with blur effects |
| `liquid-glass-dark` | Liquid Glass Dark | Dark mode glassmorphism |
| `minimal-light` | Minimal | Clean, ultra-simple design |

## CSS Variables Reference

All CSS variables use the `--bw` prefix to prevent conflicts:

### Colors
- `--bw-color-primary` - Main brand color
- `--bw-color-primary-hover` - Hover state color
- `--bw-color-secondary` - Secondary color
- `--bw-color-success` - Success messages (#10b981)
- `--bw-color-error` - Error messages (#ef4444)
- `--bw-color-warning` - Warning messages (#f59e0b)

### Backgrounds
- `--bw-bg-base` - Widget background
- `--bw-bg-card` - Card backgrounds
- `--bw-bg-input` - Input field backgrounds
- `--bw-bg-hover` - Hover state backgrounds

### Typography
- `--bw-font-family` - Main font family
- `--bw-text-xs` through `--bw-text-3xl` - Font sizes

### Spacing
- `--bw-space-1` through `--bw-space-16` - Spacing scale
- `--bw-container-padding` - Container padding
- `--bw-card-padding` - Card padding

### Effects
- `--bw-radius-button` - Button border radius
- `--bw-radius-card` - Card border radius
- `--bw-blur` - Backdrop blur amount
- `--bw-transition-default` - Default transition

## Advanced Styling Options

The Edit Embed Modal includes an Advanced Styles tab with:

### Visual Effects
- **Glassmorphism**: Toggle glass blur effects on/off
- **Animations**: Enable/disable smooth transitions
- **Hover Effects**: Button scale animation on hover

### Shadows
- **Card Shadow**: none, sm, md, lg, xl, 2xl
- **Button Shadow**: none, sm, md, lg, xl, 2xl

### Typography
- **Heading Font**: Separate font for headings
- **Inherit Parent Fonts**: Use website's fonts

### Colors
- **Success Color**: Confirmation messages
- **Error Color**: Error messages and validation

### Custom CSS
Direct CSS injection for advanced customization.

## Stripe Connect Integration

The checkout service automatically handles Stripe Connect for multi-tenant organizations:

```typescript
import { checkoutService } from '@/modules/embed-pro/services';

// Check if organization has Stripe configured
const status = await checkoutService.getStripeConnectStatus(organizationId);
// Returns: { connected, chargesEnabled, payoutsEnabled }

// Create checkout session with Connect
const result = await checkoutService.createCheckoutSession({
  activity,
  venue,
  selectedDate,
  selectedTime,
  adultCount: 2,
  childCount: 0,
  customerInfo,
  organizationId,
  successUrl: window.location.origin + '/booking/success',
  cancelUrl: window.location.origin + '/booking/cancel',
});

if (result.success) {
  window.location.href = result.checkoutUrl;
}
```

## Developer Integration Guide

### Option 1: iFrame Embed

```html
<iframe 
  src="https://yourdomain.com/embed-pro-widget?key=emb_xxxxx&theme=light"
  style="width: 100%; height: 600px; border: none;"
></iframe>
```

### Option 2: Script Embed

```html
<div id="booking-widget"></div>
<script src="https://yourdomain.com/embed/bookflow.js"></script>
<script>
  BookFlow.mount('#booking-widget', {
    key: 'emb_xxxxx',
    theme: 'light',
    primaryColor: '#3B82F6',
  });
</script>
```

### Option 3: React Component

```tsx
import { EmbedProWidget } from '@/modules/embed-pro';

<EmbedProWidget
  embedKey="emb_xxxxx"
  theme="light"
  primaryColor="#3B82F6"
  onBookingComplete={(bookingId) => console.log('Booked:', bookingId)}
/>
```

## Color Utilities

```typescript
import { 
  lightenColor, 
  darkenColor, 
  hexToRgba, 
  getContrastTextColor 
} from '@/modules/embed-pro/styles/utils';

// Lighten a color by 20%
const lighter = lightenColor('#2563eb', 20);  // #5183ef

// Get proper text color for a background
const textColor = getContrastTextColor('#1f2937');  // #ffffff
```

## Animation Classes

Available CSS animation classes:

- `.bw-animate-fade-in` - Fade in
- `.bw-animate-slide-up` - Slide up with fade
- `.bw-animate-scale-in` - Scale and fade in
- `.bw-animate-pulse` - Gentle pulse
- `.bw-animate-spin` - Continuous rotation
- `.bw-animate-shimmer` - Loading shimmer effect

## Framer Motion Variants

```tsx
import { FRAMER_VARIANTS, TRANSITIONS } from '@/modules/embed-pro/styles';

<motion.div
  variants={FRAMER_VARIANTS.slideUp}
  initial="initial"
  animate="animate"
  exit="exit"
>
  Content
</motion.div>
```

## Best Practices

1. **Use CSS Variables**: Prefer CSS variables over inline styles for consistency
2. **Test Dark Mode**: Always verify your widget looks good in both modes
3. **Mobile First**: Widget is responsive by default, test on all screen sizes
4. **Accessibility**: Ensure color contrast meets WCAG 2.1 AA standards
5. **Performance**: Use `enableAnimations: false` for low-end devices

## Troubleshooting

### Widget Styles Not Applying
- Check if the widget container has `.bookflow-widget` class
- Verify CSS variables are injected (check DevTools > Styles)
- Try `autoInject: true` in `useWidgetStyling` options

### Checkout Not Working
- Verify organization has Stripe Connect configured
- Check `chargesEnabled` status in Stripe Dashboard
- Ensure `organizationId` is passed to checkout service

### Font Not Loading
- Add the font to your website's `<head>`
- Use `inheritParentFonts: true` to use website fonts
- Verify font family string is correct

## Version History

- **v2.2.0** (Dec 09, 2025): Added comprehensive styling system, CSS variable injection, advanced styling options
- **v2.1.0**: Added Stripe Connect checkout service
- **v2.0.0**: Initial Embed Pro release
