import React, { useState, useEffect, Component, ErrorInfo } from 'react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Card, CardContent } from '../ui/card';
import { Check, ChevronLeft, ChevronRight, X, Loader2, AlertTriangle } from 'lucide-react';
import Step1Basics from './steps/Step1Basics';
import Step2Logistics from './steps/Step2Logistics';
import Step3MediaUpload from './steps/Step3MediaUpload';
import Step4Review from './steps/Step4Review';
import { GameData } from './types';
import { useTerminology } from '../../hooks/useTerminology';
import { toast } from 'sonner';
import { ServiceItemManager } from '../../services/ServiceItemManager';
import { useServiceItems } from '../../hooks/useServiceItems';
import { useQueryClient } from '@tanstack/react-query';

interface AddServiceItemWizardProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
  venueType?: 'escape_room' | 'play_center' | 'event_venue';
  venueId: string;
}

const STEPS = [
  { id: 1, title: 'The Basics', description: 'Name, Category, Details' },
  { id: 2, title: 'Logistics', description: 'Pricing, Capacity, Schedule' },
  { id: 3, title: 'Media', description: 'Photos & Video' },
  { id: 4, title: 'Review', description: 'Final Check' },
];

// Error Boundary Component
class SafeStepWrapper extends Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Step Render Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center text-red-500 bg-red-50 rounded-lg border border-red-200">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
          <p className="text-sm text-gray-600 mb-4">There was an error rendering this step.</p>
          <pre className="text-xs bg-white p-2 rounded text-left overflow-auto max-h-32 border">
            {this.state.error?.message}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function AddServiceItemWizard({
  isOpen,
  onClose,
  initialData,
  venueType = 'escape_room',
  venueId
}: AddServiceItemWizardProps) {
  if (!isOpen) return null;

  if (!venueId) {
    console.error("AddServiceItemWizard: Missing venueId");
    return null;
  }

  const [currentStep, setCurrentStep] = useState(1);
  const t = useTerminology(venueType);
  const { refreshServiceItems } = useServiceItems(venueId);
  const queryClient = useQueryClient();

  // Initial State
  const [gameData, setGameData] = useState<GameData>({
    name: '',
    tagline: '',
    description: '',
    category: '',
    gameType: 'physical',
    eventType: 'public',
    duration: 60,
    difficulty: 3,
    minAge: 12,
    successRate: 50,
    minAdults: 2,
    maxAdults: 8,
    minChildren: 0,
    maxChildren: 4,
    adultPrice: 30,
    childPrice: 25,
    operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    startTime: '10:00',
    endTime: '22:00',
    slotInterval: 60,
    advanceBooking: 30,
    language: ['English'],
    location: '',
    accessibility: {
      wheelchairAccessible: false,
      strollerAccessible: false,
    },
    faqs: [],
    cancellationPolicies: [],
    customCapacityFields: [],
    groupDiscount: false,
    dynamicPricing: false,
    peakPricing: {
      enabled: false,
      weekdayPeakPrice: 0,
      weekendPeakPrice: 0,
      peakStartTime: '',
      peakEndTime: ''
    },
    groupTiers: [],
    customHoursEnabled: false,
    customHours: {},
    customDates: [],
    blockedDates: [],
    coverImage: '',
    galleryImages: [],
    videos: [],
    selectedWidget: 'calendar-single-event',
    activityDetails: '',
    additionalInformation: '',
    requiresWaiver: false,
    selectedWaiver: null,
    cancellationWindow: 24,
    specialInstructions: '',
    slug: '',
    stripeProductId: undefined,
    stripePriceId: undefined,
    stripePrices: [],
    stripeCheckoutUrl: undefined,
    stripeSyncStatus: undefined,
    stripeLastSync: undefined,
    checkoutEnabled: false,
    checkoutConnectedAt: undefined
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load initial data if editing
  useEffect(() => {
    if (initialData) {
      setGameData({
        ...gameData,
        ...initialData,
        // Ensure arrays are initialized
        operatingDays: initialData.operatingDays || [],
        language: initialData.language || ['English'],
        faqs: initialData.faqs || [],
        cancellationPolicies: initialData.cancellationPolicies || [],
        customCapacityFields: initialData.customCapacityFields || [],
        galleryImages: initialData.galleryImages || [],
        videos: initialData.videos || [],
        groupTiers: initialData.groupTiers || [],
        customDates: initialData.customDates || [],
        blockedDates: initialData.blockedDates || [],
        stripePrices: initialData.stripePrices || [],
      });
    }
  }, [initialData]);

  const updateGameData = (field: keyof GameData, value: any) => {
    setGameData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handlePublish();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handlePublish = async () => {
    setIsSubmitting(true);
    try {
      // Exclude difficulty from spread to avoid type mismatch (number vs string)
      const { difficulty, ...restGameData } = gameData;

      const mappedDifficulty = ['Easy', 'Medium', 'Hard', 'Expert'][Math.min(Math.max(0, (difficulty || 3) - 1), 3)] as "Easy" | "Medium" | "Hard" | "Expert";

      const dataToSave = {
        ...restGameData,
        venue_id: venueId,
        // Map 'minAdults'/'maxAdults' to 'min_players'/'max_players' for backend
        min_players: gameData.minAdults,
        max_players: gameData.maxAdults,
        price: gameData.adultPrice,
        difficulty: mappedDifficulty, // Top level if required
        status: 'active' as const,
        settings: {
          tagline: gameData.tagline,
          gameType: gameData.gameType,
          eventType: gameData.eventType,
          minAge: gameData.minAge,
          successRate: gameData.successRate,
          difficulty: mappedDifficulty, // In settings as well
          language: gameData.language,
          location: gameData.location,
          accessibility: gameData.accessibility,
          faqs: gameData.faqs,
          cancellationPolicies: gameData.cancellationPolicies,
          customCapacityFields: gameData.customCapacityFields,
          seoTitle: gameData.name, // Fallback
          seoDescription: gameData.description, // Fallback
          slug: gameData.slug,
          videoUrl: gameData.videos[0] || '', // Fallback to first video
          images: [gameData.coverImage, ...gameData.galleryImages].filter(Boolean)
        }
      };

      if (initialData?.id) {
        await ServiceItemManager.updateServiceItem(initialData.id, dataToSave);
        toast.success(`${t.singular} updated successfully!`);
      } else {
        await ServiceItemManager.createServiceItem(dataToSave);
        toast.success(`${t.singular} published successfully!`);
      }

      // Invalidate queries to refresh the grid
      queryClient.invalidateQueries({ queryKey: ['service-items'] });
      if (refreshServiceItems) refreshServiceItems();

      onClose();
    } catch (error: any) {
      console.error('Error publishing:', error);
      toast.error(error.message || 'Failed to publish');
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-4 overflow-y-auto">
      <div className="bg-white md:rounded-xl shadow-2xl w-full max-w-4xl h-full md:h-auto md:max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b sticky top-0 bg-white z-10 md:rounded-t-xl">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              {initialData ? `Edit ${t.singular}` : `Add New ${t.singular}`}
            </h2>
            <p className="text-xs md:text-sm text-gray-500">
              Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].title}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-100 h-1 md:h-2">
          <div
            className="bg-blue-600 h-full transition-all duration-300 ease-in-out"
            style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50/50">
          <SafeStepWrapper>
            {currentStep === 1 && (
              <Step1Basics gameData={gameData} updateGameData={updateGameData} t={t} />
            )}
            {currentStep === 2 && (
              <Step2Logistics gameData={gameData} updateGameData={updateGameData} t={t} />
            )}
            {currentStep === 3 && (
              <Step3MediaUpload gameData={gameData} updateGameData={updateGameData} t={t} />
            )}
            {currentStep === 4 && (
              <Step4Review
                gameData={gameData}
                updateGameData={updateGameData}
                t={t}
                onEditStep={(step) => setCurrentStep(step)}
              />
            )}
          </SafeStepWrapper>
        </div>

        {/* Footer */}
        <div className="p-4 md:p-6 border-t bg-white flex justify-between items-center md:rounded-b-xl sticky bottom-0 z-10">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || isSubmitting}
            className="flex items-center"
          >
            <ChevronLeft className="w-4 h-4 mr-2" /> Back
          </Button>

          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose} disabled={isSubmitting} className="hidden md:inline-flex">
              Cancel
            </Button>
            <Button
              onClick={handleNext}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white min-w-[100px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {initialData ? 'Saving...' : 'Publishing...'}
                </>
              ) : (
                <>
                  {currentStep === STEPS.length ? (initialData ? 'Save Changes' : 'Publish') : 'Next'}
                  {currentStep !== STEPS.length && <ChevronRight className="w-4 h-4 ml-2" />}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
