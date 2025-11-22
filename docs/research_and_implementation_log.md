# Research & Implementation Log: Stripe Integration Refactor

## Objective
The primary goal was to optimize the Stripe integration for the Booking TMS platform, specifically moving away from an external Node.js backend dependency to a fully Supabase-native architecture using Edge Functions.

## Research & Analysis

### Existing Architecture
-   **`StripeProductService.ts`**: Was found to be making `fetch` calls to a `BACKEND_API_URL` (e.g., `http://localhost:3001`). This introduced a dependency on a separate server, violating the "Supabase-native" requirement.
-   **`StripeIntegrationService.ts`**: Orchestrated the syncing of activities to Stripe but relied on `StripeProductService`.
-   **`stripe-manage-product` Edge Function**: Existed but was underutilized or not fully integrated for all operations (read/write).

### Key Decisions
1.  **"Engine Swap" Strategy**: Instead of rewriting the entire logic, we decided to refactor `StripeProductService` to keep its method signatures (API) the same but change its internal implementation to call Supabase Edge Functions instead of the external backend.
2.  **Edge Function Expansion**: The `stripe-manage-product` function needed to support not just creation but also retrieval (`get_product`, `get_prices`) to fully replace the backend API.
3.  **Direct SDK Usage**: We used the Stripe Node.js SDK directly within the Edge Function for secure, server-side operations.

## Implementation Steps

### Phase 1: Stripe Product Service "Engine Swap"
1.  **Refactoring `StripeProductService.ts`**:
    -   Removed `BACKEND_API_URL` logic.
    -   Implemented `invokeStripeFunction` helper to wrap `supabase.functions.invoke`.
    -   Mapped all methods (`createProduct`, `createPrice`, `updateProduct`, `archiveProduct`, `getProduct`, `getProductPrices`) to corresponding actions in the Edge Function.

2.  **Updating Edge Function (`stripe-manage-product`)**:
    -   Added `get_product` action: Retrieves product details.
    -   Added `get_prices` action: Lists active prices for a product.
    -   Added `get_price_by_lookup_key`: Resolves prices via lookup keys.
    -   Deployed to Supabase project `qftjyjpitnoapqxlrvfs`.

### Verification
-   **Browser Simulation**: Verified the "Add Event" wizard flow. The wizard successfully calls the service, which now invokes the Edge Function.
-   **Deployment**: Confirmed successful deployment of the Edge Function.

## Future Work
-   **Booking Service Consolidation**: Next phase involves consolidating `booking.service.ts` to use RPCs for atomic transactions.
-   **Webhooks**: Ensure `stripe-webhook` handles all relevant events (payment_intent.succeeded, etc.).
