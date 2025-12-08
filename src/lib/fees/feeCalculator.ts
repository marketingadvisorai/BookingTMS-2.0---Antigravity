/**
 * Fee Calculator Utility
 * 
 * Handles platform management fee and Stripe fee calculations
 * with support for both fee payment modes:
 * - absorb: Organization pays all fees
 * - pass_to_customer: Customer pays fees on top
 * 
 * Platform Fee: 1.29% of ticket price
 * Stripe Fee: 2.9% + $0.30
 * 
 * @version 1.0.0
 * @date 2025-12-09
 */

export type FeePaymentMode = 'absorb' | 'pass_to_customer';

export interface FeeSettings {
  feePaymentMode: FeePaymentMode;
  platformFeePercent: number;
  stripeFeePercent: number;
  stripeFeeFixed: number;
  showFeeBreakdown: boolean;
  feeLabel: string;
}

export interface FeeCalculation {
  subtotal: number;
  platformFee: number;
  stripeFee: number;
  totalFees: number;
  customerTotal: number;
  orgReceives: number;
  feePaymentMode: FeePaymentMode;
  breakdown: FeeBreakdownItem[];
}

export interface FeeBreakdownItem {
  label: string;
  amount: number;
  description?: string;
}

// Default fee settings
export const DEFAULT_FEE_SETTINGS: FeeSettings = {
  feePaymentMode: 'pass_to_customer',
  platformFeePercent: 1.29,
  stripeFeePercent: 2.9,
  stripeFeeFixed: 0.30,
  showFeeBreakdown: true,
  feeLabel: 'Service Fee',
};

/**
 * Calculate booking fees based on subtotal and fee settings
 */
export function calculateFees(
  subtotal: number,
  settings: Partial<FeeSettings> = {}
): FeeCalculation {
  const config = { ...DEFAULT_FEE_SETTINGS, ...settings };
  const { feePaymentMode, platformFeePercent, stripeFeePercent, stripeFeeFixed } = config;

  // Platform fee is always 1.29% of ticket price
  const platformFee = round(subtotal * (platformFeePercent / 100));

  let stripeFee: number;
  let customerTotal: number;
  let orgReceives: number;

  if (feePaymentMode === 'pass_to_customer') {
    // Customer pays fees on top of ticket price
    // Calculate total including Stripe fee on the full amount
    // Formula: total = (subtotal + platformFee + stripeFeeFixed) / (1 - stripeFeePercent/100)
    customerTotal = round(
      (subtotal + platformFee + stripeFeeFixed) / (1 - stripeFeePercent / 100)
    );
    stripeFee = round(customerTotal - subtotal - platformFee);
    orgReceives = subtotal;
  } else {
    // Organization absorbs all fees
    customerTotal = subtotal;
    stripeFee = round((subtotal * (stripeFeePercent / 100)) + stripeFeeFixed);
    orgReceives = round(subtotal - platformFee - stripeFee);
  }

  const totalFees = round(platformFee + stripeFee);

  // Build breakdown for display
  const breakdown: FeeBreakdownItem[] = [
    {
      label: 'Ticket Price',
      amount: subtotal,
    },
  ];

  if (feePaymentMode === 'pass_to_customer' && config.showFeeBreakdown) {
    breakdown.push({
      label: config.feeLabel,
      amount: totalFees,
      description: 'Includes payment processing',
    });
  }

  return {
    subtotal,
    platformFee,
    stripeFee,
    totalFees,
    customerTotal,
    orgReceives,
    feePaymentMode,
    breakdown,
  };
}

/**
 * Calculate fees for multiple line items
 */
export function calculateMultiItemFees(
  items: Array<{ price: number; quantity: number; label?: string }>,
  settings: Partial<FeeSettings> = {}
): FeeCalculation & { itemizedSubtotal: FeeBreakdownItem[] } {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const feeCalc = calculateFees(subtotal, settings);

  const itemizedSubtotal: FeeBreakdownItem[] = items.map((item) => ({
    label: item.label || 'Item',
    amount: item.price * item.quantity,
    description: item.quantity > 1 ? `${item.quantity} × $${item.price.toFixed(2)}` : undefined,
  }));

  return {
    ...feeCalc,
    itemizedSubtotal,
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format percentage for display
 */
export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

/**
 * Round to 2 decimal places
 */
function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Get fee explanation text based on mode
 */
export function getFeeExplanation(mode: FeePaymentMode): string {
  if (mode === 'pass_to_customer') {
    return 'A small service fee is added to cover payment processing costs.';
  }
  return 'All fees are included in the ticket price.';
}

/**
 * Validate fee settings
 */
export function validateFeeSettings(settings: Partial<FeeSettings>): string[] {
  const errors: string[] = [];

  if (settings.platformFeePercent !== undefined) {
    if (settings.platformFeePercent < 0 || settings.platformFeePercent > 10) {
      errors.push('Platform fee must be between 0% and 10%');
    }
  }

  if (settings.stripeFeePercent !== undefined) {
    if (settings.stripeFeePercent < 0 || settings.stripeFeePercent > 10) {
      errors.push('Stripe fee percent must be between 0% and 10%');
    }
  }

  if (settings.stripeFeeFixed !== undefined) {
    if (settings.stripeFeeFixed < 0 || settings.stripeFeeFixed > 2) {
      errors.push('Stripe fixed fee must be between $0 and $2');
    }
  }

  return errors;
}
