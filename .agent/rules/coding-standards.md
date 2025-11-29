# Enterprise Coding Standards

> Based on: Google, Airbnb, Meta, Microsoft, Clean Code principles
> Version: v1.0
> Date: 2025-11-30

## File Size Guidelines

| Component Type | Max Lines | Example |
|----------------|-----------|---------|
| Atoms (buttons, inputs) | 50 | `Button.tsx`, `Input.tsx` |
| Molecules (form fields, cards) | 100 | `FormField.tsx`, `StatCard.tsx` |
| Organisms (complex UI blocks) | 150 | `OrganizationCard.tsx` |
| Templates (page layouts) | 200 | `DashboardLayout.tsx` |
| Pages (feature pages) | 200-250 | `Organizations.tsx` |
| Hooks | 100 | `useBookingFlow.ts` |
| Services | 150 | `booking.service.ts` |
| Utilities | 100 | `formatters.ts` |

## Function Guidelines

| Type | Max Lines | Max Parameters |
|------|-----------|----------------|
| Component function | 30 | 5 props |
| Helper function | 20 | 4 |
| Hook | 50 | 3 options |
| Service method | 30 | 5 |

## Naming Conventions

```typescript
// Components: PascalCase
function UserProfileCard() {}

// Hooks: camelCase with use prefix
function useBookingState() {}

// Services: camelCase with Service suffix
class BookingService {}

// Types: PascalCase
interface UserProfile {}
type BookingStatus = 'pending' | 'confirmed';

// Constants: SCREAMING_SNAKE_CASE
const MAX_RETRIES = 3;

// Event handlers: handle prefix
const handleSubmit = () => {};
const handleClick = () => {};

// Boolean props: is/has/can/should prefix
interface Props {
  isLoading: boolean;
  hasError: boolean;
  canEdit: boolean;
}
```

## File Organization

```
// GOOD: Feature-based
src/features/organizations/
├── components/
│   ├── OrganizationCard.tsx
│   └── index.ts
├── hooks/
│   └── useOrganizations.ts
├── services/
│   └── organization.service.ts
├── types/
│   └── organization.types.ts
└── ARCHITECTURE.md

// BAD: Type-based
src/
├── components/
│   └── OrganizationCard.tsx
├── hooks/
│   └── useOrganizations.ts
└── services/
    └── organization.service.ts
```

## Component Structure

```tsx
/**
 * ComponentName
 * 
 * Brief description of what this component does.
 * 
 * @example
 * <ComponentName prop1="value" onAction={handler} />
 */

// 1. Imports (grouped)
import React from 'react';                    // React
import { Button } from '@/components/ui';      // Internal UI
import { useAuth } from '@/lib/auth';          // Hooks
import type { User } from '@/types';           // Types

// 2. Types (if not in separate file)
interface ComponentNameProps {
  user: User;
  onSave: (user: User) => void;
}

// 3. Component
export function ComponentName({ user, onSave }: ComponentNameProps) {
  // 3.1 Hooks first
  const { isAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // 3.2 Derived state
  const canEdit = isAdmin && !isLoading;

  // 3.3 Handlers
  const handleSubmit = () => {
    setIsLoading(true);
    onSave(user);
  };

  // 3.4 Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

## Documentation Standards

```tsx
/**
 * Brief one-line description.
 * 
 * Longer description if needed explaining:
 * - What the component/function does
 * - When to use it
 * - Any important notes
 * 
 * @param props - Component props
 * @returns React component
 * 
 * @example
 * // Basic usage
 * <MyComponent title="Hello" />
 * 
 * // With optional props
 * <MyComponent title="Hello" onClose={handleClose} />
 */
```

## Import Order

```tsx
// 1. React
import React, { useState, useEffect } from 'react';

// 2. Third-party libraries
import { motion } from 'framer-motion';
import { toast } from 'sonner';

// 3. Internal absolute imports (@/)
import { Button, Card } from '@/components/ui';
import { useAuth } from '@/lib/auth';

// 4. Relative imports (../, ./)
import { StatusBadge } from './StatusBadge';
import type { User } from '../types';
```

## Error Handling

```tsx
// Services: Return Result type
interface Result<T> {
  data?: T;
  error?: Error;
}

async function fetchUser(id: string): Promise<Result<User>> {
  try {
    const user = await api.get(`/users/${id}`);
    return { data: user };
  } catch (error) {
    return { error: error as Error };
  }
}

// Components: Error boundaries + toast
function MyComponent() {
  const { data, error } = useSWR('/api/data');
  
  if (error) {
    toast.error('Failed to load data');
    return <ErrorState error={error} />;
  }
}
```

## State Management

```tsx
// Local state: useState for simple, useReducer for complex
const [count, setCount] = useState(0);

// Form state: React Hook Form
const { register, handleSubmit } = useForm<FormData>();

// Server state: React Query / SWR
const { data, isLoading } = useQuery(['users'], fetchUsers);

// Global state: Context (avoid Redux unless truly needed)
const { user, logout } = useAuth();
```

## Testing Requirements

| Type | Coverage Target |
|------|-----------------|
| Unit tests (services) | 80% |
| Component tests | 70% |
| Integration tests | 60% |
| E2E tests | Critical paths |

## Performance Guidelines

1. **Memoization**: Use `useMemo`/`useCallback` for expensive operations
2. **Lazy loading**: Code-split routes and large components
3. **Image optimization**: Use Next.js Image or similar
4. **Bundle size**: Keep individual chunks < 100KB

## Accessibility (a11y)

1. All interactive elements must be keyboard accessible
2. Use semantic HTML (`<button>`, not `<div onClick>`)
3. ARIA labels for icons and non-text content
4. Color contrast ratio ≥ 4.5:1
5. Focus states must be visible

## Git Commit Format

```
<type>(<scope>): <description>

Types:
- feat: New feature
- fix: Bug fix
- refactor: Code change (no feature/fix)
- docs: Documentation
- test: Tests
- chore: Build/config changes

Examples:
feat(bookings): add bulk cancel feature
fix(auth): resolve token refresh race condition
refactor(organizations): modularize components
```
