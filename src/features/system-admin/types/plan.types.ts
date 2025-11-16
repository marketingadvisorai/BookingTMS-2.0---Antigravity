/**
 * Plan Types
 * 
 * Type definitions for subscription plans in the System Admin Dashboard
 */

export interface Plan {
  id: string;
  name: string;
  slug?: string;
  description: string;
  
  // Pricing (matches actual DB schema)
  price_monthly: number;
  price_yearly: number;
  
  // Stripe
  stripe_product_id?: string;
  stripe_price_monthly_id?: string;
  stripe_price_yearly_id?: string;
  
  // Limits (matches DB schema)
  max_venues?: number;
  max_staff?: number;
  max_bookings_per_month?: number;
  max_games?: number;
  
  // Features
  features: any; // JSONB in database
  
  // Display
  is_active: boolean;
  is_visible: boolean;
  sort_order?: number;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Stats (computed)
  subscriber_count?: number;
}

export interface PlanLimits {
  max_venues?: number;
  max_games?: number;
  max_bookings_per_month?: number;
  max_users?: number;
  max_storage_gb?: number;
  max_api_calls_per_day?: number;
  features_enabled: string[];
}

export interface CreatePlanDTO {
  name: string;
  slug?: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  stripe_product_id?: string;
  max_venues?: number;
  max_staff?: number;
  max_bookings_per_month?: number;
  max_games?: number;
  features?: any;
  is_active?: boolean;
  is_visible?: boolean;
  sort_order?: number;
}

export interface UpdatePlanDTO {
  name?: string;
  slug?: string;
  description?: string;
  price_monthly?: number;
  price_yearly?: number;
  max_venues?: number;
  max_staff?: number;
  max_bookings_per_month?: number;
  max_games?: number;
  features?: any;
  is_active?: boolean;
  is_visible?: boolean;
  sort_order?: number;
}

export interface PlanStats {
  subscriber_count: number;
  mrr: number; // Monthly Recurring Revenue
  arr: number; // Annual Recurring Revenue
  growth_rate: number;
  churn_rate: number;
}
