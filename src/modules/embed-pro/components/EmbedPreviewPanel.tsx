/**
 * Embed Pro 1.1 - Embed Preview Panel Component
 * @module embed-pro/components/EmbedPreviewPanel
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ExternalLink, 
  RefreshCw, 
  Smartphone, 
  Monitor, 
  Tablet,
  Eye,
  Loader2
} from 'lucide-react';
import { cn } from '@/components/ui/utils';
import { Button } from '@/components/ui/button';
import { useEmbedPreview } from '../hooks';

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
  
  const {
    previewData,
    loading,
    error,
    previewUrl,
    styleVariables,
    refresh,
    isLivePreview,
    setIsLivePreview,
  } = useEmbedPreview({ configId });

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
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
            Refresh
          </Button>
          {previewUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(previewUrl, '_blank')}
              className="gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Open
            </Button>
          )}
        </div>
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
