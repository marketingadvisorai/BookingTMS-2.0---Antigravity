/**
 * Edit Embed Modal - Display Tab
 * @module embed-pro/components/edit-modal/DisplayTab
 */

import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { EditFormData } from './types';

interface DisplayTabProps {
  formData: EditFormData;
  onChange: (updates: Partial<EditFormData>) => void;
}

interface DisplayToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

const DisplayToggle: React.FC<DisplayToggleProps> = ({
  label,
  description,
  checked,
  onCheckedChange,
}) => (
  <div className="flex items-center justify-between py-2">
    <div>
      <Label className="font-medium">{label}</Label>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
    <Switch checked={checked} onCheckedChange={onCheckedChange} />
  </div>
);

export const DisplayTab: React.FC<DisplayTabProps> = ({ formData, onChange }) => {
  return (
    <div className="space-y-4">
      <DisplayToggle
        label="Show Pricing"
        description="Display prices on cards"
        checked={formData.showPricing}
        onCheckedChange={(checked) => onChange({ showPricing: checked })}
      />

      <DisplayToggle
        label="Show Description"
        description="Display activity descriptions"
        checked={formData.showDescription}
        onCheckedChange={(checked) => onChange({ showDescription: checked })}
      />

      <DisplayToggle
        label="Show Images"
        description="Display activity cover images"
        checked={formData.showActivityImage}
        onCheckedChange={(checked) => onChange({ showActivityImage: checked })}
      />

      <DisplayToggle
        label="Show Duration"
        description="Display activity duration"
        checked={formData.showActivityDuration}
        onCheckedChange={(checked) => onChange({ showActivityDuration: checked })}
      />

      <DisplayToggle
        label="Show Capacity"
        description="Display min-max players"
        checked={formData.showActivityCapacity}
        onCheckedChange={(checked) => onChange({ showActivityCapacity: checked })}
      />

      <DisplayToggle
        label="Enable Search"
        description="Show search box for activities"
        checked={formData.enableSearch}
        onCheckedChange={(checked) => onChange({ enableSearch: checked })}
      />

      <DisplayToggle
        label="Compact on Mobile"
        description="Use compact layout on small screens"
        checked={formData.compactOnMobile}
        onCheckedChange={(checked) => onChange({ compactOnMobile: checked })}
      />
    </div>
  );
};

export default DisplayTab;
