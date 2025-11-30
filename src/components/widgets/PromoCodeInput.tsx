import { useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Tag, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface PromoCodeInputProps {
  onApply: (code: string, discount: number, type: 'percentage' | 'fixed') => void;
  onRemove?: () => void;
  appliedCode?: string;
  appliedDiscount?: number;
  appliedType?: 'percentage' | 'fixed';
  className?: string;
  organizationId?: string;
  subtotal?: number;
}

// Fallback mock promo codes for demo (when no organizationId provided)
const DEMO_PROMO_CODES: Record<string, { discount: number; type: 'percentage' | 'fixed' }> = {
  'SAVE10': { discount: 10, type: 'percentage' },
  'SAVE20': { discount: 20, type: 'percentage' },
  'FIRST': { discount: 5, type: 'fixed' },
  'WELCOME': { discount: 15, type: 'percentage' },
  'VIP': { discount: 25, type: 'percentage' },
};

/**
 * Validate promo code against Supabase database
 */
async function validatePromoCode(
  organizationId: string,
  code: string,
  subtotal: number
): Promise<{ valid: boolean; discount?: number; type?: 'percentage' | 'fixed'; message?: string }> {
  try {
    const { data: promo, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error || !promo) {
      return { valid: false, message: 'Invalid promo code' };
    }

    // Check date validity
    const now = new Date();
    if (promo.valid_until && new Date(promo.valid_until) < now) {
      return { valid: false, message: 'This promo code has expired' };
    }
    if (promo.valid_from && new Date(promo.valid_from) > now) {
      return { valid: false, message: 'This promo code is not yet active' };
    }
    
    // Check usage limit
    if (promo.max_uses && promo.current_uses >= promo.max_uses) {
      return { valid: false, message: 'This promo code has reached its usage limit' };
    }
    
    // Check minimum order
    if (promo.minimum_order_value && subtotal < promo.minimum_order_value) {
      return { 
        valid: false, 
        message: `Minimum order of $${promo.minimum_order_value.toFixed(2)} required` 
      };
    }

    // Calculate discount
    const discountAmount = promo.discount_type === 'percentage'
      ? (subtotal * promo.discount_value) / 100
      : promo.discount_value;

    return {
      valid: true,
      discount: discountAmount,
      type: promo.discount_type,
    };
  } catch (err) {
    console.error('Error validating promo code:', err);
    return { valid: false, message: 'Failed to validate promo code' };
  }
}

export function PromoCodeInput({ 
  onApply, 
  onRemove, 
  appliedCode, 
  appliedDiscount, 
  appliedType, 
  className = '',
  organizationId,
  subtotal = 0,
}: PromoCodeInputProps) {
  const [promoInput, setPromoInput] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const handleApply = async () => {
    if (!promoInput.trim()) {
      toast.error('Please enter a promo code');
      return;
    }

    setIsApplying(true);
    const code = promoInput.toUpperCase();
    
    try {
      // If organizationId is provided, validate against database
      if (organizationId) {
        const result = await validatePromoCode(organizationId, code, subtotal);
        
        if (result.valid && result.discount && result.type) {
          onApply(code, result.discount, result.type);
          toast.success(`Promo code applied! ${result.type === 'percentage' ? `${result.discount}%` : `$${result.discount.toFixed(2)}`} off`);
          setPromoInput('');
        } else {
          toast.error(result.message || 'Invalid promo code');
        }
      } else {
        // Fallback to demo codes
        const promoData = DEMO_PROMO_CODES[code];
        
        if (promoData) {
          onApply(code, promoData.discount, promoData.type);
          toast.success(`Promo code applied! ${promoData.discount}${promoData.type === 'percentage' ? '%' : '$'} discount`);
          setPromoInput('');
        } else {
          toast.error('Invalid promo code');
        }
      }
    } catch (err) {
      toast.error('Failed to validate promo code');
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove();
      toast.info('Promo code removed');
    }
  };

  if (appliedCode && appliedDiscount) {
    return (
      <div className={`flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg ${className}`}>
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-green-600" />
          <div>
            <p className="text-sm font-medium text-green-900">{appliedCode}</p>
            <p className="text-xs text-green-600">
              {appliedType === 'fixed' ? `$${appliedDiscount} discount applied` : `${appliedDiscount}% discount applied`}
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
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={promoInput}
            onChange={(e) => setPromoInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleApply()}
            placeholder="Enter promo code"
            className="pl-10 h-11"
            disabled={isApplying}
          />
        </div>
        <Button
          onClick={handleApply}
          disabled={isApplying || !promoInput.trim()}
          className="h-11 px-6"
          variant="outline"
        >
          {isApplying ? 'Applying...' : 'Apply'}
        </Button>
      </div>
      <p className="text-xs text-gray-500">
        Try: SAVE10, SAVE20, WELCOME, VIP, or FIRST
      </p>
    </div>
  );
}
