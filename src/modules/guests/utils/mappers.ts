/**
 * Guest/Customer Mappers
 * Converts between database and UI formats
 */

import type {
  DBCustomer,
  Customer,
  CustomerCreateInput,
  CustomerMetadata,
  LifecycleStage,
  SpendingTier,
  FrequencyTier,
} from '../types';

// =============================================================================
// TIER CALCULATION HELPERS
// =============================================================================

/**
 * Calculate lifecycle stage based on last booking date
 */
export function calculateLifecycleStage(metadata: CustomerMetadata): LifecycleStage {
  if (metadata.lifecycle_stage) return metadata.lifecycle_stage;
  if (metadata.is_new) return 'new';
  
  const daysSinceLastVisit = metadata.days_since_last_visit ?? 999;
  
  if (daysSinceLastVisit <= 30) return 'active';
  if (daysSinceLastVisit <= 90) return 'at-risk';
  return 'churned';
}

/**
 * Calculate spending tier based on total spent
 */
export function calculateSpendingTier(totalSpent: number, metadata: CustomerMetadata): SpendingTier {
  if (metadata.spending_tier) return metadata.spending_tier;
  
  if (totalSpent >= 1000) return 'vip';
  if (totalSpent >= 500) return 'high';
  if (totalSpent >= 100) return 'medium';
  return 'low';
}

/**
 * Calculate frequency tier based on booking frequency
 */
export function calculateFrequencyTier(
  totalBookings: number, 
  metadata: CustomerMetadata
): FrequencyTier {
  if (metadata.frequency_tier) return metadata.frequency_tier;
  
  const frequency = metadata.booking_frequency_per_month ?? 0;
  
  if (frequency >= 2) return 'frequent';
  if (frequency >= 0.5) return 'regular';
  if (totalBookings > 1) return 'occasional';
  return 'one-time';
}

// =============================================================================
// DB TO UI MAPPERS
// =============================================================================

/**
 * Map database customer row to UI model
 */
export function mapDBCustomerToUI(db: DBCustomer): Customer {
  const metadata = db.metadata || {};
  
  return {
    id: db.id,
    organizationId: db.organization_id,
    firstName: db.first_name,
    lastName: db.last_name,
    fullName: `${db.first_name} ${db.last_name}`.trim(),
    email: db.email,
    phone: db.phone,
    dateOfBirth: db.date_of_birth,
    address: db.address,
    city: db.city,
    state: db.state,
    zip: db.zip,
    country: db.country || 'United States',
    totalBookings: db.total_bookings || 0,
    totalSpent: db.total_spent || 0,
    status: db.status || 'active',
    notes: db.notes,
    metadata,
    createdBy: db.created_by,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
    stripeCustomerId: db.stripe_customer_id,
    preferredVenueId: db.preferred_venue_id,
    // Computed fields
    lifecycleStage: calculateLifecycleStage(metadata),
    spendingTier: calculateSpendingTier(db.total_spent || 0, metadata),
    frequencyTier: calculateFrequencyTier(db.total_bookings || 0, metadata),
    avgBookingValue: metadata.avg_booking_value ?? 
      (db.total_bookings > 0 ? (db.total_spent || 0) / db.total_bookings : 0),
    lastBookingDisplay: formatLastBookingDate(metadata.last_booking_date, db.updated_at),
  };
}

/**
 * Map array of DB customers to UI models
 */
export function mapDBCustomersToUI(dbCustomers: DBCustomer[]): Customer[] {
  return dbCustomers.map(mapDBCustomerToUI);
}

// =============================================================================
// UI TO DB MAPPERS
// =============================================================================

/**
 * Map customer create input to database format
 */
export function mapCreateInputToDB(
  input: CustomerCreateInput,
  organizationId: string,
  createdBy?: string
): Omit<DBCustomer, 'id' | 'created_at' | 'updated_at' | 'total_bookings' | 'total_spent'> {
  return {
    organization_id: organizationId,
    first_name: input.firstName,
    last_name: input.lastName,
    email: input.email.toLowerCase().trim(),
    phone: input.phone || null,
    date_of_birth: input.dateOfBirth || null,
    address: input.address || null,
    city: input.city || null,
    state: input.state || null,
    zip: input.zip || null,
    country: input.country || 'United States',
    status: input.status || 'active',
    notes: input.notes || null,
    metadata: {
      is_new: true,
      lifecycle_stage: 'new',
      marketing_consent: input.marketingConsent ?? false,
      tags: input.tags || [],
    },
    created_by: createdBy || null,
    stripe_customer_id: null,
    preferred_venue_id: null,
    stripe_account_id: null,
    created_via: 'admin_portal',
  };
}

/**
 * Map customer update input to database format
 */
export function mapUpdateInputToDB(
  input: Partial<CustomerCreateInput>
): Partial<DBCustomer> {
  const updates: Partial<DBCustomer> = {};
  
  if (input.firstName !== undefined) updates.first_name = input.firstName;
  if (input.lastName !== undefined) updates.last_name = input.lastName;
  if (input.email !== undefined) updates.email = input.email.toLowerCase().trim();
  if (input.phone !== undefined) updates.phone = input.phone || null;
  if (input.dateOfBirth !== undefined) updates.date_of_birth = input.dateOfBirth || null;
  if (input.address !== undefined) updates.address = input.address || null;
  if (input.city !== undefined) updates.city = input.city || null;
  if (input.state !== undefined) updates.state = input.state || null;
  if (input.zip !== undefined) updates.zip = input.zip || null;
  if (input.country !== undefined) updates.country = input.country || 'United States';
  if (input.status !== undefined) updates.status = input.status;
  if (input.notes !== undefined) updates.notes = input.notes || null;
  
  return updates;
}

// =============================================================================
// DISPLAY HELPERS
// =============================================================================

/**
 * Format last booking date for display
 */
function formatLastBookingDate(lastBooking?: string, fallback?: string): string {
  const dateToFormat = lastBooking || fallback;
  if (!dateToFormat) return 'Never';
  
  try {
    const date = new Date(dateToFormat);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return 'Unknown';
  }
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

/**
 * Get segment badge color class
 */
export function getSegmentColorClass(segment: string, isDark = false): string {
  const colors: Record<string, string> = {
    // Lifecycle stages
    new: isDark 
      ? 'bg-green-900/30 text-green-400' 
      : 'bg-green-100 text-green-700',
    active: isDark 
      ? 'bg-blue-900/30 text-blue-400' 
      : 'bg-blue-100 text-blue-700',
    'at-risk': isDark 
      ? 'bg-yellow-900/30 text-yellow-400' 
      : 'bg-yellow-100 text-yellow-700',
    churned: isDark 
      ? 'bg-gray-900/30 text-gray-400' 
      : 'bg-gray-100 text-gray-700',
    // Spending tiers
    vip: isDark 
      ? 'bg-purple-900/30 text-purple-400' 
      : 'bg-purple-100 text-purple-700',
    high: isDark 
      ? 'bg-indigo-900/30 text-indigo-400' 
      : 'bg-indigo-100 text-indigo-700',
    medium: isDark 
      ? 'bg-cyan-900/30 text-cyan-400' 
      : 'bg-cyan-100 text-cyan-700',
    low: isDark 
      ? 'bg-gray-900/30 text-gray-400' 
      : 'bg-gray-100 text-gray-700',
    // Frequency tiers
    frequent: isDark 
      ? 'bg-blue-900/30 text-blue-400' 
      : 'bg-blue-100 text-blue-700',
    regular: isDark 
      ? 'bg-blue-900/30 text-blue-400' 
      : 'bg-blue-100 text-blue-700',
    occasional: isDark 
      ? 'bg-cyan-900/30 text-cyan-400' 
      : 'bg-cyan-100 text-cyan-700',
    'one-time': isDark 
      ? 'bg-gray-900/30 text-gray-400' 
      : 'bg-gray-100 text-gray-700',
  };
  
  return colors[segment.toLowerCase()] || colors.low;
}

/**
 * Get status badge color class
 */
export function getStatusColorClass(status: string, isDark = false): string {
  if (status === 'active' || status === 'Active') {
    return isDark 
      ? 'bg-green-900/30 text-green-400' 
      : 'bg-green-100 text-green-700';
  }
  return isDark 
    ? 'bg-gray-900/30 text-gray-400' 
    : 'bg-gray-100 text-gray-700';
}
