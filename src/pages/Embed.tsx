import { useEffect, useState } from 'react';
import { CalendarWidget } from '../components/widgets/CalendarWidget';
import { BookGoWidget } from '../components/widgets/ListWidget';
import { QuickBookWidget } from '../components/widgets/QuickBookWidget';
import { MultiStepWidget } from '../components/widgets/MultiStepWidget';
import { ResolvexWidget } from '../components/widgets/ResolvexWidget';
import { CalendarSingleEventBookingPage } from '../components/widgets/CalendarSingleEventBookingPage';
import FareBookWidget from '../components/widgets/FareBookWidget';
import { WidgetThemeProvider } from '../components/widgets/WidgetThemeContext';
import { supabase } from '../lib/supabase';

export function Embed() {
  const [widgetId, setWidgetId] = useState<string>('farebook');
  const [primaryColor, setPrimaryColor] = useState<string>('#2563eb');
  const [widgetKey, setWidgetKey] = useState<string>('');
  const [widgetTheme, setWidgetTheme] = useState<'light' | 'dark'>('light');
  // Config used by embedded widgets (loaded from Supabase by embedKey)
  const [embedConfig, setEmbedConfig] = useState<any | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // Single game overrides from URL (optional)
  const [singleGameName, setSingleGameName] = useState<string | undefined>(undefined);
  const [singleGameDescription, setSingleGameDescription] = useState<string | undefined>(undefined);
  const [singleGamePrice, setSingleGamePrice] = useState<number | undefined>(undefined);

  useEffect(() => {
    // Parse URL parameters
    const params = new URLSearchParams(window.location.search);
    const widget = params.get('widget') || 'farebook';
    const color = params.get('color') || '2563eb';
    const key = params.get('key') || '';
    const theme = params.get('theme') as 'light' | 'dark' || 'light';

    // Optional single game preview params
    const sgName = params.get('gameName') || undefined;
    const sgDescription = params.get('gameDescription') || undefined;
    const sgPriceRaw = params.get('gamePrice');
    const sgPrice = sgPriceRaw ? parseFloat(sgPriceRaw) : undefined;

    console.log('📍 Embed page loaded with params:', { widget, color, key, theme });
    console.log('📍 Full URL:', window.location.href);

    setWidgetId(widget);
    setPrimaryColor(`#${color.replace('#', '')}`);
    setWidgetKey(key);
    setWidgetTheme(theme);

    // Apply single-game overrides if provided
    setSingleGameName(sgName);
    setSingleGameDescription(sgDescription);
    setSingleGamePrice(sgPrice);

    // Post message to parent window that widget is loaded
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'BOOKINGTMS_WIDGET_LOADED',
        widget,
        key
      }, '*');
    }

    // Send height updates to parent
    const sendHeightUpdate = () => {
      if (window.parent !== window) {
        const height = document.documentElement.scrollHeight;
        window.parent.postMessage({
          type: 'BOOKINGTMS_RESIZE',
          height
        }, '*');
      }
    };

    // Send initial height
    setTimeout(sendHeightUpdate, 1000);

    // Send height on resize
    const resizeObserver = new ResizeObserver(sendHeightUpdate);
    resizeObserver.observe(document.body);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Default config for all widgets
  const defaultConfig = {
    showSecuredBadge: true,
    showHealthSafety: true,
    enableVeteranDiscount: true,
    widgetTitle: '',
    widgetDescription: '',
    // SEO & GEO defaults for embed previews
    seoTitle: '',
    businessName: 'Your Business Name',
    metaDescription: 'Book your escape room experience. Fun, safe, and memorable events for teams, families, and friends.',
    seoKeywords: 'escape room, booking, team building, family fun, mystery, puzzle game',
    enableLocalBusinessSchema: true,
    streetAddress: '123 Main St',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62701',
    country: 'USA',
    phoneNumber: '+1 (555) 123-4567',
    emailAddress: 'info@example.com',
    nearbyLandmarks: 'Downtown Plaza, City Museum',
    parkingInfo: 'Free parking in rear lot; street parking available',
    showLocationBlock: true,
    ticketTypes: [
      { id: 'player', name: 'Players', description: 'Ages 6 & Up', price: 30 },
      { id: 'veteran', name: 'Veterans', description: 'Must show military ID', price: 25 }
    ],
    categories: [
      {
        id: '1',
        name: 'Traditional Escape Rooms',
        image: 'https://images.unsplash.com/photo-1569002925653-ed18f55d7292?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlc2NhcGUlMjByb29tJTIwZGFyayUyMG15c3RlcmlvdXN8ZW58MXx8fHwxNzYxOTM1ODcyfDA&ixlib=rb-4.1.0&q=80&w=1080'
      },
      {
        id: '2',
        name: 'Printable Escape Rooms',
        image: 'https://images.unsplash.com/photo-1632387958032-3b563a92091f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwcGhvdG9ncmFwaHMlMjBwb2xhcm9pZHxlbnwxfHx8fDE3NjE5MzU4NzJ8MA&ixlib=rb-4.1.0&q=80&w=1080'
      }
    ],
    games: [
      {
        id: '1',
        name: 'Zombie Apocalypse',
        image: 'https://images.unsplash.com/photo-1659059530318-656a112ad2cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx6b21iaWUlMjBhcG9jYWx5cHNlJTIwaG9ycm9yfGVufDF8fHx8MTc2MTg5OTYzNHww&ixlib=rb-4.1.0&q=80&w=1080',
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
        image: 'https://images.unsplash.com/photo-1569002925653-ed18f55d7292?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlc2NhcGUlMjByb29tJTIwZGFyayUyMG15c3RlcmlvdXN8ZW58MXx8fHwxNzYxOTM1ODcyfDA&ixlib=rb-4.1.0&q=80&w=1080',
        priceRange: '$25 - $30',
        ageRange: 'All ages',
        duration: '1 Hour',
        difficulty: 5,
        categoryId: '1'
      },
      {
        id: '3',
        name: 'Catacombs',
        image: 'https://images.unsplash.com/photo-1637481687365-9b133c567071?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXRhY29tYnMlMjB1bmRlcmdyb3VuZCUyMHR1bm5lbHxlbnwxfHx8fDE3NjE5MzU4NzN8MA&ixlib=rb-4.1.0&q=80&w=1080',
        priceRange: '$25 - $30',
        ageRange: 'All ages',
        duration: '1 Hour',
        difficulty: 2,
        categoryId: '1'
      },
      {
        id: '4',
        name: 'Murder Mystery',
        image: 'https://images.unsplash.com/photo-1636056471685-1cfdfa9d2e4b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXJkZXIlMjBteXN0ZXJ5JTIwZGV0ZWN0aXZlfGVufDF8fHx8MTc2MTkzNTg3M3ww&ixlib=rb-4.1.0&q=80&w=1080',
        priceRange: '$25 - $30',
        ageRange: 'Ages 6+',
        duration: '1 Hour',
        difficulty: 5,
        categoryId: '1'
      },
      {
        id: '5',
        name: "The Jolly Roger, Curse of the Devil's Shroud",
        image: 'https://images.unsplash.com/photo-1561625116-df74735458a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaXJhdGUlMjBzaGlwJTIwd3JlY2t8ZW58MXx8fHwxNzYxOTM1ODc0fDA&ixlib=rb-4.1.0&q=80&w=1080',
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

  // Fetch venue data from Supabase by embedKey
  useEffect(() => {
    const fetchVenueData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // If no embedKey provided, use defaults
        if (!widgetKey) {
          console.log('⚠️ No embedKey provided, using default config');
          setIsLoading(false);
          return;
        }

        console.log('🔍 Fetching venue data for embedKey:', widgetKey);

        // Fetch all venues and filter by embedKey in JavaScript
        // (JSONB queries can be tricky, so we fetch and filter client-side)
        const { data: allVenues, error: fetchError } = await supabase
          .from('venues')
          .select('*');

        if (fetchError) {
          console.error('❌ Error fetching venues:', fetchError);
          setError('Failed to load widget configuration');
          setIsLoading(false);
          return;
        }

        console.log('📦 Fetched venues count:', allVenues?.length || 0);
        console.log('🔑 Looking for embedKey:', widgetKey);

        // Find venue with matching embedKey
        const venue = allVenues?.find((v: any) => {
          const embedKey = v.settings?.embedKey;
          const matches = embedKey === widgetKey;
          console.log('🔍 Checking venue:', v.name, '| embedKey:', embedKey, '| matches:', matches);
          return matches;
        });

        if (!venue) {
          console.error('❌ No venue found for embedKey:', widgetKey);
          console.log('Available embedKeys:', allVenues?.map((v: any) => v.settings?.embedKey));
          setError('Widget not found. Please check your embed code.');
          setIsLoading(false);
          return;
        }

        console.log('✅ Venue found:', venue.name);
        console.log('✅ Venue data loaded:', venue);

        // Extract widget config from venue settings
        const venueConfig = venue.settings?.widgetConfig || {};
        const venuePrimaryColor = venue.settings?.primaryColor || primaryColor;

        // Set the config and color
        setEmbedConfig(venueConfig);
        setPrimaryColor(venuePrimaryColor);

        console.log('✅ Widget config loaded:', venueConfig);
        console.log('✅ Games count:', venueConfig.games?.length || 0);

        setIsLoading(false);
      } catch (e) {
        console.error('❌ Exception fetching venue data:', e);
        setError('An error occurred loading the widget');
        setIsLoading(false);
      }
    };

    // Only fetch if widgetKey is set
    if (widgetKey) {
      fetchVenueData();
    } else {
      setIsLoading(false);
    }
  }, [widgetKey]);

  const renderWidget = () => {
    const widgetProps = {
      primaryColor,
      config: embedConfig || defaultConfig
    };

    console.log('🎯 Rendering widget:', widgetId, 'with color:', primaryColor);

    switch (widgetId) {
      case 'farebook':
        return <FareBookWidget {...widgetProps} />;
      case 'calendar':
        return <CalendarWidget {...widgetProps} />;
      case 'bookgo':
        return <BookGoWidget {...widgetProps} />;
      case 'quick':
        return <QuickBookWidget {...widgetProps} />;
      case 'multistep':
        return <MultiStepWidget {...widgetProps} />;
      case 'resolvex':
        return <ResolvexWidget {...widgetProps} />;
      case 'singlegame':
        console.log('✅ Rendering Calendar Single Event widget');
        return (
          <CalendarSingleEventBookingPage
            {...widgetProps}
            gameName={singleGameName}
            gameDescription={singleGameDescription}
            gamePrice={singleGamePrice}
          />
        );
      default:
        console.log('⚠️ Widget ID not matched, defaulting to farebook');
        return <FareBookWidget {...widgetProps} />;
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <WidgetThemeProvider initialTheme={widgetTheme}>
        <div className={`w-full min-h-screen flex items-center justify-center ${widgetTheme === 'dark' ? 'dark bg-[#0a0a0a]' : 'bg-white'}`}>
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className={`text-sm ${widgetTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Loading widget...
            </p>
          </div>
        </div>
      </WidgetThemeProvider>
    );
  }

  // Show error state
  if (error) {
    return (
      <WidgetThemeProvider initialTheme={widgetTheme}>
        <div className={`w-full min-h-screen flex items-center justify-center ${widgetTheme === 'dark' ? 'dark bg-[#0a0a0a]' : 'bg-white'}`}>
          <div className="text-center max-w-md p-6">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className={`text-xl font-semibold mb-2 ${widgetTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Widget Error
            </h2>
            <p className={`text-sm ${widgetTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {error}
            </p>
            <p className={`text-xs mt-4 ${widgetTheme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
              Please check your embed code and try again.
            </p>
          </div>
        </div>
      </WidgetThemeProvider>
    );
  }

  return (
    <WidgetThemeProvider initialTheme={widgetTheme}>
      <div className={`w-full min-h-screen ${widgetTheme === 'dark' ? 'dark bg-[#0a0a0a]' : 'bg-white'}`}>
        {renderWidget()}
      </div>
    </WidgetThemeProvider>
  );
}
