/**
 * Create Product Form Component
 * Form for creating new Stripe products with multi-tier pricing
 * Supports Multi-Tenant Stripe Connect Architecture
 * 
 * @module payment/CreateProductForm
 * @version 2.0.0
 * @date 2025-12-10
 */

import React from 'react';
import { Button } from '../../../ui/button';
import { Alert, AlertDescription } from '../../../ui/alert';
import { Badge } from '../../../ui/badge';
import { CreditCard, Loader2, Info, DollarSign } from 'lucide-react';

interface CreateProductFormProps {
  hasPrice: boolean;
  isCreating: boolean;
  adultPrice: number;
  childPrice: number;
  customFieldsCount: number;
  onCreateProduct: () => Promise<void>;
  /** Whether Stripe Connect is properly set up to create products */
  canCreateProduct?: boolean;
}

export const CreateProductForm: React.FC<CreateProductFormProps> = ({
  hasPrice,
  isCreating,
  adultPrice,
  childPrice,
  customFieldsCount,
  onCreateProduct,
  canCreateProduct = true, // Default to true for backward compatibility
}) => {
  const isDisabled = isCreating || !hasPrice || !canCreateProduct;
  
  return (
    <div className="space-y-4">
      {/* Price Summary */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium">Pricing Summary</h4>
          <Badge className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs">
            <DollarSign className="w-3 h-3 mr-1" />
            USD Only
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Adult Price:</span>
            <span className="ml-2 font-semibold">${adultPrice?.toFixed(2) || '0.00'}</span>
          </div>
          {childPrice > 0 && (
            <div>
              <span className="text-gray-500">Child Price:</span>
              <span className="ml-2 font-semibold">${childPrice.toFixed(2)}</span>
            </div>
          )}
          {customFieldsCount > 0 && (
            <div>
              <span className="text-gray-500">Custom Tiers:</span>
              <span className="ml-2 font-semibold">{customFieldsCount}</span>
            </div>
          )}
        </div>
      </div>

      {/* Info Alert - No Price */}
      {!hasPrice && (
        <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-800 dark:text-blue-300">
            Set a price in Step 2 (Capacity & Pricing) to enable Stripe integration.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Info Alert - Stripe Not Connected */}
      {hasPrice && !canCreateProduct && (
        <Alert className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
          <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-amber-800 dark:text-amber-300">
            Connect your Stripe account above before creating products.
          </AlertDescription>
        </Alert>
      )}

      {/* Create Button */}
      <Button
        onClick={onCreateProduct}
        disabled={isDisabled}
        className="w-full"
        size="lg"
      >
        {isCreating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Creating Product...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            Create Stripe Product & Enable Checkout
          </>
        )}
      </Button>

      {/* Success Info */}
      {hasPrice && canCreateProduct && (
        <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <AlertDescription className="text-xs text-blue-800 dark:text-blue-300">
            ✓ Product will be created on your connected Stripe account (USD only)
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default CreateProductForm;
