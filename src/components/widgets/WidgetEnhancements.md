# Widget Enhancements Implementation Guide

## Overview
This guide explains the enhancements made to all booking widgets including promo codes, scrollable containers, and iframe embed functionality.

## 1. Promo Code Functionality

### Implementation
All widgets now include promo code support in their checkout/payment sections.

#### Usage
```tsx
import { PromoCodeInput } from './PromoCodeInput';

// In your checkout/payment component state
const [appliedPromo, setAppliedPromo] = useState<{code: string, discount: number} | null>(null);

// In your render/JSX
<PromoCodeInput
  onApply={(code, discount) => {
    setAppliedPromo({ code, discount });
  }}
  onRemove={() => setAppliedPromo(null)}
  appliedCode={appliedPromo?.code}
  appliedDiscount={appliedPromo?.discount}
/>
```

#### Available Promo Codes (Demo)
- `SAVE10` - 10% off
- `SAVE20` - 20% off  
- `WELCOME` - 15% off
- `VIP` - 25% off
- `FIRST` - $5 off

### Where to Add
Add the PromoCodeInput component in the checkout/payment step of each widget, typically:
- After the order summary
- Before the payment details section
- Above the total amount display

## 2. Scrollable Containers

### Implementation
All widgets are wrapped in a scrollable container with proper bottom padding.

#### Usage
```tsx
import { WidgetContainer } from './WidgetContainer';

export function YourWidget() {
  return (
    <WidgetContainer>
      {/* Your widget content */}
    </WidgetContainer>
  );
}
```

### Features
- Full height scrolling
- 80px bottom padding (5rem / pb-20) for comfortable scrolling
- Prevents content cutoff at bottom
- Works on mobile and desktop

## 3. Iframe Embed Functionality

### Components Created

#### EmbedPreview Component
Located at: `/components/widgets/EmbedPreview.tsx`

Features:
- Widget key configuration
- Embed URL generation
- Multiple code formats (HTML iframe, Script, React, WordPress)
- Live preview iframe
- Copy to clipboard functionality
- Integration tips

#### Usage in BookingWidgets Page
The embed functionality is accessible via:
1. "Embed" button on each widget template card
2. Opens full-screen dialog with embed options
3. Real-time code generation based on widget selection and color
4. Test URL that can be opened in new tab

### Embed URL Format
```
https://yourdomain.com/embed?widget={widgetId}&color={hexColor}&key={widgetKey}
```

### iFrame Code Example
```html
<iframe
  src="https://yourdomain.com/embed?widget=farebook&color=2563eb&key=YOUR_KEY"
  width="100%"
  height="800"
  frameborder="0"
  allow="payment; camera"
  allowfullscreen
  style="border: none; border-radius: 8px;"
  title="BookingTMS Widget"
></iframe>
```

## 4. Widget-Specific Implementation

### FareBookWidget
- ✅ Promo code in checkout step  
- ✅ Scrollable container with bottom padding
- ✅ Embed-ready with proper styling

### CalendarWidget
- ✅ Promo code in booking confirmation
- ✅ Scrollable container
- ✅ Responsive embed support

### ListWidget (BookGo)
- ✅ Promo code in payment section
- ✅ Scrollable container
- ✅ Grid layout preserved in embed

### QuickBookWidget
- ✅ Inline promo code field
- ✅ Single-page scroll
- ✅ Compact embed mode

### MultiStepWidget
- ✅ Promo code in step 3 (payment)
- ✅ Step-by-step scroll
- ✅ Progress preserved in embed

### ResolvexWidget
- ✅ Promo code at checkout
- ✅ Grid scroll behavior
- ✅ Beautiful embed display

### SingleGameWidget
- ✅ Promo code in booking form
- ✅ Long-form scroll
- ✅ Hero image in embed

## 5. Testing Checklist

### Promo Code Testing
- [ ] Enter valid promo code
- [ ] Enter invalid promo code
- [ ] Apply multiple codes (should replace)
- [ ] Remove applied code
- [ ] Verify discount calculation
- [ ] Test on mobile

### Scroll Testing
- [ ] Scroll to bottom of widget
- [ ] Verify 80px bottom padding visible
- [ ] Test on various screen sizes
- [ ] Check mobile scroll behavior
- [ ] Verify no content cutoff

### Embed Testing
- [ ] Copy iframe code
- [ ] Paste in test HTML file
- [ ] Verify widget loads in iframe
- [ ] Test responsive behavior
- [ ] Check cross-origin functionality
- [ ] Verify payment/camera permissions
- [ ] Test fullscreen mode

## 6. Best Practices

### For Promo Codes
1. Always validate codes server-side in production
2. Store applied codes in booking data
3. Log promo code usage for analytics
4. Set expiration dates for codes
5. Limit usage per customer

### For Scroll Containers
1. Use WidgetContainer for consistency
2. Don't add extra scroll containers inside
3. Test on mobile devices
4. Ensure CTA buttons are always visible
5. Add scroll indicators if needed

### For Embeds
1. Always use HTTPS for embed URLs
2. Set appropriate CSP headers
3. Handle postMessage for parent communication
4. Test in different browsers
5. Provide fallback for old browsers
6. Document iframe permissions needed

## 7. Future Enhancements

### Planned Features
- [ ] Dynamic promo code loading from API
- [ ] Multi-use promo codes with limits
- [ ] Promo code analytics dashboard
- [ ] A/B testing for different codes
- [ ] Automatic promo code suggestions
- [ ] Social media promo integrations

### Embed Improvements
- [ ] Auto-resizing iframes
- [ ] PostMessage API for parent-child communication
- [ ] Analytics tracking in embeds
- [ ] Custom domain support
- [ ] White-label options
- [ ] Embed performance monitoring

## 8. Support & Troubleshooting

### Common Issues

**Promo Code Not Working**
- Check code spelling and case
- Verify code is active
- Check if code already used
- Ensure code applies to selected items

**Scrolling Issues**
- Clear browser cache
- Check for conflicting CSS
- Verify WidgetContainer is used
- Test in incognito mode

**Embed Not Loading**
- Check CORS settings
- Verify embed URL is correct
- Check iframe permissions
- Test in different browser
- Check console for errors

### Getting Help
- Check documentation
- Contact support team
- Review code examples
- Join community forum
- Submit bug reports

## 9. Code Standards

### Component Structure
```tsx
// 1. Imports
import { useState } from 'react';
import { WidgetContainer } from './WidgetContainer';
import { PromoCodeInput } from './PromoCodeInput';

// 2. Types/Interfaces
interface YourWidgetProps {
  primaryColor?: string;
  config?: WidgetConfig;
}

// 3. Component
export function YourWidget({ primaryColor, config }: YourWidgetProps) {
  // 4. State
  const [appliedPromo, setAppliedPromo] = useState(null);
  
  // 5. Functions
  const handlePromoApply = (code, discount) => {
    setAppliedPromo({ code, discount });
  };
  
  // 6. Render
  return (
    <WidgetContainer>
      {/* Your content */}
      <PromoCodeInput
        onApply={handlePromoApply}
        onRemove={() => setAppliedPromo(null)}
        appliedCode={appliedPromo?.code}
        appliedDiscount={appliedPromo?.discount}
      />
    </WidgetContainer>
  );
}
```

### File Organization
```
/components/widgets/
  ├── WidgetContainer.tsx      # Scrollable wrapper
  ├── PromoCodeInput.tsx       # Promo code component
  ├── EmbedPreview.tsx         # Embed code generator
  ├── FareBookWidget.tsx       # Individual widgets
  ├── CalendarWidget.tsx
  ├── ListWidget.tsx
  ├── QuickBookWidget.tsx
  ├── MultiStepWidget.tsx
  ├── ResolvexWidget.tsx
  ├── SingleGameWidget.tsx
  ├── WidgetSettings.tsx
  └── WidgetEnhancements.md    # This file
```

## 10. Performance Considerations

### Optimization Tips
1. Lazy load widgets not in viewport
2. Minimize re-renders in promo code input
3. Debounce scroll events
4. Use React.memo for static components
5. Optimize images in widgets
6. Enable gzip compression for embeds
7. Cache embed URLs
8. Minimize iframe overhead

### Monitoring
- Track widget load times
- Monitor promo code API calls
- Check embed performance
- Analyze scroll behavior
- Monitor error rates

---

**Last Updated:** November 2025
**Version:** 1.0.0
**Maintainer:** BookingTMS Development Team
