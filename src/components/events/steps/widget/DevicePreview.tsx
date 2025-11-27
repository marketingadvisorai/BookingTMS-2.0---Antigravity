/**
 * Device Preview Component
 * Responsive preview frame for different devices
 * 
 * @module widget/DevicePreview
 */

import React from 'react';
import { Button } from '../../../ui/button';
import { Monitor, Tablet, Smartphone, ExternalLink } from 'lucide-react';
import { PreviewDevice, DEVICE_CONFIGS } from './types';

interface DevicePreviewProps {
  previewUrl: string;
  device: PreviewDevice;
  onDeviceChange: (device: PreviewDevice) => void;
  onOpenFullPreview: () => void;
  canOpenPreview: boolean;
}

export const DevicePreview: React.FC<DevicePreviewProps> = ({
  previewUrl,
  device,
  onDeviceChange,
  onOpenFullPreview,
  canOpenPreview,
}) => {
  const config = DEVICE_CONFIGS[device];

  return (
    <div className="space-y-4">
      {/* Device Selector */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={device === 'desktop' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onDeviceChange('desktop')}
          >
            <Monitor className="w-4 h-4 mr-1" />
            Desktop
          </Button>
          <Button
            variant={device === 'tablet' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onDeviceChange('tablet')}
          >
            <Tablet className="w-4 h-4 mr-1" />
            Tablet
          </Button>
          <Button
            variant={device === 'mobile' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onDeviceChange('mobile')}
          >
            <Smartphone className="w-4 h-4 mr-1" />
            Mobile
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenFullPreview}
          disabled={!canOpenPreview}
        >
          <ExternalLink className="w-4 h-4 mr-1" />
          Open Full Preview
        </Button>
      </div>

      {/* Preview Frame */}
      <div 
        className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 flex justify-center overflow-hidden"
        style={{ minHeight: config.height }}
      >
        <div
          className="bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden transition-all duration-300"
          style={{ 
            width: config.width, 
            maxWidth: '100%',
            transform: `scale(${config.scale})`,
            transformOrigin: 'top center',
          }}
        >
          <iframe
            src={previewUrl}
            className="w-full border-0"
            style={{ height: '900px' }}
            title="Widget Preview"
          />
        </div>
      </div>
    </div>
  );
};

export default DevicePreview;
