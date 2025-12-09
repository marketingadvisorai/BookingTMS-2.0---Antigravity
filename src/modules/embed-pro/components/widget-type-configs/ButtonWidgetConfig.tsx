/**
 * Button Widget Configuration
 * Settings for "Book Now" button widget
 * @module embed-pro/components/widget-type-configs/ButtonWidgetConfig
 */

import React from 'react';
import { Label } from '../../../../components/ui/label';
import { Input } from '../../../../components/ui/input';
import { Switch } from '../../../../components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { MousePointerClick, Maximize2, Sparkles } from 'lucide-react';
import type { ButtonWidgetOptions } from './defaults';

interface ButtonWidgetConfigProps {
  options: ButtonWidgetOptions;
  onChange: (options: ButtonWidgetOptions) => void;
}

export const ButtonWidgetConfig: React.FC<ButtonWidgetConfigProps> = ({
  options,
  onChange,
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Button Widget Options</CardTitle>
        <CardDescription>Configure the Book Now button appearance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Button Text */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <MousePointerClick className="w-4 h-4" /> Button Text
          </Label>
          <Input
            value={options.buttonText}
            onChange={(e) => onChange({ ...options, buttonText: e.target.value })}
            placeholder="Book Now"
          />
        </div>

        {/* Button Size */}
        <div className="space-y-2">
          <Label>Button Size</Label>
          <Select
            value={options.buttonSize}
            onValueChange={(v) => onChange({ ...options, buttonSize: v as 'sm' | 'md' | 'lg' | 'xl' })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="sm">Small</SelectItem>
              <SelectItem value="md">Medium</SelectItem>
              <SelectItem value="lg">Large</SelectItem>
              <SelectItem value="xl">Extra Large</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Button Style */}
        <div className="space-y-2">
          <Label>Button Style</Label>
          <Select
            value={options.buttonVariant}
            onValueChange={(v) => onChange({ ...options, buttonVariant: v as 'filled' | 'outline' | 'ghost' })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="filled">Filled (Solid)</SelectItem>
              <SelectItem value="outline">Outline</SelectItem>
              <SelectItem value="ghost">Ghost (Transparent)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Open Mode */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Maximize2 className="w-4 h-4" /> Open Behavior
          </Label>
          <Select
            value={options.openMode}
            onValueChange={(v) => onChange({ ...options, openMode: v as 'popup' | 'redirect' | 'slideover' })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="popup">Modal Popup</SelectItem>
              <SelectItem value="slideover">Slide Over Panel</SelectItem>
              <SelectItem value="redirect">Redirect to Page</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Toggle Options */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <Label className="text-sm font-medium">Pulse Animation</Label>
              <p className="text-xs text-gray-500">Add attention-grabbing pulse</p>
            </div>
          </div>
          <Switch
            checked={options.pulseAnimation}
            onCheckedChange={(v) => onChange({ ...options, pulseAnimation: v })}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ButtonWidgetConfig;
