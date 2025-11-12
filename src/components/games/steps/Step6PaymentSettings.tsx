/**
 * Step 6: Payment Settings
 * Stripe integration for game payments using Supabase Edge Functions
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
  ChevronLeft,
  ChevronRight,
  X,
  Info,
  Trash2,
  Edit,
  RotateCw
} from 'lucide-react';
import { toast } from 'sonner';
import { StripeProductService } from '../../../lib/stripe/stripeProductService';
import { supabase } from '../../../lib/supabase/client';

interface PaymentSettingsProps {
  gameData: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}

type SyncStatus = 'not_synced' | 'pending' | 'synced' | 'error';

export default function Step6PaymentSettings({ 
  gameData, 
  onUpdate, 
  onNext, 
  onPrevious 
}: PaymentSettingsProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [manualProductId, setManualProductId] = useState(gameData.stripeProductId || '');
  const [manualPriceId, setManualPriceId] = useState(gameData.stripePriceId || '');
  const [manualLookupKey, setManualLookupKey] = useState('');
  const [stripeCheckoutUrl, setStripeCheckoutUrl] = useState(gameData.stripeCheckoutUrl || '');
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(gameData.stripeSyncStatus || 'not_synced');
  const [errorMessage, setErrorMessage] = useState('');
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editProductId, setEditProductId] = useState('');
  const [editPriceId, setEditPriceId] = useState('');
  const [editCheckoutUrl, setEditCheckoutUrl] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sync state with gameData when it changes (important for edit mode)
  useEffect(() => {
    console.log('🔍 Step6PaymentSettings - gameData received:', {
      stripeProductId: gameData.stripeProductId,
      stripePriceId: gameData.stripePriceId,
      stripePrices: gameData.stripePrices,
      stripeCheckoutUrl: gameData.stripeCheckoutUrl,
      stripeSyncStatus: gameData.stripeSyncStatus,
      stripeLastSync: gameData.stripeLastSync
    });
    
    if (gameData.stripeProductId) {
      setManualProductId(gameData.stripeProductId);
    }
    if (gameData.stripePriceId) {
      setManualPriceId(gameData.stripePriceId);
    }
    if (gameData.stripeCheckoutUrl) {
      setStripeCheckoutUrl(gameData.stripeCheckoutUrl);
    }
    if (gameData.stripeSyncStatus) {
      setSyncStatus(gameData.stripeSyncStatus);
    }
  }, [gameData.stripeProductId, gameData.stripePriceId, gameData.stripeCheckoutUrl, gameData.stripeSyncStatus]);

  /**
   * Refresh connection status from database
   * Fetches fresh game data and updates UI
   */
  const handleRefreshConnection = async () => {
    setIsRefreshing(true);
    try {
      console.log('🔄 Refreshing Stripe connection from database...');
      
      // Fetch fresh game data from Supabase
      if (gameData.id) {
        const { data: freshGame, error } = await supabase
          .from('games')
          .select('*')
          .eq('id', gameData.id)
          .single();

        if (error) {
          console.error('Error fetching game:', error);
          toast.error('Failed to refresh connection status');
          return;
        }

        if (freshGame) {
          console.log('✅ Fresh game data from database:', {
            stripe_product_id: (freshGame as any).stripe_product_id,
            stripe_price_id: (freshGame as any).stripe_price_id,
            stripe_sync_status: (freshGame as any).stripe_sync_status
          });

          // Update local state
          if ((freshGame as any).stripe_product_id) {
            setManualProductId((freshGame as any).stripe_product_id);
          }
          if ((freshGame as any).stripe_price_id) {
            setManualPriceId((freshGame as any).stripe_price_id);
          }
          if ((freshGame as any).stripe_checkout_url) {
            setStripeCheckoutUrl((freshGame as any).stripe_checkout_url);
          }
          if ((freshGame as any).stripe_sync_status) {
            setSyncStatus((freshGame as any).stripe_sync_status);
          }

          // Update parent component with fresh data
          onUpdate({
            stripeProductId: (freshGame as any).stripe_product_id,
            stripePriceId: (freshGame as any).stripe_price_id,
            stripePrices: (freshGame as any).stripe_prices,
            stripeCheckoutUrl: (freshGame as any).stripe_checkout_url,
            stripeSyncStatus: (freshGame as any).stripe_sync_status,
            stripeLastSync: (freshGame as any).stripe_last_sync
          });

          toast.success('Connection status refreshed');
        }
      }
    } catch (err) {
      console.error('Error refreshing connection:', err);
      toast.error('Failed to refresh connection status');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Check if payment is already configured
  // A game is configured if it has BOTH product ID and price ID (regardless of sync status)
  const isConfigured = !!(gameData.stripeProductId && gameData.stripePriceId);
  const hasPrice = gameData.adultPrice && gameData.adultPrice > 0;
  // Checkout is "connected" if we have valid Stripe product and price with synced status
  const isCheckoutConnected = !!(
    gameData.stripeProductId && 
    gameData.stripePriceId && 
    (gameData.stripeSyncStatus === 'synced' || gameData.stripeSyncStatus === 'pending')
  );
  
  console.log('🎯 Step6PaymentSettings - Configuration Status:', {
    isConfigured,
    hasPrice,
    isCheckoutConnected,
    productId: gameData.stripeProductId,
    priceId: gameData.stripePriceId,
    syncStatus: gameData.stripeSyncStatus,
    rawGameData: {
      stripeProductId: gameData.stripeProductId,
      stripePriceId: gameData.stripePriceId,
      stripeSyncStatus: gameData.stripeSyncStatus
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
    console.log('📊 Game Data:', {
      name: gameData.name,
      adultPrice: gameData.adultPrice,
      childPrice: gameData.childPrice,
    });

    setIsCreating(true);
    setSyncStatus('pending');
    setErrorMessage('');

    try {
      toast.loading('Creating Stripe product with pricing options...', { id: 'stripe-create' });

      // Build custom capacity fields for metadata
      const customCapacityFields = gameData.customCapacityFields?.filter((f: any) => f.price > 0).map((field: any) => ({
        id: field.id,
        name: field.name,
        min: field.min || 0,
        max: field.max || 10,
        price: field.price,
      })) || [];

      console.log('💰 Pricing details:', {
        adult: gameData.adultPrice,
        child: gameData.childPrice,
        custom: customCapacityFields,
      });

      // Create product and price using backend API
      const result = await StripeProductService.createProductAndPrice({
        name: gameData.name || 'Untitled Game',
        description: gameData.description || '',
        price: gameData.adultPrice,
        currency: 'usd',
        childPrice: gameData.childPrice > 0 ? gameData.childPrice : undefined,
        customCapacityFields: customCapacityFields.length > 0 ? customCapacityFields : undefined,
        metadata: {
          duration: gameData.duration?.toString() || '60',
          category: gameData.category || '',
          difficulty: gameData.difficulty?.toString() || '3',
          venue_id: gameData.venueId || '',
          image_url: gameData.imageUrl || '',
        },
      });

      console.log('✅ Product created:', result);

      // Update game data with Stripe IDs
      // Note: Checkout is automatically enabled when Stripe product exists
      const updatedData = {
        ...gameData,
        stripeProductId: result.productId,
        stripePriceId: result.priceId,
        stripeSyncStatus: 'synced' as const,
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
      const errorMsg = error.message || 'Failed to create Stripe product';
      setErrorMessage(errorMsg);
      toast.error(`Error: ${errorMsg}`, { id: 'stripe-create' });
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
        ...gameData,
        stripeCheckoutUrl: checkoutUrl,
        stripeSyncStatus: 'synced' as const,
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

      // Update game data with product and all prices
      const updatedData = {
        ...gameData,
        stripeProductId: result.productId,
        stripePrices: result.prices, // Store all available prices
        stripePriceId: result.priceId || result.prices[0]?.priceId, // Use specified or first price
        stripeCheckoutUrl: stripeCheckoutUrl.trim() || undefined, // Store custom checkout URL
        stripeSyncStatus: 'synced' as const,
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
      const prices = await StripeProductService.getProductPrices(gameData.stripeProductId);
      
      // Transform prices to match expected format
      const transformedPrices = prices.map(p => ({
        priceId: p.id,
        unitAmount: p.unit_amount,
        currency: p.currency,
        lookupKey: p.lookup_key,
        metadata: p.metadata,
      }));

      const updatedData = {
        ...gameData,
        stripePrices: transformedPrices, // Update with latest prices
        stripeSyncStatus: 'synced',
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
    setEditProductId(gameData.stripeProductId || '');
    setEditPriceId(gameData.stripePriceId || '');
    setEditCheckoutUrl(gameData.stripeCheckoutUrl || '');
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
      if (productId && productId !== gameData.stripeProductId) {
        const result = await StripeProductService.linkExistingProduct({
          productId,
          priceId: editPriceId.trim() || undefined,
        });

        const updatedData = {
          ...gameData,
          stripeProductId: result.productId,
          stripePrices: result.prices,
          stripePriceId: result.priceId || result.prices[0]?.priceId,
          stripeCheckoutUrl: editCheckoutUrl.trim() || undefined,
          stripeSyncStatus: 'synced' as const,
          stripeLastSync: new Date().toISOString(),
        };

        onUpdate(updatedData);
        setSyncStatus('synced');
        toast.success('Configuration updated successfully!', { id: 'stripe-edit' });
      } else {
        // Just update checkout URL or price ID
        const updatedData = {
          ...gameData,
          stripePriceId: editPriceId.trim() || gameData.stripePriceId,
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
   * Clears all Stripe-related data from the game
   */
  const confirmRemovePayment = () => {
    const updatedData = {
      ...gameData,
      stripeProductId: undefined,
      stripePriceId: undefined,
      stripePrices: undefined,
      stripeCheckoutUrl: undefined,
      stripeSyncStatus: 'not_synced',
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
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
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

      {/* Connection Status Summary - For Already Configured Games */}
      {isConfigured && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-green-900 font-semibold mb-1">Stripe Connected</h4>
                <div className="space-y-1 text-sm text-green-800">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>Product created in Stripe</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>Price configured ({gameData.adultPrice ? `$${gameData.adultPrice.toFixed(2)}` : 'N/A'})</span>
                  </div>
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
                      {gameData.stripeProductId}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(gameData.stripeProductId);
                        toast.success('Copied to clipboard');
                      }}
                    >
                      <LinkIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {gameData.stripePriceId && (
                  <div>
                    <Label className="text-xs text-gray-500">Price ID</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono">
                        {gameData.stripePriceId}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(gameData.stripePriceId);
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
                  <p className="text-lg font-semibold mt-1">${gameData.adultPrice?.toFixed(2)}</p>
                </div>

                {gameData.stripeLastSync && (
                  <div>
                    <Label className="text-xs text-gray-500">Last Synced</Label>
                    <p className="text-sm mt-1">
                      {new Date(gameData.stripeLastSync).toLocaleString()}
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
                      ? 'Customers can book and pay for this game' 
                      : 'Complete sync to enable checkout'}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEditConfiguration}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefreshSync}
                    disabled={syncStatus === 'pending'}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Re-sync
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://dashboard.stripe.com/products/${gameData.stripeProductId}`, '_blank')}
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
                    <span className="font-medium">{gameData.name || 'Untitled Game'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Price:</span>
                    <span className="font-medium">${gameData.adultPrice?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Currency:</span>
                    <span className="font-medium">USD</span>
                  </div>
                  {gameData.childPrice > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Child Price:</span>
                      <span className="font-medium">${gameData.childPrice?.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <Alert>
                  <AlertDescription className="text-xs">
                    This will create a new product and price in your Stripe account. 
                    The product will be automatically linked to this game.
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
                  {gameData.stripePrices && gameData.stripePrices.length > 0 && (
                    <Card className="border-green-200 bg-green-50">
                      <CardHeader>
                        <CardTitle className="text-sm text-green-900">
                          ✅ Available Prices ({gameData.stripePrices.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {gameData.stripePrices.map((price: any, index: number) => (
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
                  {gameData.stripeCheckoutUrl && (
                    <Card className="border-purple-200 bg-purple-50">
                      <CardHeader>
                        <CardTitle className="text-sm text-purple-900">
                          🔗 Stripe Checkout URL
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-white px-3 py-2 rounded border flex-1 truncate">
                            {gameData.stripeCheckoutUrl}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(gameData.stripeCheckoutUrl);
                              toast.success('Checkout URL copied!');
                            }}
                          >
                            Copy
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(gameData.stripeCheckoutUrl, '_blank')}
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

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrevious}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <Button onClick={onNext}>
          {isConfigured ? 'Next' : 'Skip for Now'}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

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
                This will remove all Stripe payment configuration from this game, including:
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
                Customers will no longer be able to book and pay for this game through Stripe until you reconfigure payment settings.
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
