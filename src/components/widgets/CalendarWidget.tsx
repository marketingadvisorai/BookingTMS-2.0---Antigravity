import React from 'react';
import { BookingWizard } from './booking/BookingWizard';

interface CalendarWidgetProps {
  primaryColor?: string;
  config?: any;
}

export function CalendarWidget({ primaryColor = '#2563eb', config }: CalendarWidgetProps) {
  return (
    <BookingWizard
      config={config}
      primaryColor={primaryColor}
    />
  );
}
