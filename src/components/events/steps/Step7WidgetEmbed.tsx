import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Button } from '../../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Textarea } from '../../ui/textarea';
import { Copy, Check, ExternalLink, Code } from 'lucide-react';
import { StepProps, EmbedContext } from '../types';
import { WIDGET_OPTIONS } from '../constants';

export default function Step7WidgetEmbed({ gameData, updateGameData, t }: StepProps) {
    const [copied, setCopied] = useState(false);
    const [embedContext, setEmbedContext] = useState<EmbedContext>({
        embedKey: 'demo-key-123',
        primaryColor: '#3b82f6',
        venueName: 'My Venue',
        baseUrl: 'https://booking.example.com',
    });

    const generateEmbedCode = () => {
        const widgetType = gameData.selectedWidget || 'calendar-single';
        return `<!-- ${t.singular} Booking Widget -->
<div id="booking-widget-${widgetType}" 
     data-key="${embedContext.embedKey}"
     data-service="${gameData.name.toLowerCase().replace(/\s+/g, '-')}"
     data-theme="${embedContext.primaryColor}">
</div>
<script src="${embedContext.baseUrl}/widgets/${widgetType}.js" async></script>`;
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generateEmbedCode());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Widget & Embed Settings</CardTitle>
                    <CardDescription>
                        Customize how your {t.singular.toLowerCase()} appears on your website
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Widget Selection */}
                    <div>
                        <Label className="mb-3 block">Select Widget Style</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {WIDGET_OPTIONS.map((widget) => {
                                const Icon = widget.icon;
                                return (
                                    <div
                                        key={widget.id}
                                        className={`
                      relative flex items-start space-x-4 p-4 rounded-lg border-2 cursor-pointer transition-all
                      ${gameData.selectedWidget === widget.id
                                                ? 'border-blue-600 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }
                    `}
                                        onClick={() => updateGameData('selectedWidget', widget.id)}
                                    >
                                        <div
                                            className={`p-2 rounded-lg ${gameData.selectedWidget === widget.id
                                                    ? 'bg-blue-100 text-blue-600'
                                                    : 'bg-gray-100 text-gray-500'
                                                }`}
                                        >
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900">{widget.name}</h4>
                                            <p className="text-sm text-gray-500 mt-1">{widget.description}</p>
                                        </div>
                                        {gameData.selectedWidget === widget.id && (
                                            <div className="absolute top-4 right-4">
                                                <div className="bg-blue-600 rounded-full p-1">
                                                    <Check className="w-3 h-3 text-white" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Customization & Embed Code */}
                    <div className="border-t pt-6">
                        <Tabs defaultValue="customize" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-4">
                                <TabsTrigger value="customize">Customize Appearance</TabsTrigger>
                                <TabsTrigger value="code">Get Embed Code</TabsTrigger>
                            </TabsList>

                            <TabsContent value="customize" className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Primary Color</Label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Input
                                                type="color"
                                                value={embedContext.primaryColor}
                                                onChange={(e) =>
                                                    setEmbedContext({ ...embedContext, primaryColor: e.target.value })
                                                }
                                                className="w-12 h-10 p-1 cursor-pointer"
                                            />
                                            <Input
                                                value={embedContext.primaryColor}
                                                onChange={(e) =>
                                                    setEmbedContext({ ...embedContext, primaryColor: e.target.value })
                                                }
                                                className="flex-1"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Theme Mode</Label>
                                        <Select defaultValue="light">
                                            <SelectTrigger className="mt-1">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="light">Light Mode</SelectItem>
                                                <SelectItem value="dark">Dark Mode</SelectItem>
                                                <SelectItem value="auto">System Auto</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
                                    <Label className="mb-2 block text-gray-500 text-xs uppercase tracking-wider">
                                        Preview
                                    </Label>
                                    <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div
                                                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                                                style={{ backgroundColor: embedContext.primaryColor }}
                                            >
                                                {gameData.name.charAt(0) || 'G'}
                                            </div>
                                            <div>
                                                <div className="h-4 w-32 bg-gray-200 rounded mb-1"></div>
                                                <div className="h-3 w-20 bg-gray-100 rounded"></div>
                                            </div>
                                        </div>
                                        <div
                                            className="h-8 w-full rounded text-white text-sm font-medium flex items-center justify-center"
                                            style={{ backgroundColor: embedContext.primaryColor }}
                                        >
                                            Book Now
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="code" className="space-y-4">
                                <div className="relative">
                                    <Textarea
                                        value={generateEmbedCode()}
                                        readOnly
                                        className="font-mono text-xs bg-gray-900 text-gray-100 h-32 p-4 resize-none"
                                    />
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="absolute top-2 right-2 h-7 text-xs"
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
                                <div className="flex items-start gap-2 text-sm text-gray-500 bg-blue-50 p-3 rounded text-blue-700">
                                    <Code className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <p>
                                        Paste this code into your website's HTML where you want the booking widget to
                                        appear. It works with WordPress, Wix, Squarespace, and custom sites.
                                    </p>
                                </div>
                                <div className="flex justify-end">
                                    <Button variant="outline" size="sm" className="text-xs">
                                        <ExternalLink className="w-3 h-3 mr-1" /> Developer Documentation
                                    </Button>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
