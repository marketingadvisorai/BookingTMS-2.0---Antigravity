import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { 
  TrendingUp,
  TrendingDown,
  DollarSign,
  MousePointerClick,
  Eye,
  Target,
  BarChart3,
  CheckCircle2,
  Facebook,
  Globe,
  Megaphone,
  LineChart,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../components/layout/ThemeContext';

// Google Ads Icon Component
function GoogleAdsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12.007,2.5c-4.687,0-8.5,3.813-8.5,8.5s3.813,8.5,8.5,8.5s8.5-3.813,8.5-8.5S16.694,2.5,12.007,2.5z M13.007,14.962 V9.038l4.962,2.962L13.007,14.962z"/>
    </svg>
  );
}

export function Campaigns() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Semantic class variables
  const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const bgElevatedClass = isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50';
  const hoverBgClass = isDark ? 'hover:bg-[#1e1e1e]' : 'hover:bg-gray-50';
  
  const [googleAdsConnected, setGoogleAdsConnected] = useState(false);
  const [facebookAdsConnected, setFacebookAdsConnected] = useState(false);
  const [googleAnalyticsConnected, setGoogleAnalyticsConnected] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleSaveSettings = () => {
    toast.success('Campaign settings saved successfully!');
  };

  const handleConnectGoogleAds = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setGoogleAdsConnected(true);
      setIsConnecting(false);
      toast.success('Google Ads connected successfully!');
    }, 1500);
  };

  const handleDisconnectGoogleAds = () => {
    setGoogleAdsConnected(false);
    toast.success('Google Ads disconnected');
  };

  const handleConnectFacebookAds = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setFacebookAdsConnected(true);
      setIsConnecting(false);
      toast.success('Facebook Ads connected successfully!');
    }, 1500);
  };

  const handleDisconnectFacebookAds = () => {
    setFacebookAdsConnected(false);
    toast.success('Facebook Ads disconnected');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className={`mb-2 ${textClass}`}>Ad Campaigns</h1>
        <p className={textMutedClass}>Track and manage your advertising campaigns and analytics</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className={`${isDark ? 'bg-[#161616] border border-[#2a2a2a]' : ''} w-full justify-start overflow-x-auto flex-wrap h-auto`}>
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="platforms" className="gap-2">
            <Megaphone className="w-4 h-4" />
            Ad Platforms
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <LineChart className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Overview Dashboard */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm mb-1 ${textMutedClass}`}>Total Spend</p>
                    <h3 className={`text-2xl ${textClass}`}>$4,567</h3>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-green-600'}`} />
                      <span className={`text-sm ${isDark ? 'text-emerald-400' : 'text-green-600'}`}>+12.5%</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-[#4f46e5]/20' : 'bg-blue-100'}`}>
                    <DollarSign className={`w-6 h-6 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm mb-1 ${textMutedClass}`}>Impressions</p>
                    <h3 className={`text-2xl ${textClass}`}>124.5K</h3>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-green-600'}`} />
                      <span className={`text-sm ${isDark ? 'text-emerald-400' : 'text-green-600'}`}>+8.2%</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                    <Eye className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm mb-1 ${textMutedClass}`}>Clicks</p>
                    <h3 className={`text-2xl ${textClass}`}>3,241</h3>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingDown className={`w-4 h-4 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                      <span className={`text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>-3.1%</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-emerald-500/20' : 'bg-green-100'}`}>
                    <MousePointerClick className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-green-600'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm mb-1 ${textMutedClass}`}>Conversions</p>
                    <h3 className={`text-2xl ${textClass}`}>187</h3>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-green-600'}`} />
                      <span className={`text-sm ${isDark ? 'text-emerald-400' : 'text-green-600'}`}>+15.3%</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-amber-500/20' : 'bg-yellow-100'}`}>
                    <Target className={`w-6 h-6 ${isDark ? 'text-amber-400' : 'text-yellow-600'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Campaign Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
              <CardHeader>
                <CardTitle className={textClass}>Platform Performance</CardTitle>
                <p className={`text-sm ${textMutedClass}`}>Last 30 days</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Google Ads */}
                <div className={`flex items-center justify-between p-4 rounded-lg ${bgElevatedClass}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-[#4f46e5]/20' : 'bg-blue-100'}`}>
                      <GoogleAdsIcon className={`w-5 h-5 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
                    </div>
                    <div>
                      <p className={`text-sm ${textClass}`}>Google Ads</p>
                      <p className={`text-xs ${textMutedClass}`}>$2,340 spend</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm ${textClass}`}>89 conversions</p>
                    <p className={`text-xs ${isDark ? 'text-emerald-400' : 'text-green-600'}`}>+18% ROI</p>
                  </div>
                </div>

                {/* Facebook Ads */}
                <div className={`flex items-center justify-between p-4 rounded-lg ${bgElevatedClass}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-[#4f46e5]/20' : 'bg-blue-100'}`}>
                      <Facebook className={`w-5 h-5 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
                    </div>
                    <div>
                      <p className={`text-sm ${textClass}`}>Facebook Ads</p>
                      <p className={`text-xs ${textMutedClass}`}>$1,567 spend</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm ${textClass}`}>62 conversions</p>
                    <p className={`text-xs ${isDark ? 'text-emerald-400' : 'text-green-600'}`}>+14% ROI</p>
                  </div>
                </div>

                {/* Other Platforms */}
                <div className={`flex items-center justify-between p-4 rounded-lg ${bgElevatedClass}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                      <Globe className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                    </div>
                    <div>
                      <p className={`text-sm ${textClass}`}>Other Platforms</p>
                      <p className={`text-xs ${textMutedClass}`}>$660 spend</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm ${textClass}`}>36 conversions</p>
                    <p className={`text-xs ${isDark ? 'text-emerald-400' : 'text-green-600'}`}>+12% ROI</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
              <CardHeader>
                <CardTitle className={textClass}>Conversion Funnel</CardTitle>
                <p className={`text-sm ${textMutedClass}`}>Customer journey metrics</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${textMutedClass}`}>Visitors</span>
                    <span className={`text-sm ${textClass}`}>12,456</span>
                  </div>
                  <div className={`w-full rounded-full h-2 ${isDark ? 'bg-[#2a2a2a]' : 'bg-gray-200'}`}>
                    <div className={`h-2 rounded-full ${isDark ? 'bg-[#4f46e5]' : 'bg-blue-600'}`} style={{ width: '100%' }}></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${textMutedClass}`}>Add to Cart</span>
                    <span className={`text-sm ${textClass}`}>1,247</span>
                  </div>
                  <div className={`w-full rounded-full h-2 ${isDark ? 'bg-[#2a2a2a]' : 'bg-gray-200'}`}>
                    <div className={`h-2 rounded-full ${isDark ? 'bg-[#4f46e5]' : 'bg-blue-600'}`} style={{ width: '75%' }}></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${textMutedClass}`}>Checkout</span>
                    <span className={`text-sm ${textClass}`}>623</span>
                  </div>
                  <div className={`w-full rounded-full h-2 ${isDark ? 'bg-[#2a2a2a]' : 'bg-gray-200'}`}>
                    <div className={`h-2 rounded-full ${isDark ? 'bg-[#4f46e5]' : 'bg-blue-600'}`} style={{ width: '50%' }}></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${textMutedClass}`}>Purchase</span>
                    <span className={`text-sm ${textClass}`}>187</span>
                  </div>
                  <div className={`w-full rounded-full h-2 ${isDark ? 'bg-[#2a2a2a]' : 'bg-gray-200'}`}>
                    <div className={`h-2 rounded-full ${isDark ? 'bg-emerald-500' : 'bg-green-600'}`} style={{ width: '25%' }}></div>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className={`flex items-center justify-between p-3 rounded-lg ${
                  isDark ? 'bg-emerald-500/10' : 'bg-green-50'
                }`}>
                  <span className={`text-sm ${isDark ? 'text-emerald-400' : 'text-green-900'}`}>Conversion Rate</span>
                  <span className={`text-lg ${isDark ? 'text-emerald-400' : 'text-green-900'}`}>1.50%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Ad Platforms */}
        <TabsContent value="platforms" className="space-y-6">
          {/* Google Ads */}
          <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-[#4f46e5]/20' : 'bg-blue-100'}`}>
                    <GoogleAdsIcon className={`w-5 h-5 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
                  </div>
                  <div>
                    <CardTitle className={textClass}>Google Ads</CardTitle>
                    <p className={`text-sm ${textMutedClass}`}>Manage Google advertising campaigns</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {googleAdsConnected && (
                    <Badge variant="secondary" className={isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-green-100 text-green-700'}>
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Connected
                    </Badge>
                  )}
                  {googleAdsConnected ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={isDark ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10' : 'text-red-600 hover:text-red-700 hover:bg-red-50'}
                      onClick={handleDisconnectGoogleAds}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Disconnect
                    </Button>
                  ) : (
                    <Button 
                      size="sm"
                      style={{ backgroundColor: isDark ? '#4f46e5' : undefined }}
                      className={isDark ? 'text-white hover:bg-[#4338ca]' : 'bg-blue-600 hover:bg-blue-700'}
                      onClick={handleConnectGoogleAds}
                      disabled={isConnecting}
                    >
                      {isConnecting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Connect Account
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {!googleAdsConnected && (
                <div className={`p-4 border rounded-lg mb-4 ${
                  isDark ? 'bg-[#4f46e5]/10 border-[#4f46e5]/30' : 'bg-blue-50 border-blue-200'
                }`}>
                  <p className={`text-sm ${isDark ? 'text-[#a3a3a3]' : 'text-gray-700'}`}>
                    You can manually enter your Google Ads details below, or connect your account automatically using the button above.
                  </p>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="googleAdsId" className={textMutedClass}>Google Ads Customer ID</Label>
                  <Input 
                    id="googleAdsId" 
                    placeholder="123-456-7890" 
                    defaultValue={googleAdsConnected ? "123-456-7890" : ""} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="googleConversionId" className={textMutedClass}>Conversion ID</Label>
                  <Input 
                    id="googleConversionId" 
                    placeholder="AW-XXXXXXXXX" 
                    defaultValue={googleAdsConnected ? "AW-987654321" : ""} 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="googleConversionLabel" className={textMutedClass}>Conversion Label</Label>
                <Input 
                  id="googleConversionLabel" 
                  placeholder="Conversion label" 
                  defaultValue={googleAdsConnected ? "abc123def456" : ""} 
                />
              </div>
              <Separator />
              <div className="flex justify-end gap-3">
                <Button variant="outline">Test Connection</Button>
                <Button 
                  style={{ backgroundColor: isDark ? '#4f46e5' : undefined }}
                  className={isDark ? 'text-white hover:bg-[#4338ca]' : 'bg-blue-600 hover:bg-blue-700'} 
                  onClick={handleSaveSettings}
                >
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Facebook Ads */}
          <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-[#4f46e5]/20' : 'bg-blue-100'}`}>
                    <Facebook className={`w-5 h-5 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
                  </div>
                  <div>
                    <CardTitle className={textClass}>Facebook Ads / Meta Pixel</CardTitle>
                    <p className={`text-sm ${textMutedClass}`}>Track Facebook and Instagram campaigns</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {facebookAdsConnected && (
                    <Badge variant="secondary" className={isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-green-100 text-green-700'}>
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Connected
                    </Badge>
                  )}
                  {facebookAdsConnected ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={isDark ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10' : 'text-red-600 hover:text-red-700 hover:bg-red-50'}
                      onClick={handleDisconnectFacebookAds}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Disconnect
                    </Button>
                  ) : (
                    <Button 
                      size="sm"
                      style={{ backgroundColor: isDark ? '#4f46e5' : undefined }}
                      className={isDark ? 'text-white hover:bg-[#4338ca]' : 'bg-blue-600 hover:bg-blue-700'}
                      onClick={handleConnectFacebookAds}
                      disabled={isConnecting}
                    >
                      {isConnecting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Connect Account
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {!facebookAdsConnected && (
                <div className={`p-4 border rounded-lg mb-4 ${
                  isDark ? 'bg-[#4f46e5]/10 border-[#4f46e5]/30' : 'bg-blue-50 border-blue-200'
                }`}>
                  <p className={`text-sm ${isDark ? 'text-[#a3a3a3]' : 'text-gray-700'}`}>
                    You can manually enter your Facebook Ads details below, or connect your account automatically using the button above.
                  </p>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="facebookPixelId" className={textMutedClass}>Facebook Pixel ID</Label>
                  <Input 
                    id="facebookPixelId" 
                    placeholder="123456789012345" 
                    defaultValue={facebookAdsConnected ? "123456789012345" : ""} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebookAccessToken" className={textMutedClass}>Access Token</Label>
                  <Input 
                    id="facebookAccessToken" 
                    type="password" 
                    placeholder="Access token" 
                    defaultValue={facebookAdsConnected ? "••••••••••••" : ""} 
                  />
                </div>
              </div>
              <Separator />
              <div className="flex justify-end gap-3">
                <Button variant="outline">Test Connection</Button>
                <Button 
                  style={{ backgroundColor: isDark ? '#4f46e5' : undefined }}
                  className={isDark ? 'text-white hover:bg-[#4338ca]' : 'bg-blue-600 hover:bg-blue-700'} 
                  onClick={handleSaveSettings}
                >
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Other Platforms */}
          <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                  <Globe className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                </div>
                <div>
                  <CardTitle className={textClass}>Other Advertising Platforms</CardTitle>
                  <p className={`text-sm ${textMutedClass}`}>Additional marketing platforms</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 border rounded-lg ${borderClass}`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className={`text-sm ${textClass}`}>TikTok Ads</p>
                    <Badge variant="secondary" className={isDark ? 'bg-[#2a2a2a] text-[#a3a3a3]' : 'bg-gray-100 text-gray-700'}>Not Connected</Badge>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Connect
                  </Button>
                </div>
                <div className={`p-4 border rounded-lg ${borderClass}`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className={`text-sm ${textClass}`}>LinkedIn Ads</p>
                    <Badge variant="secondary" className={isDark ? 'bg-[#2a2a2a] text-[#a3a3a3]' : 'bg-gray-100 text-gray-700'}>Not Connected</Badge>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Connect
                  </Button>
                </div>
                <div className={`p-4 border rounded-lg ${borderClass}`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className={`text-sm ${textClass}`}>Twitter Ads</p>
                    <Badge variant="secondary" className={isDark ? 'bg-[#2a2a2a] text-[#a3a3a3]' : 'bg-gray-100 text-gray-700'}>Not Connected</Badge>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Connect
                  </Button>
                </div>
                <div className={`p-4 border rounded-lg ${borderClass}`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className={`text-sm ${textClass}`}>Snapchat Ads</p>
                    <Badge variant="secondary" className={isDark ? 'bg-[#2a2a2a] text-[#a3a3a3]' : 'bg-gray-100 text-gray-700'}>Not Connected</Badge>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Connect
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Google Analytics */}
        <TabsContent value="analytics" className="space-y-6">
          <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-orange-500/20' : 'bg-orange-100'}`}>
                    <BarChart3 className={`w-5 h-5 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
                  </div>
                  <div>
                    <CardTitle className={textClass}>Google Analytics 4</CardTitle>
                    <p className={`text-sm ${textMutedClass}`}>Track website traffic and user behavior</p>
                  </div>
                </div>
                <Badge variant="secondary" className={isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-green-100 text-green-700'}>
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Connected
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gaPropertyId" className={textMutedClass}>GA4 Measurement ID</Label>
                  <Input id="gaPropertyId" placeholder="G-XXXXXXXXXX" defaultValue="G-ABC123XYZ" />
                  <p className={`text-xs ${isDark ? 'text-[#737373]' : 'text-gray-600'}`}>Found in Admin → Data Streams</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gaStreamId" className={textMutedClass}>Data Stream ID</Label>
                  <Input id="gaStreamId" placeholder="1234567890" defaultValue="1234567890" />
                </div>
              </div>
              
              <Separator />
              
              <div className="flex justify-end gap-3">
                <Button variant="outline">Test Connection</Button>
                <Button 
                  style={{ backgroundColor: isDark ? '#4f46e5' : undefined }}
                  className={isDark ? 'text-white hover:bg-[#4338ca]' : 'bg-blue-600 hover:bg-blue-700'} 
                  onClick={handleSaveSettings}
                >
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
