/**
 * Plan Types
 * 
 * Type definitions for subscription plans in the System Admin Dashboard
 */

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billing_period: 'monthly' | 'annual';
  
  // Features
  features: string[];
  
  // Limits
  limits: PlanLimits;
  
  // Display
  is_featured: boolean;
  display_order: number;
  color?: string;
  
  // Stripe
  stripe_price_id?: string;
  stripe_product_id?: string;
  
  // Status
  is_active: boolean;
  is_visible: boolean;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Stats
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
  description: string;
  price: number;
  currency?: string;
  billing_period: 'monthly' | 'annual';
  features: string[];
  limits: PlanLimits;
  is_featured?: boolean;
  display_order?: number;
  color?: string;
}

export interface UpdatePlanDTO {
  name?: string;
  description?: string;
  price?: number;
  features?: string[];
  limits?: PlanLimits;
  is_featured?: boolean;
  display_order?: number;
  color?: string;
  is_active?: boolean;
  is_visible?: boolean;
}

export interface PlanStats {
  subscriber_count: number;
  mrr: number; // Monthly Recurring Revenue
  arr: number; // Annual Recurring Revenue
  growth_rate: number;
  churn_rate: number;
}
