-- Add missing columns to bookings table required by RPC

ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS booking_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS final_amount NUMERIC(10, 2);

CREATE INDEX IF NOT EXISTS idx_bookings_number ON bookings(booking_number);
