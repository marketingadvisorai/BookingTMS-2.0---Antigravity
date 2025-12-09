/**
 * Widget Type Config Selector
 * Renders the appropriate config component based on widget type
 * @module embed-pro/components/widget-type-configs/WidgetTypeConfigSelector
 */

import React from 'react';
import type { EmbedType } from '../../types';
import { BookingWidgetConfig } from './BookingWidgetConfig';
import { CalendarWidgetConfig } from './CalendarWidgetConfig';
import { ButtonWidgetConfig } from './ButtonWidgetConfig';
import { InlineWidgetConfig } from './InlineWidgetConfig';
import { PopupWidgetConfig } from './PopupWidgetConfig';
import {
  BOOKING_WIDGET_DEFAULTS,
  CALENDAR_WIDGET_DEFAULTS,
  BUTTON_WIDGET_DEFAULTS,
  INLINE_WIDGET_DEFAULTS,
  POPUP_WIDGET_DEFAULTS,
  type BookingWidgetOptions,
  type CalendarWidgetOptions,
  type ButtonWidgetOptions,
  type InlineWidgetOptions,
  type PopupWidgetOptions,
} from './defaults';

export type WidgetTypeOptions = 
  | BookingWidgetOptions
  | CalendarWidgetOptions
  | ButtonWidgetOptions
  | InlineWidgetOptions
  | PopupWidgetOptions;

interface WidgetTypeConfigSelectorProps {
  type: EmbedType;
  options: WidgetTypeOptions;
  onChange: (options: WidgetTypeOptions) => void;
}

/**
 * Get default options for a widget type
 */
export function getDefaultOptionsForType(type: EmbedType): WidgetTypeOptions {
  switch (type) {
    case 'booking-widget':
      return { ...BOOKING_WIDGET_DEFAULTS };
    case 'calendar-widget':
      return { ...CALENDAR_WIDGET_DEFAULTS };
    case 'button-widget':
      return { ...BUTTON_WIDGET_DEFAULTS };
    case 'inline-widget':
      return { ...INLINE_WIDGET_DEFAULTS };
    case 'popup-widget':
      return { ...POPUP_WIDGET_DEFAULTS };
    default:
      return { ...BOOKING_WIDGET_DEFAULTS };
  }
}

export const WidgetTypeConfigSelector: React.FC<WidgetTypeConfigSelectorProps> = ({
  type,
  options,
  onChange,
}) => {
  switch (type) {
    case 'booking-widget':
      return (
        <BookingWidgetConfig
          options={options as BookingWidgetOptions}
          onChange={onChange}
        />
      );
    case 'calendar-widget':
      return (
        <CalendarWidgetConfig
          options={options as CalendarWidgetOptions}
          onChange={onChange}
        />
      );
    case 'button-widget':
      return (
        <ButtonWidgetConfig
          options={options as ButtonWidgetOptions}
          onChange={onChange}
        />
      );
    case 'inline-widget':
      return (
        <InlineWidgetConfig
          options={options as InlineWidgetOptions}
          onChange={onChange}
        />
      );
    case 'popup-widget':
      return (
        <PopupWidgetConfig
          options={options as PopupWidgetOptions}
          onChange={onChange}
        />
      );
    default:
      return null;
  }
};

export default WidgetTypeConfigSelector;
