export interface VenueWidgetTicketType {
  id: string;
  name: string;
  description?: string;
  price: number;
}

export interface VenueWidgetQuestion {
  id: string;
  question: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect';
  options?: string[];
  required: boolean;
}

export interface VenueWidgetConfig {
  showSecuredBadge: boolean;
  showHealthSafety: boolean;
  enableVeteranDiscount: boolean;
  activities: Array<Record<string, unknown>>;
  ticketTypes: VenueWidgetTicketType[];
  additionalQuestions: VenueWidgetQuestion[];
  cancellationPolicy: string;
}

export const createDefaultVenueWidgetConfig = (): VenueWidgetConfig => ({
  showSecuredBadge: true,
  showHealthSafety: true,
  enableVeteranDiscount: false,
  activities: [],
  ticketTypes: [
    { id: 'player', name: 'Players', description: 'Ages 6 & Up', price: 30 },
  ],
  additionalQuestions: [],
  cancellationPolicy:
    'Cash refunds are not available. If you are unable to keep your scheduled reservation, please contact us.',
});

export const normalizeVenueWidgetConfig = (
  config?: Partial<VenueWidgetConfig>
): VenueWidgetConfig => {
  const defaults = createDefaultVenueWidgetConfig();

  return {
    showSecuredBadge:
      config?.showSecuredBadge ?? defaults.showSecuredBadge,
    showHealthSafety:
      config?.showHealthSafety ?? defaults.showHealthSafety,
    enableVeteranDiscount:
      config?.enableVeteranDiscount ?? defaults.enableVeteranDiscount,
    activities:
      config && Array.isArray(config.activities) ? config.activities : [],
    ticketTypes:
      config && Array.isArray(config.ticketTypes)
        ? config.ticketTypes.map((ticket) => ({ ...ticket }))
        : defaults.ticketTypes.map((ticket) => ({ ...ticket })),
    additionalQuestions:
      config && Array.isArray(config.additionalQuestions)
        ? config.additionalQuestions.map((question) => ({ ...question }))
        : [],
    cancellationPolicy:
      config?.cancellationPolicy ?? defaults.cancellationPolicy,
  };
};
