/**
 * BookingProgressBar Component
 * 
 * Visual progress indicator for the 4-step booking flow.
 * Shows current step, completed steps, and upcoming steps.
 * 
 * UX Features:
 * - Clear visual hierarchy with colors
 * - Mobile-responsive (compact on small screens)
 * - Animated progress transitions
 * - Accessible labels
 * - Click to navigate to completed steps
 * 
 * For AI Agents:
 * - Pure presentational component
 * - Props-driven, no internal state
 * - Uses Tailwind for styling
 * - Framer Motion for animations
 * 
 * @module components/booking/shared
 */

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import type { BookingStep } from '../types';

// =============================================================================
// TYPES
// =============================================================================

interface BookingProgressBarProps {
  currentStep: BookingStep;
  onStepClick?: (step: BookingStep) => void;
  className?: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const STEPS: Array<{ id: BookingStep; label: string; number: number }> = [
  { id: 'game-selection', label: 'Choose Game', number: 1 },
  { id: 'datetime-selection', label: 'Pick Time', number: 2 },
  { id: 'party-details', label: 'Your Info', number: 3 },
  { id: 'payment', label: 'Payment', number: 4 },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getStepIndex(step: BookingStep): number {
  return STEPS.findIndex(s => s.id === step);
}

function isStepCompleted(step: BookingStep, currentStep: BookingStep): boolean {
  return getStepIndex(step) < getStepIndex(currentStep);
}

function isStepCurrent(step: BookingStep, currentStep: BookingStep): boolean {
  return step === currentStep;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * BookingProgressBar Component
 * 
 * Displays booking progress with interactive steps
 */
export function BookingProgressBar({
  currentStep,
  onStepClick,
  className = '',
}: BookingProgressBarProps) {
  const currentStepIndex = getStepIndex(currentStep);
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100;
  
  return (
    <div className={`booking-progress-bar ${className}`}>
      {/* Mobile: Compact progress bar */}
      <div className="block sm:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Step {currentStepIndex + 1} of {STEPS.length}
          </span>
          <span className="text-sm text-gray-500">
            {STEPS[currentStepIndex]?.label}
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          />
        </div>
      </div>
      
      {/* Desktop: Full step indicators */}
      <div className="hidden sm:block">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const isCompleted = isStepCompleted(step.id, currentStep);
            const isCurrent = isStepCurrent(step.id, currentStep);
            const canClick = isCompleted && onStepClick;
            
            return (
              <div key={step.id} className="flex items-center flex-1">
                {/* Step Circle */}
                <button
                  onClick={() => canClick && onStepClick(step.id)}
                  disabled={!canClick}
                  className={`
                    relative flex items-center justify-center
                    w-10 h-10 rounded-full font-semibold text-sm
                    transition-all duration-200
                    ${isCurrent ? 'ring-4 ring-primary/20' : ''}
                    ${isCompleted ? 'bg-primary text-white cursor-pointer hover:scale-110' : ''}
                    ${isCurrent ? 'bg-primary text-white shadow-lg' : ''}
                    ${!isCompleted && !isCurrent ? 'bg-gray-200 text-gray-500' : ''}
                    ${canClick ? 'hover:shadow-md' : 'cursor-default'}
                  `}
                  aria-label={`${step.label} ${isCompleted ? '(Completed)' : isCurrent ? '(Current)' : ''}`}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Check className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <span>{step.number}</span>
                  )}
                  
                  {/* Pulse animation for current step */}
                  {isCurrent && (
                    <motion.span
                      className="absolute inset-0 rounded-full bg-primary"
                      initial={{ opacity: 0.5, scale: 1 }}
                      animate={{ opacity: 0, scale: 1.5 }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </button>
                
                {/* Step Label */}
                <span
                  className={`
                    ml-2 text-sm font-medium whitespace-nowrap
                    transition-colors duration-200
                    ${isCurrent ? 'text-primary' : ''}
                    ${isCompleted ? 'text-gray-700' : ''}
                    ${!isCompleted && !isCurrent ? 'text-gray-400' : ''}
                  `}
                >
                  {step.label}
                </span>
                
                {/* Connector Line (except after last step) */}
                {index < STEPS.length - 1 && (
                  <div className="flex-1 h-0.5 mx-4 bg-gray-200 relative overflow-hidden">
                    <motion.div
                      className="absolute inset-0 bg-primary"
                      initial={{ width: 0 }}
                      animate={{
                        width: isCompleted ? '100%' : '0%',
                      }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
