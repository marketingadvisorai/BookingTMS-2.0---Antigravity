/**
 * Advanced Customization - Display Options Section
 * @module embed-pro/components/advanced-customization/DisplayOptionsSection
 */

import React from 'react';
import { Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Section } from './Section';
import type { DisplayOptions } from '../../types';

interface DisplayOptionsSectionProps {
  displayOptions: DisplayOptions;
  setDisplayOptions: (value: DisplayOptions) => void;
  onSave: (updates: Record<string, any>) => Promise<void>;
  isLoading?: boolean;
}

export const DisplayOptionsSection: React.FC<DisplayOptionsSectionProps> = ({
  displayOptions,
  setDisplayOptions,
  onSave,
  isLoading = false,
}) => {
  const updateOption = <K extends keyof DisplayOptions>(
    key: K,
    value: DisplayOptions[K]
  ) => {
    setDisplayOptions({ ...displayOptions, [key]: value });
  };

  return (
    <Section
      title="Display Options"
      description="Control what's shown in the widget"
      icon={<Image className="w-4 h-4 text-blue-600" />}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label>Show Capacity Warning</Label>
            <p className="text-xs text-gray-500">Display "Only X spots left"</p>
          </div>
          <Switch
            checked={displayOptions.showCapacityWarning || false}
            onCheckedChange={(checked) => updateOption('showCapacityWarning', checked)}
          />
        </div>

        {displayOptions.showCapacityWarning && (
          <div>
            <Label>Warning Threshold</Label>
            <Input
              type="number"
              value={displayOptions.capacityWarningThreshold || 3}
              onChange={(e) => updateOption('capacityWarningThreshold', parseInt(e.target.value) || 3)}
              min={1}
              max={20}
              className="w-24 mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Show warning when spots remaining ≤ this number
            </p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <Label>Enable Waitlist</Label>
            <p className="text-xs text-gray-500">Allow signups when fully booked</p>
          </div>
          <Switch
            checked={displayOptions.showWaitlist || false}
            onCheckedChange={(checked) => updateOption('showWaitlist', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>Show Promo Code Field</Label>
            <p className="text-xs text-gray-500">Allow discount codes at checkout</p>
          </div>
          <Switch
            checked={displayOptions.showPromoField || false}
            onCheckedChange={(checked) => updateOption('showPromoField', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>Show Social Proof</Label>
            <p className="text-xs text-gray-500">Display "X people booked today"</p>
          </div>
          <Switch
            checked={displayOptions.showSocialProof || false}
            onCheckedChange={(checked) => updateOption('showSocialProof', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>Compact Mode</Label>
            <p className="text-xs text-gray-500">Minimize widget height</p>
          </div>
          <Switch
            checked={displayOptions.compactMode || false}
            onCheckedChange={(checked) => updateOption('compactMode', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>Show "Powered By"</Label>
            <p className="text-xs text-gray-500">Display attribution footer</p>
          </div>
          <Switch
            checked={displayOptions.showPoweredBy !== false}
            onCheckedChange={(checked) => updateOption('showPoweredBy', checked)}
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onSave({ display_options: displayOptions })}
          disabled={isLoading}
        >
          Save Display Options
        </Button>
      </div>
    </Section>
  );
};

export default DisplayOptionsSection;
