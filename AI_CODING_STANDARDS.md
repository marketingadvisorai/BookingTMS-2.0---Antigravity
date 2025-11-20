# AI Coding Agent Standards for Booking TMS

**Purpose:** Make codebase easily understandable for AI coding agents (ChatGPT, Claude, Codex, Gemini, etc.)  
**Date:** November 17, 2025  
**Version:** 1.0.0

---

## 🎯 Core Principles

### **1. Self-Documenting Code**
Every component, function, and file should be immediately understandable without external context.

### **2. Consistent Patterns**
Use the same patterns across the entire codebase for similar functionality.

### **3. Clear Naming**
Names should describe what something does, not how it does it.

### **4. Explicit Over Implicit**
Always prefer explicit code over clever shortcuts.

---

## 📁 File Organization Standards

### **Directory Structure**
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (shadcn/ui)
│   ├── layout/         # Layout components (Header, Sidebar, etc.)
│   ├── dashboard/      # Dashboard-specific components
│   └── systemadmin/    # System admin components
├── pages/              # Page-level components (routes)
├── features/           # Feature modules (domain-driven)
│   └── system-admin/   # System admin feature
│       ├── components/ # Feature-specific components
│       ├── hooks/      # Feature-specific hooks
│       └── services/   # Feature-specific services
├── services/           # Global API services
├── hooks/              # Global custom hooks
├── lib/                # Utility libraries
└── types/              # TypeScript type definitions
```

### **File Naming Conventions**
- **Components:** `PascalCase.tsx` (e.g., `UserAccountStripeConnect.tsx`)
- **Hooks:** `camelCase.ts` with `use` prefix (e.g., `useOrganizations.ts`)
- **Services:** `PascalCase.ts` with `Service` suffix (e.g., `OrganizationService.ts`)
- **Types:** `PascalCase.ts` or `types.ts`
- **Utils:** `camelCase.ts` (e.g., `formatCurrency.ts`)
- **Pages:** `PascalCase.tsx` (e.g., `SystemAdminDashboard.tsx`)

---

## 🧩 Component Standards

### **Component Structure Template**
```typescript
/**
 * ComponentName - Brief description
 * 
 * @purpose What this component does
 * @usage Where and how to use this component
 * @example
 * <ComponentName 
 *   prop1="value1"
 *   prop2={value2}
 * />
 */

// 1. IMPORTS - Organized by category
import { useState, useEffect } from 'react';           // React
import { Card, CardContent } from '@/components/ui';   // UI Components
import { useTheme } from '@/components/layout';        // Hooks
import { apiService } from '@/services';               // Services
import type { ComponentProps } from './types';         // Types

// 2. TYPES & INTERFACES - Define all props and state types
interface ComponentNameProps {
  /** Description of prop1 */
  prop1: string;
  /** Description of prop2 - optional */
  prop2?: number;
  /** Callback when action occurs */
  onAction?: (data: ActionData) => void;
}

// 3. CONSTANTS - Component-level constants
const DEFAULT_VALUE = 10;
const MAX_ITEMS = 100;

// 4. COMPONENT - Main component function
export const ComponentName: React.FC<ComponentNameProps> = ({
  prop1,
  prop2 = DEFAULT_VALUE,
  onAction,
}) => {
  // 4.1 HOOKS - All hooks at the top
  const { theme } = useTheme();
  const [state, setState] = useState<StateType>(initialState);
  
  // 4.2 COMPUTED VALUES - Derived state and memoized values
  const isDark = theme === 'dark';
  const computedValue = useMemo(() => calculate(state), [state]);
  
  // 4.3 EFFECTS - Side effects
  useEffect(() => {
    // Effect logic
    return () => {
      // Cleanup
    };
  }, [dependencies]);
  
  // 4.4 HANDLERS - Event handlers
  const handleClick = () => {
    // Handler logic
    onAction?.(data);
  };
  
  // 4.5 RENDER HELPERS - Complex render logic
  const renderItem = (item: Item) => (
    <div key={item.id}>{item.name}</div>
  );
  
  // 4.6 RENDER - JSX return
  return (
    <div className="component-container">
      {/* Main content */}
    </div>
  );
};

// 5. EXPORTS - Named exports for testing
export type { ComponentNameProps };
```

---

## 🎨 Design System Standards

### **Typography Hierarchy**
Based on PaymentsSubscriptionsSection design:

```typescript
// Theme-aware text classes
const textClass = isDark ? 'text-white' : 'text-gray-900';
const mutedTextClass = isDark ? 'text-gray-400' : 'text-gray-600';
const borderColor = isDark ? 'border-[#333]' : 'border-gray-200';
const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';
const secondaryBgClass = isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50';

// Typography sizes
const headingClass = 'text-lg font-medium';           // Section headings
const titleClass = 'text-lg';                         // Card titles
const labelClass = 'text-sm font-medium';             // Labels
const bodyClass = 'text-sm';                          // Body text
const captionClass = 'text-xs';                       // Captions
const uppercaseClass = 'text-xs uppercase tracking-wide'; // Labels
```

### **Payment Section Design Pattern**
```tsx
{/* Section Container */}
<div className={`border-b-2 ${borderColor} pb-6 mb-6`}>
  {/* Section Header */}
  <div className="flex items-center justify-between mb-4">
    <div>
      <h2 className={`text-lg font-medium ${textClass}`}>
        Section Title
      </h2>
      <p className={`text-sm mt-1 ${mutedTextClass}`}>
        Section description
      </p>
    </div>
  </div>

  {/* Content Cards */}
  <Card className={`${cardBgClass} border ${borderColor}`}>
    <CardHeader>
      <CardTitle className={`text-lg ${textClass}`}>
        Card Title
      </CardTitle>
      <p className={`text-sm mt-1 ${mutedTextClass}`}>
        Card description
      </p>
    </CardHeader>
    <CardContent>
      {/* Info Box */}
      <div className={`p-4 rounded-lg border ${borderColor} ${secondaryBgClass}`}>
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-emerald-500" />
          <span className={`text-sm font-medium ${textClass}`}>
            Status Label
          </span>
        </div>
        <p className={`text-xs mt-1 ${mutedTextClass}`}>
          Status description
        </p>
      </div>

      {/* Data Grid */}
      <dl className={`mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm ${textClass}`}>
        <div>
          <dt className={`text-xs uppercase ${mutedTextClass}`}>
            Label
          </dt>
          <dd className="font-semibold">Value</dd>
        </div>
      </dl>
    </CardContent>
  </Card>
</div>
```

---

## 💬 Comment Standards

### **File Header Comments**
```typescript
/**
 * @file ComponentName.tsx
 * @description Brief description of file purpose
 * @module features/system-admin
 * @category components
 * 
 * @example
 * import { ComponentName } from './ComponentName';
 * 
 * <ComponentName prop="value" />
 */
```

### **Function Comments**
```typescript
/**
 * Fetches user data from the API
 * 
 * @param userId - The unique identifier for the user
 * @param options - Optional fetch configuration
 * @returns Promise resolving to user data
 * @throws {ApiError} When the API request fails
 * 
 * @example
 * const user = await fetchUser('user-123');
 */
async function fetchUser(
  userId: string,
  options?: FetchOptions
): Promise<User> {
  // Implementation
}
```

### **Complex Logic Comments**
```typescript
// STEP 1: Validate input data
if (!userId) {
  throw new Error('User ID is required');
}

// STEP 2: Fetch from cache if available
const cached = cache.get(userId);
if (cached && !options?.forceRefresh) {
  return cached;
}

// STEP 3: Fetch from API
const response = await api.get(`/users/${userId}`);

// STEP 4: Update cache and return
cache.set(userId, response.data);
return response.data;
```

### **TODO Comments**
```typescript
// TODO: Add error boundary for this component
// FIXME: Memory leak in useEffect cleanup
// HACK: Temporary workaround for API bug - remove after v2.0
// NOTE: This pattern is required by Stripe API
// OPTIMIZE: Consider memoizing this calculation
```

---

## 🔧 Service Layer Standards

### **Service Class Template**
```typescript
/**
 * OrganizationService - Handles all organization-related API calls
 * 
 * @purpose Centralize organization data management
 * @usage Import and use methods to interact with organization API
 */
export class OrganizationService {
  private baseUrl = '/api/organizations';

  /**
   * Fetches all organizations
   * 
   * @returns Promise<Organization[]> Array of organizations
   * @throws {ApiError} When API request fails
   */
  async getAll(): Promise<Organization[]> {
    try {
      const response = await fetch(this.baseUrl);
      if (!response.ok) {
        throw new ApiError('Failed to fetch organizations');
      }
      return response.json();
    } catch (error) {
      console.error('[OrganizationService.getAll]', error);
      throw error;
    }
  }

  /**
   * Fetches a single organization by ID
   * 
   * @param id - Organization ID
   * @returns Promise<Organization> Organization data
   */
  async getById(id: string): Promise<Organization> {
    // Implementation
  }

  /**
   * Creates a new organization
   * 
   * @param data - Organization creation data
   * @returns Promise<Organization> Created organization
   */
  async create(data: CreateOrganizationDto): Promise<Organization> {
    // Implementation
  }
}

// Export singleton instance
export const organizationService = new OrganizationService();
```

---

## 🪝 Custom Hook Standards

### **Hook Template**
```typescript
/**
 * useOrganizations - Manages organization data with React Query
 * 
 * @purpose Provide organizations data with loading/error states
 * @returns Object with organizations, loading, error, and mutations
 * 
 * @example
 * const { organizations, isLoading, createOrganization } = useOrganizations();
 */
export function useOrganizations() {
  // Query for fetching data
  const {
    data: organizations,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => organizationService.getAll(),
    retry: false, // Don't retry on error
    onError: (error) => {
      console.warn('[useOrganizations] Fetch failed:', error);
    },
  });

  // Mutation for creating
  const createMutation = useMutation({
    mutationFn: (data: CreateOrganizationDto) => 
      organizationService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['organizations']);
      toast.success('Organization created');
    },
    onError: (error) => {
      toast.error('Failed to create organization');
    },
  });

  return {
    // Data
    organizations: organizations ?? [],
    isLoading,
    error,
    
    // Actions
    refetch,
    createOrganization: createMutation.mutate,
    isCreating: createMutation.isLoading,
  };
}
```

---

## 📝 TypeScript Standards

### **Type Definitions**
```typescript
/**
 * User account data structure
 */
export interface User {
  /** Unique identifier */
  id: string;
  /** User's email address */
  email: string;
  /** User's display name */
  name: string;
  /** Account creation timestamp */
  createdAt: Date;
  /** Optional organization ID */
  organizationId?: string;
}

/**
 * Data required to create a new user
 */
export interface CreateUserDto {
  email: string;
  name: string;
  password: string;
  organizationId?: string;
}

/**
 * User update data (all fields optional)
 */
export type UpdateUserDto = Partial<Omit<User, 'id' | 'createdAt'>>;
```

### **Enum Standards**
```typescript
/**
 * User account status
 */
export enum UserStatus {
  /** Account is active and can be used */
  ACTIVE = 'active',
  /** Account is temporarily suspended */
  SUSPENDED = 'suspended',
  /** Account is pending verification */
  PENDING = 'pending',
  /** Account has been deleted */
  DELETED = 'deleted',
}
```

---

## 🎯 Error Handling Standards

### **Try-Catch Pattern**
```typescript
async function fetchData() {
  try {
    // STEP 1: Validate inputs
    if (!userId) {
      throw new ValidationError('User ID is required');
    }

    // STEP 2: Perform operation
    const data = await api.get(`/users/${userId}`);

    // STEP 3: Validate response
    if (!data) {
      throw new ApiError('No data returned');
    }

    // STEP 4: Return success
    return data;

  } catch (error) {
    // Log error with context
    console.error('[fetchData] Error:', {
      userId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Show user-friendly message
    toast.error('Failed to load data', {
      description: 'Please try again or contact support',
    });

    // Re-throw or return fallback
    throw error;
  }
}
```

### **Error Logging Pattern**
```typescript
// Service-level logging
console.error('[ServiceName.methodName]', error);

// Component-level logging
console.warn('[ComponentName] Operation failed:', error);

// Hook-level logging
console.warn('[useHookName] Query failed:', error);
```

---

## 🔄 State Management Standards

### **Local State**
```typescript
// Simple state
const [isOpen, setIsOpen] = useState(false);

// Complex state with type
const [user, setUser] = useState<User | null>(null);

// State with default value
const [count, setCount] = useState(() => {
  const saved = localStorage.getItem('count');
  return saved ? parseInt(saved) : 0;
});
```

### **Derived State**
```typescript
// Use useMemo for expensive calculations
const filteredItems = useMemo(() => {
  return items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
}, [items, searchQuery]);

// Simple derived state (no memo needed)
const isDark = theme === 'dark';
const hasItems = items.length > 0;
```

---

## 🎨 Styling Standards

### **Tailwind Class Organization**
```tsx
<div 
  className={`
    // Layout
    flex items-center justify-between
    // Spacing
    p-4 gap-4
    // Sizing
    w-full h-auto
    // Colors & Borders
    bg-white border border-gray-200
    // Typography
    text-sm font-medium text-gray-900
    // Effects
    rounded-lg shadow-sm
    // Responsive
    md:flex-row md:p-6
    // Dark mode
    dark:bg-gray-800 dark:border-gray-700
    // States
    hover:bg-gray-50 focus:ring-2
  `}
>
```

### **Dynamic Classes**
```typescript
// Use template literals for dynamic classes
const buttonClass = `
  px-4 py-2 rounded-lg
  ${variant === 'primary' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-900'}
  ${size === 'large' ? 'text-lg' : 'text-sm'}
  ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}
`;

// Or use clsx/cn utility
import { cn } from '@/lib/utils';

const buttonClass = cn(
  'px-4 py-2 rounded-lg',
  variant === 'primary' && 'bg-blue-500 text-white',
  variant === 'secondary' && 'bg-gray-200 text-gray-900',
  size === 'large' && 'text-lg',
  disabled && 'opacity-50 cursor-not-allowed'
);
```

---

## 📚 Documentation Standards

### **README for Features**
```markdown
# Feature Name

## Purpose
Brief description of what this feature does.

## Components
- `ComponentA` - Description
- `ComponentB` - Description

## Usage
\`\`\`tsx
import { FeatureComponent } from './features/feature-name';

<FeatureComponent prop="value" />
\`\`\`

## API
- `GET /api/feature` - Description
- `POST /api/feature` - Description

## Dependencies
- React Query
- Supabase
- Stripe

## Testing
\`\`\`bash
npm test features/feature-name
\`\`\`
```

---

## 🧪 Testing Standards

### **Component Test Template**
```typescript
/**
 * Tests for ComponentName
 */
describe('ComponentName', () => {
  // Setup
  beforeEach(() => {
    // Reset state
  });

  // Test rendering
  it('should render correctly', () => {
    render(<ComponentName prop="value" />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  // Test interactions
  it('should handle click events', () => {
    const handleClick = jest.fn();
    render(<ComponentName onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  // Test edge cases
  it('should handle empty data', () => {
    render(<ComponentName data={[]} />);
    expect(screen.getByText('No data')).toBeInTheDocument();
  });
});
```

---

## 🚀 Performance Standards

### **Optimization Checklist**
- [ ] Use `React.memo()` for expensive components
- [ ] Use `useMemo()` for expensive calculations
- [ ] Use `useCallback()` for callback props
- [ ] Lazy load routes with `React.lazy()`
- [ ] Virtualize long lists
- [ ] Debounce search inputs
- [ ] Optimize images (WebP, lazy loading)
- [ ] Code split by route
- [ ] Minimize bundle size

### **Example Optimizations**
```typescript
// Memoize expensive component
export const ExpensiveComponent = React.memo(({ data }) => {
  // Component logic
});

// Memoize expensive calculation
const sortedData = useMemo(() => {
  return data.sort((a, b) => a.name.localeCompare(b.name));
}, [data]);

// Memoize callback
const handleClick = useCallback(() => {
  onAction(data);
}, [data, onAction]);

// Lazy load route
const Dashboard = lazy(() => import('./pages/Dashboard'));
```

---

## 🔐 Security Standards

### **API Key Management**
```typescript
// ❌ NEVER hardcode keys
const apiKey = 'sk_live_abc123';

// ✅ Use environment variables
const apiKey = import.meta.env.VITE_API_KEY;

// ✅ Validate environment variables
if (!import.meta.env.VITE_API_KEY) {
  throw new Error('VITE_API_KEY is required');
}
```

### **Data Sanitization**
```typescript
// Sanitize user input
const sanitizedInput = input.trim().toLowerCase();

// Validate before using
if (!isValidEmail(email)) {
  throw new ValidationError('Invalid email');
}

// Escape HTML
const safeHtml = escapeHtml(userInput);
```

---

## 📊 Logging Standards

### **Log Levels**
```typescript
// ERROR: Critical issues that need immediate attention
console.error('[ServiceName] Critical error:', error);

// WARN: Issues that should be addressed but aren't critical
console.warn('[ComponentName] Deprecated prop used');

// INFO: General information about application flow
console.info('[App] User logged in:', userId);

// DEBUG: Detailed information for debugging (remove in production)
console.debug('[Hook] State updated:', newState);
```

### **Structured Logging**
```typescript
// Include context in logs
console.error('[OrganizationService.create]', {
  operation: 'create',
  userId,
  organizationId,
  error: error.message,
  timestamp: new Date().toISOString(),
});
```

---

## 🎯 AI Agent Optimization Tips

### **For ChatGPT/Claude/Gemini:**
1. **Use descriptive names** - AI can understand intent from names
2. **Add inline comments** - Explain WHY, not WHAT
3. **Keep functions small** - Easier for AI to understand scope
4. **Use TypeScript** - Types help AI understand data flow
5. **Follow patterns** - Consistent patterns are easier to learn

### **For Code Generation:**
1. **Provide examples** - Show AI the pattern to follow
2. **Document edge cases** - Help AI handle special scenarios
3. **Use clear types** - AI can generate better code with types
4. **Add validation** - Show AI what's valid/invalid
5. **Include tests** - AI can learn from test cases

### **For Code Review:**
1. **Clear error messages** - AI can suggest fixes
2. **Consistent formatting** - AI can spot inconsistencies
3. **Logical structure** - AI can understand flow
4. **Good naming** - AI can identify issues
5. **Complete types** - AI can catch type errors

---

## ✅ Checklist for New Code

Before committing, ensure:
- [ ] File has header comment
- [ ] All functions have JSDoc comments
- [ ] Complex logic has inline comments
- [ ] TypeScript types are defined
- [ ] Error handling is implemented
- [ ] Loading states are handled
- [ ] Responsive design is implemented
- [ ] Dark mode is supported
- [ ] Accessibility is considered
- [ ] Performance is optimized
- [ ] Tests are written (if applicable)
- [ ] Documentation is updated

---

## 📚 Resources

### **Internal Documentation:**
- Component Library: `/src/components/ui/README.md`
- API Documentation: `/docs/API.md`
- Design System: `/docs/DESIGN_SYSTEM.md`

### **External Resources:**
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Query](https://tanstack.com/query/latest)

---

## 🎉 Summary

**Goal:** Make code immediately understandable for AI coding agents

**Key Principles:**
1. Self-documenting code
2. Consistent patterns
3. Clear naming
4. Explicit over implicit
5. Comprehensive comments

**Benefits:**
- Faster AI-assisted development
- Better code suggestions
- Easier debugging
- Improved maintainability
- Reduced onboarding time

**Remember:** Code is read more often than written. Write for the next developer (or AI agent) who will work with your code!
