/**
 * Fee Breakdown Component
 * 
 * Displays itemized fee breakdown during checkout for Stripe compliance.
 * Shows subtotal, service fee (if passed to customer), and total.
 * 
 * Per Stripe's guidelines:
 * - Fees must be clearly disclosed before customer enters payment info
 * - Breakdown must be itemized
 * - Fee label must be clear (e.g., "Service Fee", "Booking Fee")
 * 
 * @see https://stripe.com/docs/connect/statement-descriptors#fee-transparency
 * @version 1.0.0
 * @date 2025-12-09
 */

import React from 'react';
import { Info, CreditCard, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../ui/tooltip';

export interface FeeBreakdownItem {
  label: string;
  amount: number;
  description?: string;
  highlight?: boolean;
}

export interface FeeBreakdownProps {
  /** Subtotal before fees */
  subtotal: number;
  /** Service fee amount (platform + stripe) */
  serviceFee: number;
  /** Total amount customer pays */
  total: number;
  /** Custom fee label (default: "Service Fee") */
  feeLabel?: string;
  /** Whether fees are passed to customer */
  feesPassedToCustomer: boolean;
  /** Whether to show the fee breakdown details */
  showBreakdown?: boolean;
  /** Currency code (default: USD) */
  currency?: string;
  /** Primary color for styling */
  primaryColor?: string;
  /** Dark mode support */
  isDark?: boolean;
  /** Optional additional line items */
  lineItems?: Array<{
    label: string;
    quantity: number;
    unitPrice: number;
  }>;
  /** Optional promo discount */
  promoDiscount?: number;
  /** Optional promo code */
  promoCode?: string;
  /** Compact view mode */
  compact?: boolean;
}

export function FeeBreakdown({
  subtotal,
  serviceFee,
  total,
  feeLabel = 'Service Fee',
  feesPassedToCustomer,
  showBreakdown = true,
  currency = 'USD',
  primaryColor = '#4F46E5',
  isDark = false,
  lineItems,
  promoDiscount,
  promoCode,
  compact = false,
}: FeeBreakdownProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const bgColor = isDark ? 'bg-gray-800/50' : 'bg-gray-50';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';
  const textColor = isDark ? 'text-gray-100' : 'text-gray-900';
  const mutedColor = isDark ? 'text-gray-400' : 'text-gray-500';
  const accentBg = isDark ? 'bg-indigo-900/30' : 'bg-indigo-50';

  if (compact) {
    return (
      <div className={`p-3 rounded-lg ${bgColor} border ${borderColor}`}>
        <div className="flex justify-between items-center">
          <span className={`text-sm ${mutedColor}`}>Total</span>
          <span className={`text-lg font-bold ${textColor}`}>
            {formatCurrency(total)}
          </span>
        </div>
        {feesPassedToCustomer && serviceFee > 0 && showBreakdown && (
          <p className={`text-xs ${mutedColor} mt-1`}>
            Includes {formatCurrency(serviceFee)} {feeLabel.toLowerCase()}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`rounded-lg ${bgColor} border ${borderColor} overflow-hidden`}>
      {/* Header */}
      <div className={`px-4 py-3 border-b ${borderColor} flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4" style={{ color: primaryColor }} />
          <span className={`text-sm font-medium ${textColor}`}>Order Summary</span>
        </div>
        {showBreakdown && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className={`h-4 w-4 ${mutedColor}`} />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-[200px]">
                  Prices include all applicable taxes. Service fees help cover payment processing.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Line Items */}
      <div className="px-4 py-3 space-y-2">
        <AnimatePresence>
          {/* Individual line items if provided */}
          {lineItems && lineItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex justify-between text-sm ${mutedColor}`}
            >
              <span>
                {item.label}
                {item.quantity > 1 && (
                  <span className="ml-1 text-xs">×{item.quantity}</span>
                )}
              </span>
              <span>{formatCurrency(item.unitPrice * item.quantity)}</span>
            </motion.div>
          ))}

          {/* Subtotal */}
          {!lineItems && (
            <div className={`flex justify-between text-sm ${mutedColor}`}>
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
          )}

          {/* Promo Discount */}
          {promoDiscount && promoDiscount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-between text-sm text-green-600"
            >
              <span className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Promo {promoCode && `(${promoCode})`}
              </span>
              <span>-{formatCurrency(promoDiscount)}</span>
            </motion.div>
          )}

          {/* Service Fee - Only show if passed to customer */}
          {feesPassedToCustomer && serviceFee > 0 && showBreakdown && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex justify-between text-sm ${mutedColor}`}
            >
              <span className="flex items-center gap-1">
                {feeLabel}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3 w-3" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs max-w-[180px]">
                        This fee covers secure payment processing and booking management.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </span>
              <span>{formatCurrency(serviceFee)}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Total */}
      <div className={`px-4 py-3 border-t ${borderColor} ${accentBg}`}>
        <div className="flex justify-between items-center">
          <span className={`font-medium ${textColor}`}>Total</span>
          <span 
            className="text-xl font-bold"
            style={{ color: primaryColor }}
          >
            {formatCurrency(total)}
          </span>
        </div>
        
        {/* Compliance notice for fee transparency */}
        {feesPassedToCustomer && serviceFee > 0 && (
          <p className={`text-xs ${mutedColor} mt-2`}>
            By proceeding, you agree to pay the total amount shown including all fees.
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Minimal fee disclosure for inline use
 */
export function FeeDisclosure({
  serviceFee,
  feeLabel = 'Service Fee',
  feesPassedToCustomer,
  isDark = false,
}: {
  serviceFee: number;
  feeLabel?: string;
  feesPassedToCustomer: boolean;
  isDark?: boolean;
}) {
  if (!feesPassedToCustomer || serviceFee <= 0) {
    return null;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const mutedColor = isDark ? 'text-gray-400' : 'text-gray-500';

  return (
    <p className={`text-xs ${mutedColor} flex items-center gap-1`}>
      <Info className="h-3 w-3" />
      A {formatCurrency(serviceFee)} {feeLabel.toLowerCase()} will be added at checkout
    </p>
  );
}

export default FeeBreakdown;
