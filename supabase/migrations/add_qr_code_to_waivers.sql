-- Add QR code enable/disable field to waiver_templates table
ALTER TABLE waiver_templates 
ADD COLUMN IF NOT EXISTS qr_code_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS qr_code_settings JSONB DEFAULT '{
  "include_in_email": true,
  "include_booking_link": true,
  "custom_message": "Scan this QR code to complete your waiver"
}'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN waiver_templates.qr_code_enabled IS 'Enable/disable QR code generation for this waiver template';
COMMENT ON COLUMN waiver_templates.qr_code_settings IS 'Additional QR code settings (JSON)';

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_waiver_templates_qr_enabled 
ON waiver_templates(qr_code_enabled) 
WHERE qr_code_enabled = true;

-- Update existing templates to have QR codes enabled by default
UPDATE waiver_templates 
SET qr_code_enabled = true 
WHERE qr_code_enabled IS NULL;
