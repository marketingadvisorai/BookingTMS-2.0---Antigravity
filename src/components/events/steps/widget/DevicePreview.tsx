/**
 * Device Preview Component
 * Responsive preview frame for different devices
 * 
 * Uses static preview to avoid loading heavy embed widget.
 * 
 * @module widget/DevicePreview
 */

import React, { lazy, Suspense, useState } from 'react';
import { Button } from '../../../ui/button';
import { Monitor, Tablet, Smartphone, ExternalLink, Eye, EyeOff, Calendar, Clock, Users, Shield } from 'lucide-react';
import { PreviewDevice, DEVICE_CONFIGS } from './types';

interface DevicePreviewProps {
  previewUrl: string;
  device: PreviewDevice;
  onDeviceChange: (device: PreviewDevice) => void;
  onOpenFullPreview: () => void;
  canOpenPreview: boolean;
  activityName?: string;
  activityPrice?: number;
  primaryColor?: string;
}

/**
 * Static Widget Preview Component
 * Renders a lightweight static preview instead of iframe to prevent freezing
 */
const StaticWidgetPreview: React.FC<{ 
  name: string; 
  price: number; 
  color: string;
  device: PreviewDevice;
}> = ({ name, price, color, device }) => {
  const isMobile = device === 'mobile';
  const isTablet = device === 'tablet';
  
  return (
    <div className="bg-white h-full overflow-auto">
      {/* Hero */}
      <div className="relative h-32 bg-gradient-to-r from-gray-700 to-gray-900">
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white font-bold text-sm truncate">{name || 'Your Activity'}</h3>
          <div className="flex gap-2 mt-1">
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded text-white">60 min</span>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded text-white">2-8 players</span>
          </div>
        </div>
      </div>
      
      {/* Calendar Preview */}
      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-4 h-4" style={{ color }} />
          <span className="text-sm font-medium">Select Date</span>
        </div>
        <div className={`grid gap-1 ${isMobile ? 'grid-cols-7' : 'grid-cols-7'}`}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} className="text-center text-xs text-gray-500 py-1">{d}</div>
          ))}
          {Array.from({ length: 28 }, (_, i) => (
            <div
              key={i}
              className={`aspect-square flex items-center justify-center text-xs rounded ${
                i === 14 ? 'text-white' : i >= 7 && i < 26 && [1,2,3,4,5].includes(i % 7) ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-300'
              }`}
              style={i === 14 ? { backgroundColor: color } : undefined}
            >
              {i + 1}
            </div>
          ))}
        </div>
        
        {/* Time Slots */}
        <div className="mt-3">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4" style={{ color }} />
            <span className="text-sm font-medium">Available Times</span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {['10:00 AM', '11:00 AM', '12:00 PM'].map((t, i) => (
              <div
                key={t}
                className={`text-center py-1.5 text-xs rounded border ${
                  i === 1 ? 'text-white border-transparent' : 'border-gray-200 text-gray-600'
                }`}
                style={i === 1 ? { backgroundColor: color } : undefined}
              >
                {t}
              </div>
            ))}
          </div>
        </div>
        
        {/* Summary */}
        <div className="mt-3 p-2 bg-gray-50 rounded-lg">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-600">2 adults × ${price}</span>
            <span className="font-medium">${price * 2}</span>
          </div>
          <button
            className="w-full py-2 rounded text-white text-xs font-medium mt-2"
            style={{ backgroundColor: color }}
          >
            Continue to Checkout
          </button>
          <div className="flex items-center justify-center gap-1 mt-2 text-gray-400">
            <Shield className="w-3 h-3" />
            <span className="text-[10px]">Secure checkout</span>
          </div>
        </div>
      </div>
      
      {/* Preview Notice */}
      <div className="mx-3 mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-center">
        <p className="text-[10px] text-blue-700">
          <strong>Preview</strong> - Click "Open Full Preview" to see live widget
        </p>
      </div>
    </div>
  );
};

export const DevicePreview: React.FC<DevicePreviewProps> = ({
  previewUrl,
  device,
  onDeviceChange,
  onOpenFullPreview,
  canOpenPreview,
  activityName = 'Your Activity',
  activityPrice = 30,
  primaryColor = '#2563eb',
}) => {
  const config = DEVICE_CONFIGS[device];

  return (
    <div className="space-y-4">
      {/* Device Selector */}
      <div className="flex items-center justify-between flex-wrap gap-2">
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

      {/* Static Preview Frame - No iframe to prevent freezing */}
      <div 
        className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 flex justify-center overflow-hidden"
        style={{ minHeight: 400 }}
      >
        <div
          className="bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden transition-all duration-300 border"
          style={{ 
            width: config.width, 
            maxWidth: '100%',
            height: 500,
          }}
        >
          <StaticWidgetPreview
            name={activityName}
            price={activityPrice}
            color={primaryColor}
            device={device}
          />
        </div>
      </div>
    </div>
  );
};

export default DevicePreview;
