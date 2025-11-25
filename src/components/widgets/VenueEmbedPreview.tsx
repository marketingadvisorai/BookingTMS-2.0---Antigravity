/**
 * VenueEmbedPreview - Modern Venue Embed Preview Component
 * 
 * Shows live preview with real activities and schedules from database
 * Provides multiple embed code formats (iframe, script, React, WordPress)
 */

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { 
  Copy, Check, ExternalLink, Code, BookOpen, 
  Calendar, Clock, Users, DollarSign, RefreshCcw,
  Smartphone, Monitor, Tablet, Globe, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../layout/ThemeContext';
import { useWidgetData } from '../../hooks/useWidgetData';
import { 
  generateEmbedCode, 
  generateScriptEmbed, 
  generateReactEmbed, 
  generateWordPressEmbed,
  getVenueEmbedUrl,
  getVenueFullPageUrl
} from '../../utils/venue/venueEmbedUtils';
import type { Venue } from '../../types/venue';

interface VenueEmbedPreviewProps {
  venue: Venue;
  onClose?: () => void;
}

type EmbedFormat = 'iframe' | 'script' | 'react' | 'wordpress';
type PreviewDevice = 'desktop' | 'tablet' | 'mobile';

export function VenueEmbedPreview({ venue, onClose }: VenueEmbedPreviewProps) {
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [embedFormat, setEmbedFormat] = useState<EmbedFormat>('iframe');
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop');
  const [widgetTheme, setWidgetTheme] = useState<'light' | 'dark'>(theme as 'light' | 'dark');

  // Fetch real activities for this venue
  const { activities, loading, error, refresh, lastUpdate } = useWidgetData({
    venueId: venue.id,
    enableRealtime: true,
  });

  // Generate embed URL
  const embedUrl = useMemo(() => {
    return getVenueEmbedUrl(venue, widgetTheme);
  }, [venue, widgetTheme]);

  // Generate embed code based on selected format
  const embedCode = useMemo(() => {
    switch (embedFormat) {
      case 'iframe':
        return generateEmbedCode(venue, widgetTheme);
      case 'script':
        return generateScriptEmbed(venue, widgetTheme);
      case 'react':
        return generateReactEmbed(venue, widgetTheme);
      case 'wordpress':
        return generateWordPressEmbed(venue, widgetTheme);
      default:
        return generateEmbedCode(venue, widgetTheme);
    }
  }, [venue, embedFormat, widgetTheme]);

  // Device preview dimensions
  const deviceDimensions = {
    desktop: { width: '100%', height: '700px' },
    tablet: { width: '768px', height: '600px' },
    mobile: { width: '375px', height: '667px' },
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    toast.success('Embed code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(embedUrl);
    setCopiedUrl(true);
    toast.success('URL copied to clipboard!');
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleOpenInNewTab = () => {
    window.open(getVenueFullPageUrl(venue, widgetTheme), '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header with venue info and stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {venue.name}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Embed Key: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs">{venue.embedKey}</code>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refresh()}
            disabled={loading.activities}
            className="h-9"
          >
            <RefreshCcw className={`w-4 h-4 mr-2 ${loading.activities ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenInNewTab}
            className="h-9"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open Full Page
          </Button>
        </div>
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-gray-200 dark:border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Activities</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {loading.activities ? '...' : activities.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 dark:border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Avg Duration</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {activities.length > 0 
                    ? `${Math.round(activities.reduce((sum, a) => sum + (a.duration || 60), 0) / activities.length)}m`
                    : '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 dark:border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Max Players</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {activities.length > 0 
                    ? Math.max(...activities.map(a => a.max_players || 8))
                    : '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 dark:border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Price Range</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {activities.length > 0 
                    ? `$${Math.min(...activities.map(a => a.price || 0))} - $${Math.max(...activities.map(a => a.price || 0))}`
                    : '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activities List */}
      {activities.length > 0 && (
        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Available Activities ({activities.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
                >
                  {activity.image_url && (
                    <img
                      src={activity.image_url}
                      alt={activity.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                      {activity.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>{activity.duration || 60}min</span>
                      <span>•</span>
                      <span>${activity.price || 0}</span>
                      <span>•</span>
                      <span>{activity.min_players || 2}-{activity.max_players || 8} players</span>
                    </div>
                  </div>
                  <Badge variant={activity.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Embed Configuration */}
      <Card className="border-gray-200 dark:border-gray-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Code className="w-4 h-4" />
            Embed Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Theme Toggle */}
          <div className="flex items-center gap-4">
            <Label className="text-sm">Widget Theme:</Label>
            <div className="flex gap-2">
              <Button
                variant={widgetTheme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setWidgetTheme('light')}
                className="h-8"
              >
                Light
              </Button>
              <Button
                variant={widgetTheme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setWidgetTheme('dark')}
                className="h-8"
              >
                Dark
              </Button>
            </div>
          </div>

          {/* Embed URL */}
          <div className="space-y-2">
            <Label className="text-sm">Embed URL</Label>
            <div className="flex gap-2">
              <Input
                value={embedUrl}
                readOnly
                className="font-mono text-xs bg-gray-50 dark:bg-gray-800"
              />
              <Button variant="outline" size="sm" onClick={handleCopyUrl} className="h-9 px-3">
                {copiedUrl ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
              <Button variant="outline" size="sm" onClick={handleOpenInNewTab} className="h-9 px-3">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Embed Format Tabs */}
          <Tabs value={embedFormat} onValueChange={(v) => setEmbedFormat(v as EmbedFormat)}>
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="iframe">HTML</TabsTrigger>
              <TabsTrigger value="script">Script</TabsTrigger>
              <TabsTrigger value="react">React</TabsTrigger>
              <TabsTrigger value="wordpress">WordPress</TabsTrigger>
            </TabsList>

            <TabsContent value={embedFormat} className="mt-4">
              <div className="relative">
                <ScrollArea className="h-[200px] w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <pre className="p-4 text-xs font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                    {embedCode}
                  </pre>
                </ScrollArea>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyCode}
                  className="absolute top-2 right-2 h-8"
                >
                  {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Live Preview */}
      <Card className="border-gray-200 dark:border-gray-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Live Preview
            </CardTitle>
            <div className="flex gap-1">
              <Button
                variant={previewDevice === 'desktop' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPreviewDevice('desktop')}
                className="h-8 w-8 p-0"
              >
                <Monitor className="w-4 h-4" />
              </Button>
              <Button
                variant={previewDevice === 'tablet' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPreviewDevice('tablet')}
                className="h-8 w-8 p-0"
              >
                <Tablet className="w-4 h-4" />
              </Button>
              <Button
                variant={previewDevice === 'mobile' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPreviewDevice('mobile')}
                className="h-8 w-8 p-0"
              >
                <Smartphone className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div 
            className="mx-auto overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 transition-all duration-300"
            style={{ 
              width: deviceDimensions[previewDevice].width,
              maxWidth: '100%',
            }}
          >
            <iframe
              src={embedUrl}
              style={{ 
                width: '100%', 
                height: deviceDimensions[previewDevice].height,
                border: 'none',
              }}
              title={`${venue.name} Widget Preview`}
              loading="lazy"
              allow="payment; camera"
            />
          </div>
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-3">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </CardContent>
      </Card>

      {/* Integration Tips */}
      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
        <CardContent className="p-4">
          <h3 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Integration Tips
          </h3>
          <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1.5">
            <li>• <strong>Script Method (Recommended):</strong> Auto-resizes based on content height</li>
            <li>• <strong>Real-time Updates:</strong> Widget automatically syncs when activities change</li>
            <li>• <strong>Mobile Responsive:</strong> Widget adapts to all screen sizes</li>
            <li>• <strong>Secure:</strong> Uses sandboxed iframe with minimal permissions</li>
            <li>• <strong>Payment Ready:</strong> Stripe integration works seamlessly in embed</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

export default VenueEmbedPreview;
