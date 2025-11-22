import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../ui/card';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Button } from '../../../ui/button';
import { Textarea } from '../../../ui/textarea';
import { VenueService, Venue } from '../../../../services/venue.service';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';

interface VenueSettingsTabProps {
    config: any;
    onConfigChange: (config: any) => void;
    embedContext?: {
        venueId?: string;
    };
}

export const VenueSettingsTab: React.FC<VenueSettingsTabProps> = ({ config, onConfigChange, embedContext }) => {
    const [venue, setVenue] = useState<Venue | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        timezone: '',
        description: '',
        imageUrl: ''
    });

    useEffect(() => {
        if (embedContext?.venueId) {
            loadVenue(embedContext.venueId);
        }
    }, [embedContext?.venueId]);

    const loadVenue = async (id: string) => {
        setLoading(true);
        try {
            const data = await VenueService.getVenue(id);
            if (data) {
                setVenue(data);
                setFormData({
                    name: data.name,
                    address: data.address || '',
                    timezone: data.timezone,
                    description: data.description || '',
                    imageUrl: data.images?.[0] || ''
                });
            }
        } catch (error) {
            console.error('Error loading venue:', error);
            toast.error('Failed to load venue details');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!venue) return;
        setSaving(true);
        try {
            const updates = {
                id: venue.id,
                name: formData.name,
                address: formData.address,
                timezone: formData.timezone,
                description: formData.description,
                images: formData.imageUrl ? [formData.imageUrl] : []
            };

            const updatedVenue = await VenueService.updateVenue(updates);
            setVenue(updatedVenue);
            toast.success('Venue settings updated successfully');

            // Update config if needed (e.g. if widget title depends on venue name)
            // onConfigChange({ ...config, venueName: updatedVenue.name });
        } catch (error) {
            console.error('Error saving venue:', error);
            toast.error('Failed to save venue settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;
    }

    if (!venue) {
        return <div className="p-8 text-center text-gray-500">No venue selected or found.</div>;
    }

    return (
        <div className="space-y-6 pb-24">
            <Card>
                <CardHeader>
                    <CardTitle>Venue Details</CardTitle>
                    <CardDescription>Manage your venue's core information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="venue-name">Venue Name</Label>
                        <Input
                            id="venue-name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="venue-address">Address</Label>
                        <Input
                            id="venue-address"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="venue-timezone">Timezone</Label>
                        <Input
                            id="venue-timezone"
                            value={formData.timezone}
                            onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                            placeholder="e.g. America/New_York"
                        />
                        <p className="text-xs text-gray-500">Critical for booking availability. Use IANA timezone format.</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="venue-description">Description</Label>
                        <Textarea
                            id="venue-description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Media</CardTitle>
                    <CardDescription>Venue images and branding</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="venue-image">Main Image URL</Label>
                        <Input
                            id="venue-image"
                            value={formData.imageUrl}
                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                            placeholder="https://..."
                        />
                        {formData.imageUrl && (
                            <div className="mt-2 relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                                <img src={formData.imageUrl} alt="Venue Preview" className="object-cover w-full h-full" />
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 flex justify-end gap-4 z-10 dark:bg-gray-900 dark:border-gray-800">
                <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700 text-white">
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Changes
                </Button>
            </div>
        </div>
    );
};
