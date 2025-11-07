import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { PageHeader } from '../components/layout/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Code, Copy, Check, ExternalLink, Eye, Settings2, Palette, Monitor, Save } from 'lucide-react';
import { Separator } from '../components/ui/separator';
import { ScrollArea } from '../components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { toast } from 'sonner';
import { CalendarWidget } from '../components/widgets/CalendarWidget';
import { BookGoWidget } from '../components/widgets/ListWidget';
import { QuickBookWidget } from '../components/widgets/QuickBookWidget';
import { MultiStepWidget } from '../components/widgets/MultiStepWidget';
import { ResolvexWidget } from '../components/widgets/ResolvexWidget';
import { CalendarSingleEventBookingPage } from '../components/widgets/CalendarSingleEventBookingPage';
import FareBookWidget from '../components/widgets/FareBookWidget';
import FareBookSingleEventWidget from '../components/widgets/FareBookSingleEventWidget';
import FareBookSettings from '../components/widgets/FareBookSettings';
import CalendarWidgetSettings from '../components/widgets/CalendarWidgetSettings';
import WidgetSettings from '../components/widgets/WidgetSettings';
import { EmbedPreview } from '../components/widgets/EmbedPreview';
import { WidgetThemeProvider } from '../components/widgets/WidgetThemeContext';
import { WidgetThemeSettings } from '../components/widgets/WidgetThemeSettings';

const widgetTemplates = [
  {
    id: 'farebook',
    name: 'FareBook Widget',
    description: 'Multi-step booking flow with categories, games list, and calendar view',
    component: FareBookWidget,
    recommended: true,
    category: 'Full Page',
  },
  {
    id: 'farebook-single',
    name: 'FareBook Single Event / Room Widget',
    description: 'Streamlined booking widget for a single event or room with calendar, time slots, and checkout',
    component: FareBookSingleEventWidget,
    recommended: true,
    category: 'Full Page',
  },
  {
    id: 'singlegame',
    name: 'Calendar Single Event / Room Booking Page',
    description: 'Dedicated landing page for one specific game with hero image and inline booking',
    component: CalendarSingleEventBookingPage,
    recommended: true,
    category: 'Landing Page',
  },
  {
    id: 'calendar',
    name: 'Calendar Booking Widget',
    description: 'Interactive calendar with game selection and time slots',
    component: CalendarWidget,
    recommended: true,
    category: 'Full Page',
  },
  {
    id: 'bookgo',
    name: 'BookGo',
    description: 'Browse games in a list format with instant booking',
    component: BookGoWidget,
    recommended: true,
    category: 'Full Page',
  },
  {
    id: 'resolvex',
    name: 'Resolvex Grid Widget',
    description: 'Beautiful grid layout with large images and instant booking',
    component: ResolvexWidget,
    recommended: true,
    category: 'Full Page',
  },
  {
    id: 'quick',
    name: 'Quick Booking Form',
    description: 'Simple one-page booking form for fast reservations',
    component: QuickBookWidget,
    recommended: false,
    category: 'Compact',
  },
  {
    id: 'multistep',
    name: 'OTB Multi Step Checkout',
    description: 'Step-by-step booking flow with progress tracking',
    component: MultiStepWidget,
    recommended: true,
    category: 'Full Page',
  },
];

export function BookingWidgets() {
  const [selectedTemplate, setSelectedTemplate] = useState('singlegame');
  const [showPreview, setShowPreview] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#2563eb');
  
  // Default config for all widgets
  const defaultWidgetConfig = {
    showSecuredBadge: true,
    showHealthSafety: true,
    enableVeteranDiscount: false,
    widgetTitle: '',
    widgetDescription: '',
    // Theme & Preview additions
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
  
  // Removed deprecated calendarWidgetConfig; using calendarConfig below for Calendar widget

  const [fareBookConfig, setFareBookConfig] = useState<any>({
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
  });
  
  // Individual configs for other widgets
  const [bookGoConfig, setBookGoConfig] = useState<any>({
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
  });
  
  const [calendarConfig, setCalendarConfig] = useState<any>({
    ...defaultWidgetConfig,
    games: []
  });

  // Persist calendarConfig to localStorage
  const CALENDAR_CONFIG_STORAGE_KEY = 'calendarWidgetConfig';

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

  useEffect(() => {
    try {
      localStorage.setItem(CALENDAR_CONFIG_STORAGE_KEY, JSON.stringify(calendarConfig));
    } catch (e) {
      // Ignore storage errors silently
    }
  }, [calendarConfig]);
  
  const [singleGameConfig, setSingleGameConfig] = useState<any>({
    ...defaultWidgetConfig,
    games: []
  });

  // Persist singleGameConfig to localStorage
  const SINGLEGAME_CONFIG_STORAGE_KEY = 'singleGameWidgetConfig';

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

  useEffect(() => {
    try {
      localStorage.setItem(SINGLEGAME_CONFIG_STORAGE_KEY, JSON.stringify(singleGameConfig));
    } catch (e) {
      // Ignore storage errors silently
    }
  }, [singleGameConfig]);
  
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

  // Get config and setter for current widget
  const getWidgetConfig = (widgetId: string) => {
    const configs: Record<string, any> = {
      farebook: fareBookConfig,
      bookgo: bookGoConfig,
      calendar: calendarConfig,
      singlegame: singleGameConfig,
      resolvex: resolvexConfig,
      quick: quickConfig,
      multistep: multiStepConfig
    };
    return configs[widgetId] || defaultWidgetConfig;
  };
  
  const getWidgetConfigSetter = (widgetId: string) => {
    const setters: Record<string, any> = {
      farebook: setFareBookConfig,
      bookgo: setBookGoConfig,
      calendar: setCalendarConfig,
      singlegame: setSingleGameConfig,
      resolvex: setResolvexConfig,
      quick: setQuickConfig,
      multistep: setMultiStepConfig
    };
    return setters[widgetId] || setFareBookConfig;
  };

  const generateEmbedCode = () => {
    const template = widgetTemplates.find(t => t.id === selectedTemplate);
    const baseUrl = 'https://bookingtms.com';
    
    return `<!-- BookingTMS ${template?.name} -->
<div id="bookingtms-widget-${selectedTemplate}"></div>
<script>
  (function() {
    var script = document.createElement('script');
    script.src = '${baseUrl}/widgets/${selectedTemplate}.js';
    script.async = true;
    script.setAttribute('data-widget-id', 'YOUR_WIDGET_ID');
    script.setAttribute('data-primary-color', '${primaryColor}');
    script.setAttribute('data-template', '${selectedTemplate}');
    document.getElementById('bookingtms-widget-${selectedTemplate}').appendChild(script);
  })();
</script>

<!-- Styles (optional) -->
<link rel="stylesheet" href="${baseUrl}/widgets/styles.css">`;
  };

  const handleCopyCode = () => {
    const code = generateEmbedCode();
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedTemplateData = widgetTemplates.find(t => t.id === selectedTemplate);
  const SelectedComponent = selectedTemplateData?.component;

  return (
    <WidgetThemeProvider>
      <div className="space-y-4 sm:space-y-6">
        {/* Page Header */}
        <PageHeader
          title="Booking Widget Templates"
          description="Choose a professional booking widget for your website"
          sticky
        />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <Card className="border-gray-200 dark:border-[#2a2a2a] shadow-sm hover:shadow-md dark:hover:shadow-[0_0_15px_rgba(79,70,229,0.1)] transition-all">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-[#4f46e5]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Code className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-[#6366f1]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-[#737373]">Templates Available</p>
                <p className="text-gray-900 dark:text-white">{widgetTemplates.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200 dark:border-[#2a2a2a] shadow-sm hover:shadow-md dark:hover:shadow-[0_0_15px_rgba(79,70,229,0.1)] transition-all">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <ExternalLink className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-[#737373]">Widget Bookings</p>
                <p className="text-gray-900 dark:text-white">1,247</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200 dark:border-[#2a2a2a] shadow-sm hover:shadow-md dark:hover:shadow-[0_0_15px_rgba(79,70,229,0.1)] transition-all">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 dark:bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-[#737373]">Conversion Rate</p>
                <p className="text-gray-900 dark:text-white text-sm sm:text-base">5.8%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200 dark:border-[#2a2a2a] shadow-sm hover:shadow-md dark:hover:shadow-[0_0_15px_rgba(79,70,229,0.1)] transition-all">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 dark:bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Settings2 className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-[#737373]">Active Installs</p>
                <p className="text-gray-900 dark:text-white">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Template Selection */}
      <div>
        <h2 className="text-gray-900 dark:text-white mb-3 sm:mb-4">Choose Your Template</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
          {widgetTemplates.map((template) => (
            <Card
              key={template.id}
              className={`border-2 transition-all cursor-pointer ${
                selectedTemplate === template.id
                  ? 'border-blue-600 dark:border-[#4f46e5] shadow-md dark:shadow-[0_0_20px_rgba(79,70,229,0.2)]'
                  : 'border-gray-200 dark:border-[#2a2a2a] hover:border-gray-300 dark:hover:border-[#3a3a3a]'
              }`}
              style={{
                borderColor: selectedTemplate === template.id ? primaryColor : undefined,
              }}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="text-gray-900 dark:text-white text-sm sm:text-base">{template.name}</h3>
                      {template.recommended && (
                        <Badge variant="secondary" className="bg-blue-100 dark:bg-[#4f46e5]/20 text-blue-700 dark:text-[#6366f1] border border-blue-200 dark:border-[#4f46e5]/30 text-xs flex-shrink-0">
                          Recommended
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-[#a3a3a3] mb-3">{template.description}</p>
                    <Badge variant="secondary" className="text-xs bg-gray-100 dark:bg-[#1e1e1e] text-gray-700 dark:text-[#a3a3a3] border border-gray-200 dark:border-[#2a2a2a]">
                      {template.category}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTemplate(template.id);
                      setShowPreview(true);
                    }}
                    className="flex-1 h-9 text-xs sm:text-sm"
                  >
                    <Eye className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Preview</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTemplate(template.id);
                      setShowSettings(true);
                    }}
                    className="flex-1 h-9 text-xs sm:text-sm"
                  >
                    <Settings2 className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Settings</span>
                  </Button>
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTemplate(template.id);
                      setShowEmbed(true);
                    }}
                    className="flex-1 h-9 text-xs sm:text-sm bg-blue-600 dark:bg-[#4f46e5] hover:bg-blue-700 dark:hover:bg-[#4338ca]"
                  >
                    <Code className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Embed</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Widget Theme & Customization */}
      <WidgetThemeSettings />

      {/* Customization & Code */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Quick Actions */}
        <Card className="border-gray-200 dark:border-[#2a2a2a] shadow-sm">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Monitor className="w-4 h-4" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3 p-4 sm:p-6 pt-0">
            <Button
              variant="outline"
              className="w-full h-10 text-sm"
              onClick={() => setShowPreview(true)}
            >
              <Monitor className="w-4 h-4 mr-2" />
              Full Screen Preview
            </Button>
            <Button
              variant="outline"
              className="w-full h-10 text-sm"
              onClick={() => window.open('https://bookingtms.com/demo', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Live Demo
            </Button>
            <Button
              variant="outline"
              className="w-full h-10 text-sm bg-blue-600 dark:bg-[#4f46e5] text-white hover:bg-blue-700 dark:hover:bg-[#4338ca] hover:text-white"
              onClick={() => setShowEmbed(true)}
            >
              <Code className="w-4 h-4 mr-2" />
              Get Embed Code
            </Button>
          </CardContent>
        </Card>

        {/* Embed Code */}
        <Card className="border-gray-200 dark:border-[#2a2a2a] shadow-sm lg:col-span-2">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-start sm:items-center justify-between gap-3">
              <div className="min-w-0">
                <CardTitle className="text-base sm:text-lg">Embed Code</CardTitle>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-[#a3a3a3] mt-1">Copy and paste this code into your website</p>
              </div>
              <Button onClick={handleCopyCode} className="flex-shrink-0 h-9 sm:h-10 text-xs sm:text-sm bg-blue-600 dark:bg-[#4f46e5] hover:bg-blue-700 dark:hover:bg-[#4338ca]">
                {copied ? (
                  <>
                    <Check className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Copy Code</span>
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <Tabs defaultValue="html">
              <TabsList className="w-full grid grid-cols-3 h-9 sm:h-10">
                <TabsTrigger value="html" className="text-xs sm:text-sm">HTML</TabsTrigger>
                <TabsTrigger value="react" className="text-xs sm:text-sm">React</TabsTrigger>
                <TabsTrigger value="wordpress" className="text-xs sm:text-sm">WordPress</TabsTrigger>
              </TabsList>
              <TabsContent value="html" className="mt-3 sm:mt-4">
                <ScrollArea className="h-[250px] sm:h-[300px] w-full rounded-lg bg-gray-900 dark:bg-[#0a0a0a] border border-gray-700 dark:border-[#2a2a2a] p-3 sm:p-4">
                  <pre className="text-xs sm:text-sm text-green-400 dark:text-emerald-400">
                    <code>{generateEmbedCode()}</code>
                  </pre>
                </ScrollArea>
              </TabsContent>
              <TabsContent value="react" className="mt-3 sm:mt-4">
                <ScrollArea className="h-[250px] sm:h-[300px] w-full rounded-lg bg-gray-900 dark:bg-[#0a0a0a] border border-gray-700 dark:border-[#2a2a2a] p-3 sm:p-4">
                  <pre className="text-xs sm:text-sm text-green-400 dark:text-emerald-400">
                    <code>{`import { useEffect } from 'react';

export function BookingWidget() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://bookingtms.com/widgets/${selectedTemplate}.js';
    script.async = true;
    script.setAttribute('data-widget-id', 'YOUR_WIDGET_ID');
    script.setAttribute('data-primary-color', '${primaryColor}');
    script.setAttribute('data-template', '${selectedTemplate}');
    
    const widgetDiv = document.getElementById('bookingtms-widget');
    if (widgetDiv) {
      widgetDiv.appendChild(script);
    }
    
    return () => {
      if (widgetDiv && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return <div id="bookingtms-widget" />;
}`}</code>
                  </pre>
                </ScrollArea>
              </TabsContent>
              <TabsContent value="wordpress" className="mt-3 sm:mt-4">
                <ScrollArea className="h-[250px] sm:h-[300px] w-full rounded-lg bg-gray-900 dark:bg-[#0a0a0a] border border-gray-700 dark:border-[#2a2a2a] p-3 sm:p-4">
                  <pre className="text-xs sm:text-sm text-green-400 dark:text-emerald-400">
                    <code>{`1. Login to WordPress Admin Panel
2. Go to Pages or Posts
3. Edit the page where you want the widget
4. Switch to HTML/Code Editor
5. Paste the following code:

${generateEmbedCode()}

6. Update/Publish your page
7. Visit the page to see your booking widget

Alternative: Use a shortcode plugin
[bookingtms template="${selectedTemplate}" color="${primaryColor}"]`}</code>
                  </pre>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Installation Guide */}
      <Card className="border-gray-200 dark:border-[#2a2a2a] shadow-sm">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Installation Guide</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-[#4f46e5]/20 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <span className="text-blue-600 dark:text-[#6366f1] text-sm sm:text-base">1</span>
              </div>
              <h3 className="text-sm text-gray-900 dark:text-white mb-2">Choose Template</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-[#a3a3a3]">
                Select the booking widget template that best fits your website design and user flow
              </p>
            </div>
            <div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-[#4f46e5]/20 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <span className="text-blue-600 dark:text-[#6366f1] text-sm sm:text-base">2</span>
              </div>
              <h3 className="text-sm text-gray-900 dark:text-white mb-2">Customize Colors</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-[#a3a3a3]">
                Adjust the primary color to match your brand. The widget will automatically adapt
              </p>
            </div>
            <div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-[#4f46e5]/20 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <span className="text-blue-600 dark:text-[#6366f1] text-sm sm:text-base">3</span>
              </div>
              <h3 className="text-sm text-gray-900 dark:text-white mb-2">Copy & Paste Code</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-[#a3a3a3]">
                Copy the embed code and paste it into your website. Replace YOUR_WIDGET_ID with your actual ID
              </p>
            </div>
          </div>

          <Separator className="my-4 sm:my-6" />

          <div className="bg-blue-50 dark:bg-[#4f46e5]/10 border border-blue-200 dark:border-[#4f46e5]/30 rounded-lg p-3 sm:p-4">
            <h3 className="text-xs sm:text-sm text-blue-900 dark:text-[#6366f1] mb-1 sm:mb-2">💡 Pro Tip</h3>
            <p className="text-xs sm:text-sm text-blue-700 dark:text-[#818cf8]">
              Need help with installation? Contact our support team or check out our detailed integration guides in the documentation.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Preview Dialog - Full Screen on Mobile */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="!w-screen !h-screen !max-w-none !max-h-none sm:!w-[90vw] sm:!h-[90vh] sm:!max-w-[1400px] sm:!max-h-[90vh] !rounded-none sm:!rounded-lg overflow-hidden p-0 flex flex-col">
          <DialogHeader className="bg-white dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-[#2a2a2a] p-4 sm:p-6 shrink-0">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <DialogTitle className="text-base sm:text-lg text-gray-900 dark:text-white truncate">{selectedTemplateData?.name}</DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-gray-600 dark:text-[#a3a3a3] mt-0.5 hidden sm:block">
                  Live Preview - See how this widget will look on your website
                </DialogDescription>
              </div>
              <Badge variant="secondary" className="bg-gray-100 dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2a2a2a] text-xs flex-shrink-0 hidden sm:inline-flex">
                Template Preview
              </Badge>
            </div>
          </DialogHeader>
          <ScrollArea className="flex-1 h-full">
            <div className="p-4 sm:p-8 pb-24 sm:pb-28 bg-gray-50 dark:bg-[#0a0a0a] min-h-full">
              {SelectedComponent && (
                <SelectedComponent 
                  primaryColor={primaryColor} 
                  config={getWidgetConfig(selectedTemplate)} 
                />
              )}
              {/* Bottom spacer to provide blank space after content */}
              <div className="h-12 sm:h-20" />
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog - Full Screen on Mobile */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="!w-screen !h-screen !max-w-none !max-h-none sm:!w-[90vw] sm:!h-[90vh] sm:!max-w-[1200px] sm:!max-h-[90vh] !rounded-none sm:!rounded-lg overflow-hidden p-0 flex flex-col">
          <DialogHeader className="bg-white dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-[#2a2a2a] p-4 sm:p-6 shrink-0">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <DialogTitle className="text-base sm:text-lg text-gray-900 dark:text-white truncate">
                  Configure {selectedTemplateData?.name}
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-gray-600 dark:text-[#a3a3a3] mt-0.5 hidden sm:block">
                  {selectedTemplate === 'farebook' 
                    ? 'Customize your widget settings, categories, games, and pricing'
                    : selectedTemplate === 'calendar'
                    ? 'Customize your widget settings with step-by-step game adding experience'
                    : 'Customize your widget settings, games, and pricing options'}
                </DialogDescription>
              </div>
              <Button
                onClick={() => {
                  setShowSettings(false);
                  toast.success('Settings saved successfully!');
                }}
                className="bg-blue-600 dark:bg-[#4f46e5] hover:bg-blue-700 dark:hover:bg-[#4338ca] text-xs sm:text-sm h-9 sm:h-10 flex-shrink-0"
                size="sm"
              >
                <Save className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Save Changes</span>
              </Button>
            </div>
          </DialogHeader>
          <ScrollArea className="flex-1 h-full">
            <div className="p-4 sm:p-6 pb-20 sm:pb-24 bg-gray-50 dark:bg-[#0a0a0a]">
              {selectedTemplate === 'farebook' ? (
                <FareBookSettings
                  config={fareBookConfig}
                  onConfigChange={setFareBookConfig}
                  onPreview={() => {
                    setShowSettings(false);
                    setShowPreview(true);
                  }}
                />
              ) : selectedTemplate === 'calendar' ? (
                <CalendarWidgetSettings
                  config={getWidgetConfig(selectedTemplate)}
                  onConfigChange={getWidgetConfigSetter(selectedTemplate)}
                  onPreview={() => {
                    setShowSettings(false);
                    setShowPreview(true);
                  }}
                />
              ) : (
                <WidgetSettings
                  widgetType={selectedTemplate}
                  config={getWidgetConfig(selectedTemplate)}
                  onConfigChange={getWidgetConfigSetter(selectedTemplate)}
                  onPreview={() => {
                    setShowSettings(false);
                    setShowPreview(true);
                  }}
                />
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Embed & Install Dialog */}
      <Dialog open={showEmbed} onOpenChange={setShowEmbed}>
        <DialogContent className="!w-screen !h-screen !max-w-none !max-h-none sm:!w-[90vw] sm:!h-[90vh] sm:!max-w-[1200px] sm:!max-h-[90vh] !rounded-none sm:!rounded-lg overflow-hidden p-0 flex flex-col">
          <DialogHeader className="bg-white dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-[#2a2a2a] p-4 sm:p-6 shrink-0">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <DialogTitle className="text-base sm:text-lg text-gray-900 dark:text-white truncate">
                  Embed {selectedTemplateData?.name}
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-gray-600 dark:text-[#a3a3a3] mt-0.5 hidden sm:block">
                  Get the embed code and install the widget on your website
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <ScrollArea className="flex-1 h-full">
            <div className="p-4 sm:p-6 pb-20 sm:pb-24 bg-gray-50 dark:bg-[#0a0a0a]">
              <EmbedPreview
                widgetId={selectedTemplate}
                widgetName={selectedTemplateData?.name || ''}
                primaryColor={primaryColor}
              />
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
      </div>
    </WidgetThemeProvider>
  );
}
