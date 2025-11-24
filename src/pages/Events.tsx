import React, { useState, useMemo } from 'react';
import { Button } from '../components/ui/button';
import { Plus } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { InventoryStats } from '../modules/inventory/components/InventoryStats';
import { GameGrid } from '../modules/inventory/components/GameGrid';
import { useTerminology } from '../hooks/useTerminology';
import { useServiceItems } from '../hooks/useServiceItems';
import { useVenues } from '../hooks/venue/useVenues';
import AddServiceItemWizard from '../components/events/AddServiceItemWizard';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { VisuallyHidden } from '../components/ui/visually-hidden';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { toast } from 'sonner';
import BookingsDialog from '../components/events/BookingsDialog';
import { useAuth } from '../lib/auth/AuthContext';
import { useOrganization } from '../features/system-admin/hooks/useOrganizations';
import { Input } from '../components/ui/input';

export function Events() {
  const t = useTerminology();
  const { currentUser } = useAuth();
  const { venues, loading: venuesLoading } = useVenues();
  const { organization } = useOrganization(currentUser?.organizationId || undefined);

  // Determine the active venue ID. 
  // For single-venue tenants, this will automatically be the only venue.
  // For multi-venue, we default to the first one for now, or could add a selector later.
  const activeVenueId = useMemo(() => venues.length > 0 ? venues[0].id : undefined, [venues]);
  const activeVenue = useMemo(() => venues.find(v => v.id === activeVenueId), [venues, activeVenueId]);

  // Use the new hook with the active venue ID
  const { serviceItems, loading: itemsLoading, createServiceItem, updateServiceItem, deleteServiceItem, refreshServiceItems } = useServiceItems(activeVenueId);

  // Debug: Expose createServiceItem to window
  React.useEffect(() => {
    (window as any).debugCreateServiceItem = createServiceItem;
    (window as any).debugActiveVenueId = activeVenueId;
  }, [createServiceItem, activeVenueId]);

  const loading = venuesLoading || itemsLoading;

  // Local state for wizard and dialogs
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddWizardOpen, setIsAddWizardOpen] = useState(false);
  const [editingServiceItem, setEditingServiceItem] = useState<any>(null);
  const [deletingItem, setDeletingItem] = useState<any>(null);
  const [selectedBookingService, setSelectedBookingService] = useState<{ id: string; name: string } | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  // Map ServiceItems to Game format for GameGrid compatibility
  const games = useMemo(() => {
    return serviceItems.map((item: any) => ({
      id: item.id,
      organization_id: item.organization_id || '',
      venue_id: item.venue_id,
      name: item.name,
      description: item.description,
      difficulty: item.difficulty?.toLowerCase() || 'medium',
      duration_minutes: item.duration,
      min_players: item.min_players,
      max_players: item.max_players,
      price: item.price,
      image_url: item.image_url,
      is_active: item.status === 'active',
      created_at: item.created_at,
      updated_at: item.updated_at
    }));
  }, [serviceItems]);

  // Calculate stats from service items
  const stats = useMemo(() => {
    const totalGames = games.length;
    const activeGames = games.filter(g => g.is_active).length;
    const totalCapacity = games.reduce((sum, g) => sum + (g.max_players || 0), 0);
    const avgPrice = totalGames > 0
      ? Math.round(games.reduce((sum, g) => sum + (g.price || 0), 0) / totalGames)
      : 0;

    return {
      totalGames,
      activeGames,
      totalCapacity,
      avgPrice
    };
  }, [games]);

  const handleAddComplete = async (data: any) => {
    try {
      // Use the venue ID from the wizard data (if selected by System Admin) or the active context venue
      const targetVenueId = data.venueId || activeVenueId;

      if (!targetVenueId) {
        toast.error("No venue selected. Please select a venue.");
        return;
      }

      const slug = data.slug || data.name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');

      const serviceItemData = {
        venue_id: targetVenueId,
        organization_id: data.organizationId || currentUser?.organizationId, // Ensure org ID is passed
        name: data.name,
        slug: slug,
        description: data.description || '',
        tagline: data.tagline || '',
        difficulty: data.difficulty,
        duration: data.duration || 60,
        min_players: data.minAdults || 1,
        max_players: data.maxAdults || 10,
        price: data.adultPrice || 0,
        child_price: data.childPrice || data.adultPrice || 0,
        min_age: data.minAge || 0,
        success_rate: data.successRate || 0,
        image_url: data.coverImage,
        status: 'active' as const,
        stripe_product_id: data.stripeProductId || null,
        stripe_price_id: data.stripePriceId || null,
        stripe_sync_status: data.stripeSyncStatus || null,
        stripe_last_sync: data.stripeLastSync || null,
        settings: {
          category: data.category,
          eventType: data.eventType,
          gameType: data.gameType || 'physical',
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

      console.log('Creating/Updating service item with data:', serviceItemData);
      let result;
      if (editingServiceItem) {
        result = await updateServiceItem({ id: editingServiceItem.id, updates: serviceItemData });
      } else {
        result = await createServiceItem(serviceItemData as any);
      }
      console.log('Service item created/updated result:', result);
      await refreshServiceItems();
      // Do not close wizard here, let the wizard show success screen
      // setIsAddWizardOpen(false); 
      setEditingServiceItem(null);
      return result;
    } catch (error) {
      console.error("Failed to save game:", error);
      throw error;
    }
  };

  const handleEdit = (game: any) => {
    const item = serviceItems.find((i: any) => i.id === game.id);
    if (item) {
      setEditingServiceItem(item);
      setIsAddWizardOpen(true);
    }
  };

  const handleDuplicate = async (game: any) => {
    const item = serviceItems.find((i: any) => i.id === game.id);
    if (!item) return;

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

      await createServiceItem(duplicateData as any);
      toast.success(`${t.singular} duplicated as "${duplicateName}"`);
    } catch (error) {
      console.error('Error duplicating item:', error);
      toast.error(`Failed to duplicate ${t.singular.toLowerCase()}`);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    await updateServiceItem({
      id,
      updates: { status: !currentStatus ? 'active' : 'inactive' }
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    try {
      await deleteServiceItem(deletingItem.id);
      setDeletingItem(null);
    } catch (error) {
      console.error("Failed to delete game:", error);
    }
  };

  // Convert ServiceItem to Wizard Data format
  const getInitialWizardData = (item: any) => {
    if (!item) return undefined;
    return {
      ...item,
      ...item.settings, // Spread settings first so specific overrides take precedence
      minAdults: item.min_players,
      maxAdults: item.max_players,
      adultPrice: item.price,
      childPrice: item.child_price ?? item.settings?.child_price,
      minAge: item.min_age ?? item.settings?.min_age,
      successRate: item.success_rate,
      coverImage: item.image_url,
    };
  };

  // Function to handle viewing bookings for a service item
  const handleViewBookings = (game: any) => {
    setSelectedBookingService({
      id: game.id,
      name: game.name
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title={t.plural}
        description={`Manage your ${t.plural.toLowerCase()}`}
        sticky
        action={
          <Button
            className="bg-blue-600 dark:bg-[#4f46e5] hover:bg-blue-700 dark:hover:bg-[#4338ca] w-full sm:w-auto h-11"
            onClick={() => {
              setEditingServiceItem(null);
              setIsAddWizardOpen(true);
            }}
          >
            <Plus className="w-5 h-5 sm:w-4 sm:h-4 sm:mr-2" />
            <span className="hidden sm:inline">{t.actionAdd}</span>
          </Button>
        }
      />

      <InventoryStats stats={stats} isLoading={loading} />

      <GameGrid
        games={games}
        isLoading={loading}
        onEdit={handleEdit}
        onViewBookings={handleViewBookings} // Implemented onViewBookings
        onDuplicate={handleDuplicate}
        onDelete={(game) => setDeletingItem(game)}
        onToggleStatus={handleToggleStatus}
        onAddGame={() => setIsAddWizardOpen(true)}
      />

      {/* Add/Edit Wizard Dialog */}
      <Dialog open={isAddWizardOpen} onOpenChange={setIsAddWizardOpen}>
        <DialogContent className="!w-[90vw] !max-w-[1000px] h-[90vh] !max-h-[90vh] overflow-hidden p-0 flex flex-col">
          <VisuallyHidden>
            <DialogTitle>{editingServiceItem ? 'Edit' : 'Add New'} {t.singular}</DialogTitle>
            <DialogDescription>
              Complete the multi-step wizard to {editingServiceItem ? 'edit' : 'add'} a {t.singular.toLowerCase()}
            </DialogDescription>
          </VisuallyHidden>
          <AddServiceItemWizard
            onComplete={handleAddComplete}
            onCancel={() => {
              setIsAddWizardOpen(false);
              setEditingServiceItem(null);
            }}
            mode={editingServiceItem ? "edit" : "create"}
            initialData={getInitialWizardData(editingServiceItem)}
            venueType="escape_room" // Default or fetch from context
            venueId={activeVenueId}
            venueName={activeVenue?.name}
            organizationId={currentUser?.organizationId}
            organizationName={organization?.name}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingItem} onOpenChange={(open) => {
        if (!open) {
          setDeletingItem(null);
          setDeleteConfirmation('');
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this {t.singular.toLowerCase()}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deletingItem?.name}" and all associated data.
              This action cannot be undone.
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Type <span className="font-bold text-red-600">DELETE</span> to confirm:
                </p>
                <Input
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="Type DELETE to confirm"
                  className="w-full"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmation('')}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteConfirmation !== 'DELETE'}
              className="bg-red-600 dark:bg-red-600 hover:bg-red-700 dark:hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete {t.singular}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bookings Dialog */}
      <BookingsDialog
        isOpen={!!selectedBookingService}
        onClose={() => setSelectedBookingService(null)}
        serviceItemId={selectedBookingService?.id || null}
        serviceItemName={selectedBookingService?.name || ''}
      />
    </div>
  );
}
