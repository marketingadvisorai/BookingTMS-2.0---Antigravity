# BookingTMS Widget Integration Guide

> Version: 0.1.46  
> Last Updated: 2025-11-28

Complete guide for integrating BookingTMS booking widgets into your website.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Embed Options](#embed-options)
3. [Widget Types](#widget-types)
4. [Customization](#customization)
5. [Events & Callbacks](#events--callbacks)
6. [Framework Integration](#framework-integration)
7. [Troubleshooting](#troubleshooting)

---

## Quick Start

### HTML Embed (Simplest)

```html
<!-- Add this where you want the widget to appear -->
<div id="bookingtms-widget"></div>

<!-- Add this before closing </body> tag -->
<script src="https://your-domain.com/embed/bookingtms.js"></script>
<script>
  BookingTMS.init({
    container: '#bookingtms-widget',
    embedKey: 'your-embed-key-here',
  });
</script>
```

### iframe Embed

```html
<iframe 
  src="https://your-domain.com/embed-pro?key=your-embed-key-here"
  width="100%"
  height="700"
  frameborder="0"
  style="border-radius: 16px; overflow: hidden;"
></iframe>
```

---

## Embed Options

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `embedKey` | string | required | Your unique widget embed key |
| `container` | string | `#bookingtms-widget` | CSS selector for widget container |
| `theme` | `'light'` \| `'dark'` | `'light'` | Widget color theme |
| `primaryColor` | string | `#3b82f6` | Primary brand color (hex) |
| `locale` | string | `'en'` | Language code (`en`, `es`, `fr`) |
| `onBookingComplete` | function | - | Callback when booking succeeds |
| `onError` | function | - | Callback when error occurs |

### Full Example

```javascript
BookingTMS.init({
  container: '#booking-widget',
  embedKey: 'your-embed-key',
  theme: 'light',
  primaryColor: '#6366f1',
  locale: 'en',
  onBookingComplete: (booking) => {
    console.log('Booking completed:', booking.id);
    // Redirect to thank you page
    window.location.href = '/thank-you?ref=' + booking.id;
  },
  onError: (error) => {
    console.error('Widget error:', error);
  },
});
```

---

## Widget Types

### 1. Activity Widget (Single Activity)

For booking a specific activity/experience.

```
/embed-pro?key={embedKey}&activityId={activityId}
```

**URL Parameters:**
- `key` - Embed key (required)
- `activityId` - Specific activity ID (optional, uses default if not provided)

### 2. Venue Widget (Multiple Activities)

Shows all activities at a venue, letting customers choose.

```
/embed-pro?key={embedKey}
```

### 3. Calendar Widget (Legacy)

Basic calendar view for simple bookings.

```
/embed?widget=calendar&key={embedKey}
```

---

## Customization

### CSS Custom Properties

Override these CSS variables in your stylesheet:

```css
#bookingtms-widget {
  --btms-primary: #3b82f6;
  --btms-primary-hover: #2563eb;
  --btms-background: #ffffff;
  --btms-text: #1f2937;
  --btms-text-muted: #6b7280;
  --btms-border: #e5e7eb;
  --btms-radius: 16px;
  --btms-font: 'Inter', system-ui, sans-serif;
}
```

### Responsive Sizing

```css
/* Mobile */
#bookingtms-widget {
  min-height: 600px;
}

/* Tablet and up */
@media (min-width: 768px) {
  #bookingtms-widget {
    min-height: 700px;
  }
}

/* Desktop - 2-panel layout */
@media (min-width: 1024px) {
  #bookingtms-widget {
    min-height: 650px;
  }
}
```

---

## Events & Callbacks

### Available Events

```javascript
// Listen to widget events
window.addEventListener('bookingtms:ready', (e) => {
  console.log('Widget loaded:', e.detail);
});

window.addEventListener('bookingtms:step-change', (e) => {
  console.log('Step:', e.detail.step); // 'select-date', 'select-time', etc.
});

window.addEventListener('bookingtms:booking-started', (e) => {
  console.log('Booking started:', e.detail);
});

window.addEventListener('bookingtms:booking-complete', (e) => {
  console.log('Booking complete:', e.detail.bookingId);
});

window.addEventListener('bookingtms:error', (e) => {
  console.error('Error:', e.detail.message);
});
```

### PostMessage API (for iframes)

```javascript
// Listen for messages from iframe
window.addEventListener('message', (event) => {
  if (event.data.type === 'bookingtms:booking-complete') {
    console.log('Booking ID:', event.data.bookingId);
  }
});
```

---

## Framework Integration

### React / Next.js

```tsx
import { useEffect, useRef } from 'react';

export function BookingWidget({ embedKey }: { embedKey: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load the script
    const script = document.createElement('script');
    script.src = 'https://your-domain.com/embed/bookingtms.js';
    script.async = true;
    script.onload = () => {
      if (window.BookingTMS && containerRef.current) {
        window.BookingTMS.init({
          container: containerRef.current,
          embedKey,
          onBookingComplete: (booking) => {
            console.log('Booking:', booking);
          },
        });
      }
    };
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, [embedKey]);

  return <div ref={containerRef} style={{ minHeight: 700 }} />;
}
```

### Vue.js

```vue
<template>
  <div ref="widgetContainer" style="min-height: 700px"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  embedKey: { type: String, required: true }
});

const widgetContainer = ref(null);
let script = null;

onMounted(() => {
  script = document.createElement('script');
  script.src = 'https://your-domain.com/embed/bookingtms.js';
  script.async = true;
  script.onload = () => {
    if (window.BookingTMS && widgetContainer.value) {
      window.BookingTMS.init({
        container: widgetContainer.value,
        embedKey: props.embedKey,
      });
    }
  };
  document.body.appendChild(script);
});

onUnmounted(() => {
  script?.remove();
});
</script>
```

### WordPress

1. Add to your theme's `functions.php`:

```php
function bookingtms_shortcode($atts) {
  $atts = shortcode_atts(array(
    'key' => '',
    'height' => '700px',
  ), $atts);
  
  return '<iframe 
    src="https://your-domain.com/embed-pro?key=' . esc_attr($atts['key']) . '"
    width="100%"
    height="' . esc_attr($atts['height']) . '"
    frameborder="0"
    style="border-radius: 16px;"
  ></iframe>';
}
add_shortcode('bookingtms', 'bookingtms_shortcode');
```

2. Use in posts/pages:

```
[bookingtms key="your-embed-key" height="700px"]
```

---

## Troubleshooting

### Widget Not Loading

1. **Check embed key**: Ensure it's valid and active
2. **Check console**: Look for JavaScript errors
3. **CORS issues**: Ensure your domain is whitelisted
4. **Container exists**: Verify the container element is in DOM

### Styling Issues

1. **CSS conflicts**: Use more specific selectors or iframe embed
2. **Font issues**: Ensure Inter font is loaded or override with your font
3. **Z-index**: Widget uses z-index up to 50

### Payment Issues

1. **Stripe not loading**: Check if Stripe.js is blocked
2. **Checkout fails**: Verify Stripe keys are configured
3. **3D Secure**: Some cards require additional verification

### Common Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| `INVALID_EMBED_KEY` | Embed key not found | Check key is correct |
| `ACTIVITY_NOT_FOUND` | Activity doesn't exist | Verify activity ID |
| `NO_AVAILABILITY` | No slots available | Check activity schedule |
| `PAYMENT_FAILED` | Stripe error | Check Stripe dashboard |
| `SESSION_EXPIRED` | Checkout timeout | Restart booking flow |

---

## Support

- **Documentation**: Check `/docs` folder
- **Issues**: Open GitHub issue
- **Email**: support@yourdomain.com

---

## Demo Codes for Testing

### Promo Codes
- `WELCOME10` - 10% off
- `SAVE20` - 20% off (max $50)
- `FLAT25` - $25 off (min $50 order)

### Gift Cards
- `GC-DEMO-1000` - $100 balance
- `GC-DEMO-5000` - $50 balance
- `GC-HALF-2500` - $25 remaining (partially used)
