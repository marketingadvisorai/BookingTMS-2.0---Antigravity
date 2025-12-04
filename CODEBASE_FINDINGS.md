# Codebase Findings (2025-12-01)

## Snapshot
- App is a Vite + React + TypeScript mono-repo with Supabase + Stripe edge functions, plus a small Express backend (`src/backend`).
- Current sprint doc (`CURRENT_TASKS.md`) lists four “up next” items: refactor `src/pages/Marketing.tsx`, ship admin notifications, booking receipt PDF, and capacity management.
- Build succeeds but type-checking does not; tooling noise needs cleanup.

## Build & Tooling
- `npm run build` → succeeds but prints dozens of sourcemap resolution warnings (likely path-related; repo path includes spaces) and chunk size warnings (>500 kB).
- `npx tsc --noEmit` → fails with many errors. Main categories:
  - Backend routes/middleware missing returns (e.g., `src/backend/api/routes/*.ts`, `src/backend/middleware/auth.ts`).
  - Supabase calls inferred as `never` across marketing/promo/gift-card/analytics/stripe-connect services due to incomplete DB typings.
  - Widget promo/gift inputs (`src/components/widgets/...`) can’t resolve `@/lib/utils` and treat promo/gift results as `never`.
  - Classes in `src/services/DataSyncService.ts` and `src/shared/errors/AppError.ts` need `override`.
  - Supabase error handling (`src/features/admin-notifications/services/adminNotification.service.ts`) fails inserts because the table types are `never`.

## Architecture Notes
- Core auth/layout in `src/App.tsx`, `src/lib/auth/AuthContext.tsx`; multi-tenant roles with system-admin redirects.
- New widget stack: `src/modules/embed-pro/**` (documented in `src/modules/embed-pro/ARCHITECTURE.md`), tied to Supabase edge functions (`create-checkout-session`, `verify-checkout-session`, `stripe-webhook`, etc.).
- Legacy widget builder in `src/components/widgets/**` and `src/pages/BookingWidgets.tsx` still relies on localStorage/mock configs and massive components (e.g., `src/components/widgets/FareBookWidget.tsx` ~2.7k lines).
- Supabase DB types are split: `src/types/supabase.ts` (only marketing/promo/gift-card tables) and `src/types/database.types.ts` (partial core schema). Supabase client at `src/lib/supabase.ts` hardcodes real project URL/anon key; another client exists at `src/lib/supabase/client.ts` using env vars.
- Large monolith pages remain: `src/pages/Marketing.tsx` (2,772 lines), `src/pages/SystemAdminDashboard.tsx` (1,901), `src/pages/Waivers.tsx` (1,664); widget monoliths listed in `CURRENT_TASKS.md`.
- Supabase migrations include capacity-management tables (`supabase/migrations/058_capacity_management_tables.sql`) with RLS enabled for authenticated users.

## Risks / Gaps
- Type safety is broken: supabase types don’t cover most tables, causing `never` results and blocking `tsc`. This also masks API surface changes (promotions, gift cards, marketing, analytics, stripe_connect).
- Security: `src/lib/supabase.ts` embeds real Supabase URL/anon key; multiple clients risk mismatched auth settings. Should consolidate on env-based client and scrub secrets from source.
- Admin notifications feature is stubbed: `organizationId` placeholder, notification insert typed as `never`, not wired to booking events.
- Booking receipt feature (`src/features/booking-receipt`) is built but not connected to booking success/email flows.
- Capacity management feature exists (blocked sessions, overrides, modal/hooks) but not surfaced in UI flows or bookings page.
- Legacy widget builder uses mock data/localStorage; not aligned with new embed-pro flow or live Supabase data.
- Build warnings (sourcemaps) add noise; likely due to repo path spacing and/or missing source files for dependencies.

## Recommended Next Actions (priority)
1) Restore type safety: regenerate Supabase types for the full schema and point all clients to a single env-driven supabase client; re-run `tsc` to unblock (fix `never` errors across marketing/analytics/stripe-connect/admin-notifications/promo/gift-card services and widget promo inputs).  
2) Clean `tsc` failures: add missing returns in backend routes/middleware, add `override` keywords in `src/services/DataSyncService.ts` and `src/shared/errors/AppError.ts`, fix `@/lib/utils` import for widget promo/gift components.  
3) Secure supabase client: remove hardcoded keys in `src/lib/supabase.ts`, ensure imports use `src/lib/supabase/client.ts`, and load keys from env.  
4) Refactor hot files: break down `src/pages/Marketing.tsx`, `src/components/widgets/FareBookWidget.tsx`, `src/pages/SystemAdminDashboard.tsx`, and `src/pages/Waivers.tsx` into feature modules per coding standards (≤250 lines/file).  
5) Wire incomplete features: connect admin notifications to booking creation/Stripe webhook with real org context; surface capacity blocking/overrides in bookings/calendar UI; integrate booking receipt generator into checkout success/email.  
6) Reduce build noise: address sourcemap warnings (try build path without spaces or tweak Vite sourcemap settings) and consider chunk splitting for oversized bundles.  
7) Testing: once `tsc` is green, run unit/e2e suites (`npm test`, Playwright, `tests/load/*`) to validate booking and embed flows with the real Supabase/Stripe edge functions.
