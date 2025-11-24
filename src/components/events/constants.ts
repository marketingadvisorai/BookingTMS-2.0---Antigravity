import {
    Info,
    Users,
    Sparkles,
    ImageIcon,
    Calendar,
    CreditCard,
    CalendarDays,
    Check,
    List,
    Grid,
    LayoutTemplate
} from 'lucide-react';

export const WIDGET_OPTIONS = [
    {
        id: 'calendar-single',
        name: 'Calendar Single Event / Room Booking Page Widget',
        description: 'Best for single room or escape game booking pages.',
        icon: Calendar,
        preview: '/widgets/calendar-single.png'
    },
    {
        id: 'calendar-multi',
        name: 'Calendar Multi-Event / Room Booking Page Widget',
        description: 'Ideal for showing availability across multiple rooms.',
        icon: CalendarDays,
        preview: '/widgets/calendar-multi.png'
    },
    {
        id: 'list-view',
        name: 'List View Widget',
        description: 'Simple list of available slots.',
        icon: List,
        preview: '/widgets/list-view.png'
    },
    {
        id: 'grid-view',
        name: 'Grid View Widget',
        description: 'Visual grid layout of games and times.',
        icon: Grid,
        preview: '/widgets/grid-view.png'
    },
    {
        id: 'weekly-view',
        name: 'Weekly Schedule Widget',
        description: 'Overview of the entire week.',
        icon: LayoutTemplate,
        preview: '/widgets/weekly-view.png'
    }
];

export const STEPS = [
    { id: 1, name: 'Basic Info', icon: Info },
    { id: 2, name: 'Capacity & Pricing', icon: Users },
    { id: 3, name: 'Activity Details', icon: Sparkles },
    { id: 4, name: 'Media Upload', icon: ImageIcon },
    { id: 5, name: 'Schedule', icon: Calendar },
    { id: 6, name: 'Payment Settings', icon: CreditCard },
    { id: 7, name: 'Widget & Embed', icon: CalendarDays },
    { id: 8, name: 'Review & Publish', icon: Check }
];

export const CATEGORIES = [
    'Horror',
    'Mystery',
    'Adventure',
    'Sci-Fi',
    'Fantasy',
    'Historical',
    'Family-Friendly',
    'Challenge'
];

export const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Mandarin', 'Japanese'];
export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const TIMEZONES = [
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'London (GMT)' },
    { value: 'Europe/Paris', label: 'Paris (CET)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
    { value: 'Asia/Dubai', label: 'Dubai (GST)' },
    { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
];

// Mock existing FAQs and Policies (in real app, these would come from API)
export const EXISTING_FAQS = [
    { id: 'faq-1', question: 'What should I bring?', answer: 'Just bring yourself and your team! All materials are provided.' },
    { id: 'faq-2', question: 'Can I bring food and drinks?', answer: 'Outside food and drinks are not permitted, but we have a café on-site.' },
    { id: 'faq-3', question: 'Is photography allowed?', answer: 'Yes! Feel free to take photos before and after your game.' },
];

export const EXISTING_POLICIES = [
    { id: 'policy-1', title: 'Standard Cancellation', description: 'Free cancellation up to 24 hours before the scheduled time. Cancellations within 24 hours are non-refundable.' },
    { id: 'policy-2', title: 'Flexible Cancellation', description: 'Free cancellation up to 2 hours before the scheduled time with a small fee.' },
    { id: 'policy-3', title: 'No Refund Policy', description: 'All bookings are final and non-refundable. Rescheduling allowed up to 48 hours in advance.' },
];

export const EXISTING_WAIVERS = [
    { id: 'waiver-1', name: 'Standard Liability Waiver', description: 'General liability waiver for all activities' },
    { id: 'waiver-2', name: 'Minor Participant Waiver', description: 'Waiver for participants under 18 years old' },
    { id: 'waiver-3', name: 'Photo Release Waiver', description: 'Permission to use photos and videos for marketing' },
    { id: 'waiver-4', name: 'COVID-19 Health Waiver', description: 'Health screening and COVID-19 related acknowledgments' },
];
