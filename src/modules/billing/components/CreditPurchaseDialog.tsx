/**
 * Credit Purchase Dialog
 * Secure dialog for purchasing credit packages
 * @module billing/components
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Coins, Shield, Lock, CheckCircle2, Loader2, 
  CreditCard, ArrowRight 
} from 'lucide-react';
import type { CreditPackage } from '../types';

interface CreditPurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packages: CreditPackage[];
  onPurchase: (packageId: string) => Promise<void>;
  loading?: boolean;
  isDark?: boolean;
}

export function CreditPurchaseDialog({
  open,
  onOpenChange,
  packages,
  onPurchase,
  loading,
  isDark = false,
}: CreditPurchaseDialogProps) {
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const [purchasing, setPurchasing] = useState(false);

  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const mutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';
  const cardBg = isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50';

  const handlePurchase = async () => {
    if (!selectedPackage) return;
    setPurchasing(true);
    try {
      await onPurchase(selectedPackage.id);
    } finally {
      setPurchasing(false);
    }
  };

  const getCostPerCredit = (pkg: CreditPackage) => {
    return (pkg.price / pkg.credits).toFixed(2);
  };

  const getBestValue = () => {
    if (packages.length === 0) return null;
    return packages.reduce((best, pkg) => {
      const bestCost = best.price / best.credits;
      const currentCost = pkg.price / pkg.credits;
      return currentCost < bestCost ? pkg : best;
    });
  };

  const bestValuePkg = getBestValue();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-2xl ${isDark ? 'bg-[#161616] border-[#2a2a2a]' : ''}`}>
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 ${textClass}`}>
            <Coins className="w-5 h-5 text-purple-500" />
            Purchase Credits
          </DialogTitle>
          <DialogDescription className={mutedClass}>
            Choose a credit package. Credits never expire and can be used for bookings, 
            waivers, and AI conversations.
          </DialogDescription>
        </DialogHeader>

        {/* Security Notice - Stripe Design */}
        <div className={`flex items-center gap-3 p-3 rounded-lg ${
          isDark ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-200'
        }`}>
          <Shield className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
          <div>
            <p className={`text-sm font-medium ${isDark ? 'text-emerald-300' : 'text-emerald-800'}`}>
              Secure Payment
            </p>
            <p className={`text-xs ${isDark ? 'text-emerald-400/80' : 'text-emerald-600'}`}>
              Payments processed securely by Stripe. Your card details are never stored on our servers.
            </p>
          </div>
          <Lock className={`w-4 h-4 ml-auto ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
        </div>

        {/* Package Selection */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          {packages.map((pkg) => {
            const isSelected = selectedPackage?.id === pkg.id;
            const isBestValue = bestValuePkg?.id === pkg.id;

            return (
              <Card
                key={pkg.id}
                onClick={() => setSelectedPackage(pkg)}
                className={`relative p-4 cursor-pointer transition-all ${
                  isSelected 
                    ? isDark 
                      ? 'border-purple-500 bg-purple-500/10 ring-2 ring-purple-500/20'
                      : 'border-purple-500 bg-purple-50 ring-2 ring-purple-100'
                    : `${borderClass} ${cardBg} hover:border-purple-300`
                }`}
              >
                {isBestValue && (
                  <Badge className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs">
                    Best Value
                  </Badge>
                )}

                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isDark ? 'bg-purple-500/20' : 'bg-purple-100'
                  }`}>
                    <Coins className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-5 h-5 text-purple-500" />
                  )}
                </div>

                <h4 className={`font-semibold ${textClass}`}>{pkg.name}</h4>
                <p className={`text-2xl font-bold mt-1 ${textClass}`}>
                  {pkg.credits.toLocaleString()}
                  <span className={`text-sm font-normal ${mutedClass}`}> credits</span>
                </p>

                <Separator className={`my-3 ${borderClass}`} />

                <div className="flex items-center justify-between">
                  <span className={`text-lg font-semibold ${textClass}`}>
                    ${pkg.price}
                  </span>
                  <span className={`text-xs ${mutedClass}`}>
                    ${getCostPerCredit(pkg)}/credit
                  </span>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Summary & Purchase */}
        {selectedPackage && (
          <div className={`p-4 rounded-lg ${cardBg} border ${borderClass} mt-4`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className={`text-sm ${mutedClass}`}>Selected Package</p>
                <p className={`font-semibold ${textClass}`}>
                  {selectedPackage.name} - {selectedPackage.credits.toLocaleString()} credits
                </p>
              </div>
              <div className="text-right">
                <p className={`text-sm ${mutedClass}`}>Total</p>
                <p className={`text-xl font-bold ${textClass}`}>${selectedPackage.price}</p>
              </div>
            </div>

            <Button
              onClick={handlePurchase}
              disabled={purchasing || loading}
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
            >
              {purchasing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Redirecting to Checkout...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Proceed to Payment
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>

            <p className={`text-xs text-center mt-3 ${mutedClass}`}>
              You'll be redirected to Stripe's secure checkout
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default CreditPurchaseDialog;
