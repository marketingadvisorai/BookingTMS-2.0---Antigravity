/**
 * Step 7: Widget & Embed Configuration
 * 
 * Modern embedding system with:
 * - Single Calendar Widget (optimized for conversion)
 * - Dynamic embed code generation
 * - Multi-platform support (HTML, React, WordPress)
 * - Real-time preview
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { 
  Copy, 
  Check, 
  ExternalLink, 
  Code, 
  Calendar, 
  Eye, 
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Palette,
  Zap,
  Shield,
  RefreshCw
} from 'lucide-react';
import { StepProps } from '../types';
import { ActivityPreviewCard, ActivityPreviewData } from '../../widgets/ActivityPreviewCard';
import { Badge } from '../../ui/badge';
import { generateEmbedCode, generateReactCode, generateEmbedUrl } from '../../../lib/embed/EmbedManager';
import { toast } from 'sonner';

type PreviewDevice = 'desktop' | 'tablet' | 'mobile';
type CodeFormat = 'html' | 'react' | 'wordpress';

const DEVICE_CONFIGS: Record<PreviewDevice, { width: string; scale: number; label: string }> = {
  desktop: { width: '100%', scale: 0.85, label: 'Desktop' },
  tablet: { width: '768px', scale: 0.75, label: 'Tablet' },
  mobile: { width: '375px', scale: 0.65, label: 'Mobile' },
};

interface Step7WidgetEmbedNewProps extends StepProps {
  activityId?: string;
  venueId?: string;
  embedKey?: string;
}

export default function Step7WidgetEmbedNew({ 
  activityData, 
  updateActivityData, 
  t,
  activityId,
  venueId,
  embedKey 
}: Step7WidgetEmbedNewProps) {
  // State
  const [copied, setCopied] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop');
  const [codeFormat, setCodeFormat] = useState<CodeFormat>('html');
  const [primaryColor, setPrimaryColor] = useState('#2563eb');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Derived values
  const baseUrl = useMemo(() => window.location.origin, []);
  
  const embedConfig = useMemo(() => ({
    activityId: activityId || 'preview',
    venueId: venueId || 'preview',
    embedKey: embedKey || 'YOUR_EMBED_KEY',
    primaryColor,
    theme,
    minHeight: 600,
    maxHeight: 900,
  }), [activityId, venueId, embedKey, primaryColor, theme]);

  // Generate code based on format
  const generatedCode = useMemo(() => {
    switch (codeFormat) {
      case 'html':
        return generateEmbedCode(embedConfig, baseUrl);
      case 'react':
        return generateReactCode(embedConfig, baseUrl);
      case 'wordpress':
        return `<!-- WordPress Shortcode -->
[booking_widget 
  activity="${embedConfig.activityId}" 
  venue="${embedConfig.venueId}"
  color="${primaryColor.replace('#', '')}"
  theme="${theme}"
  height="700"
]

<!-- Or use HTML block with the HTML embed code above -->`;
      default:
        return generateEmbedCode(embedConfig, baseUrl);
    }
  }, [codeFormat, embedConfig, baseUrl, primaryColor, theme]);

  const previewUrl = useMemo(() => {
    return generateEmbedUrl(embedConfig, baseUrl);
  }, [embedConfig, baseUrl]);

  // Handlers
  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      toast.success('Code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy code');
    }
  }, [generatedCode]);

  const openFullPreview = useCallback(() => {
    window.open(previewUrl, '_blank', 'noopener,noreferrer');
  }, [previewUrl]);

  const deviceConfig = DEVICE_CONFIGS[previewDevice];

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-blue-100 shadow-md">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl border-b border-blue-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg shadow-sm">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl text-blue-900">
                Booking Widget & Embed
              </CardTitle>
              <CardDescription className="text-blue-700">
                Configure and embed your booking calendar on any website
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 space-y-8">
          {/* Widget Info */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200 flex items-start gap-4">
            <div className="p-3 bg-green-100 rounded-full">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900">
                  Calendar Booking Widget
                </h3>
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  Optimized
                </Badge>
              </div>
              <p className="text-sm text-gray-600">
                A high-conversion booking page for <strong>{activityData.name || 'your activity'}</strong>.
                Features real-time availability, mobile responsiveness, and secure Stripe checkout.
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white border rounded-lg flex items-start gap-3">
              <Zap className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900 text-sm">Fast Loading</h4>
                <p className="text-xs text-gray-500">Lazy-loaded for optimal performance</p>
              </div>
            </div>
            <div className="p-4 bg-white border rounded-lg flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900 text-sm">Secure Payments</h4>
                <p className="text-xs text-gray-500">PCI-compliant Stripe integration</p>
              </div>
            </div>
            <div className="p-4 bg-white border rounded-lg flex items-start gap-3">
              <RefreshCw className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900 text-sm">Real-time Sync</h4>
                <p className="text-xs text-gray-500">Prevents double bookings</p>
              </div>
            </div>
          </div>

          {/* Main Tabs */}
          <Tabs defaultValue="preview" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 p-1 bg-gray-100 rounded-lg h-12">
              <TabsTrigger 
                value="preview" 
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md py-2.5"
              >
                <Eye className="w-4 h-4 mr-2" />
                Live Preview
              </TabsTrigger>
              <TabsTrigger 
                value="code" 
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md py-2.5"
              >
                <Code className="w-4 h-4 mr-2" />
                Embed Code
              </TabsTrigger>
            </TabsList>

            {/* Preview Tab */}
            <TabsContent value="preview" className="space-y-4">
              {/* Preview Controls */}
              <div className="flex flex-wrap gap-4 items-end justify-between">
                {/* Color Picker */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Brand Color
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-10 h-10 p-1 cursor-pointer rounded-lg"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-24 font-mono text-sm uppercase"
                    />
                  </div>
                </div>

                {/* Device Selector */}
                <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                  {(Object.entries(DEVICE_CONFIGS) as [PreviewDevice, typeof DEVICE_CONFIGS['desktop']][]).map(
                    ([device, config]) => (
                      <Button
                        key={device}
                        variant={previewDevice === device ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setPreviewDevice(device)}
                        className="h-8"
                      >
                        {device === 'desktop' && <Monitor className="w-4 h-4" />}
                        {device === 'tablet' && <Tablet className="w-4 h-4" />}
                        {device === 'mobile' && <Smartphone className="w-4 h-4" />}
                      </Button>
                    )
                  )}
                </div>

                {/* Full Preview Button */}
                <Button
                  variant="outline"
                  onClick={openFullPreview}
                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Full Page
                </Button>
              </div>

              {/* Preview Window */}
              <div 
                className="border rounded-xl overflow-hidden shadow-lg bg-gray-100 relative mx-auto transition-all duration-300"
                style={{ maxWidth: deviceConfig.width }}
              >
                {/* Browser Chrome */}
                <div className="bg-gray-200 border-b flex items-center px-4 py-2 gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 text-center text-xs text-gray-500 font-mono bg-white rounded px-3 py-1 truncate mx-2">
                    {previewUrl.substring(0, 60)}...
                  </div>
                </div>
                
                {/* Preview Content - Using ActivityPreviewCard (safe, no real bookings) */}
                <div 
                  className="bg-white overflow-y-auto"
                  style={{ height: '650px' }}
                >
                  <div 
                    style={{ 
                      transform: `scale(${deviceConfig.scale})`,
                      transformOrigin: 'top center',
                      width: `${100 / deviceConfig.scale}%`,
                    }}
                  >
                    <ActivityPreviewCard
                      activity={{
                        id: activityId || 'preview',
                        name: activityData.name || 'Your Activity',
                        description: activityData.description,
                        duration: activityData.duration || 60,
                        difficulty: String(activityData.difficulty || 'Medium'),
                        min_players: activityData.minPlayers || 1,
                        max_players: activityData.maxPlayers || 8,
                        price: activityData.adultPrice || 30,
                        child_price: activityData.childPrice,
                        image_url: activityData.coverImage,
                        gallery_images: activityData.galleryImages,
                        video_url: activityData.videoUrl,
                        age_guideline: activityData.ageGuideline,
                        faqs: activityData.faqs,
                        highlights: activityData.highlights,
                        schedule: {
                          operatingDays: activityData.operatingDays,
                          startTime: activityData.startTime || '10:00',
                          endTime: activityData.endTime || '22:00',
                          slotInterval: activityData.slotInterval || 60,
                        },
                      }}
                      venueName={activityData.venueName}
                      primaryColor={primaryColor}
                      theme={theme}
                      showBookingFlow={true}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Code Tab */}
            <TabsContent value="code" className="space-y-6">
              {/* Platform Info */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3">
                <Globe className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Universal Compatibility</h4>
                  <p className="text-sm text-blue-700">
                    Works with any website platform: WordPress, Wix, Squarespace, Shopify, React, Next.js, and custom HTML sites.
                  </p>
                </div>
              </div>

              {/* Code Format Selector */}
              <div className="flex gap-2">
                {(['html', 'react', 'wordpress'] as CodeFormat[]).map((format) => (
                  <Button
                    key={format}
                    variant={codeFormat === format ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCodeFormat(format)}
                    className="capitalize"
                  >
                    {format === 'html' && 'HTML'}
                    {format === 'react' && 'React/Next.js'}
                    {format === 'wordpress' && 'WordPress'}
                  </Button>
                ))}
              </div>

              {/* Code Block */}
              <div className="relative group">
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute top-3 right-3 z-10 h-8 text-xs bg-gray-800 hover:bg-gray-700 text-white"
                  onClick={copyToClipboard}
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 mr-1" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 mr-1" /> Copy
                    </>
                  )}
                </Button>
                <pre className="font-mono text-xs bg-gray-900 text-gray-300 p-4 pt-12 rounded-lg overflow-x-auto max-h-80">
                  <code>{generatedCode}</code>
                </pre>
              </div>

              {/* Integration Tips */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg bg-gray-50">
                  <h5 className="font-medium text-gray-900 mb-2">📱 Responsive</h5>
                  <p className="text-xs text-gray-500">
                    The widget automatically adapts to all screen sizes. No additional CSS required.
                  </p>
                </div>
                <div className="p-4 border rounded-lg bg-gray-50">
                  <h5 className="font-medium text-gray-900 mb-2">⚡ Performance</h5>
                  <p className="text-xs text-gray-500">
                    Lazy-loaded to not impact your page speed. Only loads when visible.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
