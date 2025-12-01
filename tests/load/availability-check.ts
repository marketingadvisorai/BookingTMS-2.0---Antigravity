/**
 * Availability Check Load Test
 * 
 * Tests the availability checking endpoint under high concurrency.
 * This is typically the most frequently called endpoint in booking systems.
 * 
 * Run: k6 run tests/load/availability-check.ts
 * High concurrency: k6 run --env TEST_TYPE=spike tests/load/availability-check.ts
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
import {
  BASE_URL,
  TEST_DATA,
  STAGES,
  THRESHOLDS,
  getHeaders,
  getFutureDate,
} from './config';

// Custom metrics
const availabilityRequests = new Counter('availability_requests');
const cacheHits = new Counter('cache_hits');
const cacheMisses = new Counter('cache_misses');
const responseTime = new Trend('availability_response_time');
const errorRate = new Rate('availability_error_rate');

// Test configuration - optimized for availability checking
const testType = __ENV.TEST_TYPE || 'load';
export const options = {
  stages: STAGES[testType] || STAGES.load,
  thresholds: {
    ...THRESHOLDS.standard,
    availability_response_time: ['p(95)<100', 'p(99)<200'],
    availability_error_rate: ['rate<0.01'],
  },
  noConnectionReuse: false,
  userAgent: 'BookingTMS-LoadTest/1.0',
};

// Virtual user scenario
export default function () {
  const headers = getHeaders();
  
  // Randomly pick a date within the next 30 days
  const daysAhead = Math.floor(Math.random() * 30) + 1;
  const checkDate = getFutureDate(daysAhead);
  
  availabilityRequests.add(1);
  const startTime = Date.now();
  
  // Check availability via REST API
  const res = http.get(
    `${BASE_URL}/rest/v1/activity_sessions?` +
    `activity_id=eq.${TEST_DATA.activityId}&` +
    `start_time=gte.${checkDate}T00:00:00&` +
    `start_time=lte.${checkDate}T23:59:59&` +
    `is_closed=eq.false&` +
    `select=id,start_time,end_time,capacity_remaining,version`,
    {
      headers,
      tags: { name: 'availability_check', date: checkDate },
    }
  );
  
  const elapsed = Date.now() - startTime;
  responseTime.add(elapsed);
  
  // Check for cache header (if using cached endpoint)
  const cacheHeader = res.headers['X-Cache'];
  if (cacheHeader === 'HIT') {
    cacheHits.add(1);
  } else {
    cacheMisses.add(1);
  }
  
  const success = check(res, {
    'status is 200': (r) => r.status === 200,
    'response is array': (r) => {
      try {
        return Array.isArray(JSON.parse(r.body as string));
      } catch {
        return false;
      }
    },
    'response time < 100ms': () => elapsed < 100,
    'response time < 200ms': () => elapsed < 200,
  });
  
  if (!success) {
    errorRate.add(1);
    console.log(`Request failed: ${res.status} in ${elapsed}ms`);
  } else {
    errorRate.add(0);
  }
  
  // Simulate user behavior - rapid availability checks during date selection
  sleep(Math.random() * 0.5); // 0-500ms between checks
}

// Alternative scenario: Check multiple dates at once (calendar view)
export function calendarView() {
  const headers = getHeaders();
  const startDate = getFutureDate(1);
  const endDate = getFutureDate(30);
  
  const startTime = Date.now();
  
  // Get availability for entire month
  const res = http.get(
    `${BASE_URL}/rest/v1/activity_sessions?` +
    `activity_id=eq.${TEST_DATA.activityId}&` +
    `start_time=gte.${startDate}T00:00:00&` +
    `start_time=lte.${endDate}T23:59:59&` +
    `is_closed=eq.false&` +
    `select=start_time,capacity_remaining`,
    {
      headers,
      tags: { name: 'calendar_view' },
    }
  );
  
  responseTime.add(Date.now() - startTime);
  
  check(res, {
    'calendar view status 200': (r) => r.status === 200,
    'calendar has data': (r) => {
      try {
        const data = JSON.parse(r.body as string);
        return Array.isArray(data);
      } catch {
        return false;
      }
    },
  });
  
  sleep(2); // User views calendar for a while
}

// Setup
export function setup() {
  console.log('='.repeat(60));
  console.log('BookingTMS Load Test - Availability Check');
  console.log(`Test Type: ${testType}`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Activity ID: ${TEST_DATA.activityId}`);
  console.log('='.repeat(60));
  
  return { startTime: Date.now() };
}

// Teardown
export function teardown(data: { startTime: number }) {
  const duration = (Date.now() - data.startTime) / 1000;
  console.log('='.repeat(60));
  console.log(`Test completed in ${duration.toFixed(2)} seconds`);
  console.log('='.repeat(60));
}

// Handle test summary
export function handleSummary(data: any) {
  return {
    'tests/load/results/availability-summary.json': JSON.stringify(data, null, 2),
    stdout: generateSummary(data),
  };
}

function generateSummary(data: any): string {
  const { metrics } = data;
  let output = '\n' + '='.repeat(60) + '\n';
  output += 'AVAILABILITY CHECK LOAD TEST SUMMARY\n';
  output += '='.repeat(60) + '\n\n';
  
  if (metrics.availability_requests) {
    output += `Total Requests: ${metrics.availability_requests.values.count}\n`;
  }
  if (metrics.cache_hits && metrics.cache_misses) {
    const hits = metrics.cache_hits.values.count || 0;
    const misses = metrics.cache_misses.values.count || 0;
    const total = hits + misses;
    const hitRate = total > 0 ? ((hits / total) * 100).toFixed(1) : '0';
    output += `Cache Hit Rate: ${hitRate}%\n`;
  }
  if (metrics.availability_response_time) {
    output += `\nResponse Time:\n`;
    output += `  P50: ${metrics.availability_response_time.values['p(50)'].toFixed(2)}ms\n`;
    output += `  P95: ${metrics.availability_response_time.values['p(95)'].toFixed(2)}ms\n`;
    output += `  P99: ${metrics.availability_response_time.values['p(99)'].toFixed(2)}ms\n`;
  }
  if (metrics.availability_error_rate) {
    output += `\nError Rate: ${(metrics.availability_error_rate.values.rate * 100).toFixed(2)}%\n`;
  }
  
  return output;
}
