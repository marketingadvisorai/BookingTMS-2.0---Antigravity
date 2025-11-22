/**
 * CalendarWidgetSettings Component
 * 
 * REFACTORED VERSION
 * This component now acts as a coordinator for the various settings tabs.
 * All complex logic has been moved to sub-components in ./settings/tabs/
 */

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Eye, Save, Check, AlertCircle } from 'lucide-react';
import CustomSettingsPanel from './CustomSettingsPanel';
import { GeneralSettingsTab } from './settings/tabs/GeneralSettingsTab';
import { ServiceItemsSettingsTab } from './settings/tabs/ServiceItemsSettingsTab';
import { AvailabilitySettingsTab } from './settings/tabs/AvailabilitySettingsTab';
import { SEOSettingsTab } from './settings/tabs/SEOSettingsTab';
import { AdvancedSettingsTab } from './settings/tabs/AdvancedSettingsTab';
import { VenueSettingsTab } from './settings/tabs/VenueSettingsTab';
import { useTerminology } from '../../hooks/useTerminology';

interface CalendarWidgetSettingsProps {
  config: any;
  onConfigChange: (newConfig: any) => void;
  onPreview: () => void;
  embedContext?: {
    venueType?: string;
    venueId?: string;
  };
  saveStatus?: 'idle' | 'saving' | 'saved' | 'error';
}

export default function CalendarWidgetSettings({
  config,
  onConfigChange,
  onPreview,
  embedContext,
  saveStatus = 'idle'
}: CalendarWidgetSettingsProps) {
  const t = useTerminology(embedContext?.venueType || 'escape_room');

  return (
    <div className="space-y-6 pb-24 sm:pb-28">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-gray-900">Calendar Widget Settings</h2>
          <p className="text-sm text-gray-600 mt-1">Configure your booking widget appearance and options</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Save Status Indicator */}
          {saveStatus === 'saving' && (
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <Save className="w-3 h-3 animate-pulse" />
              Saving...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="text-sm text-green-600 flex items-center gap-1">
              <Check className="w-3 h-3" />
              Saved
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Error saving
            </span>
          )}

          <Button onClick={onPreview} variant="outline" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Preview Widget
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="flex w-full gap-1 overflow-x-auto">
          <TabsTrigger value="general" className="text-xs sm:text-sm">General</TabsTrigger>
          <TabsTrigger value="venue" className="text-xs sm:text-sm">Venue</TabsTrigger>
          <TabsTrigger value="games" className="text-xs sm:text-sm">{t.plural}</TabsTrigger>
          <TabsTrigger value="availability" className="text-xs sm:text-sm">Availability</TabsTrigger>
          <TabsTrigger value="custom" className="text-xs sm:text-sm">Custom</TabsTrigger>
          <TabsTrigger value="seo" className="text-xs sm:text-sm">SEO</TabsTrigger>
          <TabsTrigger value="advanced" className="text-xs sm:text-sm">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <GeneralSettingsTab config={config} onConfigChange={onConfigChange} />
        </TabsContent>

        <TabsContent value="venue">
          <VenueSettingsTab
            config={config}
            onConfigChange={onConfigChange}
            embedContext={embedContext}
          />
        </TabsContent>

        <TabsContent value="games">
          <ServiceItemsSettingsTab
            config={config}
            onConfigChange={onConfigChange}
            embedContext={embedContext}
          />
        </TabsContent>

        <TabsContent value="availability">
          <AvailabilitySettingsTab config={config} onConfigChange={onConfigChange} />
        </TabsContent>

        <TabsContent value="custom">
          <CustomSettingsPanel config={config} onConfigChange={onConfigChange} />
        </TabsContent>

        <TabsContent value="seo">
          <SEOSettingsTab config={config} onConfigChange={onConfigChange} />
        </TabsContent>

        <TabsContent value="advanced">
          <AdvancedSettingsTab
            config={config}
            onConfigChange={onConfigChange}
            embedContext={embedContext}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
