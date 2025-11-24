import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Switch } from '../../ui/switch';
import { Button } from '../../ui/button';
import { Trash2, Plus } from 'lucide-react';
import { StepProps } from '../types';
import DynamicPricingSection from './DynamicPricingSection';

export default function Step2CapacityPricing({ activityData, updateActivityData, t }: StepProps) {
    const addCustomCapacityField = () => {
        const newFields = [
            ...activityData.customCapacityFields,
            { id: Date.now().toString(), name: '', min: 0, max: 10, price: 0 },
        ];
        updateActivityData('customCapacityFields', newFields);
    };

    const removeCustomCapacityField = (index: number) => {
        const newFields = activityData.customCapacityFields.filter((_, i) => i !== index);
        updateActivityData('customCapacityFields', newFields);
    };

    const updateCustomCapacityField = (index: number, field: string, value: any) => {
        const newFields = [...activityData.customCapacityFields];
        newFields[index] = { ...newFields[index], [field]: value };
        updateActivityData('customCapacityFields', newFields);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Capacity & Pricing</CardTitle>
                    <CardDescription>Set participant limits and pricing rules</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Standard Capacity */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="minAdults">Min Participants</Label>
                            <Input
                                id="minAdults"
                                type="number"
                                min="1"
                                value={activityData.minAdults}
                                onChange={(e) => updateActivityData('minAdults', parseInt(e.target.value))}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="maxAdults">Max Participants</Label>
                            <Input
                                id="maxAdults"
                                type="number"
                                min="1"
                                value={activityData.maxAdults}
                                onChange={(e) => updateActivityData('maxAdults', parseInt(e.target.value))}
                                className="mt-1"
                            />
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="adultPrice">Price per Person ($)</Label>
                            <Input
                                id="adultPrice"
                                type="number"
                                min="0"
                                step="0.01"
                                value={activityData.adultPrice}
                                onChange={(e) => updateActivityData('adultPrice', parseFloat(e.target.value))}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="childPrice">Child Price ($)</Label>
                            <Input
                                id="childPrice"
                                type="number"
                                min="0"
                                step="0.01"
                                value={activityData.childPrice}
                                onChange={(e) => updateActivityData('childPrice', parseFloat(e.target.value))}
                                className="mt-1"
                            />
                        </div>
                    </div>

                    {/* Custom Capacity Fields */}
                    <div className="space-y-4 border-t pt-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-base">Custom Capacity Fields</Label>
                            <Button variant="outline" size="sm" onClick={addCustomCapacityField}>
                                <Plus className="w-4 h-4 mr-2" /> Add Field
                            </Button>
                        </div>
                        <p className="text-sm text-gray-500">
                            Add specific capacity types (e.g., "VIP Seats", "Equipment Rental")
                        </p>

                        <div className="space-y-3">
                            {activityData.customCapacityFields.map((field, index) => (
                                <div key={field.id} className="flex items-end gap-3 bg-gray-50 p-3 rounded-lg">
                                    <div className="flex-1">
                                        <Label className="text-xs">Name</Label>
                                        <Input
                                            value={field.name}
                                            onChange={(e) => updateCustomCapacityField(index, 'name', e.target.value)}
                                            placeholder="e.g. VIP"
                                            className="h-8 text-sm"
                                        />
                                    </div>
                                    <div className="w-20">
                                        <Label className="text-xs">Min</Label>
                                        <Input
                                            type="number"
                                            value={field.min}
                                            onChange={(e) => updateCustomCapacityField(index, 'min', parseInt(e.target.value))}
                                            className="h-8 text-sm"
                                        />
                                    </div>
                                    <div className="w-20">
                                        <Label className="text-xs">Max</Label>
                                        <Input
                                            type="number"
                                            value={field.max}
                                            onChange={(e) => updateCustomCapacityField(index, 'max', parseInt(e.target.value))}
                                            className="h-8 text-sm"
                                        />
                                    </div>
                                    <div className="w-24">
                                        <Label className="text-xs">Price ($)</Label>
                                        <Input
                                            type="number"
                                            value={field.price}
                                            onChange={(e) => updateCustomCapacityField(index, 'price', parseFloat(e.target.value))}
                                            className="h-8 text-sm"
                                        />
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeCustomCapacityField(index)}
                                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Dynamic Pricing Section */}
                    <DynamicPricingSection activityData={activityData} updateActivityData={updateActivityData} t={t} />
                </CardContent>
            </Card>
        </div>
    );
}
