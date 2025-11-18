/**
 * useBookingSubmit Hook
 * 
 * Handles booking submission to backend/Supabase.
 * Creates the booking, processes payment, sends confirmation.
 * 
 * @module components/booking/hooks
 */

import { useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { createMockBooking, processMockPayment } from '@/lib/mock/mockDataService';
import type { BookingState } from '../types';

// =============================================================================
// TYPES
// =============================================================================

interface SubmitBookingParams {
  bookingState: BookingState;
}

interface BookingResult {
  bookingId: string;
  confirmationCode: string;
  status: 'success' | 'error';
  message?: string;
}

// =============================================================================
// BOOKING SUBMISSION
// =============================================================================

/**
 * Submit booking and process payment
 */
async function submitBooking(params: SubmitBookingParams): Promise<BookingResult> {
  const { bookingState } = params;
  const {
    selectedGame,
    selectedDate,
    selectedTimeSlot,
    partySize,
    customerInfo,
    finalAmount,
  } = bookingState;
  
  if (!selectedGame || !selectedDate || !selectedTimeSlot) {
    throw new Error('Missing required booking information');
  }
  
  try {
    // Step 1: Process payment first
    console.log('Processing payment...', finalAmount);
    const paymentResult = await processMockPayment(finalAmount, 'card');
    
    if (!paymentResult.success) {
      throw new Error('Payment failed');
    }
    
    // Step 2: Create booking
    console.log('Creating booking...');
    const booking = await createMockBooking({
      gameId: selectedGame.id,
      date: selectedDate,
      time: selectedTimeSlot.time,
      players: partySize,
      customerName: customerInfo.name,
      customerEmail: customerInfo.email,
      customerPhone: customerInfo.phone,
    });
    
    // Step 3: Send confirmation email (mock)
    console.log('Sending confirmation email to:', customerInfo.email);
    await sendConfirmationEmail(booking.id, customerInfo.email);
    
    return {
      bookingId: booking.id,
      confirmationCode: booking.confirmationCode,
      status: 'success',
      message: 'Booking confirmed! Check your email for details.',
    };
  } catch (error) {
    console.error('Booking submission failed:', error);
    throw error;
  }
}

/**
 * Mock email sending
 */
async function sendConfirmationEmail(bookingId: string, email: string): Promise<void> {
  // Simulate email sending delay
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log(`✉️ Confirmation email sent to ${email} for booking ${bookingId}`);
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * useBookingSubmit Hook
 * 
 * Provides mutation for submitting bookings
 */
export function useBookingSubmit() {
  const mutation = useMutation({
    mutationFn: submitBooking,
    onSuccess: (data) => {
      console.log('✅ Booking successful:', data);
    },
    onError: (error) => {
      console.error('❌ Booking failed:', error);
    },
  });
  
  return {
    submitBooking: mutation.mutate,
    submitBookingAsync: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}

// Export type
export type UseBookingSubmitReturn = ReturnType<typeof useBookingSubmit>;
