/**
 * Organization Types
 * 
 * Type definitions for organizations in the System Admin Dashboard
 * Integrates with Supabase organizations table
 */

export interface Organization {
  // Core Fields
  id: string;
  name: string;
  
  // Owner Information
  owner_name?: string;
  owner_email?: string;
  
  // Business Details
  website?: string;
  phone?: string;
  
  // Subscription & Billing
  plan_id?: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  
  // Stripe Connect
  stripe_account_id?: string;
  stripe_charges_enabled: boolean;
  stripe_payouts_enabled: boolean;
  stripe_onboarding_status?: 'not_started' | 'incomplete' | 'complete';
  stripe_account_type?: string;
  
  // Application Fee
  application_fee_percentage: number;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Relations (loaded separately)
  plan?: Plan;
  usage?: OrganizationUsage;
  members?: OrganizationMember[];
  venues?: Venue[];
  revenue?: RevenueData;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  billing_period: 'monthly' | 'annual';
  features: string[];
  limits: PlanLimits;
  is_active: boolean;
}

export interface PlanLimits {
  max_venues?: number;
  max_games?: number;
  max_bookings_per_month?: number;
  max_users?: number;
  max_storage_gb?: number;
}

export interface OrganizationUsage {
  id: string;
  organization_id: string;
  period_start: string;
  period_end: string;
  venues_count: number;
  games_count: number;
  bookings_count: number;
  users_count: number;
  storage_used_gb: number;
  created_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: 'admin' | 'manager' | 'staff';
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
}

export interface Venue {
  id: string;
  organization_id: string;
  name: string;
  location?: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface RevenueData {
  total_revenue: number;
  platform_fee_revenue: number;
  net_revenue: number;
  currency: string;
  period_start: string;
  period_end: string;
}

// DTOs (Data Transfer Objects)
export interface CreateOrganizationDTO {
  name: string;
  owner_name: string;
  owner_email: string;
  website?: string;
  phone?: string;
  plan_id: string;
  status?: 'active' | 'pending';
}

export interface UpdateOrganizationDTO {
  name?: string;
  owner_name?: string;
  owner_email?: string;
  website?: string;
  phone?: string;
  plan_id?: string;
  status?: 'active' | 'inactive' | 'suspended';
  application_fee_percentage?: number;
}

// Filters & Queries
export interface OrganizationFilters {
  status?: 'active' | 'inactive' | 'suspended' | 'pending';
  plan_id?: string;
  search?: string;
  has_stripe_account?: boolean;
  stripe_status?: 'not_started' | 'incomplete' | 'complete';
}

export interface OrganizationSortOptions {
  field: 'name' | 'created_at' | 'updated_at' | 'status';
  direction: 'asc' | 'desc';
}

// Metrics
export interface OrganizationMetrics {
  total_venues: number;
  total_games: number;
  total_bookings: number;
  total_revenue: number;
  mrr: number; // Monthly Recurring Revenue
  active_users: number;
  storage_used_gb: number;
  growth_rate: number;
}

// List Response
export interface OrganizationListResponse {
  data: Organization[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}
