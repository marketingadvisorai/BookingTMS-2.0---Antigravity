/**
 * BookingSummaryCard Component
 * 
 * Displays current booking details as user progresses through flow.
 * Always visible to remind user of their selections.
 * 
 * UX Features:
 * - Sticky sidebar on desktop
 * - Collapsible card on mobile (tap to expand)
 * - Shows all selected details
 * - Real-time price calculation
 * - Smooth animations
 * - Clear visual hierarchy
 * 
 * For AI Agents:
 * - Responsive design with Tailwind
 * - Conditional rendering based on booking state
 * - Price formatting utilities
 * - Collapsible state for mobile
 * 
 * @module components/booking/shared
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
  Calendar,
  Clock,
  Users,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import type { BookingState } from '../types';

// =============================================================================
// TYPES
// =============================================================================

interface BookingSummaryCardProps {
  bookingState: BookingState;
  className?: string;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Format currency (USD)
 */
function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Get difficulty badge color
 */
function getDifficultyColor(difficulty: string): string {
  const colors: Record<string, string> = {
    easy: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    hard: 'bg-orange-100 text-orange-700',
    expert: 'bg-red-100 text-red-700',
  };
  return colors[difficulty] || 'bg-gray-100 text-gray-700';
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * BookingSummaryCard Component
 * 
 * Summary of current booking selections
 */
export function BookingSummaryCard({
  bookingState,
  className = '',
}: BookingSummaryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    selectedGame,
    selectedDate,
    selectedTimeSlot,
    partySize,
    customerInfo,
    finalAmount,
    discountAmount,
    totalAmount,
  } = bookingState;
  
  // Check what info we have
  const hasGame = !!selectedGame;
  const hasDateTime = !!selectedDate && !!selectedTimeSlot;
  const hasPartyDetails = partySize > 0;
  const hasCustomerInfo = !!(customerInfo.name && customerInfo.email);
  
  // Nothing selected yet
  if (!hasGame) {
    return (
      <Card className={`${className} border-dashed`}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gray-400" />
            Your Booking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-8">
            Select a game to begin
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={`${className} shadow-lg`}>
      {/* Header - Always visible */}
      <CardHeader className="pb-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="sm:cursor-default w-full"
        >
          <CardTitle className="text-lg flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Your Booking
            </span>
            {/* Mobile toggle */}
            <span className="sm:hidden text-gray-400">
              {isExpanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </span>
          </CardTitle>
        </button>
      </CardHeader>
      
      {/* Content - Collapsible on mobile, always visible on desktop */}
      <AnimatePresence initial={false}>
        {(isExpanded || window.innerWidth >= 640) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardContent className="space-y-4">
              {/* Game Details */}
              {hasGame && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900">
                    {selectedGame.name}
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={getDifficultyColor(selectedGame.difficulty)}>
                      {selectedGame.difficulty}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {selectedGame.duration_minutes} minutes
                    </span>
                  </div>
                </div>
              )}
              
              <Separator />
              
              {/* Date & Time */}
              {hasDateTime ? (
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">Date</p>
                      <p className="text-sm text-gray-900">
                        {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">Time</p>
                      <p className="text-sm text-gray-900">
                        {selectedTimeSlot.time} - {selectedTimeSlot.endTime}
                      </p>
                      {selectedTimeSlot.availableSpots < 3 && (
                        <p className="text-xs text-orange-600 mt-1">
                          Only {selectedTimeSlot.availableSpots} spots left!
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-gray-400">
                  <Calendar className="w-5 h-5" />
                  <span className="text-sm">No date selected</span>
                </div>
              )}
              
              <Separator />
              
              {/* Party Size */}
              {hasPartyDetails && (
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">Party Size</p>
                    <p className="text-sm text-gray-900">
                      {partySize} {partySize === 1 ? 'player' : 'players'}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Customer Info (only show if filled) */}
              {hasCustomerInfo && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Contact</p>
                    <p className="text-sm text-gray-900">{customerInfo.name}</p>
                    <p className="text-sm text-gray-600">{customerInfo.email}</p>
                    {customerInfo.phone && (
                      <p className="text-sm text-gray-600">{customerInfo.phone}</p>
                    )}
                  </div>
                </>
              )}
              
              <Separator className="my-4" />
              
              {/* Price Breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">
                    {formatPrice(totalAmount)}
                  </span>
                </div>
                
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Discount</span>
                    <span className="text-green-600">
                      -{formatPrice(discountAmount)}
                    </span>
                  </div>
                )}
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatPrice(finalAmount)}
                  </span>
                </div>
              </div>
              
              {/* Security Badge */}
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pt-2">
                <CreditCard className="w-4 h-4" />
                <span>Secure payment powered by Stripe</span>
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
