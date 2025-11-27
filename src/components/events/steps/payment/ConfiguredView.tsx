/**
 * Configured View Component
 * Displays current Stripe configuration when payment is set up
 * 
 * @module payment/ConfiguredView
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Label } from '../../../ui/label';
import { Badge } from '../../../ui/badge';
import { toast } from 'sonner';
import { 
  Check, 
  AlertCircle, 
  Link as LinkIcon, 
  RefreshCw, 
  Edit, 
  Trash2,
  ExternalLink 
} from 'lucide-react';
import { PaymentStatusBadge } from './PaymentStatusBadge';
import { SyncStatus, StripePrices } from './types';

interface ConfiguredViewProps {
  productId: string;
  priceId: string;
  adultPrice?: number;
  childPrice?: number;
  stripePrices?: StripePrices;
  lastSync?: string;
  syncStatus: SyncStatus;
  isCheckoutConnected: boolean;
  foundInWidget?: boolean;
  onRefresh: () => Promise<void>;
  onEdit: () => void;
  onRemove: () => void;
  isRefreshing?: boolean;
}

export const ConfiguredView: React.FC<ConfiguredViewProps> = ({
  productId,
  priceId,
  adultPrice,
  childPrice,
  stripePrices,
  lastSync,
  syncStatus,
  isCheckoutConnected,
  foundInWidget,
  onRefresh,
  onEdit,
  onRemove,
  isRefreshing,
}) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const priceCount = (stripePrices?.adult ? 1 : 0) + 
                     (stripePrices?.child ? 1 : 0) + 
                     (stripePrices?.custom?.length || 0);

  return (
    <div className="space-y-4">
      {/* Success Banner */}
      <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-green-900 font-semibold">Stripe Connected</h4>
                {foundInWidget && (
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
                  <span>
                    {priceCount} pricing tier{priceCount !== 1 ? 's' : ''} configured
                  </span>
                </div>
                {isCheckoutConnected ? (
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span className="font-semibold">Checkout enabled</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                    <span className="text-orange-700">Checkout disabled</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Configuration Details</CardTitle>
              <CardDescription>Stripe product and pricing info</CardDescription>
            </div>
            <PaymentStatusBadge status={syncStatus} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Product ID */}
          <div>
            <Label className="text-xs text-gray-500">Product ID</Label>
            <div className="flex items-center gap-2 mt-1">
              <code className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono truncate">
                {productId}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(productId)}
              >
                <LinkIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Price ID */}
          {priceId && (
            <div>
              <Label className="text-xs text-gray-500">Price ID</Label>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono truncate">
                  {priceId}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(priceId)}
                >
                  <LinkIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Pricing Tiers */}
          <div>
            <Label className="text-xs text-gray-500">Pricing Tiers</Label>
            <div className="mt-1 space-y-2">
              {stripePrices?.adult && (
                <div className="flex justify-between text-sm">
                  <span>Adult</span>
                  <span className="font-semibold">${stripePrices.adult.amount.toFixed(2)}</span>
                </div>
              )}
              {stripePrices?.child && (
                <div className="flex justify-between text-sm">
                  <span>Child</span>
                  <span className="font-semibold">${stripePrices.child.amount.toFixed(2)}</span>
                </div>
              )}
              {stripePrices?.custom?.map((tier) => (
                <div key={tier.id} className="flex justify-between text-sm">
                  <span>{tier.name}</span>
                  <span className="font-semibold">${tier.amount.toFixed(2)}</span>
                </div>
              ))}
              {!stripePrices && adultPrice && (
                <div className="flex justify-between text-sm">
                  <span>Price</span>
                  <span className="font-semibold">${adultPrice.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Last Sync */}
          {lastSync && (
            <div>
              <Label className="text-xs text-gray-500">Last Synced</Label>
              <p className="text-sm mt-1">
                {new Date(lastSync).toLocaleString()}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Sync Prices
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onRemove}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`https://dashboard.stripe.com/products/${productId}`, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View in Stripe
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfiguredView;
