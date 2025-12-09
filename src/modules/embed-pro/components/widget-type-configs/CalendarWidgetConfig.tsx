/**
 * Calendar Widget Configuration
 * Settings for calendar-only availability widget
 * @module embed-pro/components/widget-type-configs/CalendarWidgetConfig
 */

import React from 'react';
import { Label } from '../../../../components/ui/label';
import { Switch } from '../../../../components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { CalendarDays, Eye, DollarSign, Sun, List } from 'lucide-react';
import type { CalendarWidgetOptions } from './defaults';

interface CalendarWidgetConfigProps {
  options: CalendarWidgetOptions;
  onChange: (options: CalendarWidgetOptions) => void;
}

export const CalendarWidgetConfig: React.FC<CalendarWidgetConfigProps> = ({
  options,
  onChange,
}) => {
  const handleToggle = (key: keyof CalendarWidgetOptions) => {
    if (typeof options[key] === 'boolean') {
      onChange({ ...options, [key]: !options[key] });
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Calendar Widget Options</CardTitle>
        <CardDescription>Configure availability calendar display</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Display Mode */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4" /> Display Mode
          </Label>
          <Select
            value={options.displayMode}
            onValueChange={(v) => onChange({ ...options, displayMode: v as 'month' | 'week' | 'list' })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month View</SelectItem>
              <SelectItem value="week">Week View</SelectItem>
              <SelectItem value="list">List View</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Toggle Options */}
        {[
          { key: 'showAvailabilityIndicator', label: 'Availability Indicator', icon: Eye, desc: 'Show color-coded availability' },
          { key: 'showPricing', label: 'Show Pricing', icon: DollarSign, desc: 'Display prices on dates' },
          { key: 'highlightToday', label: 'Highlight Today', icon: Sun, desc: 'Highlight current date' },
          { key: 'showLegend', label: 'Show Legend', icon: List, desc: 'Display availability legend' },
        ].map(({ key, label, icon: Icon, desc }) => (
          <div key={key} className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                <Icon className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <Label className="text-sm font-medium">{label}</Label>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </div>
            <Switch
              checked={options[key as keyof CalendarWidgetOptions] as boolean}
              onCheckedChange={() => handleToggle(key as keyof CalendarWidgetOptions)}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default CalendarWidgetConfig;
