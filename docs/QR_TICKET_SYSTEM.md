# QR Ticket System

> Version: v0.1.62
> Date: 2025-11-30
> Status: ✅ Complete

## Overview

The QR Ticket System provides a modern, contactless check-in experience for bookings. Customers receive a QR code with their booking confirmation email that can be scanned by staff at the venue for instant check-in/check-out.

## Features

- **QR Code Generation**: Secure QR codes with HMAC signature validation
- **Camera Scanner**: Real-time QR scanning using device camera
- **Check-in/Check-out**: Single scan for check-in, option to check-out
- **Email Integration**: QR code embedded in booking confirmation emails
- **Admin Dashboard**: Scanner accessible from Bookings page

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  QR Code        │     │  Scanner         │     │  Edge Function  │
│  Generation     │────▶│  Component       │────▶│  qr-checkin     │
│  (qrService)    │     │  (QRScanner)     │     │                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                                                │
        ▼                                                ▼
┌─────────────────┐                            ┌─────────────────┐
│  Email Service  │                            │  Supabase DB    │
│  (send-email)   │                            │  (bookings)     │
└─────────────────┘                            └─────────────────┘
```

## File Structure

```
src/lib/qr/
├── index.ts                    # Barrel export
├── types.ts                    # QR system types
└── qrService.ts                # QR generation & validation

src/components/qr/
├── index.ts                    # Barrel export
├── QRCodeDisplay.tsx           # QR code display component
└── QRScanner.tsx               # Camera scanner component

src/features/bookings/components/
└── QRScannerDialog.tsx         # Scanner dialog for Bookings page

src/lib/email/
├── index.ts                    # Barrel export
├── bookingEmailTemplate.ts     # HTML email with QR code
└── sendBookingConfirmation.ts  # Send confirmation email

supabase/functions/
└── qr-checkin/index.ts         # Check-in edge function
```

## QR Code Payload

```typescript
interface QRCodePayload {
  bookingId: string;           // Unique booking ID
  confirmationCode: string;    // BK-XXXXX format
  email: string;               // Customer email
  date: string;                // YYYY-MM-DD
  time: string;                // HH:MM
  activityName: string;        // Activity name
  venueName: string;           // Venue name
  groupSize: number;           // Number of guests
  signature: string;           // HMAC-SHA256 signature
  generatedAt: string;         // ISO timestamp
}
```

## Security

### HMAC Signature
- Generated using SHA-256 hash
- Signs: `bookingId:confirmationCode:email:date`
- Validates QR codes haven't been tampered with
- Secret key stored in environment variables

### Validation Flow
1. Scan QR code → Parse JSON payload
2. Extract signature from payload
3. Regenerate signature from booking data
4. Compare signatures
5. If valid, proceed with check-in

## Usage

### Scanning QR Codes (Admin)

1. Navigate to **Bookings** page
2. Click **Scan QR** button in header
3. Allow camera access when prompted
4. Point camera at customer's QR code
5. On successful scan:
   - Check-in automatically processed
   - Booking details displayed
   - Option to check-out if already checked in

### Generating QR Codes

```typescript
import { generateBookingQR } from '../lib/qr';

const result = await generateBookingQR('booking-uuid');
if (result.success) {
  // result.dataUrl contains the QR code image
  // result.payload contains the encoded data
}
```

### Sending Confirmation Email

```typescript
import { sendBookingConfirmationEmail } from '../lib/email';

await sendBookingConfirmationEmail({
  bookingId: 'booking-uuid',
  customerEmail: 'customer@example.com',
  customerName: 'John Doe',
  confirmationCode: 'BK-12345',
  activityName: 'Escape Room',
  venueName: 'Adventure Center',
  date: '2025-12-01',
  time: '14:00',
  groupSize: 4,
  totalAmount: 120.00,
});
```

## Edge Function: qr-checkin

### Request
```json
{
  "bookingId": "uuid",
  "signature": "hmac-signature",
  "action": "check_in" | "check_out",
  "scannedBy": "user-id (optional)"
}
```

### Response (Success)
```json
{
  "success": true,
  "message": "Check-in successful!",
  "booking": {
    "id": "uuid",
    "confirmationCode": "BK-12345",
    "customer": "John Doe",
    "activityName": "Escape Room",
    "date": "2025-12-01",
    "time": "14:00",
    "groupSize": 4,
    "checkInTime": "2025-12-01T14:05:00Z",
    "status": "checked_in"
  }
}
```

### Response (Already Checked In)
```json
{
  "success": false,
  "error": "Already checked in",
  "alreadyCheckedIn": true,
  "booking": { ... }
}
```

## Database Updates

When a QR code is scanned:

### Check-in
```sql
UPDATE bookings
SET 
  check_in_time = NOW(),
  status = 'checked_in',
  metadata = metadata || '{"check_in_method": "qr_code"}'
WHERE id = $bookingId;
```

### Check-out
```sql
UPDATE bookings
SET 
  check_out_time = NOW(),
  status = 'completed',
  metadata = metadata || '{"check_out_method": "qr_code"}'
WHERE id = $bookingId;
```

## Dependencies

- `qrcode` - QR code generation (npm)
- `html5-qrcode` - Camera-based scanning (npm)
- `crypto.subtle` - HMAC signature generation (Web Crypto API)

## Environment Variables

```env
# Required for signature validation
QR_SECRET=your-secure-secret-key
VITE_QR_SECRET=your-secure-secret-key
```

## Testing

### Manual Test Flow
1. Create a booking with a confirmed status
2. Open Bookings page → Click "Scan QR"
3. Generate a test QR from booking details
4. Scan the QR code
5. Verify check-in status updates
6. Scan again to check-out

### Test Cards for Stripe
When testing end-to-end with payments:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

## Future Enhancements

- [ ] Add QR code to customer portal
- [ ] Offline mode with sync
- [ ] Multiple device sync for busy venues
- [ ] Analytics for check-in times
- [ ] Integration with venue access control systems
