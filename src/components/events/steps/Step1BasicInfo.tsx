import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { StepProps } from '../types';
import { CATEGORIES } from '../constants';

export default function Step1BasicInfo({ gameData, updateGameData, t }: StepProps) {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>
                        Enter the essential details about your {t.singular.toLowerCase()}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="name">
                            {t.singular} Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="name"
                            placeholder={`e.g., ${t.singular === 'Game' ? 'Zombie Apocalypse' : 'Sunset Yoga'}`}
                            value={gameData.name}
                            onChange={(e) => updateGameData('name', e.target.value)}
                            className="mt-1"
                        />
                    </div>

                    <div>
                        <Label htmlFor="tagline">Tagline</Label>
                        <Input
                            id="tagline"
                            placeholder={`A short catchy phrase about your ${t.singular.toLowerCase()}`}
                            value={gameData.tagline}
                            onChange={(e) => updateGameData('tagline', e.target.value)}
                            className="mt-1"
                        />
                    </div>

                    <div>
                        <Label htmlFor="category">
                            Category <span className="text-red-500">*</span>
                        </Label>
                        <Select value={gameData.category} onValueChange={(value) => updateGameData('category', value)}>
                            <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                {CATEGORIES.map((cat) => (
                                    <SelectItem key={cat} value={cat}>
                                        {cat}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="gameType">
                            {t.singular} Type <span className="text-red-500">*</span>
                        </Label>
                        <Select value={gameData.gameType} onValueChange={(value) => updateGameData('gameType', value)}>
                            <SelectTrigger className="mt-1">
                                <SelectValue placeholder={`Select ${t.singular.toLowerCase()} type`}>
                                    {gameData.gameType === 'physical'
                                        ? 'Physical'
                                        : gameData.gameType === 'virtual'
                                            ? 'Virtual'
                                            : gameData.gameType === 'hybrid'
                                                ? 'Hybrid'
                                                : null}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="physical">
                                    <div className="flex flex-col">
                                        <span>Physical</span>
                                        <span className="text-xs text-gray-500">On-site, in-person experience</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="virtual">
                                    <div className="flex flex-col">
                                        <span>Virtual</span>
                                        <span className="text-xs text-gray-500">Online or remote experience</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="hybrid">
                                    <div className="flex flex-col">
                                        <span>Hybrid</span>
                                        <span className="text-xs text-gray-500">Mix of in-person and online</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="eventType">
                            Event Type <span className="text-red-500">*</span>
                        </Label>
                        <Select value={gameData.eventType} onValueChange={(value) => updateGameData('eventType', value)}>
                            <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select event type">
                                    {gameData.eventType === 'public' ? 'Public Event' : gameData.eventType === 'private' ? 'Private Event' : null}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="public">
                                    <div className="flex flex-col">
                                        <span>Public Event</span>
                                        <span className="text-xs text-gray-500">Open to individual bookings and walk-ins</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="private">
                                    <div className="flex flex-col">
                                        <span>Private Event</span>
                                        <span className="text-xs text-gray-500">Exclusive bookings for groups only</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="description">
                            Description <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="description"
                            placeholder={`Describe the storyline, atmosphere, and what makes this ${t.singular.toLowerCase()} unique...`}
                            rows={6}
                            value={gameData.description}
                            onChange={(e) => updateGameData('description', e.target.value)}
                            className="mt-1"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {gameData.description.length} / 500 characters
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
