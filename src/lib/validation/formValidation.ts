/**
 * Form Validation Utilities
 * Validates user inputs for booking forms
 * Ensures data is in correct format for Stripe and database
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate email address (RFC 5322 compliant)
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim().length === 0) {
    return { isValid: false, error: 'Email is required' };
  }

  // RFC 5322 Official Standard email regex (simplified)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  // Additional checks
  const parts = email.trim().split('@');
  if (parts.length !== 2) {
    return { isValid: false, error: 'Invalid email format' };
  }

  const [local, domain] = parts;
  
  if (local.length === 0 || local.length > 64) {
    return { isValid: false, error: 'Email local part must be 1-64 characters' };
  }

  if (domain.length === 0 || domain.length > 255) {
    return { isValid: false, error: 'Email domain must be 1-255 characters' };
  }

  return { isValid: true };
}

/**
 * Validate full name (first and last name)
 */
export function validateName(name: string, fieldName: string = 'Name'): ValidationResult {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  const trimmed = name.trim();

  // Must be at least 2 characters
  if (trimmed.length < 2) {
    return { isValid: false, error: `${fieldName} must be at least 2 characters` };
  }

  // Only allow letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (!nameRegex.test(trimmed)) {
    return { isValid: false, error: `${fieldName} can only contain letters, spaces, hyphens, and apostrophes` };
  }

  // Check for at least first and last name (2 words)
  const words = trimmed.split(/\s+/).filter(w => w.length > 0);
  if (words.length < 2) {
    return { isValid: false, error: 'Please enter both first and last name' };
  }

  // Each name part must be at least 2 characters
  for (const word of words) {
    if (word.length < 2) {
      return { isValid: false, error: 'Each name must be at least 2 characters' };
    }
  }

  return { isValid: true };
}

/**
 * Validate phone number
 */
export function validatePhone(phone: string): ValidationResult {
  if (!phone || phone.trim().length === 0) {
    return { isValid: false, error: 'Phone number is required' };
  }

  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '');

  // Must have at least 10 digits (US standard)
  if (digitsOnly.length < 10) {
    return { isValid: false, error: 'Phone number must have at least 10 digits' };
  }

  // Must not exceed 15 digits (E.164 standard)
  if (digitsOnly.length > 15) {
    return { isValid: false, error: 'Phone number is too long' };
  }

  return { isValid: true };
}

/**
 * Validate player count against game limits
 */
export function validatePlayerCount(
  count: number,
  minPlayers: number,
  maxPlayers: number
): ValidationResult {
  if (!Number.isInteger(count) || count < 1) {
    return { isValid: false, error: 'Player count must be a positive number' };
  }

  if (count < minPlayers) {
    return { 
      isValid: false, 
      error: `Minimum ${minPlayers} player${minPlayers > 1 ? 's' : ''} required` 
    };
  }

  if (count > maxPlayers) {
    return { 
      isValid: false, 
      error: `Maximum ${maxPlayers} player${maxPlayers > 1 ? 's' : ''} allowed` 
    };
  }

  return { isValid: true };
}

/**
 * Sanitize phone number to E.164 format for Stripe
 * Assumes US numbers if no country code provided
 */
export function sanitizePhone(phone: string, countryCode: string = '+1'): string {
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');

  // If starts with country code digit, use as is
  if (digitsOnly.startsWith('1') && digitsOnly.length === 11) {
    return '+' + digitsOnly;
  }

  // Otherwise prepend country code
  return countryCode + digitsOnly;
}

/**
 * Sanitize name: trim, capitalize first letter of each word
 */
export function sanitizeName(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Sanitize email: trim and lowercase
 */
export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Validate all checkout form data
 */
export interface CheckoutFormData {
  fullName: string;
  email: string;
  phone: string;
  playerCount?: number;
  minPlayers?: number;
  maxPlayers?: number;
}

export interface CheckoutValidationResult {
  isValid: boolean;
  errors: {
    fullName?: string;
    email?: string;
    phone?: string;
    playerCount?: string;
  };
}

export function validateCheckoutForm(data: CheckoutFormData): CheckoutValidationResult {
  const errors: CheckoutValidationResult['errors'] = {};
  let isValid = true;

  // Validate name
  const nameResult = validateName(data.fullName, 'Full name');
  if (!nameResult.isValid) {
    errors.fullName = nameResult.error;
    isValid = false;
  }

  // Validate email
  const emailResult = validateEmail(data.email);
  if (!emailResult.isValid) {
    errors.email = emailResult.error;
    isValid = false;
  }

  // Validate phone
  const phoneResult = validatePhone(data.phone);
  if (!phoneResult.isValid) {
    errors.phone = phoneResult.error;
    isValid = false;
  }

  // Validate player count if provided
  if (
    data.playerCount !== undefined &&
    data.minPlayers !== undefined &&
    data.maxPlayers !== undefined
  ) {
    const playerResult = validatePlayerCount(
      data.playerCount,
      data.minPlayers,
      data.maxPlayers
    );
    if (!playerResult.isValid) {
      errors.playerCount = playerResult.error;
      isValid = false;
    }
  }

  return { isValid, errors };
}

/**
 * Format phone number for display (US format)
 */
export function formatPhoneDisplay(phone: string): string {
  const digitsOnly = phone.replace(/\D/g, '');

  if (digitsOnly.length === 10) {
    return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
  }

  if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
    return `+1 (${digitsOnly.slice(1, 4)}) ${digitsOnly.slice(4, 7)}-${digitsOnly.slice(7)}`;
  }

  return phone; // Return as-is if not standard format
}
