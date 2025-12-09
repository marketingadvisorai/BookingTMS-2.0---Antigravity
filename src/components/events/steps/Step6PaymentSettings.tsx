/**
 * Step 6: Payment Settings
 * 
 * Enterprise-grade Stripe integration for activity payments.
 * Refactored following SOLID principles and separation of concerns.
 * 
 * Architecture:
 * - Business logic: usePaymentSettings hook
 * - UI components: Modular components in ./payment/
 * - Types: Centralized in ./payment/types.ts
 * 
 * @module Step6PaymentSettings
 * @version 2.0.0
 * @date 2025-11-27
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Alert, AlertDescription } from '../../ui/alert';
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
import { Info, Plus, Link } from 'lucide-react';
import { ActivityData } from '../types';

// Modular components
import {
  usePaymentSettings,
  PaymentHeader,
  CreateProductForm,
  LinkProductForm,
  ConfiguredView,
  PaymentStatusBadge,
  StripeConnectBanner,
} from './payment';

// ============================================================================
// PROPS
// ============================================================================

interface Step6PaymentSettingsProps {
  activityData: ActivityData;
  onUpdate: (data: ActivityData) => void;
  onNext: () => void;
  onPrevious: () => void;
  t: any;
  venueId?: string;
  organizationId?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function Step6PaymentSettings({
  activityData,
  onUpdate,
  onNext,
  onPrevious,
  t,
  venueId,
  organizationId,
}: Step6PaymentSettingsProps) {
  // All business logic is in the custom hook
  const {
    syncStatus,
    isCreating,
    isLinking,
    isRefreshing,
    manualProductId,
    manualPriceId,
    stripeCheckoutUrl,
    showRemoveDialog,
    isConfigured,
    hasPrice,
    isCheckoutConnected,
    canCreateProduct,
    stripeConnectStatus,
    isLoadingStripeStatus,
    setManualProductId,
    setManualPriceId,
    setStripeCheckoutUrl,
    setShowRemoveDialog,
    handleCreateStripeProduct,
    handleLinkExistingProduct,
    handleRefreshSync,
    handleRefreshConnection,
    handleEditConfiguration,
    handleRemovePayment,
    confirmRemovePayment,
    refreshStripeConnectStatus,
  } = usePaymentSettings({
    activityData,
    onUpdate,
    t,
    venueId,
    organizationId,
  });

  return (
    <div className="space-y-6">
      {/* Stripe Connect Status Banner (Multi-Tenant) */}
      <StripeConnectBanner
        status={stripeConnectStatus}
        isLoading={isLoadingStripeStatus}
        onRefresh={refreshStripeConnectStatus}
      />
      
      {/* Header */}
      <PaymentHeader
        isConfigured={isConfigured}
        isCheckoutConnected={isCheckoutConnected}
        isRefreshing={isRefreshing}
        onRefresh={handleRefreshConnection}
      />

      {/* Reconnect Info */}
      {!isConfigured && hasPrice && (
        <Alert className="bg-purple-50 border-purple-200">
          <Info className="h-4 w-4 text-purple-600" />
          <AlertDescription className="text-xs text-purple-800">
            <strong>Reconnecting?</strong> Use "Link Existing" to reconnect a previously created Stripe product.
          </AlertDescription>
        </Alert>
      )}

      {/* Configured View */}
      {isConfigured ? (
        <ConfiguredView
          productId={manualProductId}
          priceId={manualPriceId}
          adultPrice={activityData.adultPrice}
          childPrice={activityData.childPrice}
          stripePrices={activityData.stripePrices}
          lastSync={activityData.stripeLastSync}
          syncStatus={syncStatus}
          isCheckoutConnected={isCheckoutConnected}
          foundInWidget={(activityData as any).foundInWidget}
          onRefresh={handleRefreshSync}
          onEdit={handleEditConfiguration}
          onRemove={handleRemovePayment}
          isRefreshing={isRefreshing}
        />
      ) : (
        /* Not Configured - Show Setup Options */
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              Setup Payment
              <PaymentStatusBadge status={syncStatus} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="create">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="create" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create New
                </TabsTrigger>
                <TabsTrigger value="link" className="gap-2">
                  <Link className="w-4 h-4" />
                  Link Existing
                </TabsTrigger>
              </TabsList>

              <TabsContent value="create" className="mt-4">
                <CreateProductForm
                  hasPrice={hasPrice}
                  isCreating={isCreating}
                  adultPrice={activityData.adultPrice}
                  childPrice={activityData.childPrice}
                  customFieldsCount={activityData.customCapacityFields?.filter((f: any) => f.price > 0).length || 0}
                  onCreateProduct={handleCreateStripeProduct}
                  canCreateProduct={canCreateProduct}
                />
              </TabsContent>

              <TabsContent value="link" className="mt-4">
                <LinkProductForm
                  productId={manualProductId}
                  priceId={manualPriceId}
                  checkoutUrl={stripeCheckoutUrl}
                  isLinking={isLinking}
                  onProductIdChange={setManualProductId}
                  onPriceIdChange={setManualPriceId}
                  onCheckoutUrlChange={setStripeCheckoutUrl}
                  onLinkProduct={handleLinkExistingProduct}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Payment Configuration?</AlertDialogTitle>
            <AlertDialogDescription>
              This will disconnect the Stripe product from this activity.
              The product will still exist in Stripe but won't be linked here.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemovePayment}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
