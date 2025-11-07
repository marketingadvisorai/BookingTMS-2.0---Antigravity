import { useEffect, useState } from 'react';
import { CalendarWidget } from '../components/widgets/CalendarWidget';
import { BookGoWidget } from '../components/widgets/ListWidget';
import { QuickBookWidget } from '../components/widgets/QuickBookWidget';
import { MultiStepWidget } from '../components/widgets/MultiStepWidget';
import { ResolvexWidget } from '../components/widgets/ResolvexWidget';
import { CalendarSingleEventBookingPage } from '../components/widgets/CalendarSingleEventBookingPage';
import FareBookWidget from '../components/widgets/FareBookWidget';
import { WidgetThemeProvider } from '../components/widgets/WidgetThemeContext';

export function Embed() {
  const [widgetId, setWidgetId] = useState<string>('farebook');
  const [primaryColor, setPrimaryColor] = useState<string>('#2563eb');
  const [widgetKey, setWidgetKey] = useState<string>('');
  const [widgetTheme, setWidgetTheme] = useState<'light' | 'dark'>('light');
  // Config used by embedded widgets (loaded from localStorage when available)
  const [embedConfig, setEmbedConfig] = useState<any | undefined>(undefined);
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

  // Attempt to load saved config from localStorage for embeds
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const widget = params.get('widget') || 'farebook';
      const storageKeyMap: Record<string, string> = {
        calendar: 'calendarWidgetConfig',
        singlegame: 'singleGameWidgetConfig',
        farebook: 'fareBookConfig'
      };
      const key = storageKeyMap[widget];
      if (key) {
        const saved = localStorage.getItem(key);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === 'object') {
            setEmbedConfig(parsed);
          }
        }
      }
    } catch (e) {
      // Silent failures for embed preview; fallback to defaults
    }
  }, []);

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

  return (
    <WidgetThemeProvider initialTheme={widgetTheme}>
      <div className={`w-full min-h-screen ${widgetTheme === 'dark' ? 'dark bg-[#0a0a0a]' : 'bg-white'}`}>
        {renderWidget()}
      </div>
    </WidgetThemeProvider>
  );
}
