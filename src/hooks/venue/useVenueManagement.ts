/**
 * Venue Management Hook
 * Centralized state management and business logic for venues
 */

import { useState } from 'react';
import { toast } from 'sonner';
import { useVenues as useVenuesDB } from '../useVenues';
import { useAuth } from '../../lib/auth/AuthContext';
import { Venue, VenueInput, VenueFormData } from '../../types/venue';
import { VenueWidgetConfig, createDefaultVenueWidgetConfig } from '../../types/venueWidget';
import { mapDBVenueToUI, mapUIVenueToDB } from '../../utils/venue/venueMappers';
import { DEFAULT_FORM_DATA } from '../../utils/venue/venueConstants';

export function useVenueManagement() {
  const { currentUser } = useAuth();
  const { 
    venues: dbVenues, 
    loading: dbLoading, 
    createVenue: createVenueDB, 
    updateVenue: updateVenueDB, 
    deleteVenue: deleteVenueDB, 
    refreshVenues 
  } = useVenuesDB();

  // State
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showWidgetSettings, setShowWidgetSettings] = useState(false);
  const [showWidgetPreview, setShowWidgetPreview] = useState(false);
  const [showEmbedCode, setShowEmbedCode] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [formData, setFormData] = useState<VenueFormData>(DEFAULT_FORM_DATA);

  // Transform database venues to UI format
  const venues = dbVenues.map(mapDBVenueToUI);
  const loading = dbLoading;

  // Permission checks
  const canCreateVenue = ['super-admin', 'beta-owner', 'admin', 'manager'].includes(currentUser?.role || '');
  const canEditVenue = ['super-admin', 'beta-owner', 'admin', 'manager'].includes(currentUser?.role || '');
  const canDeleteVenue = ['super-admin', 'beta-owner', 'admin'].includes(currentUser?.role || '');

  // Handlers
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshVenues();
      toast.success('All venue data refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh venue data');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCreateVenue = async () => {
    if (!canCreateVenue) {
      toast.error('You do not have permission to create venues');
      return;
    }
    setIsLoading(true);
    try {
      const newVenue: VenueInput = {
        ...formData,
        widgetConfig: createDefaultVenueWidgetConfig(),
        isActive: true,
      };
      
      await createVenueDB(mapUIVenueToDB(newVenue));
      setShowCreateDialog(false);
      resetForm();
      toast.success('Venue created! Embed key generated automatically.');
    } catch (error) {
      console.error('Error creating venue:', error);
      toast.error('Failed to create venue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateVenue = async () => {
    if (!selectedVenue) return;
    if (!canEditVenue) {
      toast.error('You do not have permission to edit venues');
      return;
    }
    setIsLoading(true);
    try {
      const updatedVenue = { ...selectedVenue, ...formData };
      await updateVenueDB(selectedVenue.id, mapUIVenueToDB(updatedVenue));
      setShowEditDialog(false);
      setSelectedVenue(null);
      resetForm();
    } catch (error) {
      console.error('Error updating venue:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteVenue = async () => {
    if (!selectedVenue) return;
    if (!canDeleteVenue) {
      toast.error('You do not have permission to delete venues');
      return;
    }
    setIsLoading(true);
    try {
      await deleteVenueDB(selectedVenue.id);
      setShowDeleteDialog(false);
      setSelectedVenue(null);
    } catch (error) {
      console.error('Error deleting venue:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVenueStatus = async (venueId: string) => {
    const venue = venues.find(v => v.id === venueId);
    if (!venue) return;
    
    try {
      const updatedVenue = { ...venue, isActive: !venue.isActive };
      await updateVenueDB(venueId, mapUIVenueToDB(updatedVenue));
    } catch (error) {
      console.error('Error toggling venue status:', error);
    }
  };

  const handleUpdateWidgetConfig = async (config: VenueWidgetConfig) => {
    if (!selectedVenue) return;
    
    try {
      const updatedVenue = { 
        ...selectedVenue, 
        widgetConfig: config,
      };
      
      await updateVenueDB(selectedVenue.id, mapUIVenueToDB(updatedVenue));
      setSelectedVenue(updatedVenue);
      
      console.log('Widget config updated for venue:', updatedVenue.name, 'Games:', config.games?.length || 0);
    } catch (error) {
      console.error('Error updating widget config:', error);
    }
  };

  const resetForm = () => {
    setFormData(DEFAULT_FORM_DATA);
  };

  const openEditDialog = (venue: Venue) => {
    setSelectedVenue(venue);
    setFormData({
      name: venue.name,
      type: venue.type,
      description: venue.description,
      address: venue.address,
      phone: venue.phone,
      email: venue.email,
      website: venue.website,
      primaryColor: venue.primaryColor,
    });
    setShowEditDialog(true);
  };

  return {
    // Data
    venues,
    loading,
    selectedVenue,
    formData,
    searchTerm,
    isLoading,
    isRefreshing,
    copiedEmbed,
    
    // Dialog states
    showCreateDialog,
    showEditDialog,
    showDeleteDialog,
    showWidgetSettings,
    showWidgetPreview,
    showEmbedCode,
    
    // Permissions
    canCreateVenue,
    canEditVenue,
    canDeleteVenue,
    
    // Setters
    setSelectedVenue,
    setFormData,
    setSearchTerm,
    setShowCreateDialog,
    setShowEditDialog,
    setShowDeleteDialog,
    setShowWidgetSettings,
    setShowWidgetPreview,
    setShowEmbedCode,
    setCopiedEmbed,
    
    // Handlers
    handleRefresh,
    handleCreateVenue,
    handleUpdateVenue,
    handleDeleteVenue,
    toggleVenueStatus,
    handleUpdateWidgetConfig,
    resetForm,
    openEditDialog,
  };
}
