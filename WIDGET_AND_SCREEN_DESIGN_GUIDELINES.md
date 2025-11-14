# Widget & Screen Design Guidelines
**Version 1.0 | Production Standard | November 13, 2025**

## 📋 Overview

This document provides comprehensive design guidelines for creating consistent, professional, and user-friendly widgets and screens across the Booking TMS application. Follow these guidelines for all new features, widgets, and UI components.

---

## 🎯 Design Principles

### 1. **Consistency First**
- All widgets should follow the same visual language
- Use consistent spacing, colors, and typography
- Maintain uniform interaction patterns

### 2. **Mobile-First Approach**
- Design for mobile, then scale up
- Ensure touch-friendly targets (minimum 44x44px)
- Test on actual devices, not just browser resize

### 3. **Progressive Enhancement**
- Basic functionality works everywhere
- Enhanced features for larger screens
- Graceful degradation for older browsers

### 4. **Accessibility**
- WCAG 2.1 AA compliance minimum
- Keyboard navigation support
- Screen reader friendly
- Sufficient color contrast (4.5:1 for text)

---

## 📐 Responsive Breakpoints

### Standard Breakpoints
```css
Mobile:        0px - 639px   (default)
Small Tablet:  640px - 767px  (sm:)
Tablet:        768px - 1023px (md:)
Desktop:       1024px - 1279px (lg:)
Large Desktop: 1280px+        (xl:)
```

### Breakpoint Usage

**Mobile (0-639px):**
- Single column layouts
- Stacked components
- Full-width cards
- Larger tap targets
- Simplified navigation

**Small Tablet (640-767px):**
- 2-column layouts where appropriate
- Slightly more compact spacing
- Begin showing more information

**Tablet (768-1023px):**
- 2-3 column layouts
- Side-by-side content
- More horizontal space utilization
- Optimized for iPad

**Desktop (1024px+):**
- Multi-column layouts
- Maximum content density
- Hover states and tooltips
- Advanced interactions

---

## 🎨 Visual Design Standards

### Color System

**Primary Colors:**
```css
Blue Primary:   #2563eb (blue-600)
Blue Hover:     #1d4ed8 (blue-700)
Blue Light:     #3b82f6 (blue-500)
```

**Secondary Colors:**
```css
Green Success:  #16a34a (green-600)
Red Error:      #dc2626 (red-600)
Amber Warning:  #d97706 (amber-600)
Gray Neutral:   #6b7280 (gray-500)
```

**Dark Mode:**
```css
Background:     #161616
Surface:        #1e1e1e
Border:         #2a2a2a
Text Primary:   #ffffff
Text Secondary: #a3a3a3
Accent:         #4f46e5 (indigo-600)
```

### Typography

**Font Family:**
- Primary: System font stack (San Francisco, Segoe UI, Roboto)
- Monospace: For code and IDs

**Font Sizes:**
```css
xs:  0.75rem  (12px) - Captions, labels
sm:  0.875rem (14px) - Body text
base: 1rem    (16px) - Default body
lg:  1.125rem (18px) - Subheadings
xl:  1.25rem  (20px) - Headings
2xl: 1.5rem   (24px) - Page titles
```

**Font Weights:**
```css
normal: 400 - Body text
medium: 500 - Emphasis
semibold: 600 - Headings
bold: 700 - Strong emphasis
```

### Spacing System

**Standard Spacing Scale:**
```css
1:  0.25rem  (4px)
2:  0.5rem   (8px)
3:  0.75rem  (12px)
4:  1rem     (16px)
5:  1.25rem  (20px)
6:  1.5rem   (24px)
8:  2rem     (32px)
12: 3rem     (48px)
```

**Responsive Spacing:**
```tsx
// Mobile to Desktop progression
padding="p-4 sm:p-5 md:p-6 lg:p-8"
gap="gap-4 sm:gap-5 md:gap-6"
margin="m-4 md:m-6 lg:m-8"
```

---

## 🔲 Component Patterns

### Modal/Dialog Design

**Settings Modals:**
```tsx
className="
  !w-[95vw] !max-w-[500px] !h-[95vh] !max-h-[95vh]     /* Mobile */
  sm:!w-[90vw] sm:!max-w-[700px]                        /* Small Tablet */
  md:!w-[85vw] md:!max-w-[900px]                        /* Tablet */
  lg:!w-[80vw] lg:!max-w-[1000px]                       /* Desktop */
  !rounded-lg overflow-hidden p-0 flex flex-col
"
```

**Wizard/Multi-Step Modals:**
```tsx
className="
  !w-[90vw] !max-w-[1000px] !h-[90vh] !max-h-[90vh]    /* Base */
  md:!max-w-[1200px]                                     /* Desktop wider */
  !rounded-lg overflow-hidden p-0 flex flex-col
"
```

**Key Principles:**
- Fixed header and footer
- Scrollable content area with `overflow-y-auto`
- Use `flex flex-col` for proper layout
- Visible native scrollbar for content indication

### Card Design

**Standard Card:**
```tsx
<Card className="border border-gray-200 dark:border-[#2a2a2a]">
  <CardHeader className="px-4 py-3 sm:px-6 sm:py-4">
    <CardTitle className="text-lg sm:text-xl">Title</CardTitle>
    <CardDescription>Description text</CardDescription>
  </CardHeader>
  <CardContent className="px-4 py-4 sm:px-6 space-y-4">
    {/* Content */}
  </CardContent>
</Card>
```

**Responsive Card Grid:**
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
  {items.map(item => <Card key={item.id}>...</Card>)}
</div>
```

### Button Design

**Primary Button:**
```tsx
<Button className="bg-blue-600 hover:bg-blue-700 dark:bg-[#4f46e5] dark:hover:bg-[#4338ca]">
  Action
</Button>
```

**Icon Button:**
```tsx
<Button className="gap-2">
  <Icon className="w-4 h-4" />
  Label
</Button>
```

**Responsive Button:**
```tsx
<Button className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base">
  Action
</Button>
```

### Form Design

**Form Field:**
```tsx
<div className="space-y-2">
  <Label htmlFor="field" className="text-sm font-medium">
    Field Label <span className="text-red-500">*</span>
  </Label>
  <Input 
    id="field"
    placeholder="Enter value"
    className="w-full"
  />
  <p className="text-xs text-gray-500 dark:text-[#737373]">
    Helper text
  </p>
</div>
```

**Form Layout:**
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
  {/* Form fields */}
</div>
```

---

## 📱 Widget-Specific Guidelines

### Settings Widgets

**Structure:**
1. Header with icon and title
2. Tabbed navigation (if multiple sections)
3. Scrollable content area
4. Action buttons (Save, Cancel)

**Tab Layout:**
```tsx
<TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1 h-auto">
  <TabsTrigger value="general" className="text-xs sm:text-sm">
    General
  </TabsTrigger>
  {/* More tabs */}
</TabsList>
```

### Advanced Settings Tab

**Layout Pattern:**
```tsx
<TabsContent value="advanced" className="space-y-6 pb-24">
  {/* Feature Cards */}
  <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
    <CardHeader>
      <div className="flex items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-blue-600" />
            Feature Title
          </CardTitle>
          <CardDescription>Description</CardDescription>
        </div>
        <Button>Action</Button>
      </div>
    </CardHeader>
    <CardContent>
      {/* Stats or Content */}
    </CardContent>
  </Card>
</TabsContent>
```

**Stats Display:**
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
      <span className="text-lg font-bold text-blue-600">12</span>
    </div>
    <div>
      <p className="text-sm font-medium">Stat Label</p>
      <p className="text-xs text-muted-foreground">Description</p>
    </div>
  </div>
</div>
```

---

## ♿ Accessibility Guidelines

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Logical tab order
- Visible focus indicators
- Skip links for long content

### Screen Readers
- Proper ARIA labels
- Semantic HTML structure
- Alt text for images
- Descriptive link text

### Color & Contrast
- Text contrast ratio: 4.5:1 minimum
- Large text (18pt+): 3:1 minimum
- Don't rely on color alone for information
- Support dark mode

---

## 🎭 Interaction Patterns

### Loading States
```tsx
{isLoading ? (
  <div className="flex items-center justify-center p-8">
    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
  </div>
) : (
  <Content />
)}
```

### Empty States
```tsx
<div className="text-center py-12 px-4">
  <Icon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
    No items found
  </h3>
  <p className="text-sm text-gray-500 dark:text-[#737373] mb-4">
    Get started by creating your first item
  </p>
  <Button>Create Item</Button>
</div>
```

### Error States
```tsx
<div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-4">
  <div className="flex items-start gap-3">
    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
    <div>
      <h4 className="text-sm font-medium text-red-800 dark:text-red-400 mb-1">
        Error Title
      </h4>
      <p className="text-sm text-red-700 dark:text-red-500">
        Error message details
      </p>
    </div>
  </div>
</div>
```

---

## 🔄 State Management

### Form State
- Always validate on submit
- Show errors clearly
- Disable submit while loading
- Preserve form data on error

### API State
- Show loading indicators
- Handle errors gracefully
- Provide retry mechanisms
- Cache when appropriate

---

## 📊 Performance Guidelines

### Code Splitting
- Lazy load heavy components
- Split by route
- Dynamic imports for modals

### Image Optimization
- Use appropriate formats (WebP, AVIF)
- Lazy load offscreen images
- Provide loading placeholders
- Responsive images

### Bundle Size
- Tree-shake unused code
- Minimize dependencies
- Use production builds
- Monitor bundle size

---

## ✅ Testing Checklist

### Visual Testing
- [ ] All breakpoints (mobile, tablet, desktop)
- [ ] Dark mode
- [ ] Different screen sizes
- [ ] Browser compatibility (Chrome, Firefox, Safari, Edge)

### Functional Testing
- [ ] All interactive elements work
- [ ] Form validation
- [ ] Error handling
- [ ] Loading states

### Accessibility Testing
- [ ] Keyboard navigation
- [ ] Screen reader compatibility
- [ ] Color contrast
- [ ] ARIA labels

### Performance Testing
- [ ] Page load time < 3s
- [ ] No layout shifts
- [ ] Smooth animations
- [ ] No console errors

---

## 📝 Documentation Standards

### Component Documentation
```tsx
/**
 * FeatureName Component
 * 
 * @description Brief description of what this component does
 * @param {Props} props - Component props
 * @returns {JSX.Element} Rendered component
 * 
 * @example
 * <FeatureName prop1="value" prop2={value} />
 */
```

### Code Comments
- Explain **why**, not **what**
- Document complex logic
- Note any workarounds
- Reference tickets/issues

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] No console errors
- [ ] Build succeeds
- [ ] Environment variables set

### Post-Deployment
- [ ] Verify in production
- [ ] Check error monitoring
- [ ] Test critical paths
- [ ] Monitor performance

---

## 📚 References

### Design System
- Tailwind CSS Documentation
- shadcn/ui Components
- Radix UI Primitives
- Lucide Icons

### Best Practices
- React Documentation
- TypeScript Handbook
- WCAG Guidelines
- MDN Web Docs

---

## 🔄 Version History

### Version 1.0 (November 13, 2025)
- Initial guidelines established
- Based on fixing-10.1 branch design
- Production deployment standards
- Comprehensive component patterns

---

**Last Updated:** November 13, 2025  
**Branch:** render-deploy-0.1  
**Tag:** render-deploy-20251113-1520  
**Status:** Production Standard
