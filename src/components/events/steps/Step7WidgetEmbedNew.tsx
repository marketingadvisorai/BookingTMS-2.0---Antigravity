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
  RefreshCw,
  Download,
  FileCode,
  Play
} from 'lucide-react';
import { StepProps } from '../types';
import { ActivityPreviewCard, ActivityPreviewData } from '../../widgets/ActivityPreviewCard';
import { Badge } from '../../ui/badge';
import { generateEmbedCode, generateReactCode, generateEmbedUrl } from '../../../lib/embed/EmbedManager';
import { toast } from 'sonner';

type PreviewDevice = 'desktop' | 'tablet' | 'mobile';
type CodeFormat = 'html' | 'react' | 'wordpress';

const DEVICE_CONFIGS: Record<PreviewDevice, { width: string; scale: number; label: string; height: string }> = {
  desktop: { width: '100%', scale: 0.55, label: 'Desktop', height: '600px' },
  tablet: { width: '768px', scale: 0.50, label: 'Tablet', height: '550px' },
  mobile: { width: '375px', scale: 0.45, label: 'Mobile', height: '500px' },
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

  // Real embed URL for full page view (only for existing activities)
  const realEmbedUrl = useMemo(() => {
    if (!activityId || activityId === 'preview') return null;
    return `${baseUrl}/embed?widget=singlegame&activityId=${activityId}&color=${primaryColor.replace('#', '')}&theme=${theme}`;
  }, [activityId, baseUrl, primaryColor, theme]);

  const openFullPreview = useCallback(() => {
    if (realEmbedUrl) {
      window.open(realEmbedUrl, '_blank', 'noopener,noreferrer');
    } else {
      toast.info('Save the activity first to preview the live widget');
    }
  }, [realEmbedUrl]);

  // Check if we have a valid activity ID (saved activity)
  const hasValidActivityId = activityId && activityId !== 'preview' && activityId.length > 10;

  // Generate downloadable HTML landing page (uses iframe for reliability)
  const generateLandingPageHTML = useCallback(() => {
    const activityName = activityData.name || 'Book Your Experience';
    const activityDesc = activityData.description || 'Experience something amazing. Book your session today!';
    const embedUrl = `${baseUrl}/embed?widget=singlegame&activityId=${activityId}&color=${primaryColor.replace('#', '')}&theme=${theme}`;
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${activityName} - Book Now</title>
  <meta name="description" content="${activityDesc}">
  <meta property="og:title" content="${activityName}">
  <meta property="og:description" content="${activityDesc}">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; background: #f8fafc; color: #1e293b; min-height: 100vh; }
    .header { background: linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%); color: white; padding: 60px 20px; text-align: center; }
    .header h1 { font-size: 2.5rem; margin-bottom: 10px; font-weight: 700; }
    .header p { font-size: 1.1rem; opacity: 0.9; max-width: 600px; margin: 0 auto; }
    .widget-container { max-width: 1200px; margin: -40px auto 40px; padding: 0 20px; }
    .widget-wrapper { background: white; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); overflow: hidden; min-height: 700px; }
    .widget-iframe { width: 100%; min-height: 700px; border: none; }
    .footer { text-align: center; padding: 40px 20px; color: #64748b; font-size: 0.875rem; }
    .footer a { color: ${primaryColor}; text-decoration: none; font-weight: 500; }
    .footer a:hover { text-decoration: underline; }
    @media (max-width: 768px) { 
      .header h1 { font-size: 1.8rem; } 
      .header { padding: 40px 20px; }
      .widget-wrapper { border-radius: 0; margin: 0 -20px; }
    }
  </style>
</head>
<body>
  <header class="header">
    <h1>${activityName}</h1>
    <p>${activityDesc}</p>
  </header>
  
  <main class="widget-container">
    <div class="widget-wrapper">
      <!-- BookingTMS Booking Widget (iframe method - cross-domain compatible) -->
      <iframe 
        src="${embedUrl}"
        class="widget-iframe"
        title="Book ${activityName}"
        allow="payment"
        loading="lazy"
      ></iframe>
    </div>
  </main>

  <footer class="footer">
    <p>Powered by <a href="https://bookingtms.com" target="_blank" rel="noopener">BookingTMS</a></p>
  </footer>

  <script>
    // Auto-resize iframe based on content
    window.addEventListener('message', function(e) {
      if (e.data && e.data.type === 'BOOKINGTMS_RESIZE') {
        const iframe = document.querySelector('.widget-iframe');
        if (iframe && e.data.height) {
          iframe.style.height = Math.max(700, e.data.height) + 'px';
        }
      }
    });
  </script>
</body>
</html>`;
  }, [activityData.name, activityData.description, primaryColor, baseUrl, activityId, theme]);

  // Download file helper
  const downloadFile = useCallback((content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}`);
  }, []);

  // Download landing page HTML
  const downloadLandingPage = useCallback(() => {
    if (!hasValidActivityId) {
      toast.error('Please save the activity first to download a working landing page');
      return;
    }
    const html = generateLandingPageHTML();
    const activitySlug = (activityData.name || 'booking').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    downloadFile(html, `${activitySlug}-booking-page.html`, 'text/html');
  }, [generateLandingPageHTML, downloadFile, activityData.name, hasValidActivityId]);

  // Open demo in new tab - use real embed URL for saved activities
  const openDemoPage = useCallback(() => {
    if (!hasValidActivityId) {
      toast.error('Please save the activity first to preview the live booking page');
      return;
    }
    // Open the real embed URL directly (more reliable)
    const embedUrl = `${baseUrl}/embed?widget=singlegame&activityId=${activityId}&color=${primaryColor.replace('#', '')}&theme=${theme}`;
    window.open(embedUrl, '_blank', 'noopener,noreferrer');
  }, [hasValidActivityId, baseUrl, activityId, primaryColor, theme]);

  // Download embed code as file
  const downloadEmbedCode = useCallback(() => {
    const activitySlug = (activityData.name || 'booking').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const ext = codeFormat === 'react' ? 'tsx' : codeFormat === 'wordpress' ? 'php' : 'html';
    downloadFile(generatedCode, `${activitySlug}-embed.${ext}`, 'text/plain');
  }, [generatedCode, codeFormat, downloadFile, activityData.name]);

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
                  className={realEmbedUrl 
                    ? "border-blue-200 text-blue-700 hover:bg-blue-50" 
                    : "border-gray-200 text-gray-400 cursor-not-allowed"
                  }
                  disabled={!realEmbedUrl}
                  title={realEmbedUrl ? "Open live widget in new tab" : "Save activity first to enable"}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {realEmbedUrl ? 'Open Full Page' : 'Save to Preview'}
                </Button>
              </div>

              {/* Preview Window */}
              <div 
                className="border rounded-xl overflow-hidden shadow-lg bg-gray-100 relative mx-auto transition-all duration-300"
                style={{ maxWidth: deviceConfig.width }}
              >
                {/* Browser Chrome */}
                <div className="bg-gray-200 border-b flex items-center px-3 py-1.5 gap-2">
                  <div className="flex gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 text-center text-[10px] text-gray-500 font-mono bg-white rounded px-2 py-0.5 truncate mx-2">
                    {previewUrl.substring(0, 50)}...
                  </div>
                </div>
                
                {/* Preview Content - Scrollable container */}
                <div 
                  className="bg-white overflow-y-auto overflow-x-hidden"
                  style={{ height: deviceConfig.height }}
                >
                  {activityId && activityId !== 'preview' ? (
                    /* Live Widget Preview - Real data from database via iframe (like Stripe) */
                    <iframe
                      src={`${baseUrl}/embed?widget=singlegame&activityId=${activityId}&color=${primaryColor.replace('#', '')}&theme=${theme}`}
                      className="w-full h-full border-0"
                      title="Widget Preview"
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                    />
                  ) : (
                    /* Static Preview with dynamic data from wizard steps */
                    <div 
                      style={{ 
                        transform: `scale(${deviceConfig.scale})`,
                        transformOrigin: 'top left',
                        width: `${100 / deviceConfig.scale}%`,
                        minHeight: `${100 / deviceConfig.scale}%`,
                      }}
                    >
                      <ActivityPreviewCard
                        activity={{
                          id: 'preview',
                          // Step 1: Basic Info
                          name: activityData.name || 'Your Activity Name',
                          description: activityData.description || activityData.tagline || 'Your activity description will appear here.',
                          // Step 2: Capacity & Pricing
                          min_players: activityData.minAdults || 2,
                          max_players: activityData.maxAdults || 8,
                          price: activityData.adultPrice || 30,
                          child_price: activityData.childPrice || 20,
                          // Step 3: Activity Details
                          duration: activityData.duration || 60,
                          difficulty: activityData.difficulty ? String(activityData.difficulty) : 'Medium',
                          age_guideline: activityData.minAge ? `Ages ${activityData.minAge}+` : undefined,
                          faqs: activityData.faqs || [],
                          highlights: activityData.highlights || [],
                          // Step 4: Media
                          image_url: activityData.coverImage || undefined,
                          gallery_images: activityData.galleryImages || [],
                          video_url: activityData.videos?.[0],
                          // Step 5: Schedule (full sync)
                          schedule: {
                            operatingDays: activityData.operatingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                            startTime: activityData.startTime || '10:00',
                            endTime: activityData.endTime || '22:00',
                            slotInterval: activityData.slotInterval || 60,
                            advanceBookingDays: activityData.advanceBooking || 30,
                            // Custom hours per day
                            customHours: activityData.customHoursEnabled ? Object.fromEntries(
                              Object.entries(activityData.customHours || {}).map(([day, config]) => [
                                day,
                                { start: config.startTime, end: config.endTime, enabled: config.enabled }
                              ])
                            ) : undefined,
                            // Specific dates (holidays/special hours)
                            specificDates: activityData.customDates?.map(d => ({
                              date: d.date,
                              start: d.startTime,
                              end: d.endTime,
                            })) || [],
                            // Blocked dates
                            blockedDates: activityData.blockedDates?.map(d => 
                              typeof d === 'string' 
                                ? { date: d } 
                                : { date: d.date, reason: d.reason }
                            ) || [],
                          },
                        }}
                        venueName={activityData.venueName}
                        primaryColor={primaryColor}
                        theme={theme}
                        showBookingFlow={true}
                        compact={previewDevice !== 'desktop'}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Dynamic Data Info */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700">
                <p className="font-medium mb-1">📊 Preview reflects your wizard data:</p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
                  <span>• Name: {activityData.name ? '✓' : '—'}</span>
                  <span>• Price: ${activityData.adultPrice || 30}</span>
                  <span>• Duration: {activityData.duration || 60}min</span>
                  <span>• Image: {activityData.coverImage ? '✓' : '—'}</span>
                  <span>• Days: {activityData.operatingDays?.length || 5}</span>
                </div>
                {/* Schedule Legend */}
                <div className="flex flex-wrap gap-3 mt-2 pt-2 border-t border-blue-200 text-[10px]">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-green-100 border border-green-200" /> Available
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-blue-100 border border-blue-200" /> Special hours
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-red-100 border border-red-200" /> Blocked
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-gray-100 border border-gray-200" /> Not operating
                  </span>
                </div>
              </div>
            </TabsContent>

            {/* Code Tab */}
            <TabsContent value="code" className="space-y-6">
              {/* Download Section */}
              <div className={`rounded-xl p-5 border ${hasValidActivityId 
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${hasValidActivityId ? 'bg-green-100' : 'bg-amber-100'}`}>
                      <Download className={`w-5 h-5 ${hasValidActivityId ? 'text-green-600' : 'text-amber-600'}`} />
                    </div>
                    <div>
                      <h4 className={`font-semibold ${hasValidActivityId ? 'text-green-900' : 'text-amber-900'}`}>
                        Download & Preview
                      </h4>
                      <p className={`text-sm ${hasValidActivityId ? 'text-green-700' : 'text-amber-700'}`}>
                        {hasValidActivityId 
                          ? 'Get a ready-to-use landing page with real data' 
                          : '⚠️ Save the activity first to enable downloads'}
                      </p>
                    </div>
                  </div>
                  {hasValidActivityId && (
                    <Badge className="bg-green-100 text-green-700 border-green-300">
                      <Check className="w-3 h-3 mr-1" /> Ready
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={openDemoPage}
                    disabled={!hasValidActivityId}
                    className={hasValidActivityId 
                      ? "bg-green-600 hover:bg-green-700 text-white" 
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    View Live Demo
                  </Button>
                  <Button
                    variant="outline"
                    onClick={downloadLandingPage}
                    disabled={!hasValidActivityId}
                    className={hasValidActivityId 
                      ? "border-green-300 text-green-700 hover:bg-green-50" 
                      : "border-gray-200 text-gray-400 cursor-not-allowed"}
                  >
                    <FileCode className="w-4 h-4 mr-2" />
                    Download Landing Page
                  </Button>
                  <Button
                    variant="outline"
                    onClick={downloadEmbedCode}
                    className="border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Embed Code
                  </Button>
                </div>
                <p className={`text-xs mt-3 ${hasValidActivityId ? 'text-green-600' : 'text-amber-600'}`}>
                  {hasValidActivityId 
                    ? '📌 The landing page connects to our booking system with real-time availability and Stripe checkout.' 
                    : '💡 Complete Step 8 (Review & Publish) to save the activity and enable live previews.'}
                </p>
              </div>

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
                <div className="absolute top-3 right-3 z-10 flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 text-xs bg-gray-800 hover:bg-gray-700 text-white"
                    onClick={downloadEmbedCode}
                  >
                    <Download className="w-3 h-3 mr-1" /> Download
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 text-xs bg-gray-800 hover:bg-gray-700 text-white"
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
                </div>
                <pre className="font-mono text-xs bg-gray-900 text-gray-300 p-4 pt-14 rounded-lg overflow-x-auto max-h-80">
                  <code>{generatedCode}</code>
                </pre>
              </div>

              {/* Data Flow Info */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h5 className="font-medium text-amber-900 mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Real-Time Data Connection
                </h5>
                <p className="text-sm text-amber-800 mb-2">
                  The embedded widget connects directly to our Supabase database for:
                </p>
                <ul className="text-xs text-amber-700 space-y-1 ml-4">
                  <li>• Live availability and time slots</li>
                  <li>• Real-time booking updates</li>
                  <li>• Dynamic pricing from your activity settings</li>
                  <li>• Automatic schedule synchronization</li>
                  <li>• Secure payment processing via Stripe</li>
                </ul>
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
