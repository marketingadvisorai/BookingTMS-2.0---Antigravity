# BookingTMS 2.0 - Modules & Services Reference

> Last Updated: 2025-11-27
> This document maps all modules, services, hooks, and their responsibilities.

---

## Module Structure

Each module is self-contained with its own components, hooks, services, and types.

```
src/modules/[module-name]/
├── components/       # UI components
├── hooks/           # React hooks
├── services/        # Data services
├── types/           # TypeScript types
├── pages/           # Route pages (if applicable)
├── containers/      # Data-fetching containers
├── widgets/         # Embeddable widgets (embed-pro only)
├── widget-components/ # Widget sub-components
└── index.ts         # Public exports
```

---

## Modules Overview

### `embed-pro` - Embeddable Booking Widgets
**Purpose**: Create and manage embeddable booking widgets for external websites.

| Component | File | Description |
|-----------|------|-------------|
| `EmbedProDashboard` | `components/EmbedProDashboard.tsx` | Main admin dashboard |
| `EmbedConfigCard` | `components/EmbedConfigCard.tsx` | Config card with actions |
| `CreateEmbedModal` | `components/CreateEmbedModal.tsx` | Create new embed |
| `EmbedPreviewPanel` | `components/EmbedPreviewPanel.tsx` | Live preview iframe |
| `EmbedCodeDisplay` | `components/EmbedCodeDisplay.tsx` | Copy embed code |

| Widget | File | Description |
|--------|------|-------------|
| `BookingWidgetPro` | `widgets/BookingWidgetPro.tsx` | Main booking widget |
| `WidgetHeader` | `widget-components/WidgetHeader.tsx` | Activity header |
| `WidgetCalendar` | `widget-components/WidgetCalendar.tsx` | Date picker |
| `WidgetTimeSlots` | `widget-components/WidgetTimeSlots.tsx` | Time selection |
| `WidgetPartySize` | `widget-components/WidgetPartySize.tsx` | Guest counter |
| `WidgetCheckout` | `widget-components/WidgetCheckout.tsx` | Customer form |
| `WidgetSuccess` | `widget-components/WidgetSuccess.tsx` | Confirmation |
| `WidgetActivitySelector` | `widget-components/WidgetActivitySelector.tsx` | Venue game picker |

| Hook | File | Description |
|------|------|-------------|
| `useEmbedConfigs` | `hooks/useEmbedConfigs.ts` | CRUD for embed configs |
| `useEmbedPreview` | `hooks/useEmbedPreview.ts` | Preview URL generation |
| `useBookingFlow` | `hooks/useBookingFlow.ts` | Booking state machine |
| `useEmbedProData` | `hooks/useEmbedProData.ts` | Widget data fetching |

| Service | File | Description |
|---------|------|-------------|
| `embedConfigService` | `services/embedConfig.service.ts` | Embed config CRUD |
| `embedProDataService` | `services/embedProData.service.ts` | Widget data fetching |
| `previewService` | `services/preview.service.ts` | Preview URL/styles |

---

### `activities` - Activity Management
**Purpose**: Manage bookable activities (escape rooms, games).

| Service | Description |
|---------|-------------|
| `activityService` | CRUD for activities |
| `activitySessionService` | Session/slot management |
| `activityPricingService` | Pricing tiers |

| Hook | Description |
|------|-------------|
| `useActivities` | Fetch activities list |
| `useActivity` | Single activity |
| `useActivitySessions` | Sessions for activity |

---

### `bookings` - Booking Management
**Purpose**: Handle customer bookings and reservations.

| Service | Description |
|---------|-------------|
| `bookingService` | CRUD for bookings |
| `availabilityService` | Check slot availability |

| Hook | Description |
|------|-------------|
| `useBookings` | Fetch bookings list |
| `useBooking` | Single booking |
| `useCreateBooking` | Create booking mutation |

---

### `customers` - Customer Management
**Purpose**: CRM for customer records.

| Service | Description |
|---------|-------------|
| `customerService` | CRUD for customers |
| `customerMetricsService` | LTV, booking count |

---

### `venues` - Venue Management
**Purpose**: Manage physical locations.

| Service | Description |
|---------|-------------|
| `venueService` | CRUD for venues |

---

### `organizations` - Organization Settings
**Purpose**: Multi-tenant organization management.

| Service | Description |
|---------|-------------|
| `organizationService` | Org settings, members |
| `memberService` | Team member management |

---

### `payments` - Stripe Integration
**Purpose**: Payment processing via Stripe.

| Service | Description |
|---------|-------------|
| `stripeService` | Stripe API wrapper |
| `checkoutService` | Checkout session creation |
| `webhookService` | Webhook handling |

---

## Service Naming Convention

```typescript
// File: [entity].service.ts
// Class: [Entity]Service
// Export: [entity]Service (singleton)

// Example: embedConfig.service.ts
class EmbedConfigService {
  async getById(id: string): Promise<EmbedConfig> { ... }
  async create(input: CreateInput): Promise<EmbedConfig> { ... }
  async update(id: string, input: UpdateInput): Promise<EmbedConfig> { ... }
  async delete(id: string): Promise<void> { ... }
}

export const embedConfigService = new EmbedConfigService();
```

---

## Hook Naming Convention

```typescript
// File: use[Entity].ts or use[Action].ts
// Export: use[Entity] or use[Action]

// Example: useEmbedConfigs.ts
export function useEmbedConfigs(options: Options): {
  configs: EmbedConfig[];
  loading: boolean;
  error: Error | null;
  create: (input) => Promise<EmbedConfig>;
  update: (id, input) => Promise<void>;
  remove: (id) => Promise<void>;
}
```

---

## Type Naming Convention

```typescript
// File: [feature].types.ts

// Entity types: PascalCase
interface EmbedConfig { ... }
interface WidgetActivity { ... }

// Input types: Create[Entity]Input, Update[Entity]Input
interface CreateEmbedConfigInput { ... }
interface UpdateEmbedConfigInput { ... }

// Props types: [Component]Props
interface BookingWidgetProProps { ... }

// Enum-like types: Use const objects
const EMBED_TYPES = [...] as const;
type EmbedType = typeof EMBED_TYPES[number]['value'];
```

---

## Import Patterns

```typescript
// Import from module index
import { useEmbedConfigs, embedConfigService } from '@/modules/embed-pro';

// Import specific types
import type { EmbedConfig, CreateEmbedConfigInput } from '@/modules/embed-pro/types';

// Import components
import { EmbedProDashboard } from '@/modules/embed-pro/components';
```

---

## Module Dependencies

```
embed-pro
├── depends on: activities, venues, organizations
├── used by: pages/EmbedPro.tsx, App.tsx

activities
├── depends on: venues, organizations
├── used by: embed-pro, bookings

bookings
├── depends on: activities, customers, payments
├── used by: dashboard, reports

payments
├── depends on: organizations, bookings
├── used by: bookings, checkout
```
