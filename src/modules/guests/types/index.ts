/**
 * Guest/Customer Module Types
 * Enterprise-level type definitions for multi-tenant customer management
 * Version: 2.0.0
 */

// =============================================================================
// CORE ENTITY TYPES
// =============================================================================

/**
 * Customer status in the system
 */
export type CustomerStatus = 'active' | 'inactive' | 'blocked';

/**
 * Customer lifecycle stage - automatically calculated
 */
export type LifecycleStage = 'new' | 'active' | 'at-risk' | 'churned';

/**
 * Customer spending tier - based on total_spent
 */
export type SpendingTier = 'vip' | 'high' | 'medium' | 'low';

/**
 * Customer frequency tier - based on booking frequency
 */
export type FrequencyTier = 'frequent' | 'regular' | 'occasional' | 'one-time';

/**
 * Communication preference
 */
export type CommunicationPreference = 'email' | 'sms' | 'both' | 'none';

/**
 * Customer metadata stored in JSONB
 */
export interface CustomerMetadata {
  lifecycle_stage?: LifecycleStage;
  spending_tier?: SpendingTier;
  frequency_tier?: FrequencyTier;
  is_new?: boolean;
  favorite_game_id?: string;
  favorite_game_name?: string;
  preferred_venue_id?: string;
  preferred_venue_name?: string;
  last_booking_date?: string;
  days_since_last_visit?: number;
  avg_booking_value?: number;
  booking_frequency_per_month?: number;
  marketing_consent?: boolean;
  source?: string;
  tags?: string[];
  custom_fields?: Record<string, unknown>;
}

/**
 * Database customer row (snake_case)
 */
export interface DBCustomer {
  id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  date_of_birth: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string;
  total_bookings: number;
  total_spent: number;
  status: CustomerStatus;
  notes: string | null;
  metadata: CustomerMetadata;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  stripe_customer_id: string | null;
  preferred_venue_id: string | null;
  stripe_account_id: string | null;
  created_via: string | null;
}

/**
 * UI-friendly customer model (camelCase)
 */
export interface Customer {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string | null;
  dateOfBirth: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string;
  totalBookings: number;
  totalSpent: number;
  status: CustomerStatus;
  notes: string | null;
  metadata: CustomerMetadata;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  stripeCustomerId: string | null;
  preferredVenueId: string | null;
  // Computed fields
  lifecycleStage: LifecycleStage;
  spendingTier: SpendingTier;
  frequencyTier: FrequencyTier;
  avgBookingValue: number;
  lastBookingDisplay: string;
}

// =============================================================================
// FORM & CREATE/UPDATE TYPES
// =============================================================================

/**
 * Form data for creating a customer
 */
export interface CustomerCreateInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  notes?: string;
  status?: CustomerStatus;
  communicationPreference?: CommunicationPreference;
  marketingConsent?: boolean;
  tags?: string[];
}

/**
 * Form data for updating a customer
 */
export interface CustomerUpdateInput extends Partial<CustomerCreateInput> {
  id: string;
}

// =============================================================================
// ANALYTICS & METRICS TYPES
// =============================================================================

/**
 * Customer metrics for dashboard
 */
export interface CustomerMetrics {
  totalCustomers: number;
  totalCustomersPrevious: number;
  activeCustomers: number;
  activeCustomersPrevious: number;
  avgLifetimeValue: number;
  avgLifetimeValuePrevious: number;
  newCustomersCurrent: number;
  totalCustomersForGrowth: number;
  growthRate: number;
}

/**
 * Customer segment data
 */
export interface CustomerSegment {
  id: string;
  name: string;
  count: number;
  percentage: number;
  color: string;
  description: string;
  icon?: React.ReactNode;
}

/**
 * Activity/Game segment with audience data
 */
export interface ActivitySegment {
  activityId: string;
  activityName: string;
  activityImageUrl: string | null;
  customerCount: number;
  totalBookings: number;
  totalRevenue: number;
  avgBookingValue: number;
  lastBookingDate: string | null;
}

/**
 * Venue segment with audience data
 */
export interface VenueSegment {
  venueId: string;
  venueName: string;
  customerCount: number;
  totalBookings: number;
  totalRevenue: number;
  avgBookingValue: number;
  lastBookingDate: string | null;
}

/**
 * Audience member in a segment
 */
export interface AudienceMember {
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  totalBookings: number;
  totalSpent: number;
  lastBookingDate: string | null;
  firstBookingDate: string | null;
  avgBookingValue: number;
}

// =============================================================================
// CUSTOMER INSIGHTS & HISTORY
// =============================================================================

/**
 * Customer insights with full analytics
 */
export interface CustomerInsights {
  customer: Customer;
  favoriteActivity: {
    id: string;
    name: string;
    imageUrl: string | null;
    bookingCount: number;
    totalSpent: number;
  } | null;
  preferredVenue: {
    id: string;
    name: string;
    visitCount: number;
    totalSpent: number;
  } | null;
  lifecycleStage: LifecycleStage;
  spendingTier: SpendingTier;
  frequencyTier: FrequencyTier;
  lastBookingDate: string | null;
  daysSinceLastVisit: number;
  avgBookingValue: number;
  bookingFrequencyPerMonth: number;
  topActivities: Array<{
    id: string;
    name: string;
    bookingCount: number;
  }>;
  recentBookings: CustomerBookingHistory[];
}

/**
 * Customer booking history entry
 */
export interface CustomerBookingHistory {
  id: string;
  bookingDate: string;
  activityName: string;
  venueName: string;
  totalAmount: number;
  status: string;
  partySize: number;
}

/**
 * Customer activity summary
 */
export interface CustomerActivitySummary {
  activityId: string;
  activityName: string;
  activityImage: string | null;
  bookingCount: number;
  totalSpent: number;
  lastPlayed: string | null;
}

/**
 * Customer venue summary
 */
export interface CustomerVenueSummary {
  venueId: string;
  venueName: string;
  visitCount: number;
  totalSpent: number;
  lastVisit: string | null;
}

// =============================================================================
// FILTER & QUERY TYPES
// =============================================================================

/**
 * Customer list filters
 */
export interface CustomerFilters {
  search?: string;
  status?: CustomerStatus | 'all';
  lifecycleStage?: LifecycleStage | 'all';
  spendingTier?: SpendingTier | 'all';
  frequencyTier?: FrequencyTier | 'all';
  activityId?: string;
  venueId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  sortBy?: 'name' | 'email' | 'totalSpent' | 'totalBookings' | 'lastBooking' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// =============================================================================
// SERVICE RESPONSE TYPES
// =============================================================================

/**
 * Generic service response
 */
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Export options
 */
export interface ExportOptions {
  format: 'csv' | 'pdf' | 'excel';
  filters: CustomerFilters;
  columns?: string[];
}
