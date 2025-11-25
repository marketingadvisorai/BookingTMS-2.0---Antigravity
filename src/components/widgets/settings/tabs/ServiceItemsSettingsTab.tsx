import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../ui/card';
import { Button } from '../../../ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../../../ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../ui/dialog';
import { Plus, Trash2, MoreVertical, Edit, Copy, Settings } from 'lucide-react';
import { toast } from 'sonner';
import AddServiceItemWizard from '../../../events/AddServiceItemWizard';
import { useServiceItems } from '../../../../hooks/useServiceItems';
import { useTerminology } from '../../../../hooks/useTerminology';

interface EmbedContext {
    embedKey?: string;
    primaryColor?: string;
    venueName?: string;
    baseUrl?: string;
    venueId?: string;
    venueType?: string; // Added venueType to context
}

interface ServiceItemsSettingsTabProps {
    config: any;
    onConfigChange: (config: any) => void;
    embedContext?: EmbedContext;
}

const generateSlug = (value: string | undefined) => {
    if (!value) return 'item';
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-') || 'item';
};

export const ServiceItemsSettingsTab: React.FC<ServiceItemsSettingsTabProps> = ({ config, onConfigChange, embedContext }) => {
    console.log('ServiceItemsSettingsTab: rendering', { config, embedContext });
    const [showWizard, setShowWizard] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [duplicatingItemId, setDuplicatingItemId] = useState<string | null>(null);

    // Use new hooks
    const { serviceItems, createServiceItem, updateServiceItem, deleteServiceItem, loading } = useServiceItems(embedContext?.venueId);
    const t = useTerminology(embedContext?.venueType || 'escape_room');

    // Map Service Items to Widget format
    const mapServiceItemToWidget = (item: any) => {
        const settings = item.settings || {};
        return {
            id: item.id,
            name: item.name,
            description: item.description,
            tagline: item.tagline, // Assuming tagline is in root or settings, checking root first
            difficulty: item.difficulty,
            duration: item.duration,
            minPlayers: item.min_players,
            maxPlayers: item.max_players,
            min_players: item.min_players, // backwards compatibility
            max_players: item.max_players,
            price: item.price,
            childPrice: item.child_price,
            child_price: item.child_price,
            status: item.status,
            image: item.image_url,
            imageUrl: item.image_url,
            coverImage: item.image_url,
            settings,
            operatingDays: settings.operatingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            startTime: settings.startTime || '10:00',
            endTime: settings.endTime || '22:00',
            slotInterval: settings.slotInterval || 60,
            advanceBooking: settings.advanceBooking || 30,
            requiresWaiver: settings.requiresWaiver || false,
            selectedWaiver: settings.selectedWaiver || null,
            cancellationWindow: settings.cancellationWindow || 24,
            specialInstructions: settings.specialInstructions || '',
            galleryImages: settings.galleryImages || [],
            videos: settings.videos || [],
            language: settings.language || ['English'],
            minChildren: settings.minChildren || 0,
            maxChildren: settings.maxChildren || 0,
            location: settings.location || '',
            faqs: settings.faqs || [],
            cancellationPolicies: settings.cancellationPolicies || [],
            // Stripe integration fields
            stripe_price_id: item.stripe_price_id || null,
            stripe_product_id: item.stripe_product_id || null,
            stripe_sync_status: item.stripe_sync_status || 'pending',
        };
    };

    const widgetItems = useMemo(() => serviceItems.map(mapServiceItemToWidget), [serviceItems]);

    // Sync with parent config
    useEffect(() => {
        const currentItems = Array.isArray(config?.activities) ? config.activities : [];

        const hasDifference =
            currentItems.length !== widgetItems.length ||
            currentItems.some((item: any, index: number) => {
                const widgetItem = widgetItems[index];
                if (!widgetItem) return true;
                return JSON.stringify(item) !== JSON.stringify(widgetItem);
            });

        if (hasDifference) {
            onConfigChange({
                ...config,
                activities: widgetItems,
            });
        }
    }, [widgetItems, config, onConfigChange]);

    const handleAddItem = () => {
        setEditingItem(null);
        setShowWizard(true);
    };

    const handleEditItem = (item: any) => {
        setEditingItem(item);
        setShowWizard(true);
    };

    const handleWizardComplete = async (data: any) => {
        if (!embedContext?.venueId) {
            toast.error('Venue ID is required');
            return;
        }

        try {
            const slug = generateSlug(data.slug || data.name);

            // Map wizard data to Service Item schema
            const serviceItemData = {
                venue_id: embedContext.venueId,
                name: data.name,
                slug: slug, // Assuming slug is still used/stored
                description: data.description || '',
                tagline: data.tagline || '', // Assuming tagline support
                difficulty: data.difficulty, // This might need mapping if UI uses different values
                duration: data.duration || 60,
                min_players: data.minAdults || 1,
                max_players: data.maxAdults || 10,
                price: data.adultPrice || 0,
                child_price: data.childPrice || data.adultPrice || 0,
                min_age: data.minAge || 0,
                success_rate: data.successRate || 0, // Keeping for escape rooms
                image_url: data.coverImage || 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop&q=60',
                status: 'active' as const,
                // Stripe payment integration fields
                stripe_product_id: data.stripeProductId || null,
                stripe_price_id: data.stripePriceId || null,
                stripe_sync_status: data.stripeSyncStatus || null,
                stripe_last_sync: data.stripeLastSync || null,
                settings: {
                    category: data.category,
                    eventType: data.eventType,
                    activityType: data.activityType || 'physical',
                    minChildren: data.minChildren,
                    maxChildren: data.maxChildren,
                    language: data.language,
                    activityDetails: data.activityDetails,
                    additionalInformation: data.additionalInformation,
                    faqs: data.faqs,
                    cancellationPolicies: data.cancellationPolicies,
                    accessibility: data.accessibility,
                    location: data.location,
                    galleryImages: data.galleryImages,
                    videos: data.videos,
                    operatingDays: data.operatingDays,
                    startTime: data.startTime,
                    endTime: data.endTime,
                    slotInterval: data.slotInterval,
                    advanceBooking: data.advanceBooking,
                    customDates: data.customDates || [],
                    blockedDates: data.blockedDates || [],
                    customHours: data.customHours || {},
                    customHoursEnabled: data.customHoursEnabled || false,
                    selectedWidget: data.selectedWidget || 'calendar-single-event',
                    requiresWaiver: data.requiresWaiver,
                    selectedWaiver: data.selectedWaiver,
                    cancellationWindow: data.cancellationWindow,
                    specialInstructions: data.specialInstructions,
                    availability: {},
                },
            };

            if (editingItem?.id && !editingItem.id.startsWith('temp-')) {
                await updateServiceItem({ id: editingItem.id, updates: serviceItemData });
                toast.success(`${t.singular} updated successfully!`);
            } else {
                await createServiceItem(serviceItemData);
                toast.success(`${t.singular} created successfully!`);
            }

            setShowWizard(false);
            setEditingItem(null);
        } catch (error: any) {
            console.error('Error saving item:', error);
            toast.error(error.message || `Failed to save ${t.singular.toLowerCase()}`);
        }
    };

    return (
        <div className="space-y-6 pb-24">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>{t.plural}</CardTitle>
                        <CardDescription>Configure your {t.plural.toLowerCase()} - stored in database</CardDescription>
                    </div>
                    <Button onClick={handleAddItem} size="sm" className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        {t.actionAdd}
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {loading ? (
                        <p className="text-sm text-gray-500">Loading {t.plural.toLowerCase()}...</p>
                    ) : serviceItems.length === 0 ? (
                        <p className="text-sm text-gray-500">No {t.plural.toLowerCase()} configured yet. Click "{t.actionAdd}" to create your first {t.singular.toLowerCase()}.</p>
                    ) : (
                        serviceItems.map((item: any) => (
                            <div key={item.id} className="p-4 border rounded-lg">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="font-semibold">{item.name}</h4>
                                        <p className="text-sm text-gray-600">{item.description}</p>
                                        <div className="flex gap-4 mt-2 text-sm text-gray-500">
                                            <span>⏱ {item.duration} min</span>
                                            <span>💰 ${item.price}</span>
                                            <span className={`px-2 py-0.5 rounded ${item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                {item.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEditItem(item)}
                                            className="h-8"
                                        >
                                            <Settings className="w-4 h-4 mr-1" />
                                            Settings
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                    disabled={duplicatingItemId === item.id}
                                                >
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuItem
                                                    onClick={() => handleEditItem(item)}
                                                    className="cursor-pointer"
                                                >
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={async () => {
                                                        setDuplicatingItemId(item.id);
                                                        try {
                                                            const duplicateName = `${item.name} (Copy)`;
                                                            const slug = duplicateName.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

                                                            const duplicateData = {
                                                                ...item,
                                                                id: undefined,
                                                                name: duplicateName,
                                                                slug: slug,
                                                                stripe_product_id: undefined,
                                                                stripe_price_id: undefined,
                                                                stripe_sync_status: 'not_synced',
                                                                created_at: undefined,
                                                                updated_at: undefined,
                                                            };

                                                            await createServiceItem(duplicateData);
                                                            toast.success(`${t.singular} duplicated as "${duplicateName}"`);
                                                        } catch (error) {
                                                            console.error('Error duplicating item:', error);
                                                            toast.error(`Failed to duplicate ${t.singular.toLowerCase()}`);
                                                        } finally {
                                                            setDuplicatingItemId(null);
                                                        }
                                                    }}
                                                    disabled={duplicatingItemId === item.id}
                                                    className="cursor-pointer"
                                                >
                                                    <Copy className="w-4 h-4 mr-2" />
                                                    {duplicatingItemId === item.id ? 'Duplicating...' : 'Duplicate'}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={async () => {
                                                        if (confirm(`Delete "${item.name}"?`)) {
                                                            await deleteServiceItem(item.id);
                                                        }
                                                    }}
                                                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>

            {/* Activity Wizard Dialog */}
            <Dialog open={showWizard} onOpenChange={setShowWizard}>
                <DialogContent className="!w-screen !h-screen !max-w-none !max-h-none sm:!w-[95vw] sm:!h-[95vh] sm:!max-w-[1400px] sm:!max-h-[95vh] !rounded-none sm:!rounded-lg overflow-hidden p-0 flex flex-col">
                    <AddServiceItemWizard
                        onCancel={() => {
                            setShowWizard(false);
                            setEditingItem(null);
                        }}
                        onComplete={handleWizardComplete}
                        initialData={editingItem ? {
                            ...editingItem,
                            minAdults: editingItem.min_players,
                            maxAdults: editingItem.max_players,
                            adultPrice: editingItem.price,
                            childPrice: editingItem.child_price,
                            minAge: editingItem.min_age,
                            successRate: editingItem.success_rate,
                            coverImage: editingItem.image_url,
                            ...editingItem.settings
                        } : undefined}
                        mode={editingItem ? 'edit' : 'create'}
                        venueType={embedContext?.venueType}
                        venueId={embedContext?.venueId}
                        venueName={embedContext?.venueName}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
};
