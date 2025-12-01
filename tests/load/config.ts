/**
 * Load Testing Configuration
 * 
 * Centralized configuration for k6 load tests.
 * Environment variables can override these defaults.
 */

// Base URLs
export const BASE_URL = __ENV.BASE_URL || 'https://qftjyjpitnoapqxlrvfs.supabase.co';
export const APP_URL = __ENV.APP_URL || 'http://localhost:5173';

// Supabase credentials (use environment variables in CI/CD)
export const SUPABASE_ANON_KEY = __ENV.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmdGp5anBpdG5vYXBxeGxydmZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NzIyOTAsImV4cCI6MjA3OTE0ODI5MH0.nO1YARU8309UaV5U1I-fxGeMYJg7CzWXOn2KQvqao7Y';

// Test data IDs (replace with your actual test data)
export const TEST_DATA = {
  organizationId: __ENV.TEST_ORG_ID || 'test-org-id',
  venueId: __ENV.TEST_VENUE_ID || 'test-venue-id',
  activityId: __ENV.TEST_ACTIVITY_ID || 'test-activity-id',
  embedKey: __ENV.TEST_EMBED_KEY || 'emb_test_key',
};

// Stage type definition
type Stage = { duration: string; target: number };

// Standard test stages
export const STAGES: Record<string, Stage[]> = {
  // Smoke test: Quick validation
  smoke: [
    { duration: '30s', target: 5 },
    { duration: '1m', target: 5 },
    { duration: '30s', target: 0 },
  ],
  
  // Load test: Normal expected load
  load: [
    { duration: '2m', target: 50 },
    { duration: '5m', target: 50 },
    { duration: '2m', target: 0 },
  ],
  
  // Stress test: Beyond normal capacity
  stress: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 200 },
    { duration: '5m', target: 200 },
    { duration: '2m', target: 0 },
  ],
  
  // Spike test: Sudden traffic burst
  spike: [
    { duration: '1m', target: 10 },
    { duration: '30s', target: 500 },
    { duration: '1m', target: 500 },
    { duration: '30s', target: 10 },
    { duration: '2m', target: 0 },
  ],
  
  // Soak test: Extended duration (run manually)
  soak: [
    { duration: '5m', target: 100 },
    { duration: '4h', target: 100 },
    { duration: '5m', target: 0 },
  ],
};

// Performance thresholds
export const THRESHOLDS = {
  // HTTP-level thresholds
  http: {
    http_req_duration: ['p(95)<200', 'p(99)<500'],
    http_req_failed: ['rate<0.01'],
    http_req_receiving: ['p(95)<50'],
    http_req_waiting: ['p(95)<150'],
  },
  
  // Custom metric thresholds
  custom: {
    booking_creation_time: ['p(95)<2000'],
    availability_check_time: ['p(95)<100'],
    dashboard_load_time: ['p(95)<500'],
  },
  
  // Combined (for most tests)
  standard: {
    http_req_duration: ['p(95)<200', 'p(99)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

// Headers for Supabase requests
export function getHeaders(authToken?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
  };
  
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  return headers;
}

// Generate random test data
export function randomEmail(): string {
  return `test.user.${Date.now()}.${Math.random().toString(36).substring(7)}@loadtest.com`;
}

export function randomPhone(): string {
  return `+1555${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`;
}

export function randomName(): string {
  const firstNames = ['John', 'Jane', 'Alex', 'Sam', 'Chris', 'Morgan', 'Taylor', 'Jordan'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller'];
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}

// Future date generator (for bookings)
export function getFutureDate(daysAhead: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return date.toISOString().split('T')[0];
}

// Random time slot within business hours
export function getRandomTimeSlot(): string {
  const hours = 9 + Math.floor(Math.random() * 10); // 9 AM to 7 PM
  return `${hours.toString().padStart(2, '0')}:00`;
}
