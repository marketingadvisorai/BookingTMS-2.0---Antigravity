/**
 * Calendar Widget Pro - Step Indicator Component
 * @module embed-pro/widgets/calendar-widget/components/CalendarStepIndicator
 * 
 * Displays booking flow progress with animated step indicators.
 */

import React from 'react';
import { Check } from 'lucide-react';
import type { StepIndicatorProps, StepConfig, CalendarStep } from '../types';

// =====================================================
// STEP CONFIG
// =====================================================

const STEP_ORDER: CalendarStep[] = ['select-date', 'select-time', 'select-party', 'checkout'];

// =====================================================
// COMPONENT
// =====================================================

export const CalendarStepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  style,
  isDarkMode,
}) => {
  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className={`px-4 py-3 mx-3 my-2 rounded-xl ${
      isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'
    }`}>
      <div className="flex items-center justify-between">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = step.id === currentStep;
          const isComplete = idx < currentStepIndex;
          
          return (
            <React.Fragment key={step.id}>
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300"
                  style={{
                    background: isActive || isComplete 
                      ? style.primaryColor
                      : isDarkMode ? 'rgba(75, 75, 85, 0.6)' : 'rgba(229, 231, 235, 0.8)',
                    color: isActive || isComplete ? '#fff' : isDarkMode ? '#9ca3af' : '#9ca3af',
                    boxShadow: isActive ? `0 4px 15px ${style.primaryColor}40` : 'none',
                  }}
                >
                  {isComplete ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                {/* Step Label */}
                <span className={`text-[10px] mt-1.5 font-semibold transition-colors ${
                  isActive 
                    ? (isDarkMode ? 'text-gray-100' : 'text-gray-900') 
                    : 'text-gray-400'
                }`}>
                  {step.label}
                </span>
              </div>

              {/* Connector Line */}
              {idx < steps.length - 1 && (
                <div 
                  className="flex-1 h-1 mx-2 rounded-full transition-all duration-300"
                  style={{ 
                    background: idx < currentStepIndex 
                      ? style.primaryColor
                      : isDarkMode ? 'rgba(75, 75, 85, 0.5)' : 'rgba(229, 231, 235, 0.6)'
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarStepIndicator;
