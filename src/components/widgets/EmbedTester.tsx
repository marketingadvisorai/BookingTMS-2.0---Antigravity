import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Monitor, Smartphone, Tablet, RefreshCw } from 'lucide-react';
import { CalendarWidget } from './CalendarWidget';

interface EmbedTesterProps {
  embedUrl: string;
  widgetName: string;
  widgetConfig?: any;
}

export function EmbedTester({ embedUrl, widgetName, widgetConfig }: EmbedTesterProps) {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [key, setKey] = useState(0); // For iframe refresh

  const deviceConfigs: Record<'desktop' | 'tablet' | 'mobile', { maxWidth: string; height: string; label: string }> = {
    desktop: { maxWidth: '1200px', height: 'min(75vh, 820px)', label: 'Full width responsive view' },
    tablet: { maxWidth: '820px', height: 'min(75vh, 900px)', label: 'iPad view (768×1024)' },
    mobile: { maxWidth: '420px', height: 'min(80vh, 720px)', label: 'Phone view (375×667)' },
  };

  const handleRefresh = () => {
    setKey(prev => prev + 1);
  };

  // Default to mobile on small screens
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      setDevice('mobile');
    }
  }, []);

  return (
    <Card className="border-gray-200 dark:border-[#2a2a2a]">
      <CardHeader className="p-2 sm:p-3 md:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle className="text-sm sm:text-base">Test Your Widget</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="h-8 sm:h-9 text-xs sm:text-sm"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-2 sm:p-3 md:p-4 pt-0 space-y-3 sm:space-y-4">
        {/* Device Selector */}
        <Tabs value={device} onValueChange={(v) => setDevice(v as any)} className="w-full">
          <TabsList className="w-full grid grid-cols-3 h-9 sm:h-10">
            <TabsTrigger value="desktop" className="text-xs sm:text-sm">
              <Monitor className="w-4 h-4 mr-1" />
              Desktop
            </TabsTrigger>
            <TabsTrigger value="tablet" className="text-xs sm:text-sm">
              <Tablet className="w-4 h-4 mr-1" />
              Tablet
            </TabsTrigger>
            <TabsTrigger value="mobile" className="text-xs sm:text-sm">
              <Smartphone className="w-4 h-4 mr-1" />
              Mobile
            </TabsTrigger>
          </TabsList>

          {(['desktop', 'tablet', 'mobile'] as const).map((view) => {
            const config = deviceConfigs[view];
            return (
              <TabsContent key={view} value={view} className="mt-4">
                <div className="bg-gray-100 dark:bg-[#1e1e1e] rounded-lg p-3 sm:p-4 flex items-center justify-center min-h-[320px]">
                  <div
                    style={{
                      width: '100%',
                      maxWidth: config.maxWidth,
                      height: config.height,
                    }}
                    className="bg-white dark:bg-[#0a0a0a] rounded-lg shadow-2xl border border-gray-200 dark:border-[#2a2a2a] overflow-hidden"
                  >
                    {widgetConfig && widgetConfig.activities && widgetConfig.activities.length > 0 ? (
                      <div key={`${view}-${key}`} className="w-full h-full overflow-auto">
                        <CalendarWidget
                          config={widgetConfig}
                          primaryColor={widgetConfig.primaryColor || '#2563eb'}
                        />
                      </div>
                    ) : (
                      <iframe
                        key={`${view}-${key}`}
                        src={embedUrl}
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        allow="payment; camera"
                        allowFullScreen
                        style={{ border: 'none' }}
                        title={`${widgetName} - ${view}`}
                      />
                    )}
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {config.label}
                  </p>
                </div>
              </TabsContent>
            );
          })}
        </Tabs>

        {/* Test Notes */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-blue-900 dark:text-blue-200 font-medium mb-1">Testing Tips:</p>
          <ul className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
            <li>Test all device sizes before deploying</li>
            <li>Verify that buttons and interactions work correctly</li>
            <li>Check that the widget loads quickly on all devices</li>
            <li>Ensure colors match your brand</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
