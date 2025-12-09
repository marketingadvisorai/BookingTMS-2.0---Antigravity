/**
 * Inline Widget Configuration
 * Settings for embedded inline widget
 * @module embed-pro/components/widget-type-configs/InlineWidgetConfig
 */

import React from 'react';
import { Label } from '../../../../components/ui/label';
import { Input } from '../../../../components/ui/input';
import { Switch } from '../../../../components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { LayoutTemplate, Maximize, Square, Smartphone } from 'lucide-react';
import type { InlineWidgetOptions } from './defaults';

interface InlineWidgetConfigProps {
  options: InlineWidgetOptions;
  onChange: (options: InlineWidgetOptions) => void;
}

export const InlineWidgetConfig: React.FC<InlineWidgetConfigProps> = ({
  options,
  onChange,
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Inline Widget Options</CardTitle>
        <CardDescription>Configure embedded inline behavior</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Height Mode */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Maximize className="w-4 h-4" /> Height Mode
          </Label>
          <Select
            value={options.height}
            onValueChange={(v) => onChange({ ...options, height: v as 'auto' | 'fixed' })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto (Content-based)</SelectItem>
              <SelectItem value="fixed">Fixed Height</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Fixed Height Input */}
        {options.height === 'fixed' && (
          <div className="space-y-2">
            <Label>Fixed Height (px)</Label>
            <Input
              type="number"
              value={options.fixedHeight}
              onChange={(e) => onChange({ ...options, fixedHeight: parseInt(e.target.value) || 600 })}
              min={300}
              max={1200}
            />
          </div>
        )}

        {/* Responsive Breakpoint */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Smartphone className="w-4 h-4" /> Mobile Breakpoint (px)
          </Label>
          <Input
            type="number"
            value={options.responsiveBreakpoint}
            onChange={(e) => onChange({ ...options, responsiveBreakpoint: parseInt(e.target.value) || 768 })}
            min={320}
            max={1024}
          />
          <p className="text-xs text-gray-500">Widget switches to mobile layout below this width</p>
        </div>

        {/* Toggle Options */}
        {[
          { key: 'showBorder', label: 'Show Border', icon: Square, desc: 'Display border around widget' },
          { key: 'seamlessIntegration', label: 'Seamless Integration', icon: LayoutTemplate, desc: 'Blend with page styling' },
        ].map(({ key, label, icon: Icon, desc }) => (
          <div key={key} className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                <Icon className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <Label className="text-sm font-medium">{label}</Label>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </div>
            <Switch
              checked={options[key as keyof InlineWidgetOptions] as boolean}
              onCheckedChange={(v) => onChange({ ...options, [key]: v })}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default InlineWidgetConfig;
