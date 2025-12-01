# BookingTMS Load Testing Suite

Enterprise-grade load testing for BookingTMS using [k6](https://k6.io/).

## Prerequisites

### Install k6

```bash
# macOS
brew install k6

# Ubuntu/Debian
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# Windows
choco install k6

# Docker
docker pull grafana/k6
```

## Test Files

| File | Purpose | Duration |
|------|---------|----------|
| `booking-flow.ts` | Complete booking journey | ~10 min (load) |
| `availability-check.ts` | High-frequency availability queries | ~10 min (load) |
| `dashboard-load.ts` | Admin dashboard performance | ~10 min (load) |

## Quick Start

### Run Smoke Test (Quick Validation)

```bash
# Booking flow - 5 VUs for 2 minutes
k6 run --env TEST_TYPE=smoke tests/load/booking-flow.ts

# Availability check
k6 run --env TEST_TYPE=smoke tests/load/availability-check.ts

# Dashboard load
k6 run --env TEST_TYPE=smoke tests/load/dashboard-load.ts
```

### Run Load Test (Normal Traffic)

```bash
# Default: 50 VUs ramping up over 9 minutes
k6 run tests/load/booking-flow.ts
k6 run tests/load/availability-check.ts
k6 run tests/load/dashboard-load.ts
```

### Run Stress Test (Beyond Capacity)

```bash
# Ramps up to 200 VUs
k6 run --env TEST_TYPE=stress tests/load/booking-flow.ts
```

### Run Spike Test (Traffic Burst)

```bash
# Sudden spike to 500 VUs
k6 run --env TEST_TYPE=spike tests/load/availability-check.ts
```

## Configuration

### Environment Variables

```bash
# Override base URL (default: Supabase project URL)
k6 run --env BASE_URL=https://your-api.com tests/load/booking-flow.ts

# Override test data IDs
k6 run \
  --env TEST_ORG_ID=your-org-id \
  --env TEST_VENUE_ID=your-venue-id \
  --env TEST_ACTIVITY_ID=your-activity-id \
  tests/load/booking-flow.ts
```

### Test Types

| Type | Description | Max VUs | Duration |
|------|-------------|---------|----------|
| `smoke` | Quick validation | 5 | 2 min |
| `load` | Normal expected load | 50 | 9 min |
| `stress` | Beyond normal capacity | 200 | 16 min |
| `spike` | Sudden traffic burst | 500 | 5 min |
| `soak` | Extended duration | 100 | 4+ hours |

## Performance Targets

Based on enterprise requirements:

| Metric | Target | Critical |
|--------|--------|----------|
| P95 Response Time | < 200ms | < 500ms |
| P99 Response Time | < 500ms | < 1000ms |
| Error Rate | < 1% | < 5% |
| Availability Check | < 100ms | < 200ms |
| Dashboard Load | < 500ms | < 1000ms |
| Checkout Creation | < 2000ms | < 5000ms |

## Test Scenarios

### 1. Booking Flow (`booking-flow.ts`)

Simulates the complete customer booking journey:

1. **Load Widget Config** - Fetch activity/venue data
2. **Check Availability** - Query available time slots
3. **Create Checkout Session** - Initialize Stripe checkout

**Custom Metrics:**
- `booking_attempts` - Total booking attempts
- `booking_successes` - Successful checkouts
- `booking_failures` - Failed attempts
- `widget_load_time` - Widget configuration load time
- `availability_check_time` - Time to check slot availability
- `checkout_creation_time` - Stripe session creation time

### 2. Availability Check (`availability-check.ts`)

High-frequency availability queries (most common operation):

1. **Single Date Check** - Check slots for one date
2. **Calendar View** - Load month-wide availability

**Custom Metrics:**
- `availability_requests` - Total requests
- `cache_hits` / `cache_misses` - Cache effectiveness
- `availability_response_time` - Query response time
- `availability_error_rate` - Error percentage

### 3. Dashboard Load (`dashboard-load.ts`)

Admin dashboard performance under concurrent users:

1. **Dashboard Stats** - Organization summary
2. **Recent Bookings** - Last 30 days booking list
3. **Today's Schedule** - Day view sessions
4. **Customer List** - Paginated customer query
5. **Venues & Activities** - Inventory listing

**Custom Metrics:**
- `dashboard_loads` - Complete page loads
- `stats_query_time` - Stats aggregation time
- `bookings_query_time` - Booking list query time
- `dashboard_error_rate` - Error percentage

## Results

Results are saved to `tests/load/results/`:

- `booking-flow-summary.json`
- `availability-summary.json`
- `dashboard-summary.json`

### Viewing Results

```bash
# Run with detailed output
k6 run --out json=results/detailed.json tests/load/booking-flow.ts

# Generate HTML report (requires k6 extension)
k6 run --out web-dashboard tests/load/booking-flow.ts
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Load Tests

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM
  workflow_dispatch:

jobs:
  load-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Install k6
        run: |
          sudo gpg -k
          sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
          echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
          sudo apt-get update
          sudo apt-get install k6
      
      - name: Run Smoke Tests
        run: |
          k6 run --env TEST_TYPE=smoke tests/load/booking-flow.ts
          k6 run --env TEST_TYPE=smoke tests/load/availability-check.ts
        env:
          BASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
```

## Troubleshooting

### Common Issues

**1. Connection Refused**
```
ERRO[0000] Request failed  error="dial tcp: connection refused"
```
- Check if the API is running
- Verify BASE_URL is correct
- Check firewall/network settings

**2. Unauthorized (401)**
```
{"error":"Invalid API key"}
```
- Verify SUPABASE_ANON_KEY is set correctly
- Check if key has required permissions

**3. Rate Limited (429)**
```
{"error":"Too many requests"}
```
- Reduce VU count
- Add longer sleep times
- Check rate limit configuration

**4. High Error Rate**
- Check database connection pool
- Verify indexes are in place
- Monitor server resources

### Debug Mode

```bash
# Enable verbose logging
k6 run --http-debug=full tests/load/booking-flow.ts
```

## Best Practices

1. **Run during off-peak hours** - Avoid impacting real users
2. **Start with smoke tests** - Validate before heavy load
3. **Monitor backend resources** - CPU, memory, connections
4. **Set realistic think times** - Don't hammer the API
5. **Use test data** - Don't pollute production data
6. **Review thresholds regularly** - Adjust as system evolves

## Related Documentation

- [Enterprise Architecture](./.agent/rules/ENTERPRISE_ARCHITECTURE.md)
- [Enterprise Tasks](./.agent/rules/ENTERPRISE_TASKS.md)
- [API Reference](./docs/API_REFERENCE.md)

---

Last Updated: December 2, 2025
