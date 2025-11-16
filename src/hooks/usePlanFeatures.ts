/**
 * Plan-Based Feature Access Hook
 * Controls feature availability based on subscription plan
 */

import { useMemo } from 'react';
import { useAuth } from '../lib/auth/AuthContext';

export interface PlanFeatures {
  // Core limits
  max_venues: number | null; // null = unlimited
  max_staff: number | null;
  max_bookings_per_month: number | null;
  max_widgets: number | null;
  
  // Feature flags
  booking_widgets: boolean;
  custom_styling: 'none' | 'basic' | 'advanced';
  email_campaigns: boolean;
  sms_campaigns: boolean;
  automation: boolean;
  custom_branding: boolean;
  ai_agents: boolean;
  advanced_analytics: boolean;
  custom_reporting: boolean;
  api_access: boolean;
  webhooks: boolean;
  sso: boolean;
  white_label: boolean;
}

export interface Plan {
  id: string;
  name: 'Basic' | 'Growth' | 'Pro' | 'Enterprise';
  price_monthly: number;
  features: PlanFeatures;
}

export interface OrganizationUsage {
  current_venues_count: number;
  current_staff_count: number;
  current_bookings_this_month: number;
}

// Plan definitions (will come from database)
const PLANS: Record<string, PlanFeatures> = {
  basic: {
    max_venues: 2,
    max_staff: 3,
    max_bookings_per_month: 200,
    max_widgets: 1,
    booking_widgets: true,
    custom_styling: 'none',
    email_campaigns: false,
    sms_campaigns: false,
    automation: false,
    custom_branding: false,
    ai_agents: false,
    advanced_analytics: false,
    custom_reporting: false,
    api_access: false,
    webhooks: false,
    sso: false,
    white_label: false,
  },
  growth: {
    max_venues: 5,
    max_staff: 10,
    max_bookings_per_month: 1000,
    max_widgets: 3,
    booking_widgets: true,
    custom_styling: 'basic',
    email_campaigns: true,
    sms_campaigns: true,
    automation: true,
    custom_branding: true,
    ai_agents: false,
    advanced_analytics: false,
    custom_reporting: false,
    api_access: false,
    webhooks: false,
    sso: false,
    white_label: false,
  },
  pro: {
    max_venues: null, // unlimited
    max_staff: null,
    max_bookings_per_month: null,
    max_widgets: null,
    booking_widgets: true,
    custom_styling: 'advanced',
    email_campaigns: true,
    sms_campaigns: true,
    automation: true,
    custom_branding: true,
    ai_agents: true,
    advanced_analytics: true,
    custom_reporting: true,
    api_access: true,
    webhooks: true,
    sso: false,
    white_label: false,
  },
  enterprise: {
    max_venues: null,
    max_staff: null,
    max_bookings_per_month: null,
    max_widgets: null,
    booking_widgets: true,
    custom_styling: 'advanced',
    email_campaigns: true,
    sms_campaigns: true,
    automation: true,
    custom_branding: true,
    ai_agents: true,
    advanced_analytics: true,
    custom_reporting: true,
    api_access: true,
    webhooks: true,
    sso: true,
    white_label: true,
  },
};

export function usePlanFeatures() {
  const { currentUser } = useAuth();
  
  // TODO: Fetch from Supabase
  // For now, using mock data
  const organizationPlan = 'basic'; // Will come from organization.plan.slug
  const organizationUsage: OrganizationUsage = {
    current_venues_count: 0,
    current_staff_count: 0,
    current_bookings_this_month: 0,
  };
  
  const planFeatures = useMemo(() => {
    return PLANS[organizationPlan] || PLANS.basic;
  }, [organizationPlan]);
  
  /**
   * Check if a feature is available in the current plan
   */
  const hasFeature = (featureName: keyof PlanFeatures): boolean => {
    // System admins have all features
    if (currentUser?.role === 'system-admin') return true;
    
    const featureValue = planFeatures[featureName];
    
    // Boolean features
    if (typeof featureValue === 'boolean') {
      return featureValue;
    }
    
    // String features (e.g., custom_styling)
    if (typeof featureValue === 'string') {
      return featureValue !== 'none';
    }
    
    return false;
  };
  
  /**
   * Check if user can perform an action on a resource
   */
  const canUse = (resource: string, action: string = 'create'): boolean => {
    // System admins can do anything
    if (currentUser?.role === 'system-admin') return true;
    
    // For view actions, always allow
    if (action === 'view') return true;
    
    // Check usage limits for creation
    if (action === 'create') {
      switch (resource) {
        case 'venues':
          const venueLimit = planFeatures.max_venues;
          if (venueLimit !== null && organizationUsage.current_venues_count >= venueLimit) {
            return false;
          }
          break;
        
        case 'staff':
          const staffLimit = planFeatures.max_staff;
          if (staffLimit !== null && organizationUsage.current_staff_count >= staffLimit) {
            return false;
          }
          break;
        
        case 'bookings':
          const bookingLimit = planFeatures.max_bookings_per_month;
          if (bookingLimit !== null && organizationUsage.current_bookings_this_month >= bookingLimit) {
            return false;
          }
          break;
        
        case 'widgets':
          // TODO: Add widget count tracking
          break;
      }
    }
    
    return true;
  };
  
  /**
   * Get the limit for a specific resource
   */
  const getLimit = (resource: string): number | null => {
    switch (resource) {
      case 'venues':
        return planFeatures.max_venues;
      case 'staff':
        return planFeatures.max_staff;
      case 'bookings':
        return planFeatures.max_bookings_per_month;
      case 'widgets':
        return planFeatures.max_widgets;
      default:
        return null;
    }
  };
  
  /**
   * Get current usage for a resource
   */
  const getUsage = (resource: string): number => {
    switch (resource) {
      case 'venues':
        return organizationUsage.current_venues_count;
      case 'staff':
        return organizationUsage.current_staff_count;
      case 'bookings':
        return organizationUsage.current_bookings_this_month;
      default:
        return 0;
    }
  };
  
  /**
   * Check if at or over limit
   */
  const isAtLimit = (resource: string): boolean => {
    const limit = getLimit(resource);
    if (limit === null) return false; // unlimited
    
    const usage = getUsage(resource);
    return usage >= limit;
  };
  
  /**
   * Get plan name for upgrade prompts
   */
  const getRequiredPlan = (featureName: keyof PlanFeatures): string | null => {
    // Check which plan unlocks this feature
    if (PLANS.growth[featureName]) return 'Growth';
    if (PLANS.pro[featureName]) return 'Pro';
    if (PLANS.enterprise[featureName]) return 'Enterprise';
    return null;
  };
  
  return {
    planFeatures,
    organizationUsage,
    hasFeature,
    canUse,
    getLimit,
    getUsage,
    isAtLimit,
    getRequiredPlan,
    planName: organizationPlan,
  };
}
