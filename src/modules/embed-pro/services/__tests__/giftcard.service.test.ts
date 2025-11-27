/**
 * Unit Tests for Gift Card Service
 * @module embed-pro/services/__tests__/giftcard.service.test
 */

import { describe, it, expect } from 'vitest';
import { giftCardService } from '../giftcard.service';

describe('giftCardService', () => {
  describe('redeemGiftCard', () => {
    it('should return error for empty code', async () => {
      const result = await giftCardService.redeemGiftCard({
        code: '',
        activityId: 'test-activity',
        subtotal: 10000,
      });

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Please enter a gift card code');
    });

    it('should return error for invalid gift card code', async () => {
      const result = await giftCardService.redeemGiftCard({
        code: 'INVALID-CODE-XYZ',
        activityId: 'test-activity',
        subtotal: 10000,
      });

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid gift card code');
    });

    it('should validate GC-DEMO-1000 ($100) successfully', async () => {
      const result = await giftCardService.redeemGiftCard({
        code: 'GC-DEMO-1000',
        activityId: 'test-activity',
        subtotal: 8000, // $80
      });

      expect(result.isValid).toBe(true);
      expect(result.giftCard).toBeDefined();
      expect(result.giftCard?.code).toBe('GC-DEMO-1000');
      expect(result.amountApplied).toBe(8000); // Apply up to subtotal
      expect(result.remainingAfter).toBe(2000); // $20 remaining on card
      expect(result.amountOwed).toBe(0);
    });

    it('should validate GC-DEMO-5000 ($50) successfully', async () => {
      const result = await giftCardService.redeemGiftCard({
        code: 'GC-DEMO-5000',
        activityId: 'test-activity',
        subtotal: 10000, // $100
      });

      expect(result.isValid).toBe(true);
      expect(result.giftCard?.code).toBe('GC-DEMO-5000');
      expect(result.amountApplied).toBe(5000); // Full card value
      expect(result.remainingAfter).toBe(0);
      expect(result.amountOwed).toBe(5000); // $50 still owed
    });

    it('should handle partially used gift card', async () => {
      const result = await giftCardService.redeemGiftCard({
        code: 'GC-HALF-2500',
        activityId: 'test-activity',
        subtotal: 5000, // $50
      });

      expect(result.isValid).toBe(true);
      expect(result.giftCard?.status).toBe('partially_used');
      expect(result.amountApplied).toBe(2500); // $25 remaining
      expect(result.amountOwed).toBe(2500); // $25 still owed
    });

    it('should reject fully used gift card', async () => {
      const result = await giftCardService.redeemGiftCard({
        code: 'GC-EMPTY-0000',
        activityId: 'test-activity',
        subtotal: 10000,
      });

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('This gift card has been fully used');
    });

    it('should be case insensitive', async () => {
      const result = await giftCardService.redeemGiftCard({
        code: 'gc-demo-1000',
        activityId: 'test-activity',
        subtotal: 5000,
      });

      expect(result.isValid).toBe(true);
      expect(result.giftCard?.code).toBe('GC-DEMO-1000');
    });

    it('should handle codes with whitespace', async () => {
      const result = await giftCardService.redeemGiftCard({
        code: '  GC-DEMO-1000  ',
        activityId: 'test-activity',
        subtotal: 5000,
      });

      expect(result.isValid).toBe(true);
    });

    it('should apply specific amount if requested', async () => {
      const result = await giftCardService.redeemGiftCard({
        code: 'GC-DEMO-1000',
        activityId: 'test-activity',
        subtotal: 10000, // $100
        amount: 5000, // Only apply $50
      });

      expect(result.isValid).toBe(true);
      expect(result.amountApplied).toBe(5000);
      expect(result.remainingAfter).toBe(5000); // $50 remaining
      expect(result.amountOwed).toBe(5000); // $50 still owed
    });

    it('should not apply more than subtotal', async () => {
      const result = await giftCardService.redeemGiftCard({
        code: 'GC-DEMO-1000', // $100 card
        activityId: 'test-activity',
        subtotal: 5000, // $50 order
      });

      expect(result.isValid).toBe(true);
      expect(result.amountApplied).toBe(5000); // Only applies $50
      expect(result.remainingAfter).toBe(5000); // $50 remaining on card
    });
  });

  describe('checkBalance', () => {
    it('should return balance for valid gift card', async () => {
      const result = await giftCardService.checkBalance('GC-DEMO-1000');

      expect(result.balance).toBe(10000); // $100
      expect(result.error).toBeUndefined();
    });

    it('should return zero for invalid gift card', async () => {
      const result = await giftCardService.checkBalance('INVALID');

      expect(result.balance).toBe(0);
      expect(result.error).toBe('Gift card not found');
    });

    it('should return remaining balance for partially used card', async () => {
      const result = await giftCardService.checkBalance('GC-HALF-2500');

      expect(result.balance).toBe(2500); // $25 remaining
    });
  });

  describe('formatCode', () => {
    it('should format code with dashes', () => {
      expect(giftCardService.formatCode('GCDEMO1000')).toBe('GC-DEMO-1000');
    });

    it('should handle short codes', () => {
      expect(giftCardService.formatCode('GC')).toBe('GC');
      expect(giftCardService.formatCode('GCD')).toBe('GC-D');
    });

    it('should handle lowercase', () => {
      expect(giftCardService.formatCode('gcdemo1000')).toBe('GC-DEMO-1000');
    });
  });

  describe('formatAmount', () => {
    it('should format USD amount correctly', () => {
      expect(giftCardService.formatAmount(2500)).toBe('$25.00');
      expect(giftCardService.formatAmount(10000)).toBe('$100.00');
    });

    it('should handle different currencies', () => {
      expect(giftCardService.formatAmount(2500, 'EUR')).toBe('€25.00');
      expect(giftCardService.formatAmount(2500, 'GBP')).toBe('£25.00');
    });
  });
});
