/**
 * Unit Tests for useGiftCard Hook
 * @module embed-pro/hooks/__tests__/useGiftCard.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGiftCard } from '../useGiftCard';

// Mock the gift card service
vi.mock('../../services/giftcard.service', () => ({
  giftCardService: {
    redeemGiftCard: vi.fn(),
    formatAmount: vi.fn((cents: number) => `$${(cents / 100).toFixed(2)}`),
  },
}));

import { giftCardService } from '../../services/giftcard.service';

describe('useGiftCard', () => {
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
    const { result } = renderHook(() => useGiftCard(defaultOptions));

    expect(result.current.code).toBe('');
    expect(result.current.isValidating).toBe(false);
    expect(result.current.appliedGiftCard).toBeNull();
    expect(result.current.amountApplied).toBe(0);
    expect(result.current.remainingAfter).toBe(0);
    expect(result.current.finalAmount).toBe(10000);
    expect(result.current.error).toBeNull();
  });

  it('should update code when setCode is called', () => {
    const { result } = renderHook(() => useGiftCard(defaultOptions));

    act(() => {
      result.current.setCode('GC-TEST-1234');
    });

    expect(result.current.code).toBe('GC-TEST-1234');
  });

  it('should show error when applying empty code', async () => {
    const { result } = renderHook(() => useGiftCard(defaultOptions));

    await act(async () => {
      const success = await result.current.applyGiftCard();
      expect(success).toBe(false);
    });

    expect(result.current.error).toBe('Please enter a gift card code');
  });

  it('should apply valid gift card successfully', async () => {
    const mockGiftCard = {
      id: 'gc-1',
      code: 'GC-DEMO-1000',
      originalValue: 10000,
      remainingBalance: 10000,
      currency: 'USD',
      status: 'active' as const,
      purchasedAt: '2024-01-01',
    };

    vi.mocked(giftCardService.redeemGiftCard).mockResolvedValue({
      isValid: true,
      giftCard: mockGiftCard,
      amountApplied: 10000,
      remainingAfter: 0,
      amountOwed: 0,
    });

    const { result } = renderHook(() => useGiftCard(defaultOptions));

    act(() => {
      result.current.setCode('GC-DEMO-1000');
    });

    await act(async () => {
      const success = await result.current.applyGiftCard();
      expect(success).toBe(true);
    });

    expect(result.current.appliedGiftCard).toEqual(mockGiftCard);
    expect(result.current.amountApplied).toBe(10000);
    expect(result.current.remainingAfter).toBe(0);
    expect(result.current.finalAmount).toBe(0);
    expect(result.current.error).toBeNull();
  });

  it('should handle partial gift card redemption', async () => {
    const mockGiftCard = {
      id: 'gc-1',
      code: 'GC-DEMO-5000',
      originalValue: 5000,
      remainingBalance: 5000,
      currency: 'USD',
      status: 'active' as const,
      purchasedAt: '2024-01-01',
    };

    vi.mocked(giftCardService.redeemGiftCard).mockResolvedValue({
      isValid: true,
      giftCard: mockGiftCard,
      amountApplied: 5000,
      remainingAfter: 0,
      amountOwed: 5000,
    });

    const { result } = renderHook(() => useGiftCard(defaultOptions));

    act(() => {
      result.current.setCode('GC-DEMO-5000');
    });

    await act(async () => {
      const success = await result.current.applyGiftCard();
      expect(success).toBe(true);
    });

    expect(result.current.amountApplied).toBe(5000);
    expect(result.current.finalAmount).toBe(5000); // $50 remaining to pay
  });

  it('should handle invalid gift card', async () => {
    vi.mocked(giftCardService.redeemGiftCard).mockResolvedValue({
      isValid: false,
      error: 'Invalid gift card code',
    });

    const { result } = renderHook(() => useGiftCard(defaultOptions));

    act(() => {
      result.current.setCode('INVALID-CODE');
    });

    await act(async () => {
      const success = await result.current.applyGiftCard();
      expect(success).toBe(false);
    });

    expect(result.current.appliedGiftCard).toBeNull();
    expect(result.current.error).toBe('Invalid gift card code');
  });

  it('should handle fully used gift card', async () => {
    vi.mocked(giftCardService.redeemGiftCard).mockResolvedValue({
      isValid: false,
      error: 'This gift card has been fully used',
    });

    const { result } = renderHook(() => useGiftCard(defaultOptions));

    act(() => {
      result.current.setCode('GC-EMPTY-0000');
    });

    await act(async () => {
      const success = await result.current.applyGiftCard();
      expect(success).toBe(false);
    });

    expect(result.current.error).toBe('This gift card has been fully used');
  });

  it('should remove applied gift card', async () => {
    const mockGiftCard = {
      id: 'gc-1',
      code: 'GC-DEMO-1000',
      originalValue: 10000,
      remainingBalance: 10000,
      currency: 'USD',
      status: 'active' as const,
      purchasedAt: '2024-01-01',
    };

    vi.mocked(giftCardService.redeemGiftCard).mockResolvedValue({
      isValid: true,
      giftCard: mockGiftCard,
      amountApplied: 10000,
      remainingAfter: 0,
      amountOwed: 0,
    });

    const { result } = renderHook(() => useGiftCard(defaultOptions));

    // Apply gift card
    act(() => {
      result.current.setCode('GC-DEMO-1000');
    });

    await act(async () => {
      await result.current.applyGiftCard();
    });

    expect(result.current.appliedGiftCard).not.toBeNull();

    // Remove gift card
    act(() => {
      result.current.removeGiftCard();
    });

    expect(result.current.appliedGiftCard).toBeNull();
    expect(result.current.amountApplied).toBe(0);
    expect(result.current.code).toBe('');
    expect(result.current.finalAmount).toBe(10000);
  });

  it('should clear error when clearError is called', async () => {
    vi.mocked(giftCardService.redeemGiftCard).mockResolvedValue({
      isValid: false,
      error: 'Some error',
    });

    const { result } = renderHook(() => useGiftCard(defaultOptions));

    act(() => {
      result.current.setCode('TEST');
    });

    await act(async () => {
      await result.current.applyGiftCard();
    });

    expect(result.current.error).not.toBeNull();

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it('should format amount correctly', () => {
    const { result } = renderHook(() => useGiftCard(defaultOptions));

    const formatted = result.current.formatAmount(2500);
    expect(formatted).toBe('$25.00');
  });
});
