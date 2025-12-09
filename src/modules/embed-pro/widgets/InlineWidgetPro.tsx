/**
 * Inline Widget Pro
 * Embedded inline with page content, responsive design
 * @module embed-pro/widgets/InlineWidgetPro
 */

import React from 'react';
import { motion } from 'framer-motion';
import type { WidgetData } from '../types/widget.types';
import BookingWidgetPro from './BookingWidgetPro';

interface InlineWidgetProProps {
  data: WidgetData;
  inlineOptions?: {
    height?: 'auto' | 'fixed';
    fixedHeight?: number;
    showBorder?: boolean;
    seamlessIntegration?: boolean;
  };
  onBookingComplete?: (booking: any) => void;
}

export const InlineWidgetPro: React.FC<InlineWidgetProProps> = ({
  data,
  inlineOptions = {},
  onBookingComplete,
}) => {
  const {
    height = 'auto',
    fixedHeight = 600,
    showBorder = false,
    seamlessIntegration = true,
  } = inlineOptions;

  const style = data.style;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
      style={{
        height: height === 'fixed' ? `${fixedHeight}px` : 'auto',
        overflow: height === 'fixed' ? 'auto' : 'visible',
        borderRadius: seamlessIntegration ? '0' : style.borderRadius,
        border: showBorder ? `1px solid ${style.theme === 'dark' ? '#374151' : '#e5e7eb'}` : 'none',
        fontFamily: style.fontFamily,
      }}
    >
      <BookingWidgetPro
        data={data}
        onBookingComplete={(bookingId) => {
          onBookingComplete?.({ id: bookingId });
        }}
      />
    </motion.div>
  );
};

export default InlineWidgetPro;
