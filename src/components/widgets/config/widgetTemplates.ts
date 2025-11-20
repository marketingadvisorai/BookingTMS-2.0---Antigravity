import { CalendarWidget } from '../CalendarWidget';
import { BookGoWidget } from '../ListWidget';
import { QuickBookWidget } from '../QuickBookWidget';
import { MultiStepWidget } from '../MultiStepWidget';
import { ResolvexWidget } from '../ResolvexWidget';
import { CalendarSingleEventBookingPage } from '../CalendarSingleEventBookingPage';
import FareBookWidget from '../FareBookWidget';
import FareBookSingleEventWidget from '../FareBookSingleEventWidget';

export interface WidgetTemplate {
  id: string;
  name: string;
  description: string;
  component: React.ComponentType<any>;
  recommended: boolean;
  category: string;
}

export const widgetTemplates: WidgetTemplate[] = [
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

// Beta owners can only access these widgets
export const betaAllowedWidgets = ['calendar', 'singlegame', 'multistep'];

// Helper to get template by ID
export const getTemplateById = (id: string): WidgetTemplate | undefined => {
  return widgetTemplates.find(t => t.id === id);
};

// Check if widget is locked for beta owners
export const isWidgetLocked = (widgetId: string, isBetaOwner: boolean): boolean => {
  return isBetaOwner && !betaAllowedWidgets.includes(widgetId);
};
