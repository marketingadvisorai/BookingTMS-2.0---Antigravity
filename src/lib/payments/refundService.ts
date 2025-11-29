/**
 * Refund Service
 * 
 * Client-side service for processing refunds via Supabase Edge Function.
 * @module lib/payments/refundService
 */
import { supabase } from '../supabase/client';

export interface RefundRequest {
  bookingId: string;
  amount?: number;
  reason?: string;
}

export interface RefundResponse {
  success: boolean;
  refundId?: string;
  amount?: number;
  originalAmount?: number;
  isFullRefund?: boolean;
  bookingId?: string;
  status?: string;
  error?: string;
}

/**
 * Process a refund for a booking via the Stripe API.
 * 
 * @param request - Refund request containing bookingId, optional amount, and reason
 * @returns Refund response with details or error
 * 
 * @example
 * const result = await RefundService.processRefund({
 *   bookingId: 'booking-123',
 *   amount: 50.00,
 *   reason: 'Customer requested cancellation'
 * });
 */
export async function processRefund(request: RefundRequest): Promise<RefundResponse> {
  try {
    const { bookingId, amount, reason } = request;

    if (!bookingId) {
      return {
        success: false,
        error: 'Booking ID is required'
      };
    }

    // Call the edge function
    const { data, error } = await supabase.functions.invoke('create-refund', {
      body: {
        bookingId,
        amount,
        reason
      }
    });

    if (error) {
      console.error('Refund edge function error:', error);
      return {
        success: false,
        error: error.message || 'Failed to process refund'
      };
    }

    if (!data?.success) {
      return {
        success: false,
        error: data?.error || 'Unknown error processing refund'
      };
    }

    return {
      success: true,
      refundId: data.refundId,
      amount: data.amount,
      originalAmount: data.originalAmount,
      isFullRefund: data.isFullRefund,
      bookingId: data.bookingId,
      status: data.status
    };
  } catch (error) {
    console.error('RefundService.processRefund error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process refund'
    };
  }
}

/**
 * Refund Service singleton for processing refunds
 */
export const RefundService = {
  processRefund
};
