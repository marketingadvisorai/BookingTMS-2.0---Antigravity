import React, { useState } from 'react';
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
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { useRef } from 'react';

interface AddGameWizardProps {
  onComplete: (gameData: any) => void;
  onCancel: () => void;
  initialData?: GameData;
  mode?: 'create' | 'edit';
}

interface GameData {
  // Step 1: Basic Info
  name: string;
  description: string;
  category: string;
  tagline: string;
  eventType: 'public' | 'private';

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

  // Step 4: Media
  coverImage: string;
  galleryImages: string[];
  videos: string[];

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
}

const STEPS = [
  { id: 1, name: 'Basic Info', icon: Info },
  { id: 2, name: 'Capacity & Pricing', icon: Users },
  { id: 3, name: 'Game Details', icon: Sparkles },
  { id: 4, name: 'Media Upload', icon: ImageIcon },
  { id: 5, name: 'Schedule', icon: Calendar },
  { id: 6, name: 'Review & Publish', icon: Check }
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

const uploadGameImage = async (gameId: string, file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${gameId}/${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('game-images')
    .upload(filePath, file);

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage
    .from('game-images')
    .getPublicUrl(filePath);

  return data.publicUrl;
};

export default function AddEventWizard({ onComplete, onCancel, initialData, mode = 'create' }: AddGameWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [gameData, setGameData] = useState<GameData>(initialData || {
    name: '',
    description: '',
    category: '',
    tagline: '',
    eventType: 'public',
    minAdults: 2,
    maxAdults: 8,
    minChildren: 0,
    maxChildren: 4,
    adultPrice: 30,
    childPrice: 20,
    customCapacityFields: [],
    groupDiscount: false,
    dynamicPricing: false,
    peakPricing: {
      enabled: false,
      weekdayPeakPrice: 35,
      weekendPeakPrice: 40,
      peakStartTime: '18:00',
      peakEndTime: '22:00',
    },
    groupTiers: [],
    duration: 60,
    difficulty: 3,
    minAge: 12,
    language: ['English'],
    successRate: 45,
    activityDetails: '',
    additionalInformation: '',
    faqs: [],
    cancellationPolicies: [],
    accessibility: {
      strollerAccessible: false,
      wheelchairAccessible: false,
    },
    location: '123 Main Street, Los Angeles, CA 90012',
    coverImage: '',
    galleryImages: [],
    videos: [],
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
    requiresWaiver: true,
    selectedWaiver: null,
    cancellationWindow: 24,
    specialInstructions: ''
  });

  const progress = (currentStep / STEPS.length) * 100;

  const updateGameData = (field: string, value: any) => {
    setGameData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    // Validation for each step
    if (currentStep === 1) {
      if (!gameData.name || !gameData.description || !gameData.category) {
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

  const handleSubmit = () => {
    onComplete(gameData);
    toast.success('Game created successfully!');
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
        return <Step6Review gameData={gameData} />;
      default:
        return null;
    }
  };

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
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isCompleted
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
                    className={`text-xs mt-2 hidden md:block ${isCurrent ? 'text-blue-600 dark:text-[#6366f1]' : 'text-gray-500 dark:text-[#737373]'
                      }`}
                  >
                    {step.name}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${isCompleted ? 'bg-green-600 dark:bg-emerald-600' : 'bg-gray-200 dark:bg-[#2a2a2a]'
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
            <Button onClick={handleSubmit} className="bg-green-600 dark:bg-emerald-600 hover:bg-green-700 dark:hover:bg-emerald-700">
              <Check className="w-4 h-4 mr-2" />
              Publish Game
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
                  className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${isSelected
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
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      // Use a temp ID if new game, or existing ID to organize files
      const tempId = gameData.id || `temp-${Date.now()}`;
      const url = await uploadGameImage(tempId, file);

      updateGameData('coverImage', url);
      toast.success('Cover image uploaded successfully');
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const tempId = gameData.id || `temp-${Date.now()}`;
      const url = await uploadGameImage(tempId, file);

      updateGameData('galleryImages', [...gameData.galleryImages, url]);
      toast.success('Image added to gallery');
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  const handleVideoUpload = () => {
    // Video upload would require a separate bucket/logic, keeping mock for now or disabling
    toast.info('Video upload is coming soon! Please use a YouTube link instead.');
    // const mockVideoUrl = `https://video.example.com/${Date.now()}.mp4`;
    // updateGameData('videos', [...gameData.videos, mockVideoUrl]);
  };

  const removeGalleryImage = (index: number) => {
    updateGameData('galleryImages', gameData.galleryImages.filter((_: any, i: number) => i !== index));
  };

  const removeVideo = (index: number) => {
    updateGameData('videos', gameData.videos.filter((_: any, i: number) => i !== index));
  };

  return (
    <div className="space-y-6">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleCoverUpload}
      />
      <input
        type="file"
        ref={galleryInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleGalleryUpload}
      />

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
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={`border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isUploading ? (
                <Loader2 className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
              ) : (
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              )}
              <p className="text-gray-600 mb-2">{isUploading ? 'Uploading...' : 'Click to upload cover image'}</p>
              <p className="text-sm text-gray-500">Recommended: 1920x1080px, max 5MB</p>
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
              onClick={() => !isUploading && galleryInputRef.current?.click()}
              className={`border-2 border-dashed border-gray-300 rounded-lg h-32 flex items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="text-center">
                {isUploading ? (
                  <Loader2 className="w-8 h-8 text-blue-500 mx-auto mb-1 animate-spin" />
                ) : (
                  <Plus className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                )}
                <p className="text-xs text-gray-500">Add Image</p>
              </div>
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
                    <span className="text-sm text-gray-700">Video {index + 1}</span>
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
          <Button
            variant="outline"
            onClick={handleVideoUpload}
            className="w-full"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Video
          </Button>
          <p className="text-xs text-gray-500 mt-2">Supports MP4, MOV, AVI. Max 100MB per video</p>
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

    if (gameData.blockedDates.includes(dateStr)) {
      toast.error('This date is already blocked');
      return;
    }

    updateGameData('blockedDates', [...gameData.blockedDates, dateStr]);
    setBlockedDate(undefined);
    toast.success('Date blocked');
  };

  const removeBlockedDate = (date: string) => {
    updateGameData('blockedDates', gameData.blockedDates.filter((d: string) => d !== date));
    toast.success('Date unblocked');
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
                className={`p-3 rounded-lg border-2 transition-all ${gameData.operatingDays.includes(day)
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
                    className={`p-3 border rounded-lg transition-all ${isEnabled ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'
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
              <Label>Blocked dates</Label>
              {gameData.blockedDates.map((date: string) => (
                <div
                  key={date}
                  className="flex items-center justify-between p-3 border border-red-200 bg-red-50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <X className="w-4 h-4 text-red-600" />
                    <p className="text-sm text-gray-900">{formatDate(date)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeBlockedDate(date)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              ))}
              <Separator />
            </div>
          )}

          {/* Add blocked date */}
          <div className="space-y-3 p-4 border-2 border-dashed border-gray-300 rounded-lg">
            <Label>Block a date</Label>
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

            <Button
              onClick={addBlockedDate}
              variant="outline"
              className="w-full"
              disabled={!blockedDate}
            >
              <X className="w-4 h-4 mr-2" />
              Block This Date
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Step 6: Review & Publish
function Step6Review({ gameData }: any) {
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
            <Badge>{gameData.category}</Badge>
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

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Check className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <p className="text-green-900 mb-1">Ready to publish!</p>
            <p className="text-sm text-green-700">
              Your game will be immediately available for booking once published.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
