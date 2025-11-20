# AI Agent Quick Start Guide
**Fast reference for AI development agents working on BookingTMS**

## 🚀 Getting Started in 60 Seconds

### 1. Understand the Project
- **What**: SaaS booking management platform for escape rooms
- **Style**: Inspired by Shopify & Stripe dashboards
- **Primary Color**: Vibrant Blue (#4f46e5 / #6366f1)
- **Themes**: Light & Dark mode support required

### 2. File Structure
```
pages/          → Main admin pages
components/
  ├── ui/       → Shadcn components (reusable)
  ├── layout/   → AdminLayout, Header, Sidebar
  ├── widgets/  → Customer-facing booking widgets
  ├── dashboard/→ Dashboard-specific components
  └── games/    → Game management components
```

### 3. Essential Imports
```tsx
// Every page needs these
import { AdminLayout } from '@/components/layout/AdminLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useTheme } from '@/components/layout/ThemeContext';

// Common UI components
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
```

---

## 🎨 Critical Design Rules

### ❌ NEVER DO THIS:
```tsx
// DON'T override typography
<h1 className="text-2xl font-bold">Title</h1>

// DON'T use hardcoded colors in dark mode
<div className="bg-white text-gray-900">

// DON'T forget mobile responsiveness
<div className="grid-cols-3">

// DON'T skip accessibility
<div onClick={handleClick}>Clickable</div>
```

### ✅ ALWAYS DO THIS:
```tsx
// DO use semantic typography
<h1>Title</h1> // globals.css handles it

// DO use dark mode pattern
const textClass = isDark ? 'text-white' : 'text-gray-900';
<h1 className={textClass}>Title</h1>

// DO mobile-first responsive
<div className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// DO proper accessibility
<button onClick={handleClick}>Clickable</button>
```

---

## 🌓 Dark Mode Cheat Sheet

### Setup (every component)
```tsx
import { useTheme } from '@/components/layout/ThemeContext';

const Component = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Define semantic classes
  const bgClass = isDark ? 'bg-[#0a0a0a]' : 'bg-gray-100';
  const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  
  // Use in JSX
  return <div className={cardBgClass}>...</div>;
};
```

### Color Quick Reference
```tsx
// Backgrounds (3-tier system)
#0a0a0a  → Main background
#161616  → Cards, containers
#1e1e1e  → Modals, elevated

// Borders
#2a2a2a  → All borders
#3a3a3a  → Hover borders

// Text
#ffffff  → Headings
#a3a3a3  → Body text
#737373  → Muted text
#525252  → Disabled

// Primary (vibrant blue)
#4f46e5  → Buttons, backgrounds
#6366f1  → Text, icons

// Success
emerald-400 (dark) / green-600 (light)

// Error
red-400 (dark) / red-500 (light)
```

---

## 📄 Page Template

### Standard Admin Page
```tsx
'use client';

import React, { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useTheme } from '@/components/layout/ThemeContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const MyPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Semantic class variables
  const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  
  const [data, setData] = useState([]);
  
  return (
    <AdminLayout>
      <PageHeader
        title="Page Title"
        description="Brief description of what this page does"
        actions={
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add New
          </Button>
        }
      />
      
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className={`${cardBgClass} border ${borderClass}`}>
            <CardHeader>
              <CardTitle className={textClass}>Metric</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${textClass}`}>1,234</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content Card */}
        <Card className={`${cardBgClass} border ${borderClass}`}>
          <CardHeader>
            <CardTitle className={textClass}>Content Section</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Content */}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default MyPage;
```

---

## 🧩 Common Patterns

### Button with Loading
```tsx
const [isLoading, setIsLoading] = useState(false);

<Button disabled={isLoading}>
  {isLoading && (
    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
  )}
  {isLoading ? 'Saving...' : 'Save'}
</Button>
```

### Form Field with Error
```tsx
<div className="space-y-2">
  <Label htmlFor="email">
    Email <span className="text-red-500">*</span>
  </Label>
  <Input
    id="email"
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    className={error ? 'border-red-500' : ''}
  />
  {error && (
    <p className="text-sm text-red-500">{error}</p>
  )}
</div>
```

### Status Badge
```tsx
const getStatusBadge = (status: string) => {
  const variants = {
    active: isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-green-100 text-green-700',
    pending: isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700',
    cancelled: isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700',
  };
  
  return (
    <Badge className={variants[status]}>
      {status}
    </Badge>
  );
};
```

### Confirmation Dialog
```tsx
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';

const [showDialog, setShowDialog] = useState(false);

<AlertDialog open={showDialog} onOpenChange={setShowDialog}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete}>
        Delete
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### Data Table
```tsx
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

<Table>
  <TableHeader>
    <TableRow>
      <TableHead className={textMutedClass}>Name</TableHead>
      <TableHead className={textMutedClass}>Status</TableHead>
      <TableHead className="text-right">Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {items.map((item) => (
      <TableRow key={item.id}>
        <TableCell className={textClass}>{item.name}</TableCell>
        <TableCell>{getStatusBadge(item.status)}</TableCell>
        <TableCell className="text-right">
          <Button variant="ghost" size="sm">Edit</Button>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

---

## 🎯 Widget Development

### Widget Theme Setup
```tsx
import { useWidgetTheme } from '@/components/widgets/WidgetThemeContext';

const Widget = ({ primaryColor = '#4f46e5' }) => {
  const { widgetTheme } = useWidgetTheme();
  const isDark = widgetTheme === 'dark';
  
  // CRITICAL: Override primaryColor with vibrant blue in dark mode
  const buttonColor = isDark ? '#4f46e5' : primaryColor;
  const textColor = isDark ? '#6366f1' : primaryColor;
  
  return (
    <button style={{ backgroundColor: buttonColor }}>
      Book Now
    </button>
  );
};
```

### Widget Layout
```tsx
<div className={`flex flex-col h-screen ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-100'}`}>
  {/* Header */}
  <div className={`${isDark ? 'bg-[#161616]' : 'bg-white'} border-b ${borderClass} p-4`}>
    <WidgetHeader />
  </div>
  
  {/* Scrollable Content */}
  <div className="flex-1 overflow-y-auto">
    <div className="p-4 space-y-4">
      {/* Content */}
    </div>
  </div>
  
  {/* Footer */}
  <div className={`${isDark ? 'bg-[#161616]' : 'bg-white'} border-t ${borderClass} p-4`}>
    <Button className="w-full" style={{ backgroundColor: buttonColor }}>
      Continue
    </Button>
  </div>
</div>
```

---

## 📱 Responsive Breakpoints

```tsx
// Mobile first!
<div className="
  grid-cols-1          // Mobile (default)
  sm:grid-cols-2       // Small (640px+)
  md:grid-cols-2       // Medium (768px+)
  lg:grid-cols-3       // Large (1024px+)
  xl:grid-cols-4       // XL (1280px+)
  gap-4 md:gap-6       // Responsive gaps
">
```

### Hide/Show by Breakpoint
```tsx
<div className="hidden lg:block">Desktop only</div>
<div className="lg:hidden">Mobile/tablet only</div>
```

---

## ♿ Accessibility Checklist

```tsx
// ✅ Proper button
<button 
  onClick={handleClick}
  className="focus:ring-2 focus:ring-[#4f46e5]"
  aria-label="Close dialog"
>
  <X className="w-4 h-4" />
</button>

// ✅ Keyboard accessible div
<div 
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
>
  Clickable
</div>

// ✅ Form with labels
<Label htmlFor="email">Email</Label>
<Input 
  id="email"
  aria-required="true"
  aria-invalid={!!error}
  aria-describedby={error ? "email-error" : undefined}
/>
{error && (
  <p id="email-error" role="alert" className="text-sm text-red-500">
    {error}
  </p>
)}

// ✅ Skip link
<a 
  href="#main-content"
  className="sr-only focus:not-sr-only"
>
  Skip to content
</a>
```

---

## 🔍 Testing Checklist

Before submitting any component:

- [ ] **Dark mode works** - Test with theme toggle
- [ ] **Responsive** - Test at 375px, 768px, 1024px
- [ ] **Keyboard accessible** - Tab through all interactive elements
- [ ] **Color contrast** - Text readable in both themes
- [ ] **Loading states** - Buttons show loading when processing
- [ ] **Error states** - Form validation displays errors
- [ ] **Empty states** - Handle no data gracefully
- [ ] **Touch targets** - Buttons at least 44x44px on mobile
- [ ] **Focus indicators** - Visible on all interactive elements
- [ ] **ARIA labels** - Screen reader accessible

---

## 🐛 Common Mistakes & Fixes

### Mistake 1: Hardcoded colors
```tsx
// ❌ Wrong
<div className="bg-white text-gray-900">

// ✅ Right
<div className={`${cardBgClass} ${textClass}`}>
```

### Mistake 2: Missing mobile styles
```tsx
// ❌ Wrong
<div className="grid-cols-3">

// ✅ Right
<div className="grid-cols-1 md:grid-cols-3">
```

### Mistake 3: No dark mode
```tsx
// ❌ Wrong
const Component = () => {
  return <div className="bg-white">...</div>;
};

// ✅ Right
const Component = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const bgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  
  return <div className={bgClass}>...</div>;
};
```

### Mistake 4: Typography override
```tsx
// ❌ Wrong - globals.css handles this
<h1 className="text-2xl font-bold">Title</h1>

// ✅ Right - let it inherit
<h1>Title</h1>

// ✅ Only override when needed
<h1 className={textClass}>Title</h1> // For dark mode
```

### Mistake 5: Non-accessible interactive
```tsx
// ❌ Wrong
<div onClick={handleClick}>Click me</div>

// ✅ Right
<button onClick={handleClick}>Click me</button>

// ✅ Or with proper accessibility
<div 
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
>
  Click me
</div>
```

---

## 📚 Documentation Reference

**Detailed Guides:**
- `/guidelines/DESIGN_SYSTEM.md` - Complete design system
- `/guidelines/COMPONENT_LIBRARY.md` - All available components
- `/DARK_MODE_COLOR_GUIDE.md` - Dark mode specifics

**Code Examples:**
- `/pages/Dashboard.tsx` - Reference admin page
- `/components/widgets/FareBookWidget.tsx` - Reference widget
- `/components/layout/AdminLayout.tsx` - Layout structure

---

## 💡 Pro Tips

1. **Copy existing patterns** - Don't reinvent the wheel
2. **Use semantic variables** - Define once, use everywhere
3. **Test dark mode first** - Catches issues early
4. **Mobile-first always** - Easier to enhance than strip down
5. **Accessibility isn't optional** - Build it in from the start
6. **Use TypeScript** - Catch errors before runtime
7. **Leverage Shadcn** - Don't build from scratch
8. **Follow the 3-tier system** - #0a0a0a → #161616 → #1e1e1e

---

## 🆘 Getting Unstuck

**Q: How do I implement dark mode?**
→ See Dark Mode Cheat Sheet above

**Q: What components are available?**
→ Check `/guidelines/COMPONENT_LIBRARY.md`

**Q: How do I make it responsive?**
→ Use mobile-first: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

**Q: What color should I use for primary buttons?**
→ Light: Custom `primaryColor`, Dark: Always `#4f46e5`

**Q: How do I structure a page?**
→ Use the Page Template above

**Q: Where do I put new components?**
→ `components/ui/` for reusable, `components/[feature]/` for specific

**Q: How do I handle forms?**
→ Use Form Field with Error pattern above

**Q: What about loading states?**
→ Use Button with Loading pattern above

---

**Quick Start Complete! 🎉**

You now have everything needed to build consistent, accessible, dark mode-compatible components for BookingTMS. When in doubt, refer to the detailed guides or copy existing patterns.

**Remember the golden rules:**
1. Dark mode ALWAYS
2. Mobile-first ALWAYS  
3. Accessibility ALWAYS
4. Vibrant blue (#4f46e5) in dark mode
5. 3-tier backgrounds (#0a0a0a → #161616 → #1e1e1e)

Happy coding! 🚀
