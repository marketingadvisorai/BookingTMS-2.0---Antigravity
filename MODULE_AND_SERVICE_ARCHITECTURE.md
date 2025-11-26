# Module and Service Architecture

This document outlines the key modules, services, and hooks used in the Booking TMS application to ensure clarity and avoid conflicts during development.

## Core Services (`src/services`)

| Service Name | File | Responsibility | Usage |
| :--- | :--- | :--- | :--- |
| **SupabaseBookingService** | `SupabaseBookingService.ts` | **Primary Widget Service**. Handles public widget operations: fetching venue config by embed key, getting venue activities, and creating widget bookings (public). Also handles authenticated venue booking retrieval. | Used by `Embed.tsx`, `BookingWidgets.tsx`, and public booking widgets. |
| **BookingService** | `booking.service.ts` | **Core Transaction Service**. Handles low-level booking creation, including Stripe Payment Intent initiation (via Edge Function) and atomic booking transactions (via RPC). | Used by `SupabaseBookingService` to execute the actual booking creation. |
| **SessionService** | `session.service.ts` | **Availability Service**. Manages activity sessions/slots. Finds available sessions for a given date and activity. | Used by `SupabaseBookingService` to resolve time slots to session IDs. |
| **VenueService** | `venue.service.ts` | **Venue Management**. Handles venue CRUD operations. | Used by Admin dashboard for venue setup. |
| **StripeConnectService** | `stripeConnectService.ts` | **Payment Integration**. Manages Stripe Connect onboarding and account linkage. | Used by Admin dashboard for payment setup. |

## Data Hooks (`src/hooks`)

| Hook Name | File | Responsibility | Notes |
| :--- | :--- | :--- | :--- |
| **useActivities** | `useActivities.ts` | **Modern Activity Hook**. Manages `activities` table data. The source of truth for "Games" and "Events". | Preferred hook for new development. |
| **useGames** | `useGames.ts` | **Legacy/Wrapper Hook**. Wraps `useActivities` and maps data to the `Game` interface. | maintained for backward compatibility. **Do not modify logic here directly; modify `useActivities` instead.** |
| **useBookings** | `useBookings.ts` | **Booking Management**. Hook for fetching and managing bookings in the admin dashboard. | Uses `SupabaseBookingService` or direct queries. |
| **useWidgetConfigs** | `components/widgets/config/useWidgetConfigs.ts` | **Widget State**. Manages local state for widget configuration in the admin preview. | |

## Key Components

| Component | File | Responsibility |
| :--- | :--- | :--- |
| **GamesDatabase** | `pages/GamesDatabase.tsx` | **Activity Management UI**. The admin page for creating/editing activities. Uses `useGames` (and thus `useActivities`). |
| **BookingWidgets** | `pages/BookingWidgets.tsx` | **Widget Config UI**. The admin page for configuring and previewing booking widgets. |
| **Embed** | `pages/Embed.tsx` | **Public Widget Entry**. The entry point for the iframe/embedded widget. Fetches config via `SupabaseBookingService.getVenueWidgetConfig`. |

## Database Tables (Key Entities)

- **activities**: Stores game/event details (formerly `games` in some contexts, but normalized to `activities`).
- **venues**: Stores venue configuration.
- **bookings**: Stores booking records.
- **activity_sessions**: Stores specific time slots/availability.
- **customers**: Stores customer profiles.

## Conflict Prevention Guidelines

1.  **Activity vs Game**: The codebase is transitioning to "Activity" terminology. `useGames` is a wrapper. When adding fields, add them to `activities` table and `useActivities` hook first, then map them in `useGames` if necessary.
2.  **Widget Config**: Widget configuration is merged from `venues.settings.widgetConfig` and `activities` data. `SupabaseBookingService.mergeWidgetConfig` handles this. **Do not hardcode widget settings** that should be dynamic from the activity.
3.  **Booking Creation**: Always use `SupabaseBookingService.createWidgetBooking` for public widgets to ensure proper session resolution and validation.
