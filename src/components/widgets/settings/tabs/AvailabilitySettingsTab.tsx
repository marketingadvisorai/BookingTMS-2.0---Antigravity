
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Badge } from '../../../ui/badge';
import { Separator } from '../../../ui/separator';
import { Plus, Trash2, X, Calendar as CalendarIcon, Info } from 'lucide-react';
import { toast } from 'sonner';
import { validateCustomDate, validateBlockedDate } from '../../../../utils/validation';

interface AvailabilitySettingsTabProps {
    config: any;
    onConfigChange: (config: any) => void;
}

export const AvailabilitySettingsTab: React.FC<AvailabilitySettingsTabProps> = ({ config, onConfigChange }) => {
    const [blockMode, setBlockMode] = useState<'single' | 'range'>('single');

    const handleAddCustomDate = () => {
        const dateInput = document.getElementById('custom-available-date') as HTMLInputElement;
        const startTimeInput = document.getElementById('custom-start-time') as HTMLInputElement;
        const endTimeInput = document.getElementById('custom-end-time') as HTMLInputElement;
        const reasonInput = document.getElementById('custom-reason') as HTMLInputElement;

        const date = dateInput?.value;
        const startTime = startTimeInput?.value;
        const endTime = endTimeInput?.value;
        const reason = reasonInput?.value;

        const validation = validateCustomDate(date, startTime, endTime);
        if (!validation.isValid) {
            toast.error(validation.error);
            return;
        }

        const customDates = config.customAvailableDates || [];

        // Check for duplicates
        if (customDates.some((d: any) => d.date === date)) {
            toast.error('This date is already in the custom list');
            return;
        }

        onConfigChange({
            ...config,
            customAvailableDates: [...customDates, {
                date,
                startTime,
                endTime,
                reason: reason || 'Special Hours'
            }]
        });

        toast.success('Custom date added');
        if (dateInput) dateInput.value = '';
        if (reasonInput) reasonInput.value = '';
    };

    const handleRemoveCustomDate = (dateToRemove: string) => {
        onConfigChange({
            ...config,
            customAvailableDates: config.customAvailableDates.filter((d: any) => d.date !== dateToRemove)
        });
        toast.success('Custom date removed');
    };

    const handleAddBlockedDate = () => {
        const dateInput = document.getElementById('blocked-date') as HTMLInputElement;
        const endDateInput = document.getElementById('blocked-date-end') as HTMLInputElement;
        const startTimeInput = document.getElementById('blocked-start-time') as HTMLInputElement;
        const endTimeInput = document.getElementById('blocked-end-time') as HTMLInputElement;
        const reasonInput = document.getElementById('blocked-reason') as HTMLInputElement;

        const date = dateInput?.value;
        const endDate = endDateInput?.value;
        const startTime = startTimeInput?.value;
        const endTime = endTimeInput?.value;
        const reason = reasonInput?.value;

        if (blockMode === 'range') {
            if (!date || !endDate) {
                toast.error('Please select start and end dates');
                return;
            }
            if (date > endDate) {
                toast.error('End date must be after start date');
                return;
            }

            const datesToAdd: { date: string; blockType: string; reason: string }[] = [];
            let currentDate = new Date(date);
            const lastDate = new Date(endDate);

            while (currentDate <= lastDate) {
                datesToAdd.push({
                    date: currentDate.toISOString().split('T')[0],
                    blockType: 'full-day',
                    reason: reason || 'Blocked Range'
                });
                currentDate.setDate(currentDate.getDate() + 1);
            }

            const currentBlocked = config.blockedDates || [];
            // Filter out any dates that are already blocked to avoid duplicates
            const newBlocked = [
                ...currentBlocked,
                ...datesToAdd.filter(newD => !currentBlocked.some((currD: any) => currD.date === newD.date))
            ];

            onConfigChange({
                ...config,
                blockedDates: newBlocked
            });
            toast.success(`Blocked ${datesToAdd.length} dates`);

        } else {
            // Single date mode
            const validation = validateBlockedDate(date, startTime, endTime);
            if (!validation.isValid) {
                toast.error(validation.error);
                return;
            }

            const blockedDates = config.blockedDates || [];

            // Check for duplicates
            if (blockedDates.some((d: any) => d.date === date)) {
                toast.error('This date is already blocked');
                return;
            }

            const isFullDay = !startTime && !endTime;

            onConfigChange({
                ...config,
                blockedDates: [...blockedDates, {
                    date,
                    startTime: isFullDay ? null : startTime,
                    endTime: isFullDay ? null : endTime,
                    blockType: isFullDay ? 'full-day' : 'time-slot',
                    reason: reason || (isFullDay ? 'Full Day Block' : 'Partial Block')
                }]
            });
            toast.success('Blocked date added');
        }

        // Reset inputs
        if (dateInput) dateInput.value = '';
        if (endDateInput) endDateInput.value = '';
        if (reasonInput) reasonInput.value = '';
    };

    const handleRemoveBlockedDate = (dateToRemove: string) => {
        onConfigChange({
            ...config,
            blockedDates: config.blockedDates.filter((d: any) => d.date !== dateToRemove)
        });
        toast.success('Blocked date removed');
    };

    return (
        <div className="space-y-6 pb-24">
            {/* Info Notice */}
            <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900">
                <CardContent className="pt-6">
                    <div className="flex gap-3">
                        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                Widget-Level Availability Settings
                            </p>
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                These settings apply to the entire booking widget. For game-specific schedules (operating days, hours, advance booking), edit each game individually in the <strong>Games tab</strong>.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Custom Available Dates */}
            <Card>
                <CardHeader>
                    <CardTitle>Add a custom date</CardTitle>
                    <CardDescription>Add special available dates outside regular schedule (e.g., special events)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <div className="space-y-3 p-4 border rounded-lg bg-green-50 dark:bg-green-900/20">
                            <div className="space-y-2">
                                <Label htmlFor="custom-available-date" className="text-sm">Select a date</Label>
                                <Input
                                    id="custom-available-date"
                                    type="date"
                                    className="w-full"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label htmlFor="custom-start-time" className="text-sm">Start Time</Label>
                                    <Input
                                        id="custom-start-time"
                                        type="time"
                                        defaultValue="10:00"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="custom-end-time" className="text-sm">End Time</Label>
                                    <Input
                                        id="custom-end-time"
                                        type="time"
                                        defaultValue="22:00"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="custom-reason" className="text-sm">Reason (Optional)</Label>
                                <Input
                                    id="custom-reason"
                                    placeholder="e.g., Holiday hours, Special event"
                                />
                            </div>

                            <Button
                                className="w-full bg-green-600 hover:bg-green-700"
                                onClick={handleAddCustomDate}
                            >
                                Add Available Date
                            </Button>
                        </div>

                        {/* List of custom dates */}
                        <div className="mt-4 space-y-2">
                            <Label className="text-sm text-gray-500">Scheduled Custom Dates</Label>
                            {(!config.customAvailableDates || config.customAvailableDates.length === 0) && (
                                <p className="text-sm text-gray-400 italic">No custom dates added</p>
                            )}
                            <div className="space-y-2">
                                {config.customAvailableDates?.map((date: any, index: number) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-[#1e1e1e] border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center text-green-600">
                                                <CalendarIcon className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{new Date(date.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                                                <p className="text-xs text-gray-500">
                                                    {date.startTime} - {date.endTime}
                                                    {date.reason && <span className="ml-1 text-gray-400">• {date.reason}</span>}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                            onClick={() => handleRemoveCustomDate(date.date)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Blocked Dates */}
            <Card>
                <CardHeader>
                    <CardTitle>Block dates</CardTitle>
                    <CardDescription>Prevent bookings on specific dates or times</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <div className="space-y-3 p-4 border rounded-lg bg-red-50 dark:bg-red-900/10">
                            <div className="flex gap-2 mb-2">
                                <Button
                                    variant={blockMode === 'single' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setBlockMode('single')}
                                    className={blockMode === 'single' ? 'bg-red-600 hover:bg-red-700' : ''}
                                >
                                    Single Date
                                </Button>
                                <Button
                                    variant={blockMode === 'range' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setBlockMode('range')}
                                    className={blockMode === 'range' ? 'bg-red-600 hover:bg-red-700' : ''}
                                >
                                    Date Range
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label htmlFor="blocked-date" className="text-sm">
                                        {blockMode === 'range' ? 'Start Date' : 'Select Date'}
                                    </Label>
                                    <Input
                                        id="blocked-date"
                                        type="date"
                                        className="w-full"
                                    />
                                </div>
                                {blockMode === 'range' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="blocked-date-end" className="text-sm">End Date</Label>
                                        <Input
                                            id="blocked-date-end"
                                            type="date"
                                            className="w-full"
                                        />
                                    </div>
                                )}
                            </div>

                            {blockMode === 'single' && (
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="blocked-start-time" className="text-sm">Start Time (Optional)</Label>
                                        <Input
                                            id="blocked-start-time"
                                            type="time"
                                            placeholder="All Day"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="blocked-end-time" className="text-sm">End Time (Optional)</Label>
                                        <Input
                                            id="blocked-end-time"
                                            type="time"
                                            placeholder="All Day"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="blocked-reason" className="text-sm">Reason (Optional)</Label>
                                <Input
                                    id="blocked-reason"
                                    placeholder="e.g., Maintenance, Private Event"
                                />
                            </div>

                            <Button
                                className="w-full bg-red-600 hover:bg-red-700"
                                onClick={handleAddBlockedDate}
                            >
                                {blockMode === 'range' ? 'Block Date Range' : 'Block Date'}
                            </Button>
                        </div>

                        {/* List of blocked dates */}
                        <div className="mt-4 space-y-2">
                            <Label className="text-sm text-gray-500">Blocked Dates</Label>
                            {(!config.blockedDates || config.blockedDates.length === 0) && (
                                <p className="text-sm text-gray-400 italic">No dates blocked</p>
                            )}
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {config.blockedDates?.map((date: any, index: number) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-[#1e1e1e] border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-red-600">
                                                <CalendarIcon className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{new Date(date.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-[10px] h-5">
                                                        {date.blockType === 'full-day' ? 'Full Day' : `${date.startTime} - ${date.endTime} `}
                                                    </Badge>
                                                    {date.reason && <span className="text-xs text-gray-500">{date.reason}</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                            onClick={() => handleRemoveBlockedDate(date.date)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
