import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Separator } from '../../ui/separator';
import { Button } from '../../ui/button';
import { Check, Star, AlertTriangle, Edit } from 'lucide-react';
import { ActivityData } from '../types';

interface Step6ReviewProps {
    activityData: ActivityData;
    onEditStep?: (step: number) => void;
}

export default function Step6Review({ activityData, onEditStep }: Step6ReviewProps) {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Review Your Activity</CardTitle>
                    <CardDescription>
                        Double-check all information before publishing
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Cover Image Preview */}
                    {activityData.coverImage && (
                        <div>
                            <img
                                src={activityData.coverImage}
                                alt={activityData.name}
                                className="w-full h-48 object-cover rounded-lg mb-4"
                            />
                        </div>
                    )}

                    {/* Basic Info */}
                    <div>
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg text-gray-900 mb-1">{activityData.name}</h3>
                                {activityData.tagline && (
                                    <p className="text-sm text-gray-600 mb-2">{activityData.tagline}</p>
                                )}
                                <Badge>{activityData.category}</Badge>
                            </div>
                            {onEditStep && (
                                <Button variant="ghost" size="sm" onClick={() => onEditStep(1)}>
                                    <Edit className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-500">Capacity</p>
                                <p className="text-gray-900">
                                    {activityData.minAdults}-{activityData.maxAdults} adults
                                    {activityData.maxChildren > 0 && `, up to ${activityData.maxChildren} children`}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Duration</p>
                                <p className="text-gray-900">{activityData.duration} minutes</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Difficulty</p>
                                <div className="flex gap-0.5">
                                    {Array.from({ length: activityData.difficulty }).map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-500">Pricing</p>
                                <p className="text-gray-900">
                                    ${activityData.adultPrice} (adult), ${activityData.childPrice} (child)
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Min Age</p>
                                <p className="text-gray-900">{activityData.minAge}+</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Languages</p>
                                <p className="text-gray-900">{activityData.language.join(', ')}</p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Description */}
                    <div>
                        <p className="text-sm text-gray-500 mb-2">Description</p>
                        <p className="text-sm text-gray-700">{activityData.description}</p>
                    </div>

                    {/* Operating Days */}
                    <div>
                        <p className="text-sm text-gray-500 mb-2">Operating Days</p>
                        <div className="flex flex-wrap gap-2">
                            {activityData.operatingDays.map((day: string) => (
                                <Badge key={day} variant="secondary">
                                    {day}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Gallery Preview */}
                    {activityData.galleryImages.length > 0 && (
                        <div>
                            <p className="text-sm text-gray-500 mb-2">Gallery ({activityData.galleryImages.length} images)</p>
                            <div className="grid grid-cols-4 gap-2">
                                {activityData.galleryImages.slice(0, 4).map((img: string, index: number) => (
                                    <img
                                        key={index}
                                        src={img}
                                        alt={`Gallery ${index + 1}`}
                                        className="w-full h-20 object-cover rounded"
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {activityData.videos.length > 0 && (
                        <div>
                            <p className="text-sm text-gray-500">Videos: {activityData.videos.length} uploaded</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                        <p className="text-green-900 mb-1">Ready to publish!</p>
                        <p className="text-sm text-green-700">
                            Your activity will be immediately available for booking once published.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
