/**
 * Create Product Form Component
 * Form for creating new Stripe products with multi-tier pricing
 * 
 * @module payment/CreateProductForm
 */

import React from 'react';
import { Button } from '../../../ui/button';
import { Alert, AlertDescription } from '../../../ui/alert';
import { CreditCard, Loader2, Info } from 'lucide-react';

interface CreateProductFormProps {
  hasPrice: boolean;
  isCreating: boolean;
  adultPrice: number;
  childPrice: number;
  customFieldsCount: number;
  onCreateProduct: () => Promise<void>;
}

export const CreateProductForm: React.FC<CreateProductFormProps> = ({
  hasPrice,
  isCreating,
  adultPrice,
  childPrice,
  customFieldsCount,
  onCreateProduct,
}) => {
  return (
    <div className="space-y-4">
      {/* Price Summary */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h4 className="font-medium mb-2">Pricing Summary</h4>
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

      {/* Info Alert */}
      {!hasPrice && (
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            Set a price in Step 2 (Capacity & Pricing) to enable Stripe integration.
          </AlertDescription>
        </Alert>
      )}

      {/* Create Button */}
      <Button
        onClick={onCreateProduct}
        disabled={isCreating || !hasPrice}
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
      {hasPrice && (
        <Alert className="bg-blue-50 border-blue-200">
          <AlertDescription className="text-xs text-blue-800">
            ✓ Checkout will be automatically enabled after product creation
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default CreateProductForm;
