export interface PriceBreakdown {
  basePrice: number;
  partySize: number;
  subtotal: number;
  tax: number;
  taxRate: number;
  total: number;
  discountAmount?: number;
  discountCode?: string;
}

export class PriceCalculator {
  // Default tax rate (8%)
  static TAX_RATE = 0.08;

  /**
   * Calculate total price for booking
   */
  static calculate(
    pricePerPerson: number,
    partySize: number,
    discountAmount: number = 0
  ): PriceBreakdown {
    const subtotal = pricePerPerson * partySize;
    const afterDiscount = Math.max(0, subtotal - discountAmount);
    const tax = afterDiscount * this.TAX_RATE;
    const total = afterDiscount + tax;

    return {
      basePrice: pricePerPerson,
      partySize,
      subtotal,
      tax: Math.round(tax * 100) / 100,
      taxRate: this.TAX_RATE,
      total: Math.round(total * 100) / 100,
      discountAmount: discountAmount > 0 ? discountAmount : undefined,
    };
  }

  /**
   * Calculate with custom tax rate
   */
  static calculateWithTax(
    pricePerPerson: number,
    partySize: number,
    taxRate: number,
    discountAmount: number = 0
  ): PriceBreakdown {
    const subtotal = pricePerPerson * partySize;
    const afterDiscount = Math.max(0, subtotal - discountAmount);
    const tax = afterDiscount * taxRate;
    const total = afterDiscount + tax;

    return {
      basePrice: pricePerPerson,
      partySize,
      subtotal,
      tax: Math.round(tax * 100) / 100,
      taxRate,
      total: Math.round(total * 100) / 100,
      discountAmount: discountAmount > 0 ? discountAmount : undefined,
    };
  }

  /**
   * Format price for display
   */
  static format(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  /**
   * Format price without currency symbol
   */
  static formatNumber(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  /**
   * Calculate discount percentage
   */
  static calculateDiscountPercentage(
    originalPrice: number,
    discountedPrice: number
  ): number {
    if (originalPrice === 0) return 0;
    const percentage = ((originalPrice - discountedPrice) / originalPrice) * 100;
    return Math.round(percentage);
  }

  /**
   * Apply percentage discount
   */
  static applyPercentageDiscount(
    amount: number,
    percentage: number
  ): number {
    const discount = (amount * percentage) / 100;
    return Math.round(discount * 100) / 100;
  }

  /**
   * Apply fixed discount
   */
  static applyFixedDiscount(
    amount: number,
    discountAmount: number
  ): number {
    return Math.max(0, amount - discountAmount);
  }

  /**
   * Validate price
   */
  static isValidPrice(price: number): boolean {
    return price >= 0 && Number.isFinite(price);
  }

  /**
   * Round to 2 decimal places
   */
  static round(amount: number): number {
    return Math.round(amount * 100) / 100;
  }
}
