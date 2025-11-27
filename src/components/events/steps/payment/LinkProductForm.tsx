/**
 * Link Product Form Component
 * Form for linking existing Stripe products
 * 
 * @module payment/LinkProductForm
 */

import React from 'react';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Link, Loader2 } from 'lucide-react';

interface LinkProductFormProps {
  productId: string;
  priceId: string;
  checkoutUrl: string;
  isLinking: boolean;
  onProductIdChange: (value: string) => void;
  onPriceIdChange: (value: string) => void;
  onCheckoutUrlChange: (value: string) => void;
  onLinkProduct: () => Promise<void>;
}

export const LinkProductForm: React.FC<LinkProductFormProps> = ({
  productId,
  priceId,
  checkoutUrl,
  isLinking,
  onProductIdChange,
  onPriceIdChange,
  onCheckoutUrlChange,
  onLinkProduct,
}) => {
  return (
    <div className="space-y-4">
      {/* Product ID */}
      <div>
        <Label htmlFor="productId">Stripe Product ID (Optional if using Checkout URL)</Label>
        <Input
          id="productId"
          placeholder="prod_xxxxxxxxxxxxx"
          value={productId}
          onChange={(e) => onProductIdChange(e.target.value)}
          disabled={isLinking}
        />
        <p className="text-xs text-gray-500 mt-1">
          Find this in your Stripe dashboard
        </p>
      </div>

      {/* Price ID */}
      <div>
        <Label htmlFor="priceId">Stripe Price ID (Optional)</Label>
        <Input
          id="priceId"
          placeholder="price_xxxxxxxxxxxxx"
          value={priceId}
          onChange={(e) => onPriceIdChange(e.target.value)}
          disabled={isLinking}
        />
        <p className="text-xs text-gray-500 mt-1">
          Leave empty to fetch all prices automatically
        </p>
      </div>

      {/* Checkout URL */}
      <div>
        <Label htmlFor="checkoutUrl">Custom Checkout URL (Optional)</Label>
        <Input
          id="checkoutUrl"
          placeholder="https://checkout.stripe.com/..."
          value={checkoutUrl}
          onChange={(e) => onCheckoutUrlChange(e.target.value)}
          disabled={isLinking}
        />
        <p className="text-xs text-gray-500 mt-1">
          Direct payment link for this activity
        </p>
      </div>

      {/* Link Button */}
      <Button
        onClick={onLinkProduct}
        disabled={isLinking || (!productId && !checkoutUrl)}
        className="w-full"
        variant="outline"
      >
        {isLinking ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Linking...
          </>
        ) : (
          <>
            <Link className="w-4 h-4 mr-2" />
            Link Existing Product
          </>
        )}
      </Button>
    </div>
  );
};

export default LinkProductForm;
