/**
 * Waivers Module - Data Mappers
 * Converts between database (snake_case) and UI (camelCase) formats
 * @module waivers/utils/mappers
 */

import {
  WaiverTemplate,
  DBWaiverTemplate,
  WaiverRecord,
  DBWaiverRecord,
  DEFAULT_QR_SETTINGS,
} from '../types';

// ============================================================================
// Template Mappers
// ============================================================================

export function mapDBTemplateToUI(db: DBWaiverTemplate): WaiverTemplate {
  return {
    id: db.id,
    organizationId: db.organization_id,
    name: db.name,
    description: db.description || '',
    type: db.type,
    content: db.content || '',
    status: db.status,
    requiredFields: Array.isArray(db.required_fields) ? db.required_fields : [],
    assignedActivities: Array.isArray(db.assigned_activities) ? db.assigned_activities : [],
    usageCount: db.usage_count || 0,
    qrCodeEnabled: db.qr_code_enabled ?? true,
    qrCodeSettings: db.qr_code_settings || DEFAULT_QR_SETTINGS,
    createdBy: db.created_by,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}

export function mapUITemplateToDBInsert(
  ui: Partial<WaiverTemplate>,
  organizationId: string,
  createdBy?: string
): Partial<DBWaiverTemplate> {
  return {
    organization_id: organizationId,
    name: ui.name,
    description: ui.description,
    type: ui.type,
    content: ui.content,
    status: ui.status || 'draft',
    required_fields: ui.requiredFields || [],
    assigned_activities: ui.assignedActivities || [],
    qr_code_enabled: ui.qrCodeEnabled ?? true,
    qr_code_settings: ui.qrCodeSettings || DEFAULT_QR_SETTINGS,
    created_by: createdBy,
  };
}

export function mapUITemplateToDBUpdate(ui: Partial<WaiverTemplate>): Partial<DBWaiverTemplate> {
  const update: Partial<DBWaiverTemplate> = {};
  
  if (ui.name !== undefined) update.name = ui.name;
  if (ui.description !== undefined) update.description = ui.description;
  if (ui.type !== undefined) update.type = ui.type;
  if (ui.content !== undefined) update.content = ui.content;
  if (ui.status !== undefined) update.status = ui.status;
  if (ui.requiredFields !== undefined) update.required_fields = ui.requiredFields;
  if (ui.assignedActivities !== undefined) update.assigned_activities = ui.assignedActivities;
  if (ui.qrCodeEnabled !== undefined) update.qr_code_enabled = ui.qrCodeEnabled;
  if (ui.qrCodeSettings !== undefined) update.qr_code_settings = ui.qrCodeSettings;
  
  return update;
}

// ============================================================================
// Waiver Record Mappers
// ============================================================================

export function mapDBWaiverToUI(db: DBWaiverRecord): WaiverRecord {
  return {
    id: db.id,
    waiverCode: db.waiver_code,
    templateId: db.template_id,
    templateName: db.template_name,
    templateType: db.template_type,
    bookingId: db.booking_id,
    customerId: db.customer_id,
    participantName: db.participant_name,
    participantEmail: db.participant_email,
    participantPhone: db.participant_phone,
    participantDob: db.participant_dob,
    participantAge: db.participant_age,
    isMinor: db.is_minor || false,
    guardianName: db.guardian_name,
    guardianEmail: db.guardian_email,
    guardianPhone: db.guardian_phone,
    signatureType: db.signature_type || 'electronic',
    signatureData: db.signature_data,
    signedAt: db.signed_at,
    signedIp: db.signed_ip,
    status: db.status,
    expiresAt: db.expires_at,
    checkInCount: db.check_in_count || 0,
    lastCheckIn: db.last_check_in,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}

export function mapWaiverFormToDBInsert(
  form: {
    templateId: string;
    templateName: string;
    templateType: string;
    bookingId?: string;
    participantName: string;
    participantEmail: string;
    participantPhone?: string;
    participantDob?: string;
    isMinor?: boolean;
    guardianName?: string;
    guardianEmail?: string;
    guardianPhone?: string;
    signatureData: string;
    filledContent?: string;
    formData?: Record<string, any>;
    signedIp?: string;
  }
): Record<string, any> {
  return {
    template_id: form.templateId,
    template_name: form.templateName,
    template_type: form.templateType,
    booking_id: form.bookingId || null,
    participant_name: form.participantName,
    participant_email: form.participantEmail,
    participant_phone: form.participantPhone || null,
    participant_dob: form.participantDob || null,
    is_minor: form.isMinor || false,
    guardian_name: form.guardianName || null,
    guardian_email: form.guardianEmail || null,
    guardian_phone: form.guardianPhone || null,
    signature_type: 'electronic',
    signature_data: form.signatureData,
    signed_at: new Date().toISOString(),
    signed_ip: form.signedIp || null,
    status: 'signed',
    filled_content: form.filledContent || null,
    form_data: form.formData || {},
  };
}

// ============================================================================
// Display Helpers
// ============================================================================

export function formatDisplayDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
}

export function formatDisplayDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function getStatusColor(status: string, isDark: boolean): string {
  const colors: Record<string, { light: string; dark: string }> = {
    active: { light: 'bg-green-100 text-green-700', dark: 'bg-emerald-500/20 text-emerald-400' },
    signed: { light: 'bg-green-100 text-green-700', dark: 'bg-emerald-500/20 text-emerald-400' },
    pending: { light: 'bg-yellow-100 text-yellow-700', dark: 'bg-yellow-500/20 text-yellow-400' },
    draft: { light: 'bg-gray-100 text-gray-700', dark: 'bg-[#2a2a2a] text-[#a3a3a3]' },
    inactive: { light: 'bg-gray-100 text-gray-700', dark: 'bg-[#2a2a2a] text-[#a3a3a3]' },
    expired: { light: 'bg-red-100 text-red-700', dark: 'bg-red-500/20 text-red-400' },
    revoked: { light: 'bg-red-100 text-red-700', dark: 'bg-red-500/20 text-red-400' },
  };
  
  const color = colors[status] || colors.draft;
  return isDark ? color.dark : color.light;
}
