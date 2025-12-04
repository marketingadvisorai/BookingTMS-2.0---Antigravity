/**
 * Waivers Module - Type Definitions
 * @module waivers/types
 * @version 1.0.0
 */

// ============================================================================
// Template Types
// ============================================================================

export type TemplateType = 'liability' | 'minor' | 'photo' | 'medical' | 'health' | 'custom';
export type TemplateStatus = 'active' | 'inactive' | 'draft';

export interface QRCodeSettings {
  includeInEmail: boolean;
  includeBookingLink: boolean;
  customMessage: string;
}

export interface WaiverTemplate {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  type: TemplateType;
  content: string;
  status: TemplateStatus;
  requiredFields: string[];
  assignedActivities: string[];
  usageCount: number;
  qrCodeEnabled: boolean;
  qrCodeSettings: QRCodeSettings;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DBWaiverTemplate {
  id: string;
  organization_id: string;
  name: string;
  description: string;
  type: TemplateType;
  content: string;
  status: TemplateStatus;
  required_fields: string[];
  assigned_activities: string[];
  usage_count: number;
  qr_code_enabled: boolean;
  qr_code_settings: QRCodeSettings;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Waiver Record Types
// ============================================================================

export type WaiverStatus = 'signed' | 'pending' | 'expired' | 'revoked';
export type SignatureType = 'electronic' | 'digital';
export type CheckInMethod = 'qr_scan' | 'manual' | 'camera' | 'upload';

export interface WaiverRecord {
  id: string;
  waiverCode: string;
  templateId: string;
  templateName: string;
  templateType: TemplateType;
  bookingId?: string;
  customerId?: string;
  
  // Participant info
  participantName: string;
  participantEmail: string;
  participantPhone?: string;
  participantDob?: string;
  participantAge?: number;
  isMinor: boolean;
  
  // Guardian info (for minors)
  guardianName?: string;
  guardianEmail?: string;
  guardianPhone?: string;
  
  // Signature
  signatureType: SignatureType;
  signatureData: string;
  signedAt?: string;
  signedIp?: string;
  
  // Status
  status: WaiverStatus;
  expiresAt?: string;
  checkInCount: number;
  lastCheckIn?: string;
  
  // Activity info (denormalized for display)
  activityName?: string;
  venueName?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface DBWaiverRecord {
  id: string;
  waiver_code: string;
  template_id: string;
  template_name: string;
  template_type: TemplateType;
  booking_id?: string;
  customer_id?: string;
  participant_name: string;
  participant_email: string;
  participant_phone?: string;
  participant_dob?: string;
  participant_age?: number;
  is_minor: boolean;
  guardian_name?: string;
  guardian_email?: string;
  guardian_phone?: string;
  signature_type: SignatureType;
  signature_data: string;
  signed_at?: string;
  signed_ip?: string;
  status: WaiverStatus;
  expires_at?: string;
  check_in_count: number;
  last_check_in?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Check-In Types
// ============================================================================

export interface WaiverCheckIn {
  id: string;
  waiverId: string;
  bookingId?: string;
  checkedInBy: string;
  checkInMethod: CheckInMethod;
  verified: boolean;
  verificationNotes?: string;
  checkedInAt: string;
}

// ============================================================================
// Form Types
// ============================================================================

export interface WaiverFormData {
  templateId: string;
  bookingId?: string;
  participantName: string;
  participantEmail: string;
  participantPhone?: string;
  participantDob?: string;
  isMinor: boolean;
  guardianName?: string;
  guardianEmail?: string;
  guardianPhone?: string;
  signatureData: string;
  agreedToTerms: boolean;
}

// ============================================================================
// Filter & Stats Types
// ============================================================================

export interface WaiverFilters {
  search: string;
  status: 'all' | WaiverStatus;
  templateId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface WaiverStats {
  total: number;
  signed: number;
  pending: number;
  expired: number;
  thisMonth: number;
  signedThisWeek: number;
}

export interface TemplateStats {
  total: number;
  active: number;
  draft: number;
  inactive: number;
}

// ============================================================================
// Constants
// ============================================================================

export const TEMPLATE_TYPES: { value: TemplateType; label: string; icon: string }[] = [
  { value: 'liability', label: 'Liability Waiver', icon: '⚖️' },
  { value: 'minor', label: 'Minor Consent', icon: '👶' },
  { value: 'photo', label: 'Photo/Video Release', icon: '📸' },
  { value: 'medical', label: 'Medical Disclosure', icon: '🏥' },
  { value: 'health', label: 'Health Screening', icon: '🩺' },
  { value: 'custom', label: 'Custom', icon: '✏️' },
];

export const REQUIRED_FIELD_OPTIONS = [
  'Full Name',
  'Date of Birth',
  'Email',
  'Phone',
  'Address',
  'Emergency Contact',
  'Parent/Guardian Name',
  'Parent Email',
  'Parent Phone',
  'Medical Conditions',
  'Allergies',
  'Medications',
  'Signature',
  'Date',
];

export const DEFAULT_QR_SETTINGS: QRCodeSettings = {
  includeInEmail: true,
  includeBookingLink: true,
  customMessage: 'Scan this QR code to complete your waiver',
};

export const DEFAULT_TEMPLATE: Partial<WaiverTemplate> = {
  type: 'liability',
  status: 'draft',
  requiredFields: ['Full Name', 'Email', 'Signature'],
  assignedActivities: [],
  qrCodeEnabled: true,
  qrCodeSettings: DEFAULT_QR_SETTINGS,
  usageCount: 0,
};
