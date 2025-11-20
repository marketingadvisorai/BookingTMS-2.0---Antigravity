# Venue Update 1.0 — Release Notes

Date: 2025-11-08

## Highlights
- Dynamic embed widgets now load live venue/game data using Supabase lookups instead of demo keys.
- Add Game Wizard Step 6 generates single-game booking links and embed codes with real embed keys, colors, and slugs.
- Venues and widget settings pass a shared `embedContext`, ensuring iframe/script snippets stay in sync with venue configuration.
- Added guardrails and UI messaging when a venue lacks a generated embed key.
- Hardened availability engine and data sync models to support new single-game fields.

## Details
- `src/pages/Embed.tsx` fetches venue configuration via Supabase using the provided embed key and exposes loading/error states.
- `src/pages/Venues.tsx`, `src/components/widgets/CalendarWidgetSettings.tsx`, and `src/components/games/AddGameWizard.tsx` now share `embedContext` (embed key, base URL, primary color).
- Step 6 of the Add Game Wizard produces iframe, React, and direct booking link snippets using the venue's embed key, theme, and game slug; includes clipboard UX improvements.
- Added warnings in the wizard when no real embed key is present and disabled the widget key generator button in `EmbedPreview` to prevent placeholder usage.
- Updated `DataSyncService.ts` and `availabilityEngine.ts` to include missing game fields (slug, min/max adults, peak pricing, etc.) required for accurate embeds.
- Refined Calendar Widget styling/options to align with single-game embed defaults and ensure consistent previews.

## Deployment Notes
- Save each venue after rollout to ensure a real embed key exists before sharing embed codes.
- Confirm Supabase credentials are available for the `/embed/:key` route to resolve live data.

---

# Stripe Integration 0.1.0 — Release Notes

Date: 2025-11-11

## Highlights
- **Complete Game Wizard with Stripe Integration**: Full 7-step wizard for creating games with automatic Stripe product and price creation
- **Payment Processing**: Integrated Stripe Checkout Sessions, Payment Intents, and Payment Links
- **Non-blocking Stripe Creation**: Games can be created even if Stripe temporarily fails, with background sync capability
- **Enhanced Loading States**: Optimized loading behavior - shows only on first load, background updates are seamless
- **Comprehensive Game Data**: All wizard steps (Basic Info, Pricing, Details, Media, Schedule, Widget, Review) fully functional
- **Real-time Data Sync**: Games and venues update in real-time without continuous loading screens

## New Features

### Game Creation Wizard
- **Step 1 - Basic Info**: Game name, description, category, tagline, event type, game type
- **Step 2 - Capacity & Pricing**: Adult/child pricing, custom capacity fields, group discounts, dynamic pricing
- **Step 3 - Game Details**: Duration, difficulty, languages, success rate, FAQs, cancellation policies, accessibility
- **Step 4 - Media Upload**: Cover image, gallery images, video uploads
- **Step 5 - Schedule & Availability**: Operating days/hours, slot intervals, advance booking, custom dates, blocked dates with time blocks
- **Step 6 - Widget & Embed**: Widget selection, direct booking links, iframe embed codes (HTML, React, WordPress)
- **Step 7 - Review & Publish**: Validation, creation progress tracking, success confirmation

### Stripe Integration
- **Automatic Product Creation**: Creates Stripe products with comprehensive metadata
- **Price Management**: Handles adult pricing, child pricing, custom capacity pricing, and group discounts
- **Metadata Enrichment**: Stores game ID, venue ID, duration, difficulty, pricing summary in Stripe
- **Edge Function**: `stripe-manage-product` function for server-side Stripe operations
- **Non-blocking Fallback**: Games save to database even if Stripe temporarily fails
- **Sync Status Tracking**: Tracks Stripe sync status (`synced`, `pending`) for each game

### Performance Improvements
- **Optimized Loading**: Loading screens only show on first page load
- **Background Updates**: Real-time database changes update UI without loading screens
- **Smooth Transitions**: No UI blocking during data refreshes
- **Efficient Polling**: Reduced unnecessary re-renders

### Payment Widget Integration
- **Stripe Fields in Widgets**: Calendar and booking widgets now include `stripe_price_id` and `stripe_product_id`
- **Payment Validation**: Validates Stripe integration before allowing bookings
- **Error Handling**: Clear error messages when payment configuration is missing
- **Multiple Payment Methods**: Supports Checkout Sessions, embedded payments, and payment links

## Technical Changes

### Modified Files
1. **`src/components/games/AddGameWizard.tsx`**
   - Added 7-step wizard with validation
   - Creation progress tracking with stages
   - Success screen with game summary
   - Loading states for publishing

2. **`src/components/widgets/CalendarWidgetSettings.tsx`**
   - Maps all wizard data to Supabase schema
   - Includes Stripe fields in game mapping
   - Handles create/update flows with Stripe sync
   - Real-time game list updates

3. **`src/hooks/useGames.ts`**
   - Non-blocking Stripe product creation
   - Optimized loading states (first load only)
   - Background refresh without loading screens
   - Error handling for Stripe failures

4. **`src/hooks/useVenues.ts`**
   - Optimized loading states (first load only)
   - Background refresh without loading screens
   - Real-time venue updates

5. **`src/components/widgets/CalendarWidget.tsx`**
   - Added Stripe fields (`stripe_price_id`, `stripe_product_id`, `stripe_sync_status`)
   - Payment validation before checkout
   - Enhanced game data mapping

6. **`src/lib/stripe/stripeProductService.ts`**
   - Comprehensive metadata support
   - Child pricing, custom capacity, group discounts
   - Edge Function integration
   - Retry logic for reliability

### Database Schema
- **Games Table**: Added `stripe_product_id`, `stripe_price_id`, `stripe_sync_status`, `stripe_last_sync`
- **Settings JSONB**: Stores all wizard data (schedule, media, widget preferences, custom fields)

### API Integration
- **Supabase Edge Functions**: `stripe-manage-product` for Stripe operations
- **MCP Integration**: Stripe MCP server for product/price management
- **Real-time Subscriptions**: Automatic UI updates on database changes

## Bug Fixes
- Fixed continuous "Loading venues..." screen issue
- Fixed continuous "Loading games..." message in widget settings
- Fixed missing Stripe fields causing "Game pricing not configured" error
- Fixed hardcoded `loading: false` in useGames hook
- Resolved TypeScript type errors in game creation flow

## Breaking Changes
None - all changes are backward compatible

## Migration Notes
- Existing games without Stripe integration will have `stripe_sync_status: 'pending'`
- Games can be retroactively synced with Stripe using bulk update functions
- No manual intervention required for existing venues

## Known Limitations
- Stripe Edge Function requires proper API key configuration
- Some older games may not have Stripe products created (marked as 'pending')
- Group discount metadata is stored but requires booking flow integration

## Next Steps
- Add bulk Stripe sync for existing games
- Implement webhook handlers for Stripe events
- Add payment method management for venues
- Create Stripe dashboard integration for revenue tracking
- Add refund and cancellation handling

## Testing
- Created test game "Complete Wizard Test - Haunted Library" with full Stripe integration
- Verified all 7 wizard steps save data correctly
- Confirmed Stripe product/price creation works
- Validated payment flow with test cards
- Tested real-time updates and loading states

## Credits
- Developed using Supabase, Stripe, and React
- MCP integration for Stripe operations
- shadcn/ui components for UI

---

# Waiver v0.1.0 — Release Notes

Date: 2025-11-06

## Highlights
- Added “Show QR” mode in Scan Waiver with template selection and QR generation.
- Implemented live camera QR scanning using `@zxing/browser` (decodes waiver codes and links).
- Implemented image upload decoding for QR codes.
- Wired manual waiver code verification to persisted records in `localStorage`.
- Added dependencies: `react-qr-code`, `@zxing/browser`.

## Details
- Scan Waiver now supports four modes: `Show QR`, `Camera`, `Upload`, and `Manual`.
- Camera mode decodes QR and verifies waiver codes (`WV-####`) against `admin_waivers`.
- Upload mode decodes QR from selected images and follows the same verification flow.
- Manual mode looks up entered waiver code from `admin_waivers` and displays verification result.
- Show QR builds a waiver form URL based on selected template from `admin_waiver_templates` and renders a QR.

## Known Limitations
- Camera access depends on browser/device permissions; some iOS/Safari environments may require HTTPS.
- PDF exports remain simple (jsPDF); replace with production-grade generator later.

## Next Steps
- Add deep link handling to auto-fill booking/game context when generating QR.
- Persist newly scanned/verified waivers back to storage with audit trail.
- Integrate email/SMS send for waiver links.

---

# Managers Media v0.02 — Release Notes

Date: 2025-11-06

## Highlights
- Added localStorage persistence for Waiver Templates and Waiver Records.
- Replaced hardcoded waiver lists with state-driven data loaded on mount.
- Implemented header and row actions in Waiver Records: send reminders, export CSV, download record, delete.
- Updated Waiver Preview to support actual file download for a record/template snapshot.

## Details
- Waivers page now initializes from `localStorage` and writes back on create/edit/delete.
- Added export of all waivers as CSV and per-row email reminder triggers (stubbed).
- Implemented individual record download from both Waivers list and Waiver Preview.

## Known Limitations
- The download produces a simple text-based PDF stub for MVP; replace with a real PDF generator in future iterations.
- Scan dialog remains simulation-only; wiring to persisted waivers is planned.

## Next Steps
- Integrate Scan Waiver and Open Form routes with persisted data.
- Connect Games wizard waiver selection to templates stored in `localStorage`.
- Replace stubbed email sending with a real provider.
# Calendar Fix 0.1 — Release Notes

Date: 2025-11-06

## Highlights
- Reverted Calendar Booking Widget to previous design (removed shared Calendar usage).
- Reverted Calendar Single Event / Room Booking Page to previous design.
- Set dashboard preview default to Calendar Single Event layout.
- Confirmed game editing wizard maps `calendar-single-event` → `singlegame` for embeds.

## Details
- `src/components/widgets/CalendarWidget.tsx` restored from prior design (commit `e40a2c28`).
- `src/components/widgets/CalendarSingleEventBookingPage.tsx` restored from prior design (commit `43ad6314`).
- `src/pages/BookingWidgets.tsx` now initializes `selectedTemplate` to `singlegame` so editors see the reverted calendar by default when previewing.
- `src/components/games/AddGameWizard.tsx` default `selectedWidget: 'calendar-single-event'` remains, mapped to the same `singlegame` preview.

## Next Steps
- Roll this default into production embeds if desired (set embed default to `singlegame`).
- Monitor UI feedback and iterate on styling under the "Calendar Fix" track.

---
