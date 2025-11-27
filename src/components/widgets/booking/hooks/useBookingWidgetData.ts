import { useMemo } from 'react';
import { normalizeScheduleFromSettings } from '../../../../lib/schedule/scheduleService';
import { GameData } from '../page-components/types';

interface UseBookingWidgetDataProps {
  config: any;
  activityId?: string;
  gameName?: string;
  gameDescription?: string;
  gamePrice?: number;
  timezone?: string;
}

export function useBookingWidgetData({
  config,
  activityId,
  gameName,
  gameDescription,
  gamePrice,
  timezone
}: UseBookingWidgetDataProps) {
  // Get selected game from config
  const selectedGame = useMemo(() => {
    const games = Array.isArray(config?.games) ? config.games : [];
    const activities = Array.isArray(config?.activities) ? config.activities : [];
    const allItems = [...games, ...activities];
    
    if (activityId && allItems.length > 0) {
      const found = allItems.find((item: any) => item.id === activityId);
      if (found) return found;
    }
    return allItems.length > 0 ? allItems[0] : null;
  }, [config, activityId]);

  // Build game data from config/props - SYNC WITH STEP 5 SCHEDULE
  const gameData: GameData = useMemo(() => {
    const settings = selectedGame?.settings || {};
    
    // Normalize schedule from settings (Step 5 data)
    const scheduleFromSettings = normalizeScheduleFromSettings(settings);
    
    return {
      name: gameName || selectedGame?.name || 'Experience',
      description: gameDescription || selectedGame?.description || 'An exciting experience awaits!',
      price: gamePrice ?? selectedGame?.price ?? 30,
      duration: selectedGame?.duration || '60 min',
      difficulty: selectedGame?.difficulty || 'Medium',
      difficultyLevel: 3,
      players: selectedGame?.players || '2-8 players',
      gameType: 'physical',
      minAge: 10,
      ageRecommendation: '10+',
      rating: 4.9,
      reviewCount: 234,
      location: config?.city && config?.state ? `${config.city}, ${config.state}` : 'Downtown Location',
      image: selectedGame?.image || selectedGame?.imageUrl || 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=1200',
      gallery: selectedGame?.galleryImages || [],
      highlights: ['Perfect for beginners', 'Family friendly'],
      longDescription: selectedGame?.description || '',
      story: '',
      whatToExpect: [],
      requirements: [],
      faq: selectedGame?.faqs || [],
      reviews: [],
      // SCHEDULE - Synced from Step 5
      schedule: {
        operatingDays: scheduleFromSettings.operatingDays,
        startTime: scheduleFromSettings.startTime,
        endTime: scheduleFromSettings.endTime,
        slotInterval: scheduleFromSettings.slotInterval,
        duration: selectedGame?.duration || 60,
        advanceBooking: scheduleFromSettings.advanceBooking,
        customHours: scheduleFromSettings.customHours,
        customHoursEnabled: scheduleFromSettings.customHoursEnabled,
        customDates: scheduleFromSettings.customDates,
        blockedDates: scheduleFromSettings.blockedDates
      },
      timezone: timezone || selectedGame?.timezone || config?.timezone || 'UTC'
    };
  }, [selectedGame, gameName, gameDescription, gamePrice, timezone, config]);

  return {
    selectedGame,
    gameData
  };
}
