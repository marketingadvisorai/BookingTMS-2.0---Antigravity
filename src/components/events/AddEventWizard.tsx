import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Check, Info, Users, Sparkles, ImageIcon, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { ActivityData } from './types';
import Step1BasicInfo from './steps/Step1BasicInfo';
import Step2CapacityPricing from './steps/Step2CapacityPricing';
import Step3ActivityDetails from './steps/Step3ActivityDetails';
import Step4MediaUpload from './steps/Step4MediaUpload';
import Step5Schedule from './steps/Step5Schedule';
import Step6Review from './steps/Step6Review';

interface AddActivityWizardProps {
  onComplete: (activityData: any) => void;
  onCancel: () => void;
  initialData?: ActivityData;
  mode?: 'create' | 'edit';
}

const STEPS = [
  { id: 1, name: 'Basic Info', icon: Info },
  { id: 2, name: 'Capacity & Pricing', icon: Users },
  { id: 3, name: 'Activity Details', icon: Sparkles },
  { id: 4, name: 'Media Upload', icon: ImageIcon },
  { id: 5, name: 'Schedule', icon: Calendar },
  { id: 6, name: 'Review & Publish', icon: Check }
];

const uploadActivityImage = async (activityId: string, file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${activityId}/${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('activity-images')
    .upload(filePath, file);

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage
    .from('activity-images')
    .getPublicUrl(filePath);

  return data.publicUrl;
};

export default function AddEventWizard({ onComplete, onCancel, initialData, mode = 'create' }: AddActivityWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [activityData, setActivityData] = useState<ActivityData>(initialData || {
    name: '',
    description: '',
    category: '',
    tagline: '',
    eventType: 'public',
    activityType: 'physical',
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
    location: '',
    activityDetails: '',
    additionalInformation: '',
    faqs: [],
    cancellationPolicies: [],
    accessibility: {
      wheelchairAccessible: false,
      strollerAccessible: false,
    },
    operatingDays: ['Saturday', 'Sunday'],
    startTime: '09:00',
    endTime: '22:00',
    slotInterval: 60,
    advanceBooking: 30,
    customHoursEnabled: false,
    customHours: {},
    customDates: [],
    blockedDates: [],
    coverImage: '',
    galleryImages: [],
    videos: [],
    waivers: [],
    selectedWidget: 'calendar-single',
  });

  const updateActivityData = (field: string, value: any) => {
    setActivityData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    // Validation logic could go here
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
    onComplete(activityData);
    toast.success('Activity created successfully!');
  };

  const renderStepContent = () => {
    const commonProps = {
      activityData,
      updateActivityData,
      t: { singular: 'Activity', plural: 'Activities' } // Mock translation
    };

    switch (currentStep) {
      case 1:
        return <Step1BasicInfo {...commonProps} />;
      case 2:
        return <Step2CapacityPricing {...commonProps} />;
      case 3:
        return <Step3ActivityDetails {...commonProps} />;
      case 4:
        return <Step4MediaUpload {...commonProps} />;
      case 5:
        return <Step5Schedule {...commonProps} />;
      case 6:
        return <Step6Review activityData={activityData} onEditStep={setCurrentStep} />;
      default:
        return null;
    }
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#161616]">
      {/* Header with Progress */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-[#2a2a2a]">
        <div className="mb-4">
          <h2 className="text-2xl text-gray-900 dark:text-white">{mode === 'edit' ? 'Edit Activity' : 'Add New Activity'}</h2>
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
                <div className="flex flex-col items-center relative z-10">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${isCurrent
                        ? 'bg-blue-600 dark:bg-[#4f46e5] text-white ring-4 ring-blue-100 dark:ring-[#4f46e5]/20'
                        : isCompleted
                          ? 'bg-green-600 dark:bg-emerald-600 text-white'
                          : 'bg-white dark:bg-[#1e1e1e] border-2 border-gray-200 dark:border-[#2a2a2a] text-gray-400 dark:text-[#737373]'
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
              Publish Activity
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
