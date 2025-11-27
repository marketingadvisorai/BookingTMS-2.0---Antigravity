/**
 * Device Preview Component
 * Responsive preview frame for different devices
 * 
 * Uses on-demand iframe loading to prevent page freeze.
 * User clicks "Load Live Preview" to load the actual widget.
 * 
 * @module widget/DevicePreview
 */

import React, { useState } from 'react';
import { Button } from '../../../ui/button';
import { Monitor, Tablet, Smartphone, ExternalLink, Play, Loader2 } from 'lucide-react';
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
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadPreview = () => {
    setIsLoading(true);
    setShowLivePreview(true);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

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
          {showLivePreview ? (
            <>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Loading widget...</p>
                  </div>
                </div>
              )}
              <iframe
                src={previewUrl}
                className="w-full border-0"
                style={{ height: '900px' }}
                title="Widget Preview"
                onLoad={handleIframeLoad}
              />
            </>
          ) : (
            <div className="h-[500px] flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-6">
              <div className="text-center max-w-sm">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Live Widget Preview
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Click below to load the actual booking widget and see how it will appear on your website.
                </p>
                <Button onClick={handleLoadPreview} className="gap-2">
                  <Play className="w-4 h-4" />
                  Load Live Preview
                </Button>
                <p className="text-xs text-gray-500 mt-3">
                  Or use "Open Full Preview" to view in a new tab
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DevicePreview;
