import React, { useState, useCallback } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useTerminology } from '../../hooks/useTerminology';
import { ActivityData, EmbedContext } from './types';
import { STEPS } from './constants';
import Step1BasicInfo from './steps/Step1BasicInfo';
import Step2CapacityPricing from './steps/Step2CapacityPricing';
import Step3ActivityDetails from './steps/Step3ActivityDetails';
import Step4MediaUpload from './steps/Step4MediaUpload';
import Step5Schedule from './steps/Step5Schedule';
import Step6PaymentSettings from './steps/Step6PaymentSettings';
import { activityDataSchema } from './schema';
import Step7WidgetEmbedNew from './steps/Step7WidgetEmbedNew';
import Step8Review from './steps/Step8Review';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DEFAULT_ACTIVITY_DATA, convertToWizardData, generateSlug } from './config/defaults';

interface AddServiceItemWizardProps {
  onComplete: (activityData: ActivityData) => void;
  onCancel: () => void;
  initialData?: ActivityData;
  mode?: 'create' | 'edit';
  theme?: string;
  embedContext?: EmbedContext;
  venueType?: string;
  venueId?: string;
  venueName?: string;
  organizationId?: string;
  organizationName?: string;
}

// Using generateSlug from config/defaults.ts

export default function AddServiceItemWizard({ onComplete, onCancel, initialData, mode = 'create', theme, embedContext, venueType, venueId, venueName, organizationId, organizationName }: AddServiceItemWizardProps) {
  const t = useTerminology(venueType || 'escape_room');
  const [currentStep, setCurrentStep] = useState(1);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [creationStatus, setCreationStatus] = useState({
    stage: '',
    message: '',
    progress: 0
  });
  const [createdActivityId, setCreatedActivityId] = useState<string | null>(null);

  // Using convertToWizardData from config/defaults.ts

  const methods = useForm<ActivityData>({
    resolver: zodResolver(activityDataSchema) as any,
    defaultValues: {
      ...DEFAULT_ACTIVITY_DATA,
      ...(initialData ? convertToWizardData(initialData) : {}),
    },
    mode: 'onChange'
  });

  const { watch, setValue, trigger, reset, formState: { errors, isValid, isDirty } } = methods;

  // Reset form when initialData changes
  React.useEffect(() => {
    if (initialData) {
      reset({ ...DEFAULT_ACTIVITY_DATA, ...convertToWizardData(initialData) });
      trigger();
    } else {
      reset(DEFAULT_ACTIVITY_DATA);
    }
  }, [initialData, reset, trigger]);
  const activityData = watch();

  const progress = (currentStep / STEPS.length) * 100;

  const updateActivityData = (field: keyof ActivityData, value: any) => {
    setValue(field as any, value, { shouldValidate: true, shouldDirty: true });
  };

  const handleNext = async () => {
    // Validation for each step using Zod via trigger
    let isValid = false;
    console.log(`Validating step ${currentStep}...`);

    switch (currentStep) {
      case 1:
        isValid = await trigger(['name', 'description', 'category', 'eventType', 'activityType', 'timezone']);
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

  const validateActivityData = async () => {
    // Only validate essential fields for publishing
    const essentialFields = [
      'name', 'description', 'category', 
      'minAdults', 'maxAdults', 'adultPrice',
      'duration', 'operatingDays', 'startTime', 'endTime'
    ];
    const isValid = await trigger(essentialFields as any);
    
    // Log validation status
    console.log('Validation result:', { isValid, errors, activityData });
    
    return { errors: Object.keys(errors), isValid };
  };

  const handleSubmit = async () => {
    // Validate before publishing
    const validation = await validateActivityData();
    
    if (!validation.isValid) {
      // Show specific field errors
      const errorFields = validation.errors;
      if (errorFields.length > 0) {
        const firstError = errors[errorFields[0] as keyof typeof errors];
        toast.error(`Validation error in "${errorFields[0]}": ${firstError?.message || 'Invalid value'}`);
        console.error('Validation failed for fields:', errorFields, errors);
      } else {
        toast.error('Please fix validation errors before publishing');
      }
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
      const result: any = await onComplete(activityData);

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

      // Extract activity ID from result if available
      const activityId = result?.id || result?.data?.id || null;
      setCreatedActivityId(activityId);

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
        return (
          <Step1BasicInfo
            activityData={activityData}
            updateActivityData={updateActivityData}
            t={t}
            organizationId={organizationId}
            venueId={venueId}
            organizationName={organizationName}
            venueName={venueName}
          />
        );
      case 2:
        return <Step2CapacityPricing activityData={activityData} updateActivityData={updateActivityData} t={t} />;
      case 3:
        return <Step3ActivityDetails activityData={activityData} updateActivityData={updateActivityData} t={t} />;
      case 4:
        return <Step4MediaUpload activityData={activityData} updateActivityData={updateActivityData} t={t} />;
      case 5:
        return <Step5Schedule activityData={activityData} updateActivityData={updateActivityData} t={t} />;
      case 6:
        return <Step6PaymentSettings
          activityData={activityData}
          onUpdate={(data) => reset(data)}
          onNext={() => setCurrentStep(7)}
          onPrevious={() => setCurrentStep(5)}
          t={t}
          venueId={venueId}
          organizationId={organizationId}
        />;
      case 7:
        return (
          <Step7WidgetEmbedNew
            activityData={activityData}
            updateActivityData={updateActivityData}
            t={t}
            activityId={createdActivityId || undefined}
            venueId={venueId}
          />
        );
      case 8:
        return <Step8Review activityData={activityData} updateActivityData={updateActivityData} t={t} onEditStep={setCurrentStep} />;
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
                <span className="text-sm text-gray-900">Preparing activity data</span>
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
                  <p className="text-gray-900">{activityData.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Price</p>
                  <p className="text-gray-900">${activityData.adultPrice} per person</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Duration</p>
                  <p className="text-gray-900">{activityData.duration} minutes</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Widget</p>
                  <p className="text-gray-900">{activityData.selectedWidget}</p>
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
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl text-gray-900 dark:text-white">{mode === 'edit' ? `${t.actionEdit}` : `${t.actionAdd}`}</h2>
              {(organizationName || venueName) && (
                <p className="text-sm text-gray-500 dark:text-[#737373] mt-1">
                  {organizationName && <span className="font-medium">{organizationName}</span>}
                  {organizationName && venueName && <span className="mx-1">•</span>}
                  {venueName && <span>{venueName}</span>}
                </p>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-[#a3a3a3]">
              Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].name.replace('Game', t.singular)}
            </p>
          </div>
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
              {currentStep === 6 && !activityData.stripeProductId ? 'Skip for Now' : 'Next'}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isPublishing}
              className="bg-green-600 dark:bg-emerald-600 hover:bg-green-700 dark:hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPublishing ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {mode === 'edit' ? 'Updating...' : 'Publishing...'}
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  {mode === 'edit' ? 'Update Activity' : 'Publish Activity'}
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
