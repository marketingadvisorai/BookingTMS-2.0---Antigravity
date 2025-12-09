/**
 * Secrets Tab Types
 * @module components/backend/secrets/types
 */

export interface SecretField {
  key: string;
  label: string;
  placeholder: string;
  type: 'secret' | 'public';
  required?: boolean;
}

export interface SecretCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: 'green' | 'purple' | 'blue' | 'yellow' | 'red';
  fields: SecretField[];
}

export interface SecretStatus {
  isConfigured: boolean;
  validationStatus: 'valid' | 'invalid' | 'unknown';
  maskedValue?: string;
  lastValidated?: string;
}

export interface SecretsState {
  [key: string]: string;
}

export interface CategoryStatus {
  isConfigured: boolean;
  validationStatus: 'valid' | 'invalid' | 'unknown' | 'partial';
  configuredCount: number;
  totalCount: number;
}

// Secret categories configuration
export const SECRET_CATEGORIES: SecretCategory[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Payment processing API keys',
    icon: 'CreditCard',
    color: 'purple',
    fields: [
      {
        key: 'STRIPE_PUBLISHABLE_KEY',
        label: 'Publishable Key',
        placeholder: 'pk_live_...',
        type: 'public',
        required: true,
      },
      {
        key: 'STRIPE_SECRET_KEY',
        label: 'Secret Key',
        placeholder: 'sk_live_...',
        type: 'secret',
        required: true,
      },
      {
        key: 'STRIPE_WEBHOOK_SECRET',
        label: 'Webhook Secret',
        placeholder: 'whsec_...',
        type: 'secret',
        required: true,
      },
    ],
  },
  {
    id: 'llm',
    name: 'LLM Providers',
    description: 'AI/Language Model API keys',
    icon: 'Brain',
    color: 'blue',
    fields: [
      {
        key: 'OPENAI_API_KEY',
        label: 'OpenAI API Key',
        placeholder: 'sk-...',
        type: 'secret',
      },
      {
        key: 'ANTHROPIC_API_KEY',
        label: 'Anthropic API Key',
        placeholder: 'sk-ant-...',
        type: 'secret',
      },
      {
        key: 'GOOGLE_AI_API_KEY',
        label: 'Google AI API Key',
        placeholder: 'AIza...',
        type: 'secret',
      },
    ],
  },
  {
    id: 'email',
    name: 'Email Service',
    description: 'Email delivery API keys',
    icon: 'Mail',
    color: 'green',
    fields: [
      {
        key: 'SENDGRID_API_KEY',
        label: 'SendGrid API Key',
        placeholder: 'SG...',
        type: 'secret',
      },
    ],
  },
  {
    id: 'sms',
    name: 'SMS Service',
    description: 'SMS delivery credentials',
    icon: 'MessageSquare',
    color: 'yellow',
    fields: [
      {
        key: 'TWILIO_ACCOUNT_SID',
        label: 'Twilio Account SID',
        placeholder: 'AC...',
        type: 'secret',
      },
      {
        key: 'TWILIO_AUTH_TOKEN',
        label: 'Twilio Auth Token',
        placeholder: 'Auth token...',
        type: 'secret',
      },
      {
        key: 'TWILIO_PHONE_NUMBER',
        label: 'Twilio Phone Number',
        placeholder: '+1...',
        type: 'public',
      },
    ],
  },
];
