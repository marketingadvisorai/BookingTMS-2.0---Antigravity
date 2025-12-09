/**
 * Popup Widget Pro
 * Modal/popup widget triggered by various events
 * @module embed-pro/widgets/PopupWidgetPro
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar } from 'lucide-react';
import type { WidgetData } from '../types/widget.types';
import BookingWidgetPro from './BookingWidgetPro';

interface PopupWidgetProProps {
  data: WidgetData;
  popupOptions?: {
    trigger?: 'click' | 'scroll' | 'timer' | 'exit-intent';
    triggerDelay?: number;
    scrollPercentage?: number;
    position?: 'center' | 'right' | 'left' | 'bottom';
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    backdropBlur?: boolean;
    closeOnOutsideClick?: boolean;
    showCloseButton?: boolean;
  };
  onBookingComplete?: (booking: any) => void;
  triggerElement?: React.ReactNode;
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-full mx-4',
};

const positionVariants = {
  center: { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 } },
  right: { initial: { x: '100%' }, animate: { x: 0 } },
  left: { initial: { x: '-100%' }, animate: { x: 0 } },
  bottom: { initial: { y: '100%' }, animate: { y: 0 } },
};

export const PopupWidgetPro: React.FC<PopupWidgetProProps> = ({
  data,
  popupOptions = {},
  onBookingComplete,
  triggerElement,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  const {
    trigger = 'click',
    triggerDelay = 3000,
    scrollPercentage = 50,
    position = 'center',
    size = 'lg',
    backdropBlur = true,
    closeOnOutsideClick = true,
    showCloseButton = true,
  } = popupOptions;

  const style = data.style;

  // Timer trigger
  useEffect(() => {
    if (trigger === 'timer' && !hasTriggered) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        setHasTriggered(true);
      }, triggerDelay);
      return () => clearTimeout(timer);
    }
  }, [trigger, triggerDelay, hasTriggered]);

  // Scroll trigger
  useEffect(() => {
    if (trigger === 'scroll' && !hasTriggered) {
      const handleScroll = () => {
        const scrolled = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        if (scrolled >= scrollPercentage) {
          setIsOpen(true);
          setHasTriggered(true);
        }
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [trigger, scrollPercentage, hasTriggered]);

  // Exit intent trigger
  useEffect(() => {
    if (trigger === 'exit-intent' && !hasTriggered) {
      const handleMouseLeave = (e: MouseEvent) => {
        if (e.clientY <= 0) {
          setIsOpen(true);
          setHasTriggered(true);
        }
      };
      document.addEventListener('mouseleave', handleMouseLeave);
      return () => document.removeEventListener('mouseleave', handleMouseLeave);
    }
  }, [trigger, hasTriggered]);

  const handleBackdropClick = useCallback(() => {
    if (closeOnOutsideClick) setIsOpen(false);
  }, [closeOnOutsideClick]);

  const getPositionClasses = () => {
    switch (position) {
      case 'right': return 'right-0 top-0 h-full';
      case 'left': return 'left-0 top-0 h-full';
      case 'bottom': return 'bottom-0 left-0 right-0';
      default: return 'inset-0 m-auto';
    }
  };

  return (
    <>
      {/* Trigger Element */}
      {trigger === 'click' && (
        <div onClick={() => setIsOpen(true)}>
          {triggerElement || (
            <button
              className="px-6 py-3 font-semibold rounded-lg text-white flex items-center gap-2"
              style={{ backgroundColor: style.primaryColor, borderRadius: style.borderRadius }}
            >
              <Calendar className="w-5 h-5" />
              Book Now
            </button>
          )}
        </div>
      )}

      {/* Popup Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleBackdropClick}
              className={`fixed inset-0 z-50 ${backdropBlur ? 'backdrop-blur-sm' : ''} bg-black/50`}
            />
            <motion.div
              {...positionVariants[position]}
              exit={positionVariants[position].initial}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`fixed z-50 ${getPositionClasses()} ${sizeClasses[size]} bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden`}
              style={{ maxHeight: position === 'center' ? '90vh' : '100vh' }}
            >
              {showCloseButton && (
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              <div className="h-full overflow-auto">
                <BookingWidgetPro
                  data={data}
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

export default PopupWidgetPro;
