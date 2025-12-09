/**
 * Popup Widget Configuration
 * Settings for modal/popup triggered widget
 * @module embed-pro/components/widget-type-configs/PopupWidgetConfig
 */

import React from 'react';
import { Label } from '../../../../components/ui/label';
import { Input } from '../../../../components/ui/input';
import { Switch } from '../../../../components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Maximize2, Timer, ArrowDownCircle, X, Sparkles } from 'lucide-react';
import type { PopupWidgetOptions } from './defaults';

interface PopupWidgetConfigProps {
  options: PopupWidgetOptions;
  onChange: (options: PopupWidgetOptions) => void;
}

export const PopupWidgetConfig: React.FC<PopupWidgetConfigProps> = ({
  options,
  onChange,
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Popup Widget Options</CardTitle>
        <CardDescription>Configure modal trigger and behavior</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Trigger Type */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Trigger Type
          </Label>
          <Select
            value={options.trigger}
            onValueChange={(v) => onChange({ ...options, trigger: v as PopupWidgetOptions['trigger'] })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="click">On Click</SelectItem>
              <SelectItem value="scroll">On Scroll</SelectItem>
              <SelectItem value="timer">After Delay</SelectItem>
              <SelectItem value="exit-intent">Exit Intent</SelectItem>
              <SelectItem value="hover">On Hover</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Timer Delay */}
        {options.trigger === 'timer' && (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Timer className="w-4 h-4" /> Delay (seconds)
            </Label>
            <Input
              type="number"
              value={options.triggerDelay / 1000}
              onChange={(e) => onChange({ ...options, triggerDelay: (parseInt(e.target.value) || 3) * 1000 })}
              min={1}
              max={60}
            />
          </div>
        )}

        {/* Scroll Percentage */}
        {options.trigger === 'scroll' && (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <ArrowDownCircle className="w-4 h-4" /> Scroll Percentage
            </Label>
            <Input
              type="number"
              value={options.scrollPercentage}
              onChange={(e) => onChange({ ...options, scrollPercentage: parseInt(e.target.value) || 50 })}
              min={10}
              max={100}
            />
          </div>
        )}

        {/* Position */}
        <div className="space-y-2">
          <Label>Popup Position</Label>
          <Select
            value={options.position}
            onValueChange={(v) => onChange({ ...options, position: v as PopupWidgetOptions['position'] })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="right">Right Drawer</SelectItem>
              <SelectItem value="left">Left Drawer</SelectItem>
              <SelectItem value="bottom">Bottom Sheet</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Size */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Maximize2 className="w-4 h-4" /> Popup Size
          </Label>
          <Select
            value={options.size}
            onValueChange={(v) => onChange({ ...options, size: v as PopupWidgetOptions['size'] })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="sm">Small</SelectItem>
              <SelectItem value="md">Medium</SelectItem>
              <SelectItem value="lg">Large</SelectItem>
              <SelectItem value="xl">Extra Large</SelectItem>
              <SelectItem value="full">Full Screen</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Toggle Options */}
        {[
          { key: 'backdropBlur', label: 'Backdrop Blur', icon: Sparkles, desc: 'Blur background when open' },
          { key: 'closeOnOutsideClick', label: 'Close on Outside Click', icon: X, desc: 'Close when clicking outside' },
          { key: 'showCloseButton', label: 'Show Close Button', icon: X, desc: 'Display X close button' },
        ].map(({ key, label, icon: Icon, desc }) => (
          <div key={key} className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-pink-50 dark:bg-pink-900/20 flex items-center justify-center">
                <Icon className="w-4 h-4 text-pink-600" />
              </div>
              <div>
                <Label className="text-sm font-medium">{label}</Label>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </div>
            <Switch
              checked={options[key as keyof PopupWidgetOptions] as boolean}
              onCheckedChange={(v) => onChange({ ...options, [key]: v })}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default PopupWidgetConfig;
