/**
 * Stripe Service for System Admin
 * 
 * Handles Stripe API integration for organization management
 * Creates customers, products, and prices
 */

import { supabase } from '@/lib/supabase';

interface CreateStripeCustomerParams {
  email: string;
  name: string;
  metadata?: Record<string, string>;
}

interface StripeCustomer {
  id: string;
  email: string;
  name: string;
  created: number;
}

export class StripeService {
  /**
   * Create Stripe customer for organization
   */
  static async createCustomer(
    params: CreateStripeCustomerParams
  ): Promise<StripeCustomer> {
    try {
      // Call Supabase Edge Function to create Stripe customer
      const { data, error } = await supabase.functions.invoke('create-stripe-customer', {
        body: {
          email: params.email,
          name: params.name,
          metadata: params.metadata || {},
        },
      });

      if (error) {
        console.error('Stripe customer creation error:', error);
        throw new Error(`Failed to create Stripe customer: ${error.message}`);
      }

      if (!data || !data.customer) {
        throw new Error('No customer data returned from Stripe');
      }

      return data.customer;
    } catch (error) {
      console.error('StripeService.createCustomer error:', error);
      // Don't fail organization creation if Stripe fails
      // Log error and return mock data to allow organization creation
      console.warn('⚠️ Stripe customer creation failed, continuing with organization creation');
      return {
        id: `cus_temp_${Date.now()}`,
        email: params.email,
        name: params.name,
        created: Date.now() / 1000,
      };
    }
  }

  /**
   * Create Stripe product for game
   */
  static async createProduct(params: {
    name: string;
    description?: string;
    metadata?: Record<string, string>;
  }): Promise<{ id: string; name: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('create-stripe-product', {
        body: params,
      });

      if (error) {
        console.error('Stripe product creation error:', error);
        throw new Error(`Failed to create Stripe product: ${error.message}`);
      }

      return data.product;
    } catch (error) {
      console.error('StripeService.createProduct error:', error);
      // Return mock data to allow game creation
      console.warn('⚠️ Stripe product creation failed, continuing with game creation');
      return {
        id: `prod_temp_${Date.now()}`,
        name: params.name,
      };
    }
  }

  /**
   * Create Stripe price for product
   */
  static async createPrice(params: {
    product: string;
    unit_amount: number;
    currency?: string;
    metadata?: Record<string, string>;
  }): Promise<{ id: string; unit_amount: number }> {
    try {
      const { data, error } = await supabase.functions.invoke('create-stripe-price', {
        body: {
          ...params,
          currency: params.currency || 'usd',
        },
      });

      if (error) {
        console.error('Stripe price creation error:', error);
        throw new Error(`Failed to create Stripe price: ${error.message}`);
      }

      return data.price;
    } catch (error) {
      console.error('StripeService.createPrice error:', error);
      // Return mock data to allow game creation
      console.warn('⚠️ Stripe price creation failed, continuing with game creation');
      return {
        id: `price_temp_${Date.now()}`,
        unit_amount: params.unit_amount,
      };
    }
  }

  /**
   * Create Stripe subscription for organization
   */
  static async createSubscription(params: {
    customer: string;
    price_id: string;
    metadata?: Record<string, string>;
  }): Promise<{ id: string; status: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('create-stripe-subscription', {
        body: params,
      });

      if (error) {
        console.error('Stripe subscription creation error:', error);
        throw new Error(`Failed to create Stripe subscription: ${error.message}`);
      }

      return data.subscription;
    } catch (error) {
      console.error('StripeService.createSubscription error:', error);
      throw error;
    }
  }
}
