import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Textarea } from '../../ui/textarea';
import { Copy, Check, ExternalLink, Code, Calendar, Eye, Globe } from 'lucide-react';
import { StepProps, EmbedContext } from '../types';
// Lazy load preview to avoid blocking main thread
const SimpleActivityPreview = lazy(() => import('../../widgets/SimpleActivityPreview'));
import { Badge } from '../../ui/badge';

export default function Step7WidgetEmbed({ activityData, updateActivityData, t }: StepProps) {
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<'preview' | 'code'>('code'); // Default to code tab to avoid loading preview immediately
    const [embedContext, setEmbedContext] = useState<EmbedContext>({
        embedKey: 'YOUR_EMBED_KEY', // Placeholder until saved
        primaryColor: '#2563eb',
        venueName: 'My Venue',
        baseUrl: window.location.origin,
    });

    // Default to calendar-single widget
    useEffect(() => {
        if (activityData.selectedWidget !== 'calendar-single') {
            updateActivityData('selectedWidget', 'calendar-single');
        }
    }, []);

    const generateEmbedCode = () => {
        const widgetType = 'singlegame'; // Matches Embed.tsx routing
        const embedUrl = `${embedContext.baseUrl}/embed?widget=${widgetType}&key=${embedContext.embedKey}`;

        return `<!-- ${t.singular} Booking Widget -->
<iframe 
  src="${embedUrl}" 
  width="100%" 
  height="700" 
  frameborder="0" 
  style="border:none; max-width:100%; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
</iframe>
<script>
  window.addEventListener('message', function(e) {
    if (e.data.type === 'resize-iframe') {
      const iframe = document.querySelector('iframe[src*="${embedUrl}"]');
      if (iframe) iframe.style.height = e.data.height + 'px';
    }
  });
</script>`;
    };

    const generatePreviewUrl = () => {
        const params = new URLSearchParams({
            widget: 'singlegame',
            gameName: activityData.name,
            gameDescription: activityData.description,
            gamePrice: activityData.adultPrice?.toString() || '0',
            color: (embedContext.primaryColor || '#2563eb').replace('#', ''),
            theme: 'light' // Default to light for now
        });
        return `${embedContext.baseUrl}/embed?${params.toString()}`;
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generateEmbedCode());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-6">
            <Card className="border-blue-100 shadow-md">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl border-b border-blue-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-lg shadow-sm">
                            <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-xl text-blue-900">Booking Widget & Embed</CardTitle>
                            <CardDescription className="text-blue-700">
                                Preview and configure your booking page
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-8">

                    {/* Selected Widget Info */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-start gap-4 shadow-sm">
                        <div className="p-3 bg-blue-50 rounded-full">
                            <Calendar className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                Calendar Single Event Widget
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">Active</Badge>
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                A dedicated booking page for <strong>{activityData.name || 'your event'}</strong>.
                                Optimized for conversion with a clean calendar view and integrated checkout.
                            </p>
                        </div>
                    </div>

                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'preview' | 'code')} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6 p-1 bg-gray-100 rounded-lg">
                            <TabsTrigger value="code" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md py-2">
                                <Code className="w-4 h-4 mr-2" />
                                Get Embed Code
                            </TabsTrigger>
                            <TabsTrigger value="preview" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md py-2">
                                <Eye className="w-4 h-4 mr-2" />
                                Live Preview
                            </TabsTrigger>
                        </TabsList>

                        {/* Live Preview Tab - Only render when active */}
                        <TabsContent value="preview" className="space-y-4 animate-in fade-in-50 duration-300">
                            {activeTab === 'preview' && (
                                <>
                                    <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center justify-between mb-4">
                                        <div className="space-y-1">
                                            <Label className="text-sm font-medium text-gray-700">Primary Brand Color</Label>
                                            <div className="flex items-center gap-2">
                                                <div className="relative">
                                                    <Input
                                                        type="color"
                                                        value={embedContext.primaryColor}
                                                        onChange={(e) =>
                                                            setEmbedContext({ ...embedContext, primaryColor: e.target.value })
                                                        }
                                                        className="w-10 h-10 p-1 cursor-pointer rounded-lg border-gray-300"
                                                    />
                                                </div>
                                                <Input
                                                    value={embedContext.primaryColor}
                                                    onChange={(e) =>
                                                        setEmbedContext({ ...embedContext, primaryColor: e.target.value })
                                                    }
                                                    className="w-28 font-mono text-sm uppercase"
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            onClick={() => window.open(generatePreviewUrl(), '_blank')}
                                            className="w-full sm:w-auto border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
                                        >
                                            <ExternalLink className="w-4 h-4 mr-2" />
                                            Open Full Page Preview
                                        </Button>
                                    </div>

                                    <div className="border rounded-xl overflow-hidden shadow-lg bg-gray-50 relative">
                                        <div className="absolute top-0 left-0 right-0 h-8 bg-gray-100 border-b flex items-center px-4 gap-2 z-10">
                                            <div className="flex gap-1.5">
                                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                            </div>
                                            <div className="flex-1 text-center text-xs text-gray-500 font-mono bg-white mx-4 rounded px-2 py-0.5 truncate">
                                                {generatePreviewUrl()}
                                            </div>
                                        </div>
                                        <div className="h-[600px] overflow-y-auto pt-10 bg-gray-50 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                                            <Suspense fallback={
                                                <div className="flex items-center justify-center h-full">
                                                    <div className="text-center">
                                                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                                                        <p className="text-sm text-gray-600">Loading preview...</p>
                                                    </div>
                                                </div>
                                            }>
                                                <SimpleActivityPreview
                                                    activityName={activityData.name || 'Your Activity'}
                                                    activityDescription={activityData.description}
                                                    price={activityData.adultPrice || 30}
                                                    duration={activityData.duration || 60}
                                                    minPlayers={activityData.minAdults || 2}
                                                    maxPlayers={activityData.maxAdults || 8}
                                                    primaryColor={embedContext.primaryColor}
                                                    coverImage={activityData.coverImage}
                                                />
                                            </Suspense>
                                        </div>
                                    </div>
                                </>
                            )}
                        </TabsContent>

                        {/* Embed Code Tab */}
                        <TabsContent value="code" className="space-y-6 animate-in fade-in-50 duration-300">
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3">
                                <Globe className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <h4 className="font-medium text-blue-900">Ready to Integrate</h4>
                                    <p className="text-sm text-blue-700">
                                        Copy the code below and paste it into your website's HTML. It works with WordPress, Wix, Squarespace, and custom sites.
                                    </p>
                                </div>
                            </div>

                            <div className="relative group">
                                <div className="absolute top-0 right-0 p-2 z-10">
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="h-8 text-xs bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm"
                                        onClick={copyToClipboard}
                                    >
                                        {copied ? (
                                            <>
                                                <Check className="w-3 h-3 mr-1" /> Copied
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-3 h-3 mr-1" /> Copy Code
                                            </>
                                        )}
                                    </Button>
                                </div>
                                <Textarea
                                    value={generateEmbedCode()}
                                    readOnly
                                    className="font-mono text-xs bg-[#1e1e1e] text-gray-300 h-64 p-4 resize-none rounded-lg border-gray-700 focus:ring-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 border rounded-lg bg-gray-50">
                                    <h5 className="font-medium text-gray-900 mb-1">Responsive Design</h5>
                                    <p className="text-xs text-gray-500">Automatically adjusts to fit mobile, tablet, and desktop screens.</p>
                                </div>
                                <div className="p-4 border rounded-lg bg-gray-50">
                                    <h5 className="font-medium text-gray-900 mb-1">Secure Checkout</h5>
                                    <p className="text-xs text-gray-500">Integrated Stripe payments with SSL encryption.</p>
                                </div>
                                <div className="p-4 border rounded-lg bg-gray-50">
                                    <h5 className="font-medium text-gray-900 mb-1">Real-time Sync</h5>
                                    <p className="text-xs text-gray-500">Availability updates instantly to prevent double bookings.</p>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
