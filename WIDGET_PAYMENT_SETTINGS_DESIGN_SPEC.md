# Widget Payment Settings Modal - Design Specification
**Version 2.0 | UI/UX Optimized | November 13, 2025**

## 🎯 Design Goals

### Primary Objectives
1. **Desktop**: Double the modal width for better content visibility and workspace
2. **Mobile**: Optimize for touch interactions and vertical scrolling
3. **Responsive**: Seamless experience across all devices
4. **Accessibility**: WCAG 2.1 AA compliant with excellent UX

---

## 📐 Modal Sizing Strategy

### Current State Analysis
**Problem:**
- Desktop: max-w-5xl (1024px) - feels cramped for payment configuration
- Layout: 3-column grid becomes squeezed on smaller viewports
- Mobile: Fixed grid doesn't adapt well to small screens

### Proposed Solution

#### Desktop (1024px+)
```tsx
Width: 95vw with max-w-[2000px]  // ~Double the current width
Height: 90vh with max-h-[90vh]   // Full vertical space
Grid: 1:2 ratio (games list : details panel)
```

**Rationale:**
- 2000px max width provides ~2x more horizontal space
- Games list gets 33% (~666px) - ample for game names & prices
- Details panel gets 67% (~1334px) - spacious for forms & configuration
- Better visibility of Stripe IDs, product info, and action buttons
- Reduced need for horizontal scrolling
- More comfortable editing experience

#### Tablet (768px - 1023px)
```tsx
Width: 95vw with max-w-[1200px]
Height: 90vh
Grid: Transition to stacked or 1:1 ratio
```

**Rationale:**
- Still uses wide layout but constrained to tablet viewport
- May start stacking on smaller tablets
- Maintains usability without overwhelming the screen

#### Mobile (< 768px)
```tsx
Width: 95vw (no max-width restriction)
Height: 95vh
Grid: Single column (stacked layout)
```

**Rationale:**
- Full viewport width maximization
- Vertical stacking prevents horizontal cramping
- Touch-friendly spacing (minimum 44x44px targets)
- Better scrolling experience
- One focus at a time (list OR details)

---

## 🎨 Layout Structure

### Desktop Layout (2000px)

```
┌────────────────────────────────────────────────────────────────┐
│  Widget Payment Settings                                    [X] │
│  Manage Stripe payment configurations                          │
├────────────────────────────────────────────────────────────────┤
│  [17 Total] [9 Configured] [8 Pending]                         │
│  [Sync All]                            9 of 17 games configured│
├────────────────────────────────────────────────────────────────┤
│ ┌──────────────┬───────────────────────────────────────────┐  │
│ │ Games        │ Prison Break                              │  │
│ │ ─────────    │ ─────────────────────────────────────     │  │
│ │              │                                            │  │
│ │ Prison Break │ [Overview] [Edit]                         │  │
│ │ $30.00    ✓  │                                            │  │
│ │              │ Current Configuration                      │  │
│ │ New Venues   │ ┌────────────────────────────────────┐    │  │
│ │ $30.00    ⚠  │ │ Stripe Product ID                 │    │  │
│ │              │ │ prod_TPVR                   [Copy] │    │  │
│ │ Advisor AI   │ └────────────────────────────────────┘    │  │
│ │ $30.00    ⚠  │                                            │  │
│ │              │ ┌────────────────────────────────────┐    │  │
│ │ [More...]    │ │ Stripe Price ID                   │    │  │
│ │              │ │ price_1SSg                  [Copy] │    │  │
│ │              │ └────────────────────────────────────┘    │  │
│ │              │                                            │  │
│ │              │ [Fetch Latest from Stripe]                │  │
│ └──────────────┴───────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
      666px              1334px
```

### Mobile Layout (< 768px)

```
┌─────────────────────────┐
│  Widget Payment [X]     │
│  Settings               │
├─────────────────────────┤
│ [17] [9] [8]            │
│ Total Conf Pend         │
├─────────────────────────┤
│ [Sync All]              │
│ 9 of 17 configured      │
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ Games               │ │
│ │ ─────               │ │
│ │ Prison Break     ✓  │ │
│ │ $30.00              │ │
│ │                     │ │
│ │ New Venues       ⚠  │ │
│ │ $30.00              │ │
│ │                     │ │
│ │ Advisor AI       ⚠  │ │
│ │ $30.00              │ │
│ │                     │ │
│ │ [More...]           │ │
│ └─────────────────────┘ │
│                         │
│ [View Selected Game →]  │
│                         │
│ OR when game selected:  │
│                         │
│ ┌─────────────────────┐ │
│ │ Prison Break        │ │
│ │ ─────────────       │ │
│ │ [Overview] [Edit]   │ │
│ │                     │ │
│ │ Stripe Product ID   │ │
│ │ prod_TPVR    [Copy] │ │
│ │                     │ │
│ │ Stripe Price ID     │ │
│ │ price_1SSg   [Copy] │ │
│ │                     │ │
│ │ [Fetch Latest]      │ │
│ └─────────────────────┘ │
│                         │
│ [← Back to Games List]  │
└─────────────────────────┘
```

---

## 📱 Responsive Breakpoints

### Mobile First Approach

```css
/* Base (Mobile): 0-767px */
- Single column layout
- Full width components
- Vertical stacking
- Large touch targets (48x48px)
- Bottom navigation for switching views

/* Tablet: 768px-1023px */
- May maintain side-by-side OR begin stacking
- 2-column stats (3 stats in 2 rows)
- Comfortable spacing

/* Desktop: 1024px-1919px */
- Full side-by-side layout
- 3-column stats (inline)
- 1:2 grid ratio
- Max width: 1400px - 1600px

/* Large Desktop: 1920px+ */
- Maximum width: 2000px
- Generous spacing
- Optimal reading width maintained
- No content stretching beyond comfort
```

---

## 🎨 Component Specifications

### 1. Stats Bar

**Desktop (2000px width):**
```tsx
<div className="grid grid-cols-3 gap-6 mb-6">
  {/* Each stat card: ~640px wide */}
  <Card>...</Card>
</div>
```

**Tablet (768-1023px):**
```tsx
<div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
  {/* Responsive: 2 cols on small tablet, 3 cols on larger */}
</div>
```

**Mobile (< 768px):**
```tsx
<div className="grid grid-cols-3 gap-2 mb-4">
  {/* Compact 3-col but smaller cards */}
  <Card className="p-2">
    <div className="text-center">
      <p className="text-xl font-bold">17</p>
      <p className="text-xs">Total</p>
    </div>
  </Card>
</div>
```

### 2. Games List

**Desktop:**
- Width: ~666px (1/3 of 2000px)
- Height: Fixed 500px with scroll
- Item height: 60px
- Spacing: 4px between items
- Hover states: Enabled

**Mobile:**
- Width: Full width (95vw)
- Height: Flexible or collapsible
- Item height: 72px (larger touch target)
- Spacing: 8px between items
- Tap highlight: Enabled

### 3. Details Panel

**Desktop:**
- Width: ~1334px (2/3 of 2000px)
- Tabs: Horizontal (Overview | Edit)
- Forms: 2-column where appropriate
- Action buttons: Right-aligned

**Mobile:**
- Width: Full width
- Tabs: Full width tabs
- Forms: Single column
- Action buttons: Full width, stacked

### 4. Action Buttons

**Desktop:**
```tsx
<div className="flex items-center justify-between gap-4">
  <Button size="default">Sync All</Button>
  <Button size="default">Fetch Latest</Button>
</div>
```

**Mobile:**
```tsx
<div className="flex flex-col gap-2">
  <Button size="lg" className="w-full">Sync All</Button>
  <Button size="lg" className="w-full">Fetch Latest</Button>
</div>
```

---

## 🎯 Touch Targets & Accessibility

### Minimum Sizes

**Desktop:**
- Buttons: 32px height minimum
- Icons: 20px - 24px
- Text: 14px - 16px
- Line height: 1.5

**Mobile:**
- Buttons: 48px height minimum
- Icons: 24px - 28px
- Text: 16px base (never smaller)
- Line height: 1.6
- Tap areas: 44x44px absolute minimum

### Focus States
- Visible keyboard focus indicators
- 2px blue outline with offset
- Skip to content links
- Logical tab order

### Color Contrast
- Text: 4.5:1 minimum (WCAG AA)
- UI Components: 3:1 minimum
- Status colors clearly distinguishable

---

## 📊 Information Density

### Desktop (2000px)
- High density acceptable
- Multiple items visible simultaneously
- Reduced scrolling
- More data on screen

### Mobile
- Low density preferred
- One primary focus at a time
- Clear visual hierarchy
- Progressive disclosure

---

## 🔄 State Management

### View States

**Desktop:**
- Games list always visible
- Details panel always visible
- Simultaneous interaction

**Mobile:**
- Toggle between views:
  1. Games List View (default)
  2. Game Details View (when selected)
- Clear back button
- Breadcrumb indication

### Loading States
- Skeleton loaders
- Inline spinners
- Non-blocking indicators
- Progress feedback

### Empty States
- Helpful messaging
- Action suggestions
- Visual hierarchy maintained

---

## 💅 Styling Guidelines

### Spacing Scale
```css
Mobile:  p-4 gap-3
Tablet:  p-5 gap-4
Desktop: p-6 gap-6
Large:   p-8 gap-8
```

### Typography Scale
```css
Mobile:
  - Title: text-lg (18px)
  - Body: text-base (16px)
  - Caption: text-sm (14px)

Desktop:
  - Title: text-xl (20px)
  - Body: text-base (16px)
  - Caption: text-sm (14px)
```

### Border Radius
```css
Mobile:  rounded-lg (8px)
Desktop: rounded-xl (12px)
```

---

## ✅ Implementation Checklist

### Phase 1: Desktop Width Expansion
- [ ] Update DialogContent max-width to 2000px
- [ ] Verify grid proportions (1:2 ratio)
- [ ] Test with various content lengths
- [ ] Ensure no horizontal scroll

### Phase 2: Mobile Optimization
- [ ] Implement view toggle (List ↔ Details)
- [ ] Vertical stacking of all components
- [ ] Touch-friendly button sizing (48px+)
- [ ] Test on actual devices

### Phase 3: Responsive Breakpoints
- [ ] Tablet layout (768px - 1023px)
- [ ] Smooth transitions between breakpoints
- [ ] Content reflow testing

### Phase 4: Accessibility
- [ ] Keyboard navigation testing
- [ ] Screen reader testing
- [ ] Color contrast verification
- [ ] Focus indicator visibility

### Phase 5: Performance
- [ ] Lazy loading for long lists
- [ ] Optimize re-renders
- [ ] Smooth animations (60fps)

---

## 🧪 Testing Matrix

| Device Type | Width | Layout | Priority |
|-------------|-------|--------|----------|
| iPhone SE | 375px | Single col | High |
| iPhone 12 | 390px | Single col | High |
| iPad Mini | 768px | Transitional | Medium |
| iPad Pro | 1024px | Side-by-side | High |
| MacBook | 1440px | Wide | High |
| Desktop | 1920px | Extra wide | High |
| 4K | 2560px | Max width | Medium |

---

## 📋 Success Criteria

### Desktop (2000px)
- ✅ Modal width exactly double the original
- ✅ Content fills width appropriately
- ✅ No wasted white space
- ✅ Improved readability
- ✅ Easier interaction with forms

### Mobile
- ✅ No horizontal scrolling
- ✅ All content accessible
- ✅ Touch targets minimum 44x44px
- ✅ Smooth transitions
- ✅ Fast loading

### All Devices
- ✅ WCAG 2.1 AA compliant
- ✅ No layout shifts
- ✅ Consistent branding
- ✅ Intuitive navigation
- ✅ Professional appearance

---

## 🎨 Visual Design Refinements

### Shadows & Depth
```css
Desktop: shadow-lg for modal, shadow-sm for cards
Mobile: shadow-md for modal, minimal internal shadows
```

### Animations
```css
Transitions: 200ms ease-in-out
Hover states: Desktop only
Active states: All devices
Loading: Smooth spinners, no jank
```

### Dark Mode
- All color tokens support dark mode
- Proper contrast maintained
- Reduced eye strain
- Subtle borders in dark mode

---

## 📝 Notes for Developers

### DO:
- Use responsive utility classes (`md:`, `lg:`)
- Test on real devices
- Implement progressive enhancement
- Maintain semantic HTML
- Add helpful comments

### DON'T:
- Hardcode pixel values
- Assume viewport size
- Skip accessibility testing
- Forget dark mode
- Over-complicate layouts

---

## 🔄 Version History

**Version 2.0 (November 13, 2025)**
- Desktop width doubled to 2000px
- Mobile-first optimization
- Comprehensive responsive strategy
- Accessibility enhancements
- Professional UI/UX standards

---

**Document Status:** ✅ Production Ready  
**Last Updated:** November 13, 2025  
**Author:** UI/UX Design Team  
**Applies To:** Widget Payment Settings Modal Only
