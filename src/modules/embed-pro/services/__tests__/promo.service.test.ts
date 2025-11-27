/**
 * Unit Tests for Promo Service
 * @module embed-pro/services/__tests__/promo.service.test
 */

import { describe, it, expect } from 'vitest';
import { promoService } from '../promo.service';

describe('promoService', () => {
  describe('validatePromo', () => {
    it('should return error for empty code', async () => {
      const result = await promoService.validatePromo({
        code: '',
        activityId: 'test-activity',
        subtotal: 10000,
      });

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Please enter a promo code');
    });

    it('should return error for whitespace-only code', async () => {
      const result = await promoService.validatePromo({
        code: '   ',
        activityId: 'test-activity',
        subtotal: 10000,
      });

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Please enter a promo code');
    });

    it('should return error for invalid promo code', async () => {
      const result = await promoService.validatePromo({
        code: 'INVALIDCODE123',
        activityId: 'test-activity',
        subtotal: 10000,
      });

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid promo code');
    });

    it('should validate WELCOME10 code successfully', async () => {
      const result = await promoService.validatePromo({
        code: 'WELCOME10',
        activityId: 'test-activity',
        subtotal: 10000, // $100
      });

      expect(result.isValid).toBe(true);
      expect(result.promo).toBeDefined();
      expect(result.promo?.code).toBe('WELCOME10');
      expect(result.discountAmount).toBe(1000); // 10% of $100 = $10
      expect(result.finalAmount).toBe(9000);
    });

    it('should validate SAVE20 code with max discount cap', async () => {
      const result = await promoService.validatePromo({
        code: 'SAVE20',
        activityId: 'test-activity',
        subtotal: 50000, // $500
      });

      expect(result.isValid).toBe(true);
      expect(result.promo?.code).toBe('SAVE20');
      // 20% of $500 = $100, but capped at $50
      expect(result.discountAmount).toBe(5000);
      expect(result.finalAmount).toBe(45000);
    });

    it('should validate FLAT25 fixed discount code', async () => {
      const result = await promoService.validatePromo({
        code: 'FLAT25',
        activityId: 'test-activity',
        subtotal: 10000, // $100
      });

      expect(result.isValid).toBe(true);
      expect(result.promo?.code).toBe('FLAT25');
      expect(result.discountAmount).toBe(2500); // $25 fixed
      expect(result.finalAmount).toBe(7500);
    });

    it('should reject FLAT25 for orders below minimum', async () => {
      const result = await promoService.validatePromo({
        code: 'FLAT25',
        activityId: 'test-activity',
        subtotal: 4000, // $40 (below $50 minimum)
      });

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Minimum order');
    });

    it('should be case insensitive', async () => {
      const result = await promoService.validatePromo({
        code: 'welcome10',
        activityId: 'test-activity',
        subtotal: 10000,
      });

      expect(result.isValid).toBe(true);
      expect(result.promo?.code).toBe('WELCOME10');
    });

    it('should handle codes with whitespace', async () => {
      const result = await promoService.validatePromo({
        code: '  WELCOME10  ',
        activityId: 'test-activity',
        subtotal: 10000,
      });

      expect(result.isValid).toBe(true);
    });

    it('should not exceed subtotal for discount', async () => {
      const result = await promoService.validatePromo({
        code: 'FLAT25',
        activityId: 'test-activity',
        subtotal: 5000, // $50 (equal to minimum)
      });

      expect(result.isValid).toBe(true);
      expect(result.discountAmount).toBe(2500); // $25 off $50
      expect(result.finalAmount).toBe(2500);
    });
  });

  describe('formatDiscount', () => {
    it('should format percentage discount', () => {
      const promo = {
        id: 'test',
        code: 'TEST',
        discountType: 'percentage' as const,
        discountValue: 20,
        isActive: true,
        currentUses: 0,
        createdAt: new Date().toISOString(),
      };

      expect(promoService.formatDiscount(promo)).toBe('20% off');
    });

    it('should format fixed amount discount', () => {
      const promo = {
        id: 'test',
        code: 'TEST',
        discountType: 'fixed_amount' as const,
        discountValue: 2500, // $25 in cents
        isActive: true,
        currentUses: 0,
        createdAt: new Date().toISOString(),
      };

      expect(promoService.formatDiscount(promo)).toBe('$25.00 off');
    });
  });

  describe('formatAmount', () => {
    it('should format USD amount correctly', () => {
      expect(promoService.formatAmount(2500)).toBe('$25.00');
      expect(promoService.formatAmount(10000)).toBe('$100.00');
      expect(promoService.formatAmount(99)).toBe('$0.99');
    });

    it('should handle zero amount', () => {
      expect(promoService.formatAmount(0)).toBe('$0.00');
    });
  });
});
