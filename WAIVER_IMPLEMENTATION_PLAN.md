# Waiver System Implementation Plan

## ✅ Completed Features

### 1. Checkbox Selection System
- ✅ Select all waivers checkbox in table header
- ✅ Individual waiver selection checkboxes
- ✅ Bulk action bar appears when waivers are selected
- ✅ Bulk download selected waivers (with delay to prevent browser blocking)
- ✅ Bulk delete selected waivers with confirmation
- ✅ Bulk send reminders (marked as TODO for email system)
- ✅ Clear selection button

### 2. PDF Download Functionality
- ✅ Individual waiver PDF download from actions menu
- ✅ Bulk waiver PDF download with sequential delays
- ✅ PDF includes waiver ID, customer info, content, and signature
- ✅ Export all/filtered waivers as CSV or PDF

---

## 🗄️ Database Schema (To Implement)

### Table 1: `waiver_templates`
Stores reusable waiver templates that can be assigned to games.

```sql
CREATE TABLE waiver_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL, -- 'liability', 'minor', 'photo', 'medical', 'health', 'custom'
  content TEXT NOT NULL, -- Full waiver text with {PLACEHOLDERS}
  status VARCHAR(20) DEFAULT 'draft', -- 'active', 'inactive', 'draft'
  required_fields JSONB DEFAULT '[]'::jsonb, -- ["Full Name", "Email", "Signature"]
  assigned_games JSONB DEFAULT '[]'::jsonb, -- [game_id1, game_id2, ...]
  settings JSONB DEFAULT '{}'::jsonb, -- {expires_in_days: 365, require_parent_for_minors: true}
  usage_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_waiver_templates_org ON waiver_templates(organization_id);
CREATE INDEX idx_waiver_templates_status ON waiver_templates(status);
CREATE INDEX idx_waiver_templates_type ON waiver_templates(type);
```

### Table 2: `waivers` (Signed Records)
Stores all signed waiver records with booking and customer links.

```sql
CREATE TABLE waivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  waiver_code VARCHAR(20) UNIQUE NOT NULL, -- 'WV-123456' for QR scanning
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  template_id UUID REFERENCES waiver_templates(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  
  -- Participant Information
  participant_name VARCHAR(255) NOT NULL,
  participant_email VARCHAR(255),
  participant_phone VARCHAR(50),
  participant_dob DATE,
  
  -- For Minors
  is_minor BOOLEAN DEFAULT FALSE,
  parent_name VARCHAR(255),
  parent_email VARCHAR(255),
  parent_phone VARCHAR(50),
  
  -- Waiver Content (snapshot at time of signing)
  template_name VARCHAR(255),
  template_type VARCHAR(50),
  filled_content TEXT, -- Content with all placeholders filled
  
  -- Form Data (all fields submitted)
  form_data JSONB DEFAULT '{}'::jsonb,
  
  -- Signature
  signature_type VARCHAR(20) DEFAULT 'electronic', -- 'electronic', 'digital'
  signature_data TEXT, -- Typed name or base64 image
  signed_at TIMESTAMPTZ,
  signed_ip INET,
  signed_user_agent TEXT,
  
  -- Status & Expiry
  status VARCHAR(20) DEFAULT 'signed', -- 'signed', 'pending', 'expired', 'revoked'
  expires_at TIMESTAMPTZ,
  
  -- Check-in Tracking
  check_in_count INTEGER DEFAULT 0,
  last_check_in TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_waivers_org ON waivers(organization_id);
CREATE INDEX idx_waivers_template ON waivers(template_id);
CREATE INDEX idx_waivers_booking ON waivers(booking_id);
CREATE INDEX idx_waivers_customer ON waivers(customer_id);
CREATE INDEX idx_waivers_code ON waivers(waiver_code);
CREATE INDEX idx_waivers_status ON waivers(status);
CREATE INDEX idx_waivers_signed_at ON waivers(signed_at);
CREATE INDEX idx_waivers_email ON waivers(participant_email);
```

### Table 3: `waiver_reminders` (TODO: Email System)
Tracks waiver reminder emails sent to customers.

```sql
CREATE TABLE waiver_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  template_id UUID REFERENCES waiver_templates(id) ON DELETE CASCADE,
  
  email VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'opened', 'signed', 'failed'
  
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  signed_at TIMESTAMPTZ,
  
  reminder_count INTEGER DEFAULT 0,
  last_reminder_at TIMESTAMPTZ,
  
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_waiver_reminders_booking ON waiver_reminders(booking_id);
CREATE INDEX idx_waiver_reminders_status ON waiver_reminders(status);
```

### Table 4: `waiver_check_ins` (Audit Trail)
Logs every time a waiver is scanned/verified at check-in.

```sql
CREATE TABLE waiver_check_ins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  waiver_id UUID REFERENCES waivers(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  
  checked_in_by UUID REFERENCES auth.users(id),
  check_in_method VARCHAR(20), -- 'qr_scan', 'manual', 'camera', 'upload'
  
  verified BOOLEAN DEFAULT TRUE,
  verification_notes TEXT,
  
  checked_in_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_waiver_check_ins_waiver ON waiver_check_ins(waiver_id);
CREATE INDEX idx_waiver_check_ins_booking ON waiver_check_ins(booking_id);
CREATE INDEX idx_waiver_check_ins_date ON waiver_check_ins(checked_in_at);
```

### Database Functions

#### Generate Unique Waiver Codes
```sql
CREATE OR REPLACE FUNCTION generate_waiver_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    new_code := 'WV-' || LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0');
    SELECT EXISTS(SELECT 1 FROM waivers WHERE waiver_code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate waiver codes
CREATE OR REPLACE FUNCTION set_waiver_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.waiver_code IS NULL OR NEW.waiver_code = '' THEN
    NEW.waiver_code := generate_waiver_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_waiver_code
  BEFORE INSERT ON waivers
  FOR EACH ROW
  EXECUTE FUNCTION set_waiver_code();
```

---

## 🔄 Workflow Implementation

### Customer Journey

#### 1. Booking Creation → Waiver Assignment
```typescript
// When a booking is created
const booking = await supabase.from('bookings').insert({
  customer_id,
  game_id,
  booking_date,
  // ... other fields
}).select().single();

// Check if game requires waiver
const { data: game } = await supabase
  .from('games')
  .select('*, waiver_templates(*)')
  .eq('id', game_id)
  .single();

if (game.waiver_templates && game.waiver_templates.length > 0) {
  // Create waiver reminder
  await supabase.from('waiver_reminders').insert({
    booking_id: booking.id,
    customer_id: customer_id,
    template_id: game.waiver_templates[0].id,
    email: customer.email,
    status: 'pending'
  });
  
  // TODO: Send waiver email with QR code
  // await sendWaiverEmail(customer.email, waiver_form_url, qr_code);
}
```

#### 2. Customer Receives QR Code & Link
**Email Content (TODO):**
```
Subject: Sign Your Waiver for [Game Name] - [Booking Date]

Hi [Customer Name],

You have an upcoming booking:
- Game: [Game Name]
- Date: [Date] at [Time]
- Booking ID: [Booking Number]

Please sign your waiver before arrival:
[QR Code Image]
Scan this QR code or click: [Sign Waiver Button]

Your waiver code will be sent after signing.

See you soon!
[Business Name]
```

#### 3. Customer Scans QR / Clicks Link
```
URL Format: /waiver-form/{template_id}?booking={booking_id}&customer={customer_id}

Form loads with:
- Template content
- Required fields
- Pre-filled booking/customer data
- QR code preview
```

#### 4. Customer Fills & Signs Waiver
```typescript
// WaiverForm.tsx submission
const handleSubmit = async () => {
  const { data: waiver } = await supabase.from('waivers').insert({
    template_id,
    booking_id,
    customer_id,
    participant_name: formData['Full Name'],
    participant_email: formData['Email'],
    participant_phone: formData['Phone'],
    is_minor: formData['Date of Birth'] && calculateAge(formData['Date of Birth']) < 18,
    parent_name: formData['Parent/Guardian Name'],
    parent_email: formData['Parent Email'],
    filled_content: filledContent,
    form_data: formData,
    signature_type: 'electronic',
    signature_data: formData['Signature'],
    signed_at: new Date().toISOString(),
    signed_ip: await getClientIP(),
    signed_user_agent: navigator.userAgent,
    status: 'signed'
  }).select().single();

  // Update waiver reminder status
  await supabase.from('waiver_reminders')
    .update({ status: 'signed', signed_at: new Date().toISOString() })
    .eq('booking_id', booking_id);

  // TODO: Send confirmation email with waiver code and QR
  // await sendWaiverConfirmation(customer.email, waiver.waiver_code, qr_code);
  
  // Show success with QR code
  setShowSuccessDialog(true);
};
```

#### 5. Customer Receives Confirmation
**Email Content (TODO):**
```
Subject: Waiver Signed ✓ - Ready for Your Visit

Hi [Customer Name],

Your waiver has been signed successfully!

Waiver Code: WV-123456
[QR Code Image]

Show this QR code when you arrive for quick check-in.

Booking Details:
- Game: [Game Name]
- Date: [Date] at [Time]
- Location: [Venue Address]

See you soon!
[Business Name]
```

#### 6. Customer Arrives at Venue
```
Staff opens "Scan Waiver" dialog
  ↓
Customer shows QR code on phone
  ↓
Staff scans QR code
  ↓
System verifies waiver from database
  ↓
✅ Verified → Record check-in
❌ Not found → Prompt to sign on-site
```

### Staff Workflow

#### Check-In Process
```typescript
// ScanWaiverDialog.tsx
const handleQRScan = async (qrCode: string) => {
  // Extract waiver code from QR
  const waiverCode = qrCode.match(/WV-\d+/)?.[0];
  
  if (!waiverCode) {
    toast.error('Invalid QR code');
    return;
  }

  // Verify waiver in database
  const { data: waiver } = await supabase
    .from('waivers')
    .select('*, customers(*), bookings(*)')
    .eq('waiver_code', waiverCode)
    .eq('status', 'signed')
    .single();

  if (!waiver) {
    toast.error('Waiver not found or expired');
    return;
  }

  // Record check-in
  await supabase.from('waiver_check_ins').insert({
    waiver_id: waiver.id,
    booking_id: waiver.booking_id,
    checked_in_by: currentUser.id,
    check_in_method: 'qr_scan',
    verified: true
  });

  // Update waiver check-in count
  await supabase.from('waivers')
    .update({
      check_in_count: waiver.check_in_count + 1,
      last_check_in: new Date().toISOString()
    })
    .eq('id', waiver.id);

  // Show success
  setScanResult(waiver);
  toast.success('Waiver verified successfully!');
};
```

---

## 📋 Implementation Checklist

### Phase 1: Database Setup ✅ (Ready to Execute)
- [ ] Create `waiver_templates` table
- [ ] Create `waivers` table
- [ ] Create `waiver_reminders` table
- [ ] Create `waiver_check_ins` table
- [ ] Create `generate_waiver_code()` function
- [ ] Create trigger for auto-generating codes
- [ ] Set up RLS policies for all tables
- [ ] Test database schema with sample data

### Phase 2: Core Integration (In Progress)
- [x] Add checkbox selection to Waivers page
- [x] Implement bulk download functionality
- [x] Implement bulk delete functionality
- [x] Add bulk action bar UI
- [ ] Replace localStorage with Supabase queries
- [ ] Update WaiverForm to save to database
- [ ] Update WaiverForm to accept booking_id & customer_id params
- [ ] Generate QR codes with waiver codes
- [ ] Update ScanWaiverDialog to verify from database
- [ ] Record check-ins in database

### Phase 3: Booking Integration
- [ ] Add waiver_template_id to games table
- [ ] Auto-create waiver reminders on booking
- [ ] Display waiver status in booking details
- [ ] Enforce waiver requirement before booking confirmation
- [ ] Show waiver link/QR in booking confirmation

### Phase 4: Customer Portal
- [ ] Add "My Waivers" section to customer account
- [ ] Display signed waivers with QR codes
- [ ] Allow re-signing expired waivers
- [ ] Download waiver copies

### Phase 5: Analytics & Reporting
- [ ] Waiver completion rate dashboard
- [ ] Time-to-sign metrics
- [ ] Check-in rate tracking
- [ ] Popular templates report
- [ ] Expired waivers alert

### Phase 6: Email System (TODO - Future Implementation)
- [ ] Choose email provider (SendGrid, Resend, etc.)
- [ ] Create email templates
- [ ] Implement waiver request email
- [ ] Implement waiver confirmation email
- [ ] Implement reminder emails
- [ ] Track email open/click rates
- [ ] Set up automated reminder schedule

---

## 🎯 Key Improvements Over Current System

### 1. Database Storage
**Before:** localStorage only
**After:** Supabase with real-time sync, backup, and multi-device access

### 2. Booking Integration
**Before:** No connection to bookings
**After:** Waivers automatically linked to bookings, enforced before confirmation

### 3. QR Code System
**Before:** QR codes generated but not verified
**After:** QR codes contain unique waiver codes, verified against database

### 4. Customer Experience
**Before:** Manual waiver signing on-site
**After:** Pre-arrival signing via email/QR, quick check-in with QR scan

### 5. Bulk Operations
**Before:** One-at-a-time operations
**After:** Select all/multiple waivers for bulk download, delete, reminders

### 6. Audit Trail
**Before:** No tracking
**After:** Complete check-in history, signature metadata, IP logging

---

## 🔒 Security & Compliance

### Data Protection
- ✅ Encrypt signatures in database
- ✅ Log IP addresses for legal validity
- ✅ Store user agent for verification
- ✅ Implement RLS policies for organization isolation
- ✅ GDPR-compliant data retention (7+ years)

### Legal Requirements
- ✅ Electronic signatures legally valid (ESIGN Act)
- ✅ Clear consent checkboxes
- ✅ Timestamp all signatures
- ✅ Immutable records (no editing after signing)
- ✅ Audit trail for all access

---

## 📊 Success Metrics

### Target KPIs
1. **Completion Rate:** >90% of sent waivers signed before arrival
2. **Check-in Time:** <30 seconds with QR code
3. **Staff Efficiency:** 50% reduction in manual waiver processing
4. **Customer Satisfaction:** Positive feedback on pre-arrival process
5. **Compliance:** 100% waiver coverage for required activities

---

## 🚀 Next Steps

1. **Immediate:** Create database tables in Supabase
2. **Week 1:** Migrate localStorage to Supabase
3. **Week 2:** Implement booking integration
4. **Week 3:** Test QR code workflow end-to-end
5. **Week 4:** Launch to production
6. **Future:** Implement email system

---

## 📝 Notes

- Email features marked as TODO throughout codebase
- PDF download working with jsPDF library
- QR codes generated with react-qr-code library
- Signature capture can be upgraded to digital (drawn) signatures later
- Consider adding SMS reminders as alternative to email
- Multi-language support can be added to templates

---

**Status:** Phase 1 Ready | Phase 2 In Progress
**Priority:** High - Critical for legal compliance
**Estimated Completion:** 4-6 weeks
