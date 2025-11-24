import { useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Tag, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface PromoCodeInputProps {
  onApply: (code: string, discount: number, type: 'percentage' | 'fixed') => void;
  onRemove?: () => void;
  appliedCode?: string;
  appliedDiscount?: number;
  appliedType?: 'percentage' | 'fixed';
  className?: string;
}

// Mock promo codes for demo
const PROMO_CODES: Record<string, { discount: number; type: 'percentage' | 'fixed' }> = {
  'SAVE10': { discount: 10, type: 'percentage' },
  'SAVE20': { discount: 20, type: 'percentage' },
  'FIRST': { discount: 5, type: 'fixed' },
  'WELCOME': { discount: 15, type: 'percentage' },
  'VIP': { discount: 25, type: 'percentage' },
};

export function PromoCodeInput({ onApply, onRemove, appliedCode, appliedDiscount, appliedType, className = '' }: PromoCodeInputProps) {
  const [promoInput, setPromoInput] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const handleApply = () => {
    if (!promoInput.trim()) {
      toast.error('Please enter a promo code');
      return;
    }

    setIsApplying(true);
    
    // Simulate API call
    setTimeout(() => {
      const code = promoInput.toUpperCase();
      const promoData = PROMO_CODES[code];
      
      if (promoData) {
        onApply(code, promoData.discount, promoData.type);
        toast.success(`Promo code applied! ${promoData.discount}${promoData.type === 'percentage' ? '%' : '$'} discount`);
        setPromoInput('');
      } else {
        toast.error('Invalid promo code');
      }
      
      setIsApplying(false);
    }, 500);
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
