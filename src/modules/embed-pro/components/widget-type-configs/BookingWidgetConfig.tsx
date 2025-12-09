/**
 * Booking Widget Configuration
 * Settings for full booking experience widget
 * @module embed-pro/components/widget-type-configs/BookingWidgetConfig
 */

import React from 'react';
import { Label } from '../../../../components/ui/label';
import { Switch } from '../../../../components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Calendar, Clock, DollarSign, FileText, Image, Users, Minimize2 } from 'lucide-react';
import type { BookingWidgetOptions } from './defaults';

interface BookingWidgetConfigProps {
  options: BookingWidgetOptions;
  onChange: (options: BookingWidgetOptions) => void;
}

export const BookingWidgetConfig: React.FC<BookingWidgetConfigProps> = ({
  options,
  onChange,
}) => {
  const handleToggle = (key: keyof BookingWidgetOptions) => {
    onChange({ ...options, [key]: !options[key] });
  };

  const configItems = [
    { key: 'showCalendar', label: 'Show Calendar', icon: Calendar, desc: 'Display date selection calendar' },
    { key: 'showTimeSlots', label: 'Show Time Slots', icon: Clock, desc: 'Show available time slots' },
    { key: 'showPricing', label: 'Show Pricing', icon: DollarSign, desc: 'Display pricing information' },
    { key: 'showDescription', label: 'Show Description', icon: FileText, desc: 'Show activity description' },
    { key: 'showImages', label: 'Show Images', icon: Image, desc: 'Display activity images' },
    { key: 'allowMultipleActivities', label: 'Multiple Activities', icon: Users, desc: 'Allow booking multiple activities' },
    { key: 'compactMode', label: 'Compact Mode', icon: Minimize2, desc: 'Use compact layout' },
  ] as const;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Booking Widget Options</CardTitle>
        <CardDescription>Configure the full booking experience</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {configItems.map(({ key, label, icon: Icon, desc }) => (
          <div key={key} className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <Label className="text-sm font-medium">{label}</Label>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </div>
            <Switch
              checked={options[key]}
              onCheckedChange={() => handleToggle(key)}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default BookingWidgetConfig;
