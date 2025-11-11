/**
 * CalendarWidgetSettings Component
 * 
 * SHARED CONFIGURATION INTERFACE:
 * 
 * This component is MODULE-AGNOSTIC and used by multiple contexts:
 * 
 * 1. VENUES MODULE (Current):
 *    - Configures actual venue widget settings
 *    - embedContext.venueId present
 *    - Saves to database (venue.widget_config)
 *    - Manages real games with Stripe integration
 *    - Full game CRUD operations
 * 
 * 2. BOOKING WIDGETS MODULE (Future):
 *    - Configures template demo settings
 *    - NO embedContext.venueId
 *    - Saves to local state only
 *    - Manages demo games (no Stripe)
 *    - Template customization
 * 
 * FEATURES:
 * - General tab: Display options, widget header
 * - Games tab: Game management (via wizard)
 * - Availability tab: Blocked dates, custom dates
 * - Custom tab: Custom settings panel
 * - SEO tab: SEO optimization
 * - Advanced tab: Advanced options
 * 
 * SEPARATION:
 * - This component doesn't know about Venues or Widgets
 * - It just manages VenueWidgetConfig
 * - Context (venue vs widget) determined by embedContext
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { Plus, Trash2, Upload, Eye, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ScrollArea } from '../ui/scroll-area';
import { toast } from 'sonner';
import AddGameWizard from '../../components/games/AddGameWizard';
import CustomSettingsPanel from './CustomSettingsPanel';
import { Game, GameInput } from '../../services/DataSyncService';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import { useGames } from '../../hooks/useGames';

interface EmbedContext {
  embedKey?: string;
  primaryColor?: string;
  venueName?: string;
  baseUrl?: string;
  venueId?: string;
}

interface CalendarWidgetSettingsProps {
  config: any;
  onConfigChange: (config: any) => void;
  onPreview: () => void;
  embedContext?: EmbedContext;
}

const generateSlug = (value: string | undefined) => {
  if (!value) return 'game';
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-') || 'game';
};

export default function CalendarWidgetSettings({ config, onConfigChange, onPreview, embedContext }: CalendarWidgetSettingsProps) {
  const [activeTab, setActiveTab] = useState('general');
  const [showAddGameWizard, setShowAddGameWizard] = useState(false);
  const [editingGame, setEditingGame] = useState<any>(null);
  const { games: supabaseGames, createGame, updateGame: updateSupabaseGame, deleteGame: deleteSupabaseGame, loading: gamesLoading } = useGames(embedContext?.venueId);

  const mapSupabaseGameToWidgetGame = (game: any) => {
    const settings = game.settings || {};
    return {
      id: game.id,
      name: game.name,
      description: game.description,
      tagline: game.tagline,
      difficulty: game.difficulty,
      duration: game.duration,
      minPlayers: game.min_players,
      maxPlayers: game.max_players,
      min_players: game.min_players, // backwards compatibility for existing UI
      max_players: game.max_players,
      price: game.price,
      childPrice: game.child_price,
      child_price: game.child_price,
      status: game.status,
      image: game.image_url,
      imageUrl: game.image_url,
      coverImage: game.image_url,
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
      stripe_price_id: game.stripe_price_id || null,
      stripe_product_id: game.stripe_product_id || null,
      stripe_sync_status: game.stripe_sync_status || 'pending',
    };
  };

  const supabaseGamesForWidget = useMemo(() => supabaseGames.map(mapSupabaseGameToWidgetGame), [supabaseGames]);

  useEffect(() => {
    const currentGames = Array.isArray(config?.games) ? config.games : [];

    const hasDifference =
      currentGames.length !== supabaseGamesForWidget.length ||
      currentGames.some((game: any, index: number) => {
        const supaGame = supabaseGamesForWidget[index];
        if (!supaGame) return true;
        return JSON.stringify(game) !== JSON.stringify(supaGame);
      });

    if (hasDifference) {
      onConfigChange({
        ...config,
        games: supabaseGamesForWidget,
      });
    }
  }, [supabaseGamesForWidget, config, onConfigChange]);

  const handleGeneralSettingChange = (key: string, value: any) => {
    onConfigChange({
      ...config,
      [key]: value
    });
  };

  const handleAddGame = () => {
    setEditingGame(null);
    setShowAddGameWizard(true);
  };

  const handleUpdateGame = (gameId: string, updates: any) => {
    onConfigChange({
      ...config,
      games: config.games.map((game: any) =>
        game.id === gameId ? { ...game, ...updates } : game
      )
    });
  };

  const handleDeleteGame = (gameId: string) => {
    onConfigChange({
      ...config,
      games: config.games.filter((game: any) => game.id !== gameId)
    });
  };

  const handleWizardComplete = async (gameData: any) => {
    if (!embedContext?.venueId) {
      toast.error('Venue ID is required to create games');
      console.error('Missing venueId in embedContext:', embedContext);
      return;
    }

    try {
      const slug = generateSlug(gameData.slug || gameData.name);
      
      console.log('Creating game with data:', {
        venueId: embedContext.venueId,
        name: gameData.name,
        difficulty: gameData.difficulty,
      });
      
      // Map wizard data to Supabase games table schema
      const supabaseGameData = {
        venue_id: embedContext.venueId,
        name: gameData.name,
        slug: slug,
        description: gameData.description || '',
        tagline: gameData.tagline || '',
        difficulty: mapDifficultyToEnum(gameData.difficulty),
        duration: gameData.duration || 60,
        min_players: gameData.minAdults || 2,
        max_players: gameData.maxAdults || 8,
        price: gameData.adultPrice || 0,
        child_price: gameData.childPrice || gameData.adultPrice || 0,
        min_age: gameData.minAge || 0,
        success_rate: gameData.successRate || 75,
        image_url: gameData.coverImage || 'https://images.unsplash.com/photo-1569002925653-ed18f55d7292?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
        status: 'active' as const,
        settings: {
          category: gameData.category,
          eventType: gameData.eventType,
          gameType: gameData.gameType || 'physical',
          minChildren: gameData.minChildren,
          maxChildren: gameData.maxChildren,
          language: gameData.language,
          activityDetails: gameData.activityDetails,
          additionalInformation: gameData.additionalInformation,
          faqs: gameData.faqs,
          cancellationPolicies: gameData.cancellationPolicies,
          accessibility: gameData.accessibility,
          location: gameData.location,
          galleryImages: gameData.galleryImages,
          videos: gameData.videos,
          operatingDays: gameData.operatingDays,
          startTime: gameData.startTime,
          endTime: gameData.endTime,
          slotInterval: gameData.slotInterval,
          advanceBooking: gameData.advanceBooking,
          customDates: gameData.customDates || [],
          blockedDates: gameData.blockedDates || [],
          customHours: gameData.customHours || {},
          customHoursEnabled: gameData.customHoursEnabled || false,
          selectedWidget: gameData.selectedWidget || 'calendar-single-event',
          requiresWaiver: gameData.requiresWaiver,
          selectedWaiver: gameData.selectedWaiver,
          cancellationWindow: gameData.cancellationWindow,
          specialInstructions: gameData.specialInstructions,
          availability: {},
        },
      };

      console.log('Mapped Supabase game data:', supabaseGameData);

      if (editingGame?.id && !editingGame.id.startsWith('game-')) {
        // Update existing game in Supabase
        console.log('Updating game:', editingGame.id);
        await updateSupabaseGame(editingGame.id, supabaseGameData);
        toast.success('Experience updated successfully!');
      } else {
        // Create new game in Supabase
        console.log('Creating new game in Supabase');
        const result = await createGame(supabaseGameData);
        console.log('Game created successfully:', result);
        toast.success('Experience created successfully!');
      }
      
      setShowAddGameWizard(false);
      setEditingGame(null);
    } catch (error: any) {
      console.error('Error saving game:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
        error: error,
      });
      const errorMessage = error?.message || error?.details || error?.hint || 'Failed to save experience';
      toast.error(errorMessage);
    }
  };

  // Helper function to map difficulty values
  const mapDifficultyToEnum = (difficulty: any): 'Easy' | 'Medium' | 'Hard' | 'Expert' => {
    if (typeof difficulty === 'string') {
      const normalized = difficulty.toLowerCase();
      if (normalized.includes('easy')) return 'Easy';
      if (normalized.includes('hard') || normalized.includes('expert') || normalized.includes('extreme')) return 'Hard';
      return 'Medium';
    }
    // If it's a number (1-5 scale)
    if (typeof difficulty === 'number') {
      if (difficulty <= 2) return 'Easy';
      if (difficulty >= 4) return 'Hard';
      return 'Medium';
    }
    return 'Medium';
  };

  const handleWizardCancel = () => {
    setShowAddGameWizard(false);
    setEditingGame(null);
  };

  const handleEditGame = (game: any) => {
    setEditingGame(game);
    setShowAddGameWizard(true);
  };

  const convertGameToWizardData = (game: any) => {
    // Handle both Supabase game schema and old widget config schema
    const settings = game.settings || {};
    
    return {
      name: game.name,
      description: game.description,
      category: settings.category || 'Adventure',
      tagline: game.tagline || '',
      eventType: settings.eventType || 'public',
      gameType: settings.gameType || 'physical',
      minAdults: game.min_players || 2,
      maxAdults: game.max_players || 8,
      minChildren: settings.minChildren || 0,
      maxChildren: settings.maxChildren || 4,
      adultPrice: game.price || 30,
      childPrice: game.child_price || game.price || 25,
      duration: game.duration || 60,
      difficulty: game.difficulty || 'Medium',
      minAge: game.min_age || 12,
      language: settings.language || ['English'],
      successRate: game.success_rate || 75,
      activityDetails: settings.activityDetails || '',
      additionalInformation: settings.additionalInformation || '',
      faqs: settings.faqs || [],
      cancellationPolicies: settings.cancellationPolicies || [],
      accessibility: settings.accessibility || { strollerAccessible: true, wheelchairAccessible: false },
      location: settings.location || '',
      coverImage: game.image_url || '',
      galleryImages: settings.galleryImages || [],
      videos: settings.videos || [],
      operatingDays: settings.operatingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      startTime: settings.startTime || '09:00',
      endTime: settings.endTime || '21:00',
      slotInterval: settings.slotInterval || 60,
      advanceBooking: settings.advanceBooking || 30,
      requiresWaiver: settings.requiresWaiver || false,
      selectedWaiver: settings.selectedWaiver || null,
      cancellationWindow: settings.cancellationWindow || 24,
      specialInstructions: settings.specialInstructions || '',
      customCapacityFields: settings.customCapacityFields || [],
      groupDiscount: settings.groupDiscount || false,
      dynamicPricing: settings.dynamicPricing || false,
      peakPricing: settings.peakPricing || {
        enabled: false,
        weekdayPeakPrice: 0,
        weekendPeakPrice: 0,
        peakStartTime: '',
        peakEndTime: '',
      },
      groupTiers: settings.groupTiers || [],
      customDates: settings.customDates || [],
      blockedDates: settings.blockedDates || [],
      customHours: settings.customHours || {},
      customHoursEnabled: settings.customHoursEnabled || false,
      selectedWidget: settings.selectedWidget || 'calendar-single-event',
      slug: game.slug || generateSlug(game.name),
    };
  };

  const handleAddTicketType = () => {
    const newTicketType = {
      id: `ticket-${Date.now()}`,
      name: 'New Ticket Type',
      description: 'Description',
      price: 30
    };
    onConfigChange({
      ...config,
      ticketTypes: [...(config.ticketTypes || []), newTicketType]
    });
  };

  const handleUpdateTicketType = (ticketId: string, updates: any) => {
    onConfigChange({
      ...config,
      ticketTypes: config.ticketTypes.map((ticket: any) =>
        ticket.id === ticketId ? { ...ticket, ...updates } : ticket
      )
    });
  };

  const handleDeleteTicketType = (ticketId: string) => {
    onConfigChange({
      ...config,
      ticketTypes: config.ticketTypes.filter((ticket: any) => ticket.id !== ticketId)
    });
  };

  const handleAddQuestion = () => {
    const newQuestion = {
      id: `q-${Date.now()}`,
      question: 'New Question',
      type: 'select',
      options: ['Option 1', 'Option 2'],
      required: false
    };
    onConfigChange({
      ...config,
      additionalQuestions: [...(config.additionalQuestions || []), newQuestion]
    });
  };

  const handleUpdateQuestion = (questionId: string, updates: any) => {
    onConfigChange({
      ...config,
      additionalQuestions: config.additionalQuestions.map((q: any) =>
        q.id === questionId ? { ...q, ...updates } : q
      )
    });
  };

  const handleDeleteQuestion = (questionId: string) => {
    onConfigChange({
      ...config,
      additionalQuestions: config.additionalQuestions.filter((q: any) => q.id !== questionId)
    });
  };

  return (
    <div className="space-y-6 pb-24 sm:pb-28">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-gray-900">Calendar Widget Settings</h2>
          <p className="text-sm text-gray-600 mt-1">Configure your booking widget appearance and options</p>
        </div>
        <Button onClick={onPreview} variant="outline" className="flex items-center gap-2">
          <Eye className="w-4 h-4" />
          Preview Widget
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 gap-1">
          <TabsTrigger value="general" className="text-xs sm:text-sm">General</TabsTrigger>
          <TabsTrigger value="games" className="text-xs sm:text-sm">Games</TabsTrigger>
          <TabsTrigger value="availability" className="text-xs sm:text-sm">Availability</TabsTrigger>
          <TabsTrigger value="custom" className="text-xs sm:text-sm">Custom</TabsTrigger>
          <TabsTrigger value="seo" className="text-xs sm:text-sm">SEO</TabsTrigger>
          <TabsTrigger value="advanced" className="text-xs sm:text-sm">Advanced</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6 pb-24">
          <Card>
            <CardHeader>
              <CardTitle>Display Options</CardTitle>
              <CardDescription>Control what elements appear in your widget</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Secured Badge</Label>
                  <p className="text-sm text-gray-500">Display security badge in header</p>
                </div>
                <Switch
                  checked={config.showSecuredBadge}
                  onCheckedChange={(checked) => handleGeneralSettingChange('showSecuredBadge', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Health & Safety</Label>
                  <p className="text-sm text-gray-500">Display health and safety badge</p>
                </div>
                <Switch
                  checked={config.showHealthSafety}
                  onCheckedChange={(checked) => handleGeneralSettingChange('showHealthSafety', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Veteran Discount</Label>
                  <p className="text-sm text-gray-500">Show veteran ticket pricing option</p>
                </div>
                <Switch
                  checked={config.enableVeteranDiscount}
                  onCheckedChange={(checked) => handleGeneralSettingChange('enableVeteranDiscount', checked)}
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Widget Header</CardTitle>
              <CardDescription>Customize the title and description of your widget</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="widget-title">Widget Title</Label>
                <Input
                  id="widget-title"
                  value={config.widgetTitle}
                  onChange={(e) => handleGeneralSettingChange('widgetTitle', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="widget-description">Widget Description</Label>
                <Textarea
                  id="widget-description"
                  value={config.widgetDescription}
                  onChange={(e) => handleGeneralSettingChange('widgetDescription', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Theme & Preview</CardTitle>
              <CardDescription>Control font, timezone label, and preview behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="font-family">Font Family</Label>
                  <Input
                    id="font-family"
                    placeholder="e.g., Inter, Arial, 'Playfair Display'"
                    value={config.fontFamily || ''}
                    onChange={(e) => handleGeneralSettingChange('fontFamily', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone-label">Timezone Label</Label>
                  <Input
                    id="timezone-label"
                    placeholder="e.g., PST, Local Time"
                    value={config.timezoneLabel || ''}
                    onChange={(e) => handleGeneralSettingChange('timezoneLabel', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="slot-duration">Slot Duration (minutes)</Label>
                  <Input
                    id="slot-duration"
                    type="number"
                    min={15}
                    step={15}
                    value={Number(config.slotDurationMinutes ?? 90)}
                    onChange={(e) => handleGeneralSettingChange('slotDurationMinutes', parseInt(e.target.value || '90', 10))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Preview Role</Label>
                  <Select
                    value={(config.previewRole || 'customer')}
                    onValueChange={(value) => handleGeneralSettingChange('previewRole', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Promo Code</Label>
                    <p className="text-sm text-gray-500">Enable promo code entry in cart</p>
                  </div>
                  <Switch
                    checked={Boolean(config.showPromoCodeInput)}
                    onCheckedChange={(checked) => handleGeneralSettingChange('showPromoCodeInput', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Gift Card</Label>
                    <p className="text-sm text-gray-500">Enable gift card application in cart</p>
                  </div>
                  <Switch
                    checked={Boolean(config.showGiftCardInput)}
                    onCheckedChange={(checked) => handleGeneralSettingChange('showGiftCardInput', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Games Settings */}
        <TabsContent value="games">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Experiences / Games</CardTitle>
                <CardDescription>Configure your escape room experiences - stored in database</CardDescription>
              </div>
              <Button onClick={handleAddGame} size="sm" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Experience
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {gamesLoading ? (
                <p className="text-sm text-gray-500">Loading games...</p>
              ) : supabaseGames.length === 0 ? (
                <p className="text-sm text-gray-500">No games configured yet. Click "Add Experience" to create your first game.</p>
              ) : (
                supabaseGames.map((game: any) => (
                  <div key={game.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">{game.name}</h4>
                        <p className="text-sm text-gray-600">{game.description}</p>
                        <div className="flex gap-4 mt-2 text-sm text-gray-500">
                          <span>⏱ {game.duration} min</span>
                          <span>👥 {game.min_players}-{game.max_players} players</span>
                          <span>💰 ${game.price}</span>
                          <span>🎯 {game.difficulty}</span>
                          <span className={`px-2 py-0.5 rounded ${game.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                            {game.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditGame(game)}>Edit</Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={async () => {
                            if (confirm(`Delete "${game.name}"?`)) {
                              await deleteSupabaseGame(game.id);
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Availability & Blocked Dates */}
        <TabsContent value="availability" className="space-y-6 pb-24">
          {/* Custom Available Dates */}
          <Card>
            <CardHeader>
              <CardTitle>Add a custom date</CardTitle>
              <CardDescription>Add special available dates outside regular schedule (e.g., special events)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="space-y-3 p-4 border rounded-lg bg-green-50 dark:bg-green-900/20">
                  <div className="space-y-2">
                    <Label htmlFor="custom-available-date" className="text-sm">Select a date</Label>
                    <Input
                      id="custom-available-date"
                      type="date"
                      className="w-full"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="custom-start-time" className="text-sm">Start Time</Label>
                      <Input
                        id="custom-start-time"
                        type="time"
                        defaultValue="10:00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="custom-end-time" className="text-sm">End Time</Label>
                      <Input
                        id="custom-end-time"
                        type="time"
                        defaultValue="22:00"
                      />
                    </div>
                  </div>

                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      const dateInput = document.getElementById('custom-available-date') as HTMLInputElement;
                      const startTimeInput = document.getElementById('custom-start-time') as HTMLInputElement;
                      const endTimeInput = document.getElementById('custom-end-time') as HTMLInputElement;
                      
                      const date = dateInput?.value;
                      const startTime = startTimeInput?.value;
                      const endTime = endTimeInput?.value;
                      
                      if (date && startTime && endTime) {
                        const customDates = config.customAvailableDates || [];
                        
                        onConfigChange({
                          ...config,
                          customAvailableDates: [...customDates, { 
                            date, 
                            startTime,
                            endTime,
                            reason: `Custom availability ${startTime} - ${endTime}`
                          }]
                        });
                        
                        toast.success(`Custom date added: ${date} from ${startTime} to ${endTime}`);
                        
                        dateInput.value = '';
                        startTimeInput.value = '10:00';
                        endTimeInput.value = '22:00';
                      } else {
                        toast.error('Please select a date and times');
                      }
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Custom Date
                  </Button>
                </div>
                <p className="text-sm text-gray-500">Add dates that are normally closed but should be available for booking</p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Custom Available Dates</Label>
                {(!config.customAvailableDates || config.customAvailableDates.length === 0) ? (
                  <p className="text-sm text-gray-500">No custom dates added</p>
                ) : (
                  <div className="space-y-2">
                    {config.customAvailableDates.map((custom: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-green-200 bg-green-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{new Date(custom.date + 'T00:00:00').toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}</p>
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                              Custom
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            🕒 {custom.startTime} - {custom.endTime}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            onConfigChange({
                              ...config,
                              customAvailableDates: config.customAvailableDates.filter((_: any, i: number) => i !== index)
                            });
                            toast.success('Custom date removed');
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Blocked Dates */}
          <Card>
            <CardHeader>
              <CardTitle>Blocked Dates</CardTitle>
              <CardDescription>Mark specific dates as unavailable (holidays, maintenance, etc.)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="blocked-date">Block a date</Label>
                <div className="space-y-3 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
                  <div className="space-y-2">
                    <Label htmlFor="blocked-date" className="text-sm">Select a date</Label>
                    <Input
                      id="blocked-date"
                      type="date"
                      className="w-full"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="blocked-start-time" className="text-sm">Start Time (Optional)</Label>
                      <Input
                        id="blocked-start-time"
                        type="time"
                        placeholder="10:00 AM"
                      />
                      <p className="text-xs text-gray-500">Leave empty to block entire day</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="blocked-end-time" className="text-sm">End Time (Optional)</Label>
                      <Input
                        id="blocked-end-time"
                        type="time"
                        placeholder="10:00 PM"
                      />
                      <p className="text-xs text-gray-500">Leave empty to block entire day</p>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-red-600 hover:bg-red-700"
                    onClick={() => {
                      const dateInput = document.getElementById('blocked-date') as HTMLInputElement;
                      const startTimeInput = document.getElementById('blocked-start-time') as HTMLInputElement;
                      const endTimeInput = document.getElementById('blocked-end-time') as HTMLInputElement;
                      
                      const date = dateInput?.value;
                      const startTime = startTimeInput?.value;
                      const endTime = endTimeInput?.value;
                      
                      if (date) {
                        const blockedDates = config.blockedDates || [];
                        
                        // Check if blocking entire day or specific time slot
                        const blockType = (startTime && endTime) ? 'time-slot' : 'full-day';
                        const reason = (startTime && endTime) 
                          ? `Blocked ${startTime} - ${endTime}` 
                          : 'Blocked by admin';
                        
                        onConfigChange({
                          ...config,
                          blockedDates: [...blockedDates, { 
                            date, 
                            startTime: startTime || null,
                            endTime: endTime || null,
                            blockType,
                            reason 
                          }]
                        });
                        
                        toast.success(blockType === 'time-slot' 
                          ? `Time slot ${startTime} - ${endTime} blocked on ${date}` 
                          : `Date ${date} blocked`
                        );
                        
                        dateInput.value = '';
                        startTimeInput.value = '';
                        endTimeInput.value = '';
                      } else {
                        toast.error('Please select a date');
                      }
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Block This Date
                  </Button>
                </div>
                <p className="text-sm text-gray-500">Block entire days or specific time slots when bookings should not be allowed</p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Currently Blocked Dates</Label>
                {(!config.blockedDates || config.blockedDates.length === 0) ? (
                  <p className="text-sm text-gray-500">No dates blocked</p>
                ) : (
                  <div className="space-y-2">
                    {config.blockedDates.map((blocked: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{new Date(blocked.date + 'T00:00:00').toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}</p>
                            {blocked.blockType === 'time-slot' && (
                              <Badge variant="secondary" className="text-xs">
                                Time Slot
                              </Badge>
                            )}
                          </div>
                          {blocked.startTime && blocked.endTime ? (
                            <p className="text-sm text-gray-600 mt-1">
                              🕒 {blocked.startTime} - {blocked.endTime}
                            </p>
                          ) : (
                            <p className="text-sm text-gray-500 mt-1">Full day blocked</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            onConfigChange({
                              ...config,
                              blockedDates: config.blockedDates.filter((_: any, i: number) => i !== index)
                            });
                            toast.success(blocked.blockType === 'time-slot' ? 'Time slot unblocked' : 'Date unblocked');
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Game Schedules</CardTitle>
              <CardDescription>Each game's operating schedule is configured in the game settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {config.games && config.games.length > 0 ? (
                  config.games.map((game: any) => (
                    <div key={game.id} className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">{game.name}</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Operating Days:</p>
                          <p className="font-medium">
                            {game.operatingDays && game.operatingDays.length > 0 
                              ? game.operatingDays.join(', ') 
                              : 'All days'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Hours:</p>
                          <p className="font-medium">
                            {game.startTime || '9:00 AM'} - {game.endTime || '9:00 PM'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Slot Interval:</p>
                          <p className="font-medium">{game.slotInterval || 60} minutes</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Advance Booking:</p>
                          <p className="font-medium">{game.advanceBooking || 30} days</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => {
                          handleEditGame(game);
                          setActiveTab('games');
                        }}
                      >
                        Edit Schedule
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No games configured yet. Add games in the Games tab.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Custom Settings Panel */}
        <TabsContent value="custom">
          <CustomSettingsPanel config={config} onConfigChange={onConfigChange} />
        </TabsContent>

        {/* SEO & GEO Settings */}
        <TabsContent value="seo" className="space-y-6 pb-24">
          <Card>
            <CardHeader>
              <CardTitle>SEO Optimization</CardTitle>
              <CardDescription>Set page metadata to improve search visibility</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="seo-title">SEO Title</Label>
                  <Input
                    id="seo-title"
                    placeholder="e.g., Mystery Manor | Your Business Name"
                    value={config.seoTitle || ''}
                    onChange={(e) => handleGeneralSettingChange('seoTitle', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business-name">Business Name</Label>
                  <Input
                    id="business-name"
                    placeholder="Your Business Name"
                    value={config.businessName || ''}
                    onChange={(e) => handleGeneralSettingChange('businessName', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="meta-description">Meta Description</Label>
                <Textarea
                  id="meta-description"
                  placeholder="Short description used in search results and social cards"
                  rows={4}
                  value={config.metaDescription || ''}
                  onChange={(e) => handleGeneralSettingChange('metaDescription', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seo-keywords">SEO Keywords</Label>
                <Input
                  id="seo-keywords"
                  placeholder="escape room, booking, team building, family fun"
                  value={config.seoKeywords || ''}
                  onChange={(e) => handleGeneralSettingChange('seoKeywords', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Location & GEO Settings</CardTitle>
              <CardDescription>Configure geographic information for local SEO</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable LocalBusiness schema</Label>
                  <p className="text-sm text-gray-500">Adds JSON-LD structured data for better local SEO</p>
                </div>
                <Switch
                  checked={Boolean(config.enableLocalBusinessSchema)}
                  onCheckedChange={(checked) => handleGeneralSettingChange('enableLocalBusinessSchema', checked)}
                />
              </div>
              <Separator />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="street-address">Street Address</Label>
                  <Input
                    id="street-address"
                    value={config.streetAddress || ''}
                    onChange={(e) => handleGeneralSettingChange('streetAddress', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={config.city || ''}
                    onChange={(e) => handleGeneralSettingChange('city', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State / Province</Label>
                  <Input
                    id="state"
                    value={config.state || ''}
                    onChange={(e) => handleGeneralSettingChange('state', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP / Postal Code</Label>
                  <Input
                    id="zip"
                    value={config.zipCode || ''}
                    onChange={(e) => handleGeneralSettingChange('zipCode', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={config.country || ''}
                    onChange={(e) => handleGeneralSettingChange('country', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="+1 (555) 123-4567"
                    value={config.phoneNumber || ''}
                    onChange={(e) => handleGeneralSettingChange('phoneNumber', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    placeholder="info@example.com"
                    value={config.emailAddress || ''}
                    onChange={(e) => handleGeneralSettingChange('emailAddress', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="landmarks">Nearby Landmarks</Label>
                <Textarea
                  id="landmarks"
                  placeholder="e.g., Downtown Plaza, City Museum"
                  rows={3}
                  value={config.nearbyLandmarks || ''}
                  onChange={(e) => handleGeneralSettingChange('nearbyLandmarks', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parking">Parking & Transportation</Label>
                <Textarea
                  id="parking"
                  placeholder="e.g., Free parking in rear lot; street parking available"
                  rows={3}
                  value={config.parkingInfo || ''}
                  onChange={(e) => handleGeneralSettingChange('parkingInfo', e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="show-location"
                  checked={config.showLocationBlock !== false}
                  onCheckedChange={(checked) => handleGeneralSettingChange('showLocationBlock', checked)}
                />
                <Label htmlFor="show-location">Show Location & Info block on booking page</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Social Profiles</CardTitle>
              <CardDescription>Optional links for richer social cards</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook URL</Label>
                  <Input
                    id="facebook"
                    value={config.facebookUrl || ''}
                    onChange={(e) => handleGeneralSettingChange('facebookUrl', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram URL</Label>
                  <Input
                    id="instagram"
                    value={config.instagramUrl || ''}
                    onChange={(e) => handleGeneralSettingChange('instagramUrl', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter">X / Twitter URL</Label>
                  <Input
                    id="twitter"
                    value={config.twitterUrl || ''}
                    onChange={(e) => handleGeneralSettingChange('twitterUrl', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tripadvisor">Tripadvisor URL</Label>
                  <Input
                    id="tripadvisor"
                    value={config.tripadvisorUrl || ''}
                    onChange={(e) => handleGeneralSettingChange('tripadvisorUrl', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="google-biz">Google Business ID</Label>
                  <Input
                    id="google-biz"
                    placeholder="optional"
                    value={config.googleBusinessId || ''}
                    onChange={(e) => handleGeneralSettingChange('googleBusinessId', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Settings */}
        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>Configure cancellation policies and other advanced options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cancellation-policy">Cancellation Policy</Label>
                <Textarea
                  id="cancellation-policy"
                  value={config.cancellationPolicy}
                  onChange={(e) => handleGeneralSettingChange('cancellationPolicy', e.target.value)}
                  rows={6}
                />
              </div>
            </CardContent>
          </Card>
          <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Additional Questions</CardTitle>
                <CardDescription>Add custom questions to your booking form</CardDescription>
              </div>
              <Button onClick={handleAddQuestion} size="sm" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Question
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {(config.additionalQuestions || []).map((q: any, index: number) => (
                <div key={q.id} className="space-y-4 border-b pb-4 mb-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold">Question {index + 1}</h4>
                    <Button onClick={() => handleDeleteQuestion(q.id)} variant="destructive" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label>Question</Label>
                    <Input
                      value={q.question}
                      onChange={(e) => handleUpdateQuestion(q.id, { question: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={q.type}
                      onValueChange={(value) => handleUpdateQuestion(q.id, { type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a question type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="select">Select</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {q.type === 'select' && (
                    <div className="space-y-2">
                      <Label>Options (comma-separated)</Label>
                      <Input
                        value={q.options.join(',')}
                        onChange={(e) => handleUpdateQuestion(q.id, { options: e.target.value.split(',') })}
                      />
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`required-${q.id}`}
                      checked={q.required}
                      onCheckedChange={(checked) => handleUpdateQuestion(q.id, { required: checked })}
                    />
                    <Label htmlFor={`required-${q.id}`}>Required</Label>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Game Wizard Dialog */}
      <Dialog open={showAddGameWizard} onOpenChange={(open) => !open && handleWizardCancel()}>
        <DialogContent className="!w-[90vw] !max-w-[1000px] h-[90vh] !max-h-[90vh] overflow-hidden p-0 flex flex-col">
          <div className="sr-only">
            <DialogTitle>{editingGame ? 'Edit Experience' : 'Add New Experience'}</DialogTitle>
            <DialogDescription>
              Complete the multi-step wizard to add a new escape room experience to your calendar widget
            </DialogDescription>
          </div>
          <AddGameWizard
            onComplete={handleWizardComplete}
            onCancel={handleWizardCancel}
            initialData={editingGame ? convertGameToWizardData(editingGame) : undefined}
            mode={editingGame ? 'edit' : 'create'}
            theme="calendar"
            embedContext={embedContext}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
