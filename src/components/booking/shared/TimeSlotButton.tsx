/**
 * TimeSlotButton Component
 * 
 * Interactive button for selecting a time slot.
 * Shows availability, price, and visual feedback.
 * 
 * UX Features:
 * - Clear availability indicator
 * - "Almost full" warning for low availability
 * - Disabled state for sold out slots
 * - Smooth hover/active animations
 * - Selected state highlighting
 * - Touch-friendly sizing (44px min height)
 * 
 * For AI Agents:
 * - Controlled component (selected prop)
 * - onClick callback for selection
 * - Responsive to screen size
 * - Accessible with ARIA labels
 * 
 * @module components/booking/shared
 */

import { motion } from 'framer-motion';
import { Users, AlertCircle } from 'lucide-react';
import type { TimeSlot } from '../types';

// =============================================================================
// TYPES
// =============================================================================

interface TimeSlotButtonProps {
  slot: TimeSlot;
  selected?: boolean;
  onClick: (slot: TimeSlot) => void;
  className?: string;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Format time for display (e.g., "2:00 PM")
 */
function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Get availability status
 */
function getAvailabilityStatus(slot: TimeSlot): {
  status: 'available' | 'low' | 'soldout';
  message: string;
  color: string;
} {
  if (!slot.isAvailable || slot.availableSpots === 0) {
    return {
      status: 'soldout',
      message: 'Sold Out',
      color: 'text-gray-400',
    };
  }
  
  if (slot.availableSpots <= 2) {
    return {
      status: 'low',
      message: `Only ${slot.availableSpots} left`,
      color: 'text-orange-600',
    };
  }
  
  return {
    status: 'available',
    message: `${slot.availableSpots} spots`,
    color: 'text-green-600',
  };
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * TimeSlotButton Component
 * 
 * Button for selecting a time slot with availability info
 */
export function TimeSlotButton({
  slot,
  selected = false,
  onClick,
  className = '',
}: TimeSlotButtonProps) {
  const availability = getAvailabilityStatus(slot);
  const isSoldOut = availability.status === 'soldout';
  const isLowAvailability = availability.status === 'low';
  
  return (
    <motion.button
      onClick={() => !isSoldOut && onClick(slot)}
      disabled={isSoldOut}
      whileHover={isSoldOut ? {} : { scale: 1.02 }}
      whileTap={isSoldOut ? {} : { scale: 0.98 }}
      className={`
        relative w-full min-h-[60px] sm:min-h-[70px]
        px-4 py-3 rounded-lg border-2
        transition-all duration-200
        ${selected
          ? 'border-primary bg-primary/5 shadow-md'
          : isSoldOut
          ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
          : 'border-gray-200 bg-white hover:border-primary/50 hover:shadow-sm'
        }
        ${className}
      `}
      aria-label={`
        ${formatTime(slot.time)} to ${formatTime(slot.endTime)}, 
        ${availability.message}
        ${selected ? '(Selected)' : ''}
      `}
      aria-pressed={selected}
      aria-disabled={isSoldOut}
    >
      <div className="flex items-center justify-between gap-2">
        {/* Time Display */}
        <div className="text-left">
          <div className={`
            font-semibold text-base sm:text-lg
            ${selected ? 'text-primary' : isSoldOut ? 'text-gray-400' : 'text-gray-900'}
          `}>
            {formatTime(slot.time)}
          </div>
          <div className="text-xs text-gray-500">
            to {formatTime(slot.endTime)}
          </div>
        </div>
        
        {/* Availability Indicator */}
        <div className="flex flex-col items-end gap-1">
          <div className={`
            flex items-center gap-1 text-xs font-medium
            ${selected ? 'text-primary' : availability.color}
          `}>
            {isLowAvailability && (
              <AlertCircle className="w-3 h-3" />
            )}
            {!isSoldOut && (
              <Users className="w-3 h-3" />
            )}
            <span>{availability.message}</span>
          </div>
          
          {/* Price (if different from base) */}
          {slot.price && (
            <div className="text-xs font-semibold text-gray-700">
              ${slot.price}
            </div>
          )}
        </div>
      </div>
      
      {/* Selected Indicator */}
      {selected && (
        <motion.div
          layoutId="selected-slot"
          className="absolute inset-0 border-2 border-primary rounded-lg pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
      
      {/* Almost Full Badge */}
      {isLowAvailability && !selected && (
        <div className="absolute -top-2 -right-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm"
          >
            ALMOST FULL
          </motion.div>
        </div>
      )}
    </motion.button>
  );
}
