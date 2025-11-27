/**
 * Payment Settings Types
 * Enterprise-grade type definitions for Stripe payment integration
 * 
 * @module payment/types
 * @version 1.0.0
 */

import { ActivityData } from '../../types';

// ============================================================================
// STRIPE SYNC STATUS
// ============================================================================

export type SyncStatus = 'not_synced' | 'pending' | 'synced' | 'error';

// ============================================================================
// PRICE TIER TYPES
// ============================================================================

export interface PriceTier {
  price_id: string;
  lookup_key: string;
  amount: number;
  currency: string;
}

export interface CustomPriceTier extends PriceTier {
  id: string;
  name: string;
  min: number;
  max: number;
}

export interface StripePrices {
  adult?: PriceTier | null;
  child?: PriceTier | null;
  custom?: CustomPriceTier[];
}

// ============================================================================
// COMPONENT PROPS
// ============================================================================

export interface PaymentSettingsProps {
  activityData: ActivityData;
  onUpdate: (data: ActivityData) => void;
  onNext: () => void;
  onPrevious: () => void;
  t: any;
  venueId?: string;
  organizationId?: string;
}

export interface PaymentStatusCardProps {
  isConfigured: boolean;
  isCheckoutConnected: boolean;
  syncStatus: SyncStatus;
  productId: string;
  priceId: string;
  adultPrice?: number;
  lastSync?: string;
  foundInWidget?: boolean;
  onCopy: (text: string) => void;
}

export interface CreateProductTabProps {
  hasPrice: boolean;
  isCreating: boolean;
  adultPrice: number;
  childPrice: number;
  customFieldsCount: number;
  onCreateProduct: () => Promise<void>;
}

export interface LinkProductTabProps {
  productId: string;
  priceId: string;
  checkoutUrl: string;
  isLinking: boolean;
  onProductIdChange: (value: string) => void;
  onPriceIdChange: (value: string) => void;
  onCheckoutUrlChange: (value: string) => void;
  onLinkProduct: () => Promise<void>;
}

export interface ConfiguredPaymentViewProps {
  productId: string;
  priceId: string;
  adultPrice?: number;
  childPrice?: number;
  stripePrices?: StripePrices;
  lastSync?: string;
  isCheckoutConnected: boolean;
  foundInWidget?: boolean;
  onRefresh: () => Promise<void>;
  onEdit: () => void;
  onRemove: () => void;
  isRefreshing: boolean;
}

// ============================================================================
// HOOK RETURN TYPE
// ============================================================================

export interface UsePaymentSettingsReturn {
  // State
  syncStatus: SyncStatus;
  isCreating: boolean;
  isLinking: boolean;
  isRefreshing: boolean;
  errorMessage: string;
  manualProductId: string;
  manualPriceId: string;
  stripeCheckoutUrl: string;
  showRemoveDialog: boolean;
  showEditDialog: boolean;
  editProductId: string;
  editPriceId: string;
  editCheckoutUrl: string;
  
  // Computed
  isConfigured: boolean;
  hasPrice: boolean;
  isCheckoutConnected: boolean;
  
  // Setters
  setManualProductId: (value: string) => void;
  setManualPriceId: (value: string) => void;
  setStripeCheckoutUrl: (value: string) => void;
  setShowRemoveDialog: (value: boolean) => void;
  setShowEditDialog: (value: boolean) => void;
  setEditProductId: (value: string) => void;
  setEditPriceId: (value: string) => void;
  setEditCheckoutUrl: (value: string) => void;
  
  // Actions
  handleCreateStripeProduct: () => Promise<void>;
  handleLinkExistingProduct: () => Promise<void>;
  handleRefreshSync: () => Promise<void>;
  handleRefreshConnection: () => Promise<void>;
  handleEditConfiguration: () => void;
  handleSaveEdit: () => Promise<void>;
  handleRemovePayment: () => void;
  confirmRemovePayment: () => void;
}
