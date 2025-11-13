/**
 * Stripe Configuration Modal
 * Allows users to view, disconnect, and reconfigure Stripe payment settings
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Separator } from '../ui/separator';
import {
  CreditCard,
  Unlink,
  Edit,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Loader2,
  Link as LinkIcon,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { StripeProductService } from '../../lib/stripe/stripeProductService';
import { supabase } from '../../lib/supabase/client';

interface StripeConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameData: any;
  onUpdate: (data: any) => void;
}

export function StripeConfigurationModal({
  isOpen,
  onClose,
  gameData,
  onUpdate,
}: StripeConfigurationModalProps) {
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Edit form state
  const [productId, setProductId] = useState(gameData.stripeProductId || '');
  const [priceId, setPriceId] = useState(gameData.stripePriceId || '');
  const [checkoutUrl, setCheckoutUrl] = useState(gameData.stripeCheckoutUrl || '');

  const hasStripeConfig = !!(gameData.stripeProductId || gameData.stripeCheckoutUrl);

  /**
   * Handle disconnecting Stripe configuration
   */
  const handleDisconnect = async () => {
    setIsProcessing(true);
    try {
      console.log('🔌 Disconnecting Stripe configuration...');

      // Update database to remove Stripe IDs
      const { error } = await (supabase
        .from('games')
        .update({
          stripe_product_id: null,
          stripe_price_id: null,
          stripe_checkout_url: null,
          stripe_sync_status: 'not_synced',
          stripe_last_sync: null,
        }) as any)
        .eq('id', gameData.id);

      if (error) {
        console.error('Error disconnecting Stripe:', error);
        toast.error('Failed to disconnect Stripe configuration');
        return;
      }

      // Update parent component
      onUpdate({
        stripeProductId: null,
        stripePriceId: null,
        stripeCheckoutUrl: null,
        stripeSyncStatus: 'not_synced',
        stripeLastSync: null,
      });

      toast.success('Stripe configuration disconnected successfully');
      setShowDisconnectDialog(false);
      onClose();
    } catch (err) {
      console.error('Error disconnecting:', err);
      toast.error('Failed to disconnect Stripe configuration');
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Handle linking/updating Stripe configuration
   */
  const handleLinkProduct = async () => {
    const trimmedProductId = productId.trim();
    const trimmedCheckoutUrl = checkoutUrl.trim();

    if (!trimmedProductId && !trimmedCheckoutUrl) {
      toast.error('Please enter either a Stripe Product ID or a Checkout URL');
      return;
    }

    setIsProcessing(true);
    try {
      console.log('🔗 Linking Stripe product...');

      let result: any = {};

      if (trimmedProductId) {
        // Link existing product and fetch prices
        result = await StripeProductService.linkExistingProduct(trimmedProductId);
        console.log('✅ Product linked:', result);
      }

      // Update database
      const { error } = await (supabase
        .from('games')
        .update({
          stripe_product_id: trimmedProductId || null,
          stripe_price_id: priceId.trim() || result.priceId || null,
          stripe_checkout_url: trimmedCheckoutUrl || null,
          stripe_sync_status: 'synced',
          stripe_last_sync: new Date().toISOString(),
        }) as any)
        .eq('id', gameData.id);

      if (error) {
        console.error('Error updating game:', error);
        toast.error('Failed to update Stripe configuration');
        return;
      }

      // Update parent component
      onUpdate({
        stripeProductId: trimmedProductId || null,
        stripePriceId: priceId.trim() || result.priceId || null,
        stripeCheckoutUrl: trimmedCheckoutUrl || null,
        stripeSyncStatus: 'synced',
        stripeLastSync: new Date().toISOString(),
      });

      toast.success('Stripe configuration updated successfully');
      setMode('view');
    } catch (err: any) {
      console.error('Error linking product:', err);
      toast.error(err.message || 'Failed to link Stripe product');
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Reset form to current game data
   */
  const handleCancelEdit = () => {
    setProductId(gameData.stripeProductId || '');
    setPriceId(gameData.stripePriceId || '');
    setCheckoutUrl(gameData.stripeCheckoutUrl || '');
    setMode('view');
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Stripe Payment Configuration
            </DialogTitle>
            <DialogDescription>
              Manage Stripe payment settings for {gameData.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Current Status */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                {hasStripeConfig ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Stripe Connected</p>
                      <p className="text-sm text-muted-foreground">
                        Checkout is enabled for this game
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="font-medium">Not Connected</p>
                      <p className="text-sm text-muted-foreground">
                        No Stripe configuration found
                      </p>
                    </div>
                  </>
                )}
              </div>
              {hasStripeConfig && mode === 'view' && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Active
                </Badge>
              )}
            </div>

            <Separator />

            {/* View Mode */}
            {mode === 'view' && hasStripeConfig && (
              <div className="space-y-4">
                <div className="grid gap-4">
                  {gameData.stripeProductId && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Stripe Product ID</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          value={gameData.stripeProductId}
                          readOnly
                          className="font-mono text-sm bg-muted"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            navigator.clipboard.writeText(gameData.stripeProductId);
                            toast.success('Product ID copied to clipboard');
                          }}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {gameData.stripePriceId && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Stripe Price ID</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          value={gameData.stripePriceId}
                          readOnly
                          className="font-mono text-sm bg-muted"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            navigator.clipboard.writeText(gameData.stripePriceId);
                            toast.success('Price ID copied to clipboard');
                          }}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {gameData.stripeCheckoutUrl && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Checkout URL</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          value={gameData.stripeCheckoutUrl}
                          readOnly
                          className="font-mono text-sm bg-muted"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => window.open(gameData.stripeCheckoutUrl, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    This Stripe configuration is active and being used for checkout. You can
                    reconfigure or disconnect it below.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Edit Mode */}
            {mode === 'edit' && (
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Enter your Stripe Product ID, Price ID, or Checkout URL. At least one field is
                    required.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="productId">
                      Stripe Product ID <span className="text-muted-foreground">(Optional)</span>
                    </Label>
                    <Input
                      id="productId"
                      placeholder="prod_xxxxxxxxxxxxx"
                      value={productId}
                      onChange={(e) => setProductId(e.target.value)}
                      className="font-mono"
                    />
                    <p className="text-xs text-muted-foreground">
                      Find this in your Stripe dashboard
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priceId">
                      Stripe Price ID <span className="text-muted-foreground">(Optional)</span>
                    </Label>
                    <Input
                      id="priceId"
                      placeholder="price_xxxxxxxxxxxxx"
                      value={priceId}
                      onChange={(e) => setPriceId(e.target.value)}
                      className="font-mono"
                    />
                    <p className="text-xs text-muted-foreground">
                      Leave empty to fetch all prices automatically
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="checkoutUrl">
                      Stripe Checkout URL <span className="text-muted-foreground">(Optional)</span>
                    </Label>
                    <Input
                      id="checkoutUrl"
                      placeholder="https://buy.stripe.com/..."
                      value={checkoutUrl}
                      onChange={(e) => setCheckoutUrl(e.target.value)}
                      className="font-mono"
                    />
                    <p className="text-xs text-muted-foreground">
                      Direct checkout link for users
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* No Configuration - Show Edit Mode */}
            {!hasStripeConfig && mode === 'view' && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No Stripe configuration found. Click "Configure" to link a Stripe product.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter className="flex items-center justify-between">
            <div className="flex gap-2">
              {hasStripeConfig && mode === 'view' && (
                <Button
                  variant="destructive"
                  onClick={() => setShowDisconnectDialog(true)}
                  disabled={isProcessing}
                >
                  <Unlink className="h-4 w-4 mr-2" />
                  Disconnect
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              {mode === 'view' ? (
                <>
                  <Button variant="outline" onClick={onClose}>
                    Close
                  </Button>
                  <Button onClick={() => setMode('edit')}>
                    <Edit className="h-4 w-4 mr-2" />
                    {hasStripeConfig ? 'Reconfigure' : 'Configure'}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={handleCancelEdit} disabled={isProcessing}>
                    Cancel
                  </Button>
                  <Button onClick={handleLinkProduct} disabled={isProcessing}>
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <LinkIcon className="h-4 w-4 mr-2" />
                        Save Configuration
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disconnect Confirmation Dialog */}
      <AlertDialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect Stripe Configuration?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                This will remove all Stripe payment settings for <strong>{gameData.name}</strong>.
              </p>
              <p className="text-amber-600 font-medium">
                ⚠️ Checkout will be disabled until you reconfigure Stripe.
              </p>
              <p>Are you sure you want to continue?</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisconnect}
              disabled={isProcessing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Disconnecting...
                </>
              ) : (
                <>
                  <Unlink className="h-4 w-4 mr-2" />
                  Yes, Disconnect
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
