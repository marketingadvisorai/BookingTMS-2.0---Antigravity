/**
 * Edit Embed Modal - Details Tab
 * @module embed-pro/components/edit-modal/DetailsTab
 */

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { EmbedConfigWithRelations } from '../../types/embed-config.types';
import type { EditFormData } from './types';

interface DetailsTabProps {
  formData: EditFormData;
  config: EmbedConfigWithRelations;
  onChange: (updates: Partial<EditFormData>) => void;
}

export const DetailsTab: React.FC<DetailsTabProps> = ({ formData, config, onChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Embed Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="e.g., Homepage Booking Widget"
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Optional description for this embed"
          className="mt-2"
          rows={3}
        />
      </div>

      {/* Show target info */}
      <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Target Type</span>
          <span className="font-medium capitalize">{config.target_type}</span>
        </div>

        {config.activity && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Activity</span>
            <span className="font-medium">{config.activity.name}</span>
          </div>
        )}

        {config.venue && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Venue</span>
            <span className="font-medium">{config.venue.name}</span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Embed Key</span>
          <code className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">
            {config.embed_key.slice(0, 20)}...
          </code>
        </div>
      </div>
    </div>
  );
};

export default DetailsTab;
