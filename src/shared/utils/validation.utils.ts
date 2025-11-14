/**
 * Validation Utilities
 * Common validation functions
 * @module shared/utils
 */

/**
 * Email validation regex
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Phone number regex (international format)
 */
const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;

/**
 * UUID validation regex
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * URL validation regex
 */
const URL_REGEX = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

/**
 * Validate email address
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  return EMAIL_REGEX.test(email.trim());
}

/**
 * Validate phone number
 */
export function isValidPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  return PHONE_REGEX.test(cleaned);
}

/**
 * Validate UUID
 */
export function isValidUUID(uuid: string): boolean {
  if (!uuid || typeof uuid !== 'string') return false;
  return UUID_REGEX.test(uuid);
}

/**
 * Validate URL
 */
export function isValidURL(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  return URL_REGEX.test(url);
}

/**
 * Validate date
 */
export function isValidDate(date: any): boolean {
  if (!date) return false;
  const d = new Date(date);
  return d instanceof Date && !isNaN(d.getTime());
}

/**
 * Validate date is not in the past
 */
export function isNotPastDate(date: Date | string): boolean {
  const d = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d >= today;
}

/**
 * Validate string length
 */
export function isValidLength(
  str: string,
  min: number,
  max?: number
): boolean {
  if (!str || typeof str !== 'string') return false;
  const length = str.trim().length;
  if (length < min) return false;
  if (max !== undefined && length > max) return false;
  return true;
}

/**
 * Validate number range
 */
export function isInRange(
  num: number,
  min: number,
  max: number
): boolean {
  if (typeof num !== 'number' || isNaN(num)) return false;
  return num >= min && num <= max;
}

/**
 * Validate positive number
 */
export function isPositiveNumber(num: number): boolean {
  return typeof num === 'number' && !isNaN(num) && num > 0;
}

/**
 * Validate non-negative number
 */
export function isNonNegativeNumber(num: number): boolean {
  return typeof num === 'number' && !isNaN(num) && num >= 0;
}

/**
 * Validate integer
 */
export function isInteger(num: number): boolean {
  return typeof num === 'number' && Number.isInteger(num);
}

/**
 * Validate required field
 */
export function isRequired(value: any): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

/**
 * Validate array
 */
export function isValidArray(arr: any, minLength: number = 0): boolean {
  return Array.isArray(arr) && arr.length >= minLength;
}

/**
 * Validate object
 */
export function isValidObject(obj: any): boolean {
  return obj !== null && typeof obj === 'object' && !Array.isArray(obj);
}

/**
 * Validate credit card number (Luhn algorithm)
 */
export function isValidCreditCard(cardNumber: string): boolean {
  if (!cardNumber || typeof cardNumber !== 'string') return false;
  
  const cleaned = cardNumber.replace(/\s/g, '');
  
  if (!/^\d{13,19}$/.test(cleaned)) return false;
  
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

/**
 * Validate postal code (US)
 */
export function isValidPostalCode(postalCode: string, country: string = 'US'): boolean {
  if (!postalCode || typeof postalCode !== 'string') return false;
  
  const patterns: Record<string, RegExp> = {
    US: /^\d{5}(-\d{4})?$/,
    CA: /^[A-Z]\d[A-Z] \d[A-Z]\d$/,
    UK: /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i,
  };
  
  const pattern = patterns[country.toUpperCase()];
  return pattern ? pattern.test(postalCode) : true;
}

/**
 * Validate time format (HH:MM)
 */
export function isValidTime(time: string): boolean {
  if (!time || typeof time !== 'string') return false;
  return /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/.test(time);
}

/**
 * Validate password strength
 */
export function isStrongPassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!password || typeof password !== 'string') {
    return { isValid: false, errors: ['Password is required'] };
  }
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize string (remove HTML tags)
 */
export function sanitizeString(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '').trim();
}

/**
 * Validate and sanitize input
 */
export function validateAndSanitize(
  value: string,
  options: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    sanitize?: boolean;
  } = {}
): { isValid: boolean; value: string; errors: string[] } {
  const errors: string[] = [];
  let sanitized = value;
  
  if (options.sanitize !== false) {
    sanitized = sanitizeString(value);
  }
  
  if (options.required && !isRequired(sanitized)) {
    errors.push('This field is required');
  }
  
  if (options.minLength && sanitized.length < options.minLength) {
    errors.push(`Minimum length is ${options.minLength} characters`);
  }
  
  if (options.maxLength && sanitized.length > options.maxLength) {
    errors.push(`Maximum length is ${options.maxLength} characters`);
  }
  
  if (options.pattern && !options.pattern.test(sanitized)) {
    errors.push('Invalid format');
  }
  
  return {
    isValid: errors.length === 0,
    value: sanitized,
    errors,
  };
}
