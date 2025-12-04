# Waivers Module Architecture

## Overview

The Waivers Module is a comprehensive digital waiver management system that handles waiver templates, customer signatures, QR code verification, and check-in tracking. It follows a modular, multi-tenant architecture with full real-time support.

**Version:** 1.0.0  
**Location:** `/src/modules/waivers/`  
**Migration:** `078_waivers_module_schema.sql`

---

## Entity Relationship Diagram (ERD)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              WAIVERS MODULE ERD                          │
└──────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐       ┌─────────────────────┐       ┌─────────────────┐
│  organizations  │       │   waiver_templates  │       │  signed_waivers │
├─────────────────┤       ├─────────────────────┤       ├─────────────────┤
│ id (PK)         │──┐    │ id (PK)             │──┐    │ id (PK)         │
│ name            │  │    │ organization_id (FK)│◀─┘    │ waiver_code     │
│ ...             │  │    │ name                │       │ template_id(FK) │◀─┐
└─────────────────┘  │    │ description         │       │ booking_id (FK) │  │
                     │    │ type                │       │ customer_id(FK) │  │
                     │    │ content             │       │ participant_*   │  │
                     │    │ status              │       │ guardian_*      │  │
                     │    │ required_fields[]   │       │ signature_*     │  │
                     │    │ qr_code_enabled     │       │ status          │  │
                     │    │ qr_code_settings    │       │ check_in_count  │  │
                     │    │ usage_count         │       │ ...             │  │
                     │    │ created_by          │       └────────┬────────┘  │
                     │    └─────────────────────┘                │           │
                     │                                           │           │
                     │                                           ▼           │
                     │                              ┌─────────────────────┐  │
                     │                              │  waiver_check_ins   │  │
                     │                              ├─────────────────────┤  │
                     │                              │ id (PK)             │  │
                     └──────────────────────────────│ waiver_id (FK)      │──┘
                                                    │ booking_id (FK)     │
                                                    │ checked_in_by       │
                                                    │ check_in_method     │
                                                    │ verified            │
                                                    │ checked_in_at       │
                                                    └─────────────────────┘

┌─────────────────┐       ┌─────────────────┐
│    bookings     │       │    customers    │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │◀──────│ id (PK)         │
│ customer_id(FK) │       │ name            │
│ activity_id(FK) │       │ email           │
│ ...             │       │ phone           │
└─────────────────┘       └─────────────────┘
```

---

## Database Schema

### 1. `waiver_templates` - Template Storage

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `organization_id` | UUID | FK to organizations (multi-tenant) |
| `name` | VARCHAR(255) | Template name |
| `description` | TEXT | Template description |
| `type` | VARCHAR(50) | liability, minor, photo, medical, health, custom |
| `content` | TEXT | Waiver text with {PLACEHOLDER} tokens |
| `status` | VARCHAR(20) | active, inactive, draft |
| `required_fields` | JSONB | Array of required field names |
| `assigned_activities` | JSONB | Array of activity IDs |
| `usage_count` | INTEGER | Number of signatures |
| `qr_code_enabled` | BOOLEAN | Enable QR code generation |
| `qr_code_settings` | JSONB | QR code configuration |
| `created_by` | UUID | FK to auth.users |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

### 2. `signed_waivers` - Signed Records

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `waiver_code` | VARCHAR(20) | Unique code (WV-XXXXXX) |
| `template_id` | UUID | FK to waiver_templates |
| `template_name` | VARCHAR(255) | Denormalized template name |
| `booking_id` | UUID | FK to bookings (optional) |
| `customer_id` | UUID | FK to customers (optional) |
| `participant_name` | VARCHAR(255) | Signer's name |
| `participant_email` | VARCHAR(255) | Signer's email |
| `participant_phone` | VARCHAR(50) | Signer's phone |
| `participant_dob` | DATE | Date of birth |
| `is_minor` | BOOLEAN | Is participant under 18 |
| `guardian_*` | Various | Guardian info for minors |
| `signature_type` | VARCHAR(20) | electronic or digital |
| `signature_data` | TEXT | Signature data |
| `signed_at` | TIMESTAMPTZ | Signature timestamp |
| `signed_ip` | INET | IP address |
| `status` | VARCHAR(20) | signed, pending, expired, revoked |
| `check_in_count` | INTEGER | Number of check-ins |
| `form_data` | JSONB | All submitted form fields |

### 3. `waiver_check_ins` - Audit Trail

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `waiver_id` | UUID | FK to signed_waivers |
| `booking_id` | UUID | FK to bookings |
| `checked_in_by` | UUID | FK to auth.users |
| `check_in_method` | VARCHAR(20) | qr_scan, manual, camera, upload |
| `verified` | BOOLEAN | Verification status |
| `verification_notes` | TEXT | Optional notes |
| `checked_in_at` | TIMESTAMPTZ | Check-in timestamp |

---

## Module Structure

```
/src/modules/waivers/
├── index.ts                          # Main barrel export
├── types/
│   └── index.ts                      # TypeScript interfaces (185 lines)
├── utils/
│   └── mappers.ts                    # DB ↔ UI mappers (160 lines)
├── services/
│   ├── index.ts                      # Service barrel export
│   ├── template.service.ts           # Template CRUD (195 lines)
│   └── waiver.service.ts             # Waiver CRUD (190 lines)
├── hooks/
│   └── useWaivers.ts                 # Main React hook (195 lines)
├── components/
│   ├── index.ts                      # Component barrel export
│   ├── WaiverStatsCards.tsx          # Stats display (70 lines)
│   ├── TemplateList.tsx              # Template grid (135 lines)
│   ├── WaiverTable.tsx               # Waiver table (180 lines)
│   └── TemplateEditorDialog.tsx      # Create/edit dialog (185 lines)
└── pages/
    └── WaiversPage.tsx               # Main page (175 lines)
```

**All files are under 200 lines** ✓

---

## Key Types

### WaiverTemplate

```typescript
interface WaiverTemplate {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  type: 'liability' | 'minor' | 'photo' | 'medical' | 'health' | 'custom';
  content: string;
  status: 'active' | 'inactive' | 'draft';
  requiredFields: string[];
  assignedActivities: string[];
  usageCount: number;
  qrCodeEnabled: boolean;
  qrCodeSettings: QRCodeSettings;
  createdAt: string;
  updatedAt: string;
}
```

### WaiverRecord

```typescript
interface WaiverRecord {
  id: string;
  waiverCode: string;
  templateId: string;
  templateName: string;
  participantName: string;
  participantEmail: string;
  isMinor: boolean;
  signatureType: 'electronic' | 'digital';
  signatureData: string;
  signedAt?: string;
  status: 'signed' | 'pending' | 'expired' | 'revoked';
  checkInCount: number;
}
```

---

## Usage

### Using the Hook

```typescript
import { useWaivers } from '@/modules/waivers';

function WaiversAdmin() {
  const {
    templates,
    waivers,
    templateStats,
    waiverStats,
    loading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    verifyWaiverCode,
    recordCheckIn,
    filters,
    setFilters,
  } = useWaivers({ organizationId: 'org-123' });

  // Create a template
  await createTemplate({
    name: 'Standard Waiver',
    type: 'liability',
    content: 'I, {FULL_NAME}, agree to...',
    requiredFields: ['Full Name', 'Email', 'Signature'],
  });

  // Verify a waiver code
  const waiver = await verifyWaiverCode('WV-123456');
  if (waiver) {
    await recordCheckIn(waiver.id, 'qr_scan');
  }
}
```

### Using Services Directly

```typescript
import { templateService, waiverService } from '@/modules/waivers';

// List templates
const templates = await templateService.list({
  organizationId: 'org-123',
  status: 'active',
});

// Create a waiver
const waiver = await waiverService.create({
  templateId: 'template-123',
  templateName: 'Standard Waiver',
  templateType: 'liability',
  participantName: 'John Doe',
  participantEmail: 'john@example.com',
  signatureData: 'base64-signature',
});
```

### Using Components

```tsx
import {
  WaiversPage,
  WaiverStatsCards,
  TemplateList,
  WaiverTable,
} from '@/modules/waivers';

// Full page
<WaiversPage />

// Individual components
<WaiverStatsCards
  waiverStats={waiverStats}
  templateStats={templateStats}
  isDark={isDark}
/>
```

---

## Security

### RLS Policies

| Table | Policy | Access |
|-------|--------|--------|
| `waiver_templates` | Organization isolation | Authenticated users see own org |
| `signed_waivers` | Public read | Anyone can verify waiver codes |
| `signed_waivers` | Public insert | Anyone can submit waivers |
| `waiver_check_ins` | Authenticated only | Staff can record check-ins |

### Multi-Tenant Isolation

- All template queries filter by `organization_id`
- System admins can access all organizations
- Waivers are linked to templates, providing org isolation

---

## Real-Time Support

Both `waiver_templates` and `signed_waivers` tables are added to the Supabase real-time publication. The `useWaivers` hook subscribes to changes with a 500ms debounce to prevent excessive updates.

---

## Waiver Flow

```
1. TEMPLATE CREATION
   Admin → Create Template → Set Fields → Activate
   
2. CUSTOMER SIGNING
   Customer → Opens Form Link/QR → Fills Fields → Signs → Submit
   
3. VERIFICATION
   Staff → Scans QR Code → System Verifies → Check-In Recorded
   
4. REPORTING
   Admin → View Waivers → Filter by Status/Date → Export
```

---

## QR Code Integration

Templates with `qrCodeEnabled: true` generate QR codes that:
- Link to `/waiver-form/{template_id}`
- Can be included in booking confirmation emails
- Support custom messages
- Work with camera scanning for check-in

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-04 | Initial modular architecture |

---

## Related Documentation

- [Multi-Tenant Auth Architecture](./MULTI_TENANT_AUTH_ARCHITECTURE.md)
- [Booking Widget Architecture](./BOOKING_WIDGET_ARCHITECTURE.md)
- [Code Style Guide](./code-style-guides.md)
