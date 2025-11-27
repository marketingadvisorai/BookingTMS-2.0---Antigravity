/**
 * Payment Settings Hook
 * Encapsulates all business logic for Stripe payment integration
 * 
 * @module payment/usePaymentSettings
 * @version 1.0.0
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '../../../../lib/supabase/client';
import { StripeProductService } from '../../../../lib/stripe/stripeProductService';
import { PricingService } from '../../../../lib/stripe/pricingService';
import { ActivityData } from '../../types';
import { SyncStatus, UsePaymentSettingsReturn } from './types';
import { convertPricesToStructured } from './priceConverters';

interface UsePaymentSettingsProps {
  activityData: ActivityData;
  onUpdate: (data: ActivityData) => void;
  t: any;
  venueId?: string;
  organizationId?: string;
}

export function usePaymentSettings({
  activityData,
  onUpdate,
  t,
  venueId,
  organizationId,
}: UsePaymentSettingsProps): UsePaymentSettingsReturn {
  // ============================================================================
  // STATE
  // ============================================================================
  
  const [isCreating, setIsCreating] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [manualProductId, setManualProductId] = useState(activityData.stripeProductId || '');
  const [manualPriceId, setManualPriceId] = useState(activityData.stripePriceId || '');
  const [stripeCheckoutUrl, setStripeCheckoutUrl] = useState(activityData.stripeCheckoutUrl || '');
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(activityData.stripeSyncStatus || 'not_synced');
  const [errorMessage, setErrorMessage] = useState('');
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editProductId, setEditProductId] = useState('');
  const [editPriceId, setEditPriceId] = useState('');
  const [editCheckoutUrl, setEditCheckoutUrl] = useState('');
  const [venueMatches, setVenueMatches] = useState(true);

  // ============================================================================
  // SYNC STATE WITH ACTIVITY DATA
  // ============================================================================
  
  useEffect(() => {
    if (activityData.stripeProductId) setManualProductId(activityData.stripeProductId);
    if (activityData.stripePriceId) setManualPriceId(activityData.stripePriceId);
    if (activityData.stripeCheckoutUrl) setStripeCheckoutUrl(activityData.stripeCheckoutUrl);
    if (activityData.stripeSyncStatus) setSyncStatus(activityData.stripeSyncStatus);
  }, [activityData.stripeProductId, activityData.stripePriceId, activityData.stripeCheckoutUrl, activityData.stripeSyncStatus]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================
  
  const isConfigured = !!manualProductId && venueMatches;
  const hasPrice = activityData.adultPrice > 0;
  const isCheckoutConnected = !!(
    manualProductId &&
    manualPriceId &&
    (syncStatus === 'synced' || syncStatus === 'pending')
  );

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const handleRefreshConnection = useCallback(async () => {
    setIsRefreshing(true);
    try {
      if (!activityData.id) return;

      const { data: freshActivity, error } = await (supabase as any)
        .from('activities')
        .select('*')
        .eq('id', activityData.id)
        .single();

      if (error) throw error;

      const stripeProductId = freshActivity?.stripe_product_id;
      const stripePriceId = freshActivity?.stripe_price_id;

      if (stripeProductId) {
        setVenueMatches(true);
        setSyncStatus('synced');
        setManualProductId(stripeProductId);
        setManualPriceId(stripePriceId || '');
        toast.success('✅ Stripe Connected');
      } else {
        setVenueMatches(false);
        setSyncStatus('not_synced');
        toast.info('No Stripe product configured');
      }
    } catch (err) {
      console.error('Error checking connection:', err);
      toast.error('Failed to check connection');
    } finally {
      setIsRefreshing(false);
    }
  }, [activityData.id]);

  const handleCreateStripeProduct = useCallback(async () => {
    if (!hasPrice) {
      toast.error('Please set a price first');
      return;
    }

    setIsCreating(true);
    setSyncStatus('pending');
    setErrorMessage('');

    try {
      toast.loading('Creating Stripe product...', { id: 'stripe-create' });

      const customFields = activityData.customCapacityFields?.filter((f: any) => f.price > 0) || [];

      const productResult = await StripeProductService.createProductAndPrice({
        name: activityData.name || `Untitled ${t.singular}`,
        description: activityData.description || '',
        price: activityData.adultPrice,
        currency: 'usd',
        childPrice: activityData.childPrice > 0 ? activityData.childPrice : undefined,
        customCapacityFields: customFields.length > 0 ? customFields : undefined,
        metadata: {
          activity_id: activityData.id || '',
          venue_id: venueId || activityData.venueId || '',
          organization_id: organizationId || '',
        },
      });

      let multiTierPrices: ActivityData['stripePrices'] = undefined;
      if (activityData.id) {
        try {
          const pricingResult = await PricingService.createMultiTierPrices(
            productResult.productId,
            activityData.id,
            {
              adultPrice: activityData.adultPrice,
              childPrice: activityData.childPrice > 0 ? activityData.childPrice : undefined,
              customCapacityFields: customFields.length > 0 ? customFields : undefined,
            }
          );
          multiTierPrices = pricingResult.prices as ActivityData['stripePrices'];
        } catch (tierError) {
          console.warn('Multi-tier price creation failed:', tierError);
        }
      }

      const updatedData: ActivityData = {
        ...activityData,
        stripeProductId: productResult.productId,
        stripePriceId: multiTierPrices?.adult?.price_id || productResult.priceId,
        stripePrices: multiTierPrices,
        stripeSyncStatus: 'synced' as SyncStatus,
        stripeLastSync: new Date().toISOString(),
        pricingNeedsSync: false,
      };

      onUpdate(updatedData);
      setManualProductId(productResult.productId);
      setManualPriceId(multiTierPrices?.adult?.price_id || productResult.priceId);
      setSyncStatus('synced');

      toast.success('Stripe product created!', { id: 'stripe-create' });
    } catch (error: any) {
      console.error('Stripe error:', error);
      setSyncStatus('error');
      setErrorMessage(error.message);
      toast.error(error.message || 'Failed to create product', { id: 'stripe-create' });
    } finally {
      setIsCreating(false);
    }
  }, [activityData, hasPrice, t, venueId, organizationId, onUpdate]);

  const handleLinkExistingProduct = useCallback(async () => {
    const productId = manualProductId.trim();
    const checkoutUrl = stripeCheckoutUrl.trim();

    if (!productId && !checkoutUrl) {
      toast.error('Enter a Product ID or Checkout URL');
      return;
    }

    if (!productId && checkoutUrl) {
      onUpdate({
        ...activityData,
        stripeCheckoutUrl: checkoutUrl,
        stripeSyncStatus: 'synced' as SyncStatus,
      });
      setSyncStatus('synced');
      toast.success('Checkout URL saved');
      return;
    }

    if (productId && !StripeProductService.isValidProductId(productId)) {
      toast.error('Invalid Product ID format');
      return;
    }

    setIsLinking(true);
    setSyncStatus('pending');

    try {
      toast.loading('Linking product...', { id: 'stripe-link' });

      const result = await StripeProductService.linkExistingProduct({
        productId,
        priceId: manualPriceId.trim() || undefined,
      });

      const convertedPrices = convertPricesToStructured(result.prices, activityData);

      const updatedData: ActivityData = {
        ...activityData,
        stripeProductId: result.productId,
        stripePrices: convertedPrices,
        stripePriceId: result.priceId || convertedPrices?.adult?.price_id,
        stripeCheckoutUrl: checkoutUrl || undefined,
        stripeSyncStatus: 'synced' as SyncStatus,
        stripeLastSync: new Date().toISOString(),
      };

      onUpdate(updatedData);
      setSyncStatus('synced');
      toast.success('Product linked!', { id: 'stripe-link' });
    } catch (error: any) {
      setSyncStatus('error');
      setErrorMessage(error.message);
      toast.error(error.message, { id: 'stripe-link' });
    } finally {
      setIsLinking(false);
    }
  }, [activityData, manualProductId, manualPriceId, stripeCheckoutUrl, onUpdate]);

  const handleRefreshSync = useCallback(async () => {
    if (!isConfigured) return;

    setSyncStatus('pending');

    try {
      toast.loading('Refreshing prices...', { id: 'stripe-sync' });

      const prices = await StripeProductService.getProductPrices(activityData.stripeProductId || '');
      const convertedPrices = convertPricesToStructured(prices, activityData);

      const updatedData: ActivityData = {
        ...activityData,
        stripePrices: convertedPrices,
        stripeSyncStatus: 'synced' as SyncStatus,
        stripeLastSync: new Date().toISOString(),
      };

      onUpdate(updatedData);
      setSyncStatus('synced');
      toast.success('Prices synced!', { id: 'stripe-sync' });
    } catch (error: any) {
      setSyncStatus('error');
      setErrorMessage(error.message);
      toast.error('Sync failed', { id: 'stripe-sync' });
    }
  }, [activityData, isConfigured, onUpdate]);

  const handleEditConfiguration = useCallback(() => {
    setEditProductId(activityData.stripeProductId || '');
    setEditPriceId(activityData.stripePriceId || '');
    setEditCheckoutUrl(activityData.stripeCheckoutUrl || '');
    setShowEditDialog(true);
  }, [activityData]);

  const handleSaveEdit = useCallback(async () => {
    const productId = editProductId.trim();

    if (productId && !StripeProductService.isValidProductId(productId)) {
      toast.error('Invalid Product ID');
      return;
    }

    setIsLinking(true);

    try {
      toast.loading('Updating...', { id: 'stripe-edit' });

      if (productId && productId !== activityData.stripeProductId) {
        const result = await StripeProductService.linkExistingProduct({
          productId,
          priceId: editPriceId.trim() || undefined,
        });

        const convertedPrices = convertPricesToStructured(result.prices, activityData);

        onUpdate({
          ...activityData,
          stripeProductId: result.productId,
          stripePrices: convertedPrices,
          stripePriceId: result.priceId || convertedPrices?.adult?.price_id,
          stripeCheckoutUrl: editCheckoutUrl.trim() || undefined,
          stripeSyncStatus: 'synced' as SyncStatus,
          stripeLastSync: new Date().toISOString(),
        });
      } else {
        onUpdate({
          ...activityData,
          stripePriceId: editPriceId.trim() || activityData.stripePriceId,
          stripeCheckoutUrl: editCheckoutUrl.trim() || undefined,
        });
      }

      setShowEditDialog(false);
      toast.success('Updated!', { id: 'stripe-edit' });
    } catch (error: any) {
      toast.error(error.message, { id: 'stripe-edit' });
    } finally {
      setIsLinking(false);
    }
  }, [activityData, editProductId, editPriceId, editCheckoutUrl, onUpdate]);

  const handleRemovePayment = useCallback(() => {
    setShowRemoveDialog(true);
  }, []);

  const confirmRemovePayment = useCallback(() => {
    onUpdate({
      ...activityData,
      stripeProductId: undefined,
      stripePriceId: undefined,
      stripePrices: undefined,
      stripeCheckoutUrl: undefined,
      stripeSyncStatus: 'not_synced' as SyncStatus,
    });
    setSyncStatus('not_synced');
    setManualProductId('');
    setManualPriceId('');
    setStripeCheckoutUrl('');
    setShowRemoveDialog(false);
    toast.success('Payment configuration removed');
  }, [activityData, onUpdate]);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    syncStatus,
    isCreating,
    isLinking,
    isRefreshing,
    errorMessage,
    manualProductId,
    manualPriceId,
    stripeCheckoutUrl,
    showRemoveDialog,
    showEditDialog,
    editProductId,
    editPriceId,
    editCheckoutUrl,
    isConfigured,
    hasPrice,
    isCheckoutConnected,
    setManualProductId,
    setManualPriceId,
    setStripeCheckoutUrl,
    setShowRemoveDialog,
    setShowEditDialog,
    setEditProductId,
    setEditPriceId,
    setEditCheckoutUrl,
    handleCreateStripeProduct,
    handleLinkExistingProduct,
    handleRefreshSync,
    handleRefreshConnection,
    handleEditConfiguration,
    handleSaveEdit,
    handleRemovePayment,
    confirmRemovePayment,
  };
}
