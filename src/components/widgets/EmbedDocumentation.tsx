import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { CheckCircle2, Code, ExternalLink, Globe, Smartphone, Monitor } from 'lucide-react';

interface EmbedDocumentationProps {
  widgetId: string;
  widgetName: string;
  embedUrl: string;
}

export function EmbedDocumentation({ widgetId, widgetName, embedUrl }: EmbedDocumentationProps) {
  return (
    <div className="space-y-6">
      {/* Quick Start */}
      <Card className="border-gray-200">
        <CardHeader className="p-4">
          <CardTitle className="text-base">Quick Start Guide</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 text-sm">1</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">Copy Code</p>
                <p className="text-xs text-gray-600">Choose iframe or script embed code from above</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 text-sm">2</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">Paste HTML</p>
                <p className="text-xs text-gray-600">Add the code to your website HTML</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 text-sm">3</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">Go Live</p>
                <p className="text-xs text-gray-600">Test and publish your changes</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Supported Platforms */}
      <Card className="border-gray-200">
        <CardHeader className="p-4">
          <CardTitle className="text-base">Supported Platforms</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { name: 'WordPress', supported: true },
              { name: 'Wix', supported: true },
              { name: 'Squarespace', supported: true },
              { name: 'Shopify', supported: true },
              { name: 'Webflow', supported: true },
              { name: 'HTML/CSS', supported: true },
              { name: 'React', supported: true },
              { name: 'Vue.js', supported: true },
            ].map((platform) => (
              <div key={platform.name} className="flex items-center gap-2 text-xs">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-gray-700">{platform.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Platform-Specific Instructions */}
      <Card className="border-gray-200">
        <CardHeader className="p-4">
          <CardTitle className="text-base">Platform-Specific Instructions</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <Tabs defaultValue="wordpress" className="w-full">
            <TabsList className="w-full grid grid-cols-4 h-9">
              <TabsTrigger value="wordpress" className="text-xs">WordPress</TabsTrigger>
              <TabsTrigger value="wix" className="text-xs">Wix</TabsTrigger>
              <TabsTrigger value="squarespace" className="text-xs">Squarespace</TabsTrigger>
              <TabsTrigger value="shopify" className="text-xs">Shopify</TabsTrigger>
            </TabsList>

            <TabsContent value="wordpress" className="mt-4 space-y-3">
              <div className="text-sm space-y-2">
                <p className="font-medium text-gray-900">Method 1: Using the Block Editor</p>
                <ol className="list-decimal list-inside space-y-1 text-xs text-gray-600 ml-2">
                  <li>Edit your page/post in WordPress</li>
                  <li>Click the "+" button to add a new block</li>
                  <li>Search for "Custom HTML" block and add it</li>
                  <li>Paste the embed code into the HTML block</li>
                  <li>Update/Publish your page</li>
                </ol>
              </div>
              <div className="text-sm space-y-2">
                <p className="font-medium text-gray-900">Method 2: Using Shortcode (Advanced)</p>
                <ol className="list-decimal list-inside space-y-1 text-xs text-gray-600 ml-2">
                  <li>Add the shortcode function to your theme's functions.php</li>
                  <li>Use [bookingtms] shortcode in your content</li>
                  <li>Customize with parameters: [bookingtms widget="{widgetId}"]</li>
                </ol>
              </div>
            </TabsContent>

            <TabsContent value="wix" className="mt-4 space-y-3">
              <ol className="list-decimal list-inside space-y-1 text-xs text-gray-600">
                <li>Open your Wix site editor</li>
                <li>Click the "+" button on the left sidebar</li>
                <li>Select "Embed" → "Embed a Widget"</li>
                <li>Choose "Custom Code" or "HTML iframe"</li>
                <li>Paste the embed code</li>
                <li>Adjust the size and position</li>
                <li>Publish your site</li>
              </ol>
            </TabsContent>

            <TabsContent value="squarespace" className="mt-4 space-y-3">
              <ol className="list-decimal list-inside space-y-1 text-xs text-gray-600">
                <li>Edit the page where you want to add the widget</li>
                <li>Click an insert point and select "Code"</li>
                <li>Paste the embed code into the code block</li>
                <li>Choose "HTML" as the code type</li>
                <li>Click "Apply"</li>
                <li>Save and publish your changes</li>
              </ol>
            </TabsContent>

            <TabsContent value="shopify" className="mt-4 space-y-3">
              <ol className="list-decimal list-inside space-y-1 text-xs text-gray-600">
                <li>Go to Online Store → Themes in Shopify admin</li>
                <li>Click "Customize" on your active theme</li>
                <li>Navigate to the page where you want the widget</li>
                <li>Add a "Custom HTML" or "Custom Liquid" section</li>
                <li>Paste the embed code</li>
                <li>Save and publish</li>
              </ol>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Features */}
      <Card className="border-gray-200">
        <CardHeader className="p-4">
          <CardTitle className="text-base">Widget Features</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Globe className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">Fully Responsive</p>
                <p className="text-xs text-gray-600">Works perfectly on all screen sizes</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">Mobile Optimized</p>
                <p className="text-xs text-gray-600">Touch-friendly interface for mobile users</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Monitor className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">Customizable</p>
                <p className="text-xs text-gray-600">Match your brand colors and style</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Troubleshooting */}
      <Card className="border-gray-200">
        <CardHeader className="p-4">
          <CardTitle className="text-base">Troubleshooting</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-900 mb-1">Widget not displaying?</p>
            <ul className="list-disc list-inside space-y-1 text-xs text-gray-600 ml-2">
              <li>Ensure the embed code is correctly pasted in your HTML</li>
              <li>Check that your widget key is valid</li>
              <li>Clear your browser cache and refresh the page</li>
              <li>Make sure your website allows iframe embedding</li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 mb-1">Widget appears too small?</p>
            <ul className="list-disc list-inside space-y-1 text-xs text-gray-600 ml-2">
              <li>Adjust the height attribute in the iframe code (recommended: 800px)</li>
              <li>Ensure the container div has sufficient width</li>
              <li>The widget will auto-adjust to container width</li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 mb-1">Need more help?</p>
            <p className="text-xs text-gray-600">
              Contact our support team at{' '}
              <a href="mailto:support@bookingtms.com" className="text-blue-600 hover:underline">
                support@bookingtms.com
              </a>{' '}
              or check our{' '}
              <a href="/docs" className="text-blue-600 hover:underline">
                detailed documentation
              </a>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Security Note */}
      <Alert className="border-amber-200 bg-amber-50">
        <div className="flex gap-3">
          <div className="text-amber-600 flex-shrink-0">⚠️</div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-amber-900">Security Notice</p>
            <p className="text-xs text-amber-700">
              Keep your widget key confidential. Do not share it publicly or commit it to public repositories.
              If you believe your key has been compromised, regenerate it immediately in your account settings.
            </p>
          </div>
        </div>
      </Alert>
    </div>
  );
}
