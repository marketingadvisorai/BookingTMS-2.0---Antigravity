/**
 * Unit Tests for usePromoCode Hook
 * @module embed-pro/hooks/__tests__/usePromoCode.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePromoCode } from '../usePromoCode';

// Mock the promo service
vi.mock('../../services/promo.service', () => ({
  promoService: {
    validatePromo: vi.fn(),
    formatAmount: vi.fn((cents: number) => `$${(cents / 100).toFixed(2)}`),
  },
}));

import { promoService } from '../../services/promo.service';

describe('usePromoCode', () => {
  const defaultOptions = {
    activityId: 'test-activity-id',
    organizationId: 'test-org-id',
    subtotal: 10000, // $100
    currency: 'USD',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => usePromoCode(defaultOptions));

    expect(result.current.code).toBe('');
    expect(result.current.isValidating).toBe(false);
    expect(result.current.appliedPromo).toBeNull();
    expect(result.current.discountAmount).toBe(0);
    expect(result.current.finalAmount).toBe(10000);
    expect(result.current.error).toBeNull();
  });

  it('should update code when setCode is called', () => {
    const { result } = renderHook(() => usePromoCode(defaultOptions));

    act(() => {
      result.current.setCode('TEST123');
    });

    expect(result.current.code).toBe('TEST123');
  });

  it('should show error when applying empty code', async () => {
    const { result } = renderHook(() => usePromoCode(defaultOptions));

    await act(async () => {
      const success = await result.current.applyPromo();
      expect(success).toBe(false);
    });

    expect(result.current.error).toBe('Please enter a promo code');
  });

  it('should apply valid promo code successfully', async () => {
    const mockPromo = {
      id: 'promo-1',
      code: 'SAVE20',
      discountType: 'percentage' as const,
      discountValue: 20,
      description: '20% off',
      isActive: true,
      currentUses: 0,
      createdAt: '2024-01-01',
    };

    vi.mocked(promoService.validatePromo).mockResolvedValue({
      isValid: true,
      promo: mockPromo,
      discountAmount: 2000,
      originalAmount: 10000,
      finalAmount: 8000,
    });

    const { result } = renderHook(() => usePromoCode(defaultOptions));

    act(() => {
      result.current.setCode('SAVE20');
    });

    await act(async () => {
      const success = await result.current.applyPromo();
      expect(success).toBe(true);
    });

    expect(result.current.appliedPromo).toEqual(mockPromo);
    expect(result.current.discountAmount).toBe(2000);
    expect(result.current.finalAmount).toBe(8000);
    expect(result.current.error).toBeNull();
  });

  it('should handle invalid promo code', async () => {
    vi.mocked(promoService.validatePromo).mockResolvedValue({
      isValid: false,
      error: 'Invalid promo code',
    });

    const { result } = renderHook(() => usePromoCode(defaultOptions));

    act(() => {
      result.current.setCode('INVALID');
    });

    await act(async () => {
      const success = await result.current.applyPromo();
      expect(success).toBe(false);
    });

    expect(result.current.appliedPromo).toBeNull();
    expect(result.current.error).toBe('Invalid promo code');
  });

  it('should remove applied promo code', async () => {
    const mockPromo = {
      id: 'promo-1',
      code: 'SAVE20',
      discountType: 'percentage' as const,
      discountValue: 20,
      isActive: true,
      currentUses: 0,
      createdAt: '2024-01-01',
    };

    vi.mocked(promoService.validatePromo).mockResolvedValue({
      isValid: true,
      promo: mockPromo,
      discountAmount: 2000,
      originalAmount: 10000,
      finalAmount: 8000,
    });

    const { result } = renderHook(() => usePromoCode(defaultOptions));

    // Apply promo
    act(() => {
      result.current.setCode('SAVE20');
    });

    await act(async () => {
      await result.current.applyPromo();
    });

    expect(result.current.appliedPromo).not.toBeNull();

    // Remove promo
    act(() => {
      result.current.removePromo();
    });

    expect(result.current.appliedPromo).toBeNull();
    expect(result.current.discountAmount).toBe(0);
    expect(result.current.code).toBe('');
  });

  it('should clear error when clearError is called', async () => {
    vi.mocked(promoService.validatePromo).mockResolvedValue({
      isValid: false,
      error: 'Some error',
    });

    const { result } = renderHook(() => usePromoCode(defaultOptions));

    act(() => {
      result.current.setCode('TEST');
    });

    await act(async () => {
      await result.current.applyPromo();
    });

    expect(result.current.error).not.toBeNull();

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it('should format amount correctly', () => {
    const { result } = renderHook(() => usePromoCode(defaultOptions));

    const formatted = result.current.formatAmount(2500);
    expect(formatted).toBe('$25.00');
  });
});
