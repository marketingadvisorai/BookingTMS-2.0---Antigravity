import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Globe, Facebook, Twitter } from 'lucide-react';

interface SEOPreviewProps {
    title: string;
    description: string;
    url?: string;
    image?: string;
}

export const SEOPreview: React.FC<SEOPreviewProps> = ({ title, description, url = 'https://yourwebsite.com', image }) => {
    const displayTitle = title || 'Your Page Title';
    const displayDesc = description || 'Your page description will appear here. Make it catchy and relevant to your content to improve click-through rates.';

    return (
        <Card className="bg-gray-50 dark:bg-gray-900/50">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Search Result Preview</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="google" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-4">
                        <TabsTrigger value="google" className="flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            <span className="hidden sm:inline">Google</span>
                        </TabsTrigger>
                        <TabsTrigger value="facebook" className="flex items-center gap-2">
                            <Facebook className="w-4 h-4" />
                            <span className="hidden sm:inline">Facebook</span>
                        </TabsTrigger>
                        <TabsTrigger value="twitter" className="flex items-center gap-2">
                            <Twitter className="w-4 h-4" />
                            <span className="hidden sm:inline">Twitter</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Google Preview */}
                    <TabsContent value="google" className="mt-0">
                        <div className="bg-white p-4 rounded-lg shadow-sm border">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs text-gray-500">
                                    Logo
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-800 font-medium">Your Business Name</span>
                                    <span className="text-[10px] text-gray-500">{url}</span>
                                </div>
                            </div>
                            <h3 className="text-xl text-[#1a0dab] hover:underline cursor-pointer truncate font-medium">
                                {displayTitle}
                            </h3>
                            <p className="text-sm text-[#4d5156] line-clamp-2 mt-1">
                                {displayDesc}
                            </p>
                        </div>
                    </TabsContent>

                    {/* Facebook Preview */}
                    <TabsContent value="facebook" className="mt-0">
                        <div className="bg-white rounded-lg shadow-sm border overflow-hidden max-w-md mx-auto">
                            <div className="h-48 bg-gray-100 flex items-center justify-center text-gray-400">
                                {image ? (
                                    <img src={image} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <span>No Image Selected</span>
                                )}
                            </div>
                            <div className="p-3 bg-[#f0f2f5] border-t">
                                <div className="uppercase text-[10px] text-gray-500 font-medium mb-0.5">{new URL(url).hostname}</div>
                                <h3 className="text-base font-bold text-[#050505] leading-tight mb-1 line-clamp-2">
                                    {displayTitle}
                                </h3>
                                <p className="text-sm text-[#65676b] line-clamp-1">
                                    {displayDesc}
                                </p>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Twitter Preview */}
                    <TabsContent value="twitter" className="mt-0">
                        <div className="bg-white rounded-xl shadow-sm border overflow-hidden max-w-md mx-auto">
                            <div className="h-48 bg-gray-100 flex items-center justify-center text-gray-400">
                                {image ? (
                                    <img src={image} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <span>No Image Selected</span>
                                )}
                            </div>
                            <div className="p-3">
                                <h3 className="text-base font-bold text-[#0f1419] mb-0.5 line-clamp-1">
                                    {displayTitle}
                                </h3>
                                <p className="text-sm text-[#536471] line-clamp-2 mb-1">
                                    {displayDesc}
                                </p>
                                <div className="text-sm text-[#536471] flex items-center gap-1">
                                    <Globe className="w-3 h-3" />
                                    {new URL(url).hostname}
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};
