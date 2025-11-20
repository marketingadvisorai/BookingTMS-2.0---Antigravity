# 📋 BookingTMS Developer Cheat Sheet
**One-page reference for common tasks**

## 🎨 Colors

### Light Mode
```css
Background:     #f3f4f6 (gray-100)
Card:           #ffffff (white)
Border:         #e5e7eb (gray-200)
Text Primary:   #111827 (gray-900)
Text Secondary: #4b5563 (gray-600)
Text Muted:     #6b7280 (gray-500)
```

### Dark Mode
```css
Background:     #0a0a0a (tier 1)
Card:           #161616 (tier 2)
Elevated:       #1e1e1e (tier 3)
Border:         #2a2a2a
Text Primary:   #ffffff
Text Secondary: #a3a3a3
Text Muted:     #737373
```

### Primary (Vibrant Blue)
```css
Background:     #4f46e5
Text/Icons:     #6366f1
Hover:          #4338ca
```

### Semantic Colors
```css
Success Dark:   #34d399 (emerald-400)
Success Light:  #10b981 (green-600)
Error Dark:     #f87171 (red-400)
Error Light:    #ef4444 (red-500)
Warning Dark:   #fbbf24 (amber-400)
Warning Light:  #f59e0b (amber-500)
```

---

## 🌓 Dark Mode Template

```tsx
import { useTheme } from '@/components/layout/ThemeContext';

const Component = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Semantic class variables
  const bgClass = isDark ? 'bg-[#0a0a0a]' : 'bg-gray-100';
  const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const hoverBgClass = isDark ? 'hover:bg-[#1e1e1e]' : 'hover:bg-gray-50';
  
  return (
    <div className={bgClass}>
      <div className={`${cardBgClass} border ${borderClass} p-6`}>
        <h1 className={textClass}>Title</h1>
        <p className={textMutedClass}>Description</p>
      </div>
    </div>
  );
};
```

---

## 📱 Responsive Breakpoints

```tsx
// Mobile-first approach
className="
  grid-cols-1      // Mobile (default, 0px+)
  sm:grid-cols-2   // Small (640px+)
  md:grid-cols-2   // Medium (768px+)
  lg:grid-cols-3   // Large (1024px+)
  xl:grid-cols-4   // XL (1280px+)
  2xl:grid-cols-5  // 2XL (1536px+)
"
```

### Hide/Show by Screen Size
```tsx
<div className="hidden lg:block">Desktop only</div>
<div className="lg:hidden">Mobile/tablet only</div>
<div className="hidden md:block lg:hidden">Tablet only</div>
```

---

## 🧩 Component Quick Reference

### Button
```tsx
import { Button } from '@/components/ui/button';

<Button variant="default">Primary</Button>
<Button variant="outline">Secondary</Button>
<Button variant="ghost">Tertiary</Button>
<Button variant="destructive">Delete</Button>

// With loading
<Button disabled={loading}>
  {loading && <Spinner />}
  {loading ? 'Saving...' : 'Save'}
</Button>
```

### Card
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

<Card className={`${cardBgClass} border ${borderClass}`}>
  <CardHeader>
    <CardTitle className={textClass}>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

### Input
```tsx
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

<div className="space-y-2">
  <Label htmlFor="email">Email *</Label>
  <Input id="email" type="email" placeholder="you@example.com" />
  {error && <p className="text-sm text-red-500">{error}</p>}
</div>
```

### Select
```tsx
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="1">Option 1</SelectItem>
    <SelectItem value="2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

### Dialog
```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className={isDark ? 'bg-[#1e1e1e]' : 'bg-white'}>
    <DialogHeader>
      <DialogTitle className={textClass}>Title</DialogTitle>
    </DialogHeader>
    <div>Content</div>
  </DialogContent>
</Dialog>
```

### Table
```tsx
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Column 1</TableHead>
      <TableHead>Column 2</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.map(row => (
      <TableRow key={row.id}>
        <TableCell>{row.col1}</TableCell>
        <TableCell>{row.col2}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

---

## 📄 Page Templates

### Admin Page
```tsx
'use client';

import { AdminLayout } from '@/components/layout/AdminLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useTheme } from '@/components/layout/ThemeContext';

const Page = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <AdminLayout>
      <PageHeader 
        title="Page Title"
        description="Description"
        actions={<Button>Add</Button>}
      />
      <div className="space-y-6">
        {/* Content */}
      </div>
    </AdminLayout>
  );
};

export default Page;
```

### Widget
```tsx
import { useWidgetTheme } from '@/components/widgets/WidgetThemeContext';

const Widget = ({ primaryColor = '#4f46e5' }) => {
  const { widgetTheme } = useWidgetTheme();
  const isDark = widgetTheme === 'dark';
  const btnColor = isDark ? '#4f46e5' : primaryColor;
  
  return (
    <div className={isDark ? 'bg-[#0a0a0a]' : 'bg-white'}>
      <button style={{ backgroundColor: btnColor }}>Book</button>
    </div>
  );
};
```

---

## ♿ Accessibility

### Button
```tsx
// ✅ Native button
<button onClick={handleClick} aria-label="Close">
  <X className="w-4 h-4" />
</button>

// ✅ Accessible div
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
  aria-label="Action"
>
  Content
</div>
```

### Form
```tsx
<Label htmlFor="name">Name *</Label>
<Input
  id="name"
  aria-required="true"
  aria-invalid={!!error}
  aria-describedby={error ? "name-error" : undefined}
/>
{error && (
  <p id="name-error" role="alert" className="text-sm text-red-500">
    {error}
  </p>
)}
```

### Focus
```tsx
className="
  focus:outline-none 
  focus:ring-2 
  focus:ring-[#4f46e5] 
  focus:ring-offset-2
  focus:ring-offset-white
  dark:focus:ring-offset-[#0a0a0a]
"
```

---

## 🎯 Common Patterns

### Loading Spinner
```tsx
<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
```

### Status Badge
```tsx
const statusColors = {
  active: isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-green-100 text-green-700',
  pending: isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700',
  error: isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700',
};

<Badge className={statusColors[status]}>{status}</Badge>
```

### Empty State
```tsx
<div className="text-center py-12">
  <Icon className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-[#525252]' : 'text-gray-400'}`} />
  <h3 className={`text-lg mb-2 ${textClass}`}>No items found</h3>
  <p className={textMutedClass}>Get started by adding your first item</p>
  <Button className="mt-4">Add Item</Button>
</div>
```

### Confirmation Dialog
```tsx
import { AlertDialog } from '@/components/ui/alert-dialog';

<AlertDialog open={open} onOpenChange={setOpen}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

## 📏 Spacing Scale

```tsx
// Tailwind spacing (4px base)
p-1   = 4px      gap-1  = 4px
p-2   = 8px      gap-2  = 8px
p-3   = 12px     gap-3  = 12px
p-4   = 16px     gap-4  = 16px
p-5   = 20px     gap-5  = 20px
p-6   = 24px     gap-6  = 24px
p-8   = 32px     gap-8  = 32px
p-10  = 40px     gap-10 = 40px
p-12  = 48px     gap-12 = 48px
```

### Common Spacing Patterns
```tsx
// Page container
className="container mx-auto px-4 py-6 lg:px-8 lg:py-8"

// Card padding
className="p-6"

// Section spacing
className="space-y-6"

// Grid gaps
className="gap-4 md:gap-6"

// Button spacing
className="px-6 py-2"
```

---

## 🎨 Typography

```tsx
// Let globals.css handle it
<h1>Heading 1</h1>
<h2>Heading 2</h2>
<h3>Heading 3</h3>
<p>Body text</p>

// Only add classes for dark mode
<h1 className={textClass}>Heading</h1>
<p className={textMutedClass}>Muted text</p>

// Responsive text sizes (when needed)
<h1 className="text-2xl md:text-3xl lg:text-4xl">
  Responsive Heading
</h1>
```

---

## ⚡ Performance

### Code Splitting
```tsx
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />
});
```

### Memoization
```tsx
import { memo, useMemo, useCallback } from 'react';

const Component = memo(({ data }) => {
  const processed = useMemo(() => processData(data), [data]);
  const handleClick = useCallback(() => {}, []);
  return <div>{processed}</div>;
});
```

### Image Optimization
```tsx
<ImageWithFallback
  src={image}
  alt="Description"
  className="w-full h-full object-cover"
  loading="lazy"
/>
```

---

## 🐛 Debugging Quick Fixes

### Dark mode not working?
```tsx
// ✅ Check these:
1. Is ThemeContext imported?
2. Is isDark defined?
3. Are semantic classes used?
4. Is component wrapped in ThemeProvider?
```

### Component not responsive?
```tsx
// ✅ Check these:
1. Mobile-first classes? (grid-cols-1 md:grid-cols-2)
2. Fixed widths removed?
3. Tested at 375px, 768px, 1024px?
```

### Accessibility issues?
```tsx
// ✅ Check these:
1. Proper semantic HTML? (<button> vs <div>)
2. ARIA labels present?
3. Keyboard navigation works?
4. Focus indicators visible?
5. Contrast ratio ≥ 4.5:1?
```

---

## ✅ Pre-Commit Checklist

- [ ] Dark mode works (toggle tested)
- [ ] Responsive (tested 375px, 768px, 1024px)
- [ ] Keyboard accessible (tab through)
- [ ] ARIA labels added
- [ ] Color contrast verified
- [ ] Loading states implemented
- [ ] Error states handled
- [ ] Empty states designed
- [ ] TypeScript types correct
- [ ] No console errors

---

## 🔗 Quick Links

- [Full Design System](./DESIGN_SYSTEM.md)
- [Component Library](./COMPONENT_LIBRARY.md)
- [Quick Start Guide](./AI_AGENT_QUICK_START.md)
- [Main Guidelines](./Guidelines.md)

---

**Print this page for quick reference!** 📋

Last Updated: November 2, 2025
