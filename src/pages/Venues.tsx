/**
 * Venues Page
 * Main venue management interface - now with organized modular structure
 */

import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { PageHeader } from '../components/layout/PageHeader';
import { PageLoadingScreen } from '../components/layout/PageLoadingScreen';
import { Calendar, Settings, Eye, Link, X, Plus, Pencil, Trash2, Power, Globe, ExternalLink, Copy, Check, MapPin, Phone, Mail, Globe2, Clock, Building2, ChevronLeft, ChevronRight, Search, Download, AlertCircle, Loader2, CheckCircle2, XCircle, RefreshCcw, Code, Settings2, Edit, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { ScrollArea } from '../components/ui/scroll-area';
import { Separator } from '../components/ui/separator';
import { toast } from 'sonner';
import { isValidEmbedKey, generateEmbedUrl, generateIframeCode } from '../utils/embedKeyUtils';
import { CalendarWidget } from '../components/widgets/CalendarWidget';
import CalendarWidgetSettings from '../components/widgets/CalendarWidgetSettings';
import { EmbedPreview } from '../components/widgets/EmbedPreview';

// Organized imports from new modular structure
import { VENUE_TYPES } from '../utils/venue/venueConstants';
import { useVenueManagement } from '../hooks/venue/useVenueManagement';
import { handleCopyEmbedCode, handleDownloadHTML, generateEmbedCode } from '../utils/venue/venueEmbedUtils';

export default function Venues() {
  // Use centralized venue management hook
  const {
    venues,
    loading,
    selectedVenue,
    formData,
    searchTerm,
    isLoading,
    isRefreshing,
    copiedEmbed,
    showCreateDialog,
    showEditDialog,
    showDeleteDialog,
    showWidgetSettings,
    showWidgetPreview,
    showEmbedCode,
    canCreateVenue,
    canEditVenue,
    canDeleteVenue,
    setSelectedVenue,
    setFormData,
    setSearchTerm,
    setShowCreateDialog,
    setShowEditDialog,
    setShowDeleteDialog,
    deleteConfirmation,
    setDeleteConfirmation,
    setShowWidgetSettings,
    setShowWidgetPreview,
    setShowEmbedCode,
    setCopiedEmbed,
    saveStatus,
    handleRefresh,
    handleCreateVenue,
    handleUpdateVenue,
    handleDeleteVenue,
    toggleVenueStatus,
    handleUpdateWidgetConfig,
    resetForm,
    openEditDialog,
  } = useVenueManagement();

  // Helper function for venue type display
  const getVenueTypeInfo = (type: string) => {
    return VENUE_TYPES.find(vt => vt.value === type) || VENUE_TYPES[VENUE_TYPES.length - 1];
  };

  // Get fresh venue data from venues array
  const getFreshVenueData = (venueId: string) => {
    return venues.find(v => v.id === venueId);
  };

  if (loading || isLoading) {
    return <PageLoadingScreen message="Loading venues..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Venue Management"
        description="Create and manage multiple venues with individual booking widgets"
        sticky
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="h-11"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCcw className={`w-4 h-4 sm:mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            {canCreateVenue && (
              <Button
                className="bg-blue-600 dark:bg-[#4f46e5] hover:bg-blue-700 dark:hover:bg-[#4338ca] h-11"
                onClick={() => setShowCreateDialog(true)}
              >
                <Plus className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Add Venue</span>
              </Button>
            )}
          </div>
        }
      />

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
                  {venues.filter(v => v.isActive).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 dark:border-[#2a2a2a]">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Code className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-[#737373]">Widgets Created</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{venues.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 dark:border-[#2a2a2a]">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Settings2 className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-[#737373]">Total Events</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {venues.reduce((sum, v) => sum + (v.widgetConfig?.activities?.length || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Your Venues</h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-[#737373] mt-1">
            Manage your venues and their booking widgets
          </p>
        </div>
        {canCreateVenue && (
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-blue-600 dark:bg-[#4f46e5] hover:bg-blue-700 dark:hover:bg-[#4338ca] w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Venue
          </Button>
        )}
      </div>

      {venues.length === 0 ? (
        <Card className="border-gray-200 dark:border-[#2a2a2a]">
          <CardContent className="p-6 sm:p-12 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 dark:bg-[#1e1e1e] rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 dark:text-[#737373]" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">No venues yet</h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-[#737373] mb-6 max-w-md mx-auto px-4">
              Create your first venue to start managing booking widgets for different locations like escape rooms, smash rooms, or axe throwing venues.
            </p>
            {canCreateVenue && (
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="bg-blue-600 dark:bg-[#4f46e5] hover:bg-blue-700 dark:hover:bg-[#4338ca] w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Venue
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {venues.map((venue) => {
            const venueTypeInfo = getVenueTypeInfo(venue.type);
            return (
              <Card key={venue.id} className="border-gray-200 dark:border-[#2a2a2a] hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3 sm:pb-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <div
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-xl sm:text-2xl flex-shrink-0"
                        style={{ backgroundColor: venue.primaryColor + '20' }}
                      >
                        {venueTypeInfo.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-base sm:text-lg truncate">{venue.name}</CardTitle>
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {venueTypeInfo.label}
                        </Badge>
                      </div>
                    </div>
                    <Badge variant={venue.isActive ? "default" : "secondary"} className="text-xs flex-shrink-0">
                      {venue.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {venue.description && (
                    <p className="text-sm text-gray-600 dark:text-[#737373] line-clamp-2">
                      {venue.description}
                    </p>
                  )}

                  <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                    {venue.address && (
                      <div className="flex items-start gap-2 text-gray-600 dark:text-[#737373]">
                        <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{venue.address}</span>
                      </div>
                    )}
                    {venue.phone && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-[#737373]">
                        <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="truncate">{venue.phone}</span>
                      </div>
                    )}
                    {venue.email && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-[#737373]">
                        <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="truncate">{venue.email}</span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between text-xs sm:text-sm mb-3">
                    <span className="text-gray-600 dark:text-[#737373]">Events/Rooms:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {venue.widgetConfig?.activities?.length || 0}
                    </span>
                  </div>

                  {/* Action Buttons - Vertical Stack */}
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        const freshVenue = getFreshVenueData(venue.id) || venue;
                        console.log('Opening widget settings for:', freshVenue.name, 'Activities:', freshVenue.widgetConfig?.activities?.length || 0);
                        setSelectedVenue(freshVenue);
                        setShowWidgetSettings(true);
                      }}
                      className="w-full justify-start h-9 text-sm font-normal hover:bg-gray-50 dark:hover:bg-[#1e1e1e]"
                    >
                      <Settings2 className="w-4 h-4 mr-2 text-gray-600 dark:text-[#737373]" />
                      <span className="text-gray-900 dark:text-white">Configure</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const freshVenue = getFreshVenueData(venue.id) || venue;
                        console.log('Opening preview for:', freshVenue.name, 'Activities:', freshVenue.widgetConfig?.activities?.length || 0);
                        setSelectedVenue(freshVenue);
                        setShowWidgetPreview(true);
                      }}
                      className="w-full justify-start h-9 text-sm font-normal hover:bg-gray-50 dark:hover:bg-[#1e1e1e]"
                    >
                      <Eye className="w-4 h-4 mr-2 text-gray-600 dark:text-[#737373]" />
                      <span className="text-gray-900 dark:text-white">Preview</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const freshVenue = getFreshVenueData(venue.id) || venue;
                        if (!freshVenue.embedKey) {
                          toast.info('Embed key is still being generated. Please refresh and try again.');
                          return;
                        }
                        setSelectedVenue(freshVenue);
                        setShowEmbedCode(true);
                      }}
                      className="w-full justify-start h-9 text-sm font-normal hover:bg-gray-50 dark:hover:bg-[#1e1e1e]"
                    >
                      <Code className="w-4 h-4 mr-2 text-gray-600 dark:text-[#737373]" />
                      <span className="text-gray-900 dark:text-white">Embed</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => openEditDialog(venue)}
                      className="w-full justify-start h-9 text-sm font-normal hover:bg-gray-50 dark:hover:bg-[#1e1e1e]"
                    >
                      <Edit className="w-4 h-4 mr-2 text-gray-600 dark:text-[#737373]" />
                      <span className="text-gray-900 dark:text-white">Edit Venue</span>
                    </Button>
                  </div>

                  <Separator className="my-3" />

                  {/* Status and Delete Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleVenueStatus(venue.id)}
                      className="flex-1 h-9 text-xs"
                    >
                      {venue.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedVenue(venue);
                        setShowDeleteDialog(true);
                      }}
                      className="h-9 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
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
        <DialogContent className="!w-screen !h-screen !max-w-none !max-h-none sm:!w-[90vw] sm:!h-[90vh] sm:!max-w-[1200px] sm:!max-h-[90vh] !rounded-none sm:!rounded-lg overflow-hidden p-0 flex flex-col">
          <DialogHeader className="bg-white dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-[#2a2a2a] p-4 sm:p-6 shrink-0">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <DialogTitle className="text-base sm:text-lg truncate">{showEditDialog ? 'Edit Venue' : 'Create New Venue'}</DialogTitle>
                <DialogDescription className="text-xs sm:text-sm">
                  {showEditDialog ? 'Update venue information and widget settings' : 'Add a new venue with its own booking widget'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <ScrollArea className="flex-1 overflow-auto">
            <div className="space-y-4 p-4 sm:p-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm">Venue Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Downtown Escape Room"
                  className="h-10 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type" className="text-sm">Venue Type *</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VENUE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <span className="flex items-center gap-2">
                          <span>{type.icon}</span>
                          <span>{type.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of your venue..."
                  rows={3}
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Main St, City, State 12345"
                  className="h-10 text-sm"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                    className="h-10 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="info@venue.com"
                    className="h-10 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="website" className="text-sm">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://www.yourvenue.com"
                  className="h-10 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="primaryColor" className="text-sm">Brand Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="w-16 sm:w-20 h-10 cursor-pointer"
                  />
                  <Input
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    placeholder="#2563eb"
                    className="flex-1 h-10 text-sm"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">This color will be used in your booking widget</p>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="bg-white dark:bg-[#1e1e1e] border-t border-gray-200 dark:border-[#2a2a2a] p-4 sm:p-6 shrink-0 flex-col-reverse sm:flex-row gap-2">
            <Button variant="outline" onClick={() => {
              setShowCreateDialog(false);
              setShowEditDialog(false);
              resetForm();
            }} className="w-full sm:w-auto h-10 sm:h-11">
              Cancel
            </Button>
            <Button
              onClick={showEditDialog ? handleUpdateVenue : handleCreateVenue}
              disabled={!formData.name || isLoading}
              className="bg-blue-600 dark:bg-[#4f46e5] hover:bg-blue-700 dark:hover:bg-[#4338ca] w-full sm:w-auto h-10 sm:h-11"
            >
              {isLoading ? 'Saving...' : (showEditDialog ? 'Update Venue' : 'Create Venue')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Widget Settings Dialog */}
      <Dialog open={showWidgetSettings} onOpenChange={setShowWidgetSettings}>
        <DialogContent className="!w-screen !h-screen !max-w-none !max-h-none sm:!w-[90vw] sm:!h-[90vh] sm:!max-w-[1200px] sm:!max-h-[90vh] !rounded-none sm:!rounded-lg overflow-hidden p-0 flex flex-col">
          <DialogHeader className="bg-white dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-[#2a2a2a] p-4 sm:p-6 shrink-0">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-base sm:text-lg text-gray-900 dark:text-white truncate">
                  Configure Widget for {selectedVenue?.name}
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-gray-600 dark:text-[#a3a3a3] mt-0.5 hidden sm:block">
                  Add events/rooms and customize your booking widget settings
                </DialogDescription>
              </div>

              {/* Save Status Indicator */}
              <div className="flex items-center gap-3 flex-shrink-0">
                {saveStatus === 'saving' && (
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm hidden sm:inline">Saving...</span>
                  </div>
                )}
                {saveStatus === 'saved' && (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm hidden sm:inline">Saved ✓</span>
                  </div>
                )}
                {saveStatus === 'error' && (
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <XCircle className="w-4 h-4" />
                    <span className="text-sm hidden sm:inline">Error saving</span>
                  </div>
                )}

                <Button
                  onClick={() => setShowWidgetSettings(false)}
                  className="bg-blue-600 dark:bg-[#4f46e5] hover:bg-blue-700 dark:hover:bg-[#4338ca] text-xs sm:text-sm h-9 sm:h-10"
                  size="sm"
                >
                  <Save className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Save Changes</span>
                </Button>
              </div>
            </div>
          </DialogHeader>
          <ScrollArea className="flex-1 h-full">
            <div className="p-4 sm:p-6 pb-20 sm:pb-24 bg-gray-50 dark:bg-[#0a0a0a]">
              {selectedVenue && (
                <CalendarWidgetSettings
                  key={`widget-settings-${selectedVenue.id}`}
                  config={selectedVenue.widgetConfig}
                  onConfigChange={handleUpdateWidgetConfig}
                  onPreview={() => {
                    setShowWidgetSettings(false);
                    setShowWidgetPreview(true);
                  }}
                  embedContext={{
                    embedKey: selectedVenue.embedKey,
                    primaryColor: selectedVenue.primaryColor,
                    venueName: selectedVenue.name,
                    baseUrl: typeof window !== 'undefined' ? window.location.origin : '',
                    venueId: selectedVenue.id
                  }}
                  saveStatus={saveStatus}
                />
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Widget Preview Dialog */}
      <Dialog open={showWidgetPreview} onOpenChange={setShowWidgetPreview}>
        <DialogContent className="!w-screen !h-screen !max-w-none !max-h-none sm:!w-[90vw] sm:!h-[90vh] sm:!max-w-[1400px] sm:!max-h-[90vh] !rounded-none sm:!rounded-lg overflow-hidden p-0 flex flex-col">
          <DialogHeader className="bg-white dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-[#2a2a2a] p-4 sm:p-6 shrink-0">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <DialogTitle className="text-base sm:text-lg text-gray-900 dark:text-white truncate">
                  Widget Preview - {selectedVenue?.name}
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-gray-600 dark:text-[#a3a3a3] mt-0.5 hidden sm:block">
                  Live Preview - See how your booking widget will look to customers
                </DialogDescription>
              </div>
              <Badge variant="secondary" className="bg-gray-100 dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2a2a2a] text-xs flex-shrink-0 hidden sm:inline-flex">
                Widget Preview
              </Badge>
            </div>
          </DialogHeader>
          <ScrollArea className="flex-1 h-full">
            <div className="p-4 sm:p-8 pb-24 sm:pb-28 bg-gray-50 dark:bg-[#0a0a0a] min-h-full">
              {selectedVenue && (
                <CalendarWidget
                  key={`widget-preview-${selectedVenue.id}`}
                  primaryColor={selectedVenue.primaryColor}
                  config={{
                    // Debug: Expose createVenue to window
                    embedKey: selectedVenue.embedKey,
                    ...selectedVenue.widgetConfig, // Ensure existing config is spread
                    venueId: selectedVenue.id,
                    venueName: selectedVenue.name,
                  } as any}
                />
              )}
              <div className="h-12 sm:h-20" />
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Embed Code Dialog */}
      <Dialog open={showEmbedCode} onOpenChange={setShowEmbedCode}>
        <DialogContent className="!w-screen !h-screen !max-w-none !max-h-none sm:!w-[90vw] sm:!h-[90vh] sm:!max-w-[1200px] sm:!max-h-[90vh] !rounded-none sm:!rounded-lg overflow-hidden p-0 flex flex-col">
          <DialogHeader className="bg-white dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-[#2a2a2a] p-4 sm:p-6 shrink-0">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <DialogTitle className="text-base sm:text-lg text-gray-900 dark:text-white truncate">
                  Embed Widget for {selectedVenue?.name}
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-gray-600 dark:text-[#a3a3a3] mt-0.5 hidden sm:block">
                  Get the embed code and install the widget on your website
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <ScrollArea className="flex-1 h-full overflow-x-hidden">
            <div className="p-2 sm:p-4 md:p-6 pb-20 sm:pb-24 bg-gray-50 dark:bg-[#0a0a0a] w-full max-w-full">
              {selectedVenue && (
                selectedVenue.embedKey ? (
                  <div className="w-full max-w-full overflow-x-hidden">
                    <EmbedPreview
                      widgetId="calendar"
                      widgetName={selectedVenue.name}
                      primaryColor={selectedVenue.primaryColor}
                      embedKey={selectedVenue.embedKey}
                      widgetConfig={selectedVenue.widgetConfig}
                    />
                  </div>
                ) : (
                  <div className="p-4 sm:p-6 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-[#111] text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    The embed key for this venue is still being generated. Please refresh in a few seconds and try again.
                  </div>
                )
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={(open) => {
        if (!open) {
          setShowDeleteDialog(false);
          setDeleteConfirmation('');
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Venue</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedVenue?.name}"? This action cannot be undone and will remove all associated widget configurations.
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
              onClick={handleDeleteVenue}
              disabled={deleteConfirmation !== 'DELETE'}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete Venue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
