import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Label } from '../../ui/label';
import { Button } from '../../ui/button';
import { Separator } from '../../ui/separator';
import { Check, Edit, AlertTriangle } from 'lucide-react';
import { StepProps } from '../types';

export default function Step4Review({ gameData, t }: StepProps & { onEditStep: (step: number) => void }) {
    // Helper to check if a section is complete (basic check)
    const isBasicInfoComplete = gameData.name && gameData.description && gameData.category;
    const isPricingComplete = gameData.adultPrice > 0;
    const isScheduleComplete = gameData.operatingDays.length > 0;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Review & Publish</CardTitle>
                    <CardDescription>
                        Double check all details before making your {t.singular.toLowerCase()} live
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    {/* Basic Info Review */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="font-medium text-lg flex items-center gap-2">
                                {isBasicInfoComplete ? (
                                    <Check className="w-5 h-5 text-green-500" />
                                ) : (
                                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                                )}
                                Basic Information
                            </h3>
                            <Button variant="ghost" size="sm" onClick={() => { /* Navigate to step 1 */ }}>
                                <Edit className="w-4 h-4 mr-1" /> Edit
                            </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm bg-gray-50 p-4 rounded-lg">
                            <div>
                                <span className="text-gray-500">Name:</span>
                                <p className="font-medium">{gameData.name || 'Not set'}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Category:</span>
                                <p className="font-medium">{gameData.category || 'Not set'}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Type:</span>
                                <p className="font-medium capitalize">{gameData.gameType}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Event Type:</span>
                                <p className="font-medium capitalize">{gameData.eventType}</p>
                            </div>
                            <div className="col-span-2">
                                <span className="text-gray-500">Tagline:</span>
                                <p className="font-medium">{gameData.tagline || 'None'}</p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Capacity & Pricing Review */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="font-medium text-lg flex items-center gap-2">
                                {isPricingComplete ? (
                                    <Check className="w-5 h-5 text-green-500" />
                                ) : (
                                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                                )}
                                Capacity & Pricing
                            </h3>
                            <Button variant="ghost" size="sm" onClick={() => { /* Navigate to step 2 */ }}>
                                <Edit className="w-4 h-4 mr-1" /> Edit
                            </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm bg-gray-50 p-4 rounded-lg">
                            <div>
                                <span className="text-gray-500">Capacity:</span>
                                <p className="font-medium">
                                    {gameData.minAdults} - {gameData.maxAdults} People
                                </p>
                            </div>
                            <div>
                                <span className="text-gray-500">Price:</span>
                                <p className="font-medium">
                                    ${gameData.adultPrice} / person
                                    {gameData.childPrice > 0 && ` ($${gameData.childPrice} / child)`}
                                </p>
                            </div>
                            <div>
                                <span className="text-gray-500">Dynamic Pricing:</span>
                                <p className="font-medium">
                                    {gameData.dynamicPricing ? 'Enabled' : 'Disabled'}
                                </p>
                            </div>
                            <div>
                                <span className="text-gray-500">Custom Fields:</span>
                                <p className="font-medium">{gameData.customCapacityFields.length} configured</p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Schedule Review */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="font-medium text-lg flex items-center gap-2">
                                {isScheduleComplete ? (
                                    <Check className="w-5 h-5 text-green-500" />
                                ) : (
                                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                                )}
                                Schedule
                            </h3>
                            <Button variant="ghost" size="sm" onClick={() => { /* Navigate to step 5 */ }}>
                                <Edit className="w-4 h-4 mr-1" /> Edit
                            </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm bg-gray-50 p-4 rounded-lg">
                            <div>
                                <span className="text-gray-500">Operating Days:</span>
                                <p className="font-medium">
                                    {gameData.operatingDays.length > 0
                                        ? gameData.operatingDays.join(', ')
                                        : 'None selected'}
                                </p>
                            </div>
                            <div>
                                <span className="text-gray-500">Hours:</span>
                                <p className="font-medium">
                                    {gameData.startTime} - {gameData.endTime}
                                </p>
                            </div>
                            <div>
                                <span className="text-gray-500">Slot Interval:</span>
                                <p className="font-medium">{gameData.slotInterval} minutes</p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Media Review */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="font-medium text-lg flex items-center gap-2">
                                {gameData.coverImage ? (
                                    <Check className="w-5 h-5 text-green-500" />
                                ) : (
                                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                                )}
                                Media
                            </h3>
                            <Button variant="ghost" size="sm" onClick={() => { /* Navigate to step 4 */ }}>
                                <Edit className="w-4 h-4 mr-1" /> Edit
                            </Button>
                        </div>
                        <div className="flex gap-4 bg-gray-50 p-4 rounded-lg overflow-x-auto">
                            {gameData.coverImage ? (
                                <div className="relative h-20 w-32 flex-shrink-0">
                                    <img
                                        src={gameData.coverImage}
                                        alt="Cover"
                                        className="h-full w-full object-cover rounded"
                                    />
                                    <span className="absolute bottom-1 right-1 bg-black/50 text-white text-[10px] px-1 rounded">
                                        Cover
                                    </span>
                                </div>
                            ) : (
                                <div className="h-20 w-32 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                                    No Cover
                                </div>
                            )}
                            {gameData.galleryImages.map((img, i) => (
                                <div key={i} className="h-20 w-32 flex-shrink-0">
                                    <img
                                        src={img}
                                        alt={`Gallery ${i}`}
                                        className="h-full w-full object-cover rounded"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
