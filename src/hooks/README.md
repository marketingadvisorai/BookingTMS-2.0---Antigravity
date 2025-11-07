# Custom React Hooks

This folder contains all reusable React hooks for the BookingTMS application.

## 📁 Structure

```
/hooks
├── README.md           # This file
├── index.ts            # Export all hooks
├── useBookings.ts      # Booking operations
├── useAuth.ts          # Authentication
├── useTheme.ts         # Theme management
├── useLocalStorage.ts  # LocalStorage wrapper
├── useDebounce.ts      # Debounce utility
├── useMediaQuery.ts    # Responsive hooks
└── usePagination.ts    # Pagination logic
```

## 🎯 Purpose

Centralize all custom React hooks for:
- Better code reusability
- Consistent patterns
- Easy testing
- Clear separation from utilities

## 📖 Usage Example

```typescript
import { useBookings } from '@/hooks';

function BookingsPage() {
  const { bookings, loading, error, refresh } = useBookings();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {bookings.map(booking => (
        <BookingCard key={booking.id} booking={booking} />
      ))}
    </div>
  );
}
```

## 🚀 Getting Started

1. Create new hook file in this directory
2. Export from `index.ts`
3. Import using `@/hooks` alias
4. Add tests in `/tests/unit/hooks/`

## 📝 Hook Template

```typescript
import { useState, useEffect } from 'react';

export function useMyHook(initialValue: string) {
  const [value, setValue] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Your effect logic
  }, []);

  return {
    value,
    setValue,
    loading,
    error,
  };
}
```

## ✅ Best Practices

1. **Prefix with `use`**: All hooks must start with "use"
2. **Return Object**: Return an object for named exports
3. **Type Safety**: Use TypeScript for all hooks
4. **Dependencies**: Carefully manage useEffect dependencies
5. **Error Handling**: Always handle errors gracefully
6. **Documentation**: Add JSDoc comments

---

**To be populated with actual hooks from `/lib` and `/components`**
