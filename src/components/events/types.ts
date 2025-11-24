export interface EmbedContext {
    embedKey?: string;
    primaryColor?: string;
    venueName?: string;
    baseUrl?: string;
}

export interface GameData {
    // Step 1: Basic Info
    name: string;
    description: string;
    category: string;
    tagline?: string;
    eventType: 'public' | 'private';
    gameType: 'physical' | 'virtual' | 'hybrid';

    // Step 2: Capacity & Pricing
    minAdults: number;
    maxAdults: number;
    minChildren: number;
    maxChildren: number;
    adultPrice: number;
    childPrice: number;
    customCapacityFields: Array<{
        id: string;
        name: string;
        min: number;
        max: number;
        price: number;
    }>;
    groupDiscount: boolean;
    dynamicPricing: boolean;
    peakPricing: {
        enabled: boolean;
        weekdayPeakPrice: number;
        weekendPeakPrice: number;
        peakStartTime: string;
        peakEndTime: string;
    };
    groupTiers: Array<{
        minSize: number;
        maxSize: number;
        discountPercent: number;
    }>;

    // Step 3: Game Details
    duration: number;
    difficulty: number;
    minAge: number;
    language: string[];
    successRate: number;
    activityDetails: string;
    additionalInformation: string;
    faqs: Array<{
        id: string;
        question: string;
        answer: string;
    }>;
    cancellationPolicies: Array<{
        id: string;
        title: string;
        description: string;
    }>;
    accessibility: {
        strollerAccessible: boolean;
        wheelchairAccessible: boolean;
    };
    location: string;

    // Step 4: Media & Widget
    coverImage: string;
    galleryImages: string[];
    videos: string[];
    selectedWidget: string;

    // Step 5: Schedule & Availability
    operatingDays: string[];
    startTime: string;
    endTime: string;
    slotInterval: number;
    advanceBooking: number;
    customHoursEnabled: boolean;
    customHours: {
        [key: string]: {
            enabled: boolean;
            startTime: string;
            endTime: string;
        };
    };
    customDates: Array<{
        id: string;
        date: string;
        startTime: string;
        endTime: string;
    }>;
    blockedDates: Array<string | { date: string; startTime: string; endTime: string; reason?: string }>;

    // Step 6: Payment Settings
    stripeProductId?: string;
    stripePriceId?: string;
    stripePrices?: any[];
    stripeCheckoutUrl?: string;
    stripeSyncStatus?: 'not_synced' | 'pending' | 'synced' | 'error';
    stripeLastSync?: string;
    checkoutEnabled?: boolean;
    checkoutConnectedAt?: string;

    // Step 7: Additional Settings
    requiresWaiver: boolean;
    selectedWaiver: {
        id: string;
        name: string;
        description: string;
    } | null;
    cancellationWindow: number;
    specialInstructions: string;
    slug?: string;

    // Allow for other dynamic fields
    [key: string]: any;
}

export interface StepProps {
    gameData: GameData;
    updateGameData: (field: keyof GameData, value: any) => void;
    t: any;
}
