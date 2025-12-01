/**
 * Booking Flow Load Test
 * 
 * Tests the complete booking flow under load:
 * 1. Fetch widget configuration
 * 2. Check availability for a date
 * 3. Create checkout session
 * 
 * Run: k6 run tests/load/booking-flow.ts
 * Smoke: k6 run --env TEST_TYPE=smoke tests/load/booking-flow.ts
 * Stress: k6 run --env TEST_TYPE=stress tests/load/booking-flow.ts
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
import {
  BASE_URL,
  TEST_DATA,
  STAGES,
  THRESHOLDS,
  getHeaders,
  randomEmail,
  randomName,
  randomPhone,
  getFutureDate,
  getRandomTimeSlot,
} from './config';

// Custom metrics
const bookingAttempts = new Counter('booking_attempts');
const bookingSuccesses = new Counter('booking_successes');
const bookingFailures = new Counter('booking_failures');
const bookingFailureRate = new Rate('booking_failure_rate');
const widgetLoadTime = new Trend('widget_load_time');
const availabilityCheckTime = new Trend('availability_check_time');
const checkoutCreationTime = new Trend('checkout_creation_time');

// Test configuration
const testType = __ENV.TEST_TYPE || 'load';
export const options = {
  stages: STAGES[testType] || STAGES.load,
  thresholds: {
    ...THRESHOLDS.standard,
    widget_load_time: ['p(95)<300'],
    availability_check_time: ['p(95)<150'],
    checkout_creation_time: ['p(95)<2000'],
    booking_failure_rate: ['rate<0.05'],
  },
  // Graceful ramp-down on thresholds breach
  insecureSkipTLSVerify: true,
  noConnectionReuse: false,
  userAgent: 'BookingTMS-LoadTest/1.0',
};

// Virtual user scenario
export default function () {
  const headers = getHeaders();
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  
  group('1. Load Widget Configuration', () => {
    const startTime = Date.now();
    
    // Fetch activity/widget config
    const configRes = http.get(
      `${BASE_URL}/rest/v1/activities?id=eq.${TEST_DATA.activityId}&select=*,venues(*)`,
      { headers, tags: { name: 'widget_config' } }
    );
    
    widgetLoadTime.add(Date.now() - startTime);
    
    check(configRes, {
      'widget config status 200': (r) => r.status === 200,
      'widget config has data': (r) => {
        try {
          const data = JSON.parse(r.body as string);
          return Array.isArray(data) && data.length > 0;
        } catch {
          return false;
        }
      },
    });
  });
  
  sleep(0.5); // User thinks
  
  group('2. Check Availability', () => {
    const startTime = Date.now();
    const bookingDate = getFutureDate(7); // 7 days from now
    
    // Check session availability
    const availRes = http.get(
      `${BASE_URL}/rest/v1/activity_sessions?` +
      `activity_id=eq.${TEST_DATA.activityId}&` +
      `start_time=gte.${bookingDate}T00:00:00&` +
      `start_time=lte.${bookingDate}T23:59:59&` +
      `is_closed=eq.false&` +
      `capacity_remaining=gt.0&` +
      `select=id,start_time,capacity_remaining,version`,
      { headers, tags: { name: 'availability_check' } }
    );
    
    availabilityCheckTime.add(Date.now() - startTime);
    
    const availCheck = check(availRes, {
      'availability status 200': (r) => r.status === 200,
      'availability returns array': (r) => {
        try {
          return Array.isArray(JSON.parse(r.body as string));
        } catch {
          return false;
        }
      },
    });
    
    if (!availCheck) {
      console.log(`Availability check failed: ${availRes.status} - ${availRes.body}`);
    }
  });
  
  sleep(1); // User selects date and time
  
  group('3. Create Checkout Session', () => {
    bookingAttempts.add(1);
    const startTime = Date.now();
    
    // Prepare booking data
    const customerData = {
      name: randomName(),
      email: randomEmail(),
      phone: randomPhone(),
    };
    
    const bookingData = {
      activityId: TEST_DATA.activityId,
      organizationId: TEST_DATA.organizationId,
      customerEmail: customerData.email,
      customerName: customerData.name,
      customerPhone: customerData.phone,
      bookingDate: getFutureDate(7),
      startTime: getRandomTimeSlot(),
      partySize: Math.floor(Math.random() * 4) + 2, // 2-5 people
      priceId: 'price_test', // Would be real price ID in production
      successUrl: 'https://example.com/success',
      cancelUrl: 'https://example.com/cancel',
      metadata: {
        source: 'load_test',
        sessionId,
      },
    };
    
    // Call checkout session edge function
    const checkoutRes = http.post(
      `${BASE_URL}/functions/v1/create-checkout-session`,
      JSON.stringify(bookingData),
      {
        headers: {
          ...headers,
          'Authorization': `Bearer ${headers.apikey}`,
        },
        tags: { name: 'create_checkout' },
      }
    );
    
    checkoutCreationTime.add(Date.now() - startTime);
    
    const checkoutCheck = check(checkoutRes, {
      'checkout status 200': (r) => r.status === 200,
      'checkout returns url': (r) => {
        try {
          const data = JSON.parse(r.body as string);
          return typeof data.url === 'string' || typeof data.sessionId === 'string';
        } catch {
          return false;
        }
      },
    });
    
    if (checkoutCheck) {
      bookingSuccesses.add(1);
      bookingFailureRate.add(0);
    } else {
      bookingFailures.add(1);
      bookingFailureRate.add(1);
      console.log(`Checkout failed: ${checkoutRes.status} - ${checkoutRes.body}`);
    }
  });
  
  sleep(Math.random() * 2 + 1); // Random think time 1-3 seconds
}

// Setup: Run once before test
export function setup() {
  console.log('='.repeat(60));
  console.log('BookingTMS Load Test - Booking Flow');
  console.log(`Test Type: ${testType}`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Activity ID: ${TEST_DATA.activityId}`);
  console.log('='.repeat(60));
  
  // Verify connectivity
  const healthCheck = http.get(`${BASE_URL}/functions/v1/health`, {
    headers: getHeaders(),
  });
  
  if (healthCheck.status !== 200) {
    console.warn(`Health check returned ${healthCheck.status}`);
  }
  
  return { startTime: Date.now() };
}

// Teardown: Run once after test
export function teardown(data: { startTime: number }) {
  const duration = (Date.now() - data.startTime) / 1000;
  console.log('='.repeat(60));
  console.log(`Test completed in ${duration.toFixed(2)} seconds`);
  console.log('='.repeat(60));
}

// Handle test summary
export function handleSummary(data: any) {
  return {
    'tests/load/results/booking-flow-summary.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: '  ', enableColors: true }),
  };
}

function textSummary(data: any, options: any): string {
  const { metrics } = data;
  let output = '\n' + '='.repeat(60) + '\n';
  output += 'BOOKING FLOW LOAD TEST SUMMARY\n';
  output += '='.repeat(60) + '\n\n';
  
  // Key metrics
  if (metrics.booking_attempts) {
    output += `Booking Attempts: ${metrics.booking_attempts.values.count}\n`;
  }
  if (metrics.booking_successes) {
    output += `Booking Successes: ${metrics.booking_successes.values.count}\n`;
  }
  if (metrics.booking_failures) {
    output += `Booking Failures: ${metrics.booking_failures.values.count}\n`;
  }
  if (metrics.http_req_duration) {
    output += `\nHTTP Request Duration:\n`;
    output += `  P95: ${metrics.http_req_duration.values['p(95)'].toFixed(2)}ms\n`;
    output += `  P99: ${metrics.http_req_duration.values['p(99)'].toFixed(2)}ms\n`;
  }
  
  return output;
}
