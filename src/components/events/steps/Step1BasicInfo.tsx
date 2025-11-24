import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { StepProps } from '../types';
import { CATEGORIES, TIMEZONES } from '../constants';
import { useAuth } from '../../../lib/auth/AuthContext';
import { supabase } from '../../../lib/supabase';

interface ExtendedStepProps extends StepProps {
    organizationId?: string;
    venueId?: string;
    organizationName?: string;
    venueName?: string;
}

export default function Step1BasicInfo({ activityData, updateActivityData, t, organizationId, venueId, organizationName, venueName }: ExtendedStepProps) {
    const { currentUser } = useAuth();
    const isSystemAdmin = currentUser?.role === 'system-admin';

    const [organizations, setOrganizations] = useState<any[]>([]);
    const [venues, setVenues] = useState<any[]>([]);
    const [loadingOrgs, setLoadingOrgs] = useState(false);
    const [loadingVenues, setLoadingVenues] = useState(false);

    // Fetch organizations for System Admin
    useEffect(() => {
        if (isSystemAdmin) {
            const fetchOrgs = async () => {
                setLoadingOrgs(true);
                const { data } = await supabase.from('organizations').select('id, name').order('name');
                setOrganizations(data || []);
                setLoadingOrgs(false);
            };
            fetchOrgs();
        }
    }, [isSystemAdmin]);

    // Fetch venues when organization changes (for System Admin)
    useEffect(() => {
        if (isSystemAdmin && activityData.organizationId) {
            const fetchVenues = async () => {
                setLoadingVenues(true);
                const { data } = await supabase
                    .from('venues')
                    .select('id, name')
                    .eq('organization_id', activityData.organizationId!)
                    .order('name');
                setVenues(data || []);
                setLoadingVenues(false);
            };
            fetchVenues();
        } else if (isSystemAdmin) {
            setVenues([]);
        }
    }, [isSystemAdmin, activityData.organizationId]);

    // Initialize default values for Org Admin
    useEffect(() => {
        if (!isSystemAdmin) {
            if (organizationId && !activityData.organizationId) {
                updateActivityData('organizationId', organizationId);
            }
            if (venueId && !activityData.venueId) {
                updateActivityData('venueId', venueId);
            }
        }
    }, [isSystemAdmin, organizationId, venueId, activityData.organizationId, activityData.venueId, updateActivityData]);

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
                    {/* Organization & Venue Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="organization">Organization</Label>
                            {isSystemAdmin ? (
                                <Select
                                    value={activityData.organizationId || ''}
                                    onValueChange={(value) => {
                                        updateActivityData('organizationId', value);
                                        updateActivityData('venueId', ''); // Reset venue when org changes
                                    }}
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select Organization" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {organizations.map((org) => (
                                            <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Input
                                    value={organizationName || 'Current Organization'}
                                    disabled
                                    className="mt-1 bg-gray-100 dark:bg-gray-800"
                                />
                            )}
                        </div>
                        <div>
                            <Label htmlFor="venue">Venue</Label>
                            {isSystemAdmin ? (
                                <Select
                                    value={activityData.venueId || ''}
                                    onValueChange={(value) => updateActivityData('venueId', value)}
                                    disabled={!activityData.organizationId}
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select Venue" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {venues.map((venue) => (
                                            <SelectItem key={venue.id} value={venue.id}>{venue.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Input
                                    value={venueName || 'Current Venue'}
                                    disabled
                                    className="mt-1 bg-gray-100 dark:bg-gray-800"
                                />
                            )}
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="name">
                            {t.singular} Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="name"
                            placeholder={`e.g., ${t.singular === 'Game' ? 'Zombie Apocalypse' : 'Sunset Yoga'}`}
                            value={activityData.name}
                            onChange={(e) => updateActivityData('name', e.target.value)}
                            className="mt-1"
                        />
                    </div>

                    <div>
                        <Label htmlFor="tagline">Tagline</Label>
                        <Input
                            id="tagline"
                            placeholder={`A short catchy phrase about your ${t.singular.toLowerCase()}`}
                            value={activityData.tagline}
                            onChange={(e) => updateActivityData('tagline', e.target.value)}
                            className="mt-1"
                        />
                    </div>

                    <div>
                        <Label htmlFor="category">
                            Category <span className="text-red-500">*</span>
                        </Label>
                        <Select value={activityData.category} onValueChange={(value) => updateActivityData('category', value)}>
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
                        <Label htmlFor="activityType">
                            {t.singular} Type <span className="text-red-500">*</span>
                        </Label>
                        <Select value={activityData.activityType} onValueChange={(value) => updateActivityData('activityType', value)}>
                            <SelectTrigger className="mt-1">
                                <SelectValue placeholder={`Select ${t.singular.toLowerCase()} type`}>
                                    {activityData.activityType === 'physical'
                                        ? 'Physical'
                                        : activityData.activityType === 'virtual'
                                            ? 'Virtual'
                                            : activityData.activityType === 'hybrid'
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
                        <Select value={activityData.eventType} onValueChange={(value) => updateActivityData('eventType', value)}>
                            <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select event type">
                                    {activityData.eventType === 'public' ? 'Public Event' : activityData.eventType === 'private' ? 'Private Event' : null}
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
                        <Label htmlFor="timezone">
                            Time Zone <span className="text-red-500">*</span>
                        </Label>
                        <Select value={activityData.timezone || 'UTC'} onValueChange={(value) => updateActivityData('timezone', value)}>
                            <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select time zone" />
                            </SelectTrigger>
                            <SelectContent>
                                {TIMEZONES.map((tz) => (
                                    <SelectItem key={tz.value} value={tz.value}>
                                        {tz.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500 mt-1">
                            This time zone will be used for all bookings and availability.
                        </p>
                    </div>

                    <div>
                        <Label htmlFor="description">
                            Description <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="description"
                            placeholder={`Describe the storyline, atmosphere, and what makes this ${t.singular.toLowerCase()} unique...`}
                            rows={6}
                            value={activityData.description}
                            onChange={(e) => updateActivityData('description', e.target.value)}
                            className="mt-1"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {activityData.description.length} / 500 characters
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
