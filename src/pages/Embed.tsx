import { useCallback, useEffect, useState } from 'react';
import { CalendarWidget } from '../components/widgets/CalendarWidget';
import { BookGoWidget } from '../components/widgets/ListWidget';
import { QuickBookWidget } from '../components/widgets/QuickBookWidget';
import { MultiStepWidget } from '../components/widgets/MultiStepWidget';
import { ResolvexWidget } from '../components/widgets/ResolvexWidget';
// Use original working version - modular version caused crashes
import { CalendarSingleEventBookingPage } from '../components/widgets/CalendarSingleEventBookingPage';
import { VenueBookingWidget } from '../components/widgets/VenueBookingWidget';
import FareBookWidget from '../components/widgets/FareBookWidget';
import { WidgetThemeProvider } from '../components/widgets/WidgetThemeContext';
import { ActivityPreviewCard } from '../components/widgets/ActivityPreviewCard';
import { VenuePreviewCard } from '../components/widgets/VenuePreviewCard';
// BookFlow - New modern booking widget system
import { BookFlowWidget } from '../components/widgets/bookflow';
import { supabase } from '../lib/supabase';
import SupabaseBookingService from '../services/SupabaseBookingService';

const DEFAULT_PRIMARY_COLOR = '#2563eb';

export function Embed() {
  const [widgetId, setWidgetId] = useState<string>('booking');
  const [primaryColor, setPrimaryColor] = useState<string>(DEFAULT_PRIMARY_COLOR);
  const [widgetKey, setWidgetKey] = useState<string>('');
  const [widgetTheme, setWidgetTheme] = useState<'light' | 'dark'>('light');
  const [isFullPage, setIsFullPage] = useState<boolean>(false); // Full page mode flag
  // Config used by embedded widgets (loaded from Supabase by embedKey)
  const [embedConfig, setEmbedConfig] = useState<any | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // Activity and venue IDs from URL (for single activity embeds)
  const [activityId, setActivityId] = useState<string | undefined>(undefined);
  const [urlVenueId, setUrlVenueId] = useState<string | undefined>(undefined);
  // Single game overrides from URL (optional)
  const [singleGameName, setSingleGameName] = useState<string | undefined>(undefined);
  const [singleGameDescription, setSingleGameDescription] = useState<string | undefined>(undefined);
  const [singleGamePrice, setSingleGamePrice] = useState<number | undefined>(undefined);

  // Enforce responsive layout on the embed document to prevent horizontal scrolling
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    const previousHtmlStyles = {
      width: html.style.width,
      maxWidth: html.style.maxWidth,
      overflowX: html.style.overflowX,
    };
    const previousBodyStyles = {
      width: body.style.width,
      maxWidth: body.style.maxWidth,
      overflowX: body.style.overflowX,
    };

    html.style.width = '100%';
    html.style.maxWidth = '100%';
    html.style.overflowX = 'hidden';
    body.style.width = '100%';
    body.style.maxWidth = '100%';
    body.style.overflowX = 'hidden';

    return () => {
      html.style.width = previousHtmlStyles.width;
      html.style.maxWidth = previousHtmlStyles.maxWidth;
      html.style.overflowX = previousHtmlStyles.overflowX;
      body.style.width = previousBodyStyles.width;
      body.style.maxWidth = previousBodyStyles.maxWidth;
      body.style.overflowX = previousBodyStyles.overflowX;
    };
  }, []);

  useEffect(() => {
    // Parse URL parameters
    const params = new URLSearchParams(window.location.search);
    const widget = params.get('widget') || 'booking';
    const color = params.get('color') || DEFAULT_PRIMARY_COLOR.replace('#', '');
    const key = params.get('key') || '';
    const theme = (params.get('theme') as 'light' | 'dark') || 'light';
    const mode = params.get('mode'); // Check for fullpage mode
    
    // Activity-specific parameters (for single activity embeds)
    // Handle preview mode - when activityId is 'preview', show safe preview
    const actId = params.get('activityId') || undefined;
    const venId = params.get('venueId') || undefined;

    // Optional single game preview params
    const sgName = params.get('gameName') || undefined;
    const sgDescription = params.get('gameDescription') || undefined;
    const sgPriceRaw = params.get('gamePrice');
    const sgPrice = sgPriceRaw ? parseFloat(sgPriceRaw) : undefined;

    console.log('📍 Embed page loaded with params:', { widget, color, key, theme, activityId: actId, venueId: venId });
    console.log('📍 Full URL:', window.location.href);

    setWidgetId(widget);
    setPrimaryColor(`#${color.replace('#', '')}`);
    setWidgetKey(key);
    setWidgetTheme(theme);
    setIsFullPage(mode === 'fullpage');
    setActivityId(actId);
    setUrlVenueId(venId);

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
        const payloads = [
          { type: 'BOOKINGTMS_RESIZE', height },
          { type: 'resize-iframe', height },
        ];

        payloads.forEach(payload => {
          window.parent.postMessage(payload, '*');
        });
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

  // Store venue ID for real-time updates
  const [venueId, setVenueId] = useState<string | null>(null);

  /**
   * Fetch widget config - handles both venue-level and activity-level embeds
   * - Venue embed: uses embedKey to fetch all activities for a venue
   * - Activity embed: uses activityId to fetch single activity
   */
  const fetchWidgetConfig = useCallback(
    async ({ showLoading = true }: { showLoading?: boolean } = {}) => {
      // Handle preview mode - skip database fetch, use default config
      if (activityId === 'preview') {
        console.log('👁️ Preview mode detected - using safe preview');
        setIsLoading(false);
        setError(null);
        return;
      }

      // Handle single activity embed (activityId takes priority)
      if (activityId) {
        try {
          if (showLoading) setIsLoading(true);
          setError(null);

          console.log('🔍 Fetching activity config for activityId:', activityId);
          const result = await SupabaseBookingService.getActivityWidgetConfig(activityId);

          if (!result) {
            console.error('❌ No activity found for activityId:', activityId);
            setError('Activity not found. Please check your embed code.');
            return;
          }

          const { activity, venue, widgetConfig } = result;
          console.log('✅ Activity found:', activity.name, '(Venue:', venue?.name || 'N/A', ')');

          if (venue) {
            setVenueId(venue.id);
          }

          const mergedConfig = {
            ...defaultConfig,
            ...widgetConfig,
            activities: [activity],
            games: [activity], // Backward compatibility
          };

          setEmbedConfig(mergedConfig);

          const resolvedColor = widgetConfig?.primaryColor || DEFAULT_PRIMARY_COLOR;
          setPrimaryColor(resolvedColor.startsWith('#') ? resolvedColor : `#${resolvedColor}`);

          console.log('✅ Activity widget config loaded');
        } catch (e: any) {
          console.error('❌ Exception fetching activity data:', e);
          setError(e?.message || 'An error occurred loading the activity.');
        } finally {
          setIsLoading(false);
        }
        return;
      }

      // Handle venue embed (uses embedKey)
      if (!widgetKey) {
        console.log('⚠️ No embedKey provided, using default config');
        setEmbedConfig(undefined);
        setError(null);
        setVenueId(null);
        setIsLoading(false);
        return;
      }

      try {
        if (showLoading) {
          setIsLoading(true);
        }
        setError(null);

        console.log('🔍 Fetching config for embedKey:', widgetKey);
        
        // First try the new embed_configs table (Embed Pro 1.1)
        let result: any = await SupabaseBookingService.getEmbedProConfig(widgetKey);
        
        // Fall back to legacy venue.embed_key lookup
        if (!result) {
          console.log('📦 Trying legacy venue lookup...');
          result = await SupabaseBookingService.getVenueWidgetConfig(widgetKey);
        }

        if (!result) {
          console.error('❌ No venue found for embedKey:', widgetKey);
          setEmbedConfig(undefined);
          setError('Widget not found. Please check your embed code or contact the venue.');
          return;
        }

        const { venue, widgetConfig } = result;

        console.log('✅ Venue found:', venue.name, '(ID:', venue.id, ')');
        setVenueId(venue.id);

        const mergedConfig = {
          ...defaultConfig,
          ...widgetConfig,
          games: Array.isArray(widgetConfig?.games) && widgetConfig.games.length > 0
            ? widgetConfig.games
            : [],
        };

        setEmbedConfig(mergedConfig);

        const resolvedColor = widgetConfig?.primaryColor || venue.primary_color || DEFAULT_PRIMARY_COLOR;
        setPrimaryColor(resolvedColor.startsWith('#') ? resolvedColor : `#${resolvedColor}`);

        if (!mergedConfig.games.length) {
          console.warn('⚠️ No active activities found for this venue');
          setError('No experiences available at this time. Please check back later.');
        }

        console.log('✅ Venue widget config loaded with', mergedConfig.games.length, 'activities');
      } catch (e: any) {
        console.error('❌ Exception fetching venue data:', e);
        setEmbedConfig(undefined);
        setError(e?.message || e?.details || 'An error occurred loading the widget. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    },
    [widgetKey, activityId]
  );

  // Fetch widget data from Supabase (venue or single activity)
  useEffect(() => {
    if (widgetKey || activityId) {
      fetchWidgetConfig({ showLoading: true });
    } else {
      setIsLoading(false);
    }
  }, [widgetKey, activityId, fetchWidgetConfig]);

  // DISABLED: Real-time subscription was causing infinite loops and system crashes
  // Real-time updates will be re-enabled after architecture refactor
  // The widget will still work correctly, just won't auto-update without page refresh
  /*
  useEffect(() => {
    if (!venueId) return;
    // Real-time subscription code disabled for stability
  }, [venueId]);
  */

  const renderWidget = () => {
    const widgetProps = {
      primaryColor,
      config: embedConfig || defaultConfig
    };

    console.log('🎯 Rendering widget:', widgetId, 'with color:', primaryColor);

    switch (widgetId) {
      // BookFlow - New modern booking widgets
      case 'bookflow':
      case 'booking-widget':
        // Check if we have embedConfig from embed_configs table
        if (embedConfig?.embedConfig) {
          const ec = embedConfig.embedConfig;
          return (
            <BookFlowWidget
              embedKey={widgetKey}
              targetType={ec.target_type as 'activity' | 'venue'}
              targetId={ec.target_id}
              config={ec.config}
              style={ec.style}
              theme={widgetTheme}
            />
          );
        }
        // Fallback for activity embed
        if (activityId && activityId !== 'preview') {
          return (
            <BookFlowWidget
              embedKey={widgetKey}
              targetType="activity"
              targetId={activityId}
              style={{ primaryColor }}
              theme={widgetTheme}
            />
          );
        }
        // Fallback for venue embed
        if (venueId) {
          return (
            <BookFlowWidget
              embedKey={widgetKey}
              targetType="venue"
              targetId={venueId}
              style={{ primaryColor }}
              theme={widgetTheme}
            />
          );
        }
        // Final fallback
        return <FareBookWidget {...widgetProps} />;
        
      case 'farebook':
        return <FareBookWidget {...widgetProps} />;
      case 'calendar':
      case 'venue':
        // Venue embed - show all activities at venue
        if (embedConfig?.activities?.length > 0 || embedConfig?.games?.length > 0) {
          const activities = embedConfig?.activities || embedConfig?.games || [];
          return (
            <VenueBookingWidget
              venueId={embedConfig?.venueId || venueId || ''}
              venueName={embedConfig?.venueName || 'Venue'}
              venueAddress={embedConfig?.venueAddress}
              timezone={embedConfig?.timezone || 'UTC'}
              activities={activities.map((a: any) => ({
                id: a.id,
                name: a.name,
                tagline: a.tagline || a.description?.substring(0, 100),
                description: a.description,
                duration: a.duration || 60,
                price: a.price || 0,
                childPrice: a.childPrice || a.child_price,
                minPlayers: a.minPlayers || a.min_players || 2,
                maxPlayers: a.maxPlayers || a.max_players || 8,
                coverImage: a.coverImage || a.image || a.imageUrl || a.image_url,
                category: a.category,
                stripe: {
                  priceId: a.stripe_price_id || a.stripePriceId,
                  productId: a.stripe_product_id || a.stripeProductId,
                },
              }))}
              primaryColor={primaryColor}
              stripePublishableKey={embedConfig?.stripePublishableKey}
            />
          );
        }
        // Fallback to legacy CalendarWidget
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
      case 'calendar-booking': // New unified booking widget route
      case 'booking':
        // Handle preview mode with safe preview component
        if (activityId === 'preview') {
          console.log('👁️ Rendering Preview mode - using ActivityPreviewCard');
          return (
            <ActivityPreviewCard
              activity={{
                id: 'preview',
                name: singleGameName || 'Sample Activity',
                description: singleGameDescription || 'Experience an amazing adventure with your group.',
                duration: 60,
                difficulty: '3',
                min_players: 2,
                max_players: 8,
                price: singleGamePrice || 30,
                schedule: {
                  operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                  startTime: '10:00',
                  endTime: '22:00',
                  slotInterval: 60,
                },
              }}
              primaryColor={primaryColor}
              theme={widgetTheme}
              showBookingFlow={true}
            />
          );
        }
        console.log('✅ Rendering Calendar Booking widget with activityId:', activityId, 'venueId:', urlVenueId);
        // Use original stable component (modular version caused crashes)
        return (
          <CalendarSingleEventBookingPage
            {...widgetProps}
            activityId={activityId}
            venueId={urlVenueId}
            gameName={singleGameName}
            gameDescription={singleGameDescription}
            gamePrice={singleGamePrice}
          />
        );
      default:
        // Default to booking widget (CalendarSingleEventBookingPage)
        console.log('⚠️ Widget ID not matched, defaulting to booking widget');
        if (activityId && activityId !== 'preview') {
          return (
            <CalendarSingleEventBookingPage
              {...widgetProps}
              activityId={activityId}
              venueId={urlVenueId}
            />
          );
        }
        // Fallback to FareBookWidget when no activity context
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
      <div className={`w-full min-h-screen overflow-x-hidden ${widgetTheme === 'dark' ? 'dark bg-[#0a0a0a]' : 'bg-white'}`} style={{ maxWidth: '100%' }}>
        {renderWidget()}
      </div>
    </WidgetThemeProvider>
  );
}
