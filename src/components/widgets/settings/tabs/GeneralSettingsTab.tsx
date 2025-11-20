import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../ui/card';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Switch } from '../../../ui/switch';
import { Textarea } from '../../../ui/textarea';
import { Separator } from '../../../ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';

interface GeneralSettingsTabProps {
    config: any;
    onConfigChange: (config: any) => void;
}

export const GeneralSettingsTab: React.FC<GeneralSettingsTabProps> = ({ config, onConfigChange }) => {
    const handleGeneralSettingChange = (key: string, value: any) => {
        onConfigChange({
            ...config,
            [key]: value
        });
    };

    return (
        <div className="space-y-6 pb-24">
            <Card>
                <CardHeader>
                    <CardTitle>Display Options</CardTitle>
                    <CardDescription>Control what elements appear in your widget</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Show Secured Badge</Label>
                            <p className="text-sm text-gray-500">Display security badge in header</p>
                        </div>
                        <Switch
                            checked={config.showSecuredBadge}
                            onCheckedChange={(checked) => handleGeneralSettingChange('showSecuredBadge', checked)}
                        />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Show Health & Safety</Label>
                            <p className="text-sm text-gray-500">Display health and safety badge</p>
                        </div>
                        <Switch
                            checked={config.showHealthSafety}
                            onCheckedChange={(checked) => handleGeneralSettingChange('showHealthSafety', checked)}
                        />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Enable Veteran Discount</Label>
                            <p className="text-sm text-gray-500">Show veteran ticket pricing option</p>
                        </div>
                        <Switch
                            checked={config.enableVeteranDiscount}
                            onCheckedChange={(checked) => handleGeneralSettingChange('enableVeteranDiscount', checked)}
                        />
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Widget Header</CardTitle>
                    <CardDescription>Customize the title and description of your widget</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="widget-title">Widget Title</Label>
                        <Input
                            id="widget-title"
                            value={config.widgetTitle}
                            onChange={(e) => handleGeneralSettingChange('widgetTitle', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="widget-description">Widget Description</Label>
                        <Textarea
                            id="widget-description"
                            value={config.widgetDescription}
                            onChange={(e) => handleGeneralSettingChange('widgetDescription', e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Theme & Preview</CardTitle>
                    <CardDescription>Control font, timezone label, and preview behavior</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="font-family">Font Family</Label>
                            <Input
                                id="font-family"
                                placeholder="e.g., Inter, Arial, 'Playfair Display'"
                                value={config.fontFamily || ''}
                                onChange={(e) => handleGeneralSettingChange('fontFamily', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="timezone-label">Timezone Label</Label>
                            <Input
                                id="timezone-label"
                                placeholder="e.g., PST, Local Time"
                                value={config.timezoneLabel || ''}
                                onChange={(e) => handleGeneralSettingChange('timezoneLabel', e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="slot-duration">Slot Duration (minutes)</Label>
                            <Input
                                id="slot-duration"
                                type="number"
                                min={15}
                                step={15}
                                value={Number(config.slotDurationMinutes ?? 90)}
                                onChange={(e) => handleGeneralSettingChange('slotDurationMinutes', parseInt(e.target.value || '90', 10))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Preview Role</Label>
                            <Select
                                value={(config.previewRole || 'customer')}
                                onValueChange={(value) => handleGeneralSettingChange('previewRole', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="customer">Customer</SelectItem>
                                    <SelectItem value="staff">Staff</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Show Promo Code</Label>
                                <p className="text-sm text-gray-500">Enable promo code entry in cart</p>
                            </div>
                            <Switch
                                checked={Boolean(config.showPromoCodeInput)}
                                onCheckedChange={(checked) => handleGeneralSettingChange('showPromoCodeInput', checked)}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Show Gift Card</Label>
                                <p className="text-sm text-gray-500">Enable gift card application in cart</p>
                            </div>
                            <Switch
                                checked={Boolean(config.showGiftCardInput)}
                                onCheckedChange={(checked) => handleGeneralSettingChange('showGiftCardInput', checked)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
