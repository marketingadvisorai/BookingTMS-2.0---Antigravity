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

  // Generate iframe code with responsive wrapper
  const generateIframeCode = () => {
    const embedUrl = generateEmbedUrl();
    return `<!-- Responsive Embed Wrapper -->
<div style="position: relative; width: 100%; padding-top: 135%; overflow: hidden; border-radius: 8px;">
  <iframe
    src="${embedUrl}"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
    frameborder="0"
    allow="payment; camera"
    allowfullscreen
    title="${widgetName}"
  ></iframe>
</div>`;
  };

  // Generate script code with auto-resize
  const generateScriptCode = () => {
    return `<!-- BookingTMS ${widgetName} - Auto-Resize Embed -->
<div id="bookingtms-widget-${widgetId}" style="width: 100%; max-width: 100%; overflow: hidden;"></div>
<script>
  (function() {
    var iframe = document.createElement('iframe');
    iframe.src = '${generateEmbedUrl()}';
    iframe.width = '100%';
    iframe.frameBorder = '0';
    iframe.allow = 'payment; camera';
    iframe.allowFullscreen = true;
    iframe.style.border = 'none';
    iframe.style.borderRadius = '8px';
    iframe.style.minHeight = '600px';
    iframe.style.width = '100%';
    iframe.style.maxWidth = '100%';
    iframe.title = '${widgetName}';
    
    // Auto-resize height based on content
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

  // Generate React component code with responsive wrapper
  const generateReactCode = () => {
    return `import React, { useEffect, useRef } from 'react';

export function BookingWidget() {
  const embedUrl = "${generateEmbedUrl()}";
  const iframeRef = useRef(null);

  useEffect(() => {
    // Auto-resize iframe based on content
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'BOOKINGTMS_RESIZE') {
        if (iframeRef.current) {
          iframeRef.current.style.height = event.data.height + 'px';
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', paddingTop: '135%', overflow: 'hidden', borderRadius: '8px' }}>
      <iframe
        ref={iframeRef}
        src={embedUrl}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
        frameBorder="0"
        allow="payment; camera"
        allowFullScreen
        title="${widgetName}"
      />
    </div>
  );
}`;
  };

  // Generate WordPress shortcode with responsive wrapper
  const generateWordPressCode = () => {
    return `/**
 * Add this to your theme's functions.php
 */
function bookingtms_widget_shortcode($atts) {
    $atts = shortcode_atts(array(
        'widget' => '${widgetId}',
        'color' => '${primaryColor.replace('#', '')}',
        'key' => '${widgetKey}',
    ), $atts);
    
    $embed_url = add_query_arg(array(
        'widget' => $atts['widget'],
        'color' => $atts['color'],
        'key' => $atts['key'],
    ), '/');
    
    return '<div style="position: relative; width: 100%; padding-top: 135%; overflow: hidden; border-radius: 8px;">
              <iframe 
                src="' . esc_url($embed_url) . '" 
                style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
                frameborder="0" 
                allow="payment; camera" 
                allowfullscreen 
                title="BookingTMS Widget">
              </iframe>
            </div>';
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
    <div className="space-y-3 sm:space-y-4 md:space-y-6 pb-8 w-full max-w-full">
      {/* Widget Key Configuration */}
      <Card className="border-gray-200 dark:border-[#2a2a2a] w-full">
        <CardHeader className="p-2 sm:p-3 md:p-4">
          <CardTitle className="text-sm sm:text-base">Widget Configuration</CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-3 md:p-4 pt-0 space-y-2 sm:space-y-3 md:space-y-4">
          <div>
            <Label htmlFor="widget-key" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Widget Key</Label>
            <div className="flex flex-col md:flex-row gap-2 mt-1.5">
              <Input
                id="widget-key"
                value={widgetKey}
                onChange={(e) => setWidgetKey(e.target.value)}
                placeholder="Enter your widget key"
                readOnly
                className="h-10 sm:h-11 text-sm font-mono bg-white dark:bg-[#0a0a0a] border-2 border-gray-300 dark:border-[#3a3a3a] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 w-full focus:border-blue-500 dark:focus:border-blue-400"
              />
              <Button
                variant="outline"
                size="sm"
                disabled
                className="h-10 sm:h-11 px-3 text-xs w-auto md:w-[100px] cursor-not-allowed opacity-50 whitespace-nowrap"
                title="Key generation temporarily disabled. Use the venue's assigned key."
              >
                Generate
              </Button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
              Use the widget key provided on the venue record. Generation controls are disabled for now.
            </p>
          </div>

          <div>
            <Label className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Base URL</Label>
            <div className="flex flex-col gap-2 mt-1">
              <Input
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="http://localhost:3002"
                className="h-9 sm:h-10 text-xs sm:text-sm bg-gray-50 dark:bg-[#0a0a0a] border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-gray-300 w-full"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Use your site origin for testing (e.g., http://localhost:3002).
            </p>

            <Label className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Embed URL</Label>
            <div className="flex flex-col md:flex-row gap-2 mt-1">
              <Input
                value={generateEmbedUrl()}
                readOnly
                className="h-9 sm:h-10 text-xs sm:text-sm bg-gray-50 dark:bg-[#0a0a0a] font-mono border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-gray-300 w-full"
              />
              <div className="flex gap-2 w-full md:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyUrl}
                  className="h-9 sm:h-10 flex-1 md:flex-initial flex-shrink-0"
                >
                  {copiedUrl ? <Check className="w-3 h-3 sm:w-4 sm:h-4" /> : <Copy className="w-3 h-3 sm:w-4 sm:h-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(generateEmbedUrl(), '_blank')}
                  className="h-9 sm:h-10 flex-1 md:flex-initial flex-shrink-0"
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
      <Card className="border-gray-200 dark:border-[#2a2a2a] w-full">
        <CardHeader className="p-2 sm:p-3 md:p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <CardTitle className="text-base sm:text-lg">Embed Code</CardTitle>
            <div className="flex gap-2 w-full md:w-auto">
              <Button
                variant={embedType === 'iframe' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setEmbedType('iframe')}
                className="h-9 sm:h-10 text-sm flex-1 md:flex-initial"
              >
                <Code className="w-4 h-4 mr-2" />
                iFrame
              </Button>
              <Button
                variant={embedType === 'script' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setEmbedType('script')}
                className="h-9 sm:h-10 text-sm flex-1 md:flex-initial"
              >
                <Code className="w-4 h-4 mr-2" />
                Script
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-2 sm:p-3 md:p-6 pt-0">
          <Tabs defaultValue="html" className="w-full max-w-full">
            <TabsList className="w-full flex overflow-x-auto gap-2 h-9 sm:h-10 sm:grid sm:grid-cols-3 sm:gap-0">
              <TabsTrigger value="html" className="text-sm px-3 py-2 min-w-[96px] sm:min-w-0 sm:text-sm">HTML</TabsTrigger>
              <TabsTrigger value="react" className="text-sm px-3 py-2 min-w-[96px] sm:min-w-0 sm:text-sm">React</TabsTrigger>
              <TabsTrigger value="wordpress" className="text-sm px-3 py-2 min-w-[96px] sm:min-w-0 sm:text-sm">WordPress</TabsTrigger>
            </TabsList>
            
            <TabsContent value="html" className="mt-4">
              <div className="relative">
                <div className="absolute top-2 right-2 z-10">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleCopy(getCode())}
                    className="h-9 sm:h-10"
                  >
                    {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    <span className="text-sm">{copied ? 'Copied!' : 'Copy'}</span>
                  </Button>
                </div>
                <div className="bg-gray-900 dark:bg-[#0a0a0a] rounded-lg p-2 sm:p-3 md:p-4 overflow-x-auto border border-gray-700 dark:border-[#2a2a2a] max-w-full">
                  <pre className="text-xs sm:text-sm text-green-400 dark:text-emerald-400 whitespace-pre-wrap break-words">
                    <code>{getCode()}</code>
                  </pre>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
                Copy and paste this HTML code into your website where you want the booking widget to appear.
              </p>
            </TabsContent>

            <TabsContent value="react" className="mt-4">
              <div className="relative">
                <div className="absolute top-2 right-2 z-10">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleCopy(generateReactCode())}
                    className="h-9 sm:h-10"
                  >
                    {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    <span className="text-sm">{copied ? 'Copied!' : 'Copy'}</span>
                  </Button>
                </div>
                <div className="bg-gray-900 dark:bg-[#0a0a0a] rounded-lg p-2 sm:p-3 md:p-4 overflow-x-auto border border-gray-700 dark:border-[#2a2a2a] max-w-full">
                  <pre className="text-xs sm:text-sm text-green-400 dark:text-emerald-400 whitespace-pre-wrap break-words">
                    <code>{generateReactCode()}</code>
                  </pre>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
                Import and use this React component in your Next.js, Create React App, or any React application.
              </p>
            </TabsContent>

            <TabsContent value="wordpress" className="mt-4">
              <div className="relative">
                <div className="absolute top-2 right-2 z-10">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleCopy(generateWordPressCode())}
                    className="h-9 sm:h-10"
                  >
                    {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    <span className="text-sm">{copied ? 'Copied!' : 'Copy'}</span>
                  </Button>
                </div>
                <div className="bg-gray-900 dark:bg-[#0a0a0a] rounded-lg p-2 sm:p-3 md:p-4 overflow-x-auto border border-gray-700 dark:border-[#2a2a2a] max-w-full">
                  <pre className="text-xs sm:text-sm text-green-400 dark:text-emerald-400 whitespace-pre-wrap break-words">
                    <code>{generateWordPressCode()}</code>
                  </pre>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
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
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4 w-full">
        <h3 className="text-xs sm:text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">💡 Integration Tips</h3>
        <ul className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 space-y-1 sm:space-y-1.5">
          <li>• <strong>Responsive Design:</strong> The embed code uses a responsive wrapper that automatically adapts to mobile screens</li>
          <li>• <strong>Aspect Ratio:</strong> The default padding-top is 135% - adjust between 125%-140% if needed for your content</li>
          <li>• <strong>Script Method (Recommended):</strong> Use the Script embed for auto-resizing height based on content</li>
          <li>• <strong>Mobile Testing:</strong> Always test on real mobile devices before going live</li>
          <li>• <strong>Security:</strong> Keep your widget key secure and never expose it in public repositories</li>
          <li>• <strong>Auto-Resize:</strong> The widget sends height updates via postMessage for dynamic sizing</li>
          <li>• <strong>Support:</strong> Contact support if you need help with custom integrations</li>
        </ul>
      </div>

      {/* Technical Details */}
      <Card className="border-gray-200 dark:border-[#2a2a2a] w-full">
        <CardHeader className="p-2 sm:p-3 md:p-4">
          <CardTitle className="text-sm sm:text-base">Technical Details</CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-3 md:p-4 pt-0 space-y-2 sm:space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
            <div className="bg-gray-50 dark:bg-[#1e1e1e] rounded-lg p-3 sm:p-4">
              <p className="text-gray-600 dark:text-gray-400 mb-1 text-xs sm:text-sm">Widget Type</p>
              <p className="text-gray-900 dark:text-white text-sm sm:text-base">{widgetId}</p>
            </div>
            <div className="bg-gray-50 dark:bg-[#1e1e1e] rounded-lg p-3 sm:p-4">
              <p className="text-gray-600 dark:text-gray-400 mb-1 text-xs sm:text-sm">Primary Color</p>
              <p className="text-gray-900 dark:text-white text-sm sm:text-base">{primaryColor}</p>
            </div>
            <div className="bg-gray-50 dark:bg-[#1e1e1e] rounded-lg p-3 sm:p-4">
              <p className="text-gray-600 dark:text-gray-400 mb-1 text-xs sm:text-sm">Responsive</p>
              <p className="text-gray-900 dark:text-white text-sm sm:text-base">✓ Yes</p>
            </div>
            <div className="bg-gray-50 dark:bg-[#1e1e1e] rounded-lg p-3 sm:p-4">
              <p className="text-gray-600 dark:text-gray-400 mb-1 text-xs sm:text-sm">Mobile Support</p>
              <p className="text-gray-900или dark:text-white text-sm sm:text-base">✓ Full Support</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parameters Guide */}
      <div className="w-full">
        <EmbedParametersGuide />
      </div>

      {/* Documentation Section */}
      <Card className="border-gray-200 dark:border-[#2a2a2a] w-full">
        <CardHeader className="p-2 sm:p-3 md:p-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <CardTitle className="text-sm sm:text-base">Installation & Documentation</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-2 sm:p-3 md:p-4 pt-0">
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
