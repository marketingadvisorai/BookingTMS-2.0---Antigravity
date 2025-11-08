/**
 * Venues Page - Database Version
 * Uses real Supabase database instead of localStorage
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { PageHeader } from '../components/layout/PageHeader';
import { Building2, Plus, Edit, Trash2, MapPin, Phone, Mail, Settings2, Check, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { ScrollArea } from '../components/ui/scroll-area';
import { Separator } from '../components/ui/separator';
import { useVenues } from '../hooks/useVenues';

const venueTypes = [
  { value: 'escape-room', label: 'Escape Room', icon: '🔐' },
  { value: 'smash-room', label: 'Smash Room', icon: '💥' },
  { value: 'axe-throwing', label: 'Axe Throwing', icon: '🪓' },
  { value: 'laser-tag', label: 'Laser Tag', icon: '🔫' },
  { value: 'vr-experience', label: 'VR Experience', icon: '🥽' },
  { value: 'arcade', label: 'Arcade', icon: '🎮' },
  { value: 'other', label: 'Other', icon: '🏢' },
];

export function VenuesDatabase() {
  const { venues, loading, createVenue, updateVenue, deleteVenue } = useVenues();
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States',
    phone: '',
    email: '',
    capacity: 100,
    timezone: 'America/New_York',
    status: 'active' as 'active' | 'inactive' | 'maintenance',
    settings: {},
  });

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      country: 'United States',
      phone: '',
      email: '',
      capacity: 100,
      timezone: 'America/New_York',
      status: 'active',
      settings: {},
    });
  };

  const handleCreateVenue = async () => {
    if (!formData.name) return;
    
    setSubmitting(true);
    try {
      await createVenue(formData);
      setShowCreateDialog(false);
      resetForm();
    } catch (error) {
      console.error('Error creating venue:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateVenue = async () => {
    if (!selectedVenue) return;
    
    setSubmitting(true);
    try {
      await updateVenue(selectedVenue.id, formData);
      setShowEditDialog(false);
      setSelectedVenue(null);
      resetForm();
    } catch (error) {
      console.error('Error updating venue:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteVenue = async () => {
    if (!selectedVenue) return;
    
    setSubmitting(true);
    try {
      await deleteVenue(selectedVenue.id);
      setShowDeleteDialog(false);
      setSelectedVenue(null);
    } catch (error) {
      console.error('Error deleting venue:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditDialog = (venue: any) => {
    setSelectedVenue(venue);
    setFormData({
      name: venue.name,
      address: venue.address || '',
      city: venue.city || '',
      state: venue.state || '',
      zip: venue.zip || '',
      country: venue.country || 'United States',
      phone: venue.phone || '',
      email: venue.email || '',
      capacity: venue.capacity || 100,
      timezone: venue.timezone || 'America/New_York',
      status: venue.status || 'active',
      settings: venue.settings || {},
    });
    setShowEditDialog(true);
  };

  const toggleVenueStatus = async (venue: any) => {
    const newStatus = venue.status === 'active' ? 'inactive' : 'active';
    await updateVenue(venue.id, { status: newStatus });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Venue Management"
        description="Create and manage your venues with real-time database sync"
        sticky
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-gray-200 dark:border-[#2a2a2a]">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-[#4f46e5]/20 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600 dark:text-[#6366f1]" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-[#737373]">Total Venues</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{venues.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 dark:border-[#2a2a2a]">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <Check className="w-6 h-6 text-green-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-[#737373]">Active Venues</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {venues.filter(v => v.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 dark:border-[#2a2a2a]">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Settings2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-[#737373]">Maintenance</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {venues.filter(v => v.status === 'maintenance').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 dark:border-[#2a2a2a]">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-500/20 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-[#737373]">Locations</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {new Set(venues.map(v => v.city)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header with Create Button */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Your Venues</h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-[#737373] mt-1">
            Manage your venues with real-time database sync
          </p>
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="bg-blue-600 dark:bg-[#4f46e5] hover:bg-blue-700 dark:hover:bg-[#4338ca] w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Venue
        </Button>
      </div>

      {/* Venues Grid */}
      {venues.length === 0 ? (
        <Card className="border-gray-200 dark:border-[#2a2a2a]">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-[#1e1e1e] rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-gray-400 dark:text-[#737373]" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No venues yet</h3>
            <p className="text-sm text-gray-600 dark:text-[#737373] mb-6 max-w-md mx-auto">
              Create your first venue to start managing bookings and games.
            </p>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-blue-600 dark:bg-[#4f46e5] hover:bg-blue-700 dark:hover:bg-[#4338ca]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Venue
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {venues.map((venue) => (
            <Card key={venue.id} className="border-gray-200 dark:border-[#2a2a2a] hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-lg truncate">{venue.name}</CardTitle>
                      <p className="text-sm text-gray-600 dark:text-[#737373] truncate">
                        {venue.city}, {venue.state}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={venue.status === 'active' ? 'default' : 'secondary'} 
                    className="flex-shrink-0"
                  >
                    {venue.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  {venue.address && (
                    <div className="flex items-start gap-2 text-gray-600 dark:text-[#737373]">
                      <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{venue.address}</span>
                    </div>
                  )}
                  {venue.phone && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-[#737373]">
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      <span>{venue.phone}</span>
                    </div>
                  )}
                  {venue.email && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-[#737373]">
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{venue.email}</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-[#737373]">Capacity:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{venue.capacity}</span>
                </div>

                <div className="space-y-2">
                  <Button
                    variant="outline"
                    onClick={() => openEditDialog(venue)}
                    className="w-full justify-start"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Venue
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleVenueStatus(venue)}
                      className="flex-1"
                    >
                      {venue.status === 'active' ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedVenue(venue);
                        setShowDeleteDialog(true);
                      }}
                      className="px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog || showEditDialog} onOpenChange={(open) => {
        if (!open) {
          setShowCreateDialog(false);
          setShowEditDialog(false);
          resetForm();
          setSelectedVenue(null);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{showEditDialog ? 'Edit Venue' : 'Create New Venue'}</DialogTitle>
            <DialogDescription>
              {showEditDialog ? 'Update your venue information' : 'Add a new venue to your system'}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Venue Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Downtown Escape Room"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Main St"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="New York"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="NY"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input
                    id="zip"
                    value={formData.zip}
                    onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                    placeholder="10001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                    placeholder="100"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="info@venue.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCreateDialog(false);
              setShowEditDialog(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button
              onClick={showEditDialog ? handleUpdateVenue : handleCreateVenue}
              disabled={!formData.name || submitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {showEditDialog ? 'Update Venue' : 'Create Venue'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{selectedVenue?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteVenue}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete Venue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
