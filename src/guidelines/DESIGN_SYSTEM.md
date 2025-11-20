# BookingTMS Design System & Branding Guidelines
**Version 2.0** | Last Updated: November 2, 2025

## 📋 Table of Contents
1. [Brand Identity](#brand-identity)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Component Patterns](#component-patterns)
6. [Dark Mode System](#dark-mode-system)
7. [Widget Design System](#widget-design-system)
8. [Responsive Design](#responsive-design)
9. [Accessibility Standards](#accessibility-standards)
10. [Code Conventions](#code-conventions)

---

## 🎨 Brand Identity

### Overview
BookingTMS is a comprehensive SaaS platform for escape room booking management. The design draws inspiration from modern admin dashboards like **Shopify** and **Stripe**, emphasizing clarity, efficiency, and professionalism.

### Brand Personality
- **Professional**: Enterprise-grade reliability
- **Modern**: Clean, contemporary interfaces
- **Efficient**: Task-focused workflows
- **Trustworthy**: Secure and transparent
- **Accessible**: Easy to use for all skill levels

### Design Philosophy
1. **Clarity over complexity** - Information is organized hierarchically
2. **Consistency across contexts** - Patterns repeat throughout the app
3. **Progressive disclosure** - Show what's needed, when it's needed
4. **Feedback & confirmation** - Users always know what's happening
5. **Performance-focused** - Fast, responsive interactions

---

## 🎨 Color System

### Primary Colors

#### Vibrant Blue (Primary Brand Color)
```css
/* Use for primary actions, active states, brand elements */
--primary-500: #4f46e5;  /* Main brand color */
--primary-600: #6366f1;  /* Lighter variant for text/icons */
--primary-400: #818cf8;  /* Hover states */
--primary-300: #a5b4fc;  /* Disabled states */
```

**Usage:**
- Active sidebar items
- Primary buttons
- Links and interactive elements
- Focus states
- Brand accents

#### Deep Blue (Admin Portal Secondary)
```css
/* Legacy color - being phased out in favor of Vibrant Blue */
--deep-blue: #1e40af;
```

### Semantic Colors

#### Success (Emerald)
```css
/* Light mode */
--success-light: #10b981;      /* Green-600 */
--success-light-bg: #d1fae5;   /* Green-100 */
--success-light-border: #a7f3d0; /* Green-200 */

/* Dark mode */
--success-dark: #34d399;       /* Emerald-400 */
--success-dark-bg: rgba(16, 185, 129, 0.1);
--success-dark-border: rgba(16, 185, 129, 0.3);
```

**Usage:**
- Success messages
- Confirmation states
- Positive metrics
- Applied promo codes
- Secure/verified badges

#### Warning (Amber)
```css
/* Light mode */
--warning-light: #f59e0b;      /* Amber-500 */
--warning-light-bg: #fef3c7;   /* Amber-100 */

/* Dark mode */
--warning-dark: #fbbf24;       /* Amber-400 */
--warning-dark-bg: rgba(245, 158, 11, 0.1);
```

**Usage:**
- Warning messages
- Caution states
- Pending actions
- Important notices

#### Error (Red)
```css
/* Light mode */
--error-light: #ef4444;        /* Red-500 */
--error-light-bg: #fee2e2;     /* Red-100 */

/* Dark mode */
--error-dark: #f87171;         /* Red-400 */
--error-dark-bg: rgba(239, 68, 68, 0.1);
```

**Usage:**
- Error messages
- Destructive actions
- Failed states
- Validation errors
- Required field indicators

#### Info (Blue)
```css
/* Light mode */
--info-light: #3b82f6;         /* Blue-500 */
--info-light-bg: #dbeafe;      /* Blue-100 */

/* Dark mode */
--info-dark: #60a5fa;          /* Blue-400 */
--info-dark-bg: rgba(59, 130, 246, 0.1);
```

**Usage:**
- Info messages
- Help text
- Tooltips
- Informational badges

### Neutral Colors (Grayscale)

#### Light Mode Neutrals
```css
--gray-50: #f9fafb;   /* Lightest background */
--gray-100: #f3f4f6;  /* Main background */
--gray-200: #e5e7eb;  /* Borders */
--gray-300: #d1d5db;  /* Dividers */
--gray-400: #9ca3af;  /* Disabled text */
--gray-500: #6b7280;  /* Muted text */
--gray-600: #4b5563;  /* Secondary text */
--gray-700: #374151;  /* Body text */
--gray-900: #111827;  /* Headings */
```

#### Dark Mode Neutrals (3-Tier System)
```css
/* Tier 1: Deepest background */
--dark-bg-1: #0a0a0a;    /* Main page background */

/* Tier 2: Card backgrounds */
--dark-bg-2: #161616;    /* Elevated containers */

/* Tier 3: Elevated elements */
--dark-bg-3: #1e1e1e;    /* Modals, dropdowns, popovers */

/* Borders */
--dark-border: #2a2a2a;  /* All borders in dark mode */
--dark-border-light: #3a3a3a; /* Hover borders */

/* Text */
--dark-text-primary: #ffffff;     /* Headings, important text */
--dark-text-secondary: #a3a3a3;   /* Body text, labels */
--dark-text-tertiary: #737373;    /* Muted text, placeholders */
--dark-text-disabled: #525252;    /* Disabled text */
```

### Color Application Rules

#### Admin Portal
```tsx
// Light Mode
backgroundColor: 'white'
textColor: 'text-gray-900'
mutedText: 'text-gray-600'
borders: 'border-gray-200'

// Dark Mode (Admin)
backgroundColor: 'bg-[#0a0a0a]'
cardBackground: 'bg-[#161616]'
textColor: 'text-white'
mutedText: 'text-[#a3a3a3]'
borders: 'border-[#2a2a2a]'
```

#### Customer-Facing Widgets
```tsx
// Primary actions always use vibrant blue in dark mode
primaryButton: isDark ? '#4f46e5' : customPrimaryColor
primaryText: isDark ? '#6366f1' : customPrimaryColor

// Semantic colors adapt to theme
success: isDark ? '#34d399' : '#10b981'
error: isDark ? '#f87171' : '#ef4444'
```

---

## 📝 Typography

### Font Families

#### Primary Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
             'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 
             'Helvetica Neue', sans-serif;
```

**System fonts provide:**
- Optimal performance (no font loading)
- Native feel on each platform
- Excellent readability
- Consistent rendering

#### Inspiration Typography (Reference Only)
- **Headings**: Poppins (not implemented - use system)
- **Body**: Inter (not implemented - use system)

### Type Scale

#### Headings
```css
/* h1 - Page Titles */
.text-heading-1 {
  font-size: 2.25rem;      /* 36px */
  line-height: 2.5rem;     /* 40px */
  font-weight: 700;
  letter-spacing: -0.025em;
}

/* h2 - Section Titles */
.text-heading-2 {
  font-size: 1.875rem;     /* 30px */
  line-height: 2.25rem;    /* 36px */
  font-weight: 600;
  letter-spacing: -0.025em;
}

/* h3 - Subsection Titles */
.text-heading-3 {
  font-size: 1.5rem;       /* 24px */
  line-height: 2rem;       /* 32px */
  font-weight: 600;
}

/* h4 - Card Titles */
.text-heading-4 {
  font-size: 1.25rem;      /* 20px */
  line-height: 1.75rem;    /* 28px */
  font-weight: 600;
}

/* h5 - List Item Titles */
.text-heading-5 {
  font-size: 1.125rem;     /* 18px */
  line-height: 1.75rem;    /* 28px */
  font-weight: 600;
}
```

#### Body Text
```css
/* Large body */
.text-body-lg {
  font-size: 1.125rem;     /* 18px */
  line-height: 1.75rem;    /* 28px */
  font-weight: 400;
}

/* Regular body */
.text-body {
  font-size: 1rem;         /* 16px */
  line-height: 1.5rem;     /* 24px */
  font-weight: 400;
}

/* Small body */
.text-body-sm {
  font-size: 0.875rem;     /* 14px */
  line-height: 1.25rem;    /* 20px */
  font-weight: 400;
}

/* Extra small / captions */
.text-caption {
  font-size: 0.75rem;      /* 12px */
  line-height: 1rem;       /* 16px */
  font-weight: 400;
}
```

### Typography Rules

#### ⚠️ CRITICAL: Don't Override Default Typography
```tsx
// ❌ NEVER do this unless explicitly requested
<h1 className="text-2xl font-bold">Title</h1>

// ✅ DO THIS - Let globals.css handle it
<h1>Title</h1>

// ⚠️ Only add typography classes when user requests specific styling
<p className="text-sm text-gray-600">Muted text</p> // Only if needed
```

#### Typography in Dark Mode
```tsx
// Use semantic class variables
const textClass = isDark ? 'text-white' : 'text-gray-900';
const textMutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
const textTertiaryClass = isDark ? 'text-[#737373]' : 'text-gray-500';

<h1 className={textClass}>Heading</h1>
<p className={textMutedClass}>Description</p>
<span className={textTertiaryClass}>Helper text</span>
```

---

## 📏 Spacing & Layout

### Spacing Scale
```css
/* Based on 4px base unit */
--spacing-0: 0;
--spacing-1: 0.25rem;  /* 4px */
--spacing-2: 0.5rem;   /* 8px */
--spacing-3: 0.75rem;  /* 12px */
--spacing-4: 1rem;     /* 16px */
--spacing-5: 1.25rem;  /* 20px */
--spacing-6: 1.5rem;   /* 24px */
--spacing-8: 2rem;     /* 32px */
--spacing-10: 2.5rem;  /* 40px */
--spacing-12: 3rem;    /* 48px */
--spacing-16: 4rem;    /* 64px */
--spacing-20: 5rem;    /* 80px */
```

### Layout Patterns

#### Admin Portal Layout
```tsx
<div className="flex h-screen bg-gray-100 dark:bg-[#0a0a0a]">
  {/* Sidebar: 280px wide on desktop, hidden on mobile */}
  <Sidebar className="hidden lg:flex w-[280px]" />
  
  {/* Main content area */}
  <div className="flex-1 flex flex-col overflow-hidden">
    {/* Header: 64px tall */}
    <Header className="h-16" />
    
    {/* Page content with padding */}
    <main className="flex-1 overflow-y-auto">
      <div className="container mx-auto px-4 py-6 lg:px-8 lg:py-8">
        {/* Page header */}
        <PageHeader 
          title="Page Title"
          description="Page description"
          className="mb-8"
        />
        
        {/* Content sections */}
        <div className="space-y-6">
          {/* Content cards */}
        </div>
      </div>
    </main>
  </div>
  
  {/* Mobile bottom nav: 64px tall */}
  <MobileBottomNav className="lg:hidden h-16" />
</div>
```

#### Card Layout
```tsx
<Card className="p-6 space-y-4">
  <CardHeader className="px-0 pt-0">
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  
  <CardContent className="px-0 space-y-4">
    {/* Content */}
  </CardContent>
  
  <CardFooter className="px-0 pb-0 flex justify-end gap-3">
    <Button variant="outline">Cancel</Button>
    <Button>Save</Button>
  </CardFooter>
</Card>
```

#### Grid Patterns
```tsx
// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => <GridItem key={item.id} {...item} />)}
</div>

// Stats grid (4 columns on desktop)
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  <KPICard title="Total Bookings" value="1,234" />
  <KPICard title="Revenue" value="$45,678" />
  <KPICard title="Customers" value="567" />
  <KPICard title="Avg. Rating" value="4.8" />
</div>
```

### Container Sizes
```css
/* Max widths for content containers */
--container-sm: 640px;   /* Forms, narrow content */
--container-md: 768px;   /* Default content */
--container-lg: 1024px;  /* Wide content */
--container-xl: 1280px;  /* Extra wide content */
--container-2xl: 1536px; /* Full-width dashboards */
```

---

## 🧩 Component Patterns

### Buttons

#### Primary Button
```tsx
<Button 
  className="bg-[#4f46e5] hover:bg-[#4338ca] text-white"
  onClick={handleClick}
>
  Primary Action
</Button>

// With dark mode
<Button 
  style={{ 
    backgroundColor: isDark ? '#4f46e5' : primaryColor 
  }}
  className="text-white"
>
  Primary Action
</Button>
```

#### Button Variants
```tsx
// Outline
<Button variant="outline">Secondary Action</Button>

// Ghost
<Button variant="ghost">Tertiary Action</Button>

// Destructive
<Button variant="destructive">Delete</Button>

// Link
<Button variant="link">Learn More</Button>
```

#### Button Sizes
```tsx
<Button size="sm">Small</Button>      // Height: 36px
<Button size="default">Default</Button> // Height: 40px
<Button size="lg">Large</Button>      // Height: 44px
```

#### Loading State
```tsx
<Button disabled={isLoading}>
  {isLoading && (
    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
  )}
  {isLoading ? 'Processing...' : 'Submit'}
</Button>
```

### Input Fields

#### Standard Input
```tsx
<div className="space-y-2">
  <Label htmlFor="email">
    Email <span className="text-red-500">*</span>
  </Label>
  <Input
    id="email"
    type="email"
    placeholder="Enter your email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    required
  />
  {error && (
    <p className="text-sm text-red-500">{error}</p>
  )}
</div>
```

#### Input with Icon
```tsx
<div className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
  <Input
    className="pl-10"
    placeholder="Search..."
  />
</div>
```

### Cards

#### Standard Card
```tsx
<Card className={isDark ? 'bg-[#161616] border-[#2a2a2a]' : 'bg-white border-gray-200'}>
  <CardHeader>
    <CardTitle className={textClass}>Card Title</CardTitle>
    <CardDescription className={textMutedClass}>
      Card description text
    </CardDescription>
  </CardHeader>
  
  <CardContent>
    {/* Content */}
  </CardContent>
  
  <CardFooter>
    {/* Actions */}
  </CardFooter>
</Card>
```

#### Stats/KPI Card
```tsx
<Card className="p-6">
  <div className="flex items-center justify-between mb-2">
    <p className={textMutedClass}>Total Revenue</p>
    <TrendingUp className="w-4 h-4 text-green-500" />
  </div>
  <h3 className={`text-2xl font-bold ${textClass}`}>
    $45,678
  </h3>
  <p className="text-sm text-green-500 mt-1">
    +12.5% from last month
  </p>
</Card>
```

### Badges

```tsx
// Status badges
<Badge variant="default">Active</Badge>
<Badge variant="secondary">Pending</Badge>
<Badge variant="outline">Draft</Badge>
<Badge variant="destructive">Cancelled</Badge>

// Success badge
<Badge className={isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-green-100 text-green-700'}>
  Confirmed
</Badge>
```

### Tables

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead className={textMutedClass}>Name</TableHead>
      <TableHead className={textMutedClass}>Status</TableHead>
      <TableHead className={textMutedClass}>Amount</TableHead>
      <TableHead className="text-right">Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {items.map((item) => (
      <TableRow key={item.id}>
        <TableCell className={textClass}>{item.name}</TableCell>
        <TableCell>
          <Badge>{item.status}</Badge>
        </TableCell>
        <TableCell className={textClass}>${item.amount}</TableCell>
        <TableCell className="text-right">
          <Button variant="ghost" size="sm">Edit</Button>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### Dialogs/Modals

```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent className={isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : 'bg-white'}>
    <DialogHeader>
      <DialogTitle className={textClass}>Dialog Title</DialogTitle>
      <DialogDescription className={textMutedClass}>
        Dialog description text
      </DialogDescription>
    </DialogHeader>
    
    <div className="space-y-4 py-4">
      {/* Content */}
    </div>
    
    <DialogFooter>
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button onClick={handleConfirm}>
        Confirm
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

## 🌓 Dark Mode System

### Implementation Pattern

#### 1. Theme Context
```tsx
// Always use ThemeContext for admin portal
import { useTheme } from '@/components/layout/ThemeContext';

const Component = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <div className={isDark ? 'bg-[#161616]' : 'bg-white'}>
      {/* Content */}
    </div>
  );
};
```

#### 2. Semantic Class Variables
```tsx
// Define at component top for consistency
const bgClass = isDark ? 'bg-[#0a0a0a]' : 'bg-gray-100';
const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';
const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';
const textClass = isDark ? 'text-white' : 'text-gray-900';
const textMutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
const textTertiaryClass = isDark ? 'text-[#737373]' : 'text-gray-500';
const hoverBgClass = isDark ? 'hover:bg-[#1e1e1e]' : 'hover:bg-gray-50';
```

#### 3. Color Application
```tsx
// Backgrounds
<div className={cardBgClass}> // ✅
<div className={isDark ? 'bg-[#161616]' : 'bg-white'}> // ✅

// Borders
<div className={`border ${borderClass}`}> // ✅

// Text
<h1 className={textClass}>Heading</h1> // ✅
<p className={textMutedClass}>Description</p> // ✅

// Interactive elements
<button className={`${hoverBgClass} ${textClass}`}> // ✅
```

### Dark Mode Color Reference

#### 3-Tier Background System
```
Level 1 (Deepest): #0a0a0a - Main page background
Level 2 (Cards):   #161616 - Card backgrounds, sidebar
Level 3 (Elevated): #1e1e1e - Modals, popovers, dropdowns
```

**Visual Hierarchy:**
- Deeper elements (#0a0a0a) recede
- Elevated elements (#1e1e1e) come forward
- Cards and containers (#161616) sit in between

#### Text Hierarchy
```
Primary:   #ffffff - Headings, important text
Secondary: #a3a3a3 - Body text, labels  
Tertiary:  #737373 - Helper text, placeholders
Disabled:  #525252 - Disabled states
```

#### Interactive States
```tsx
// Hover states
hover:bg-[#1e1e1e]  // On #161616 backgrounds
hover:bg-[#2a2a2a]  // On #1e1e1e backgrounds

// Active states
active:bg-[#2a2a2a]
active:scale-95  // For tactile feedback

// Focus states
focus:ring-2 focus:ring-[#4f46e5] focus:ring-offset-2
focus:ring-offset-[#0a0a0a] // Dark mode offset
```

### Semantic Colors in Dark Mode

```tsx
// Success (Emerald)
const successClass = isDark 
  ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
  : 'text-green-700 bg-green-50 border-green-200';

// Error (Red)  
const errorClass = isDark
  ? 'text-red-400 bg-red-500/10 border-red-500/30'
  : 'text-red-700 bg-red-50 border-red-200';

// Warning (Amber)
const warningClass = isDark
  ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
  : 'text-amber-700 bg-amber-50 border-amber-200';

// Info (Blue)
const infoClass = isDark
  ? 'text-blue-400 bg-blue-500/10 border-blue-500/30'
  : 'text-blue-700 bg-blue-50 border-blue-200';
```

---

## 🎯 Widget Design System

### Widget Theme Context

Widgets use a **separate theme system** from the admin portal:

```tsx
import { useWidgetTheme } from '@/components/widgets/WidgetThemeContext';

const Widget = () => {
  const { widgetTheme } = useWidgetTheme();
  const isDark = widgetTheme === 'dark';
  
  // Widget implementation
};
```

### Widget Color Customization

Widgets support **custom branding colors** that adapt to theme:

```tsx
// Light mode: Use custom primaryColor
// Dark mode: Always use vibrant blue (#4f46e5)

const primaryButtonColor = isDark ? '#4f46e5' : primaryColor;
const primaryTextColor = isDark ? '#6366f1' : primaryColor;
```

### Widget Layout Patterns

#### Full-Height Widget
```tsx
<div className={`flex flex-col h-screen ${bgClass}`}>
  {/* Header */}
  <div className={`${cardBgClass} border-b ${borderClass} p-4`}>
    <WidgetHeader />
  </div>
  
  {/* Scrollable content */}
  <div className="flex-1 overflow-y-auto">
    <WidgetContent />
  </div>
  
  {/* Footer */}
  <div className={`${cardBgClass} border-t ${borderClass} p-4`}>
    <WidgetFooter />
  </div>
</div>
```

#### Widget Card Pattern
```tsx
<div className={`rounded-xl overflow-hidden shadow-lg ${
  isDark ? 'bg-[#161616] border border-[#2a2a2a]' : 'bg-white'
}`}>
  {/* Image/Media */}
  <div className="aspect-video relative">
    <img src={image} className="w-full h-full object-cover" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
  </div>
  
  {/* Content */}
  <div className="p-6">
    <h3 className={textClass}>Card Title</h3>
    <p className={textMutedClass}>Description</p>
  </div>
</div>
```

### Widget Interactive Elements

#### Date Picker (Calendar)
```tsx
// Available dates
<button 
  className={`rounded-lg transition-all ${
    isDark 
      ? 'bg-[#4f46e5] text-white hover:bg-[#4338ca]'
      : 'bg-primary text-white hover:bg-primary/90'
  }`}
>
  {date}
</button>

// Unavailable dates
<button 
  className={`rounded-lg ${
    isDark 
      ? 'bg-[#1e1e1e] text-[#525252] cursor-not-allowed'
      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
  }`}
  disabled
>
  {date}
</button>
```

#### Time Slot Buttons
```tsx
// Selected slot
<button className="border-2 rounded-lg p-4" style={{
  borderColor: isDark ? '#4f46e5' : primaryColor,
  backgroundColor: isDark ? '#4f46e5' + '10' : primaryColor + '10',
  color: isDark ? '#6366f1' : primaryColor
}}>
  <Clock className="w-4 h-4" />
  <span>2:00 PM</span>
</button>

// Available slot
<button className={`border-2 rounded-lg p-4 ${
  isDark 
    ? 'border-[#2a2a2a] hover:border-[#4f46e5] hover:bg-[#4f46e5]/10'
    : 'border-gray-300 hover:border-primary hover:bg-primary/5'
}`}>
  <Clock className="w-4 h-4" />
  <span>3:00 PM</span>
</button>
```

---

## 📱 Responsive Design

### Breakpoints
```css
/* Tailwind default breakpoints */
sm: 640px   /* Small tablets, large phones */
md: 768px   /* Tablets */
lg: 1024px  /* Desktops */
xl: 1280px  /* Large desktops */
2xl: 1536px /* Extra large screens */
```

### Mobile-First Approach

Always design mobile-first, then enhance for larger screens:

```tsx
// ❌ Desktop-first (avoid)
<div className="grid-cols-3 md:grid-cols-2 sm:grid-cols-1">

// ✅ Mobile-first (correct)
<div className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

### Responsive Patterns

#### Navigation
```tsx
{/* Desktop sidebar */}
<Sidebar className="hidden lg:flex w-[280px]" />

{/* Mobile bottom navigation */}
<MobileBottomNav className="lg:hidden" />
```

#### Typography
```tsx
<h1 className="text-2xl md:text-3xl lg:text-4xl">
  Responsive Heading
</h1>

<p className="text-sm md:text-base">
  Responsive body text
</p>
```

#### Spacing
```tsx
<div className="p-4 md:p-6 lg:p-8">
  <div className="space-y-4 md:space-y-6">
    {/* Content with responsive spacing */}
  </div>
</div>
```

#### Grids
```tsx
{/* 1 column mobile, 2 tablet, 3 desktop, 4 large */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>
```

### Touch Targets

Minimum touch target size: **44x44px** (iOS HIG standard)

```tsx
// ✅ Good touch target
<button className="h-12 px-6"> {/* 48px tall */}
  Button
</button>

// ❌ Too small for touch
<button className="h-8 px-2"> {/* 32px tall */}
  Button
</button>
```

### Safe Areas (Mobile)

```tsx
// Bottom navigation with safe area
<nav className="pb-safe"> {/* or use safe-area-inset-bottom */}
  <MobileBottomNav />
</nav>
```

---

## ♿ Accessibility Standards

### WCAG 2.1 Level AA Compliance

#### Color Contrast
- **Normal text**: Minimum 4.5:1 contrast ratio
- **Large text** (18px+): Minimum 3:1 contrast ratio
- **UI components**: Minimum 3:1 contrast ratio

```tsx
// ✅ Good contrast (light mode)
<p className="text-gray-900 bg-white">High contrast text</p>

// ✅ Good contrast (dark mode)
<p className="text-white bg-[#0a0a0a]">High contrast text</p>

// ❌ Poor contrast
<p className="text-gray-400 bg-white">Low contrast text</p>
```

#### Keyboard Navigation

All interactive elements must be keyboard accessible:

```tsx
// ✅ Proper button
<button onClick={handleClick} className="focus:ring-2 focus:ring-[#4f46e5]">
  Click me
</button>

// ❌ Div with onClick (not keyboard accessible)
<div onClick={handleClick}>Click me</div>

// ✅ Div with proper accessibility
<div 
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
  className="focus:ring-2 focus:ring-[#4f46e5]"
>
  Click me
</div>
```

#### Focus Indicators

Always show visible focus indicators:

```tsx
<button className="focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:ring-offset-2">
  Button
</button>

// Dark mode focus
<button className={`focus:outline-none focus:ring-2 focus:ring-[#4f46e5] ${
  isDark ? 'focus:ring-offset-[#0a0a0a]' : 'focus:ring-offset-white'
}`}>
  Button
</button>
```

#### ARIA Labels

Provide descriptive labels for screen readers:

```tsx
<button aria-label="Close dialog">
  <X className="w-4 h-4" />
</button>

<input 
  type="search"
  aria-label="Search bookings"
  placeholder="Search..."
/>

<nav aria-label="Main navigation">
  {/* Navigation items */}
</nav>
```

#### Skip Links

Provide skip-to-content links:

```tsx
<a 
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#4f46e5] focus:text-white"
>
  Skip to main content
</a>
```

#### Form Accessibility

```tsx
<div className="space-y-2">
  <Label htmlFor="email">
    Email <span className="text-red-500" aria-label="required">*</span>
  </Label>
  <Input
    id="email"
    type="email"
    aria-required="true"
    aria-invalid={!!error}
    aria-describedby={error ? "email-error" : undefined}
  />
  {error && (
    <p id="email-error" className="text-sm text-red-500" role="alert">
      {error}
    </p>
  )}
</div>
```

---

## 💻 Code Conventions

### Component Structure

```tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/layout/ThemeContext';

interface ComponentProps {
  title: string;
  onAction: () => void;
  className?: string;
}

export const Component: React.FC<ComponentProps> = ({
  title,
  onAction,
  className
}) => {
  // 1. Hooks
  const { theme } = useTheme();
  const [state, setState] = useState<string>('');
  
  // 2. Derived state
  const isDark = theme === 'dark';
  
  // 3. Semantic variables
  const bgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  
  // 4. Effects
  useEffect(() => {
    // Side effects
  }, []);
  
  // 5. Event handlers
  const handleClick = () => {
    onAction();
  };
  
  // 6. Render
  return (
    <div className={`${bgClass} ${textClass} ${className}`}>
      <h1>{title}</h1>
      <Button onClick={handleClick}>Action</Button>
    </div>
  );
};
```

### Naming Conventions

```tsx
// Components: PascalCase
const UserProfile = () => {};

// Functions/Variables: camelCase
const handleSubmit = () => {};
const userData = {};

// Constants: UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;
const API_BASE_URL = 'https://api.example.com';

// Types/Interfaces: PascalCase
interface UserData {}
type StatusType = 'active' | 'inactive';

// CSS classes: kebab-case (in CSS) or as-is from Tailwind
className="bg-blue-500 hover:bg-blue-600"
```

### File Organization

```
components/
├── ui/              # Shadcn components (lowercase)
│   ├── button.tsx
│   ├── card.tsx
│   └── input.tsx
├── layout/          # Layout components (PascalCase)
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   └── ThemeContext.tsx
├── widgets/         # Widget components (PascalCase)
│   ├── CalendarWidget.tsx
│   └── FareBookWidget.tsx
└── dashboard/       # Feature-specific (PascalCase)
    └── KPICard.tsx
```

### Import Organization

```tsx
// 1. React imports
import React, { useState, useEffect } from 'react';

// 2. Third-party libraries
import { format } from 'date-fns';

// 3. UI components
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// 4. Custom components
import { Header } from '@/components/layout/Header';
import { KPICard } from '@/components/dashboard/KPICard';

// 5. Contexts/Hooks
import { useTheme } from '@/components/layout/ThemeContext';

// 6. Types
import type { UserData } from '@/types';

// 7. Utilities
import { cn } from '@/components/ui/utils';

// 8. Assets
import logo from '@/assets/logo.png';
```

### TypeScript Best Practices

```tsx
// ✅ Explicit prop types
interface ButtonProps {
  variant: 'primary' | 'secondary';
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}

// ✅ Type state properly
const [user, setUser] = useState<UserData | null>(null);

// ✅ Type event handlers
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value);
};

// ✅ Use proper return types
const fetchUser = async (): Promise<UserData> => {
  const response = await fetch('/api/user');
  return response.json();
};
```

---

## 🎯 Quick Reference Checklists

### Adding a New Page Checklist

- [ ] Use AdminLayout wrapper
- [ ] Add PageHeader component
- [ ] Implement dark mode with ThemeContext
- [ ] Define semantic class variables
- [ ] Use proper spacing (container mx-auto px-4 py-6)
- [ ] Make responsive (mobile-first)
- [ ] Add proper TypeScript types
- [ ] Test keyboard navigation
- [ ] Verify color contrast
- [ ] Test dark mode thoroughly

### Creating a Widget Checklist

- [ ] Use WidgetThemeContext for theme
- [ ] Support custom primaryColor prop
- [ ] Override with vibrant blue in dark mode
- [ ] Implement 3-tier background system
- [ ] Make fully responsive
- [ ] Add proper loading states
- [ ] Include error handling
- [ ] Test with different themes
- [ ] Verify touch targets (44px min)
- [ ] Add ARIA labels

### Dark Mode Implementation Checklist

- [ ] Import useTheme hook
- [ ] Define isDark variable
- [ ] Create semantic class variables
- [ ] Apply to all backgrounds
- [ ] Apply to all text elements
- [ ] Apply to all borders
- [ ] Update interactive states
- [ ] Test semantic colors (success, error, etc.)
- [ ] Verify focus indicators
- [ ] Test all component states

---

## 📚 Additional Resources

### Internal Documentation
- `/guidelines/Guidelines.md` - General development guidelines
- `/DARK_MODE_COLOR_GUIDE.md` - Detailed dark mode reference
- `/DASHBOARD_DESIGN_GUIDE.md` - Admin portal specifics
- `/components/widgets/WidgetEnhancements.md` - Widget improvements

### Design Inspiration
- **Shopify Admin**: Clean layouts, efficient workflows
- **Stripe Dashboard**: Data visualization, clear hierarchy
- **Linear**: Modern aesthetics, dark mode excellence
- **Vercel**: Minimalist approach, excellent typography

### Color Tools
- [Coolors](https://coolors.co/) - Color palette generator
- [Contrast Checker](https://webaim.org/resources/contrastchecker/) - WCAG compliance
- [Tailwind Color Generator](https://tailwind.simeongriggs.dev/) - Custom color scales

---

## 🔄 Version History

### Version 2.0 (November 2, 2025)
- Complete design system overhaul
- Vibrant blue (#4f46e5) as primary brand color
- Comprehensive dark mode guidelines
- Widget-specific design patterns
- Accessibility standards added
- Code conventions documented

### Version 1.0 (Initial)
- Basic color palette
- Typography guidelines
- Component patterns

---

## 📝 Notes for AI Development Agents

### Critical Rules

1. **NEVER override typography** unless explicitly requested
2. **ALWAYS use semantic class variables** for dark mode
3. **ALWAYS use #4f46e5 vibrant blue** for primary actions in dark mode
4. **ALWAYS implement 3-tier backgrounds** in dark mode (#0a0a0a → #161616 → #1e1e1e)
5. **ALWAYS maintain 4.5:1 contrast ratio** for text
6. **ALWAYS make components responsive** (mobile-first)
7. **ALWAYS add proper ARIA labels** for accessibility
8. **ALWAYS test dark mode** for every component

### When in Doubt

- Refer to existing components for patterns
- Check DARK_MODE_COLOR_GUIDE.md for color specifics
- Use vibrant blue (#4f46e5) for primary actions
- Follow the 3-tier background hierarchy
- Prioritize accessibility and responsiveness

---

**Last Updated**: November 2, 2025  
**Maintained By**: BookingTMS Development Team  
**Questions?** Create an issue or consult existing documentation
