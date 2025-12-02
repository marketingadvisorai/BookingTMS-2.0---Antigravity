/**
 * Embed Pro 1.1 - Embed Preview Panel Component
 * @module embed-pro/components/EmbedPreviewPanel
 * 
 * Shows live preview of the booking widget with device emulation.
 * Includes cache-busting to ensure proper reload on config change.
 */

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw, 
  Smartphone, 
  Monitor, 
  Tablet,
  Eye,
  Loader2,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { cn } from '../../../components/ui/utils';
import { Button } from '../../../components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../components/ui/tooltip';
import { useEmbedPreview } from '../hooks';
import { previewService } from '../services';

interface EmbedPreviewPanelProps {
  configId: string | null;
  className?: string;
}

type DeviceMode = 'desktop' | 'tablet' | 'mobile';

const deviceSizes: Record<DeviceMode, { width: string; label: string }> = {
  desktop: { width: '100%', label: 'Desktop' },
  tablet: { width: '768px', label: 'Tablet' },
  mobile: { width: '375px', label: 'Mobile' },
};

export const EmbedPreviewPanel: React.FC<EmbedPreviewPanelProps> = ({
  configId,
  className,
}) => {
  const [deviceMode, setDeviceMode] = React.useState<DeviceMode>('desktop');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const {
    previewData,
    loading,
    error,
    previewUrl,
    styleVariables,
    refresh,
    isLivePreview,
    setIsLivePreview,
    cacheKey,
  } = useEmbedPreview({ configId });
  
  // Force iframe reload when cacheKey changes
  useEffect(() => {
    if (iframeRef.current && previewUrl) {
      iframeRef.current.src = previewUrl;
    }
  }, [cacheKey, previewUrl]);

  if (!configId) {
    return (
      <div className={cn('flex items-center justify-center p-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl', className)}>
        <div className="text-center">
          <Eye className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
            Preview Panel
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Select an embed configuration to see the preview
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
        {/* Device toggles */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setDeviceMode('mobile')}
            className={cn(
              'p-2 rounded-md transition-colors',
              deviceMode === 'mobile' 
                ? 'bg-white dark:bg-gray-600 shadow-sm' 
                : 'hover:bg-gray-200 dark:hover:bg-gray-600'
            )}
          >
            <Smartphone className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeviceMode('tablet')}
            className={cn(
              'p-2 rounded-md transition-colors',
              deviceMode === 'tablet' 
                ? 'bg-white dark:bg-gray-600 shadow-sm' 
                : 'hover:bg-gray-200 dark:hover:bg-gray-600'
            )}
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeviceMode('desktop')}
            className={cn(
              'p-2 rounded-md transition-colors',
              deviceMode === 'desktop' 
                ? 'bg-white dark:bg-gray-600 shadow-sm' 
                : 'hover:bg-gray-200 dark:hover:bg-gray-600'
            )}
          >
            <Monitor className="w-4 h-4" />
          </button>
        </div>

        {/* Actions */}
        <TooltipProvider>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refresh}
                  disabled={loading}
                  className="gap-1.5 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
                  <span className="hidden sm:inline font-medium">Refresh</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reload the preview</TooltipContent>
            </Tooltip>
            
            {previewUrl && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(previewUrl, '_blank')}
                      className="gap-1.5 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline font-medium">Preview</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Open preview in new tab</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      onClick={() => {
                        if (previewData?.embedConfig?.embed_key) {
                          const liveUrl = previewService.getLiveBookingUrl(
                            previewData.embedConfig.embed_key,
                            previewData.embedConfig
                          );
                          window.open(liveUrl, '_blank');
                        }
                      }}
                      className="gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span className="hidden sm:inline font-medium">Test Booking</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Test live booking flow</TooltipContent>
                </Tooltip>
              </>
            )}
          </div>
        </TooltipProvider>
      </div>

      {/* Preview Frame */}
      <div className="p-4 bg-gray-100 dark:bg-gray-900 min-h-[500px] flex items-center justify-center">
        <motion.div
          layout
          animate={{ width: deviceSizes[deviceMode].width }}
          transition={{ type: 'spring', damping: 20 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden"
          style={{
            maxWidth: '100%',
            height: deviceMode === 'mobile' ? '600px' : deviceMode === 'tablet' ? '550px' : '500px',
            ...styleVariables,
          }}
        >
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full p-6 text-center">
              <div>
                <p className="text-red-500 mb-2">Failed to load preview</p>
                <Button variant="outline" size="sm" onClick={refresh}>
                  Try Again
                </Button>
              </div>
            </div>
          ) : previewUrl ? (
            <iframe
              key={cacheKey}
              ref={iframeRef}
              src={previewUrl}
              className="w-full h-full border-0"
              title="Widget Preview"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              No preview available
            </div>
          )}
        </motion.div>
      </div>

      {/* Footer info */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {deviceSizes[deviceMode].label} Preview • {isLivePreview ? 'Live' : 'Static'} Mode
        </p>
      </div>
    </div>
  );
};

export default EmbedPreviewPanel;
