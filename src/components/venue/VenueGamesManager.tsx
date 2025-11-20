/**
 * Venue Games Manager
 * Admin interface for managing games within a venue
 * Separate from booking widget templates - this is for venue owners/admins only
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Plus, Trash2, Edit, Eye, X, MoreVertical, Copy, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { ScrollArea } from '../ui/scroll-area';
import { toast } from 'sonner';
import AddGameWizard from '../games/AddGameWizard';
import { useGames } from '../../hooks/useGames';

interface EmbedContext {
  embedKey?: string;
  primaryColor?: string;
  venueName?: string;
  baseUrl?: string;
  venueId?: string;
}

interface VenueGamesManagerProps {
  venueId: string;
  venueName: string;
  embedContext?: EmbedContext;
  onPreview?: () => void;
}

/**
 * VenueGamesManager Component
 * 
 * This is the ADMIN interface for managing games in a venue.
 * It's separate from booking widget templates.
 * 
 * Purpose:
 * - Add new games via wizard
 * - Edit existing games
 * - Delete games
 * - View game details
 * 
 * NOT for:
 * - Customer-facing booking
 * - Widget template selection
 * - Frontend preview (that's in booking widgets)
 */
export default function VenueGamesManager({ 
  venueId, 
  venueName,
  embedContext,
  onPreview 
}: VenueGamesManagerProps) {
  const [showAddGameWizard, setShowAddGameWizard] = useState(false);
  const [editingGame, setEditingGame] = useState<any>(null);
  const { games, createGame, updateGame, deleteGame, loading, refreshGames } = useGames(venueId);
  const [duplicatingGameId, setDuplicatingGameId] = useState<string | null>(null);

  // Map Supabase game to wizard format
  const convertGameToWizardData = (game: any) => {
    console.log('🔄 VenueGamesManager - Converting game to wizard data:', {
      gameId: game.id,
      gameName: game.name,
      stripe_product_id: game.stripe_product_id,
      stripe_price_id: game.stripe_price_id,
      stripe_prices: game.stripe_prices,
      stripe_checkout_url: game.stripe_checkout_url,
      stripe_sync_status: game.stripe_sync_status,
      stripe_last_sync: game.stripe_last_sync
    });
    
    const settings = game.settings || {};
    return {
      id: game.id,
      name: game.name,
      description: game.description,
      tagline: settings.tagline || '',
      category: settings.category || '',
      eventType: settings.eventType || 'public',
      gameType: settings.gameType || 'physical',
      minAdults: game.min_players,
      maxAdults: game.max_players,
      minChildren: settings.minChildren || 0,
      maxChildren: settings.maxChildren || 0,
      adultPrice: parseFloat(game.price) || 0,
      childPrice: parseFloat(game.child_price) || 0,
      customCapacityFields: settings.customCapacityFields || [],
      groupDiscount: settings.groupDiscount || false,
      groupTiers: settings.groupTiers || [],
      dynamicPricing: settings.dynamicPricing || false,
      peakPricing: settings.peakPricing || { enabled: false },
      duration: game.duration,
      difficulty: game.difficulty,
      minAge: game.min_age || 0,
      language: settings.language || ['English'],
      successRate: game.success_rate || 75,
      activityDetails: settings.activityDetails || '',
      additionalInformation: settings.additionalInformation || '',
      faqs: settings.faqs || [],
      cancellationPolicies: settings.cancellationPolicies || [],
      accessibility: settings.accessibility || { strollerAccessible: false, wheelchairAccessible: false },
      location: settings.location || '',
      coverImage: game.image_url || '',
      galleryImages: settings.galleryImages || [],
      videos: settings.videos || [],
      operatingDays: settings.operatingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      startTime: settings.startTime || '10:00',
      endTime: settings.endTime || '22:00',
      slotInterval: settings.slotInterval || 60,
      advanceBooking: settings.advanceBooking || 30,
      customDates: settings.customDates || [],
      blockedDates: settings.blockedDates || [],
      customHours: settings.customHours || {},
      customHoursEnabled: settings.customHoursEnabled || false,
      selectedWidget: settings.selectedWidget || 'calendar-single-event',
      requiresWaiver: settings.requiresWaiver || false,
      selectedWaiver: settings.selectedWaiver || null,
      cancellationWindow: settings.cancellationWindow || 24,
      specialInstructions: settings.specialInstructions || '',
      // Stripe payment integration fields
      stripeProductId: game.stripe_product_id || null,
      stripePriceId: game.stripe_price_id || null,
      stripePrices: game.stripe_prices || [],
      stripeCheckoutUrl: game.stripe_checkout_url || null,
      stripeSyncStatus: game.stripe_sync_status || 'not_synced',
      stripeLastSync: game.stripe_last_sync || null,
    };
  };

  // Helper function to convert difficulty number to string
  const getDifficultyString = (difficulty: number): 'Easy' | 'Medium' | 'Hard' | 'Expert' => {
    const difficultyMap: { [key: number]: 'Easy' | 'Medium' | 'Hard' | 'Expert' } = {
      1: 'Easy',
      2: 'Easy',
      3: 'Medium',
      4: 'Hard',
      5: 'Expert',
    };
    return difficultyMap[difficulty] || 'Medium';
  };

  // Handle wizard complete (create or update)
  const handleWizardComplete = async (gameData: any) => {
    const slug = gameData.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    const supabaseGameData = {
      venue_id: venueId,
      name: gameData.name,
      slug: slug,
      description: gameData.description || '',
      difficulty: getDifficultyString(gameData.difficulty), // Convert number to string
      duration: gameData.duration || 60,
      min_players: gameData.minAdults || 2,
      max_players: gameData.maxAdults || 8,
      price: gameData.adultPrice || 0,
      child_price: gameData.childPrice || gameData.adultPrice || 0,
      min_age: gameData.minAge || 0,
      success_rate: gameData.successRate || 75,
      image_url: gameData.coverImage || 'https://images.unsplash.com/photo-1569002925653-ed18f55d7292',
      status: 'active' as const,
      // Stripe payment integration fields
      stripe_product_id: gameData.stripeProductId || null,
      stripe_price_id: gameData.stripePriceId || null,
      stripe_prices: gameData.stripePrices || null,
      stripe_checkout_url: gameData.stripeCheckoutUrl || null,
      stripe_sync_status: gameData.stripeSyncStatus || null,
      stripe_last_sync: gameData.stripeLastSync || null,
      settings: {
        tagline: gameData.tagline,
        category: gameData.category,
        eventType: gameData.eventType,
        gameType: gameData.gameType || 'physical',
        minChildren: gameData.minChildren,
        maxChildren: gameData.maxChildren,
        customCapacityFields: gameData.customCapacityFields,
        groupDiscount: gameData.groupDiscount,
        groupTiers: gameData.groupTiers,
        dynamicPricing: gameData.dynamicPricing,
        peakPricing: gameData.peakPricing,
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
        customDates: gameData.customDates,
        blockedDates: gameData.blockedDates,
        customHours: gameData.customHours,
        customHoursEnabled: gameData.customHoursEnabled,
        selectedWidget: gameData.selectedWidget,
        requiresWaiver: gameData.requiresWaiver,
        selectedWaiver: gameData.selectedWaiver,
        cancellationWindow: gameData.cancellationWindow,
        specialInstructions: gameData.specialInstructions,
      },
    };

    console.log('=== STARTING GAME SAVE ===');
    console.log('Editing game?:', !!editingGame);
    console.log('Supabase game data:', JSON.stringify(supabaseGameData, null, 2));
    
    try {
      let result;
      if (editingGame) {
        console.log('Updating existing game:', editingGame.id);
        result = await updateGame(editingGame.id, supabaseGameData);
        setEditingGame(null);
        toast.success('Game updated successfully!');
      } else {
        console.log('Creating new game...');
        result = await createGame(supabaseGameData);
        console.log('✅ Game created successfully:', result);
        toast.success('Game created successfully!');
      }

      if (!result) {
        throw new Error('No result returned from save operation');
      }

      // Close wizard first
      setShowAddGameWizard(false);
      
      console.log('Triggering game list refreshes...');
      // Force multiple refreshes to ensure the game appears
      refreshGames(); // Immediate
      setTimeout(() => refreshGames(), 300); // After 300ms
      setTimeout(() => refreshGames(), 1000); // After 1 second
      setTimeout(() => refreshGames(), 2000); // After 2 seconds for slow connections
      
    } catch (error: any) {
      console.error('❌ ERROR in handleWizardComplete:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        stack: error.stack,
      });
      toast.error(`Failed to save game: ${error.message}`);
      // Don't close wizard on error so user can try again
    }
  };

  // Handle edit game
  const handleEditGame = (game: any) => {
    const wizardData = convertGameToWizardData(game);
    setEditingGame(game);
    setShowAddGameWizard(true);
  };

  // Handle delete game
  const handleDeleteGame = async (gameId: string) => {
    if (confirm('Are you sure you want to delete this game? This action cannot be undone.')) {
      try {
        await deleteGame(gameId);
        toast.success('Game deleted successfully');
      } catch (error) {
        console.error('Error deleting game:', error);
        toast.error('Failed to delete game');
      }
    }
  };

  const handleDuplicateGame = async (game: any) => {
    setDuplicatingGameId(game.id);
    try {
      // Convert game to wizard format
      const wizardData = convertGameToWizardData(game);
      
      // Create a new name for the duplicate
      const duplicateName = `${game.name} (Copy)`;
      
      // Create slug from duplicate name
      const slug = duplicateName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

      // Prepare duplicate game data
      const duplicateGameData = {
        venue_id: venueId,
        name: duplicateName,
        slug: slug,
        description: game.description || '',
        difficulty: game.difficulty,
        duration: game.duration || 60,
        min_players: game.min_players || 2,
        max_players: game.max_players || 8,
        price: game.price || 0,
        child_price: game.child_price || game.price || 0,
        min_age: game.min_age || 0,
        success_rate: game.success_rate || 75,
        image_url: game.image_url || 'https://images.unsplash.com/photo-1569002925653-ed18f55d7292',
        status: 'active' as const,
        settings: game.settings || {},
        // Don't copy Stripe IDs - new game needs its own
        stripe_product_id: undefined,
        stripe_price_id: undefined,
        stripe_sync_status: 'not_synced',
      };

      await createGame(duplicateGameData);
      toast.success(`Game duplicated successfully as "${duplicateName}"`);
    } catch (error) {
      console.error('Error duplicating game:', error);
      toast.error('Failed to duplicate game');
    } finally {
      setDuplicatingGameId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Experiences / Games</CardTitle>
              <CardDescription>
                Manage games and experiences for {venueName}
              </CardDescription>
            </div>
            <Button 
              onClick={() => {
                setEditingGame(null);
                setShowAddGameWizard(true);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Experience
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-sm text-gray-500">Loading games...</p>
          ) : games.length === 0 ? (
            <p className="text-sm text-gray-500">
              No games configured yet. Click "Add Experience" to create your first game.
            </p>
          ) : (
            <div className="space-y-3">
              {games.map((game) => (
                <Card key={game.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 dark:text-white truncate">
                          {game.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                          {game.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>${game.price}</span>
                          <span>{game.duration} min</span>
                          <span>{game.difficulty}</span>
                          <span className={`px-2 py-0.5 rounded ${game.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                            {game.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditGame(game)}
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
                              disabled={duplicatingGameId === game.id}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => handleEditGame(game)}
                              className="cursor-pointer"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDuplicateGame(game)}
                              disabled={duplicatingGameId === game.id}
                              className="cursor-pointer"
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              {duplicatingGameId === game.id ? 'Duplicating...' : 'Duplicate'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteGame(game.id)}
                              className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Button */}
      {onPreview && games.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <Button
              onClick={onPreview}
              variant="outline"
              className="w-full"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview Booking Widget
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Game Wizard Dialog */}
      {showAddGameWizard && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#161616] rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {editingGame ? 'Edit Game' : 'Add New Game'}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowAddGameWizard(false);
                  setEditingGame(null);
                }}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto">
              <AddGameWizard
                onComplete={handleWizardComplete}
                onCancel={() => {
                  setShowAddGameWizard(false);
                  setEditingGame(null);
                }}
                initialData={editingGame ? convertGameToWizardData(editingGame) : undefined}
                mode={editingGame ? 'edit' : 'create'}
                embedContext={embedContext}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
