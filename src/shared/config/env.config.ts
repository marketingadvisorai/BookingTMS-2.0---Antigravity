/**
 * Environment Configuration
 * Centralized environment variable management
 * @module shared/config
 */

/**
 * Environment types
 */
export enum Environment {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  TEST = 'test',
}

/**
 * Environment configuration interface
 */
interface EnvConfig {
  // Application
  NODE_ENV: Environment;
  APP_NAME: string;
  APP_VERSION: string;
  APP_URL: string;
  API_URL: string;
  
  // Supabase
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  
  // Stripe
  STRIPE_PUBLIC_KEY: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  
  // SendGrid
  SENDGRID_API_KEY?: string;
  SENDGRID_FROM_EMAIL?: string;
  
  // Twilio
  TWILIO_ACCOUNT_SID?: string;
  TWILIO_AUTH_TOKEN?: string;
  TWILIO_PHONE_NUMBER?: string;
  
  // OpenAI
  OPENAI_API_KEY?: string;
  OPENAI_ORG_ID?: string;
  
  // Feature Flags
  ENABLE_AI_FEATURES: boolean;
  ENABLE_SMS_NOTIFICATIONS: boolean;
  ENABLE_EMAIL_NOTIFICATIONS: boolean;
  ENABLE_ANALYTICS: boolean;
  
  // Security
  JWT_SECRET?: string;
  ENCRYPTION_KEY?: string;
  SESSION_TIMEOUT: number;
  
  // Performance
  CACHE_TTL: number;
  API_TIMEOUT: number;
  MAX_UPLOAD_SIZE: number;
}

/**
 * Get environment variable with type safety
 */
function getEnvVar(key: string, defaultValue?: string): string {
  const value = import.meta.env[`VITE_${key}`] || process.env[key];
  
  if (value === undefined && defaultValue === undefined) {
    console.warn(`Environment variable ${key} is not defined`);
    return '';
  }
  
  return value || defaultValue || '';
}

/**
 * Get boolean environment variable
 */
function getBooleanEnvVar(key: string, defaultValue: boolean = false): boolean {
  const value = getEnvVar(key);
  
  if (value === '') return defaultValue;
  
  return value.toLowerCase() === 'true' || value === '1';
}

/**
 * Get number environment variable
 */
function getNumberEnvVar(key: string, defaultValue: number): number {
  const value = getEnvVar(key);
  
  if (value === '') return defaultValue;
  
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Get current environment
 */
function getCurrentEnvironment(): Environment {
  const env = getEnvVar('NODE_ENV', 'development').toLowerCase();
  
  switch (env) {
    case 'production':
      return Environment.PRODUCTION;
    case 'staging':
      return Environment.STAGING;
    case 'test':
      return Environment.TEST;
    default:
      return Environment.DEVELOPMENT;
  }
}

/**
 * Validate required environment variables
 */
function validateEnvConfig(): void {
  const required = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'STRIPE_PUBLIC_KEY',
  ];
  
  const missing = required.filter(key => !getEnvVar(key));
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }
}

/**
 * Environment configuration object
 */
export const envConfig: EnvConfig = {
  // Application
  NODE_ENV: getCurrentEnvironment(),
  APP_NAME: getEnvVar('APP_NAME', 'BookingTMS'),
  APP_VERSION: getEnvVar('APP_VERSION', '0.1.7'),
  APP_URL: getEnvVar('APP_URL', 'http://localhost:5173'),
  API_URL: getEnvVar('API_URL', 'http://localhost:5173/api'),
  
  // Supabase
  SUPABASE_URL: getEnvVar('SUPABASE_URL'),
  SUPABASE_ANON_KEY: getEnvVar('SUPABASE_ANON_KEY'),
  SUPABASE_SERVICE_ROLE_KEY: getEnvVar('SUPABASE_SERVICE_ROLE_KEY'),
  
  // Stripe
  STRIPE_PUBLIC_KEY: getEnvVar('STRIPE_PUBLIC_KEY'),
  STRIPE_SECRET_KEY: getEnvVar('STRIPE_SECRET_KEY'),
  STRIPE_WEBHOOK_SECRET: getEnvVar('STRIPE_WEBHOOK_SECRET'),
  
  // SendGrid
  SENDGRID_API_KEY: getEnvVar('SENDGRID_API_KEY'),
  SENDGRID_FROM_EMAIL: getEnvVar('SENDGRID_FROM_EMAIL'),
  
  // Twilio
  TWILIO_ACCOUNT_SID: getEnvVar('TWILIO_ACCOUNT_SID'),
  TWILIO_AUTH_TOKEN: getEnvVar('TWILIO_AUTH_TOKEN'),
  TWILIO_PHONE_NUMBER: getEnvVar('TWILIO_PHONE_NUMBER'),
  
  // OpenAI
  OPENAI_API_KEY: getEnvVar('OPENAI_API_KEY'),
  OPENAI_ORG_ID: getEnvVar('OPENAI_ORG_ID'),
  
  // Feature Flags
  ENABLE_AI_FEATURES: getBooleanEnvVar('ENABLE_AI_FEATURES', false),
  ENABLE_SMS_NOTIFICATIONS: getBooleanEnvVar('ENABLE_SMS_NOTIFICATIONS', false),
  ENABLE_EMAIL_NOTIFICATIONS: getBooleanEnvVar('ENABLE_EMAIL_NOTIFICATIONS', true),
  ENABLE_ANALYTICS: getBooleanEnvVar('ENABLE_ANALYTICS', true),
  
  // Security
  JWT_SECRET: getEnvVar('JWT_SECRET'),
  ENCRYPTION_KEY: getEnvVar('ENCRYPTION_KEY'),
  SESSION_TIMEOUT: getNumberEnvVar('SESSION_TIMEOUT', 3600000), // 1 hour
  
  // Performance
  CACHE_TTL: getNumberEnvVar('CACHE_TTL', 300000), // 5 minutes
  API_TIMEOUT: getNumberEnvVar('API_TIMEOUT', 30000), // 30 seconds
  MAX_UPLOAD_SIZE: getNumberEnvVar('MAX_UPLOAD_SIZE', 10485760), // 10MB
};

/**
 * Check if running in development
 */
export const isDevelopment = (): boolean => {
  return envConfig.NODE_ENV === Environment.DEVELOPMENT;
};

/**
 * Check if running in production
 */
export const isProduction = (): boolean => {
  return envConfig.NODE_ENV === Environment.PRODUCTION;
};

/**
 * Check if running in staging
 */
export const isStaging = (): boolean => {
  return envConfig.NODE_ENV === Environment.STAGING;
};

/**
 * Check if running in test
 */
export const isTest = (): boolean => {
  return envConfig.NODE_ENV === Environment.TEST;
};

/**
 * Initialize and validate environment configuration
 */
export function initializeEnvConfig(): void {
  try {
    validateEnvConfig();
    
    if (isDevelopment()) {
      console.log('Environment configuration loaded:', {
        NODE_ENV: envConfig.NODE_ENV,
        APP_NAME: envConfig.APP_NAME,
        APP_VERSION: envConfig.APP_VERSION,
        SUPABASE_URL: envConfig.SUPABASE_URL ? '✓' : '✗',
        STRIPE_PUBLIC_KEY: envConfig.STRIPE_PUBLIC_KEY ? '✓' : '✗',
      });
    }
  } catch (error) {
    console.error('Failed to initialize environment configuration:', error);
    throw error;
  }
}

// Auto-initialize on import
initializeEnvConfig();
