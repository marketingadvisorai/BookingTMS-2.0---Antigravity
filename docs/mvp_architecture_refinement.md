# MVP Architecture Refinement Plan

## Goal
To refine the Booking TMS architecture for a scalable, industry-standard MVP release. The primary focus is on refactoring the monolithic `CalendarWidget` into a modular, maintainable component structure and ensuring all booking logic flows through a unified, secure, and scalable service layer.

## 1. Frontend Architecture: Modularizing `CalendarWidget`

The current `CalendarWidget.tsx` is a ~3300 line monolith. We will refactor it using a **Composition Pattern** and **Custom Hooks**.

### 1.1 Component Breakdown
We will split `CalendarWidget` into the following atomic components:
-   **`BookingWizard`**: The main container managing the step state.
-   **`DateSelector`**: Handles date selection logic and UI.
-   **`TimeSlotGrid`**: Renders available sessions/slots.
-   **`GameSelector`**: (If applicable) Allows switching between games.
-   **`BookingSummary`**: Displays the cart/booking details.
-   **`PaymentForm`**: Wraps the Stripe Elements logic.
-   **`ConfirmationView`**: Success state display.

### 1.2 State Management
-   **`useBookingState`**: A custom hook (using `useReducer`) to manage the complex wizard state (step, selectedDate, selectedSession, guestCount, contactDetails).
-   **`useAvailability`**: A hook to fetch and cache session availability.
-   **`usePayment`**: Encapsulates Stripe payment logic.

### 1.3 Directory Structure & Component Details
```
src/components/widgets/booking/
├── BookingWizard.tsx       # Main Entry Point (Orchestrator)
├── components/
│   ├── DateSelector.tsx    # Props: { selectedDate, onSelect, availableDates }
│   ├── TimeSlotGrid.tsx    # Props: { slots, selectedTime, onSelect, loading }
│   ├── BookingSummary.tsx  # Props: { game, date, time, guests, total }
│   ├── PaymentForm.tsx     # Props: { total, primaryColor, onSuccess, onError }
│   └── CustomerForm.tsx    # Props: { data, errors, onChange }
├── hooks/
│   ├── useBookingState.ts  # Returns: { state, dispatch, actions }
│   ├── useAvailability.ts  # Returns: { slots, loading, error }
│   └── useBookingLogic.ts  # Returns: { submitBooking, isProcessing }
└── context/
    └── BookingContext.tsx  # Optional: To avoid prop drilling
```

### 1.4 Technical Refactoring Specifics
-   **`StripePaymentForm` Extraction**:
    -   Currently relies on closure variables (`primaryColor`, `totalPrice`).
    -   **Fix**: Pass these as explicit props.
    -   **Props**: `primaryColor: string`, `amount: number`, `onSuccess: (intent) => void`, `onError: (err) => void`.
-   **`handleCompleteBooking` Decomposition**:
    -   **Validation**: Move to `src/lib/validation/bookingValidation.ts`.
    -   **Price Calc**: Move to `src/lib/pricing/calculator.ts`.
    -   **Submission**: Encapsulate in `useBookingLogic` hook.

## 2. Service Layer Standardization

We will enforce a strict **Service Layer Pattern** to decouple the frontend from the backend implementation.

### 2.1 Unified Booking Service
-   **`BookingService.ts`**: The single source of truth for creating bookings.
    -   **`createBooking(payload)`**:
        -   Validates input (Zod).
        -   Calls `create-booking` Edge Function (preferred for security) OR `create_booking_transaction` RPC directly (for MVP speed if Edge Function adds latency).
        -   **Decision**: For MVP, we will use **Direct RPC** for speed and simplicity, but structure the code so switching to Edge Function is a config change.

### 2.2 Payment Service
-   **`StripeService.ts`** (formerly `CheckoutService`):
    -   Handles `createPaymentIntent`, `createPaymentLink`.
    -   Ensures all Stripe interactions are typed and error-handled.

## 3. Scalability & Performance

### 3.1 Database Optimization
-   **Indexing**: Ensure `activity_sessions(start_time, activity_id)` and `bookings(session_id)` are indexed.
-   **Concurrency**: The `create_booking_transaction` RPC uses `FOR UPDATE` row locking. This is correct for preventing overbooking but can be a bottleneck at high scale.
    -   **Optimization**: For high scale (>10k concurrent), we would move to a Redis-based inventory lock. For MVP, Postgres Row Locking is sufficient and robust.

### 3.2 Frontend Performance
-   **Memoization**: Use `React.memo` for `TimeSlotGrid` to prevent re-rendering all slots when one is selected.
-   **Optimistic UI**: Update availability UI immediately upon selection, revert if booking fails.

## 4. Implementation Steps

1.  **Create Directory Structure**: Set up `src/components/widgets/booking/`.
2.  **Extract Logic**: Move `timeSlots` logic to `useAvailability` hook.
3.  **Extract Components**: Systematically move JSX chunks to new component files.
4.  **Refactor Main Widget**: Update `CalendarWidget.tsx` to compose these new components.
5.  **Verify Flows**: Test the full booking flow with the refactored code.

## 5. Future Proofing (Post-MVP)
-   **Queue-based Booking**: For massive spikes (ticket drops), implement a queue system.
-   **Read Replicas**: Use Supabase Read Replicas for availability queries.
