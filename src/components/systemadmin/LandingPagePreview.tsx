import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../layout/ThemeContext';
import { Monitor, Smartphone, Tablet, RefreshCw, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { toast } from 'sonner@2.0.3';

interface LandingPagePreviewProps {
  venueSlug: string;
  formData: any;
}

type DeviceType = 'desktop' | 'tablet' | 'mobile';

export const LandingPagePreview = ({ venueSlug, formData }: LandingPagePreviewProps) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [isLoading, setIsLoading] = useState(true);

  const previewUrl = `${window.location.origin}/v/${venueSlug}`;

  // Theme classes
  const bgClass = isDark ? 'bg-[#1a1a1a]' : 'bg-gray-100';
  const cardBg = isDark ? 'bg-[#161616]' : 'bg-white';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const mutedTextClass = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-[#333]' : 'border-gray-200';

  const deviceDimensions = {
    desktop: { width: '100%', height: '600px' },
    tablet: { width: '768px', height: '600px' },
    mobile: { width: '375px', height: '600px' },
  };

  const handleRefresh = () => {
    setIsLoading(true);
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  const handleOpenInNewTab = () => {
    window.open(previewUrl, '_blank');
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(previewUrl);
    toast.success('URL copied to clipboard');
  };

  return (
    <div className="space-y-4">
      {/* Preview Controls */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Device Selector */}
        <div className={`flex items-center gap-2 p-1 rounded-lg ${isDark ? 'bg-[#1a1a1a]' : 'bg-gray-100'}`}>
          <button
            onClick={() => setDevice('desktop')}
            className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
              device === 'desktop'
                ? isDark
                  ? 'bg-indigo-600 text-white'
                  : 'bg-indigo-600 text-white'
                : isDark
                ? 'text-gray-400 hover:bg-[#222]'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span className="text-sm">Desktop</span>
          </button>
          <button
            onClick={() => setDevice('tablet')}
            className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
              device === 'tablet'
                ? isDark
                  ? 'bg-indigo-600 text-white'
                  : 'bg-indigo-600 text-white'
                : isDark
                ? 'text-gray-400 hover:bg-[#222]'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Tablet className="w-4 h-4" />
            <span className="text-sm">Tablet</span>
          </button>
          <button
            onClick={() => setDevice('mobile')}
            className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
              device === 'mobile'
                ? isDark
                  ? 'bg-indigo-600 text-white'
                  : 'bg-indigo-600 text-white'
                : isDark
                ? 'text-gray-400 hover:bg-[#222]'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span className="text-sm">Mobile</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className={`${isDark ? 'border-[#333] text-white hover:bg-[#1a1a1a]' : 'border-gray-300'}`}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenInNewTab}
            className={`${isDark ? 'border-[#333] text-white hover:bg-[#1a1a1a]' : 'border-gray-300'}`}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open
          </Button>
        </div>
      </div>

      {/* URL Display */}
      <div
        onClick={handleCopyUrl}
        className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? 'bg-[#1a1a1a] border border-[#333]' : 'bg-gray-100 border border-gray-300'} cursor-pointer hover:opacity-80 transition-opacity`}
      >
        <div className="flex-1">
          <p className={`text-sm ${mutedTextClass}`}>Preview URL</p>
          <p className={`${textClass} break-all`}>{previewUrl}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className={`${isDark ? 'text-gray-400 hover:bg-[#222]' : 'text-gray-600 hover:bg-gray-200'}`}
        >
          Copy
        </Button>
      </div>

      {/* Preview Container */}
      <div className={`${bgClass} rounded-lg p-4 border ${borderColor}`}>
        <div className="flex items-center justify-center">
          <div
            className="transition-all duration-300 ease-in-out mx-auto"
            style={{
              width: deviceDimensions[device].width,
              maxWidth: '100%',
            }}
          >
            <div
              className={`${cardBg} rounded-lg border ${borderColor} shadow-lg overflow-hidden relative`}
              style={{ height: deviceDimensions[device].height }}
            >
              {/* Loading Overlay */}
              {isLoading && (
                <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center z-10">
                  <div className="text-white text-center">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                    <p>Loading preview...</p>
                  </div>
                </div>
              )}

              {/* Preview iFrame */}
              <iframe
                ref={iframeRef}
                src={previewUrl}
                className="w-full h-full"
                title="Landing Page Preview"
                onLoad={() => setIsLoading(false)}
                style={{
                  border: 'none',
                  background: isDark ? '#0a0a0a' : '#ffffff',
                }}
              />
            </div>

            {/* Device Label */}
            <p className={`text-center mt-2 text-sm ${mutedTextClass}`}>
              {device === 'desktop' && 'Desktop View (1920px+)'}
              {device === 'tablet' && 'Tablet View (768px)'}
              {device === 'mobile' && 'Mobile View (375px)'}
            </p>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className={`p-4 rounded-lg ${isDark ? 'bg-[#1a1a1a] border border-[#333]' : 'bg-blue-50 border border-blue-200'}`}>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-blue-900'}`}>
          💡 <strong>Preview Mode:</strong> This shows your live landing page. Changes made in the editor will be reflected after saving.
        </p>
      </div>
    </div>
  );
};
