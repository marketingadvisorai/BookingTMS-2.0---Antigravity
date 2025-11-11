/**
 * Venue Games Manager
 * Admin interface for managing games within a venue
 * Separate from booking widget templates - this is for venue owners/admins only
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Plus, Trash2, Edit, Eye, X } from 'lucide-react';
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
  const { games, createGame, updateGame, deleteGame, loading } = useGames(venueId);

  // Map Supabase game to wizard format
  const convertGameToWizardData = (game: any) => {
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
    };
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
      difficulty: gameData.difficulty,
      duration: gameData.duration || 60,
      min_players: gameData.minAdults || 2,
      max_players: gameData.maxAdults || 8,
      price: gameData.adultPrice || 0,
      child_price: gameData.childPrice || gameData.adultPrice || 0,
      min_age: gameData.minAge || 0,
      success_rate: gameData.successRate || 75,
      image_url: gameData.coverImage || 'https://images.unsplash.com/photo-1569002925653-ed18f55d7292',
      status: 'active' as const,
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

    if (editingGame) {
      await updateGame(editingGame.id, supabaseGameData);
      setEditingGame(null);
    } else {
      await createGame(supabaseGameData);
    }

    setShowAddGameWizard(false);
  };

  // Handle edit game
  const handleEditGame = (game: any) => {
    const wizardData = convertGameToWizardData(game);
    setEditingGame(game);
    setShowAddGameWizard(true);
  };

  // Handle delete game
  const handleDeleteGame = async (gameId: string) => {
    if (confirm('Are you sure you want to delete this game?')) {
      await deleteGame(gameId);
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
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditGame(game)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteGame(game.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
