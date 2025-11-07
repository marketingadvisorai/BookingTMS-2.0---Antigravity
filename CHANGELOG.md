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
