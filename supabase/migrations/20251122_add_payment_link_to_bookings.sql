-- Add payment_link column to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_link TEXT;

COMMENT ON COLUMN bookings.payment_link IS 'Stripe Payment Link URL for pay-later bookings';
