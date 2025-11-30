import { useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Gift, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface GiftCardInputProps {
  onApply: (code: string, amount: number) => void;
  onRemove?: () => void;
  appliedCode?: string;
  appliedAmount?: number;
  className?: string;
  organizationId?: string;
  subtotal?: number;
}

// Fallback mock gift cards for demo (when no organizationId provided)
const DEMO_GIFT_CARDS: Record<string, { amount: number; balance: number }> = {
  'GIFT50': { amount: 50, balance: 50 },
  'GIFT100': { amount: 100, balance: 100 },
  'HOLIDAY25': { amount: 25, balance: 25 },
  'BIRTHDAY75': { amount: 75, balance: 75 },
  'THANKYOU150': { amount: 150, balance: 150 },
};

/**
 * Validate gift card against Supabase database
 */
async function validateGiftCard(
  organizationId: string,
  code: string,
  subtotal: number
): Promise<{ valid: boolean; balance?: number; amount?: number; message?: string }> {
  try {
    const { data: giftCard, error } = await supabase
      .from('gift_cards')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error || !giftCard) {
      return { valid: false, message: 'Invalid gift card code' };
    }

    // Check expiration
    if (giftCard.expires_at && new Date(giftCard.expires_at) < new Date()) {
      return { valid: false, message: 'This gift card has expired' };
    }
    
    // Check balance
    if (giftCard.current_balance <= 0) {
      return { valid: false, message: 'This gift card has no remaining balance' };
    }

    // Calculate amount to apply (min of balance and subtotal)
    const amountToApply = Math.min(giftCard.current_balance, subtotal);

    return {
      valid: true,
      balance: giftCard.current_balance,
      amount: amountToApply,
    };
  } catch (err) {
    console.error('Error validating gift card:', err);
    return { valid: false, message: 'Failed to validate gift card' };
  }
}

export function GiftCardInput({ 
  onApply, 
  onRemove, 
  appliedCode, 
  appliedAmount, 
  className = '',
  organizationId,
  subtotal = 0,
}: GiftCardInputProps) {
  const [giftCardInput, setGiftCardInput] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const handleApply = async () => {
    if (!giftCardInput.trim()) {
      toast.error('Please enter a gift card code');
      return;
    }

    setIsApplying(true);
    const code = giftCardInput.toUpperCase();
    
    try {
      // If organizationId is provided, validate against database
      if (organizationId) {
        const result = await validateGiftCard(organizationId, code, subtotal);
        
        if (result.valid && result.amount) {
          onApply(code, result.amount);
          toast.success(`Gift card applied! $${result.balance?.toFixed(2)} balance (using $${result.amount.toFixed(2)})`);
          setGiftCardInput('');
        } else {
          toast.error(result.message || 'Invalid gift card');
        }
      } else {
        // Fallback to demo cards
        const giftCardData = DEMO_GIFT_CARDS[code];
        
        if (giftCardData) {
          const amount = Math.min(giftCardData.balance, subtotal || giftCardData.balance);
          onApply(code, amount);
          toast.success(`Gift card applied! $${giftCardData.balance.toFixed(2)} available`);
          setGiftCardInput('');
        } else {
          toast.error('Invalid gift card code');
        }
      }
    } catch (err) {
      toast.error('Failed to validate gift card');
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove();
      toast.info('Gift card removed');
    }
  };

  if (appliedCode && appliedAmount) {
    return (
      <div className={`flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg ${className}`}>
        <div className="flex items-center gap-2">
          <Gift className="w-4 h-4 text-purple-600" />
          <div>
            <p className="text-sm font-medium text-purple-900">{appliedCode}</p>
            <p className="text-xs text-purple-600">
              ${appliedAmount.toFixed(2)} gift card balance
            </p>
          </div>
        </div>
        {onRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Gift className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={giftCardInput}
            onChange={(e) => setGiftCardInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleApply()}
            placeholder="Enter gift card code"
            className="pl-10 h-11"
            disabled={isApplying}
          />
        </div>
        <Button
          onClick={handleApply}
          disabled={isApplying || !giftCardInput.trim()}
          className="h-11 px-6"
          variant="outline"
        >
          {isApplying ? 'Applying...' : 'Apply'}
        </Button>
      </div>
      <p className="text-xs text-gray-500">
        Try: GIFT50, GIFT100, HOLIDAY25, BIRTHDAY75, or THANKYOU150
      </p>
    </div>
  );
}
