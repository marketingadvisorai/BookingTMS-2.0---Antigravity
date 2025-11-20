/**
 * Secrets Configuration
 * Centralized secret management for backend services
 * NEVER expose these values to frontend
 * @module backend/config
 */

/**
 * Backend secrets configuration
 * All sensitive API keys and credentials
 */
interface BackendSecrets {
  // Server
  port: number;
  nodeEnv: string;
  apiBaseUrl: string;
  
  // Supabase (Service Role - Full Access)
  supabase: {
    url: string;
    serviceRoleKey: string;
  };
  
  // Stripe (Secret Keys)
  stripe: {
    secretKey: string;
    webhookSecret: string;
  };
  
  // SendGrid (Email Service)
  sendgrid: {
    apiKey: string;
    fromEmail: string;
    fromName: string;
  };
  
  // Twilio (SMS Service)
  twilio: {
    accountSid: string;
    authToken: string;
    phoneNumber: string;
  };
  
  // OpenAI (AI Services)
  openai: {
    apiKey: string;
    orgId?: string;
    model: string;
  };
  
  // Security
  security: {
    jwtSecret: string;
    encryptionKey: string;
    allowedOrigins: string[];
    sessionTimeout: number;
  };
  
  // Rate Limiting
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
}

/**
 * Get environment variable with validation
 */
function getEnvVar(key: string, required: boolean = true): string {
  const value = process.env[key];
  
  if (required && !value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  
  return value || '';
}

/**
 * Get number environment variable
 */
function getNumberEnvVar(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (!value) return defaultValue;
  
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Parse comma-separated list
 */
function parseList(value: string): string[] {
  return value.split(',').map(item => item.trim()).filter(Boolean);
}

/**
 * Backend secrets configuration object
 * CRITICAL: These values must NEVER be exposed to frontend
 */
export const backendSecrets: BackendSecrets = {
  // Server Configuration
  port: getNumberEnvVar('PORT', 3001),
  nodeEnv: getEnvVar('NODE_ENV', false) || 'development',
  apiBaseUrl: getEnvVar('API_BASE_URL', false) || 'http://localhost:3001',
  
  // Supabase Service Role (Full Database Access)
  supabase: {
    url: getEnvVar('SUPABASE_URL'),
    serviceRoleKey: getEnvVar('SUPABASE_SERVICE_ROLE_KEY'),
  },
  
  // Stripe Secret Keys
  stripe: {
    secretKey: getEnvVar('STRIPE_SECRET_KEY'),
    webhookSecret: getEnvVar('STRIPE_WEBHOOK_SECRET'),
  },
  
  // SendGrid Email Service
  sendgrid: {
    apiKey: getEnvVar('SENDGRID_API_KEY'),
    fromEmail: getEnvVar('SENDGRID_FROM_EMAIL', false) || 'noreply@bookingtms.com',
    fromName: getEnvVar('SENDGRID_FROM_NAME', false) || 'BookingTMS',
  },
  
  // Twilio SMS Service
  twilio: {
    accountSid: getEnvVar('TWILIO_ACCOUNT_SID'),
    authToken: getEnvVar('TWILIO_AUTH_TOKEN'),
    phoneNumber: getEnvVar('TWILIO_PHONE_NUMBER'),
  },
  
  // OpenAI AI Services
  openai: {
    apiKey: getEnvVar('OPENAI_API_KEY'),
    orgId: getEnvVar('OPENAI_ORG_ID', false),
    model: getEnvVar('OPENAI_MODEL', false) || 'gpt-4-turbo-preview',
  },
  
  // Security Configuration
  security: {
    jwtSecret: getEnvVar('JWT_SECRET'),
    encryptionKey: getEnvVar('ENCRYPTION_KEY'),
    allowedOrigins: parseList(
      getEnvVar('ALLOWED_ORIGINS', false) || 'http://localhost:5173'
    ),
    sessionTimeout: getNumberEnvVar('SESSION_TIMEOUT', 3600000), // 1 hour
  },
  
  // Rate Limiting
  rateLimit: {
    windowMs: getNumberEnvVar('RATE_LIMIT_WINDOW_MS', 900000), // 15 minutes
    maxRequests: getNumberEnvVar('RATE_LIMIT_MAX_REQUESTS', 100),
  },
};

/**
 * Validate all required secrets are present
 */
export function validateSecrets(): void {
  const required = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'SENDGRID_API_KEY',
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'TWILIO_PHONE_NUMBER',
    'OPENAI_API_KEY',
    'JWT_SECRET',
    'ENCRYPTION_KEY',
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.join('\n')}\n\n` +
      'Please create a .env.backend file with all required variables.'
    );
  }
  
  console.log('✅ All required secrets validated');
}

/**
 * Check if running in production
 */
export const isProduction = (): boolean => {
  return backendSecrets.nodeEnv === 'production';
};

/**
 * Check if running in development
 */
export const isDevelopment = (): boolean => {
  return backendSecrets.nodeEnv === 'development';
};

/**
 * Get safe config for logging (without secrets)
 */
export function getSafeConfig(): Record<string, any> {
  return {
    port: backendSecrets.port,
    nodeEnv: backendSecrets.nodeEnv,
    apiBaseUrl: backendSecrets.apiBaseUrl,
    supabaseUrl: backendSecrets.supabase.url,
    allowedOrigins: backendSecrets.security.allowedOrigins,
    rateLimit: backendSecrets.rateLimit,
  };
}

// Validate secrets on import
if (process.env.NODE_ENV !== 'test') {
  try {
    validateSecrets();
  } catch (error) {
    console.error('❌ Secret validation failed:', error);
    if (isProduction()) {
      process.exit(1);
    }
  }
}
