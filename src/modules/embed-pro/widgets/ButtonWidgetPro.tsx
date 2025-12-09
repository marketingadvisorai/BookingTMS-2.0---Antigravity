/**
 * Button Widget Pro
 * "Book Now" button that opens a popup with the full booking flow
 * @module embed-pro/widgets/ButtonWidgetPro
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar } from 'lucide-react';
import { cn } from '../../../components/ui/utils';
import type { WidgetData, WidgetStyle } from '../types/widget.types';
import BookingWidgetPro from './BookingWidgetPro';

interface ButtonWidgetProProps {
  widgetData: WidgetData;
  style?: WidgetStyle; // Optional override, defaults to widgetData.style
  buttonOptions?: {
    buttonText?: string;
    buttonSize?: 'sm' | 'md' | 'lg' | 'xl';
    buttonVariant?: 'filled' | 'outline' | 'ghost';
    openMode?: 'popup' | 'slideover';
    showIcon?: boolean;
    pulseAnimation?: boolean;
  };
  onBookingComplete?: (booking: any) => void;
}

// Default style fallback
const DEFAULT_STYLE: WidgetStyle = {
  primaryColor: '#2563eb',
  secondaryColor: '#1e40af',
  backgroundColor: '#ffffff',
  textColor: '#1f2937',
  borderRadius: '8px',
  fontFamily: 'Inter, system-ui, sans-serif',
  theme: 'light',
};

const sizeClasses = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-2.5 text-base',
  lg: 'px-8 py-3 text-lg',
  xl: 'px-10 py-4 text-xl',
};

export const ButtonWidgetPro: React.FC<ButtonWidgetProProps> = ({
  widgetData,
  style: styleProp,
  buttonOptions = {},
  onBookingComplete,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Resolve effective style: prop > widgetData > default
  const effectiveStyle = styleProp ?? widgetData.style ?? DEFAULT_STYLE;

  const {
    buttonText = 'Book Now',
    buttonSize = 'lg',
    buttonVariant = 'filled',
    showIcon = true,
    pulseAnimation = false,
  } = buttonOptions;

  const variantStyles = {
    filled: {
      backgroundColor: effectiveStyle.primaryColor,
      color: '#ffffff',
      border: 'none',
    },
    outline: {
      backgroundColor: 'transparent',
      color: effectiveStyle.primaryColor,
      border: `2px solid ${effectiveStyle.primaryColor}`,
    },
    ghost: {
      backgroundColor: 'transparent',
      color: effectiveStyle.primaryColor,
      border: 'none',
    },
  };

  return (
    <>
      {/* Button Trigger */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={cn(
          'font-semibold rounded-lg flex items-center justify-center gap-2 transition-all',
          sizeClasses[buttonSize],
          pulseAnimation && 'animate-pulse'
        )}
        style={{
          ...variantStyles[buttonVariant],
          borderRadius: effectiveStyle.borderRadius,
          fontFamily: effectiveStyle.fontFamily,
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {showIcon && <Calendar className="w-5 h-5" />}
        {buttonText}
      </motion.button>

      {/* Popup Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-4 md:inset-8 lg:inset-16 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Booking Widget Content */}
              <div className="h-full overflow-auto">
                <BookingWidgetPro
                  data={widgetData}
                  onBookingComplete={(bookingId) => {
                    onBookingComplete?.({ id: bookingId });
                    setTimeout(() => setIsOpen(false), 2000);
                  }}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default ButtonWidgetPro;
