/**
 * Step 6: Payment Settings
 * Stripe integration for activity payments using Supabase Edge Functions
 * Version: 1.1.0 - Auto-detect and refresh connection status
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Badge } from '../../ui/badge';
import { Separator } from '../../ui/separator';
import { Alert, AlertDescription } from '../../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../ui/alert-dialog';
import {
  CreditCard,
  Check,
  AlertCircle,
  Loader2,
  ExternalLink,
  DollarSign,
  Link as LinkIcon,
  RefreshCw,
  Trash2,
  Edit,
  RotateCw,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { StripeProductService } from '../../../lib/stripe/stripeProductService';
import { supabase } from '../../../lib/supabase/client';
import { StripeConfigurationModal } from '../StripeConfigurationModal';
import { ActivityData } from '../types';

interface PaymentSettingsProps {
  activityData: ActivityData;
  onUpdate: (data: ActivityData) => void;
  onNext: () => void;
  onPrevious: () => void;
  t: any;
  venueId?: string;
  organizationId?: string;
}

type SyncStatus = 'not_synced' | 'pending' | 'synced' | 'error';

export default function Step6PaymentSettings({
  activityData,
  onUpdate,
  onNext,
  onPrevious,
  t,
  venueId,
  organizationId
}: PaymentSettingsProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [manualProductId, setManualProductId] = useState(activityData.stripeProductId || '');
  const [manualPriceId, setManualPriceId] = useState(activityData.stripePriceId || '');
  const [manualLookupKey, setManualLookupKey] = useState('');
  const [stripeCheckoutUrl, setStripeCheckoutUrl] = useState(activityData.stripeCheckoutUrl || '');
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(activityData.stripeSyncStatus || 'not_synced');
  const [errorMessage, setErrorMessage] = useState('');
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editProductId, setEditProductId] = useState('');
  const [editPriceId, setEditPriceId] = useState('');
  const [editCheckoutUrl, setEditCheckoutUrl] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [venueMatches, setVenueMatches] = useState(true);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Sync state with activityData when it changes (important for edit mode)
  useEffect(() => {
    console.log('🔍 Step6PaymentSettings - activityData received:', {
      stripeProductId: activityData.stripeProductId,
      stripePriceId: activityData.stripePriceId,
      stripePrices: activityData.stripePrices,
      stripeCheckoutUrl: activityData.stripeCheckoutUrl,
      stripeSyncStatus: activityData.stripeSyncStatus,
      stripeLastSync: activityData.stripeLastSync
    });

    if (activityData.stripeProductId) {
      setManualProductId(activityData.stripeProductId);
    }
    if (activityData.stripePriceId) {
      setManualPriceId(activityData.stripePriceId);
    }
    if (activityData.stripeCheckoutUrl) {
      setStripeCheckoutUrl(activityData.stripeCheckoutUrl);
    }
    if (activityData.stripeSyncStatus) {
      setSyncStatus(activityData.stripeSyncStatus);
    }
  }, [activityData.stripeProductId, activityData.stripePriceId, activityData.stripeCheckoutUrl, activityData.stripeSyncStatus]);

  /**
   * Check connection status from database and widget settings
   * Fetches fresh activity data from Supabase and cross-references with widget configuration
   * Shows connected UI if product_id exists in database or widget settings
   * Provides enhanced feedback about where the configuration was found
   */
  const handleRefreshConnection = async () => {
    setIsRefreshing(true);
    try {
      console.log('🔍 Checking Stripe connection from database and widget settings...');

      // Fetch fresh activity data from Supabase
      if (activityData.id) {
        const { data: freshActivity, error } = await supabase
          .from('activities')
          .select('*')
          .eq('id', activityData.id)
          .single();

        if (error) {
          console.error('Error fetching activity:', error);
          toast.error('Failed to check connection status');
          return;
        }

        if (freshActivity) {
          const stripeProductId = (freshActivity as any).stripe_product_id;
          const stripePriceId = (freshActivity as any).stripe_price_id;
          const venueId = (freshActivity as any).venue_id;

          console.log('✅ Fresh activity data from database:', {
            stripe_product_id: stripeProductId,
            stripe_price_id: stripePriceId,
            stripe_sync_status: (freshActivity as any).stripe_sync_status,
            venue_id: venueId
          });

          // Check if product exists in database
          const hasStripeProduct = !!stripeProductId;

          // ENHANCED: Cross-reference with widget settings
          let foundInWidget = false;
          let widgetCheckoutUrl = null;

          if (venueId && stripeProductId) {
            try {
              // Fetch venue widget configuration
              const { data: venue, error: venueError } = await supabase
                .from('venues')
                .select('widget_config')
                .eq('id', venueId)
                .single();

              if (!venueError && venue && (venue as any).widget_config) {
                const widgetConfig = (venue as any).widget_config;
                const widgetActivities = widgetConfig.activities || [];

                // Find this activity in widget settings
                const widgetActivity = widgetActivities.find((g: any) =>
                  (g.stripe_product_id === stripeProductId || g.stripeProductId === stripeProductId) ||
                  g.id === activityData.id
                );

                if (widgetActivity) {
                  const widgetProductId = widgetActivity.stripe_product_id || widgetActivity.stripeProductId;
                  if (widgetProductId === stripeProductId) {
                    foundInWidget = true;
                    widgetCheckoutUrl = widgetActivity.stripe_checkout_url || widgetActivity.stripeCheckoutUrl;
                    console.log('✅ Product ID found in widget settings!', {
                      productId: widgetProductId,
                      priceId: widgetActivity.stripe_price_id || widgetActivity.stripePriceId,
                      checkoutUrl: widgetCheckoutUrl
                    });
                  }
                }
              }
            } catch (widgetErr) {
              console.warn('Could not check widget settings:', widgetErr);
              // Non-critical, continue with database check
            }
          }

          if (hasStripeProduct) {
            console.log('✅ Stripe product found in database');
            setVenueMatches(true);
            setSyncStatus('synced');
            setErrorMessage('');

            // Show enhanced success message
            if (foundInWidget) {
              toast.success('✅ Stripe Connected - Found in database and widget settings!', {
                description: 'Your payment configuration is active across all systems',
                duration: 5000,
              });
            } else {
              toast.success('✅ Stripe Connected - Product found in database', {
                description: 'Configure widget settings to enable checkout on your booking page',
                duration: 5000,
              });
            }
          } else {
            console.log('ℹ️ No Stripe product configured');
            setVenueMatches(false);
            setSyncStatus('not_synced');
            toast.info('No Stripe product configured yet', {
              description: 'Create or link a Stripe product to enable payments',
            });
          }

          // Update local state with fresh data from database
          setManualProductId(stripeProductId || '');
          setManualPriceId(stripePriceId || '');
          setStripeCheckoutUrl(widgetCheckoutUrl || (freshActivity as any).stripe_checkout_url || '');

          if ((freshActivity as any).stripe_sync_status) {
            setSyncStatus((freshActivity as any).stripe_sync_status);
          }

          // Update parent component with fresh data
          onUpdate({
            ...activityData,
            stripeProductId: stripeProductId || undefined,
            stripePriceId: stripePriceId || undefined,
            stripePrices: (freshActivity as any).stripe_prices,
            stripeCheckoutUrl: (widgetCheckoutUrl || (freshActivity as any).stripe_checkout_url) || undefined,
            stripeSyncStatus: ((freshActivity as any).stripe_sync_status || (hasStripeProduct ? 'synced' : 'not_synced')) as SyncStatus,
            stripeLastSync: new Date().toISOString(),
            foundInWidget: foundInWidget,
          });
        }
      }
    } catch (err) {
      console.error('Error checking connection:', err);
      toast.error('Failed to check connection status');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Check if payment is already configured
  // Use STATE variables (not activityData prop) for detection - this ensures UI updates when state changes
  // An activity is configured if it has at least a product ID (price ID is optional)
  const isConfigured = !!manualProductId && venueMatches;
  const hasPrice = activityData.adultPrice && activityData.adultPrice > 0;
  // Checkout is "connected" if we have valid Stripe product and price with synced status
  const isCheckoutConnected = !!(
    manualProductId &&
    manualPriceId &&
    (syncStatus === 'synced' || syncStatus === 'pending')
  );

  console.log('🎯 Step6PaymentSettings - Configuration Status:', {
    isConfigured,
    hasPrice,
    isCheckoutConnected,
    productId: manualProductId,
    priceId: manualPriceId,
    syncStatus: syncStatus,
    activityDataProductId: activityData.stripeProductId,
    activityDataPriceId: activityData.stripePriceId,
    rawActivityData: {
      stripeProductId: activityData.stripeProductId,
      stripePriceId: activityData.stripePriceId,
      stripeSyncStatus: activityData.stripeSyncStatus
    }
  });

  /**
   * Create new Stripe product with multiple pricing options
   */
  const handleCreateStripeProduct = async () => {
    if (!hasPrice) {
      toast.error('Please set a price in Capacity & Pricing step first');
      return;
    }

    console.log('🚀 Starting Stripe product creation with Backend API...');
    console.log('📊 Activity Data:', {
      name: activityData.name,
      adultPrice: activityData.adultPrice,
      childPrice: activityData.childPrice,
    });

    setIsCreating(true);
    setSyncStatus('pending');
    setErrorMessage('');

    try {
      toast.loading('Creating Stripe product with pricing options...', { id: 'stripe-create' });

      // Build custom capacity fields for metadata
      const customCapacityFields = activityData.customCapacityFields?.filter((f: any) => f.price > 0).map((field: any) => ({
        id: field.id,
        name: field.name,
        min: field.min || 0,
        max: field.max || 10,
        price: field.price,
      })) || [];

      console.log('💰 Pricing details:', {
        adult: activityData.adultPrice,
        child: activityData.childPrice,
        custom: customCapacityFields,
      });

      // Create product and price using backend API
      const result = await StripeProductService.createProductAndPrice({
        name: activityData.name || `Untitled ${t.singular}`,
        description: activityData.description || '',
        price: activityData.adultPrice,
        currency: 'usd',
        childPrice: activityData.childPrice > 0 ? activityData.childPrice : undefined,
        customCapacityFields: customCapacityFields.length > 0 ? customCapacityFields : undefined,
        metadata: {
          activity_id: activityData.id || '', // Track which service item this product belongs to
          duration: activityData.duration?.toString() || '60',
          category: activityData.category || '',
          difficulty: activityData.difficulty?.toString() || '3',
          venue_id: venueId || activityData.venueId || '',
          organization_id: organizationId || '',
          image_url: activityData.coverImage || '',
        },
      });

      console.log('✅ Product created:', result);

      // Update activity data with Stripe IDs
      // Note: Checkout is automatically enabled when Stripe product exists
      const updatedData = {
        ...activityData,
        stripeProductId: result.productId,
        stripePriceId: result.priceId,
        stripePrices: result.prices,
        stripeSyncStatus: 'synced' as SyncStatus,
        stripeLastSync: new Date().toISOString(),
      };

      onUpdate(updatedData);
      setSyncStatus('synced');

      toast.success('Stripe product created successfully!', { id: 'stripe-create' });
    } catch (error: any) {
      console.error('❌ STRIPE PRODUCT CREATION ERROR:', {
        message: error.message,
        stack: error.stack,
        error: error,
      });
      setSyncStatus('error');

      // Provide helpful error messages for common issues
      let errorMsg = error.message || 'Failed to create Stripe product';
      let helpText = '';

      if (errorMsg.includes('non-2xx') || errorMsg.includes('Edge Function')) {
        errorMsg = 'Stripe API not configured';
        helpText = 'Please ensure STRIPE_SECRET_KEY is set in Supabase Edge Function secrets. Run: supabase secrets set STRIPE_SECRET_KEY=sk_...';
      } else if (errorMsg.includes('Invalid API Key') || errorMsg.includes('api_key')) {
        errorMsg = 'Invalid Stripe API Key';
        helpText = 'Check your STRIPE_SECRET_KEY in Supabase secrets';
      }

      setErrorMessage(errorMsg);
      toast.error(errorMsg, {
        id: 'stripe-create',
        description: helpText || undefined,
        duration: 8000,
      });
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * Link existing Stripe product and fetch all prices
   * OR just save checkout URL if provided without product ID
   */
  const handleLinkExistingProduct = async () => {
    const productId = manualProductId.trim();
    const checkoutUrl = stripeCheckoutUrl.trim();

    // If checkout URL is provided, Product ID becomes optional
    if (!productId && !checkoutUrl) {
      toast.error('Please enter either a Stripe Product ID or a Checkout URL');
      return;
    }

    // If only checkout URL is provided (no product ID)
    if (!productId && checkoutUrl) {
      console.log('💳 Saving checkout URL without Stripe product...');

      const updatedData = {
        ...activityData,
        stripeCheckoutUrl: checkoutUrl,
        stripeSyncStatus: 'synced' as SyncStatus,
        stripeLastSync: new Date().toISOString(),
      };

      onUpdate(updatedData);
      setSyncStatus('synced');
      toast.success('Checkout URL configured successfully!');
      return;
    }

    // Validate Product ID format if provided
    if (productId && !StripeProductService.isValidProductId(productId)) {
      toast.error('Invalid Product ID format. Should start with "prod_"');
      return;
    }

    console.log('🔗 Linking Stripe product with Backend API...');
    console.log('📦 Product ID:', productId);

    setIsLinking(true);
    setSyncStatus('pending');
    setErrorMessage('');

    try {
      toast.loading('Linking Stripe product and fetching prices...', { id: 'stripe-link' });

      // Link existing product and get all prices
      const result = await StripeProductService.linkExistingProduct({
        productId,
        priceId: manualPriceId.trim() || undefined,
      });

      console.log('✅ Product linked:', result);
      console.log('📋 Found prices:', result.prices);

      // Update activity data with product and all prices
      const updatedData = {
        ...activityData,
        stripeProductId: result.productId,
        stripePrices: result.prices, // Store all available prices
        stripePriceId: result.priceId || result.prices[0]?.priceId, // Use specified or first price
        stripeCheckoutUrl: stripeCheckoutUrl.trim() || undefined, // Store custom checkout URL
        stripeSyncStatus: 'synced' as SyncStatus,
        stripeLastSync: new Date().toISOString(),
      };

      console.log('✅ Product linked successfully');
      console.log('🎯 Checkout automatically enabled');
      console.log(`📊 ${result.prices.length} price(s) available`);

      onUpdate(updatedData);
      setSyncStatus('synced');

      toast.success(`Stripe product linked with ${result.prices.length} price(s)!`, { id: 'stripe-link' });
    } catch (error: any) {
      console.error('❌ Error linking Stripe product:', error);
      setSyncStatus('error');

      // Provide more specific error messages
      let errorMsg = error.message || 'Failed to link Stripe product';

      // Check for common issues
      if (error.message?.includes('fetch') || error.message?.includes('connect')) {
        errorMsg = 'Cannot connect to backend API. Please ensure the backend server is running and accessible.';
      } else if (error.message?.includes('404')) {
        errorMsg = 'Product not found. Please verify the Product ID exists in your Stripe dashboard.';
      } else if (error.message?.includes('401') || error.message?.includes('403')) {
        errorMsg = 'Authentication failed. Please check your Stripe API keys are configured correctly.';
      } else if (error.message?.includes('timeout')) {
        errorMsg = 'Request timed out. Please check your internet connection and try again.';
      }

      setErrorMessage(errorMsg);
      toast.error(errorMsg, { id: 'stripe-link', duration: 6000 });
    } finally {
      setIsLinking(false);
    }
  };

  /**
   * Refresh/re-sync existing product - fetch latest prices
   */
  const handleRefreshSync = async () => {
    if (!isConfigured) return;

    setSyncStatus('pending');
    setErrorMessage('');

    try {
      toast.loading('Refreshing prices from Stripe...', { id: 'stripe-sync' });

      // Fetch all current prices for the product
      const prices = await StripeProductService.getProductPrices(activityData.stripeProductId || '');

      // Transform prices to match expected format
      const transformedPrices = prices.map(p => ({
        priceId: p.id,
        unitAmount: p.unit_amount,
        currency: p.currency,
        lookupKey: p.lookup_key,
        metadata: p.metadata,
      }));

      const updatedData = {
        ...activityData,
        stripePrices: transformedPrices, // Update with latest prices
        stripeSyncStatus: 'synced' as SyncStatus,
        stripeLastSync: new Date().toISOString(),
      };

      onUpdate(updatedData);
      setSyncStatus('synced');

      toast.success(`Synced! Found ${transformedPrices.length} price(s)`, { id: 'stripe-sync' });
    } catch (error: any) {
      console.error('Error syncing with Stripe:', error);
      setSyncStatus('error');
      setErrorMessage(error.message || 'Failed to sync with Stripe');
      toast.error('Failed to sync', { id: 'stripe-sync' });
    }
  };

  // Checkout is automatically enabled when valid Stripe product/price IDs exist
  // No manual connect/disconnect needed

  /**
   * Show confirmation dialog before removing payment configuration
   */
  const handleRemovePayment = () => {
    setShowRemoveDialog(true);
  };

  /**
   * Open edit dialog with current values
   */
  const handleEditConfiguration = () => {
    setEditProductId(activityData.stripeProductId || '');
    setEditPriceId(activityData.stripePriceId || '');
    setEditCheckoutUrl(activityData.stripeCheckoutUrl || '');
    setShowEditDialog(true);
  };

  /**
   * Save edited configuration
   */
  const handleSaveEdit = async () => {
    const productId = editProductId.trim();

    // Validate Product ID if provided
    if (productId && !StripeProductService.isValidProductId(productId)) {
      toast.error('Invalid Product ID format. Should start with "prod_"');
      return;
    }

    setIsLinking(true);
    setSyncStatus('pending');
    setErrorMessage('');

    try {
      toast.loading('Updating Stripe configuration...', { id: 'stripe-edit' });

      // If product ID changed, fetch new product details
      if (productId && productId !== activityData.stripeProductId) {
        const result = await StripeProductService.linkExistingProduct({
          productId,
          priceId: editPriceId.trim() || undefined,
        });

        const updatedData = {
          ...activityData,
          stripeProductId: result.productId,
          stripePrices: result.prices,
          stripePriceId: result.priceId || result.prices[0]?.priceId,
          stripeCheckoutUrl: editCheckoutUrl.trim() || undefined,
          stripeSyncStatus: 'synced' as SyncStatus,
          stripeLastSync: new Date().toISOString(),
        };

        onUpdate(updatedData);
        setSyncStatus('synced');
        toast.success('Configuration updated successfully!', { id: 'stripe-edit' });
      } else {
        // Just update checkout URL or price ID
        const updatedData = {
          ...activityData,
          stripePriceId: editPriceId.trim() || activityData.stripePriceId,
          stripeCheckoutUrl: editCheckoutUrl.trim() || undefined,
          stripeLastSync: new Date().toISOString(),
        };

        onUpdate(updatedData);
        toast.success('Configuration updated successfully!', { id: 'stripe-edit' });
      }

      setShowEditDialog(false);
    } catch (error: any) {
      console.error('Error updating configuration:', error);
      let errorMsg = error.message || 'Failed to update configuration';

      if (error.message?.includes('fetch') || error.message?.includes('connect')) {
        errorMsg = 'Cannot connect to backend API. Please ensure the backend server is running.';
      } else if (error.message?.includes('404')) {
        errorMsg = 'Product not found. Please verify the Product ID exists in Stripe.';
      }

      toast.error(errorMsg, { id: 'stripe-edit', duration: 6000 });
    } finally {
      setIsLinking(false);
    }
  };

  /**
   * Confirm and remove payment configuration
   * Clears all Stripe-related data from the activity
   */
  const confirmRemovePayment = () => {
    const updatedData = {
      ...activityData,
      stripeProductId: undefined,
      stripePriceId: undefined,
      stripePrices: undefined,
      stripeCheckoutUrl: undefined,
      stripeSyncStatus: 'not_synced' as SyncStatus,
      stripeLastSync: undefined,
    };

    onUpdate(updatedData);
    setSyncStatus('not_synced');
    setManualProductId('');
    setManualPriceId('');
    setStripeCheckoutUrl('');
    setShowRemoveDialog(false);
    toast.success('Stripe payment configuration removed successfully');
  };

  const getSyncStatusBadge = () => {
    switch (syncStatus) {
      case 'synced':
        return <Badge className="bg-green-500"><Check className="w-3 h-3 mr-1" /> Synced</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Syncing...</Badge>;
      case 'error':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" /> Error</Badge>;
      default:
        return <Badge variant="outline">Not Configured</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Settings
            {isConfigured ? (
              <Badge className="bg-green-500">
                <Check className="w-3 h-3 mr-1" />
                {isCheckoutConnected ? 'Connected & Active' : 'Connected'}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs">Optional</Badge>
            )}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshConnection}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Checking...' : 'Check Connection'}
          </Button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {isConfigured
            ? 'Stripe integration active - Update prices or view product details below'
            : 'Create a new Stripe product or reconnect an existing one for online bookings'
          }
        </p>
        {!isConfigured && hasPrice && (
          <Alert className="mt-2 bg-purple-50 border-purple-200">
            <Info className="h-4 w-4 text-purple-600" />
            <AlertDescription className="text-xs text-purple-800">
              <strong>Reconnecting a product?</strong> Use the "Link Existing" tab to reconnect a Stripe product that was previously created or got disconnected.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Info Message */}
      {!hasPrice && (
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            Set a price in Step 2 (Capacity & Pricing) to configure payment settings. You can skip this step and set it up later.
          </AlertDescription>
        </Alert>
      )}

      {hasPrice && !isConfigured && (
        <Alert className="bg-green-50 border-green-200">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Price is set! You can now create or link a Stripe product, or skip for now and configure later.
          </AlertDescription>
        </Alert>
      )}

      {/* Connection Status Summary - For Already Configured Activities */}
      {isConfigured && (
        <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-green-900 font-semibold">Stripe Connected</h4>
                  {(activityData as any).foundInWidget && (
                    <Badge className="bg-emerald-600 text-white text-xs">
                      ✓ Active in Widget
                    </Badge>
                  )}
                </div>
                <div className="space-y-1 text-sm text-green-800">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>Product created in Stripe</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>Price configured ({activityData.adultPrice ? `$${activityData.adultPrice.toFixed(2)}` : 'N/A'})</span>
                  </div>
                  {(activityData as any).foundInWidget && (
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      <span className="font-semibold">Found in widget settings - Checkout enabled</span>
                    </div>
                  )}
                  {isCheckoutConnected ? (
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      <span className="font-semibold">Checkout enabled - Customers can book online</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-600" />
                      <span className="text-orange-700 font-semibold">Checkout disabled - Enable below to accept bookings</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Payment Status</CardTitle>
              <CardDescription>Current Stripe integration status</CardDescription>
            </div>
            {getSyncStatusBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isConfigured ? (
            <>
              <div className="grid gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Product ID</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono">
                      {manualProductId}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(manualProductId);
                        toast.success('Copied to clipboard');
                      }}
                    >
                      <LinkIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {manualPriceId && (
                  <div>
                    <Label className="text-xs text-gray-500">Price ID</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono">
                        {manualPriceId}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(manualPriceId);
                          toast.success('Copied to clipboard');
                        }}
                      >
                        <LinkIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <div>
                  <Label className="text-xs text-gray-500">Price</Label>
                  <p className="text-lg font-semibold mt-1">${activityData.adultPrice?.toFixed(2)}</p>
                </div>

                {activityData.stripeLastSync && (
                  <div>
                    <Label className="text-xs text-gray-500">Last Synced</Label>
                    <p className="text-sm mt-1">
                      {new Date(activityData.stripeLastSync).toLocaleString()}
                    </p>
                  </div>
                )}

                <div>
                  <Label className="text-xs text-gray-500">Checkout Status</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {isCheckoutConnected ? (
                      <Badge className="bg-green-500">
                        <Check className="w-3 h-3 mr-1" />
                        Ready for Checkout
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-yellow-600">
                        <Info className="w-3 h-3 mr-1" />
                        Sync Required
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {isCheckoutConnected
                      ? `Customers can book and pay for this ${t.singular.toLowerCase()}`
                      : 'Complete sync to enable checkout'}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setShowConfigModal(true)}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Configure
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefreshConnection}
                    disabled={isRefreshing}
                  >
                    {isRefreshing ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Check Connection
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://dashboard.stripe.com/products/${manualProductId}`, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View in Stripe
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleRemovePayment}
                    className="ml-auto"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove Configuration
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No payment configuration yet</p>
            </div>
          )}

          {errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Configuration Options */}
      {!isConfigured && hasPrice && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Configure Payment</CardTitle>
            <CardDescription>Create a new Stripe product or link an existing one</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="create">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="create">Create New</TabsTrigger>
                <TabsTrigger value="link">Link Existing</TabsTrigger>
              </TabsList>

              {/* Create New Product */}
              <TabsContent value="create" className="space-y-4 mt-4">
                <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Product Name:</span>
                    <span className="font-medium">{activityData.name || `Untitled ${t.singular}`}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Price:</span>
                    <span className="font-medium">${activityData.adultPrice?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Currency:</span>
                    <span className="font-medium">USD</span>
                  </div>
                  {activityData.childPrice > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Child Price:</span>
                      <span className="font-medium">${activityData.childPrice?.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <Alert>
                  <AlertDescription className="text-xs">
                    This will create a new product and price in your Stripe account.
                    The product will be automatically linked to this {t.singular.toLowerCase()}.
                  </AlertDescription>
                </Alert>

                <Button
                  onClick={handleCreateStripeProduct}
                  disabled={isCreating || !hasPrice}
                  className="w-full"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Create Stripe Product & Enable Checkout
                    </>
                  )}
                </Button>

                <Alert className="bg-blue-50 border-blue-200">
                  <AlertDescription className="text-xs text-blue-800">
                    ✓ Checkout will be automatically enabled after product creation
                  </AlertDescription>
                </Alert>
              </TabsContent>

              {/* Link Existing Product */}
              <TabsContent value="link" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="productId">Stripe Product ID (Optional if using Checkout URL)</Label>
                    <Input
                      id="productId"
                      placeholder="prod_xxxxxxxxxxxxx"
                      value={manualProductId}
                      onChange={(e) => setManualProductId(e.target.value)}
                      disabled={isLinking}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Find this in your Stripe dashboard
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="priceId">Stripe Price ID (Optional)</Label>
                    <Input
                      id="priceId"
                      placeholder="price_xxxxxxxxxxxxx"
                      value={manualPriceId}
                      onChange={(e) => setManualPriceId(e.target.value)}
                      disabled={isLinking}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Leave empty to fetch all prices automatically
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="lookupKey">Lookup Key (Optional)</Label>
                    <Input
                      id="lookupKey"
                      placeholder="adult_escape_room"
                      value={manualLookupKey}
                      onChange={(e) => setManualLookupKey(e.target.value)}
                      disabled={isLinking}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Use lookup keys to manage pricing changes without code deployment
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="checkoutUrl">Stripe Checkout URL (Optional)</Label>
                    <Input
                      id="checkoutUrl"
                      placeholder="https://buy.stripe.com/..."
                      value={stripeCheckoutUrl}
                      onChange={(e) => setStripeCheckoutUrl(e.target.value)}
                      disabled={isLinking}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Add a direct Stripe checkout link. Users will be redirected to this URL when clicking "Proceed to Checkout"
                    </p>
                  </div>

                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertDescription className="text-xs text-blue-800">
                      ✓ Checkout will be automatically enabled after linking the product
                    </AlertDescription>
                  </Alert>

                  <Button
                    onClick={handleLinkExistingProduct}
                    disabled={isLinking || (!manualProductId.trim() && !stripeCheckoutUrl.trim())}
                    className="w-full"
                  >
                    {isLinking ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <LinkIcon className="w-4 h-4 mr-2" />
                        {stripeCheckoutUrl.trim() && !manualProductId.trim()
                          ? 'Save Checkout URL & Enable'
                          : 'Link Product & Fetch Prices'}
                      </>
                    )}
                  </Button>

                  {/* Display fetched prices with lookup keys */}
                  {activityData.stripePrices && activityData.stripePrices.length > 0 && (
                    <Card className="border-green-200 bg-green-50">
                      <CardHeader>
                        <CardTitle className="text-sm text-green-900">
                          ✅ Available Prices ({activityData.stripePrices.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {activityData.stripePrices.map((price: any, index: number) => (
                          <div key={price.priceId || index} className="p-3 bg-white rounded border border-green-200">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <div className="font-semibold text-gray-900">
                                  ${((price.unitAmount || 0) / 100).toFixed(2)} {price.currency?.toUpperCase() || 'USD'}
                                </div>
                                {price.lookupKey && (
                                  <div className="text-xs mt-1">
                                    <Badge variant="outline" className="text-xs">
                                      🔑 {price.lookupKey}
                                    </Badge>
                                  </div>
                                )}
                                {price.metadata?.pricing_type && (
                                  <div className="text-xs text-gray-600 mt-1">
                                    Type: {price.metadata.pricing_type}
                                  </div>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs"
                                onClick={() => {
                                  navigator.clipboard.writeText(price.priceId);
                                  toast.success('Price ID copied!');
                                }}
                              >
                                Copy ID
                              </Button>
                            </div>
                            <code className="text-xs text-gray-500 block">
                              {price.priceId}
                            </code>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Display Checkout URL if configured */}
                  {activityData.stripeCheckoutUrl && (
                    <Card className="border-purple-200 bg-purple-50">
                      <CardHeader>
                        <CardTitle className="text-sm text-purple-900">
                          🔗 Stripe Checkout URL
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-white px-3 py-2 rounded border flex-1 truncate">
                            {activityData.stripeCheckoutUrl}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(activityData.stripeCheckoutUrl || '');
                              toast.success('Checkout URL copied!');
                            }}
                          >
                            Copy
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(activityData.stripeCheckoutUrl, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-purple-700 mt-2">
                          Users will be redirected to this URL when clicking "Proceed to Checkout"
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}



      {/* Edit Configuration Dialog */}
      <AlertDialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <AlertDialogContent className="bg-white dark:bg-[#1e1e1e] border-gray-200 dark:border-[#2a2a2a] max-w-[calc(100%-2rem)] sm:max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <Edit className="w-5 h-5 text-blue-600" />
              Edit Stripe Configuration
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400 text-left">
              Update your Stripe product, price, or checkout URL settings
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            {/* Product ID */}
            <div className="space-y-2">
              <Label htmlFor="edit-product-id" className="text-sm font-medium text-gray-900 dark:text-white">
                Stripe Product ID
              </Label>
              <Input
                id="edit-product-id"
                placeholder="prod_xxxxxxxxxxxx"
                value={editProductId}
                onChange={(e) => setEditProductId(e.target.value)}
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Find this in your Stripe dashboard
              </p>
            </div>

            {/* Price ID */}
            <div className="space-y-2">
              <Label htmlFor="edit-price-id" className="text-sm font-medium text-gray-900 dark:text-white">
                Stripe Price ID <span className="text-gray-500">(Optional)</span>
              </Label>
              <Input
                id="edit-price-id"
                placeholder="price_xxxxxxxxxxxx"
                value={editPriceId}
                onChange={(e) => setEditPriceId(e.target.value)}
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Leave empty to fetch all prices automatically
              </p>
            </div>

            {/* Checkout URL */}
            <div className="space-y-2">
              <Label htmlFor="edit-checkout-url" className="text-sm font-medium text-gray-900 dark:text-white">
                Stripe Checkout URL <span className="text-gray-500">(Optional)</span>
              </Label>
              <Input
                id="edit-checkout-url"
                placeholder="https://buy.stripe.com/..."
                value={editCheckoutUrl}
                onChange={(e) => setEditCheckoutUrl(e.target.value)}
                className="text-sm"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Add a direct Stripe checkout link for custom redirect
              </p>
            </div>
          </div>

          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogCancel
              className="w-full sm:w-auto bg-white dark:bg-[#161616] text-gray-900 dark:text-gray-300 border-gray-300 dark:border-[#2a2a2a] hover:bg-gray-50 dark:hover:bg-[#222]"
              disabled={isLinking}
            >
              Cancel
            </AlertDialogCancel>
            <Button
              onClick={handleSaveEdit}
              disabled={isLinking}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLinking ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Stripe Configuration Modal */}
      <StripeConfigurationModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        gameData={activityData}
        onUpdate={onUpdate}
      />

      {/* Remove Configuration Confirmation Dialog */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent className="bg-white dark:bg-[#1e1e1e] border-gray-200 dark:border-[#2a2a2a] max-w-[calc(100%-2rem)] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              Remove Stripe Configuration?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400 text-left space-y-2">
              <p>
                This will remove all Stripe payment configuration from this {t.singular.toLowerCase()}, including:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Product ID and Price ID</li>
                <li>All configured prices</li>
                <li>Custom checkout URL (if any)</li>
                <li>Sync status and history</li>
              </ul>
              <p className="font-semibold text-gray-700 dark:text-gray-300 mt-3">
                Note: This will NOT delete the product or prices in your Stripe account.
              </p>
              <p className="text-sm">
                Customers will no longer be able to book and pay for this {t.singular.toLowerCase()} through Stripe until you reconfigure payment settings.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogCancel
              className="w-full sm:w-auto bg-white dark:bg-[#161616] text-gray-900 dark:text-gray-300 border-gray-300 dark:border-[#2a2a2a] hover:bg-gray-50 dark:hover:bg-[#222]"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemovePayment}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove Configuration
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
