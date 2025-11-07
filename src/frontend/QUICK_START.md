# Frontend Quick Start

**Fast onboarding guide for the BookingTMS frontend**

---

## 🎯 5-Minute Overview

### What is This?
The `/frontend` folder contains all **client-side code** that runs in the browser:
- React components
- UI/UX logic
- API client services
- State management
- Styling

### Key Technologies
- **React 18+** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Shadcn/UI** - Component library

---

## 📁 Folder Structure

```
/frontend/src/
├── pages/          # 17 admin pages (Dashboard, Bookings, etc.)
├── components/     # 100+ UI components
│   ├── ui/         # Base components (Button, Input, Card)
│   ├── layout/     # Layout (AdminLayout, Sidebar, Header)
│   ├── dashboard/  # Dashboard components
│   └── ...         # Feature-specific components
├── hooks/          # Custom React hooks (useAuth, useTheme)
├── contexts/       # Global state (Auth, Theme, Notifications)
├── services/       # API clients (bookings, customers, games)
├── constants/      # App constants (routes, colors, permissions)
├── types/          # TypeScript types
├── lib/            # Utilities
└── styles/         # Global CSS
```

---

## 🚀 Quick Examples

### 1. Create a Page

```typescript
// frontend/src/pages/MyPage.tsx
'use client';

import { AdminLayout } from '@/components/layout/AdminLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useTheme } from '@/hooks/useTheme';

export default function MyPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <AdminLayout>
      <PageHeader title="My Page" subtitle="Page description" />
      
      <div className={isDark ? 'bg-[#161616]' : 'bg-white'}>
        Content here
      </div>
    </AdminLayout>
  );
}
```

### 2. Create a Component

```typescript
// frontend/src/components/MyComponent.tsx
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';

interface Props {
  title: string;
  onClick: () => void;
}

export function MyComponent({ title, onClick }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Explicit styling (always override defaults)
  const cardClass = isDark 
    ? 'bg-[#161616] border border-gray-800' 
    : 'bg-white border border-gray-200';
  
  return (
    <div className={`${cardClass} p-6 rounded-lg`}>
      <h3 className={isDark ? 'text-white' : 'text-gray-900'}>
        {title}
      </h3>
      <Button onClick={onClick}>Click Me</Button>
    </div>
  );
}
```

### 3. Create a Hook

```typescript
// frontend/src/hooks/useMyHook.ts
import { useState, useEffect } from 'react';
import { myService } from '@/services/api/myService';

export function useMyHook() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await myService.getAll();
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refresh: loadData };
}
```

### 4. Create an API Service

```typescript
// frontend/src/services/api/myService.ts
import { apiClient } from './base';
import type { MyData } from '@/types';

export const myService = {
  async getAll(): Promise<MyData[]> {
    return apiClient.get<MyData[]>('/my-endpoint');
  },

  async create(data: MyData): Promise<MyData> {
    return apiClient.post<MyData>('/my-endpoint', data);
  },

  async update(id: string, data: Partial<MyData>): Promise<MyData> {
    return apiClient.put<MyData>(`/my-endpoint/${id}`, data);
  },
};
```

---

## 🎨 Design System Cheat Sheet

### Light Mode Colors

```typescript
// Inputs
className="h-12 bg-gray-100 border-gray-300 placeholder:text-gray-500"

// Cards
className="bg-white border border-gray-200 shadow-sm rounded-lg"

// Labels
className="text-gray-700"

// Secondary Text
className="text-gray-600"

// Primary Button
className="bg-[#4f46e5] hover:bg-[#4338ca] text-white"
```

### Dark Mode Colors

```typescript
// 3-Tier Backgrounds
const bgMain = 'bg-[#0a0a0a]';      // Deepest (page background)
const bgCard = 'bg-[#161616]';       // Mid (cards, containers)
const bgElevated = 'bg-[#1e1e1e]';   // Lightest (modals, dropdowns)

// Primary Button
className="bg-[#4f46e5] hover:bg-[#6366f1] text-white"

// Text
className="text-white"              // Primary
className="text-gray-400"           // Secondary
```

### Responsive Breakpoints

```typescript
// Mobile first (✅ Correct)
className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"

// Breakpoint values
xs: 375px   // Mobile
sm: 640px   // Large mobile
md: 768px   // Tablet
lg: 1024px  // Desktop
xl: 1280px  // Large desktop
```

---

## ✅ Component Checklist

When creating a component:

### Design
- [ ] Supports dark mode (use `useTheme()`)
- [ ] Responsive design (mobile-first)
- [ ] Explicit styling (override base component defaults)
- [ ] Uses semantic colors from design system

### Code Quality
- [ ] TypeScript interfaces for props
- [ ] Proper imports (`@/` path aliases)
- [ ] Meaningful variable names
- [ ] Comments for complex logic

### Accessibility
- [ ] ARIA labels on interactive elements
- [ ] Keyboard navigation support
- [ ] Focus indicators visible
- [ ] Touch targets ≥ 44x44px
- [ ] Color contrast ≥ 4.5:1

### Testing
- [ ] Tested in light mode
- [ ] Tested in dark mode
- [ ] Tested at 375px, 768px, 1024px
- [ ] Tested keyboard navigation

---

## 🔧 Common Patterns

### Pattern 1: Fetch Data on Mount

```typescript
function MyComponent() {
  const { data, loading, error } = useMyHook();

  if (loading) return <Skeleton />;
  if (error) return <ErrorMessage error={error} />;

  return <div>{/* Render data */}</div>;
}
```

### Pattern 2: Form with Validation

```typescript
function MyForm() {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Submit
    try {
      await myService.create(formData);
      toast.success('Created successfully!');
    } catch (error) {
      toast.error('Failed to create');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

### Pattern 3: Conditional Rendering with Permissions

```typescript
import { useAuth } from '@/hooks/useAuth';
import { PermissionGuard } from '@/components/auth/PermissionGuard';

function MyComponent() {
  const { hasPermission } = useAuth();

  return (
    <div>
      {/* All users see this */}
      <ViewButton />

      {/* Only users with 'bookings.edit' see this */}
      <PermissionGuard permissions={['bookings.edit']}>
        <EditButton />
      </PermissionGuard>

      {/* Inline check */}
      {hasPermission('bookings.delete') && <DeleteButton />}
    </div>
  );
}
```

### Pattern 4: Dark Mode Support

```typescript
function MyComponent() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Define semantic variables
  const bgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const borderClass = isDark ? 'border-gray-800' : 'border-gray-200';

  return (
    <div className={`${bgClass} ${textClass} ${borderClass} border p-4 rounded-lg`}>
      Content
    </div>
  );
}
```

---

## 🐛 Troubleshooting

### Issue: "Module not found"
**Solution**: Check path alias in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["frontend/src/*"],
      "@/components/*": ["frontend/src/components/*"],
      "@/hooks/*": ["frontend/src/hooks/*"]
    }
  }
}
```

### Issue: Dark mode not working
**Solution**: 
1. Check `ThemeContext` is imported
2. Verify component is wrapped in `ThemeProvider`
3. Ensure `isDark` variable is used

### Issue: Styles not applying
**Solution**:
1. **Explicitly override** base component styles
2. Check Tailwind class names are correct
3. Verify dark mode classes

### Issue: Component not rendering
**Solution**:
1. Check component is exported properly
2. Verify import path is correct
3. Check for TypeScript errors

---

## 📚 Documentation

### Full Guides
- **README**: `/frontend/README.md` - Complete overview
- **Architecture**: `/frontend/ARCHITECTURE.md` - Architecture patterns
- **Migration**: `/frontend/MIGRATION_GUIDE.md` - Migration guide

### Design System
- **Guidelines**: `/guidelines/Guidelines.md` - Main guidelines
- **Design System**: `/guidelines/DESIGN_SYSTEM.md` - Complete design system
- **Components**: `/guidelines/COMPONENT_LIBRARY.md` - Component reference

### Backend Integration
- **Backend API**: `/backend/README.md` - Backend documentation
- **API Reference**: `/backend/QUICK_REFERENCE.md` - Code snippets

---

## 🎯 Next Steps

### For New Developers
1. Read this Quick Start (you're here!)
2. Review `/frontend/ARCHITECTURE.md`
3. Study existing components in `/components`
4. Build a simple page following patterns

### For Migrating Code
1. Read `/frontend/MIGRATION_GUIDE.md`
2. Follow phase-by-phase migration
3. Update imports to use `@/` aliases
4. Test thoroughly after each phase

### For Building Features
1. Design component structure
2. Create TypeScript types
3. Build API service (if needed)
4. Create custom hook (if needed)
5. Build components
6. Write tests

---

## ⚡ Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint

# Type check
npm run type-check
```

---

## 🔗 Import Cheat Sheet

```typescript
// Pages
import Dashboard from '@/pages/Dashboard';

// Components
import { Button } from '@/components/ui/button';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { KPICard } from '@/components/dashboard/KPICard';

// Hooks
import { useAuth, useTheme, useNotifications } from '@/hooks';

// Contexts (use hooks instead)
import { useAuth } from '@/hooks/useAuth';

// Services
import { bookingService } from '@/services/api/bookings';

// Constants
import { ROUTES, PERMISSIONS } from '@/constants';

// Types
import type { Booking, Customer } from '@/types';

// Utilities
import { cn, formatCurrency } from '@/lib/utils';
```

---

## ✨ Pro Tips

1. **Always use path aliases** (`@/`) instead of relative paths
2. **Explicitly override styles** - Don't rely on component defaults
3. **Dark mode first** - Always implement dark mode support
4. **Mobile first** - Design for mobile, enhance for desktop
5. **Type everything** - Use TypeScript for all props and data
6. **Reuse hooks** - Don't fetch data directly in components
7. **Extract constants** - No magic strings or numbers
8. **Test both themes** - Always test light and dark mode

---

**Ready to code!** Start with a simple component and build from there.

**Last Updated**: November 4, 2025  
**Maintained By**: BookingTMS Frontend Team
