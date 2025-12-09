import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Badge } from '../../ui/badge';
import { StepProps } from '../types';
import { CATEGORIES, TIMEZONES } from '../constants';
import { useAuth } from '../../../lib/auth/AuthContext';
import { supabase } from '../../../lib/supabase';
import { Copy, Check, Building2, MapPin } from 'lucide-react';
import { Button } from '../../ui/button';
import { toast } from 'sonner';

interface ExtendedStepProps extends StepProps {
    organizationId?: string;
    venueId?: string;
    organizationName?: string;
    venueName?: string;
}

export default function Step1BasicInfo({ activityData, updateActivityData, t, organizationId, venueId, organizationName, venueName }: ExtendedStepProps) {
    const { currentUser } = useAuth();
    
    // Check for system-admin or super-admin roles
    const isPrivilegedAdmin = currentUser?.role === 'system-admin' || currentUser?.role === 'super-admin';

    const [organizations, setOrganizations] = useState<any[]>([]);
    const [venues, setVenues] = useState<any[]>([]);
    const [loadingOrgs, setLoadingOrgs] = useState(false);
    const [loadingVenues, setLoadingVenues] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Copy ID to clipboard helper
    const copyToClipboard = async (id: string, label: string) => {
        await navigator.clipboard.writeText(id);
        setCopiedId(id);
        toast.success(`${label} ID copied!`);
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Fetch organizations for System Admin
    useEffect(() => {
        if (isPrivilegedAdmin) {
            const fetchOrgs = async () => {
                setLoadingOrgs(true);
                const { data } = await supabase.from('organizations').select('id, name').order('name');
                setOrganizations(data || []);
                setLoadingOrgs(false);
            };
            fetchOrgs();
        }
    }, [isPrivilegedAdmin]);

    // Fetch venues when organization changes (for System Admin)
    useEffect(() => {
        if (isPrivilegedAdmin && activityData.organizationId) {
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
        } else if (isPrivilegedAdmin) {
            setVenues([]);
        }
    }, [isPrivilegedAdmin, activityData.organizationId]);

    // Initialize default values for Org Admin
    useEffect(() => {
        if (!isPrivilegedAdmin) {
            if (organizationId && !activityData.organizationId) {
                updateActivityData('organizationId', organizationId);
            }
            if (venueId && !activityData.venueId) {
                updateActivityData('venueId', venueId);
            }
        }
    }, [isPrivilegedAdmin, organizationId, venueId, activityData.organizationId, activityData.venueId, updateActivityData]);

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
                            {isPrivilegedAdmin ? (
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
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 flex items-center gap-2 p-2.5 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                            <Building2 className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm font-medium">{organizationName || 'Current Organization'}</span>
                                        </div>
                                    </div>
                                    {organizationId && (
                                        <div className="flex items-center gap-2 text-xs">
                                            <Badge variant="outline" className="font-mono text-[10px] px-1.5 py-0.5">
                                                ID: {organizationId.slice(0, 8)}...
                                            </Badge>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-5 w-5 p-0"
                                                onClick={() => copyToClipboard(organizationId, 'Organization')}
                                            >
                                                {copiedId === organizationId ? (
                                                    <Check className="w-3 h-3 text-green-500" />
                                                ) : (
                                                    <Copy className="w-3 h-3 text-gray-400" />
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="venue">Venue</Label>
                            {isPrivilegedAdmin ? (
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
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 flex items-center gap-2 p-2.5 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                            <MapPin className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm font-medium">{venueName || 'Current Venue'}</span>
                                        </div>
                                    </div>
                                    {venueId && (
                                        <div className="flex items-center gap-2 text-xs">
                                            <Badge variant="outline" className="font-mono text-[10px] px-1.5 py-0.5">
                                                ID: {venueId.slice(0, 8)}...
                                            </Badge>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-5 w-5 p-0"
                                                onClick={() => copyToClipboard(venueId, 'Venue')}
                                            >
                                                {copiedId === venueId ? (
                                                    <Check className="w-3 h-3 text-green-500" />
                                                ) : (
                                                    <Copy className="w-3 h-3 text-gray-400" />
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="name">
                            {t.singular} Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="name"
                            placeholder="e.g., The Haunted Mansion, Prison Break, Zombie Apocalypse"
                            value={activityData.name}
                            onChange={(e) => updateActivityData('name', e.target.value)}
                            className="mt-1"
                        />
                    </div>

                    <div>
                        <Label htmlFor="tagline">Tagline</Label>
                        <Input
                            id="tagline"
                            placeholder="e.g., Can you escape before time runs out?"
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
