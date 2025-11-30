/**
 * MarketingPro 1.1 - Organization Marketing Hook
 * @description Multi-tenant marketing data management with Supabase integration
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  MarketingService,
  PromotionsService,
  GiftCardsService,
  EmailCampaignsService,
  AffiliatesService,
  ReviewsService,
  MarketingSettingsService,
} from '../services';
import type {
  Promotion,
  GiftCard,
  EmailCampaign,
  Affiliate,
  Review,
  MarketingSettings,
  DBEmailTemplate,
  EmailWorkflow,
} from '../types';
import { toast } from 'sonner';

interface MarketingData {
  promotions: Promotion[];
  giftCards: GiftCard[];
  campaigns: EmailCampaign[];
  templates: DBEmailTemplate[];
  workflows: EmailWorkflow[];
  affiliates: Affiliate[];
  reviews: Review[];
  settings: MarketingSettings | null;
}

interface DashboardStats {
  promotions: { total: number; active: number; totalRedemptions: number };
  giftCards: { total: number; active: number; totalValue: number; remainingBalance: number };
  email: { totalCampaigns: number; sentCampaigns: number; totalDelivered: number; totalOpened: number };
  affiliates: { total: number; active: number; totalRevenue: number; totalCommissions: number };
  reviews: { total: number; averageRating: number; positive: number; negative: number };
}

/**
 * Hook for managing marketing data with multi-tenant organization scoping
 */
export function useOrganizationMarketing() {
  const { currentUser } = useAuth();
  const organizationId = currentUser?.organizationId;

  const [data, setData] = useState<MarketingData>({
    promotions: [],
    giftCards: [],
    campaigns: [],
    templates: [],
    workflows: [],
    affiliates: [],
    reviews: [],
    settings: null,
  });

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all marketing data
  const fetchAllData = useCallback(async () => {
    if (!organizationId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const [
        promotions,
        giftCards,
        campaigns,
        templates,
        workflows,
        affiliates,
        reviews,
        settings,
        dashboardStats,
      ] = await Promise.all([
        PromotionsService.listByOrganization(organizationId),
        GiftCardsService.listByOrganization(organizationId),
        EmailCampaignsService.listCampaigns(organizationId),
        EmailCampaignsService.listTemplates(organizationId),
        EmailCampaignsService.listWorkflows(organizationId),
        AffiliatesService.listByOrganization(organizationId),
        ReviewsService.listByOrganization(organizationId),
        MarketingSettingsService.getByOrganization(organizationId),
        MarketingService.getDashboardStats(organizationId),
      ]);

      setData({
        promotions,
        giftCards,
        campaigns,
        templates,
        workflows,
        affiliates,
        reviews,
        settings,
      });

      setStats(dashboardStats as DashboardStats);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load marketing data';
      setError(message);
      console.error('Marketing data fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [organizationId]);

  // Initial fetch
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // ============================================================================
  // PROMOTIONS ACTIONS
  // ============================================================================

  const createPromotion = useCallback(async (input: Parameters<typeof PromotionsService.create>[0]) => {
    if (!organizationId) return null;
    try {
      const promo = await PromotionsService.create({ ...input, organization_id: organizationId });
      setData(prev => ({ ...prev, promotions: [promo, ...prev.promotions] }));
      toast.success('Promotion created successfully');
      return promo;
    } catch (err) {
      toast.error('Failed to create promotion');
      throw err;
    }
  }, [organizationId]);

  const deletePromotion = useCallback(async (id: string) => {
    try {
      await PromotionsService.delete(id);
      setData(prev => ({ ...prev, promotions: prev.promotions.filter(p => p.id !== id) }));
      toast.success('Promotion deleted');
    } catch (err) {
      toast.error('Failed to delete promotion');
      throw err;
    }
  }, []);

  // ============================================================================
  // GIFT CARDS ACTIONS
  // ============================================================================

  const createGiftCard = useCallback(async (input: Parameters<typeof GiftCardsService.create>[0]) => {
    if (!organizationId) return null;
    try {
      const gc = await GiftCardsService.create({ ...input, organization_id: organizationId });
      setData(prev => ({ ...prev, giftCards: [gc, ...prev.giftCards] }));
      toast.success('Gift card created successfully');
      return gc;
    } catch (err) {
      toast.error('Failed to create gift card');
      throw err;
    }
  }, [organizationId]);

  const bulkCreateGiftCards = useCallback(async (count: number, value: number) => {
    if (!organizationId) return [];
    try {
      const cards = await GiftCardsService.bulkCreate(organizationId, count, value);
      setData(prev => ({ ...prev, giftCards: [...cards, ...prev.giftCards] }));
      toast.success(`${count} gift cards created successfully`);
      return cards;
    } catch (err) {
      toast.error('Failed to create gift cards');
      throw err;
    }
  }, [organizationId]);

  // ============================================================================
  // EMAIL ACTIONS
  // ============================================================================

  const createCampaign = useCallback(async (input: Parameters<typeof EmailCampaignsService.createCampaign>[0]) => {
    if (!organizationId) return null;
    try {
      const campaign = await EmailCampaignsService.createCampaign({ ...input, organization_id: organizationId });
      setData(prev => ({ ...prev, campaigns: [campaign, ...prev.campaigns] }));
      toast.success('Campaign created successfully');
      return campaign;
    } catch (err) {
      toast.error('Failed to create campaign');
      throw err;
    }
  }, [organizationId]);

  const toggleWorkflow = useCallback(async (id: string, enabled: boolean) => {
    try {
      const workflow = await EmailCampaignsService.toggleWorkflow(id, enabled);
      setData(prev => ({
        ...prev,
        workflows: prev.workflows.map(w => w.id === id ? workflow : w),
      }));
      toast.success(enabled ? 'Workflow enabled' : 'Workflow disabled');
      return workflow;
    } catch (err) {
      toast.error('Failed to toggle workflow');
      throw err;
    }
  }, []);

  // ============================================================================
  // AFFILIATE ACTIONS
  // ============================================================================

  const createAffiliate = useCallback(async (input: Parameters<typeof AffiliatesService.create>[0]) => {
    if (!organizationId) return null;
    try {
      const affiliate = await AffiliatesService.create({ ...input, organization_id: organizationId });
      setData(prev => ({ ...prev, affiliates: [affiliate, ...prev.affiliates] }));
      toast.success('Affiliate added successfully');
      return affiliate;
    } catch (err) {
      toast.error('Failed to add affiliate');
      throw err;
    }
  }, [organizationId]);

  const approveAffiliate = useCallback(async (id: string) => {
    try {
      const affiliate = await AffiliatesService.approve(id);
      setData(prev => ({
        ...prev,
        affiliates: prev.affiliates.map(a => a.id === id ? affiliate : a),
      }));
      toast.success('Affiliate approved');
      return affiliate;
    } catch (err) {
      toast.error('Failed to approve affiliate');
      throw err;
    }
  }, []);

  // ============================================================================
  // REVIEW ACTIONS
  // ============================================================================

  const respondToReview = useCallback(async (id: string, responseText: string) => {
    try {
      const review = await ReviewsService.respond(id, responseText);
      setData(prev => ({
        ...prev,
        reviews: prev.reviews.map(r => r.id === id ? review : r),
      }));
      toast.success('Response posted');
      return review;
    } catch (err) {
      toast.error('Failed to post response');
      throw err;
    }
  }, []);

  // ============================================================================
  // SETTINGS ACTIONS
  // ============================================================================

  const updateSettings = useCallback(async (input: Parameters<typeof MarketingSettingsService.upsert>[1]) => {
    if (!organizationId) return null;
    try {
      const settings = await MarketingSettingsService.upsert(organizationId, input);
      setData(prev => ({ ...prev, settings }));
      toast.success('Settings updated');
      return settings;
    } catch (err) {
      toast.error('Failed to update settings');
      throw err;
    }
  }, [organizationId]);

  return {
    // Data
    ...data,
    stats,
    isLoading,
    error,
    organizationId,

    // Actions
    refresh: fetchAllData,
    
    // Promotions
    createPromotion,
    deletePromotion,
    
    // Gift Cards
    createGiftCard,
    bulkCreateGiftCards,
    
    // Email
    createCampaign,
    toggleWorkflow,
    
    // Affiliates
    createAffiliate,
    approveAffiliate,
    
    // Reviews
    respondToReview,
    
    // Settings
    updateSettings,
  };
}
