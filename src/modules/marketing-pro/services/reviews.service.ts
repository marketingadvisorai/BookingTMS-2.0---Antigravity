/**
 * MarketingPro 1.1 - Reviews Service
 * @description CRUD operations for review management with multi-tenant support
 */

import { supabase } from '@/lib/supabase';
import type { Review } from '../types';

export interface CreateReviewInput {
  organization_id: string;
  venue_id?: string;
  platform: 'google' | 'facebook' | 'yelp' | 'tripadvisor' | 'internal';
  author_name: string;
  rating: number;
  review_text?: string;
  review_date?: string;
}

/**
 * Reviews service with multi-tenant organization scoping
 */
export const ReviewsService = {
  async listByOrganization(organizationId: string): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('organization_id', organizationId)
      .order('review_date', { ascending: false });

    if (error) throw new Error(`Failed to fetch reviews: ${error.message}`);
    return (data || []) as Review[];
  },

  async getById(id: string): Promise<Review | null> {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(`Failed to fetch review: ${error.message}`);
    return data as Review;
  },

  async create(input: CreateReviewInput): Promise<Review> {
    const sentiment = input.rating >= 4 ? 'positive' : input.rating >= 3 ? 'neutral' : 'negative';
    
    const { data, error } = await supabase
      .from('reviews')
      .insert({ ...input, sentiment })
      .select()
      .single();

    if (error) throw new Error(`Failed to create review: ${error.message}`);
    return data as Review;
  },

  async respond(id: string, responseText: string): Promise<Review> {
    const { data: user } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('reviews')
      .update({
        response_text: responseText,
        responded_at: new Date().toISOString(),
        responded_by: user?.user?.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to respond to review: ${error.message}`);
    return data as Review;
  },

  async toggleFeatured(id: string, featured: boolean): Promise<Review> {
    const { data, error } = await supabase
      .from('reviews')
      .update({ is_featured: featured, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update featured status: ${error.message}`);
    return data as Review;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) throw new Error(`Failed to delete review: ${error.message}`);
  },

  async getStats(organizationId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select('id, rating, platform, sentiment, response_text')
      .eq('organization_id', organizationId);

    if (error) throw new Error(`Failed to fetch review stats: ${error.message}`);

    const reviews = (data || []) as Review[];
    const ratings = reviews.map(r => r.rating).filter(Boolean) as number[];
    
    return {
      total: reviews.length,
      averageRating: ratings.length > 0 
        ? Number((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)) 
        : 0,
      positive: reviews.filter(r => r.sentiment === 'positive').length,
      neutral: reviews.filter(r => r.sentiment === 'neutral').length,
      negative: reviews.filter(r => r.sentiment === 'negative').length,
      responded: reviews.filter(r => r.response_text).length,
      byPlatform: {
        google: reviews.filter(r => r.platform === 'google').length,
        facebook: reviews.filter(r => r.platform === 'facebook').length,
        yelp: reviews.filter(r => r.platform === 'yelp').length,
        tripadvisor: reviews.filter(r => r.platform === 'tripadvisor').length,
        internal: reviews.filter(r => r.platform === 'internal').length,
      },
    };
  },
};
