import React, { createContext, useContext, useState, ReactNode } from 'react';

// Feature flag interface
export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category?: string;
}

// Context interface
interface FeatureFlagContextType {
  featureFlags: FeatureFlag[];
  toggleFeature: (featureId: string) => void;
  isFeatureEnabled: (featureId: string) => boolean;
}

// Default feature flags
const defaultFeatureFlags: FeatureFlag[] = [
  {
    id: 'multi-tenant',
    name: 'Multi-Tenant',
    description: 'Enable multi-tenant organization support',
    enabled: true,
    category: 'Platform'
  },
  {
    id: 'advanced-analytics',
    name: 'Advanced Analytics',
    description: 'Enable advanced analytics and reporting',
    enabled: true,
    category: 'Analytics'
  },
  {
    id: 'ai-agents',
    name: 'AI Agents',
    description: 'Enable AI-powered booking assistants',
    enabled: true,
    category: 'AI'
  },
  {
    id: 'custom-branding',
    name: 'Custom Branding',
    description: 'Allow organizations to customize branding',
    enabled: false,
    category: 'Customization'
  },
  {
    id: 'white-label',
    name: 'White Label',
    description: 'Full white-label solution',
    enabled: false,
    category: 'Enterprise'
  },
  {
    id: 'api-access',
    name: 'API Access',
    description: 'Enable REST API for integrations',
    enabled: true,
    category: 'Integration'
  },
  {
    id: 'webhooks',
    name: 'Webhooks',
    description: 'Real-time event webhooks',
    enabled: false,
    category: 'Integration'
  },
  {
    id: 'sso',
    name: 'Single Sign-On',
    description: 'SAML/OAuth SSO support',
    enabled: false,
    category: 'Security'
  }
];

// Create context
const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined);

// Provider component
export const FeatureFlagProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>(defaultFeatureFlags);

  const toggleFeature = (featureId: string) => {
    setFeatureFlags(prev =>
      prev.map(flag =>
        flag.id === featureId
          ? { ...flag, enabled: !flag.enabled }
          : flag
      )
    );
  };

  const isFeatureEnabled = (featureId: string): boolean => {
    const feature = featureFlags.find(f => f.id === featureId);
    return feature?.enabled ?? false;
  };

  return (
    <FeatureFlagContext.Provider value={{ featureFlags, toggleFeature, isFeatureEnabled }}>
      {children}
    </FeatureFlagContext.Provider>
  );
};

// Custom hook
export const useFeatureFlags = (): FeatureFlagContextType => {
  const context = useContext(FeatureFlagContext);
  if (!context) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagProvider');
  }
  return context;
};
