import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Switch } from '../../ui/switch';
import { Button } from '../../ui/button';
import { Checkbox } from '../../ui/checkbox';
import { Trash2, Plus, Clock } from 'lucide-react';
import { StepProps } from '../types';
import { DAYS_OF_WEEK } from '../constants';

export default function Step5Schedule({ activityData, updateActivityData, t }: StepProps) {
    const toggleDay = (day: string) => {
        const currentDays = activityData.operatingDays;
        if (currentDays.includes(day)) {
            updateActivityData(
                'operatingDays',
                currentDays.filter((d) => d !== day)
            );
        } else {
            updateActivityData('operatingDays', [...currentDays, day]);
        }
    };

    const addCustomDate = () => {
        const newDates = [
            ...activityData.customDates,
            { id: Date.now().toString(), date: '', startTime: '09:00', endTime: '17:00' },
        ];
        updateActivityData('customDates', newDates);
    };

    const removeCustomDate = (index: number) => {
        const newDates = activityData.customDates.filter((_, i) => i !== index);
        updateActivityData('customDates', newDates);
    };

    const updateCustomDate = (index: number, field: string, value: string) => {
        const newDates = [...activityData.customDates];
        newDates[index] = { ...newDates[index], [field]: value };
        updateActivityData('customDates', newDates);
    };

    const updateCustomHours = (day: string, field: string, value: any) => {
        const newCustomHours = { ...activityData.customHours };
        if (!newCustomHours[day]) {
            newCustomHours[day] = { enabled: false, startTime: '09:00', endTime: '17:00' };
        }
        newCustomHours[day] = { ...newCustomHours[day], [field]: value };
        updateActivityData('customHours', newCustomHours);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Schedule & Availability</CardTitle>
                    <CardDescription>Set when your {t.singular.toLowerCase()} is available</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Standard Hours */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="startTime">Default Start Time</Label>
                            <Input
                                id="startTime"
                                type="time"
                                value={activityData.startTime}
                                onChange={(e) => updateActivityData('startTime', e.target.value)}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="endTime">Default End Time</Label>
                            <Input
                                id="endTime"
                                type="time"
                                value={activityData.endTime}
                                onChange={(e) => updateActivityData('endTime', e.target.value)}
                                className="mt-1"
                            />
                        </div>
                    </div>

                    {/* Slot Settings */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="slotInterval">Slot Interval (minutes)</Label>
                            <Select
                                value={activityData.slotInterval.toString()}
                                onValueChange={(value) => updateActivityData('slotInterval', parseInt(value))}
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select interval" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="15">15 minutes</SelectItem>
                                    <SelectItem value="30">30 minutes</SelectItem>
                                    <SelectItem value="45">45 minutes</SelectItem>
                                    <SelectItem value="60">60 minutes</SelectItem>
                                    <SelectItem value="90">90 minutes</SelectItem>
                                    <SelectItem value="120">2 hours</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="advanceBooking">Advance Booking (days)</Label>
                            <Input
                                id="advanceBooking"
                                type="number"
                                min="0"
                                value={activityData.advanceBooking}
                                onChange={(e) => updateActivityData('advanceBooking', parseInt(e.target.value))}
                                className="mt-1"
                            />
                        </div>
                    </div>

                    {/* Operating Days */}
                    <div>
                        <Label className="mb-3 block">Operating Days</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {DAYS_OF_WEEK.map((day) => (
                                <div
                                    key={day}
                                    className={`
                    flex items-center space-x-2 p-2 rounded border cursor-pointer transition-colors
                    ${activityData.operatingDays.includes(day)
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }
                  `}
                                    onClick={() => toggleDay(day)}
                                >
                                    <Checkbox checked={activityData.operatingDays.includes(day)} onCheckedChange={() => toggleDay(day)} />
                                    <span className="text-sm font-medium">{day}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Custom Hours Toggle */}
                    <div className="flex items-center justify-between border-t pt-4">
                        <div className="space-y-0.5">
                            <Label className="text-base">Custom Hours per Day</Label>
                            <p className="text-sm text-gray-500">Set different hours for specific days of the week</p>
                        </div>
                        <Switch
                            checked={activityData.customHoursEnabled}
                            onCheckedChange={(checked) => updateActivityData('customHoursEnabled', checked)}
                        />
                    </div>

                    {/* Custom Hours Configuration */}
                    {activityData.customHoursEnabled && (
                        <div className="space-y-3 pl-4 border-l-2 border-blue-100">
                            {DAYS_OF_WEEK.filter((day) => activityData.operatingDays.includes(day)).map((day) => (
                                <div key={day} className="flex items-center gap-4">
                                    <div className="w-24 font-medium text-sm">{day}</div>
                                    <Switch
                                        checked={activityData.customHours[day]?.enabled || false}
                                        onCheckedChange={(checked) => updateCustomHours(day, 'enabled', checked)}
                                    />
                                    {activityData.customHours[day]?.enabled ? (
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="time"
                                                value={activityData.customHours[day]?.startTime || '09:00'}
                                                onChange={(e) => updateCustomHours(day, 'startTime', e.target.value)}
                                                className="h-8 w-32"
                                            />
                                            <span className="text-gray-400">-</span>
                                            <Input
                                                type="time"
                                                value={activityData.customHours[day]?.endTime || '17:00'}
                                                onChange={(e) => updateCustomHours(day, 'endTime', e.target.value)}
                                                className="h-8 w-32"
                                            />
                                        </div>
                                    ) : (
                                        <span className="text-sm text-gray-400 italic">Uses default hours</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Custom Dates / Holidays */}
                    <div className="space-y-4 border-t pt-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-base">Specific Dates & Holidays</Label>
                            <Button variant="outline" size="sm" onClick={addCustomDate}>
                                <Plus className="w-4 h-4 mr-2" /> Add Date
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {activityData.customDates.map((date, index) => (
                                <div key={date.id} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                                    <div className="flex-1">
                                        <Label className="text-xs">Date</Label>
                                        <Input
                                            type="date"
                                            value={date.date}
                                            onChange={(e) => updateCustomDate(index, 'date', e.target.value)}
                                            className="h-8 text-sm"
                                        />
                                    </div>
                                    <div className="w-32">
                                        <Label className="text-xs">Start</Label>
                                        <Input
                                            type="time"
                                            value={date.startTime}
                                            onChange={(e) => updateCustomDate(index, 'startTime', e.target.value)}
                                            className="h-8 text-sm"
                                        />
                                    </div>
                                    <div className="w-32">
                                        <Label className="text-xs">End</Label>
                                        <Input
                                            type="time"
                                            value={date.endTime}
                                            onChange={(e) => updateCustomDate(index, 'endTime', e.target.value)}
                                            className="h-8 text-sm"
                                        />
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeCustomDate(index)}
                                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 mt-4"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                            {activityData.customDates.length === 0 && (
                                <div className="text-center py-4 text-gray-400 text-sm italic bg-gray-50 rounded-lg border border-dashed">
                                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                    No specific dates configured
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
