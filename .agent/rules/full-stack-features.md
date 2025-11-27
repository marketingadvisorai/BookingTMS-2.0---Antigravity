# BookingTMS 2.0 - Full Stack Features Reference

> Last Updated: 2025-11-27
> This document maps features to their frontend, backend, and database components.

---

## Feature: Embed Pro Booking Widget

### Overview
Embeddable booking widget for external websites with Apple Liquid Glass design.

### Frontend
| Component | Path | Purpose |
|-----------|------|---------|
| `EmbedProPage` | `modules/embed-pro/pages/EmbedProPage.tsx` | Widget entry point |
| `EmbedProContainer` | `modules/embed-pro/containers/EmbedProContainer.tsx` | Data fetching |
| `BookingWidgetPro` | `modules/embed-pro/widgets/BookingWidgetPro.tsx` | Main widget |
| `WidgetActivitySelector` | `modules/embed-pro/widget-components/WidgetActivitySelector.tsx` | Venue game picker |

### Hooks
| Hook | Path | Purpose |
|------|------|---------|
| `useBookingFlow` | `modules/embed-pro/hooks/useBookingFlow.ts` | Booking state machine |
| `useEmbedProData` | `modules/embed-pro/hooks/useEmbedProData.ts` | Widget data fetching |
| `useEmbedConfigs` | `modules/embed-pro/hooks/useEmbedConfigs.ts` | Config CRUD |

### Services
| Service | Path | Purpose |
|---------|------|---------|
| `embedProDataService` | `modules/embed-pro/services/embedProData.service.ts` | Supabase queries |
| `embedConfigService` | `modules/embed-pro/services/embedConfig.service.ts` | Config CRUD |

### Database
| Table | Key Columns |
|-------|-------------|
| `embed_configs` | id, embed_key, type, target_type, target_id, config, style |
| `activities` | id, name, price, duration, schedule (via settings) |
| `venues` | id, name, address |

### Edge Functions
| Function | Purpose |
|----------|---------|
| `create-checkout-session` | Create Stripe checkout |

### RLS Policies
- Public read for `embed_configs` where `is_active = true`
- Public read for `activities` where `is_active = true`
- Public read for `venues` where `status = 'active'`

---

## Feature: Activity Management

### Overview
CRUD for bookable activities (escape rooms, games).

### Frontend
| Component | Path | Purpose |
|-----------|------|---------|
| `Events.tsx` | `pages/Events.tsx` | Activity list page |
| `AddActivityWizard` | `components/events/AddActivityWizard.tsx` | 8-step wizard |
| `Step1BasicInfo` | `components/events/steps/Step1BasicInfo.tsx` | Name, description |
| `Step2CapacityPricing` | `components/events/steps/Step2CapacityPricing.tsx` | Players, pricing |
| `Step5Schedule` | `components/events/steps/Step5Schedule.tsx` | Operating hours |
| `Step6PaymentSettings` | `components/events/steps/payment/` | Stripe setup |

### Hooks
| Hook | Path | Purpose |
|------|------|---------|
| `useActivities` | `hooks/useActivities.ts` | Activity list |
| `useActivity` | `hooks/useActivity.ts` | Single activity |

### Services
| Service | Path | Purpose |
|---------|------|---------|
| `activityService` | `modules/inventory/services/activity.service.ts` | CRUD |
| `sessionService` | `services/session.service.ts` | Time slot generation |

### Database
| Table | Key Columns |
|-------|-------------|
| `activities` | id, organization_id, venue_id, name, price, duration, settings |
| `activity_sessions` | id, activity_id, date, start_time, capacity, booked_count |

### Edge Functions
| Function | Purpose |
|----------|---------|
| `stripe-manage-product` | Sync with Stripe |
| `bulk-create-stripe-products` | Batch sync |

---

## Feature: Booking Management

### Overview
Customer booking creation and management.

### Frontend
| Component | Path | Purpose |
|-----------|------|---------|
| `Bookings.tsx` | `pages/Bookings.tsx` | Booking list |
| `BookingDetailsDialog` | `components/bookings/BookingDetailsDialog.tsx` | View/edit |
| `AddBookingDialog` | `components/bookings/AddBookingDialog.tsx` | Manual booking |

### Hooks
| Hook | Path | Purpose |
|------|------|---------|
| `useBookings` | `hooks/useBookings.ts` | Booking list |
| `useCreateBooking` | `hooks/useCreateBooking.ts` | Create mutation |

### Services
| Service | Path | Purpose |
|---------|------|---------|
| `bookingService` | `lib/bookings/bookingService.ts` | CRUD |
| `checkoutService` | `lib/payments/checkoutService.ts` | Stripe checkout |

### Database
| Table | Key Columns |
|-------|-------------|
| `bookings` | id, activity_id, customer_*, party_size, status, payment_status |
| `customers` | id, email, name, total_bookings, total_spent |

### Edge Functions
| Function | Purpose |
|----------|---------|
| `create-checkout-session` | Stripe checkout |
| `create-booking` | Database insert |
| `stripe-webhook` | Payment confirmation |

---

## Feature: Venue Management

### Overview
Physical location management.

### Frontend
| Component | Path | Purpose |
|-----------|------|---------|
| `Venues.tsx` | `pages/Venues.tsx` | Venue list |
| `VenueForm` | `components/venues/VenueForm.tsx` | Create/edit |

### Hooks
| Hook | Path | Purpose |
|------|------|---------|
| `useVenues` | `hooks/venue/useVenues.ts` | Venue list |
| `useVenueManagement` | `hooks/venue/useVenueManagement.ts` | Business logic |

### Services
| Service | Path | Purpose |
|---------|------|---------|
| `venueService` | `services/venueService.ts` | CRUD |

### Database
| Table | Key Columns |
|-------|-------------|
| `venues` | id, organization_id, name, address, timezone, embed_key |

---

## Feature: Customer Management

### Overview
CRM for customer records.

### Frontend
| Component | Path | Purpose |
|-----------|------|---------|
| `Customers.tsx` | `pages/Customers.tsx` | Customer list |
| `CustomerDetailsDialog` | `components/customers/CustomerDetailsDialog.tsx` | View/edit |

### Hooks
| Hook | Path | Purpose |
|------|------|---------|
| `useCustomers` | `hooks/useCustomers.ts` | Customer list |

### Services
| Service | Path | Purpose |
|---------|------|---------|
| `customerService` | `services/customerService.ts` | CRUD |

### Database
| Table | Key Columns |
|-------|-------------|
| `customers` | id, organization_id, email, name, total_bookings, total_spent |

---

## Feature: Organization Settings

### Overview
Multi-tenant organization management.

### Frontend
| Component | Path | Purpose |
|-----------|------|---------|
| `Organizations.tsx` | `pages/Organizations.tsx` | Org list (admin) |
| `OrganizationSettingsModal` | `components/organizations/OrganizationSettingsModal.tsx` | Settings |
| `Account.tsx` | `pages/Account.tsx` | Current org settings |

### Hooks
| Hook | Path | Purpose |
|------|------|---------|
| `useOrganizations` | `features/system-admin/hooks/useOrganizations.ts` | Org list |
| `useOrganization` | `hooks/useOrganization.ts` | Current org |

### Services
| Service | Path | Purpose |
|---------|------|---------|
| `organizationService` | `services/organizationService.ts` | CRUD |

### Database
| Table | Key Columns |
|-------|-------------|
| `organizations` | id, name, slug, owner_id, stripe_account_id, settings |
| `organization_members` | id, organization_id, user_id, role |

---

## Feature: Stripe Connect

### Overview
Multi-tenant payment processing.

### Frontend
| Component | Path | Purpose |
|-----------|------|---------|
| `StripeConnectSection` | `components/account/StripeConnectSection.tsx` | Connect UI |

### Edge Functions
| Function | Purpose |
|----------|---------|
| `create-connect-account` | Onboard venue owner |
| `create-checkout-session` | With Connect account |
| `stripe-webhook` | Handle Connect events |

### Database
| Column | Table | Purpose |
|--------|-------|---------|
| `stripe_account_id` | `organizations` | Connect account ID |
| `stripe_charges_enabled` | `organizations` | Can accept payments |
| `stripe_payouts_enabled` | `organizations` | Can receive payouts |

---

## Feature: Authentication

### Overview
User authentication via Supabase Auth.

### Frontend
| Component | Path | Purpose |
|-----------|------|---------|
| `Login.tsx` | `pages/Login.tsx` | Login form |
| `AuthProvider` | `contexts/AuthContext.tsx` | Auth state |

### Hooks
| Hook | Path | Purpose |
|------|------|---------|
| `useAuth` | `hooks/useAuth.ts` | Auth state |
| `useUser` | `hooks/useUser.ts` | Current user |

### Database
| Table | Purpose |
|-------|---------|
| `auth.users` | Supabase Auth users |
| `organization_members` | User-org relationship |

---

## Cross-Cutting Concerns

### Real-Time Updates
- All major tables in `supabase_realtime` publication
- Hooks subscribe to `postgres_changes`
- 500ms debounce for high-traffic scenarios

### Error Handling
- Toast notifications via `sonner`
- Error boundaries for component crashes
- Structured error responses from edge functions

### Caching
- TanStack Query for server state
- Stale-while-revalidate pattern
- Optimistic updates for mutations
