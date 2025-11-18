/**
 * EscapeRoomBookingWidget - Main Component
 * 
 * Orchestrates the entire 4-step booking flow for escape rooms.
 * This is the main entry point for the simplified booking widget.
 * 
 * Features:
 * - 4-step flow: Game → Date/Time → Details → Payment
 * - Progress tracking
 * - Booking summary sidebar
 * - Mobile responsive
 * - Error handling
 * 
 * @module components/booking
 */

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BookingProgressBar } from './shared/BookingProgressBar';
import { BookingSummaryCard } from './shared/BookingSummaryCard';
import { Step1_GameSelection } from './steps/Step1_GameSelection';
import { Step2_DateTimeSelection } from './steps/Step2_DateTimeSelection';
import { Step3_PartyDetails } from './steps/Step3_PartyDetails';
import { Step4_PaymentCheckout } from './steps/Step4_PaymentCheckout';
import { BookingConfirmation } from './steps/BookingConfirmation';
import { useBookingFlow } from './hooks/useBookingFlow';
import type { EscapeRoomBookingWidgetProps } from './types';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Generate a random confirmation code
 */
function generateConfirmationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// =============================================================================
// MAIN WIDGET COMPONENT (with QueryClient)
// =============================================================================

function EscapeRoomBookingWidgetInner({
  organizationId,
  venueId,
  onBookingComplete,
  onBookingError,
  primaryColor = '#2563eb',
  className = '',
}: EscapeRoomBookingWidgetProps) {
  const booking = useBookingFlow();
  const [confirmationCode, setConfirmationCode] = useState<string>('');
  const [bookingId, setBookingId] = useState<string>('');
  
  return (
    <div className={`booking-widget ${className}`} style={{ '--primary': primaryColor } as any}>
      <div className="container mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <BookingProgressBar
            currentStep={booking.state.currentStep}
            onStepClick={(step) => {
              // Only allow going back to completed steps
              booking.goToStep(step);
            }}
          />
        </div>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Booking Steps (2/3 width on desktop) */}
          <div className="lg:col-span-2">
            {/* Step 1: Game Selection */}
            {booking.state.currentStep === 'game-selection' && (
              <Step1_GameSelection
                bookingState={booking.state}
                onNext={booking.nextStep}
                onUpdate={(action) => {
                  if (action.type === 'SELECT_GAME') {
                    booking.selectGame(action.payload);
                  }
                }}
                organizationId={organizationId}
              />
            )}
            
            {/* Step 2: Date & Time Selection */}
            {booking.state.currentStep === 'datetime-selection' && booking.state.selectedGame && (
              <Step2_DateTimeSelection
                bookingState={booking.state}
                onNext={booking.nextStep}
                onBack={booking.backStep}
                onUpdate={(action) => {
                  if (action.type === 'SELECT_DATE') {
                    booking.selectDate(action.payload);
                  } else if (action.type === 'SELECT_TIME_SLOT') {
                    booking.selectTimeSlot(action.payload);
                  }
                }}
                gameId={booking.state.selectedGame.id}
                organizationId={organizationId}
              />
            )}
            
            {/* Step 3: Party Details */}
            {booking.state.currentStep === 'party-details' && booking.state.selectedGame && (
              <Step3_PartyDetails
                bookingState={booking.state}
                onNext={booking.nextStep}
                onBack={booking.backStep}
                onUpdate={(action) => {
                  if (action.type === 'SET_PARTY_SIZE') {
                    booking.setPartySize(action.payload);
                  } else if (action.type === 'UPDATE_CUSTOMER_INFO') {
                    booking.updateCustomerInfo(action.payload);
                  }
                }}
                minPlayers={booking.state.selectedGame.min_players}
                maxPlayers={booking.state.selectedGame.max_players}
                basePrice={booking.state.selectedGame.price}
              />
            )}
            
            {/* Step 4: Payment */}
            {booking.state.currentStep === 'payment' && (
              <Step4_PaymentCheckout
                bookingState={booking.state}
                onNext={booking.nextStep}
                onBack={booking.backStep}
                onUpdate={(action) => {
                  // Handle any payment-related actions
                }}
                onPaymentSuccess={(completedBookingId) => {
                  console.log('Payment successful:', completedBookingId);
                  // Generate a confirmation code (would come from backend)
                  const code = generateConfirmationCode();
                  setConfirmationCode(code);
                  setBookingId(completedBookingId);
                  onBookingComplete?.(completedBookingId);
                  booking.goToStep('confirmation');
                }}
              />
            )}
            
            {/* Step 5: Confirmation */}
            {booking.state.currentStep === 'confirmation' && (
              <BookingConfirmation
                bookingState={booking.state}
                confirmationCode={confirmationCode}
                bookingId={bookingId}
              />
            )}
            
            {/* Error Display */}
            {booking.state.error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{booking.state.error}</p>
              </div>
            )}
          </div>
          
          {/* Right: Booking Summary (1/3 width on desktop, sticky) */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-8">
              <BookingSummaryCard bookingState={booking.state} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// EXPORTED COMPONENT (wrapped with QueryClientProvider)
// =============================================================================

/**
 * EscapeRoomBookingWidget
 * 
 * Main booking widget component with React Query provider
 */
export function EscapeRoomBookingWidget(props: EscapeRoomBookingWidgetProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <EscapeRoomBookingWidgetInner {...props} />
    </QueryClientProvider>
  );
}
