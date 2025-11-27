/**
 * Embed Pro 2.0 - Add to Calendar Component
 * @module embed-pro/widget-components/WidgetAddToCalendar
 * 
 * Dropdown for adding booking to various calendar providers.
 * Supports Google, Outlook, Yahoo, Apple, and iCal download.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, Download, ExternalLink } from 'lucide-react';
import { calendarSyncService } from '../services/calendar-sync.service';
import type { CalendarEvent, CalendarProvider } from '../types/calendar-sync.types';
import type { WidgetStyle } from '../types/widget.types';

// =====================================================
// PROPS INTERFACE
// =====================================================

interface WidgetAddToCalendarProps {
  /** Calendar event data */
  event: CalendarEvent;
  /** Widget style */
  style: WidgetStyle;
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'outline';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Custom button text */
  buttonText?: string;
}

// =====================================================
// CALENDAR ICONS
// =====================================================

const CalendarIcons: Record<CalendarProvider, React.ReactNode> = {
  google: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  ),
  outlook: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#0078D4">
      <path d="M24 7.387v10.478c0 .23-.08.424-.238.576-.158.152-.362.228-.61.228h-8.86c-.25 0-.453-.076-.61-.228-.159-.152-.238-.346-.238-.576V7.387c0-.23.08-.424.238-.576.157-.152.36-.228.61-.228h8.86c.248 0 .452.076.61.228.158.152.237.346.237.576z"/>
      <path d="M24 7.387v10.478c0 .23-.08.424-.238.576-.158.152-.362.228-.61.228h-8.86c-.25 0-.453-.076-.61-.228-.159-.152-.238-.346-.238-.576V7.387c0-.23.08-.424.238-.576.157-.152.36-.228.61-.228h8.86c.248 0 .452.076.61.228.158.152.237.346.237.576z" fill="#0078D4"/>
      <path d="M9.016 4.748v13.628c0 .237-.056.45-.168.638-.112.187-.27.326-.473.415L.596 23.397c-.088.044-.188.066-.3.066-.175 0-.324-.066-.446-.198C-.05 23.133 0 22.954 0 22.748V5.376c0-.178.034-.338.1-.48.068-.143.16-.26.276-.352L8.154.132c.203-.14.38-.168.53-.085.15.083.226.237.226.462l.106 4.24z" fill="#0364B8"/>
      <path d="M9.016 4.748v13.628c0 .237-.056.45-.168.638-.112.187-.27.326-.473.415L.596 23.397c-.088.044-.188.066-.3.066-.175 0-.324-.066-.446-.198C-.05 23.133 0 22.954 0 22.748V5.376c0-.178.034-.338.1-.48.068-.143.16-.26.276-.352L8.154.132c.203-.14.38-.168.53-.085.15.083.226.237.226.462l.106 4.24z" fill="#0A2767"/>
    </svg>
  ),
  yahoo: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#6001D2">
      <path d="M14.667 0l-4.027 9.573L6.64 0H0l7.947 14.4v9.6h4.267v-9.6L20.107 0h-5.44z"/>
    </svg>
  ),
  apple: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  ),
  ical: (
    <Calendar className="w-4 h-4" />
  ),
};

// =====================================================
// COMPONENT
// =====================================================

export const WidgetAddToCalendar: React.FC<WidgetAddToCalendarProps> = ({
  event,
  style,
  variant = 'secondary',
  size = 'md',
  buttonText = 'Add to Calendar',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generate links
  const links = calendarSyncService.generateCalendarLinks(event);

  // Handle calendar selection
  const handleSelect = (provider: CalendarProvider) => {
    switch (provider) {
      case 'google':
        calendarSyncService.openCalendarLink(links.google);
        break;
      case 'outlook':
        calendarSyncService.openCalendarLink(links.outlook);
        break;
      case 'yahoo':
        calendarSyncService.openCalendarLink(links.yahoo);
        break;
      case 'apple':
      case 'ical':
        calendarSyncService.downloadICalFile(event, `booking.ics`);
        break;
    }
    setIsOpen(false);
  };

  // Button styles
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base',
  };

  const variantClasses = {
    primary: 'text-white',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          inline-flex items-center gap-2 rounded-xl font-medium transition-all
          ${sizeClasses[size]}
          ${variantClasses[variant]}
        `}
        style={variant === 'primary' ? { backgroundColor: style.primaryColor } : undefined}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Calendar className="w-4 h-4" />
        {buttonText}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="absolute z-50 mt-2 w-56 rounded-xl bg-white shadow-lg border border-gray-200 py-1 animate-in fade-in slide-in-from-top-2 duration-150"
          role="listbox"
          aria-label="Calendar options"
        >
          {/* Google Calendar */}
          <button
            onClick={() => handleSelect('google')}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            role="option"
          >
            {CalendarIcons.google}
            <span className="flex-1 text-left">Google Calendar</span>
            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {/* Outlook */}
          <button
            onClick={() => handleSelect('outlook')}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            role="option"
          >
            {CalendarIcons.outlook}
            <span className="flex-1 text-left">Outlook</span>
            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {/* Yahoo */}
          <button
            onClick={() => handleSelect('yahoo')}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            role="option"
          >
            {CalendarIcons.yahoo}
            <span className="flex-1 text-left">Yahoo Calendar</span>
            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
          </button>

          <div className="my-1 border-t border-gray-100" />

          {/* Apple / iCal Download */}
          <button
            onClick={() => handleSelect('ical')}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            role="option"
          >
            {CalendarIcons.apple}
            <span className="flex-1 text-left">Apple Calendar</span>
            <Download className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {/* Download .ics */}
          <button
            onClick={() => handleSelect('ical')}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            role="option"
          >
            {CalendarIcons.ical}
            <span className="flex-1 text-left">Download .ics file</span>
            <Download className="w-3.5 h-3.5 text-gray-400" />
          </button>
        </div>
      )}
    </div>
  );
};

export default WidgetAddToCalendar;
