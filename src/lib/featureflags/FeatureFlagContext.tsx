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
    id: 'sso',
    name: 'Single Sign-On',
    description: 'SAML/OAuth SSO support',
    enabled: false,
    category: 'Security'
  },
  {
    id: 'email',
    name: 'Email',
    description: 'Core email messaging features',
    enabled: true,
    category: 'Communication'
  },
  {
    id: 'marketing',
    name: 'Marketing',
    description: 'Enable marketing tools and automations',
    enabled: true,
    category: 'Marketing'
  },
  {
    id: 'campaigns',
    name: 'Campaigns',
    description: 'Run marketing and engagement campaigns',
    enabled: true,
    category: 'Marketing'
  },
  {
    id: 'phone-call-agent',
    name: 'Phone Call Agent',
    description: 'Enable phone-based agent assistance',
    enabled: true,
    category: 'Agents'
  },
  {
    id: 'booking-agent',
    name: 'Booking Agent',
    description: 'Enable agent-assisted booking flows',
    enabled: true,
    category: 'Agents'
  },
  {
    id: 'booking-widgets',
    name: 'Booking Widgets',
    description: 'Embed booking widgets across channels',
    enabled: true,
    category: 'Core'
  },
  {
    id: 'inbox',
    name: 'Inbox',
    description: 'Unified customer communication inbox',
    enabled: true,
    category: 'Communication'
  },
  {
    id: 'staffs',
    name: 'Staffs',
    description: 'Manage staff accounts and permissions',
    enabled: true,
    category: 'Operations'
  },
  {
    id: 'reports',
    name: 'Reports',
    description: 'Access reporting and insights',
    enabled: true,
    category: 'Analytics'
  },
  {
    id: 'media',
    name: 'Media',
    description: 'Manage media assets and galleries',
    enabled: true,
    category: 'Content'
  },
  {
    id: 'waivers',
    name: 'Waivers',
    description: 'Enable digital waiver collection',
    enabled: true,
    category: 'Operations'
  },
  {
    id: 'payments-history',
    name: 'Payments & History',
    description: 'View and manage payments and history',
    enabled: true,
    category: 'Billing'
  },
  {
    id: 'promotions',
    name: 'Promotions',
    description: 'Create and manage promotions and offers',
    enabled: true,
    category: 'Marketing'
  },
  {
    id: 'gift-cards',
    name: 'Gift Cards',
    description: 'Sell and manage gift cards',
    enabled: true,
    category: 'Billing'
  },
  {
    id: 'venues',
    name: 'Venues',
    description: 'Manage venues and locations',
    enabled: true,
    category: 'Core'
  },
  {
    id: 'events',
    name: 'Events',
    description: 'Manage events and experiences',
    enabled: true,
    category: 'Core'
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
