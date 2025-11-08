import { useState } from 'react';
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

  const deviceSizes = {
    desktop: { width: '100%', height: '800px', maxWidth: 'none' },
    tablet: { width: '768px', height: '1024px', maxWidth: '100%' },
    mobile: { width: '375px', height: '667px', maxWidth: '100%' },
  };

  const handleRefresh = () => {
    setKey(prev => prev + 1);
  };

  return (
    <Card className="border-gray-200 dark:border-[#2a2a2a]">
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Test Your Widget</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="h-8"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        {/* Device Selector */}
        <Tabs value={device} onValueChange={(v) => setDevice(v as any)} className="w-full">
          <TabsList className="w-full grid grid-cols-3 h-9">
            <TabsTrigger value="desktop" className="text-xs">
              <Monitor className="w-4 h-4 mr-1" />
              Desktop
            </TabsTrigger>
            <TabsTrigger value="tablet" className="text-xs">
              <Tablet className="w-4 h-4 mr-1" />
              Tablet
            </TabsTrigger>
            <TabsTrigger value="mobile" className="text-xs">
              <Smartphone className="w-4 h-4 mr-1" />
              Mobile
            </TabsTrigger>
          </TabsList>

          <TabsContent value={device} className="mt-4">
            <div className="bg-gray-100 dark:bg-[#1e1e1e] rounded-lg p-4 flex items-center justify-center min-h-[400px]">
              <div
                style={{
                  width: deviceSizes[device].width,
                  height: deviceSizes[device].height,
                  maxWidth: deviceSizes[device].maxWidth,
                }}
                className="bg-white rounded-lg shadow-2xl overflow-hidden"
              >
                {widgetConfig && widgetConfig.games && widgetConfig.games.length > 0 ? (
                  <div key={key} className="w-full h-full overflow-auto">
                    <CalendarWidget 
                      config={widgetConfig}
                      primaryColor={widgetConfig.primaryColor || '#2563eb'}
                    />
                  </div>
                ) : (
                  <iframe
                    key={key}
                    src={embedUrl}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    allow="payment; camera"
                    allowFullScreen
                    style={{ border: 'none' }}
                    title={widgetName}
                  />
                )}
              </div>
            </div>
            <div className="mt-3 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {device === 'desktop' && 'Full width responsive view'}
                {device === 'tablet' && 'iPad view (768x1024)'}
                {device === 'mobile' && 'iPhone view (375x667)'}
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Test Notes */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p className="text-xs text-blue-900 dark:text-blue-200 font-medium mb-1">Testing Tips:</p>
          <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
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
