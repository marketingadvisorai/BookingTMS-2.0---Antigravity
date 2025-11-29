/**
 * Booking Email Templates
 * 
 * HTML email templates for booking confirmations with QR code.
 * @module lib/email/bookingEmailTemplate
 */

export interface BookingEmailData {
  customerName: string;
  confirmationCode: string;
  activityName: string;
  venueName: string;
  date: string;
  time: string;
  groupSize: number;
  totalAmount: number;
  currency?: string;
  qrCodeDataUrl: string;
  venueAddress?: string;
  specialInstructions?: string;
}

/**
 * Generate booking confirmation email HTML with QR code
 */
export function generateBookingConfirmationEmail(data: BookingEmailData): string {
  const {
    customerName,
    confirmationCode,
    activityName,
    venueName,
    date,
    time,
    groupSize,
    totalAmount,
    currency = 'USD',
    qrCodeDataUrl,
    venueAddress,
    specialInstructions,
  } = data;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation - ${confirmationCode}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">
          🎉 Booking Confirmed!
        </h1>
        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 16px;">
          Your adventure awaits
        </p>
      </td>
    </tr>

    <!-- QR Code Section -->
    <tr>
      <td style="padding: 32px; text-align: center; background-color: #fafafa;">
        <p style="margin: 0 0 16px; color: #6b7280; font-size: 14px;">
          Present this QR code at check-in
        </p>
        <div style="background: #ffffff; padding: 16px; border-radius: 12px; display: inline-block; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <img src="${qrCodeDataUrl}" alt="Check-in QR Code" width="180" height="180" style="display: block;" />
        </div>
        <p style="margin: 16px 0 0; font-family: monospace; font-size: 18px; color: #1f2937; font-weight: 600;">
          ${confirmationCode}
        </p>
      </td>
    </tr>

    <!-- Booking Details -->
    <tr>
      <td style="padding: 32px;">
        <h2 style="margin: 0 0 24px; color: #1f2937; font-size: 18px; font-weight: 600;">
          Booking Details
        </h2>

        <table cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
              <span style="color: #6b7280; font-size: 14px;">Guest Name</span><br />
              <span style="color: #1f2937; font-size: 16px; font-weight: 500;">${customerName}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
              <span style="color: #6b7280; font-size: 14px;">Activity</span><br />
              <span style="color: #1f2937; font-size: 16px; font-weight: 500;">${activityName}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
              <span style="color: #6b7280; font-size: 14px;">Venue</span><br />
              <span style="color: #1f2937; font-size: 16px; font-weight: 500;">${venueName}</span>
              ${venueAddress ? `<br /><span style="color: #6b7280; font-size: 14px;">${venueAddress}</span>` : ''}
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td width="50%">
                    <span style="color: #6b7280; font-size: 14px;">Date</span><br />
                    <span style="color: #1f2937; font-size: 16px; font-weight: 500;">📅 ${date}</span>
                  </td>
                  <td width="50%">
                    <span style="color: #6b7280; font-size: 14px;">Time</span><br />
                    <span style="color: #1f2937; font-size: 16px; font-weight: 500;">🕐 ${time}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td width="50%">
                    <span style="color: #6b7280; font-size: 14px;">Group Size</span><br />
                    <span style="color: #1f2937; font-size: 16px; font-weight: 500;">👥 ${groupSize} ${groupSize === 1 ? 'guest' : 'guests'}</span>
                  </td>
                  <td width="50%">
                    <span style="color: #6b7280; font-size: 14px;">Total Paid</span><br />
                    <span style="color: #059669; font-size: 16px; font-weight: 600;">$${totalAmount.toFixed(2)} ${currency}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        ${specialInstructions ? `
        <div style="margin-top: 24px; padding: 16px; background-color: #fef3c7; border-radius: 8px;">
          <p style="margin: 0; color: #92400e; font-size: 14px;">
            <strong>⚠️ Important:</strong> ${specialInstructions}
          </p>
        </div>
        ` : ''}
      </td>
    </tr>

    <!-- What to Expect -->
    <tr>
      <td style="padding: 0 32px 32px;">
        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px;">
          <h3 style="margin: 0 0 12px; color: #1e40af; font-size: 16px; font-weight: 600;">
            📋 What to Bring
          </h3>
          <ul style="margin: 0; padding: 0 0 0 20px; color: #1e40af; font-size: 14px;">
            <li style="margin-bottom: 8px;">This confirmation email or the QR code</li>
            <li style="margin-bottom: 8px;">Photo ID (for verification)</li>
            <li>Comfortable clothing and closed-toe shoes</li>
          </ul>
        </div>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding: 24px 32px; background-color: #f9fafb; text-align: center;">
        <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
          Need to make changes?
        </p>
        <p style="margin: 0 0 16px; color: #6b7280; font-size: 14px;">
          Visit our customer portal or contact us at support@yourdomain.com
        </p>
        <p style="margin: 0; color: #9ca3af; font-size: 12px;">
          © ${new Date().getFullYear()} BookingTMS. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generate plain text version of booking confirmation
 */
export function generateBookingConfirmationText(data: BookingEmailData): string {
  const {
    customerName,
    confirmationCode,
    activityName,
    venueName,
    date,
    time,
    groupSize,
    totalAmount,
    currency = 'USD',
    venueAddress,
  } = data;

  return `
BOOKING CONFIRMED! 🎉
====================

Confirmation Code: ${confirmationCode}

BOOKING DETAILS
--------------
Guest Name: ${customerName}
Activity: ${activityName}
Venue: ${venueName}${venueAddress ? `\nAddress: ${venueAddress}` : ''}
Date: ${date}
Time: ${time}
Group Size: ${groupSize} ${groupSize === 1 ? 'guest' : 'guests'}
Total Paid: $${totalAmount.toFixed(2)} ${currency}

WHAT TO BRING
-------------
- This confirmation email
- Photo ID (for verification)
- Comfortable clothing and closed-toe shoes

Need to make changes? Visit our customer portal or contact us at support@yourdomain.com

© ${new Date().getFullYear()} BookingTMS
  `.trim();
}
