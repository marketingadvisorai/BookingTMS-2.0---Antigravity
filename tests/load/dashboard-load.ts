/**
 * Dashboard Load Test
 * 
 * Tests the admin dashboard under load:
 * - Organization stats
 * - Booking list queries
 * - Customer queries
 * - Activity/venue queries
 * 
 * Run: k6 run tests/load/dashboard-load.ts
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
  getFutureDate,
} from './config';

// Custom metrics
const dashboardLoads = new Counter('dashboard_loads');
const queryTime = new Trend('dashboard_query_time');
const statsQueryTime = new Trend('stats_query_time');
const bookingsQueryTime = new Trend('bookings_query_time');
const errorRate = new Rate('dashboard_error_rate');

// Test configuration
const testType = __ENV.TEST_TYPE || 'load';
export const options = {
  stages: STAGES[testType] || STAGES.load,
  thresholds: {
    ...THRESHOLDS.standard,
    dashboard_query_time: ['p(95)<500'],
    stats_query_time: ['p(95)<300'],
    bookings_query_time: ['p(95)<400'],
    dashboard_error_rate: ['rate<0.02'],
  },
  noConnectionReuse: false,
  userAgent: 'BookingTMS-LoadTest/1.0',
};

// Simulate authenticated admin user
function getAuthHeaders() {
  // In real test, would use actual JWT token
  return {
    ...getHeaders(),
    'Authorization': `Bearer ${getHeaders().apikey}`,
  };
}

// Virtual user scenario
export default function () {
  const headers = getAuthHeaders();
  const orgId = TEST_DATA.organizationId;
  let hasErrors = false;
  
  dashboardLoads.add(1);
  
  group('1. Load Dashboard Stats', () => {
    const startTime = Date.now();
    
    // Get organization dashboard stats
    const statsRes = http.get(
      `${BASE_URL}/rest/v1/rpc/get_organization_dashboard_stats?org_id=${orgId}`,
      { headers, tags: { name: 'dashboard_stats' } }
    );
    
    statsQueryTime.add(Date.now() - startTime);
    
    const success = check(statsRes, {
      'stats status 200': (r) => r.status === 200 || r.status === 204,
    });
    
    if (!success) hasErrors = true;
  });
  
  sleep(0.2);
  
  group('2. Load Recent Bookings', () => {
    const startTime = Date.now();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Get recent bookings with customer info
    const bookingsRes = http.get(
      `${BASE_URL}/rest/v1/bookings?` +
      `organization_id=eq.${orgId}&` +
      `created_at=gte.${thirtyDaysAgo.toISOString()}&` +
      `order=created_at.desc&` +
      `limit=50&` +
      `select=id,booking_number,booking_date,start_time,total_amount,status,payment_status,customers(name,email)`,
      { headers, tags: { name: 'recent_bookings' } }
    );
    
    bookingsQueryTime.add(Date.now() - startTime);
    
    const success = check(bookingsRes, {
      'bookings status 200': (r) => r.status === 200,
      'bookings returns array': (r) => {
        try {
          return Array.isArray(JSON.parse(r.body as string));
        } catch {
          return false;
        }
      },
    });
    
    if (!success) hasErrors = true;
  });
  
  sleep(0.2);
  
  group('3. Load Today\'s Schedule', () => {
    const startTime = Date.now();
    const today = new Date().toISOString().split('T')[0];
    
    // Get today's sessions with bookings
    const scheduleRes = http.get(
      `${BASE_URL}/rest/v1/activity_sessions?` +
      `select=id,start_time,end_time,capacity,capacity_remaining,activities!inner(id,name,organization_id)&` +
      `activities.organization_id=eq.${orgId}&` +
      `start_time=gte.${today}T00:00:00&` +
      `start_time=lte.${today}T23:59:59&` +
      `order=start_time.asc`,
      { headers, tags: { name: 'today_schedule' } }
    );
    
    queryTime.add(Date.now() - startTime);
    
    const success = check(scheduleRes, {
      'schedule status 200': (r) => r.status === 200,
    });
    
    if (!success) hasErrors = true;
  });
  
  sleep(0.2);
  
  group('4. Load Customer List', () => {
    const startTime = Date.now();
    
    // Get customers with booking count
    const customersRes = http.get(
      `${BASE_URL}/rest/v1/customers?` +
      `organization_id=eq.${orgId}&` +
      `order=created_at.desc&` +
      `limit=25&` +
      `select=id,name,email,phone,total_bookings,total_spent,created_at`,
      { headers, tags: { name: 'customer_list' } }
    );
    
    queryTime.add(Date.now() - startTime);
    
    const success = check(customersRes, {
      'customers status 200': (r) => r.status === 200,
    });
    
    if (!success) hasErrors = true;
  });
  
  sleep(0.2);
  
  group('5. Load Venues & Activities', () => {
    const startTime = Date.now();
    
    // Parallel requests for venues and activities
    const responses = http.batch([
      {
        method: 'GET',
        url: `${BASE_URL}/rest/v1/venues?organization_id=eq.${orgId}&select=id,name,status,capacity`,
        params: { headers, tags: { name: 'venues_list' } },
      },
      {
        method: 'GET',
        url: `${BASE_URL}/rest/v1/activities?organization_id=eq.${orgId}&select=id,name,is_active,stripe_product_id`,
        params: { headers, tags: { name: 'activities_list' } },
      },
    ]);
    
    queryTime.add(Date.now() - startTime);
    
    const success = check(responses[0], {
      'venues status 200': (r) => r.status === 200,
    }) && check(responses[1], {
      'activities status 200': (r) => r.status === 200,
    });
    
    if (!success) hasErrors = true;
  });
  
  errorRate.add(hasErrors ? 1 : 0);
  
  // Simulate user interaction time on dashboard
  sleep(Math.random() * 3 + 2); // 2-5 seconds
}

// Setup
export function setup() {
  console.log('='.repeat(60));
  console.log('BookingTMS Load Test - Dashboard Load');
  console.log(`Test Type: ${testType}`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Organization ID: ${TEST_DATA.organizationId}`);
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
    'tests/load/results/dashboard-summary.json': JSON.stringify(data, null, 2),
    stdout: generateSummary(data),
  };
}

function generateSummary(data: any): string {
  const { metrics } = data;
  let output = '\n' + '='.repeat(60) + '\n';
  output += 'DASHBOARD LOAD TEST SUMMARY\n';
  output += '='.repeat(60) + '\n\n';
  
  if (metrics.dashboard_loads) {
    output += `Dashboard Loads: ${metrics.dashboard_loads.values.count}\n`;
  }
  if (metrics.dashboard_query_time) {
    output += `\nQuery Times:\n`;
    output += `  Overall P95: ${metrics.dashboard_query_time.values['p(95)'].toFixed(2)}ms\n`;
  }
  if (metrics.stats_query_time) {
    output += `  Stats P95: ${metrics.stats_query_time.values['p(95)'].toFixed(2)}ms\n`;
  }
  if (metrics.bookings_query_time) {
    output += `  Bookings P95: ${metrics.bookings_query_time.values['p(95)'].toFixed(2)}ms\n`;
  }
  if (metrics.dashboard_error_rate) {
    output += `\nError Rate: ${(metrics.dashboard_error_rate.values.rate * 100).toFixed(2)}%\n`;
  }
  
  return output;
}
