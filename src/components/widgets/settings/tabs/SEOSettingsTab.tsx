import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../ui/card';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Textarea } from '../../../ui/textarea';
import { Switch } from '../../../ui/switch';
import { Separator } from '../../../ui/separator';
import { SEOPreview } from '../../SEOPreview';
import { z } from 'zod';
import { AlertCircle } from 'lucide-react';

interface SEOSettingsTabProps {
    config: any;
    onConfigChange: (config: any) => void;
}

// Zod Schemas
const seoSchema = z.object({
    emailAddress: z.string().email().optional().or(z.literal('')),
    phoneNumber: z.string().regex(/^\+?[\d\s-()]+$/, 'Invalid phone number format').optional().or(z.literal('')),
    facebookUrl: z.string().url().optional().or(z.literal('')),
    instagramUrl: z.string().url().optional().or(z.literal('')),
    twitterUrl: z.string().url().optional().or(z.literal('')),
    tripadvisorUrl: z.string().url().optional().or(z.literal('')),
    seoTitle: z.string().max(60, 'Title should be under 60 characters').optional(),
    metaDescription: z.string().max(160, 'Description should be under 160 characters').optional(),
});

export const SEOSettingsTab: React.FC<SEOSettingsTabProps> = ({ config, onConfigChange }) => {
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateField = (field: string, value: string) => {
        try {
            // Create a partial schema for the single field
            const fieldSchema = seoSchema.pick({ [field]: true } as any);
            fieldSchema.parse({ [field]: value });

            // Clear error if valid
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                setErrors(prev => ({
                    ...prev,
                    [field]: error.errors[0].message
                }));
            }
        }
    };

    const handleSEOChange = (key: string, value: any) => {
        // Validate immediately
        validateField(key, value);

        onConfigChange({
            ...config,
            [key]: value
        });
    };

    return (
        <div className="space-y-6 pb-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column: Settings */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>SEO Optimization</CardTitle>
                            <CardDescription>Improve your visibility in search engines</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="seo-title">SEO Title</Label>
                                <Input
                                    id="seo-title"
                                    value={config.seoTitle || ''}
                                    onChange={(e) => handleSEOChange('seoTitle', e.target.value)}
                                    placeholder="Page title for search engines"
                                />
                                {errors.seoTitle && <p className="text-xs text-red-500">{errors.seoTitle}</p>}
                                <p className="text-xs text-gray-500 text-right">
                                    {(config.seoTitle || '').length}/60 characters
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="business-name">Business Name</Label>
                                <Input
                                    id="business-name"
                                    value={config.businessName || ''}
                                    onChange={(e) => handleSEOChange('businessName', e.target.value)}
                                    placeholder="Official business name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="meta-description">Meta Description</Label>
                                <Textarea
                                    id="meta-description"
                                    value={config.metaDescription || ''}
                                    onChange={(e) => handleSEOChange('metaDescription', e.target.value)}
                                    placeholder="Brief description appearing in search results"
                                    rows={3}
                                />
                                {errors.metaDescription && <p className="text-xs text-red-500">{errors.metaDescription}</p>}
                                <p className="text-xs text-gray-500 text-right">
                                    {(config.metaDescription || '').length}/160 characters
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="seo-keywords">Keywords</Label>
                                <Input
                                    id="seo-keywords"
                                    value={config.seoKeywords || ''}
                                    onChange={(e) => handleSEOChange('seoKeywords', e.target.value)}
                                    placeholder="escape room, fun activities, team building (comma separated)"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Social Profiles</CardTitle>
                            <CardDescription>Link your social media accounts</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="facebook-url">Facebook URL</Label>
                                <Input
                                    id="facebook-url"
                                    value={config.facebookUrl || ''}
                                    onChange={(e) => handleSEOChange('facebookUrl', e.target.value)}
                                    placeholder="https://facebook.com/yourpage"
                                    className={errors.facebookUrl ? 'border-red-500' : ''}
                                />
                                {errors.facebookUrl && (
                                    <div className="flex items-center gap-1 text-xs text-red-500">
                                        <AlertCircle className="w-3 h-3" />
                                        {errors.facebookUrl}
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="instagram-url">Instagram URL</Label>
                                <Input
                                    id="instagram-url"
                                    value={config.instagramUrl || ''}
                                    onChange={(e) => handleSEOChange('instagramUrl', e.target.value)}
                                    placeholder="https://instagram.com/yourprofile"
                                    className={errors.instagramUrl ? 'border-red-500' : ''}
                                />
                                {errors.instagramUrl && <p className="text-xs text-red-500">{errors.instagramUrl}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="twitter-url">X / Twitter URL</Label>
                                <Input
                                    id="twitter-url"
                                    value={config.twitterUrl || ''}
                                    onChange={(e) => handleSEOChange('twitterUrl', e.target.value)}
                                    placeholder="https://twitter.com/yourhandle"
                                    className={errors.twitterUrl ? 'border-red-500' : ''}
                                />
                                {errors.twitterUrl && <p className="text-xs text-red-500">{errors.twitterUrl}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tripadvisor-url">Tripadvisor URL</Label>
                                <Input
                                    id="tripadvisor-url"
                                    value={config.tripadvisorUrl || ''}
                                    onChange={(e) => handleSEOChange('tripadvisorUrl', e.target.value)}
                                    placeholder="https://tripadvisor.com/..."
                                    className={errors.tripadvisorUrl ? 'border-red-500' : ''}
                                />
                                {errors.tripadvisorUrl && <p className="text-xs text-red-500">{errors.tripadvisorUrl}</p>}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Preview & Location */}
                <div className="space-y-6">
                    {/* SEO Preview Component */}
                    <SEOPreview
                        title={config.seoTitle || config.widgetTitle}
                        description={config.metaDescription || config.widgetDescription}
                        url={config.website || 'https://yourwebsite.com'}
                    />

                    <Card>
                        <CardHeader>
                            <CardTitle>Location & Contact</CardTitle>
                            <CardDescription>Helps with local SEO and schema markup</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Enable LocalBusiness Schema</Label>
                                    <p className="text-sm text-gray-500">Add structured data for search engines</p>
                                </div>
                                <Switch
                                    checked={config.enableLocalSchema}
                                    onCheckedChange={(checked) => handleSEOChange('enableLocalSchema', checked)}
                                />
                            </div>
                            <Separator />
                            <div className="space-y-2">
                                <Label htmlFor="street-address">Street Address</Label>
                                <Input
                                    id="street-address"
                                    value={config.streetAddress || ''}
                                    onChange={(e) => handleSEOChange('streetAddress', e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="city">City</Label>
                                    <Input
                                        id="city"
                                        value={config.city || ''}
                                        onChange={(e) => handleSEOChange('city', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="state">State</Label>
                                    <Input
                                        id="state"
                                        value={config.state || ''}
                                        onChange={(e) => handleSEOChange('state', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="zip">ZIP / Postal Code</Label>
                                    <Input
                                        id="zip"
                                        value={config.zip || ''}
                                        onChange={(e) => handleSEOChange('zip', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="country">Country</Label>
                                    <Input
                                        id="country"
                                        value={config.country || ''}
                                        onChange={(e) => handleSEOChange('country', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone-number">Phone Number</Label>
                                <Input
                                    id="phone-number"
                                    value={config.phoneNumber || ''}
                                    onChange={(e) => handleSEOChange('phoneNumber', e.target.value)}
                                    className={errors.phoneNumber ? 'border-red-500' : ''}
                                />
                                {errors.phoneNumber && <p className="text-xs text-red-500">{errors.phoneNumber}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email-address">Email Address</Label>
                                <Input
                                    id="email-address"
                                    value={config.emailAddress || ''}
                                    onChange={(e) => handleSEOChange('emailAddress', e.target.value)}
                                    className={errors.emailAddress ? 'border-red-500' : ''}
                                />
                                {errors.emailAddress && <p className="text-xs text-red-500">{errors.emailAddress}</p>}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
