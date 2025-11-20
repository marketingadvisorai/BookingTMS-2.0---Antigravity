import { useState, useEffect } from 'react';

// Default configuration for all widgets
export const defaultWidgetConfig = {
  showSecuredBadge: true,
  showHealthSafety: true,
  enableVeteranDiscount: false,
  widgetTitle: '',
  widgetDescription: '',
  fontFamily: '',
  fontScale: 1,
  timezoneLabel: 'Local Time',
  previewRole: 'customer',
  slotDurationMinutes: 90,
  showPromoCodeInput: true,
  showGiftCardInput: true,
  proLockedCustomSettings: true,
  customSettings: {
    logoUrl: '',
    logoSize: 64,
    logoPosition: 'top',
    headlineText: '',
    headlineFont: '',
    headlineSize: 28,
    headlineColor: '#111827',
    headlineAlign: 'center',
    descriptionHtml: '',
    descriptionCharLimit: 280,
    widgetWidth: 1024,
    widgetHeight: 768,
    responsiveScale: 1,
    minWidth: 320,
    maxWidth: 1600,
    previewDevice: 'desktop',
    themeVariant: 'light',
    themeColor: '#2563eb'
  },
  ticketTypes: [
    { id: 'player', name: 'Players', description: 'Ages 6 & Up', price: 30 }
  ],
  games: [],
  additionalQuestions: [],
  cancellationPolicy: 'Cash refunds are not available. If you are unable to keep your scheduled reservation, please contact us. We can rebook you to a different date and/or time or issue a refund in the form of a gift card.'
};

// FareBook specific configuration
const defaultFareBookConfig = {
  showSecuredBadge: true,
  showHealthSafety: true,
  enableVeteranDiscount: true,
  ticketTypes: [
    { id: 'player', name: 'Players', description: 'Ages 6 & Up', price: 30 },
    { id: 'veteran', name: 'Veterans', description: 'Must show military ID', price: 25 }
  ],
  categories: [
    {
      id: '1',
      name: 'Traditional Escape Rooms',
      image: 'https://images.unsplash.com/photo-1569002925653-ed18f55d7292?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080'
    },
    {
      id: '2',
      name: 'Printable Escape Rooms',
      image: 'https://images.unsplash.com/photo-1632387958032-3b563a92091f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080'
    }
  ],
  games: [
    {
      id: '1',
      name: 'Zombie Apocalypse',
      image: 'https://images.unsplash.com/photo-1659059530318-656a112ad2cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
      priceRange: '$25 - $30',
      ageRange: 'Ages 6+',
      duration: '1 Hour',
      difficulty: 5,
      categoryId: '1',
      description: 'Can you survive the zombie apocalypse and find the cure?'
    },
    {
      id: '2',
      name: 'Area 51',
      image: 'https://images.unsplash.com/photo-1569002925653-ed18f55d7292?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
      priceRange: '$25 - $30',
      ageRange: 'All ages',
      duration: '1 Hour',
      difficulty: 5,
      categoryId: '1'
    },
    {
      id: '3',
      name: 'Catacombs',
      image: 'https://images.unsplash.com/photo-1637481687365-9b133c567071?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
      priceRange: '$25 - $30',
      ageRange: 'All ages',
      duration: '1 Hour',
      difficulty: 2,
      categoryId: '1'
    },
    {
      id: '4',
      name: 'Murder Mystery',
      image: 'https://images.unsplash.com/photo-1636056471685-1cfdfa9d2e4b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
      priceRange: '$25 - $30',
      ageRange: 'Ages 6+',
      duration: '1 Hour',
      difficulty: 5,
      categoryId: '1'
    },
    {
      id: '5',
      name: "The Jolly Roger, Curse of the Devil's Shroud",
      image: 'https://images.unsplash.com/photo-1561625116-df74735458a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
      priceRange: '$25 - $30',
      ageRange: 'Ages 6+',
      duration: '1 Hour',
      difficulty: 0,
      categoryId: '1'
    }
  ],
  additionalQuestions: [
    {
      id: 'hear-about',
      question: 'How did you hear about us?',
      type: 'select',
      options: ['Google', 'Facebook', 'Friend', 'Other'],
      required: false
    }
  ],
  cancellationPolicy: 'Cash refunds are not available. If you are unable to keep your scheduled reservation, please contact us. We can rebook you to a different date and/or time or issue a refund in the form of a gift card.'
};

// BookGo specific configuration
const defaultBookGoConfig = {
  ...defaultWidgetConfig,
  games: [
    {
      id: '1',
      name: 'Mystery Manor',
      tagline: 'Uncover the secrets of an abandoned Victorian mansion',
      duration: '60 min',
      difficulty: 'Medium',
      rating: 4.9,
      reviews: 234,
      price: 30,
      featured: true,
      image: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=600&h=400&fit=crop',
      players: '2-8 players',
      ageRange: 'All ages'
    }
  ]
};

// Storage keys
const CALENDAR_CONFIG_STORAGE_KEY = 'calendarWidgetConfig';
const SINGLEGAME_CONFIG_STORAGE_KEY = 'singleGameWidgetConfig';

export const useWidgetConfigs = () => {
  const [fareBookConfig, setFareBookConfig] = useState<any>(defaultFareBookConfig);
  const [bookGoConfig, setBookGoConfig] = useState<any>(defaultBookGoConfig);
  const [calendarConfig, setCalendarConfig] = useState<any>({
    ...defaultWidgetConfig,
    games: []
  });
  const [singleGameConfig, setSingleGameConfig] = useState<any>({
    ...defaultWidgetConfig,
    games: []
  });
  const [resolvexConfig, setResolvexConfig] = useState<any>({
    ...defaultWidgetConfig,
    games: []
  });
  const [quickConfig, setQuickConfig] = useState<any>({
    ...defaultWidgetConfig,
    games: []
  });
  const [multiStepConfig, setMultiStepConfig] = useState<any>({
    ...defaultWidgetConfig,
    games: []
  });

  // Load calendar config from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CALENDAR_CONFIG_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          setCalendarConfig(parsed);
        }
      }
    } catch (e) {
      // Ignore JSON parse errors silently
    }
  }, []);

  // Save calendar config to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CALENDAR_CONFIG_STORAGE_KEY, JSON.stringify(calendarConfig));
    } catch (e) {
      // Ignore storage errors silently
    }
  }, [calendarConfig]);

  // Load single game config from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SINGLEGAME_CONFIG_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          setSingleGameConfig(parsed);
        }
      }
    } catch (e) {
      // Ignore JSON parse errors silently
    }
  }, []);

  // Save single game config to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SINGLEGAME_CONFIG_STORAGE_KEY, JSON.stringify(singleGameConfig));
    } catch (e) {
      // Ignore storage errors silently
    }
  }, [singleGameConfig]);

  // Get config for a specific widget
  const getWidgetConfig = (widgetId: string) => {
    const configs: Record<string, any> = {
      farebook: fareBookConfig,
      'farebook-single': fareBookConfig,
      bookgo: bookGoConfig,
      calendar: calendarConfig,
      singlegame: singleGameConfig,
      resolvex: resolvexConfig,
      quick: quickConfig,
      multistep: multiStepConfig
    };
    return configs[widgetId] || defaultWidgetConfig;
  };

  // Get setter for a specific widget
  const getWidgetConfigSetter = (widgetId: string) => {
    const setters: Record<string, any> = {
      farebook: setFareBookConfig,
      'farebook-single': setFareBookConfig,
      bookgo: setBookGoConfig,
      calendar: setCalendarConfig,
      singlegame: setSingleGameConfig,
      resolvex: setResolvexConfig,
      quick: setQuickConfig,
      multistep: setMultiStepConfig
    };
    return setters[widgetId] || setFareBookConfig;
  };

  return {
    // Individual configs
    fareBookConfig,
    setFareBookConfig,
    bookGoConfig,
    setBookGoConfig,
    calendarConfig,
    setCalendarConfig,
    singleGameConfig,
    setSingleGameConfig,
    resolvexConfig,
    setResolvexConfig,
    quickConfig,
    setQuickConfig,
    multiStepConfig,
    setMultiStepConfig,
    // Helper functions
    getWidgetConfig,
    getWidgetConfigSetter,
  };
};
