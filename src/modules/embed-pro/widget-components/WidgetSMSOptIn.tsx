/**
 * Embed Pro 2.0 - SMS Opt-In Component
 * @module embed-pro/widget-components/WidgetSMSOptIn
 * 
 * Checkbox for opting into SMS reminders during checkout.
 * Shows reminder options when enabled.
 */

import React, { useState } from 'react';
import { MessageSquare, Bell, Check, ChevronDown, ChevronUp } from 'lucide-react';
import type { SMSReminderType } from '../types/sms-reminder.types';
import type { WidgetStyle } from '../types/widget.types';

// =====================================================
// PROPS INTERFACE
// =====================================================

interface WidgetSMSOptInProps {
  /** Whether SMS is opted in */
  isOptedIn: boolean;
  /** Toggle opt-in */
  onOptInChange: (optedIn: boolean) => void;
  /** Selected reminder types */
  selectedReminders: SMSReminderType[];
  /** Update selected reminders */
  onRemindersChange: (reminders: SMSReminderType[]) => void;
  /** Phone number (for display) */
  phoneNumber?: string;
  /** Widget style */
  style: WidgetStyle;
}

// =====================================================
// REMINDER OPTIONS
// =====================================================

const REMINDER_OPTIONS: { type: SMSReminderType; label: string; description: string }[] = [
  {
    type: 'booking_confirmation',
    label: 'Booking confirmation',
    description: 'Immediate confirmation when you book',
  },
  {
    type: 'reminder_24h',
    label: '24-hour reminder',
    description: 'Reminder the day before',
  },
  {
    type: 'reminder_1h',
    label: '1-hour reminder',
    description: 'Reminder before your booking',
  },
];

// =====================================================
// COMPONENT
// =====================================================

export const WidgetSMSOptIn: React.FC<WidgetSMSOptInProps> = ({
  isOptedIn,
  onOptInChange,
  selectedReminders,
  onRemindersChange,
  phoneNumber,
  style,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Toggle reminder type
  const toggleReminder = (type: SMSReminderType) => {
    if (selectedReminders.includes(type)) {
      onRemindersChange(selectedReminders.filter(r => r !== type));
    } else {
      onRemindersChange([...selectedReminders, type]);
    }
  };

  // Handle opt-in toggle
  const handleOptInChange = (checked: boolean) => {
    onOptInChange(checked);
    if (checked && selectedReminders.length === 0) {
      // Default to all reminders when opting in
      onRemindersChange(['booking_confirmation', 'reminder_24h', 'reminder_1h']);
    }
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Main Checkbox */}
      <label className="flex items-start gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors">
        <div className="relative flex-shrink-0 mt-0.5">
          <input
            type="checkbox"
            checked={isOptedIn}
            onChange={(e) => handleOptInChange(e.target.checked)}
            className="sr-only peer"
          />
          <div 
            className={`
              w-5 h-5 rounded-md border-2 transition-all
              ${isOptedIn 
                ? 'border-transparent' 
                : 'border-gray-300 bg-white'
              }
            `}
            style={isOptedIn ? { backgroundColor: style.primaryColor } : undefined}
          >
            {isOptedIn && (
              <Check className="w-full h-full text-white p-0.5" />
            )}
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-gray-500" />
            <span className="font-medium text-gray-800">
              Send me SMS reminders
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            Get text reminders about your booking
            {phoneNumber && (
              <span className="text-gray-400"> to {phoneNumber}</span>
            )}
          </p>
        </div>

        {/* Expand/Collapse */}
        {isOptedIn && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setIsExpanded(!isExpanded);
            }}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-expanded={isExpanded}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>
        )}
      </label>

      {/* Reminder Options */}
      {isOptedIn && isExpanded && (
        <div className="border-t border-gray-100 p-4 pt-3 bg-gray-50 space-y-2">
          <p className="text-xs font-medium text-gray-500 mb-2">
            Choose which reminders to receive:
          </p>
          
          {REMINDER_OPTIONS.map((option) => (
            <label
              key={option.type}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-white cursor-pointer transition-colors"
            >
              <div className="relative flex-shrink-0">
                <input
                  type="checkbox"
                  checked={selectedReminders.includes(option.type)}
                  onChange={() => toggleReminder(option.type)}
                  className="sr-only peer"
                />
                <div 
                  className={`
                    w-4 h-4 rounded border-2 transition-all
                    ${selectedReminders.includes(option.type)
                      ? 'border-transparent' 
                      : 'border-gray-300 bg-white'
                    }
                  `}
                  style={selectedReminders.includes(option.type) 
                    ? { backgroundColor: style.primaryColor } 
                    : undefined
                  }
                >
                  {selectedReminders.includes(option.type) && (
                    <Check className="w-full h-full text-white p-0.5" />
                  )}
                </div>
              </div>

              <div className="flex-1">
                <span className="text-sm font-medium text-gray-700">
                  {option.label}
                </span>
                <p className="text-xs text-gray-500">{option.description}</p>
              </div>

              <Bell className="w-4 h-4 text-gray-300" />
            </label>
          ))}

          <p className="text-[10px] text-gray-400 pt-2 border-t border-gray-200">
            Message & data rates may apply. Reply STOP to unsubscribe.
          </p>
        </div>
      )}
    </div>
  );
};

export default WidgetSMSOptIn;
