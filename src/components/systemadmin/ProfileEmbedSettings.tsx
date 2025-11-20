import { useState, useEffect } from 'react';
import { useTheme } from '../layout/ThemeContext';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Code, 
  Copy, 
  Check, 
  Globe, 
  Shield, 
  Palette, 
  Eye, 
  Settings2,
  Monitor,
  Smartphone,
  Tablet,
  ExternalLink,
  AlertCircle,
  Plus,
  X
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ProfileEmbedSettingsProps {
  owner: {
    ownerName: string;
    organizationName: string;
    profileSlug: string;
    id: number;
  };
}

export const ProfileEmbedSettings = ({ owner }: ProfileEmbedSettingsProps) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Theme classes
  const bgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const cardBgClass = isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const mutedTextClass = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-[#333]' : 'border-gray-200';
  const codeBgClass = isDark ? 'bg-[#0a0a0a]' : 'bg-gray-900';

  // Embed configuration state
  const [config, setConfig] = useState({
    // Security
    allowedDomains: ['*'],
    requireHttps: true,
    
    // Appearance
    primaryColor: '#4f46e5',
    theme: 'auto' as 'auto' | 'light' | 'dark',
    borderRadius: '12',
    showHeader: true,
    showFooter: true,
    
    // Features
    enableBooking: true,
    enableGallery: true,
    enableReviews: true,
    enableSocial: true,
    
    // Responsive
    responsiveMode: 'auto' as 'auto' | 'desktop' | 'mobile',
    minHeight: '600',
    maxWidth: '1200',
    
    // Advanced
    customCSS: '',
    analyticsEnabled: true,
    locale: 'en',
  });

  const [newDomain, setNewDomain] = useState('');
  const [copied, setCopied] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Generate profile URL
  const profileUrl = `${window.location.origin}/v/${owner.profileSlug}`;
  
  // Generate embed URL with parameters
  const generateEmbedUrl = () => {
    const params = new URLSearchParams({
      embed: 'true',
      theme: config.theme,
      color: config.primaryColor.replace('#', ''),
      showHeader: config.showHeader.toString(),
      showFooter: config.showFooter.toString(),
      mode: config.responsiveMode,
    });
    return `${profileUrl}?${params.toString()}`;
  };

  // Generate JavaScript SDK code
  const generateSDKCode = () => {
    return `<!-- BookingTMS Embed SDK -->
<div id="bookingtms-profile"></div>
<script src="${window.location.origin}/embed-sdk.js"></script>
<script>
  BookingTMS.init({
    containerId: 'bookingtms-profile',
    profileSlug: '${owner.profileSlug}',
    config: {
      theme: '${config.theme}',
      primaryColor: '${config.primaryColor}',
      borderRadius: '${config.borderRadius}px',
      showHeader: ${config.showHeader},
      showFooter: ${config.showFooter},
      enableBooking: ${config.enableBooking},
      enableGallery: ${config.enableGallery},
      enableReviews: ${config.enableReviews},
      responsiveMode: '${config.responsiveMode}',
      minHeight: '${config.minHeight}px',
    },
    onLoad: function() {
      console.log('BookingTMS profile loaded');
    },
    onBooking: function(data) {
      console.log('Booking initiated:', data);
    }
  });
</script>`;
  };

  // Generate basic iframe code
  const generateIframeCode = () => {
    return `<!-- BookingTMS Profile Embed -->
<iframe 
  src="${generateEmbedUrl()}"
  width="100%"
  height="${config.minHeight}"
  frameborder="0"
  allow="payment; camera; geolocation"
  allowfullscreen
  style="border: none; border-radius: ${config.borderRadius}px; min-height: ${config.minHeight}px; max-width: ${config.maxWidth}px;"
  title="${owner.organizationName} Profile"
  loading="lazy"
></iframe>`;
  };

  // Generate React component code
  const generateReactCode = () => {
    return `import React, { useEffect, useRef } from 'react';

export function VenueProfile() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.BookingTMS) {
      window.BookingTMS.init({
        containerId: containerRef.current?.id || 'bookingtms-profile',
        profileSlug: '${owner.profileSlug}',
        config: {
          theme: '${config.theme}',
          primaryColor: '${config.primaryColor}',
          showHeader: ${config.showHeader},
          showFooter: ${config.showFooter},
          enableBooking: ${config.enableBooking},
          responsiveMode: '${config.responsiveMode}',
        },
        onLoad: () => console.log('Profile loaded'),
        onBooking: (data) => console.log('Booking:', data),
      });
    }
  }, []);

  return (
    <div>
      <div id="bookingtms-profile" ref={containerRef} />
      <script src="${window.location.origin}/embed-sdk.js" />
    </div>
  );
}`;
  };

  // Generate WordPress shortcode
  const generateWordPressCode = () => {
    return `/**
 * Add to functions.php
 */
function bookingtms_profile_shortcode($atts) {
    $atts = shortcode_atts(array(
        'slug' => '${owner.profileSlug}',
        'theme' => '${config.theme}',
        'color' => '${config.primaryColor.replace('#', '')}',
        'height' => '${config.minHeight}',
    ), $atts);
    
    $embed_url = add_query_arg(array(
        'embed' => 'true',
        'theme' => $atts['theme'],
        'color' => $atts['color'],
    ), home_url('/v/' . $atts['slug']));
    
    return '<iframe src="' . esc_url($embed_url) . '" 
            width="100%" 
            height="' . esc_attr($atts['height']) . '" 
            frameborder="0" 
            allow="payment; camera; geolocation" 
            allowfullscreen 
            style="border: none; border-radius: 12px;" 
            title="Venue Profile"></iframe>';
}
add_shortcode('bookingtms_profile', 'bookingtms_profile_shortcode');

/**
 * Usage: [bookingtms_profile slug="${owner.profileSlug}"]
 */`;
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const addDomain = () => {
    if (newDomain && !config.allowedDomains.includes(newDomain)) {
      setConfig({
        ...config,
        allowedDomains: [...config.allowedDomains, newDomain]
      });
      setNewDomain('');
      toast.success('Domain added');
    }
  };

  const removeDomain = (domain: string) => {
    setConfig({
      ...config,
      allowedDomains: config.allowedDomains.filter(d => d !== domain)
    });
    toast.success('Domain removed');
  };

  const getDeviceWidth = () => {
    switch (previewDevice) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      default: return '100%';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className={`text-2xl ${textClass} mb-2`}>Profile Embedding</h2>
        <p className={mutedTextClass}>
          Embed your venue profile on any website with our powerful embedding system
        </p>
      </div>

      <Tabs defaultValue="config" className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings2 className="w-4 h-4" />
            Configure
          </TabsTrigger>
          <TabsTrigger value="code" className="flex items-center gap-2">
            <Code className="w-4 h-4" />
            Embed Code
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Preview
          </TabsTrigger>
        </TabsList>

        {/* Configuration Tab */}
        <TabsContent value="config" className="space-y-6 mt-6">
          {/* Appearance Settings */}
          <Card className={`${bgClass} border ${borderColor}`}>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b" style={{ borderColor: isDark ? '#333' : '#e5e7eb' }}>
                <Palette className="w-5 h-5 text-indigo-600" />
                <h3 className={`text-lg ${textClass}`}>Appearance</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Primary Color */}
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={config.primaryColor}
                      onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                      className="w-20 h-12 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={config.primaryColor}
                      onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                      className="h-12 bg-gray-100 dark:bg-[#1e1e1e] border-gray-300 dark:border-[#333]"
                      placeholder="#4f46e5"
                    />
                  </div>
                </div>

                {/* Theme */}
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300">Theme Mode</Label>
                  <select
                    value={config.theme}
                    onChange={(e) => setConfig({ ...config, theme: e.target.value as any })}
                    className={`w-full h-12 px-3 rounded-lg ${isDark ? 'bg-[#1e1e1e] border-[#333] text-white' : 'bg-gray-100 border-gray-300 text-gray-900'} border`}
                  >
                    <option value="auto">Auto (System Preference)</option>
                    <option value="light">Light Mode</option>
                    <option value="dark">Dark Mode</option>
                  </select>
                </div>

                {/* Border Radius */}
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300">Border Radius (px)</Label>
                  <Input
                    type="number"
                    value={config.borderRadius}
                    onChange={(e) => setConfig({ ...config, borderRadius: e.target.value })}
                    className="h-12 bg-gray-100 dark:bg-[#1e1e1e] border-gray-300 dark:border-[#333]"
                  />
                </div>

                {/* Min Height */}
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300">Minimum Height (px)</Label>
                  <Input
                    type="number"
                    value={config.minHeight}
                    onChange={(e) => setConfig({ ...config, minHeight: e.target.value })}
                    className="h-12 bg-gray-100 dark:bg-[#1e1e1e] border-gray-300 dark:border-[#333]"
                  />
                </div>
              </div>

              {/* Toggle Switches */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t" style={{ borderColor: isDark ? '#333' : '#e5e7eb' }}>
                <div className="flex items-center justify-between">
                  <Label className="text-gray-700 dark:text-gray-300">Show Header</Label>
                  <Switch
                    checked={config.showHeader}
                    onCheckedChange={(checked) => setConfig({ ...config, showHeader: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-gray-700 dark:text-gray-300">Show Footer</Label>
                  <Switch
                    checked={config.showFooter}
                    onCheckedChange={(checked) => setConfig({ ...config, showFooter: checked })}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Features */}
          <Card className={`${bgClass} border ${borderColor}`}>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b" style={{ borderColor: isDark ? '#333' : '#e5e7eb' }}>
                <Globe className="w-5 h-5 text-indigo-600" />
                <h3 className={`text-lg ${textClass}`}>Features</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-gray-700 dark:text-gray-300">Enable Booking</Label>
                    <p className={`text-xs ${mutedTextClass} mt-1`}>Allow users to book directly</p>
                  </div>
                  <Switch
                    checked={config.enableBooking}
                    onCheckedChange={(checked) => setConfig({ ...config, enableBooking: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-gray-700 dark:text-gray-300">Show Gallery</Label>
                    <p className={`text-xs ${mutedTextClass} mt-1`}>Display photo gallery</p>
                  </div>
                  <Switch
                    checked={config.enableGallery}
                    onCheckedChange={(checked) => setConfig({ ...config, enableGallery: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-gray-700 dark:text-gray-300">Show Reviews</Label>
                    <p className={`text-xs ${mutedTextClass} mt-1`}>Display customer reviews</p>
                  </div>
                  <Switch
                    checked={config.enableReviews}
                    onCheckedChange={(checked) => setConfig({ ...config, enableReviews: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-gray-700 dark:text-gray-300">Social Media</Label>
                    <p className={`text-xs ${mutedTextClass} mt-1`}>Show social links</p>
                  </div>
                  <Switch
                    checked={config.enableSocial}
                    onCheckedChange={(checked) => setConfig({ ...config, enableSocial: checked })}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Responsive Settings */}
          <Card className={`${bgClass} border ${borderColor}`}>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b" style={{ borderColor: isDark ? '#333' : '#e5e7eb' }}>
                <Smartphone className="w-5 h-5 text-indigo-600" />
                <h3 className={`text-lg ${textClass}`}>Responsive Settings</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300">Responsive Mode</Label>
                  <select
                    value={config.responsiveMode}
                    onChange={(e) => setConfig({ ...config, responsiveMode: e.target.value as any })}
                    className={`w-full h-12 px-3 rounded-lg ${isDark ? 'bg-[#1e1e1e] border-[#333] text-white' : 'bg-gray-100 border-gray-300 text-gray-900'} border`}
                  >
                    <option value="auto">Auto (Responsive to container)</option>
                    <option value="desktop">Desktop Only</option>
                    <option value="mobile">Mobile Only</option>
                  </select>
                  <p className={`text-xs ${mutedTextClass}`}>
                    Auto mode automatically adapts to the container width
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300">Maximum Width (px)</Label>
                  <Input
                    type="number"
                    value={config.maxWidth}
                    onChange={(e) => setConfig({ ...config, maxWidth: e.target.value })}
                    className="h-12 bg-gray-100 dark:bg-[#1e1e1e] border-gray-300 dark:border-[#333]"
                    placeholder="1200"
                  />
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Embed Code Tab */}
        <TabsContent value="code" className="space-y-6 mt-6">
          <div className={`${isDark ? 'bg-blue-950/30 border-blue-800' : 'bg-blue-50 border-blue-200'} border rounded-lg p-4`}>
            <div className="flex items-start gap-3">
              <AlertCircle className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'} flex-shrink-0 mt-0.5`} />
              <div>
                <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-900'} mb-2`}>
                  Choose your integration method below. We recommend the JavaScript SDK for the best experience.
                </p>
                <ul className={`text-xs ${isDark ? 'text-blue-300' : 'text-blue-800'} space-y-1`}>
                  <li>• SDK: Best performance, automatic updates, event handling</li>
                  <li>• iFrame: Simple, works everywhere, no dependencies</li>
                  <li>• React: Type-safe, component-based integration</li>
                </ul>
              </div>
            </div>
          </div>

          <Tabs defaultValue="sdk" className="w-full">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="sdk">JavaScript SDK</TabsTrigger>
              <TabsTrigger value="iframe">iFrame</TabsTrigger>
              <TabsTrigger value="react">React</TabsTrigger>
              <TabsTrigger value="wordpress">WordPress</TabsTrigger>
            </TabsList>

            {/* SDK Code */}
            <TabsContent value="sdk" className="mt-4">
              <Card className={`${bgClass} border ${borderColor}`}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`${textClass} font-medium`}>JavaScript SDK (Recommended)</h3>
                    <Button
                      size="sm"
                      onClick={() => handleCopy(generateSDKCode())}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                      {copied ? 'Copied!' : 'Copy Code'}
                    </Button>
                  </div>
                  <div className={`${codeBgClass} rounded-lg p-4 overflow-x-auto`}>
                    <pre className="text-xs text-green-400">
                      <code>{generateSDKCode()}</code>
                    </pre>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* iFrame Code */}
            <TabsContent value="iframe" className="mt-4">
              <Card className={`${bgClass} border ${borderColor}`}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`${textClass} font-medium`}>Basic iFrame Embed</h3>
                    <Button
                      size="sm"
                      onClick={() => handleCopy(generateIframeCode())}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                      {copied ? 'Copied!' : 'Copy Code'}
                    </Button>
                  </div>
                  <div className={`${codeBgClass} rounded-lg p-4 overflow-x-auto`}>
                    <pre className="text-xs text-green-400">
                      <code>{generateIframeCode()}</code>
                    </pre>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* React Code */}
            <TabsContent value="react" className="mt-4">
              <Card className={`${bgClass} border ${borderColor}`}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`${textClass} font-medium`}>React Component</h3>
                    <Button
                      size="sm"
                      onClick={() => handleCopy(generateReactCode())}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                      {copied ? 'Copied!' : 'Copy Code'}
                    </Button>
                  </div>
                  <div className={`${codeBgClass} rounded-lg p-4 overflow-x-auto`}>
                    <pre className="text-xs text-green-400">
                      <code>{generateReactCode()}</code>
                    </pre>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* WordPress Code */}
            <TabsContent value="wordpress" className="mt-4">
              <Card className={`${bgClass} border ${borderColor}`}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`${textClass} font-medium`}>WordPress Shortcode</h3>
                    <Button
                      size="sm"
                      onClick={() => handleCopy(generateWordPressCode())}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                      {copied ? 'Copied!' : 'Copy Code'}
                    </Button>
                  </div>
                  <div className={`${codeBgClass} rounded-lg p-4 overflow-x-auto`}>
                    <pre className="text-xs text-green-400">
                      <code>{generateWordPressCode()}</code>
                    </pre>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Direct URL */}
          <Card className={`${bgClass} border ${borderColor}`}>
            <div className="p-6">
              <h3 className={`${textClass} font-medium mb-4`}>Direct Embed URL</h3>
              <div className="flex gap-2">
                <Input
                  value={generateEmbedUrl()}
                  readOnly
                  className="h-12 bg-gray-100 dark:bg-[#1e1e1e] border-gray-300 dark:border-[#333] font-mono text-xs"
                />
                <Button
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(generateEmbedUrl());
                    toast.success('URL copied!');
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={() => window.open(generateEmbedUrl(), '_blank')}
                  className="bg-gray-600 hover:bg-gray-700 text-white"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6 mt-6">
          <Card className={`${bgClass} border ${borderColor}`}>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b" style={{ borderColor: isDark ? '#333' : '#e5e7eb' }}>
                <Shield className="w-5 h-5 text-indigo-600" />
                <h3 className={`text-lg ${textClass}`}>Domain Whitelist</h3>
              </div>

              <div className="space-y-4">
                <p className={`text-sm ${mutedTextClass}`}>
                  Restrict where your profile can be embedded. Use * to allow all domains (not recommended for production).
                </p>

                {/* Add Domain */}
                <div className="flex gap-2">
                  <Input
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    placeholder="example.com"
                    className="h-12 bg-gray-100 dark:bg-[#1e1e1e] border-gray-300 dark:border-[#333]"
                    onKeyPress={(e) => e.key === 'Enter' && addDomain()}
                  />
                  <Button
                    onClick={addDomain}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Domain
                  </Button>
                </div>

                {/* Domain List */}
                <div className="space-y-2">
                  {config.allowedDomains.map((domain) => (
                    <div
                      key={domain}
                      className={`flex items-center justify-between p-3 rounded-lg ${cardBgClass} border ${borderColor}`}
                    >
                      <span className={`text-sm ${textClass} font-mono`}>{domain}</span>
                      {domain !== '*' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeDomain(domain)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* HTTPS Setting */}
              <div className="pt-4 border-t" style={{ borderColor: isDark ? '#333' : '#e5e7eb' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-gray-700 dark:text-gray-300">Require HTTPS</Label>
                    <p className={`text-xs ${mutedTextClass} mt-1`}>
                      Only allow embedding on secure (HTTPS) websites
                    </p>
                  </div>
                  <Switch
                    checked={config.requireHttps}
                    onCheckedChange={(checked) => setConfig({ ...config, requireHttps: checked })}
                  />
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-6 mt-6">
          {/* Device Selector */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={previewDevice === 'desktop' ? 'default' : 'outline'}
              onClick={() => setPreviewDevice('desktop')}
              className="flex items-center gap-2"
            >
              <Monitor className="w-4 h-4" />
              Desktop
            </Button>
            <Button
              size="sm"
              variant={previewDevice === 'tablet' ? 'default' : 'outline'}
              onClick={() => setPreviewDevice('tablet')}
              className="flex items-center gap-2"
            >
              <Tablet className="w-4 h-4" />
              Tablet
            </Button>
            <Button
              size="sm"
              variant={previewDevice === 'mobile' ? 'default' : 'outline'}
              onClick={() => setPreviewDevice('mobile')}
              className="flex items-center gap-2"
            >
              <Smartphone className="w-4 h-4" />
              Mobile
            </Button>
          </div>

          {/* Preview Frame */}
          <Card className={`${bgClass} border ${borderColor}`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`${textClass} font-medium`}>Live Preview</h3>
                <span className={`text-xs ${mutedTextClass}`}>
                  {previewDevice === 'desktop' && 'Desktop View'}
                  {previewDevice === 'tablet' && 'Tablet View (768px)'}
                  {previewDevice === 'mobile' && 'Mobile View (375px)'}
                </span>
              </div>
              
              <div className="flex justify-center bg-gray-100 dark:bg-[#0a0a0a] rounded-lg p-8 min-h-[600px]">
                <div style={{ width: getDeviceWidth(), maxWidth: '100%' }}>
                  <iframe
                    src={generateEmbedUrl()}
                    className="w-full rounded-lg border border-gray-300 dark:border-[#333]"
                    style={{
                      height: `${config.minHeight}px`,
                      borderRadius: `${config.borderRadius}px`,
                    }}
                    title="Preview"
                  />
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3">
        <Button
          variant="outline"
          className={`${isDark ? 'border-[#333] hover:bg-[#1e1e1e]' : 'border-gray-300 hover:bg-gray-50'}`}
        >
          Reset to Defaults
        </Button>
        <Button
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
          onClick={() => {
            // Save configuration to localStorage or API
            localStorage.setItem(`embed-config-${owner.profileSlug}`, JSON.stringify(config));
            toast.success('Embed settings saved successfully!');
          }}
        >
          Save Settings
        </Button>
      </div>
    </div>
  );
};
