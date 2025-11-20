# React Contexts

This folder contains all React Context providers for global state management.

## 📁 Structure

```
/contexts
├── README.md               # This file
├── index.ts                # Export all contexts
├── AuthContext.tsx         # Authentication state
├── ThemeContext.tsx        # Theme (light/dark)
├── NotificationContext.tsx # Notifications
├── WidgetThemeContext.tsx  # Widget theme
├── WidgetConfigContext.tsx # Widget configuration
└── ModalContext.tsx        # Modal management
```

## 🎯 Purpose

Centralize all React Context providers that were previously scattered in:
- `/lib/auth/AuthContext.tsx`
- `/lib/notifications/NotificationContext.tsx`
- `/components/layout/ThemeContext.tsx`
- `/components/widgets/WidgetThemeContext.tsx`
- `/components/widgets/WidgetConfigContext.tsx`

## 📖 Usage Example

```typescript
import { useAuth, useTheme, useNotifications } from '@/contexts';

function MyComponent() {
  const { currentUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { notifications, markAsRead } = useNotifications();

  return (
    <div>
      <p>User: {currentUser.name}</p>
      <p>Theme: {theme}</p>
      <p>Unread: {notifications.filter(n => !n.read).length}</p>
    </div>
  );
}
```

## 🏗️ Context Template

```typescript
import React, { createContext, useContext, useState, ReactNode } from 'react';

// 1. Define types
interface MyContextValue {
  value: string;
  setValue: (value: string) => void;
}

interface MyProviderProps {
  children: ReactNode;
}

// 2. Create context
const MyContext = createContext<MyContextValue | undefined>(undefined);

// 3. Create provider
export function MyProvider({ children }: MyProviderProps) {
  const [value, setValue] = useState('');

  return (
    <MyContext.Provider value={{ value, setValue }}>
      {children}
    </MyContext.Provider>
  );
}

// 4. Create hook
export function useMyContext() {
  const context = useContext(MyContext);
  if (!context) {
    throw new Error('useMyContext must be used within MyProvider');
  }
  return context;
}
```

## 🚀 Migration Steps

### 1. Move AuthContext
```bash
# From: /lib/auth/AuthContext.tsx
# To:   /contexts/AuthContext.tsx
```

### 2. Move ThemeContext
```bash
# From: /components/layout/ThemeContext.tsx
# To:   /contexts/ThemeContext.tsx
```

### 3. Move NotificationContext
```bash
# From: /lib/notifications/NotificationContext.tsx
# To:   /contexts/NotificationContext.tsx
```

### 4. Move Widget Contexts
```bash
# From: /components/widgets/WidgetThemeContext.tsx
# To:   /contexts/WidgetThemeContext.tsx

# From: /components/widgets/WidgetConfigContext.tsx
# To:   /contexts/WidgetConfigContext.tsx
```

### 5. Update Imports
```typescript
// Old
import { useAuth } from '@/lib/auth/AuthContext';
import { useTheme } from '@/components/layout/ThemeContext';

// New
import { useAuth, useTheme } from '@/contexts';
```

## 📦 Composing Providers

Create a root provider to compose all contexts:

```typescript
// contexts/AppProvider.tsx
import { AuthProvider } from './AuthContext';
import { ThemeProvider } from './ThemeContext';
import { NotificationProvider } from './NotificationContext';

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
```

Then use in `App.tsx`:
```typescript
import { AppProvider } from '@/contexts/AppProvider';

function App() {
  return (
    <AppProvider>
      <YourApp />
    </AppProvider>
  );
}
```

## ✅ Best Practices

1. **Single Responsibility**: Each context should manage one concern
2. **Type Safety**: Always use TypeScript
3. **Error Handling**: Throw error if used outside provider
4. **Performance**: Use React.memo and useMemo for expensive operations
5. **Testing**: Mock contexts in tests
6. **Documentation**: Add JSDoc comments

---

**Status**: To be migrated from existing locations
