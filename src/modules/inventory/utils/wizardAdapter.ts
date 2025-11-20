import { Game } from '../types';

export const convertGameToWizardData = (game: Game) => {
  const difficultyMap: Record<string, number> = {
    'easy': 2,
    'medium': 3,
    'hard': 4,
    'expert': 5
  };

  return {
    // Basic Info
    name: game.name,
    description: game.description || '',
    category: 'Escape Room',
    tagline: '',
    eventType: 'public',
    
    // Capacity & Pricing
    minAdults: game.min_players,
    maxAdults: game.max_players,
    minChildren: 0,
    maxChildren: 0,
    adultPrice: game.price,
    childPrice: game.price * 0.7, // Estimate
    customCapacityFields: [],
    groupDiscount: false,
    dynamicPricing: false,
    peakPricing: {
      enabled: false,
      weekdayPeakPrice: 0,
      weekendPeakPrice: 0,
      peakStartTime: '18:00',
      peakEndTime: '22:00',
    },
    groupTiers: [],
    
    // Game Details
    duration: game.duration_minutes,
    difficulty: difficultyMap[game.difficulty] || 3,
    minAge: 12,
    language: ['English'],
    successRate: 50,
    activityDetails: '',
    additionalInformation: '',
    faqs: [],
    cancellationPolicies: [],
    accessibility: {
      strollerAccessible: false,
      wheelchairAccessible: false,
    },
    location: '',
    
    // Media
    coverImage: game.image_url || '',
    galleryImages: [],
    videos: [],
    
    // Schedule
    operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    startTime: '10:00',
    endTime: '22:00',
    slotInterval: 30,
    advanceBooking: 30,
    customHoursEnabled: false,
    customHours: {
      Monday: { enabled: true, startTime: '10:00', endTime: '22:00' },
      Tuesday: { enabled: true, startTime: '10:00', endTime: '22:00' },
      Wednesday: { enabled: true, startTime: '10:00', endTime: '22:00' },
      Thursday: { enabled: true, startTime: '10:00', endTime: '22:00' },
      Friday: { enabled: true, startTime: '10:00', endTime: '22:00' },
      Saturday: { enabled: true, startTime: '10:00', endTime: '22:00' },
      Sunday: { enabled: true, startTime: '10:00', endTime: '22:00' },
    },
    customDates: [],
    blockedDates: [],
    
    // Settings
    requiresWaiver: false,
    selectedWaiver: null,
    cancellationWindow: 24,
    specialInstructions: ''
  };
};

export const convertWizardDataToGame = (data: any, organizationId: string, venueId?: string) => {
  const difficultyMap = ['easy', 'easy', 'medium', 'hard', 'expert'];
  const difficulty = difficultyMap[data.difficulty - 1] || 'medium';

  return {
    organization_id: organizationId,
    venue_id: venueId || organizationId, // Fallback to orgId if venueId not provided
    name: data.name,
    description: data.description,
    difficulty: difficulty as any,
    duration_minutes: data.duration,
    min_players: data.minAdults,
    max_players: data.maxAdults,
    price: data.adultPrice,
    image_url: data.coverImage,
    is_active: true,
  };
};
