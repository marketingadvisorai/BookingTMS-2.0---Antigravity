import { createContext, useContext, useState, ReactNode } from 'react';

export interface WidgetFeatureConfig {
  enablePromoCode: boolean;
  enableGiftCard: boolean;
  showSecuredBadge: boolean;
  showHealthSafety: boolean;
  enableVeteranDiscount: boolean;
  widgetTitle?: string;
  widgetDescription?: string;
  cancellationPolicy?: string;
}

interface WidgetConfigContextType {
  featureConfig: WidgetFeatureConfig;
  updateFeatureConfig: (config: Partial<WidgetFeatureConfig>) => void;
}

const defaultFeatureConfig: WidgetFeatureConfig = {
  enablePromoCode: true,
  enableGiftCard: true,
  showSecuredBadge: true,
  showHealthSafety: true,
  enableVeteranDiscount: false,
  widgetTitle: '',
  widgetDescription: '',
  cancellationPolicy: 'Cash refunds are not available. If you are unable to keep your scheduled reservation, please contact us. We can rebook you to a different date and/or time or issue a refund in the form of a gift card.',
};

const WidgetConfigContext = createContext<WidgetConfigContextType | undefined>(undefined);

export function WidgetConfigProvider({ children }: { children: ReactNode }) {
  const [featureConfig, setFeatureConfig] = useState<WidgetFeatureConfig>(defaultFeatureConfig);

  const updateFeatureConfig = (config: Partial<WidgetFeatureConfig>) => {
    setFeatureConfig((prev) => ({ ...prev, ...config }));
  };

  return (
    <WidgetConfigContext.Provider value={{ featureConfig, updateFeatureConfig }}>
      {children}
    </WidgetConfigContext.Provider>
  );
}

export function useWidgetConfig() {
  const context = useContext(WidgetConfigContext);
  if (!context) {
    // Return default config if context is not available
    return {
      featureConfig: defaultFeatureConfig,
      updateFeatureConfig: () => {},
    };
  }
  return context;
}
