import React, { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Switch } from '../ui/switch';
import { Calendar as CalendarComponent } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Upload, 
  X, 
  Image as ImageIcon, 
  Video, 
  Star,
  Users,
  Baby,
  DollarSign,
  Clock,
  Calendar,
  Info,
  Sparkles,
  Plus,
  MapPin,
  HelpCircle,
  FileText,
  Accessibility,
  FileSignature,
  CalendarDays,
  Trash2,
  Copy,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

interface EmbedContext {
  embedKey?: string;
  primaryColor?: string;
  venueName?: string;
  baseUrl?: string;
}

interface AddGameWizardProps {
  onComplete: (gameData: any) => void;
  onCancel: () => void;
  initialData?: GameData;
  mode?: 'create' | 'edit';
  theme?: string;
  embedContext?: EmbedContext;
}

interface GameData {
  // Step 1: Basic Info
  name: string;
  description: string;
  category: string;
  tagline: string;
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
  blockedDates: string[];
  
  // Step 6: Additional Settings
  requiresWaiver: boolean;
  selectedWaiver: {
    id: string;
    name: string;
    description: string;
  } | null;
  cancellationWindow: number;
  specialInstructions: string;
  slug?: string;
}

const STEPS = [
  { id: 1, name: 'Basic Info', icon: Info },
  { id: 2, name: 'Capacity & Pricing', icon: Users },
  { id: 3, name: 'Game Details', icon: Sparkles },
  { id: 4, name: 'Media Upload', icon: ImageIcon },
  { id: 5, name: 'Schedule', icon: Calendar },
  { id: 6, name: 'Widget & Embed', icon: CalendarDays },
  { id: 7, name: 'Review & Publish', icon: Check }
];

const CATEGORIES = [
  'Horror',
  'Mystery',
  'Adventure',
  'Sci-Fi',
  'Fantasy',
  'Historical',
  'Family-Friendly',
  'Challenge'
];

const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Mandarin', 'Japanese'];
const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Mock existing FAQs and Policies (in real app, these would come from API)
const EXISTING_FAQS = [
  { id: 'faq-1', question: 'What should I bring?', answer: 'Just bring yourself and your team! All materials are provided.' },
  { id: 'faq-2', question: 'Can I bring food and drinks?', answer: 'Outside food and drinks are not permitted, but we have a café on-site.' },
  { id: 'faq-3', question: 'Is photography allowed?', answer: 'Yes! Feel free to take photos before and after your game.' },
];

const EXISTING_POLICIES = [
  { id: 'policy-1', title: 'Standard Cancellation', description: 'Free cancellation up to 24 hours before the scheduled time. Cancellations within 24 hours are non-refundable.' },
  { id: 'policy-2', title: 'Flexible Cancellation', description: 'Free cancellation up to 2 hours before the scheduled time with a small fee.' },
  { id: 'policy-3', title: 'No Refund Policy', description: 'All bookings are final and non-refundable. Rescheduling allowed up to 48 hours in advance.' },
];

const EXISTING_WAIVERS = [
  { id: 'waiver-1', name: 'Standard Liability Waiver', description: 'General liability waiver for all activities' },
  { id: 'waiver-2', name: 'Minor Participant Waiver', description: 'Waiver for participants under 18 years old' },
  { id: 'waiver-3', name: 'Photo Release Waiver', description: 'Permission to use photos and videos for marketing' },
  { id: 'waiver-4', name: 'COVID-19 Health Waiver', description: 'Health screening and COVID-19 related acknowledgments' },
];

const generateSlug = (value: string | undefined) => {
  if (!value) return 'game';
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

export default function AddGameWizard({ onComplete, onCancel, initialData, mode = 'create', theme, embedContext }: AddGameWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [creationStatus, setCreationStatus] = useState({
    stage: '',
    message: '',
    progress: 0
  });
  const [createdGameId, setCreatedGameId] = useState<string | null>(null);
  const [gameData, setGameData] = useState<GameData>({
    name: '',
    description: '',
    category: '',
    tagline: '',
    eventType: 'public',
    gameType: 'physical',
    minAdults: 2,
    maxAdults: 8,
    minChildren: 0,
    maxChildren: 4,
    adultPrice: 30,
    childPrice: 20,
    duration: 60,
    difficulty: 3,
    minAge: 12,
    language: ['English'],
    successRate: 75,
    activityDetails: '',
    additionalInformation: '',
    faqs: [],
    cancellationPolicies: [],
    accessibility: { strollerAccessible: false, wheelchairAccessible: false },
    location: '',
    coverImage: '',
    galleryImages: [],
    videos: [],
    selectedWidget: 'calendar-single-event',
    operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    startTime: '10:00',
    endTime: '22:00',
    slotInterval: 60,
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
    customCapacityFields: [],
    groupDiscount: false,
    groupTiers: [],
    dynamicPricing: false,
    peakPricing: { enabled: false, weekdayPeakPrice: 0, weekendPeakPrice: 0, peakStartTime: '', peakEndTime: '' },
    customDates: [],
    blockedDates: [],
    requiresWaiver: true,
    selectedWaiver: null,
    cancellationWindow: 24,
    specialInstructions: '',
    slug: '',
    ...(initialData || {})
  });

  const convertGameToWizardData = (game: any) => ({
    name: game.name,
    description: game.description,
    category: game.category || 'escape-room',
    tagline: game.tagline,
    eventType: game.eventType || 'public',
    gameType: game.gameType || 'physical',
    minAdults: game.minAdults || 2,
    maxAdults: game.maxAdults || 8,
    minChildren: game.minChildren || 0,
    maxChildren: game.maxChildren || 4,
    adultPrice: game.price || 30,
    childPrice: game.childPrice || 25,
    duration: typeof game.duration === 'number' ? game.duration : parseInt(game.duration, 10) || 60,
    difficulty: typeof game.difficulty === 'number' ? game.difficulty : 3,
    minAge: parseInt(game.ageRange, 10) || 12,
    language: Array.isArray(game.language) ? game.language : ['English'],
    successRate: game.successRate || 75,
    activityDetails: game.activityDetails || '',
    additionalInformation: game.additionalInformation || '',
    faqs: Array.isArray(game.faqs) ? game.faqs : [],
    cancellationPolicies: Array.isArray(game.cancellationPolicies) ? game.cancellationPolicies : [],
    accessibility: game.accessibility || { strollerAccessible: false, wheelchairAccessible: false },
    location: game.location || '',
    coverImage: game.coverImage || game.imageUrl || game.image || '',
    galleryImages: Array.isArray(game.galleryImages) ? game.galleryImages : [],
    videos: Array.isArray(game.videos) ? game.videos : [],
    selectedWidget: game.selectedWidget || 'calendar-single-event',
    operatingDays: Array.isArray(game.operatingDays) ? game.operatingDays : ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
    startTime: game.startTime || '10:00',
    endTime: game.endTime || '22:00',
    slotInterval: game.slotInterval || 60,
    advanceBooking: game.advanceBooking || 30,
    customHoursEnabled: Boolean(game.customHoursEnabled),
    customHours: typeof game.customHours === 'object' && game.customHours ? game.customHours : {},
    customCapacityFields: Array.isArray(game.customCapacityFields) ? game.customCapacityFields : [],
    customDates: Array.isArray(game.customDates) ? game.customDates : [],
    blockedDates: Array.isArray(game.blockedDates) ? game.blockedDates : [],
    requiresWaiver: Boolean(game.requiresWaiver),
    selectedWaiver: game.selectedWaiver || null,
    cancellationWindow: game.cancellationWindow || 24,
    specialInstructions: game.specialInstructions || '',
    slug: game.slug || generateSlug(game.name),
  });

  const progress = (currentStep / STEPS.length) * 100;

  const updateGameData = (field: string, value: any) => {
    setGameData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    // Validation for each step
    if (currentStep === 1) {
      if (!gameData.name || !gameData.description || !gameData.category || !gameData.gameType || !gameData.eventType) {
        toast.error('Please fill in all required fields');
        return;
      }
    }
    if (currentStep === 2) {
      if (gameData.maxAdults < gameData.minAdults) {
        toast.error('Maximum adults must be greater than minimum');
        return;
      }
      if (gameData.adultPrice <= 0 || gameData.childPrice < 0) {
        toast.error('Please enter valid pricing');
        return;
      }
    }
    if (currentStep === 4) {
      if (!gameData.coverImage) {
        toast.error('Please add at least a cover image');
        return;
      }
    }

    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateGameData = () => {
    const errors: string[] = [];

    if (!gameData.name || gameData.name.trim() === '') errors.push('Game name is required');
    if (!gameData.description || gameData.description.trim() === '') errors.push('Description is required');
    if (!gameData.adultPrice || gameData.adultPrice <= 0) errors.push('Adult price must be greater than 0');
    if (!gameData.duration || gameData.duration <= 0) errors.push('Duration must be greater than 0');
    if (!gameData.minAdults || gameData.minAdults <= 0) errors.push('Minimum adults must be at least 1');
    if (!gameData.maxAdults || gameData.maxAdults < gameData.minAdults) errors.push('Maximum adults must be greater than or equal to minimum');
    if (gameData.operatingDays.length === 0) errors.push('At least one operating day must be selected');

    return { errors, isValid: errors.length === 0 };
  };

  const handleSubmit = async () => {
    // Validate before publishing
    const validation = validateGameData();
    if (!validation.isValid) {
      toast.error('Please fix validation errors before publishing');
      validation.errors.forEach(error => toast.error(error));
      return;
    }

    setIsPublishing(true);
    
    try {
      // Stage 1: Preparing data
      setCreationStatus({
        stage: 'preparing',
        message: 'Preparing game data...',
        progress: 20
      });
      await new Promise(resolve => setTimeout(resolve, 300));

      // Stage 2: Creating Stripe product
      setCreationStatus({
        stage: 'stripe',
        message: 'Creating Stripe product and pricing...',
        progress: 40
      });
      
      // Call onComplete which handles Supabase and Stripe creation
      const result = await onComplete(gameData);
      
      // Stage 3: Saving to database
      setCreationStatus({
        stage: 'database',
        message: 'Saving to database...',
        progress: 70
      });
      await new Promise(resolve => setTimeout(resolve, 300));

      // Stage 4: Verifying creation
      setCreationStatus({
        stage: 'verifying',
        message: 'Verifying game creation...',
        progress: 90
      });
      
      // Extract game ID from result if available
      const gameId = result?.id || result?.data?.id || null;
      setCreatedGameId(gameId);
      
      await new Promise(resolve => setTimeout(resolve, 300));

      // Stage 5: Complete
      setCreationStatus({
        stage: 'complete',
        message: 'Game created successfully!',
        progress: 100
      });
      
      // Show success screen
      setPublishSuccess(true);
      toast.success(mode === 'edit' ? 'Game updated successfully!' : 'Game published successfully!');
    } catch (error: any) {
      console.error('Error publishing game:', error);
      toast.error(error.message || 'Failed to publish game');
      setIsPublishing(false);
      setCreationStatus({
        stage: 'error',
        message: error.message || 'Failed to create game',
        progress: 0
      });
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1BasicInfo gameData={gameData} updateGameData={updateGameData} />;
      case 2:
        return <Step2CapacityPricing gameData={gameData} updateGameData={updateGameData} />;
      case 3:
        return <Step3GameDetails gameData={gameData} updateGameData={updateGameData} />;
      case 4:
        return <Step4MediaUpload gameData={gameData} updateGameData={updateGameData} />;
      case 5:
        return <Step5Schedule gameData={gameData} updateGameData={updateGameData} />;
      case 6:
        return <Step6WidgetEmbed gameData={gameData} updateGameData={updateGameData} theme={theme} embedContext={embedContext} />;
      case 7:
        return <Step7Review gameData={gameData} />;
      default:
        return null;
    }
  };

  // Creation Loading Screen
  if (isPublishing && !publishSuccess) {
    return (
      <div className="h-full flex items-center justify-center bg-white dark:bg-[#161616] p-6">
        <Card className="max-w-2xl w-full border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
            <h2 className="text-2xl text-gray-900 mb-3">
              {mode === 'edit' ? 'Updating Game...' : 'Creating Your Game...'}
            </h2>
            <p className="text-lg text-gray-700 mb-8">
              {creationStatus.message}
            </p>
            
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-blue-600 h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${creationStatus.progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">{creationStatus.progress}% Complete</p>
            </div>

            {/* Stage Indicators */}
            <div className="space-y-3 text-left max-w-md mx-auto">
              <div className={`flex items-center gap-3 p-3 rounded-lg ${
                creationStatus.stage === 'preparing' ? 'bg-blue-100' : 
                creationStatus.progress > 20 ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                {creationStatus.progress > 20 ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <div className="w-5 h-5 border-2 border-gray-400 rounded-full" />
                )}
                <span className="text-sm text-gray-900">Preparing game data</span>
              </div>
              
              <div className={`flex items-center gap-3 p-3 rounded-lg ${
                creationStatus.stage === 'stripe' ? 'bg-blue-100' : 
                creationStatus.progress > 40 ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                {creationStatus.progress > 40 ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <div className="w-5 h-5 border-2 border-gray-400 rounded-full" />
                )}
                <span className="text-sm text-gray-900">Creating Stripe product</span>
              </div>
              
              <div className={`flex items-center gap-3 p-3 rounded-lg ${
                creationStatus.stage === 'database' ? 'bg-blue-100' : 
                creationStatus.progress > 70 ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                {creationStatus.progress > 70 ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <div className="w-5 h-5 border-2 border-gray-400 rounded-full" />
                )}
                <span className="text-sm text-gray-900">Saving to database</span>
              </div>
              
              <div className={`flex items-center gap-3 p-3 rounded-lg ${
                creationStatus.stage === 'verifying' ? 'bg-blue-100' : 
                creationStatus.progress > 90 ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                {creationStatus.progress > 90 ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <div className="w-5 h-5 border-2 border-gray-400 rounded-full" />
                )}
                <span className="text-sm text-gray-900">Verifying creation</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success Screen
  if (publishSuccess) {
    return (
      <div className="h-full flex items-center justify-center bg-white dark:bg-[#161616] p-6">
        <Card className="max-w-2xl w-full border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl text-gray-900 mb-3">
              {mode === 'edit' ? 'Game Updated!' : 'Game Published!'}
            </h2>
            <p className="text-lg text-gray-700 mb-8">
              {mode === 'edit' 
                ? 'Your game has been successfully updated and is now live.'
                : 'Your game has been successfully published and is now available for booking!'}
            </p>
            
            <div className="bg-white rounded-lg p-6 mb-8 border border-green-200">
              <div className="grid grid-cols-2 gap-6 text-left">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Game Name</p>
                  <p className="text-gray-900">{gameData.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Price</p>
                  <p className="text-gray-900">${gameData.adultPrice} per person</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Duration</p>
                  <p className="text-gray-900">{gameData.duration} minutes</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Widget</p>
                  <p className="text-gray-900">{gameData.selectedWidget}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-sm text-green-700 mb-4">
                <Check className="w-4 h-4" />
                <span>Supabase database updated</span>
                <span className="mx-2">•</span>
                <Check className="w-4 h-4" />
                <span>Stripe product created</span>
                <span className="mx-2">•</span>
                <Check className="w-4 h-4" />
                <span>Embed code generated</span>
              </div>
              
              <Button 
                onClick={onCancel} 
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Check className="w-5 h-5 mr-2" />
                Done
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#161616]">
      {/* Header with Progress */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-[#2a2a2a]">
        <div className="mb-4">
          <h2 className="text-2xl text-gray-900 dark:text-white">{mode === 'edit' ? 'Edit Game' : 'Add New Game'}</h2>
          <p className="text-sm text-gray-600 dark:text-[#a3a3a3] mt-1">
            Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].name}
          </p>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Indicators */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#0a0a0a]">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {STEPS.map((step, index) => {
            const StepIcon = step.icon;
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            
            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-green-600 dark:bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-blue-600 dark:bg-[#4f46e5] text-white'
                        : 'bg-gray-200 dark:bg-[#2a2a2a] text-gray-500 dark:text-[#737373]'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <StepIcon className="w-5 h-5" />
                    )}
                  </div>
                  <span
                    className={`text-xs mt-2 hidden md:block ${
                      isCurrent ? 'text-blue-600 dark:text-[#6366f1]' : 'text-gray-500 dark:text-[#737373]'
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      isCompleted ? 'bg-green-600 dark:bg-emerald-600' : 'bg-gray-200 dark:bg-[#2a2a2a]'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-3xl mx-auto">
          {renderStepContent()}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1e1e1e]">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          {currentStep < STEPS.length ? (
            <Button onClick={handleNext} className="bg-blue-600 dark:bg-[#4f46e5] hover:bg-blue-700 dark:hover:bg-[#4338ca]">
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              disabled={isPublishing || !validateGameData().isValid}
              className="bg-green-600 dark:bg-emerald-600 hover:bg-green-700 dark:hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPublishing ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  {mode === 'edit' ? 'Update Game' : 'Publish Game'}
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Step 1: Basic Information
function Step1BasicInfo({ gameData, updateGameData }: any) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Enter the essential details about your escape room game
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">
              Game Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Zombie Apocalypse"
              value={gameData.name}
              onChange={(e) => updateGameData('name', e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="tagline">Tagline</Label>
            <Input
              id="tagline"
              placeholder="A short catchy phrase about your game"
              value={gameData.tagline}
              onChange={(e) => updateGameData('tagline', e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="category">
              Category <span className="text-red-500">*</span>
            </Label>
            <Select value={gameData.category} onValueChange={(value) => updateGameData('category', value)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="gameType">
              Game Type <span className="text-red-500">*</span>
            </Label>
            <Select value={gameData.gameType} onValueChange={(value) => updateGameData('gameType', value)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select game type">
                  {gameData.gameType === 'physical'
                    ? 'Physical'
                    : gameData.gameType === 'virtual'
                    ? 'Virtual'
                    : gameData.gameType === 'hybrid'
                    ? 'Hybrid'
                    : null}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="physical">
                  <div className="flex flex-col">
                    <span>Physical</span>
                    <span className="text-xs text-gray-500">On-site, in-person experience</span>
                  </div>
                </SelectItem>
                <SelectItem value="virtual">
                  <div className="flex flex-col">
                    <span>Virtual</span>
                    <span className="text-xs text-gray-500">Online or remote experience</span>
                  </div>
                </SelectItem>
                <SelectItem value="hybrid">
                  <div className="flex flex-col">
                    <span>Hybrid</span>
                    <span className="text-xs text-gray-500">Mix of in-person and online</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="eventType">
              Event Type <span className="text-red-500">*</span>
            </Label>
            <Select value={gameData.eventType} onValueChange={(value) => updateGameData('eventType', value)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select event type">
                  {gameData.eventType === 'public' ? 'Public Event' : gameData.eventType === 'private' ? 'Private Event' : null}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">
                  <div className="flex flex-col">
                    <span>Public Event</span>
                    <span className="text-xs text-gray-500">Open to individual bookings and walk-ins</span>
                  </div>
                </SelectItem>
                <SelectItem value="private">
                  <div className="flex flex-col">
                    <span>Private Event</span>
                    <span className="text-xs text-gray-500">Exclusive bookings for groups only</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the storyline, atmosphere, and what makes this game unique..."
              rows={6}
              value={gameData.description}
              onChange={(e) => updateGameData('description', e.target.value)}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              {gameData.description.length} / 500 characters
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Step 2: Capacity & Pricing
function Step2CapacityPricing({ gameData, updateGameData }: any) {
  const addCustomField = () => {
    const newField = {
      id: `custom-${Date.now()}`,
      name: '',
      min: 0,
      max: 0,
      price: 0
    };
    updateGameData('customCapacityFields', [...gameData.customCapacityFields, newField]);
  };

  const removeCustomField = (id: string) => {
    updateGameData('customCapacityFields', gameData.customCapacityFields.filter((field: any) => field.id !== id));
  };

  const updateCustomField = (id: string, field: string, value: any) => {
    const updatedFields = gameData.customCapacityFields.map((customField: any) => 
      customField.id === id ? { ...customField, [field]: value } : customField
    );
    updateGameData('customCapacityFields', updatedFields);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Player Capacity
          </CardTitle>
          <CardDescription>
            Set the minimum and maximum number of players for this game
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minAdults" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Minimum Adults <span className="text-red-500">*</span>
              </Label>
              <Input
                id="minAdults"
                type="number"
                min="1"
                value={gameData.minAdults}
                onChange={(e) => updateGameData('minAdults', parseInt(e.target.value))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="maxAdults">
                Maximum Adults <span className="text-red-500">*</span>
              </Label>
              <Input
                id="maxAdults"
                type="number"
                min="1"
                value={gameData.maxAdults}
                onChange={(e) => updateGameData('maxAdults', parseInt(e.target.value))}
                className="mt-1"
              />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minChildren" className="flex items-center gap-2">
                <Baby className="w-4 h-4" />
                Minimum Children
              </Label>
              <Input
                id="minChildren"
                type="number"
                min="0"
                value={gameData.minChildren}
                onChange={(e) => updateGameData('minChildren', parseInt(e.target.value))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="maxChildren">Maximum Children</Label>
              <Input
                id="maxChildren"
                type="number"
                min="0"
                value={gameData.maxChildren}
                onChange={(e) => updateGameData('maxChildren', parseInt(e.target.value))}
                className="mt-1"
              />
            </div>
          </div>

          <Separator />

          {/* Custom Capacity Fields */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <Label className="text-gray-900">Custom Capacity Types</Label>
                <p className="text-sm text-gray-500">Add custom player categories (e.g., Teens, Seniors, Students)</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={addCustomField}
                className="text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Custom Field
              </Button>
            </div>

            {(gameData.customCapacityFields?.length ?? 0) > 0 && (
              <div className="space-y-3">
                {gameData.customCapacityFields.map((field: any) => (
                  <div key={field.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div>
                        <Label className="text-xs">Field Name</Label>
                        <Input
                          placeholder="e.g., Teens"
                          value={field.name}
                          onChange={(e) => updateCustomField(field.id, 'name', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Minimum</Label>
                        <Input
                          type="number"
                          min="0"
                          value={field.min}
                          onChange={(e) => updateCustomField(field.id, 'min', parseInt(e.target.value))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Maximum</Label>
                        <Input
                          type="number"
                          min="0"
                          value={field.max}
                          onChange={(e) => updateCustomField(field.id, 'max', parseInt(e.target.value))}
                          className="mt-1"
                        />
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Label className="text-xs">Price per Person</Label>
                          <div className="relative mt-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={field.price}
                              onChange={(e) => updateCustomField(field.id, 'price', parseFloat(e.target.value))}
                              className="pl-7"
                            />
                          </div>
                        </div>
                        <div className="self-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCustomField(field.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              💡 <strong>Capacity Summary:</strong> This game can accommodate{' '}
              {gameData.minAdults}-{gameData.maxAdults} adults
              {gameData.maxChildren > 0 && `, up to ${gameData.maxChildren} children`}
              {(gameData.customCapacityFields?.length ?? 0) > 0 && (
                <>
                  , and{' '}
                  {gameData.customCapacityFields.map((field: any, index: number) => (
                    <span key={field.id}>
                      {index > 0 && ', '}
                      {field.name || 'custom'} ({field.min}-{field.max})
                    </span>
                  ))}
                </>
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Pricing
          </CardTitle>
          <CardDescription>Set ticket prices for adults and children</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="adultPrice">
                Adult Price (per person) <span className="text-red-500">*</span>
              </Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <Input
                  id="adultPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={gameData.adultPrice}
                  onChange={(e) => updateGameData('adultPrice', parseFloat(e.target.value))}
                  className="pl-7"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="childPrice">Child Price (per person)</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <Input
                  id="childPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={gameData.childPrice}
                  onChange={(e) => updateGameData('childPrice', parseFloat(e.target.value))}
                  className="pl-7"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <Label>Enable Group Discounts</Label>
              <p className="text-sm text-gray-500">Offer discounts for larger groups</p>
            </div>
            <Button
              variant={gameData.groupDiscount ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateGameData('groupDiscount', !gameData.groupDiscount)}
            >
              {gameData.groupDiscount ? 'Enabled' : 'Disabled'}
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between p-4 border-2 border-blue-200 bg-blue-50 rounded-lg">
            <div>
              <Label className="text-blue-900">Enable Dynamic Pricing</Label>
              <p className="text-sm text-blue-700">Set different prices based on time and demand</p>
            </div>
            <Button
              variant={gameData.dynamicPricing ? 'default' : 'outline'}
              size="sm"
              className={gameData.dynamicPricing ? 'bg-blue-600 hover:bg-blue-700' : ''}
              onClick={() => updateGameData('dynamicPricing', !gameData.dynamicPricing)}
            >
              {gameData.dynamicPricing ? 'Enabled' : 'Disabled'}
            </Button>
          </div>

          {gameData.dynamicPricing && (
            <DynamicPricingSection gameData={gameData} updateGameData={updateGameData} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Dynamic Pricing Section
function DynamicPricingSection({ gameData, updateGameData }: any) {
  const addGroupTier = () => {
    const newTier = {
      minSize: gameData.groupTiers.length > 0 ? gameData.groupTiers[gameData.groupTiers.length - 1].maxSize + 1 : 5,
      maxSize: gameData.groupTiers.length > 0 ? gameData.groupTiers[gameData.groupTiers.length - 1].maxSize + 3 : 8,
      discountPercent: 10
    };
    updateGameData('groupTiers', [...gameData.groupTiers, newTier]);
  };

  const removeGroupTier = (index: number) => {
    updateGameData('groupTiers', gameData.groupTiers.filter((_: any, i: number) => i !== index));
  };

  const updateGroupTier = (index: number, field: string, value: any) => {
    const updatedTiers = [...gameData.groupTiers];
    updatedTiers[index] = { ...updatedTiers[index], [field]: value };
    updateGameData('groupTiers', updatedTiers);
  };

  const updatePeakPricing = (field: string, value: any) => {
    updateGameData('peakPricing', { ...gameData.peakPricing, [field]: value });
  };

  return (
    <div className="space-y-4 mt-4 p-4 border-2 border-blue-100 rounded-lg bg-blue-50/50">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-5 h-5 text-blue-600" />
        <h4 className="text-blue-900">Dynamic Pricing Settings</h4>
      </div>

      {/* Peak Pricing */}
      <div className="bg-white rounded-lg p-4 border border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Label className="text-gray-900">Peak Hour Pricing</Label>
            <p className="text-sm text-gray-500">Charge more during high-demand hours</p>
          </div>
          <Button
            variant={gameData.peakPricing?.enabled ? 'default' : 'outline'}
            size="sm"
            onClick={() => updatePeakPricing('enabled', !gameData.peakPricing?.enabled)}
          >
            {gameData.peakPricing?.enabled ? 'Enabled' : 'Disabled'}
          </Button>
        </div>

        {gameData.peakPricing?.enabled && (
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weekdayPeakPrice" className="text-sm">Weekday Peak Price</Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="weekdayPeakPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={gameData.peakPricing?.weekdayPeakPrice ?? 35}
                    onChange={(e) => updatePeakPricing('weekdayPeakPrice', parseFloat(e.target.value))}
                    className="pl-7"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="weekendPeakPrice" className="text-sm">Weekend Peak Price</Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="weekendPeakPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={gameData.peakPricing.weekendPeakPrice}
                    onChange={(e) => updatePeakPricing('weekendPeakPrice', parseFloat(e.target.value))}
                    className="pl-7"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="peakStartTime" className="text-sm">Peak Start Time</Label>
                <Input
                  id="peakStartTime"
                  type="time"
                  value={gameData.peakPricing.peakStartTime}
                  onChange={(e) => updatePeakPricing('peakStartTime', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="peakEndTime" className="text-sm">Peak End Time</Label>
                <Input
                  id="peakEndTime"
                  type="time"
                  value={gameData.peakPricing.peakEndTime}
                  onChange={(e) => updatePeakPricing('peakEndTime', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-900">
                💡 Peak pricing applies from {gameData.peakPricing.peakStartTime} to {gameData.peakPricing.peakEndTime}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Group Size Tiers */}
      <div className="bg-white rounded-lg p-4 border border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Label className="text-gray-900">Group Size Discounts</Label>
            <p className="text-sm text-gray-500">Offer discounts based on group size</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={addGroupTier}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Tier
          </Button>
        </div>

        {(gameData.groupTiers?.length ?? 0) > 0 && (
          <div className="space-y-3">
            {gameData.groupTiers.map((tier: any, index: number) => (
              <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                <div className="flex-1 grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs">Min Size</Label>
                    <Input
                      type="number"
                      min="1"
                      value={tier.minSize}
                      onChange={(e) => updateGroupTier(index, 'minSize', parseInt(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Max Size</Label>
                    <Input
                      type="number"
                      min="1"
                      value={tier.maxSize}
                      onChange={(e) => updateGroupTier(index, 'maxSize', parseInt(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Discount %</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={tier.discountPercent}
                      onChange={(e) => updateGroupTier(index, 'discountPercent', parseInt(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeGroupTier(index)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {gameData.groupTiers.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">
            No group tiers configured. Click "Add Tier" to create pricing tiers.
          </p>
        )}
      </div>
    </div>
  );
}

// Step 3: Game Details
function Step3GameDetails({ gameData, updateGameData }: any) {
  const handleLanguageToggle = (lang: string) => {
    const languages = gameData.language.includes(lang)
      ? gameData.language.filter((l: string) => l !== lang)
      : [...gameData.language, lang];
    updateGameData('language', languages);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Game Details</CardTitle>
          <CardDescription>Configure game duration, difficulty, and requirements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Duration (minutes) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="duration"
                type="number"
                min="30"
                step="15"
                value={gameData.duration}
                onChange={(e) => updateGameData('duration', parseInt(e.target.value))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="minAge">Minimum Age <span className="text-red-500">*</span></Label>
              <Input
                id="minAge"
                type="number"
                min="0"
                value={gameData.minAge}
                onChange={(e) => updateGameData('minAge', parseInt(e.target.value))}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4" />
              Difficulty Level
            </Label>
            <div className="flex items-center gap-4">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  onClick={() => updateGameData('difficulty', level)}
                  className="flex flex-col items-center gap-1 p-3 border-2 rounded-lg transition-all hover:border-blue-400"
                  style={{
                    borderColor: gameData.difficulty === level ? '#2563eb' : '#e5e7eb',
                    backgroundColor: gameData.difficulty === level ? '#eff6ff' : 'white'
                  }}
                >
                  <div className="flex gap-0.5">
                    {Array.from({ length: level }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-xs text-gray-600">
                    {level === 1 && 'Beginner'}
                    {level === 2 && 'Easy'}
                    {level === 3 && 'Medium'}
                    {level === 4 && 'Hard'}
                    {level === 5 && 'Expert'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <Label className="mb-3">Available Languages</Label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => (
                <Badge
                  key={lang}
                  variant={gameData.language.includes(lang) ? 'default' : 'outline'}
                  className="cursor-pointer px-4 py-2"
                  onClick={() => handleLanguageToggle(lang)}
                >
                  {lang}
                  {gameData.language.includes(lang) && <Check className="w-3 h-3 ml-1" />}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="successRate">Success Rate (%)</Label>
            <div className="flex items-center gap-4 mt-2">
              <Input
                id="successRate"
                type="range"
                min="0"
                max="100"
                value={gameData.successRate}
                onChange={(e) => updateGameData('successRate', parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-lg text-gray-900 min-w-[60px]">{gameData.successRate}%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Historical success rate helps set player expectations
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Activity Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Activity Details
          </CardTitle>
          <CardDescription>Provide detailed information about the activity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="activityDetails">Activity Details</Label>
            <Textarea
              id="activityDetails"
              placeholder="Describe what participants will do during this activity..."
              rows={4}
              value={gameData.activityDetails}
              onChange={(e) => updateGameData('activityDetails', e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="additionalInformation">Additional Information</Label>
            <Textarea
              id="additionalInformation"
              placeholder="Any other important information participants should know..."
              rows={4}
              value={gameData.additionalInformation}
              onChange={(e) => updateGameData('additionalInformation', e.target.value)}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* FAQs */}
      <FAQSection gameData={gameData} updateGameData={updateGameData} />

      {/* Cancellation Policies */}
      <CancellationPolicySection gameData={gameData} updateGameData={updateGameData} />

      {/* Accessibility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Accessibility className="w-5 h-5" />
            Accessibility
          </CardTitle>
          <CardDescription>Specify accessibility features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="strollerAccessible">Stroller Accessible</Label>
              <p className="text-sm text-gray-500">Is the venue accessible for strollers?</p>
            </div>
            <Switch
              id="strollerAccessible"
              checked={gameData.accessibility?.strollerAccessible ?? false}
              onCheckedChange={(checked) => 
                updateGameData('accessibility', { ...gameData.accessibility, strollerAccessible: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="wheelchairAccessible">Wheelchair Accessible</Label>
              <p className="text-sm text-gray-500">Is the venue wheelchair accessible?</p>
            </div>
            <Switch
              id="wheelchairAccessible"
              checked={gameData.accessibility?.wheelchairAccessible ?? false}
              onCheckedChange={(checked) => 
                updateGameData('accessibility', { ...gameData.accessibility, wheelchairAccessible: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Location
          </CardTitle>
          <CardDescription>Specify where this activity takes place</CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="location">Address</Label>
            <Input
              id="location"
              placeholder="Enter location address..."
              value={gameData.location}
              onChange={(e) => updateGameData('location', e.target.value)}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              This is pre-filled from your account settings. You can change it if needed.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Waiver Selection */}
      <WaiverSection gameData={gameData} updateGameData={updateGameData} />
    </div>
  );
}

// FAQ Section Component
function FAQSection({ gameData, updateGameData }: any) {
  const [showAddNew, setShowAddNew] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');

  const addFAQ = () => {
    if (!newQuestion.trim() || !newAnswer.trim()) {
      toast.error('Please fill in both question and answer');
      return;
    }
    const newFAQ = {
      id: `faq-custom-${Date.now()}`,
      question: newQuestion,
      answer: newAnswer,
    };
    updateGameData('faqs', [...gameData.faqs, newFAQ]);
    setNewQuestion('');
    setNewAnswer('');
    setShowAddNew(false);
    toast.success('FAQ added');
  };

  const addExistingFAQ = (faq: any) => {
    if (gameData.faqs.find((f: any) => f.id === faq.id)) {
      toast.error('This FAQ is already added');
      return;
    }
    updateGameData('faqs', [...gameData.faqs, faq]);
    toast.success('FAQ added');
  };

  const removeFAQ = (id: string) => {
    updateGameData('faqs', gameData.faqs.filter((f: any) => f.id !== id));
    toast.success('FAQ removed');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5" />
          Frequently Asked Questions
        </CardTitle>
        <CardDescription>Add FAQs to help customers understand your activity</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selected FAQs */}
        {gameData.faqs.length > 0 && (
          <div className="space-y-2">
            <Label>Selected FAQs ({gameData.faqs.length})</Label>
            {gameData.faqs.map((faq: any) => (
              <div key={faq.id} className="p-3 border rounded-lg bg-gray-50">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{faq.question}</p>
                    <p className="text-xs text-gray-600 mt-1">{faq.answer}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFAQ(faq.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Separator />

        {/* Add from existing */}
        <div>
          <Label>Add from existing FAQs</Label>
          <div className="grid gap-2 mt-2">
            {EXISTING_FAQS.map((faq) => (
              <div
                key={faq.id}
                className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => addExistingFAQ(faq)}
              >
                <p className="text-sm text-gray-900">{faq.question}</p>
                <p className="text-xs text-gray-600 mt-1">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Add new FAQ */}
        {!showAddNew ? (
          <Button
            variant="outline"
            onClick={() => setShowAddNew(true)}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New FAQ
          </Button>
        ) : (
          <div className="space-y-3 p-4 border-2 border-blue-200 rounded-lg bg-blue-50/50">
            <div>
              <Label htmlFor="newQuestion">Question</Label>
              <Input
                id="newQuestion"
                placeholder="e.g., What is the minimum age?"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="newAnswer">Answer</Label>
              <Textarea
                id="newAnswer"
                placeholder="Enter the answer..."
                rows={3}
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={addFAQ} size="sm">
                <Check className="w-4 h-4 mr-2" />
                Add FAQ
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowAddNew(false);
                  setNewQuestion('');
                  setNewAnswer('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Cancellation Policy Section Component
function CancellationPolicySection({ gameData, updateGameData }: any) {
  const [showAddNew, setShowAddNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const addPolicy = () => {
    if (!newTitle.trim() || !newDescription.trim()) {
      toast.error('Please fill in both title and description');
      return;
    }
    const newPolicy = {
      id: `policy-custom-${Date.now()}`,
      title: newTitle,
      description: newDescription,
    };
    updateGameData('cancellationPolicies', [...gameData.cancellationPolicies, newPolicy]);
    setNewTitle('');
    setNewDescription('');
    setShowAddNew(false);
    toast.success('Policy added');
  };

  const addExistingPolicy = (policy: any) => {
    if (gameData.cancellationPolicies.find((p: any) => p.id === policy.id)) {
      toast.error('This policy is already added');
      return;
    }
    updateGameData('cancellationPolicies', [...gameData.cancellationPolicies, policy]);
    toast.success('Policy added');
  };

  const removePolicy = (id: string) => {
    updateGameData('cancellationPolicies', gameData.cancellationPolicies.filter((p: any) => p.id !== id));
    toast.success('Policy removed');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Cancellation Policy
        </CardTitle>
        <CardDescription>Define cancellation and refund policies</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selected Policies */}
        {gameData.cancellationPolicies.length > 0 && (
          <div className="space-y-2">
            <Label>Selected Policies ({gameData.cancellationPolicies.length})</Label>
            {gameData.cancellationPolicies.map((policy: any) => (
              <div key={policy.id} className="p-3 border rounded-lg bg-gray-50">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-gray-900">{policy.title}</p>
                    <p className="text-xs text-gray-600 mt-1">{policy.description}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removePolicy(policy.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Separator />

        {/* Add from existing */}
        <div>
          <Label>Add from existing policies</Label>
          <div className="grid gap-2 mt-2">
            {EXISTING_POLICIES.map((policy) => (
              <div
                key={policy.id}
                className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => addExistingPolicy(policy)}
              >
                <p className="text-gray-900">{policy.title}</p>
                <p className="text-xs text-gray-600 mt-1">{policy.description}</p>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Add new Policy */}
        {!showAddNew ? (
          <Button
            variant="outline"
            onClick={() => setShowAddNew(true)}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Policy
          </Button>
        ) : (
          <div className="space-y-3 p-4 border-2 border-blue-200 rounded-lg bg-blue-50/50">
            <div>
              <Label htmlFor="newPolicyTitle">Policy Title</Label>
              <Input
                id="newPolicyTitle"
                placeholder="e.g., Flexible Cancellation"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="newPolicyDescription">Policy Description</Label>
              <Textarea
                id="newPolicyDescription"
                placeholder="Describe the cancellation terms..."
                rows={3}
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={addPolicy} size="sm">
                <Check className="w-4 h-4 mr-2" />
                Add Policy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowAddNew(false);
                  setNewTitle('');
                  setNewDescription('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Waiver Section Component
function WaiverSection({ gameData, updateGameData }: any) {
  const selectWaiver = (waiver: any) => {
    updateGameData('selectedWaiver', waiver);
    updateGameData('requiresWaiver', true);
    toast.success(`${waiver.name} selected`);
  };

  const removeWaiver = () => {
    updateGameData('selectedWaiver', null);
    updateGameData('requiresWaiver', false);
    toast.success('Waiver removed');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSignature className="w-5 h-5" />
          Waiver Requirement
        </CardTitle>
        <CardDescription>Select a waiver that participants must sign</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selected Waiver */}
        {gameData.selectedWaiver ? (
          <div className="space-y-2">
            <Label>Selected Waiver</Label>
            <div className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <FileSignature className="w-4 h-4 text-blue-600" />
                    <p className="text-gray-900">{gameData.selectedWaiver.name}</p>
                  </div>
                  <p className="text-sm text-gray-600">{gameData.selectedWaiver.description}</p>
                  <Badge className="mt-2 bg-green-100 text-green-800 border-green-300">
                    <Check className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeWaiver}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 text-center">
            <FileSignature className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No waiver selected</p>
            <p className="text-xs text-gray-500 mt-1">Choose a waiver from below</p>
          </div>
        )}

        <Separator />

        {/* Select from existing waivers */}
        <div>
          <Label>Select from existing waivers</Label>
          <p className="text-xs text-gray-500 mb-3">Click on a waiver to assign it to this game</p>
          <div className="grid gap-2">
            {EXISTING_WAIVERS.map((waiver) => {
              const isSelected = gameData.selectedWaiver?.id === waiver.id;
              return (
                <div
                  key={waiver.id}
                  className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                  onClick={() => selectWaiver(waiver)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-gray-900">{waiver.name}</p>
                      <p className="text-xs text-gray-600 mt-1">{waiver.description}</p>
                    </div>
                    {isSelected && (
                      <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Info className="w-3 h-3" />
            Need a different waiver? Create one in the{' '}
            <a href="#" className="text-blue-600 hover:underline">Waivers</a> section first.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Step 4: Media Upload
function Step4MediaUpload({ gameData, updateGameData }: any) {
  const [uploadType, setUploadType] = useState<'image' | 'video'>('image');
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [videoUrlInput, setVideoUrlInput] = useState('');

  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  };

  const resizeImageDataUrl = async (dataUrl: string, maxWidth = 1280, quality = 0.85): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas context not available'));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const optimized = canvas.toDataURL('image/jpeg', quality);
        resolve(optimized);
      };
      img.onerror = (e) => reject(e);
      img.src = dataUrl;
    });
  };

  const handleCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }
    try {
      const raw = await readFileAsDataUrl(file);
      const optimized = await resizeImageDataUrl(raw);
      updateGameData('coverImage', optimized);
      toast.success('Cover image uploaded');
    } catch (err) {
      console.error(err);
      toast.error('Failed to process image');
    } finally {
      if (coverInputRef.current) coverInputRef.current.value = '';
    }
  };

  const handleGalleryFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    try {
      const results: string[] = [];
      for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        const raw = await readFileAsDataUrl(file);
        const optimized = await resizeImageDataUrl(raw);
        results.push(optimized);
      }
      if (results.length) {
        updateGameData('galleryImages', [...gameData.galleryImages, ...results]);
        toast.success(`${results.length} image(s) added to gallery`);
      } else {
        toast.error('No valid images selected');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to process gallery images');
    } finally {
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      toast.error('Please select a valid video file');
      return;
    }
    // Guard against very large files for localStorage
    const MAX_SIZE_MB = 8; // conservative limit
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`Video too large (> ${MAX_SIZE_MB}MB). Please use a URL instead.`);
      if (videoInputRef.current) videoInputRef.current.value = '';
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      updateGameData('videos', [...gameData.videos, dataUrl]);
      toast.success('Video uploaded');
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload video');
    } finally {
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  const addVideoByUrl = () => {
    const url = videoUrlInput.trim();
    if (!url) {
      toast.error('Please enter a video URL');
      return;
    }
    updateGameData('videos', [...gameData.videos, url]);
    setVideoUrlInput('');
    toast.success('Video URL added');
  };

  const removeGalleryImage = (index: number) => {
    updateGameData('galleryImages', gameData.galleryImages.filter((_: any, i: number) => i !== index));
  };

  const removeVideo = (index: number) => {
    updateGameData('videos', gameData.videos.filter((_: any, i: number) => i !== index));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Cover Image
          </CardTitle>
          <CardDescription>
            Upload a high-quality cover image (required) <span className="text-red-500">*</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {gameData.coverImage ? (
            <div className="relative group">
              <img
                src={gameData.coverImage}
                alt="Cover"
                className="w-full h-64 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-lg flex items-center justify-center">
                <Button
                  variant="destructive"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => updateGameData('coverImage', '')}
                >
                  <X className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => coverInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Click to upload cover image</p>
              <p className="text-sm text-gray-500">Recommended: 1280px+ width, ~2–3MB</p>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverFileChange}
                className="hidden"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Gallery Images
          </CardTitle>
          <CardDescription>Add more images showcasing your game (optional)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            {gameData.galleryImages.map((img: string, index: number) => (
              <div key={index} className="relative group">
                <img
                  src={img}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  onClick={() => removeGalleryImage(index)}
                  className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <div
              onClick={() => galleryInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg h-32 flex items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
            >
              <div className="text-center">
                <Plus className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                <p className="text-xs text-gray-500">Add Image</p>
              </div>
              <input
                ref={galleryInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleGalleryFilesChange}
                className="hidden"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            Videos
          </CardTitle>
          <CardDescription>Add promotional or gameplay videos (optional)</CardDescription>
        </CardHeader>
        <CardContent>
          {gameData.videos.length > 0 ? (
            <div className="space-y-3 mb-4">
              {gameData.videos.map((video: string, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Video className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-gray-700 truncate max-w-[220px]">Video {index + 1}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVideo(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : null}
          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={() => videoInputRef.current?.click()}
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Video (≤8MB)
            </Button>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoFileChange}
              className="hidden"
            />
            <div className="flex items-center gap-2">
              <input
                value={videoUrlInput}
                onChange={(e) => setVideoUrlInput(e.target.value)}
                placeholder="Paste video URL (YouTube, Vimeo, etc.)"
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
              <Button variant="secondary" onClick={addVideoByUrl}>Add URL</Button>
            </div>
            <p className="text-xs text-gray-500">Supports MP4, MOV, AVI uploads (small files). Prefer URLs for large videos.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Step 5: Schedule & Availability
function Step5Schedule({ gameData, updateGameData }: any) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [customDateTime, setCustomDateTime] = useState({ startTime: '10:00', endTime: '22:00' });
  const [blockedDate, setBlockedDate] = useState<Date | undefined>(undefined);
  const [blockedTimeRange, setBlockedTimeRange] = useState({ startTime: '', endTime: '', blockFullDay: true });

  const toggleDay = (day: string) => {
    const days = gameData.operatingDays.includes(day)
      ? gameData.operatingDays.filter((d: string) => d !== day)
      : [...gameData.operatingDays, day];
    updateGameData('operatingDays', days);

    // Toggle the day in customHours as well
    if (!gameData.operatingDays.includes(day)) {
      updateGameData('customHours', {
        ...gameData.customHours,
        [day]: { ...gameData.customHours[day], enabled: true }
      });
    } else {
      updateGameData('customHours', {
        ...gameData.customHours,
        [day]: { ...gameData.customHours[day], enabled: false }
      });
    }
  };

  const updateCustomHours = (day: string, field: 'startTime' | 'endTime', value: string) => {
    updateGameData('customHours', {
      ...gameData.customHours,
      [day]: { ...gameData.customHours[day], [field]: value }
    });
  };

  const addCustomDate = () => {
    if (!selectedDate) {
      toast.error('Please select a date');
      return;
    }

    const dateStr = selectedDate.toISOString().split('T')[0];
    
    // Check if date already exists
    if (gameData.customDates.some((d: any) => d.date === dateStr)) {
      toast.error('This date is already added');
      return;
    }

    const newCustomDate = {
      id: `custom-${Date.now()}`,
      date: dateStr,
      startTime: customDateTime.startTime,
      endTime: customDateTime.endTime
    };

    updateGameData('customDates', [...gameData.customDates, newCustomDate]);
    setSelectedDate(undefined);
    toast.success('Custom date added');
  };

  const removeCustomDate = (id: string) => {
    updateGameData('customDates', gameData.customDates.filter((d: any) => d.id !== id));
    toast.success('Custom date removed');
  };

  const addBlockedDate = () => {
    if (!blockedDate) {
      toast.error('Please select a date to block');
      return;
    }

    const dateStr = blockedDate.toISOString().split('T')[0];
    
    // Check if this exact date+time combination already exists
    const existingBlock = gameData.blockedDates.find((d: any) => {
      if (typeof d === 'string') return d === dateStr;
      return d.date === dateStr && 
             d.startTime === blockedTimeRange.startTime && 
             d.endTime === blockedTimeRange.endTime;
    });

    if (existingBlock) {
      toast.error('This date/time is already blocked');
      return;
    }

    // Create blocked date object with optional time range
    const blockedEntry = blockedTimeRange.blockFullDay 
      ? dateStr // Simple string for full day block
      : {
          date: dateStr,
          startTime: blockedTimeRange.startTime,
          endTime: blockedTimeRange.endTime,
          reason: 'Time block' // Optional reason field
        };

    updateGameData('blockedDates', [...gameData.blockedDates, blockedEntry]);
    setBlockedDate(undefined);
    setBlockedTimeRange({ startTime: '', endTime: '', blockFullDay: true });
    toast.success(blockedTimeRange.blockFullDay ? 'Date blocked' : 'Time block added');
  };

  const removeBlockedDate = (index: number) => {
    updateGameData('blockedDates', gameData.blockedDates.filter((_: any, i: number) => i !== index));
    toast.success('Block removed');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Operating Days
          </CardTitle>
          <CardDescription>Select the days when this game is available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {DAYS_OF_WEEK.map((day) => (
              <button
                key={day}
                onClick={() => toggleDay(day)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  gameData.operatingDays.includes(day)
                    ? 'border-blue-600 bg-blue-50 text-blue-900'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-xs font-medium">{day.slice(0, 3)}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Operating Hours
          </CardTitle>
          <CardDescription>Set the start and end times for bookings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Toggle for custom hours */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <Label>Custom Hours per Day</Label>
              <p className="text-xs text-gray-500">Set different hours for each day</p>
            </div>
            <Switch
              checked={gameData.customHoursEnabled}
              onCheckedChange={(checked) => {
                updateGameData('customHoursEnabled', checked);
                if (!checked) {
                  // Reset all days to use the global time
                  const updatedHours: any = {};
                  DAYS_OF_WEEK.forEach(day => {
                    updatedHours[day] = {
                      enabled: gameData.operatingDays.includes(day),
                      startTime: gameData.startTime,
                      endTime: gameData.endTime
                    };
                  });
                  updateGameData('customHours', updatedHours);
                }
              }}
            />
          </div>

          {/* Standard hours (when custom is disabled) */}
          {!gameData.customHoursEnabled && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={gameData.startTime}
                  onChange={(e) => updateGameData('startTime', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={gameData.endTime}
                  onChange={(e) => updateGameData('endTime', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {/* Custom hours per day */}
          {gameData.customHoursEnabled && (
            <div className="space-y-3">
              <Label>Hours for each day</Label>
              {DAYS_OF_WEEK.map((day) => {
                const isEnabled = gameData.operatingDays.includes(day);
                return (
                  <div 
                    key={day} 
                    className={`p-3 border rounded-lg transition-all ${
                      isEnabled ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-20 text-sm text-gray-700">{day}</div>
                      {isEnabled ? (
                        <>
                          <Input
                            type="time"
                            value={gameData.customHours[day]?.startTime || '10:00'}
                            onChange={(e) => updateCustomHours(day, 'startTime', e.target.value)}
                            className="flex-1"
                          />
                          <span className="text-gray-400">to</span>
                          <Input
                            type="time"
                            value={gameData.customHours[day]?.endTime || '22:00'}
                            onChange={(e) => updateCustomHours(day, 'endTime', e.target.value)}
                            className="flex-1"
                          />
                        </>
                      ) : (
                        <span className="text-sm text-gray-400">Not operating</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <Separator />

          <div>
            <Label htmlFor="slotInterval">Time Slot Interval (minutes)</Label>
            <Select
              value={gameData.slotInterval.toString()}
              onValueChange={(value) => updateGameData('slotInterval', parseInt(value))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1.5 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="advanceBooking">Advance Booking (days)</Label>
            <Input
              id="advanceBooking"
              type="number"
              min="1"
              max="365"
              value={gameData.advanceBooking}
              onChange={(e) => updateGameData('advanceBooking', parseInt(e.target.value))}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              How far in advance customers can book
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Custom Dates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5" />
            Custom Dates
          </CardTitle>
          <CardDescription>
            Add specific dates with custom hours (overrides regular schedule)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing custom dates */}
          {gameData.customDates.length > 0 && (
            <div className="space-y-2">
              <Label>Active custom dates</Label>
              {gameData.customDates.map((customDate: any) => (
                <div 
                  key={customDate.id} 
                  className="flex items-center justify-between p-3 border border-blue-200 bg-blue-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{formatDate(customDate.date)}</p>
                    <p className="text-xs text-gray-600">
                      {customDate.startTime} - {customDate.endTime}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCustomDate(customDate.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              ))}
              <Separator />
            </div>
          )}

          {/* Add new custom date */}
          <div className="space-y-3 p-4 border-2 border-dashed border-gray-300 rounded-lg">
            <Label>Add a custom date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left">
                  <CalendarDays className="mr-2 w-4 h-4" />
                  {selectedDate ? formatDate(selectedDate.toISOString().split('T')[0]) : 'Select a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Start Time</Label>
                <Input
                  type="time"
                  value={customDateTime.startTime}
                  onChange={(e) => setCustomDateTime({ ...customDateTime, startTime: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">End Time</Label>
                <Input
                  type="time"
                  value={customDateTime.endTime}
                  onChange={(e) => setCustomDateTime({ ...customDateTime, endTime: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <Button 
              onClick={addCustomDate} 
              className="w-full"
              disabled={!selectedDate}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Custom Date
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Blocked Dates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <X className="w-5 h-5" />
            Blocked Dates
          </CardTitle>
          <CardDescription>
            Mark specific dates as unavailable (holidays, maintenance, etc.)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing blocked dates */}
          {gameData.blockedDates.length > 0 && (
            <div className="space-y-2">
              <Label>Blocked dates & times</Label>
              {gameData.blockedDates.map((block: any, index: number) => {
                const isFullDay = typeof block === 'string';
                const displayDate = isFullDay ? block : block.date;
                const timeRange = isFullDay ? 'Full day' : `${block.startTime} - ${block.endTime}`;
                
                return (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 border border-red-200 bg-red-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <X className="w-4 h-4 text-red-600" />
                        <p className="text-sm text-gray-900">{formatDate(displayDate)}</p>
                      </div>
                      <p className="text-xs text-gray-600 ml-6">{timeRange}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeBlockedDate(index)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                );
              })}
              <Separator />
            </div>
          )}

          {/* Add blocked date */}
          <div className="space-y-3 p-4 border-2 border-dashed border-gray-300 rounded-lg">
            <Label>Block a date or time range</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left">
                  <CalendarDays className="mr-2 w-4 h-4" />
                  {blockedDate ? formatDate(blockedDate.toISOString().split('T')[0]) : 'Select a date to block'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={blockedDate}
                  onSelect={setBlockedDate}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {/* Time block toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <Label className="text-sm">Block specific time range</Label>
                <p className="text-xs text-gray-500">Or block the entire day</p>
              </div>
              <Switch
                checked={!blockedTimeRange.blockFullDay}
                onCheckedChange={(checked) => {
                  setBlockedTimeRange({ 
                    ...blockedTimeRange, 
                    blockFullDay: !checked,
                    startTime: checked ? '09:00' : '',
                    endTime: checked ? '17:00' : ''
                  });
                }}
              />
            </div>

            {/* Time range inputs */}
            {!blockedTimeRange.blockFullDay && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <Label className="text-xs">Start Time</Label>
                  <Input
                    type="time"
                    value={blockedTimeRange.startTime}
                    onChange={(e) => setBlockedTimeRange({ ...blockedTimeRange, startTime: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">End Time</Label>
                  <Input
                    type="time"
                    value={blockedTimeRange.endTime}
                    onChange={(e) => setBlockedTimeRange({ ...blockedTimeRange, endTime: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            <Button 
              onClick={addBlockedDate} 
              variant="outline"
              className="w-full"
              disabled={!blockedDate || (!blockedTimeRange.blockFullDay && (!blockedTimeRange.startTime || !blockedTimeRange.endTime))}
            >
              <X className="w-4 h-4 mr-2" />
              {blockedTimeRange.blockFullDay ? 'Block Full Day' : 'Block Time Range'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Step 6: Widget & Embed
function Step6WidgetEmbed({ gameData, updateGameData, theme, embedContext }: any) {
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Reset copy states when widget selection changes
  React.useEffect(() => {
    setCopied(false);
    setCopiedLink(false);
  }, [gameData.selectedWidget]);

  const rawEmbedKey = (embedContext?.embedKey ?? '').trim();
  const hasRealEmbedKey = rawEmbedKey.length > 0;
  const effectiveEmbedKey = hasRealEmbedKey ? rawEmbedKey : 'demo_preview';
  const baseUrlRaw = embedContext?.baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://bookingtms.com');
  const cleanedBase = baseUrlRaw.trim().replace(/\/+$/g, '');
  const baseUrl = cleanedBase || '';
  const primaryColorHex = (embedContext?.primaryColor || '#2563eb').replace('#', '');
  const themeParam = theme === 'dark' ? 'dark' : 'light';
  const gameSlug = generateSlug(gameData.slug || gameData.name);
  const [showEmbedWarning, setShowEmbedWarning] = useState(!hasRealEmbedKey);

  React.useEffect(() => {
    setShowEmbedWarning(!hasRealEmbedKey);
  }, [hasRealEmbedKey]);

  // Restrict options if theme is calendar-only
  const widgetOptions = theme === 'calendar'
    ? [
        {
          id: 'calendar-single-event',
          name: 'Calendar Single Event / Room Booking Page Widget',
          description:
            'Full-page calendar view with time slots and booking details. Perfect for single events or room bookings.',
          icon: CalendarDays,
          recommended: true,
          default: true,
        },
      ]
    : [
        {
          id: 'calendar-single-event',
          name: 'Calendar Single Event / Room Booking Page Widget',
          description:
            'Full-page calendar view with time slots and booking details. Perfect for single events or room bookings.',
          icon: CalendarDays,
          recommended: true,
        },
        {
          id: 'list-widget',
          name: 'List Widget',
          description:
            'Simple list view showing available time slots. Clean and straightforward booking experience.',
          icon: FileText,
        },
        {
          id: 'multi-step-widget',
          name: 'Multi-Step Widget',
          description:
            'Guided step-by-step booking process. Ideal for complex bookings with multiple options.',
          icon: Sparkles,
        },
        {
          id: 'quick-book-widget',
          name: 'Quick Book Widget',
          description:
            'Fast one-click booking experience. Perfect for simple, time-sensitive bookings.',
          icon: Clock,
        },
        {
          id: 'calendar-widget',
          name: 'Calendar Widget',
          description:
            'Month/week calendar view with availability. Great for recurring events and date selection.',
          icon: Calendar,
        },
        {
          id: 'farebook-widget',
          name: 'FareBook Widget',
          description:
            'FareHarbor-inspired design with modern aesthetics. Professional booking experience.',
          icon: Star,
        },
      ];

  // Map wizard widget IDs to Embed.tsx IDs
  const mapWidgetToEmbedId = (id: string): string => {
    switch (id) {
      case 'calendar-single-event':
        return 'singlegame';
      case 'list-widget':
        return 'bookgo';
      case 'multi-step-widget':
        return 'multistep';
      case 'quick-book-widget':
        return 'quick';
      case 'calendar-widget':
        return 'calendar';
      case 'farebook-widget':
        return 'farebook';
      default:
        return 'farebook';
    }
  };

  const generateEmbedUrl = () => {
    const embedWidgetId = mapWidgetToEmbedId(gameData.selectedWidget);
    const params = new URLSearchParams({
      widget: embedWidgetId,
      color: primaryColorHex,
      key: effectiveEmbedKey,
      theme: themeParam,
    });
    if (embedWidgetId === 'singlegame') {
      if (gameData.name) params.set('gameName', gameData.name);
      if (gameData.description) params.set('gameDescription', gameData.description);
      if (gameData.adultPrice) params.set('gamePrice', String(gameData.adultPrice));
      if (gameSlug) params.set('gameSlug', gameSlug);
    }
    if (!baseUrl) {
      return `/?${params.toString()}`;
    }
    return `${baseUrl}/?${params.toString()}`;
  };

  const generateEmbedCode = () => {
    const embedUrl = generateEmbedUrl();
    const height = mapWidgetToEmbedId(gameData.selectedWidget) === 'singlegame' ? 1200 : 800;
    return `<!-- BookingTMS Widget Embed -->
<iframe
  src="${embedUrl}"
  width="100%"
  height="${height}"
  frameborder="0"
  allow="payment; camera"
  allowfullscreen
  style="border: none; border-radius: 12px;"
  title="${gameData.name || 'Booking Widget'}"
></iframe>`;
  };

  const generateReactCode = () => {
    const embedUrl = generateEmbedUrl();
    const height = mapWidgetToEmbedId(gameData.selectedWidget) === 'singlegame' ? 1200 : 800;
    return `export function BookingWidgetEmbed() {
  return (
    <iframe
      src="${embedUrl}"
      width="100%"
      height="${height}"
      style={{ border: 'none', borderRadius: 12 }}
      allow="payment; camera"
      allowFullScreen
      title="${gameData.name || 'Booking Widget'}"
    />
  );
}`;
  };

  const generateBookingLink = () => generateEmbedUrl();

  // Robust copy to clipboard with fallback
  const copyToClipboard = async (text: string): Promise<boolean> => {
    // Try modern Clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        console.warn('Clipboard API failed, trying fallback:', err);
      }
    }

    // Fallback to execCommand
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      return successful;
    } catch (err) {
      console.error('Fallback copy failed:', err);
      return false;
    }
  };

  const handleCopyCode = async () => {
    const success = await copyToClipboard(generateEmbedCode());
    if (success) {
      setCopied(true);
      toast.success('Embed code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('Failed to copy. Please copy manually.');
    }
  };

  const handleCopyLink = async () => {
    const success = await copyToClipboard(generateBookingLink());
    if (success) {
      setCopiedLink(true);
      toast.success('Booking link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      toast.error('Failed to copy. Please copy manually.');
    }
  };

  return (
    <div className="space-y-6">
      {showEmbedWarning && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-800 flex items-center justify-center flex-shrink-0">
                <Info className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="space-y-1 text-amber-800 dark:text-amber-200">
                <p className="text-sm font-semibold">Embed key not configured</p>
                <p className="text-sm">
                  This venue doesn't have a live embed key yet. The generated links will use a placeholder key
                  <span className="font-mono"> demo_preview</span> and won't load real data. Save the venue first to generate a working embed key.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Widget Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5" />
            Choose Booking Widget
          </CardTitle>
          <CardDescription>
            Select the widget that will be used for bookings on your website
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {widgetOptions.map((widget) => {
            const WidgetIcon = widget.icon;
            const isSelected = gameData.selectedWidget === widget.id;
            
            return (
              <div
                key={widget.id}
                onClick={() => updateGameData('selectedWidget', widget.id)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <WidgetIcon className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                      <p className={`text-sm ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                        {widget.name}
                      </p>
                      {widget.default ? (
                        <Badge className="bg-blue-100 text-blue-800 border-blue-300 text-xs">
                          Default
                        </Badge>
                      ) : widget.recommended ? (
                        <Badge className="bg-blue-100 text-blue-800 border-blue-300 text-xs">
                          Recommended
                        </Badge>
                      ) : null}
                    </div>
                    <p className="text-xs text-gray-600">
                      {widget.description}
                    </p>
                  </div>
                  {isSelected && (
                    <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  )}
                </div>
              </div>
            );
          })}

          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Info className="w-3 h-3" />
              You can change the widget later in your game settings
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Current Configuration Preview */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm text-blue-900 mb-1">Current Configuration</h3>
              <div className="space-y-1">
                <p className="text-xs text-blue-700">
                  <span className="opacity-70">Game:</span> <span className="font-medium">{gameData.name || 'Untitled Game'}</span>
                </p>
                <p className="text-xs text-blue-700">
                  <span className="opacity-70">Widget:</span> <span className="font-medium">{widgetOptions.find(w => w.id === gameData.selectedWidget)?.name}</span>
                </p>
                <p className="text-xs text-blue-700">
                  <span className="opacity-70">URL Slug:</span> <span className="font-mono">{gameData.name.toLowerCase().replace(/\s+/g, '-')}</span>
                </p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800 border-green-300 text-xs">
              <Check className="w-3 h-3 mr-1" />
              Ready
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Booking Link */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <CardTitle className="text-lg">Direct Booking Link</CardTitle>
              <p className="text-sm text-gray-600 mt-1">Share this link directly with customers</p>
              {/* Selected Widget Indicator */}
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-blue-100 text-blue-800 border-blue-300 text-xs">
                  {widgetOptions.find(w => w.id === gameData.selectedWidget)?.name || 'Selected Widget'}
                </Badge>
                <span className="text-xs text-gray-500">• Updates automatically</span>
              </div>
            </div>
            <Button 
              onClick={handleCopyLink} 
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <code className="text-sm text-blue-600 break-all">
              {generateBookingLink()}
            </code>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Info className="w-3 h-3" />
              <span>This link updates when you change the widget selection above</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(generateBookingLink(), '_blank')}
              className="text-xs"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Test Link
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Embed Code */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <CardTitle className="text-lg">Embed Code for Your Website</CardTitle>
              <p className="text-sm text-gray-600 mt-1">Copy and paste this code into your website</p>
              {/* Widget Info */}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-gray-500">Widget:</span>
                <Badge className="bg-blue-100 text-blue-800 border-blue-300 text-xs">
                  {gameData.selectedWidget}
                </Badge>
                <span className="text-xs text-gray-500">• Code updates live</span>
              </div>
            </div>
            <Button 
              onClick={handleCopyCode} 
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Code
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="html">
            <TabsList className="w-full grid grid-cols-3 h-10">
              <TabsTrigger value="html">HTML</TabsTrigger>
              <TabsTrigger value="react">React</TabsTrigger>
              <TabsTrigger value="wordpress">WordPress</TabsTrigger>
            </TabsList>
            <TabsContent value="html" className="mt-4">
              <ScrollArea className="h-[300px] w-full rounded-lg bg-gray-900 border border-gray-700 p-4">
                <pre className="text-sm text-green-400">
                  <code>{generateEmbedCode()}</code>
                </pre>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="react" className="mt-4">
              <ScrollArea className="h-[300px] w-full rounded-lg bg-gray-900 border border-gray-700 p-4">
                <pre className="text-sm text-green-400">
                  <code>{generateReactCode()}</code>
                </pre>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="wordpress" className="mt-4">
              <ScrollArea className="h-[300px] w-full rounded-lg bg-gray-900 border border-gray-700 p-4">
                <pre className="text-sm text-green-400">
                  <code>{`1. Login to WordPress Admin Panel
2. Go to Pages or Posts
3. Edit the page where you want the widget
4. Switch to HTML/Code Editor
5. Paste the following code:

${generateEmbedCode()}

6. Update/Publish your page
7. Visit the page to see your booking widget

Alternative: Use a shortcode plugin
[bookingtms game="${gameData.name.toLowerCase().replace(/\s+/g, '-')}" widget="${gameData.selectedWidget}"]`}</code>
                </pre>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Installation Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Installation Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-blue-600">1</span>
              </div>
              <h3 className="text-sm text-gray-900 mb-2">Choose Widget</h3>
              <p className="text-sm text-gray-600">
                Select the booking widget that best fits your website design and user flow
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-blue-600">2</span>
              </div>
              <h3 className="text-sm text-gray-900 mb-2">Copy Code</h3>
              <p className="text-sm text-gray-600">
                Copy the embed code or booking link depending on your needs
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-blue-600">3</span>
              </div>
              <h3 className="text-sm text-gray-900 mb-2">Paste & Go Live</h3>
              <p className="text-sm text-gray-600">
                Paste the code into your website and start accepting bookings immediately
              </p>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm text-blue-900 mb-2">💡 Pro Tip</h3>
            <p className="text-sm text-blue-700">
              For the best experience, test your widget on a staging environment before going live. Need help? Contact our support team.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Step 7: Review & Publish
function Step7Review({ gameData }: any) {
  // Validation function
  const validateGameData = () => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields validation
    if (!gameData.name || gameData.name.trim() === '') {
      errors.push('Game name is required');
    }
    if (!gameData.description || gameData.description.trim() === '') {
      errors.push('Description is required');
    }
    if (!gameData.adultPrice || gameData.adultPrice <= 0) {
      errors.push('Adult price must be greater than 0');
    }
    if (!gameData.duration || gameData.duration <= 0) {
      errors.push('Duration must be greater than 0');
    }
    if (!gameData.minAdults || gameData.minAdults <= 0) {
      errors.push('Minimum adults must be at least 1');
    }
    if (!gameData.maxAdults || gameData.maxAdults < gameData.minAdults) {
      errors.push('Maximum adults must be greater than or equal to minimum');
    }

    // Optional but recommended fields
    if (!gameData.coverImage) {
      warnings.push('No cover image uploaded - using default placeholder');
    }
    if (!gameData.minAge || gameData.minAge === 0) {
      warnings.push('Minimum age not set - defaulting to 0 (all ages)');
    }
    if (gameData.operatingDays.length === 0) {
      errors.push('At least one operating day must be selected');
    }
    if (!gameData.selectedWidget) {
      warnings.push('No widget selected - using default calendar widget');
    }
    if (gameData.galleryImages.length === 0) {
      warnings.push('No gallery images - consider adding photos to showcase your game');
    }

    return { errors, warnings, isValid: errors.length === 0 };
  };

  const validation = validateGameData();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Review Your Game</CardTitle>
          <CardDescription>
            Double-check all information before publishing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Cover Image Preview */}
          {gameData.coverImage && (
            <div>
              <img
                src={gameData.coverImage}
                alt={gameData.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            </div>
          )}

          {/* Basic Info */}
          <div>
            <h3 className="text-lg text-gray-900 mb-1">{gameData.name}</h3>
            {gameData.tagline && (
              <p className="text-sm text-gray-600 mb-2">{gameData.tagline}</p>
            )}
            <div className="flex items-center gap-2">
              <Badge>{gameData.category}</Badge>
              {gameData.gameType && (
                <Badge variant="secondary">{gameData.gameType}</Badge>
              )}
            </div>
          </div>

          <Separator />

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Capacity</p>
                <p className="text-gray-900">
                  {gameData.minAdults}-{gameData.maxAdults} adults
                  {gameData.maxChildren > 0 && `, up to ${gameData.maxChildren} children`}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="text-gray-900">{gameData.duration} minutes</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Difficulty</p>
                <div className="flex gap-0.5">
                  {Array.from({ length: gameData.difficulty }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Pricing</p>
                <p className="text-gray-900">
                  ${gameData.adultPrice} (adult), ${gameData.childPrice} (child)
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Min Age</p>
                <p className="text-gray-900">{gameData.minAge}+</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Languages</p>
                <p className="text-gray-900">{gameData.language.join(', ')}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <p className="text-sm text-gray-500 mb-2">Description</p>
            <p className="text-sm text-gray-700">{gameData.description}</p>
          </div>

          {/* Operating Days */}
          <div>
            <p className="text-sm text-gray-500 mb-2">Operating Days</p>
            <div className="flex flex-wrap gap-2">
              {gameData.operatingDays.map((day: string) => (
                <Badge key={day} variant="secondary">
                  {day}
                </Badge>
              ))}
            </div>
          </div>

          {/* Gallery Preview */}
          {gameData.galleryImages.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 mb-2">Gallery ({gameData.galleryImages.length} images)</p>
              <div className="grid grid-cols-4 gap-2">
                {gameData.galleryImages.slice(0, 4).map((img: string, index: number) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-20 object-cover rounded"
                  />
                ))}
              </div>
            </div>
          )}

          {gameData.videos.length > 0 && (
            <div>
              <p className="text-sm text-gray-500">Videos: {gameData.videos.length} uploaded</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Validation Status */}
      {validation.errors.length > 0 ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <X className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-red-900 mb-2">Cannot publish - please fix the following errors:</p>
                <ul className="space-y-1">
                  {validation.errors.map((error, index) => (
                    <li key={index} className="text-sm text-red-700 flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">•</span>
                      <span>{error}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {validation.warnings.length > 0 && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Info className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-amber-900 mb-2">Recommendations:</p>
                    <ul className="space-y-1">
                      {validation.warnings.map((warning, index) => (
                        <li key={index} className="text-sm text-amber-700 flex items-start gap-2">
                          <span className="text-amber-500 mt-0.5">•</span>
                          <span>{warning}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-green-900 mb-1">Ready to publish!</p>
                  <p className="text-sm text-green-700">
                    Your game will be immediately available for booking once published.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
