import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useTerminology } from '../../hooks/useTerminology';
import { GameData, EmbedContext } from './types';
import { STEPS } from './constants';
import Step1BasicInfo from './steps/Step1BasicInfo';
import Step2CapacityPricing from './steps/Step2CapacityPricing';
import Step3GameDetails from './steps/Step3GameDetails';
import Step4MediaUpload from './steps/Step4MediaUpload';
import Step5Schedule from './steps/Step5Schedule';
import Step6PaymentSettings from './steps/Step6PaymentSettings';
import { basicInfoSchema, capacityPricingSchema, gameDetailsSchema, mediaSchema, scheduleSchema, gameDataSchema } from './schema';
import Step7WidgetEmbed from './steps/Step7WidgetEmbed';
import Step8Review from './steps/Step8Review';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

interface AddServiceItemWizardProps {
  onComplete: (gameData: GameData) => void;
  onCancel: () => void;
  initialData?: GameData;
  mode?: 'create' | 'edit';
  theme?: string;
  embedContext?: EmbedContext;
  venueType?: string;
  venueId?: string;
  organizationId?: string;
}

const generateSlug = (value: string | undefined) => {
  if (!value) return 'game';
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

export default function AddServiceItemWizard({ onComplete, onCancel, initialData, mode = 'create', theme, embedContext, venueType, venueId, organizationId }: AddServiceItemWizardProps) {
  const t = useTerminology(venueType || 'escape_room');
  const [currentStep, setCurrentStep] = useState(1);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [creationStatus, setCreationStatus] = useState({
    stage: '',
    message: '',
    progress: 0
  });
  const [createdGameId, setCreatedGameId] = useState<string | null>(null);

  // Convert ServiceItem/Game data to Wizard GameData format
  const convertGameToWizardData = (game: any): Partial<GameData> => {
    if (!game) return {};

    return {
      name: game.name,
      description: game.description,
      category: game.category || 'escape-room',
      tagline: game.tagline,
      eventType: game.eventType || 'public',
      gameType: game.gameType || 'physical',
      minAdults: game.minAdults || game.min_players || 2,
      maxAdults: game.maxAdults || game.max_players || 8,
      minChildren: game.minChildren || 0,
      maxChildren: game.maxChildren || 4,
      adultPrice: game.adultPrice || game.price || 30,
      childPrice: game.childPrice || 25,
      duration: typeof game.duration === 'number' ? game.duration : parseInt(game.duration, 10) || 60,
      difficulty: typeof game.difficulty === 'number' ? game.difficulty : 3,
      minAge: parseInt(game.ageRange || game.minAge, 10) || 12,
      language: Array.isArray(game.language) ? game.language : ['English'],
      successRate: game.successRate || 75,
      activityDetails: game.activityDetails || '',
      additionalInformation: game.additionalInformation || '',
      faqs: Array.isArray(game.faqs) ? game.faqs : [],
      cancellationPolicies: Array.isArray(game.cancellationPolicies) ? game.cancellationPolicies : [],
      accessibility: game.accessibility || { strollerAccessible: false, wheelchairAccessible: false },
      location: game.location || '',
      coverImage: game.coverImage || game.imageUrl || game.image_url || '',
      galleryImages: Array.isArray(game.galleryImages) ? game.galleryImages : [],
      videos: Array.isArray(game.videos) ? game.videos : [],
      selectedWidget: game.selectedWidget || 'calendar-single-event',
      operatingDays: Array.isArray(game.operatingDays) ? game.operatingDays : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      startTime: game.startTime || '10:00',
      endTime: game.endTime || '22:00',
      slotInterval: game.slotInterval || 60,
      advanceBooking: game.advanceBooking || 30,
      customHoursEnabled: Boolean(game.customHoursEnabled),
      customHours: typeof game.customHours === 'object' && game.customHours ? game.customHours : {
        Monday: { enabled: true, startTime: '10:00', endTime: '22:00' },
        Tuesday: { enabled: true, startTime: '10:00', endTime: '22:00' },
        Wednesday: { enabled: true, startTime: '10:00', endTime: '22:00' },
        Thursday: { enabled: true, startTime: '10:00', endTime: '22:00' },
        Friday: { enabled: true, startTime: '10:00', endTime: '22:00' },
        Saturday: { enabled: true, startTime: '10:00', endTime: '22:00' },
        Sunday: { enabled: true, startTime: '10:00', endTime: '22:00' },
      },
      customCapacityFields: Array.isArray(game.customCapacityFields) ? game.customCapacityFields : [],
      groupDiscount: Boolean(game.groupDiscount),
      groupTiers: Array.isArray(game.groupTiers) ? game.groupTiers : [],
      dynamicPricing: Boolean(game.dynamicPricing),
      peakPricing: game.peakPricing || { enabled: false, weekdayPeakPrice: 0, weekendPeakPrice: 0, peakStartTime: '', peakEndTime: '' },
      customDates: Array.isArray(game.customDates) ? game.customDates : [],
      blockedDates: Array.isArray(game.blockedDates) ? game.blockedDates : [],
      requiresWaiver: Boolean(game.requiresWaiver),
      selectedWaiver: game.selectedWaiver || null,
      cancellationWindow: game.cancellationWindow || 24,
      specialInstructions: game.specialInstructions || '',
      slug: game.slug || generateSlug(game.name),
      // Preserve Stripe fields
      stripeProductId: game.stripeProductId || game.stripe_product_id,
      stripePriceId: game.stripePriceId || game.stripe_price_id,
      stripePrices: game.stripePrices || game.stripe_prices,
      stripeCheckoutUrl: game.stripeCheckoutUrl || game.stripe_checkout_url,
      stripeSyncStatus: game.stripeSyncStatus || game.stripe_sync_status,
      stripeLastSync: game.stripeLastSync || game.stripe_last_sync,
    };
  };

  const methods = useForm<GameData>({
    resolver: zodResolver(gameDataSchema),
    defaultValues: {
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
      ...(initialData ? convertGameToWizardData(initialData) : {})
    },
    mode: 'onChange'
  });

  const { watch, setValue, trigger, reset, formState: { errors, isValid } } = methods;
  const gameData = watch();

  const progress = (currentStep / STEPS.length) * 100;

  const updateGameData = (field: keyof GameData, value: any) => {
    setValue(field as any, value, { shouldValidate: true, shouldDirty: true });
  };

  const handleNext = async () => {
    // Validation for each step using Zod via trigger
    let isValid = false;
    console.log(`Validating step ${currentStep}...`);

    switch (currentStep) {
      case 1:
        isValid = await trigger(['name', 'description', 'category', 'eventType', 'gameType']);
        break;
      case 2:
        isValid = await trigger(['minAdults', 'maxAdults', 'adultPrice', 'childPrice']);
        break;
      case 3:
        isValid = await trigger(['duration', 'difficulty', 'minAge']);
        break;
      case 4:
        isValid = await trigger(['coverImage']);
        break;
      case 5:
        isValid = await trigger(['operatingDays', 'startTime', 'endTime', 'slotInterval', 'advanceBooking']);
        break;
      default:
        isValid = true;
    }

    console.log(`Step ${currentStep} validation result:`, isValid);
    if (!isValid) {
      console.log('Validation errors:', errors);
      // Show first error
      const firstErrorKey = Object.keys(errors)[0];
      if (firstErrorKey) {
        toast.error(errors[firstErrorKey]?.message as string || 'Please fix validation errors');
      }
      return;
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

  const validateGameData = async () => {
    const isValid = await trigger();
    return { errors: [], isValid };
  };

  const handleSubmit = async () => {
    // Validate before publishing
    const validation = await validateGameData();
    if (!validation.isValid) {
      toast.error('Please fix validation errors before publishing');
      return;
    }

    setIsPublishing(true);

    try {
      // Stage 1: Preparing data
      setCreationStatus({
        stage: 'preparing',
        message: `Preparing ${t.singular.toLowerCase()} data...`,
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
      const result: any = await onComplete(gameData);

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
        message: `Verifying ${t.singular.toLowerCase()} creation...`,
        progress: 90
      });

      // Extract game ID from result if available
      const gameId = result?.id || result?.data?.id || null;
      setCreatedGameId(gameId);

      await new Promise(resolve => setTimeout(resolve, 300));

      // Stage 5: Complete
      setCreationStatus({
        stage: 'complete',
        message: `${t.singular} created successfully!`,
        progress: 100
      });

      // Show success screen
      setPublishSuccess(true);
      toast.success(mode === 'edit' ? `${t.singular} updated successfully!` : `${t.singular} published successfully!`);
    } catch (error: any) {
      console.error('Error publishing game:', error);
      toast.error(error.message || `Failed to publish ${t.singular.toLowerCase()}`);
      setIsPublishing(false);
      setCreationStatus({
        stage: 'error',
        message: error.message || `Failed to create ${t.singular.toLowerCase()}`,
        progress: 0
      });
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1BasicInfo gameData={gameData} updateGameData={updateGameData} t={t} />;
      case 2:
        return <Step2CapacityPricing gameData={gameData} updateGameData={updateGameData} t={t} />;
      case 3:
        return <Step3GameDetails gameData={gameData} updateGameData={updateGameData} t={t} />;
      case 4:
        return <Step4MediaUpload gameData={gameData} updateGameData={updateGameData} t={t} />;
      case 5:
        return <Step5Schedule gameData={gameData} updateGameData={updateGameData} t={t} />;
      case 6:
        return <Step6PaymentSettings
          gameData={gameData}
          onUpdate={(data) => reset(data)}
          onNext={() => setCurrentStep(7)}
          onPrevious={() => setCurrentStep(5)}
          t={t}
          venueId={venueId}
          organizationId={organizationId}
        />;
      case 7:
        return <Step7WidgetEmbed gameData={gameData} updateGameData={updateGameData} t={t} />;
      case 8:
        return <Step8Review gameData={gameData} updateGameData={updateGameData} t={t} onEditStep={setCurrentStep} />;
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
              {mode === 'edit' ? `Updating ${t.singular}...` : `Creating Your ${t.singular}...`}
            </h2>
            <p className="text-lg text-gray-700 mb-8">
              {creationStatus.message.replace('Game', t.singular).replace('game', t.singular.toLowerCase())}
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
              <div className={`flex items-center gap-3 p-3 rounded-lg ${creationStatus.stage === 'preparing' ? 'bg-blue-100' :
                creationStatus.progress > 20 ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                {creationStatus.progress > 20 ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <div className="w-5 h-5 border-2 border-gray-400 rounded-full" />
                )}
                <span className="text-sm text-gray-900">Preparing game data</span>
              </div>

              <div className={`flex items-center gap-3 p-3 rounded-lg ${creationStatus.stage === 'stripe' ? 'bg-blue-100' :
                creationStatus.progress > 40 ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                {creationStatus.progress > 40 ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <div className="w-5 h-5 border-2 border-gray-400 rounded-full" />
                )}
                <span className="text-sm text-gray-900">Creating Stripe product</span>
              </div>

              <div className={`flex items-center gap-3 p-3 rounded-lg ${creationStatus.stage === 'database' ? 'bg-blue-100' :
                creationStatus.progress > 70 ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                {creationStatus.progress > 70 ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <div className="w-5 h-5 border-2 border-gray-400 rounded-full" />
                )}
                <span className="text-sm text-gray-900">Saving to database</span>
              </div>

              <div className={`flex items-center gap-3 p-3 rounded-lg ${creationStatus.stage === 'verifying' ? 'bg-blue-100' :
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
              {mode === 'edit' ? `${t.singular} Updated!` : `${t.singular} Published!`}
            </h2>
            <p className="text-lg text-gray-700 mb-8">
              {mode === 'edit'
                ? `Your ${t.singular.toLowerCase()} has been successfully updated and is now live.`
                : `Your ${t.singular.toLowerCase()} has been successfully published and is now available for booking!`}
            </p>

            <div className="bg-white rounded-lg p-6 mb-8 border border-green-200">
              <div className="grid grid-cols-2 gap-6 text-left">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{t.singular} Name</p>
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
          <h2 className="text-2xl text-gray-900 dark:text-white">{mode === 'edit' ? `${t.actionEdit}` : `${t.actionAdd}`}</h2>
          <p className="text-sm text-gray-600 dark:text-[#a3a3a3] mt-1">
            Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].name.replace('Game', t.singular)}
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
                <button
                  onClick={() => setCurrentStep(step.id)}
                  className="flex flex-col items-center group cursor-pointer"
                  title={`Go to ${step.name}`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isCompleted
                      ? 'bg-green-600 dark:bg-emerald-600 text-white group-hover:bg-green-700 dark:group-hover:bg-emerald-700'
                      : isCurrent
                        ? 'bg-blue-600 dark:bg-[#4f46e5] text-white'
                        : 'bg-gray-200 dark:bg-[#2a2a2a] text-gray-500 dark:text-[#737373] group-hover:bg-gray-300 dark:group-hover:bg-[#3a3a3a]'
                      }`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <StepIcon className="w-5 h-5" />
                    )}
                  </div>
                  <span
                    className={`text-xs mt-2 hidden md:block transition-colors ${isCurrent
                      ? 'text-blue-600 dark:text-[#6366f1]'
                      : 'text-gray-500 dark:text-[#737373] group-hover:text-gray-700 dark:group-hover:text-[#a3a3a3]'
                      }`}
                  >
                    {step.name}
                  </span>
                </button>
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
              {currentStep === 6 && !gameData.stripeProductId ? 'Skip for Now' : 'Next'}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isPublishing || !isValid}
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
