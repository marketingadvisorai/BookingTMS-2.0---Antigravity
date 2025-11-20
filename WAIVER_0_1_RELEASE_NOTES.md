# Waiver v0.1.0 — Release Notes (Dedicated)

Date: 2025-11-06  
Tag: `v0.1.0-waivers`  
Scope: Waivers feature, Scan Waiver dialog, QR support

## Highlights
- Add “Show QR” mode with template selection and QR rendering.
- Live camera QR scanning using `@zxing/browser` (decodes waiver codes and links).
- Upload image QR decoding.
- Manual waiver code verification backed by `localStorage` records.
- Documentation updated (`README.md`, `CHANGELOG.md`).

## User‑Facing Changes
- Scan Waiver dialog now has four modes:
  - `Show QR`: pick a template, display a QR, copy/open link.
  - `Camera`: decode QR in real time and verify waiver codes.
  - `Upload`: decode QR from an image file.
  - `Manual`: verify a typed waiver code.
- Verification results display customer, waiver ID, booking/game context, and status.

## Dependencies
- `react-qr-code` `^2.0.18`
- `@zxing/browser` `^0.1.5`

## Storage Keys
- Waiver templates: `admin_waiver_templates`
- Waiver records: `admin_waivers`

Example waiver record schema (stored in `admin_waivers`):
```json
{
  "id": "WV-1001",
  "customer": "Sarah Johnson",
  "email": "sarah.j@email.com",
  "phone": "+1 (555) 123-4567",
  "booking": "BK-1001",
  "game": "Mystery Manor",
  "status": "signed",
  "signedDate": "Oct 29, 2025",
  "templateName": "Standard Liability Waiver"
}
```

## How It Works
- `Show QR` builds a waiver form URL using the selected template (from `admin_waiver_templates`) and renders a QR.
- `Camera`/`Upload` decode QR. If the payload is:
  - Waiver code (e.g., `WV-1001`): verifies against `admin_waivers` and shows the result.
  - URL: opens the link in a new tab.
- `Manual` verifies the entered code directly from `admin_waivers`.

## Testing
- Start dev server: `npm run dev`
- Navigate to Waivers and open “Scan Waiver”.
- Camera: click `Start Scanning`, present a QR with a code or link.
- Upload: choose an image containing a QR.
- Manual: enter a known code (e.g., `WV-1001`) and verify.

## Known Limitations
- Camera permissions and behavior vary by browser; iOS/Safari may require HTTPS.
- PDF exports use `jsPDF` and are basic; upgrade to a production PDF generator later.

## Files Updated in v0.1.0
- `src/components/waivers/ScanWaiverDialog.tsx`
- `package.json` (dependencies)
- `README.md`
- `CHANGELOG.md`

## Next Steps
- Deep link generation to include booking/game context when creating QR links.
- Persist scan/verification events with audit trail.
- Add email/SMS sending for waiver links to customers.

## Release Workflow
- GitHub Actions release uses `CHANGELOG.md` as the body. This file provides a dedicated, detailed companion for Waiver v0.1.0.
