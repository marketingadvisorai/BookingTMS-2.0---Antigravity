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
