import React from 'react';
import { Card, CardContent } from '../../ui/card';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Switch } from '../../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Button } from '../../ui/button';
import { Trash2, Plus } from 'lucide-react';
import { StepProps } from '../types';
import { DAYS_OF_WEEK } from '../constants';

export default function DynamicPricingSection({ activityData, updateActivityData }: StepProps) {
    const addGroupTier = () => {
        const newTiers = [...activityData.groupTiers, { minSize: 10, maxSize: 20, discountPercent: 10 }];
        updateActivityData('groupTiers', newTiers);
    };

    const removeGroupTier = (index: number) => {
        const newTiers = activityData.groupTiers.filter((_, i) => i !== index);
        updateActivityData('groupTiers', newTiers);
    };

    const updateGroupTier = (index: number, field: string, value: number) => {
        const newTiers = [...activityData.groupTiers];
        newTiers[index] = { ...newTiers[index], [field]: value };
        updateActivityData('groupTiers', newTiers);
    };

    return (
        <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                    <Label className="text-base">Dynamic Pricing</Label>
                    <p className="text-sm text-gray-500">Enable peak hours and group discounts</p>
                </div>
                <Switch
                    checked={activityData.dynamicPricing}
                    onCheckedChange={(checked) => updateActivityData('dynamicPricing', checked)}
                />
            </div>

            {activityData.dynamicPricing && (
                <div className="space-y-6 pl-4 border-l-2 border-blue-100">
                    {/* Peak Pricing */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Peak Hours Pricing</Label>
                            <Switch
                                checked={activityData.peakPricing.enabled}
                                onCheckedChange={(checked) =>
                                    updateActivityData('peakPricing', { ...activityData.peakPricing, enabled: checked })
                                }
                            />
                        </div>

                        {activityData.peakPricing.enabled && (
                            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                <div>
                                    <Label className="text-xs">Weekday Peak Price ($)</Label>
                                    <Input
                                        type="number"
                                        value={activityData.peakPricing.weekdayPeakPrice}
                                        onChange={(e) =>
                                            updateActivityData('peakPricing', {
                                                ...activityData.peakPricing,
                                                weekdayPeakPrice: parseFloat(e.target.value),
                                            })
                                        }
                                        className="mt-1 h-8"
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs">Weekend Peak Price ($)</Label>
                                    <Input
                                        type="number"
                                        value={activityData.peakPricing.weekendPeakPrice}
                                        onChange={(e) =>
                                            updateActivityData('peakPricing', {
                                                ...activityData.peakPricing,
                                                weekendPeakPrice: parseFloat(e.target.value),
                                            })
                                        }
                                        className="mt-1 h-8"
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs">Peak Start Time</Label>
                                    <Input
                                        type="time"
                                        value={activityData.peakPricing.peakStartTime}
                                        onChange={(e) =>
                                            updateActivityData('peakPricing', {
                                                ...activityData.peakPricing,
                                                peakStartTime: e.target.value,
                                            })
                                        }
                                        className="mt-1 h-8"
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs">Peak End Time</Label>
                                    <Input
                                        type="time"
                                        value={activityData.peakPricing.peakEndTime}
                                        onChange={(e) =>
                                            updateActivityData('peakPricing', {
                                                ...activityData.peakPricing,
                                                peakEndTime: e.target.value,
                                            })
                                        }
                                        className="mt-1 h-8"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Group Discounts */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Group Size Discounts</Label>
                            <Button variant="outline" size="sm" onClick={addGroupTier} className="h-7 text-xs">
                                <Plus className="w-3 h-3 mr-1" /> Add Tier
                            </Button>
                        </div>

                        <div className="space-y-2">
                            {activityData.groupTiers.map((tier, index) => (
                                <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded text-sm">
                                    <span className="text-gray-500 text-xs">Size:</span>
                                    <Input
                                        type="number"
                                        value={tier.minSize}
                                        onChange={(e) => updateGroupTier(index, 'minSize', parseInt(e.target.value))}
                                        className="w-16 h-7 text-xs"
                                    />
                                    <span className="text-gray-500 text-xs">-</span>
                                    <Input
                                        type="number"
                                        value={tier.maxSize}
                                        onChange={(e) => updateGroupTier(index, 'maxSize', parseInt(e.target.value))}
                                        className="w-16 h-7 text-xs"
                                    />
                                    <span className="text-gray-500 text-xs ml-2">Discount:</span>
                                    <Input
                                        type="number"
                                        value={tier.discountPercent}
                                        onChange={(e) => updateGroupTier(index, 'discountPercent', parseFloat(e.target.value))}
                                        className="w-16 h-7 text-xs"
                                    />
                                    <span className="text-gray-500 text-xs">%</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeGroupTier(index)}
                                        className="h-7 w-7 ml-auto text-red-500 hover:text-red-600 hover:bg-red-50"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                </div>
                            ))}
                            {activityData.groupTiers.length === 0 && (
                                <p className="text-xs text-gray-400 italic">No group discounts configured.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
