import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Copy, Check, ExternalLink, Code, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../layout/ThemeContext';
import { EmbedDocumentation } from './EmbedDocumentation';
import { EmbedTester } from './EmbedTester';
import { DownloadTestPage } from './DownloadTestPage';
import { EmbedParametersGuide } from './EmbedParametersGuide';

interface EmbedPreviewProps {
  widgetId: string;
  widgetName: string;
  primaryColor: string;
  embedKey?: string;
  widgetConfig?: any;
}

export function EmbedPreview({ widgetId, widgetName, primaryColor, embedKey, widgetConfig }: EmbedPreviewProps) {
  const [copied, setCopied] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [embedType, setEmbedType] = useState<'iframe' | 'script'>('iframe');
  const [widgetKey, setWidgetKey] = useState(embedKey || 'YOUR_WIDGET_KEY_HERE');
  // Absolute base URL support for localhost/external testing
  const [baseUrl, setBaseUrl] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return '';
  });
  const { theme } = useTheme();
  
  // Update widgetKey when embedKey prop changes
  useEffect(() => {
    if (embedKey) {
      setWidgetKey(embedKey);
    }
  }, [embedKey]);
  
  // Generate embed URL, preferring absolute URL when baseUrl is set
  // Automatically sync theme with admin dashboard
  const generateEmbedUrl = () => {
    const params = new URLSearchParams({
      widget: widgetId,
      color: primaryColor.replace('#', ''),
      key: widgetKey,
      theme: theme, // Auto-sync with admin theme
    });
    const cleanedBase = (baseUrl || '').trim().replace(/\/+$/, '');
    if (cleanedBase) {
      return `${cleanedBase}/?${params.toString()}`;
    }
    return `/?${params.toString()}`;
  };

  // Generate iframe code
  const generateIframeCode = () => {
    const embedUrl = generateEmbedUrl();
    return `<iframe
  src="${embedUrl}"
  width="100%"
  height="800"
  frameborder="0"
  allow="payment; camera"
  allowfullscreen
  style="border: none; border-radius: 8px;"
  title="${widgetName}"
></iframe>`;
  };

  // Generate script code
  const generateScriptCode = () => {
    return `<!-- BookingTMS ${widgetName} -->
<div id="bookingtms-widget-${widgetId}"></div>
<script>
  (function() {
    var iframe = document.createElement('iframe');
    iframe.src = '${generateEmbedUrl()}';
    iframe.width = '100%';
    iframe.height = '800';
    iframe.frameBorder = '0';
    iframe.allow = 'payment; camera';
    iframe.allowFullscreen = true;
    iframe.style.border = 'none';
    iframe.style.borderRadius = '8px';
    iframe.style.minHeight = '600px';
    iframe.title = '${widgetName}';
    
    // Handle responsive height
    window.addEventListener('message', function(event) {
      if (event.data && event.data.type === 'BOOKINGTMS_RESIZE') {
        iframe.style.height = event.data.height + 'px';
      }
    });
    
    var container = document.getElementById('bookingtms-widget-${widgetId}');
    if (container) {
      container.appendChild(iframe);
    }
  })();
</script>`;
  };

  // Generate React component code
  const generateReactCode = () => {
    return `import React from 'react';

export function BookingWidget() {
  const embedUrl = "${generateEmbedUrl()}";

  return (
    <iframe
      src={embedUrl}
      width="100%"
      height="800"
      frameBorder="0"
      allow="payment; camera"
      allowFullScreen
      style={{ border: 'none', borderRadius: '8px' }}
      title="${widgetName}"
    />
  );
}`;
  };

  // Generate WordPress shortcode
  const generateWordPressCode = () => {
    return `/**
 * Add this to your theme's functions.php
 */
function bookingtms_widget_shortcode($atts) {
    $atts = shortcode_atts(array(
        'widget' => '${widgetId}',
        'color' => '${primaryColor.replace('#', '')}',
        'key' => '${widgetKey}',
        'height' => '800',
    ), $atts);
    
    $embed_url = add_query_arg(array(
        'widget' => $atts['widget'],
        'color' => $atts['color'],
        'key' => $atts['key'],
    ), '/');
    
    return '<iframe src="' . esc_url($embed_url) . '" 
            width="100%" 
            height="' . esc_attr($atts['height']) . '" 
            frameborder="0" 
            allow="payment; camera" 
            allowfullscreen 
            style="border: none; border-radius: 8px;" 
            title="BookingTMS Widget"></iframe>';
}
add_shortcode('bookingtms', 'bookingtms_widget_shortcode');

/**
 * Usage in posts/pages:
 * [bookingtms widget="${widgetId}" color="${primaryColor.replace('#', '')}" key="${widgetKey}"]
 */`;
  };

  const getCode = () => {
    if (embedType === 'iframe') {
      return generateIframeCode();
    } else {
      return generateScriptCode();
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(generateEmbedUrl());
    setCopiedUrl(true);
    toast.success('URL copied to clipboard!');
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Widget Key Configuration */}
      <Card className="border-gray-200 dark:border-[#2a2a2a]">
        <CardHeader className="p-3 sm:p-4">
          <CardTitle className="text-sm sm:text-base">Widget Configuration</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0 space-y-3 sm:space-y-4">
          <div>
            <Label htmlFor="widget-key" className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Widget Key</Label>
            <div className="flex flex-col sm:flex-row gap-2 mt-1">
              <Input
                id="widget-key"
                value={widgetKey}
                onChange={(e) => setWidgetKey(e.target.value)}
                placeholder="Enter your widget key"
                className="h-9 sm:h-10 text-xs sm:text-sm bg-gray-100 dark:bg-[#1e1e1e] border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
              />
              <Button
                variant="outline"
                size="sm"
                disabled
                className="h-9 sm:h-10 w-full sm:w-auto cursor-not-allowed opacity-70"
                title="Key generation temporarily disabled. Use the venue's assigned key."
              >
                Generate
              </Button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Use the widget key provided on the venue record. Generation controls are disabled for now.
            </p>
          </div>

          <div>
            <Label className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Base URL</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="http://localhost:3002"
                className="h-9 sm:h-10 text-xs sm:text-sm bg-gray-50 dark:bg-[#0a0a0a] border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-gray-300"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Use your site origin for testing (e.g., http://localhost:3002).
            </p>

            <Label className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Embed URL</Label>
            <div className="flex flex-col sm:flex-row gap-2 mt-1">
              <Input
                value={generateEmbedUrl()}
                readOnly
                className="h-9 sm:h-10 text-xs sm:text-sm bg-gray-50 dark:bg-[#0a0a0a] font-mono border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-gray-300"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyUrl}
                  className="h-9 sm:h-10 flex-1 sm:flex-initial flex-shrink-0"
                >
                  {copiedUrl ? <Check className="w-3 h-3 sm:w-4 sm:h-4" /> : <Copy className="w-3 h-3 sm:w-4 sm:h-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(generateEmbedUrl(), '_blank')}
                  className="h-9 sm:h-10 flex-1 sm:flex-initial flex-shrink-0"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Generates an absolute URL when Base URL is set; otherwise relative.
            </p>
          </div>

          {/* Theme Sync Notice */}
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-2 sm:p-3">
            <p className="text-xs text-indigo-900 dark:text-indigo-200 font-medium mb-1">
              🎨 Auto Theme Sync
            </p>
            <p className="text-xs text-indigo-700 dark:text-indigo-300">
              Widget preview automatically matches your admin theme. Currently showing: <strong>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</strong>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Embed Code Tabs */}
      <Card className="border-gray-200 dark:border-[#2a2a2a]">
        <CardHeader className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
            <CardTitle className="text-sm sm:text-base">Embed Code</CardTitle>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant={embedType === 'iframe' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setEmbedType('iframe')}
                className="h-8 text-xs flex-1 sm:flex-initial"
              >
                <Code className="w-3 h-3 mr-1" />
                iFrame
              </Button>
              <Button
                variant={embedType === 'script' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setEmbedType('script')}
                className="h-8 text-xs flex-1 sm:flex-initial"
              >
                <Code className="w-3 h-3 mr-1" />
                Script
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0">
          <Tabs defaultValue="html" className="w-full">
            <TabsList className="w-full grid grid-cols-3 h-8 sm:h-9">
              <TabsTrigger value="html" className="text-xs">HTML</TabsTrigger>
              <TabsTrigger value="react" className="text-xs">React</TabsTrigger>
              <TabsTrigger value="wordpress" className="text-xs">WordPress</TabsTrigger>
            </TabsList>
            
            <TabsContent value="html" className="mt-3">
              <div className="relative">
                <div className="absolute top-2 right-2 z-10">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleCopy(getCode())}
                    className="h-8"
                  >
                    {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                    <span className="text-xs">{copied ? 'Copied!' : 'Copy'}</span>
                  </Button>
                </div>
                <div className="bg-gray-900 dark:bg-[#0a0a0a] rounded-lg p-4 overflow-x-auto border border-gray-700 dark:border-[#2a2a2a]">
                  <pre className="text-xs text-green-400 dark:text-emerald-400">
                    <code>{getCode()}</code>
                  </pre>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Copy and paste this HTML code into your website where you want the booking widget to appear.
              </p>
            </TabsContent>

            <TabsContent value="react" className="mt-3">
              <div className="relative">
                <div className="absolute top-2 right-2 z-10">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleCopy(generateReactCode())}
                    className="h-8"
                  >
                    {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                    <span className="text-xs">{copied ? 'Copied!' : 'Copy'}</span>
                  </Button>
                </div>
                <div className="bg-gray-900 dark:bg-[#0a0a0a] rounded-lg p-4 overflow-x-auto border border-gray-700 dark:border-[#2a2a2a]">
                  <pre className="text-xs text-green-400 dark:text-emerald-400">
                    <code>{generateReactCode()}</code>
                  </pre>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Import and use this React component in your Next.js, Create React App, or any React application.
              </p>
            </TabsContent>

            <TabsContent value="wordpress" className="mt-3">
              <div className="relative">
                <div className="absolute top-2 right-2 z-10">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleCopy(generateWordPressCode())}
                    className="h-8"
                  >
                    {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                    <span className="text-xs">{copied ? 'Copied!' : 'Copy'}</span>
                  </Button>
                </div>
                <div className="bg-gray-900 dark:bg-[#0a0a0a] rounded-lg p-4 overflow-x-auto border border-gray-700 dark:border-[#2a2a2a]">
                  <pre className="text-xs text-green-400 dark:text-emerald-400">
                    <code>{generateWordPressCode()}</code>
                  </pre>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Add the function to your theme's functions.php, then use the shortcode in any post or page.
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Device Testing */}
      <EmbedTester embedUrl={generateEmbedUrl()} widgetName={widgetName} widgetConfig={widgetConfig} />

      {/* Download Test Page */}
      <DownloadTestPage
        embedUrl={generateEmbedUrl()}
        widgetName={widgetName}
        widgetId={widgetId}
        iframeCode={generateIframeCode()}
        scriptCode={generateScriptCode()}
      />

      {/* Integration Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">💡 Integration Tips</h3>
        <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
          <li>• Adjust the <code className="bg-blue-100 dark:bg-blue-900/50 px-1 rounded">height</code> attribute to fit your page layout (recommended: 800px)</li>
          <li>• The widget is fully responsive and works on all devices</li>
          <li>• Test the widget on mobile devices before going live</li>
          <li>• Keep your widget key secure and never expose it in public repositories</li>
          <li>• The widget automatically handles scrolling and navigation</li>
          <li>• Contact support if you need help with custom integrations</li>
        </ul>
      </div>

      {/* Technical Details */}
      <Card className="border-gray-200 dark:border-[#2a2a2a]">
        <CardHeader className="p-4">
          <CardTitle className="text-base">Technical Details</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-gray-50 dark:bg-[#1e1e1e] rounded-lg p-3">
              <p className="text-gray-600 dark:text-gray-400 mb-1">Widget Type</p>
              <p className="text-gray-900 dark:text-white">{widgetId}</p>
            </div>
            <div className="bg-gray-50 dark:bg-[#1e1e1e] rounded-lg p-3">
              <p className="text-gray-600 dark:text-gray-400 mb-1">Primary Color</p>
              <p className="text-gray-900 dark:text-white">{primaryColor}</p>
            </div>
            <div className="bg-gray-50 dark:bg-[#1e1e1e] rounded-lg p-3">
              <p className="text-gray-600 dark:text-gray-400 mb-1">Responsive</p>
              <p className="text-gray-900 dark:text-white">✓ Yes</p>
            </div>
            <div className="bg-gray-50 dark:bg-[#1e1e1e] rounded-lg p-3">
              <p className="text-gray-600 dark:text-gray-400 mb-1">Mobile Support</p>
              <p className="text-gray-900 dark:text-white">✓ Full Support</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parameters Guide */}
      <EmbedParametersGuide />

      {/* Documentation Section */}
      <Card className="border-gray-200 dark:border-[#2a2a2a]">
        <CardHeader className="p-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <CardTitle className="text-base">Installation & Documentation</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <EmbedDocumentation
            widgetId={widgetId}
            widgetName={widgetName}
            embedUrl={generateEmbedUrl()}
          />
        </CardContent>
      </Card>
    </div>
  );
}
