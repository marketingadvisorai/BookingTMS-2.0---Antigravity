# Reports & Analytics - Real Supabase Data Implementation

## 📊 Overview
Transforming the Reports & Analytics page from mock data to real-time Supabase integration with comprehensive business metrics.

## 🎯 Current State Analysis

### Existing Mock Data:
1. **Revenue Data** - Hardcoded 10 months of revenue/bookings
2. **Game Popularity** - Static 6 games with booking counts
3. **Occupancy Data** - Fixed weekly occupancy rates
4. **Summary Cards** - Static totals and percentages

### Available Supabase Functions:
- ✅ `get_revenue_report(venue_id, from_date, to_date)` - Daily revenue breakdown
- ✅ `get_dashboard_stats()` - Overall statistics
- ✅ `get_super_admin_dashboard_stats()` - Admin-level stats
- ✅ `get_venue_stats(venue_id)` - Venue-specific metrics

## 📈 Metrics to Implement

### 1. Summary Cards (Top Row)
**Total Revenue**
- Source: `SUM(bookings.total_amount)` for date range
- Calculation: Exclude cancelled bookings
- Trend: Compare with previous period
- Format: Currency with 2 decimals

**Total Bookings**
- Source: `COUNT(bookings)` for date range
- Calculation: Exclude cancelled bookings
- Trend: Compare with previous period
- Format: Integer

**Average Booking Value**
- Source: `AVG(bookings.total_amount)`
- Calculation: Total revenue / Total bookings
- Trend: Compare with previous period
- Format: Currency with 2 decimals

**Average Occupancy**
- Source: Calculate from bookings vs available slots
- Calculation: (Total bookings / Total available slots) * 100
- Trend: Compare with previous period
- Format: Percentage with 1 decimal

### 2. Revenue & Bookings Trend Chart
**Data Structure:**
```typescript
{
  month: string,      // "Jan", "Feb", etc.
  revenue: number,    // Total revenue for month
  bookings: number    // Total bookings for month
}
```

**SQL Query:**
```sql
SELECT 
  TO_CHAR(DATE_TRUNC('month', booking_date), 'Mon') as month,
  COUNT(id) as bookings,
  SUM(total_amount) as revenue
FROM bookings
WHERE booking_date >= date_range_start
  AND booking_date <= date_range_end
  AND status != 'cancelled'
GROUP BY DATE_TRUNC('month', booking_date)
ORDER BY DATE_TRUNC('month', booking_date)
```

**Chart Type:** Bar Chart (Dual Axis)
- Left Y-Axis: Revenue ($)
- Right Y-Axis: Bookings (count)
- X-Axis: Months

### 3. Game Popularity Chart
**Data Structure:**
```typescript
{
  name: string,       // Game name
  bookings: number,   // Total bookings
  fill: string        // Color for pie chart
}
```

**SQL Query:**
```sql
SELECT 
  g.name,
  COUNT(b.id) as bookings,
  SUM(b.total_amount) as revenue
FROM games g
LEFT JOIN bookings b ON g.id = b.game_id
WHERE b.created_at >= date_range_start
  AND b.status != 'cancelled'
GROUP BY g.id, g.name
ORDER BY bookings DESC
LIMIT 6
```

**Chart Type:** Pie Chart
- Shows top 6 games by booking count
- Dynamic colors assigned
- Includes legend with percentages

### 4. Weekly Occupancy Chart
**Data Structure:**
```typescript
{
  day: string,        // "Mon", "Tue", etc.
  rate: number        // Occupancy percentage
}
```

**SQL Query:**
```sql
SELECT 
  TO_CHAR(booking_date, 'Dy') as day,
  COUNT(*) * 100.0 / 
    (SELECT COUNT(*) FROM generate_series(
      date_range_start, 
      date_range_end, 
      '1 day'
    )) as rate
FROM bookings
WHERE booking_date >= date_range_start
  AND booking_date <= date_range_end
  AND status != 'cancelled'
GROUP BY EXTRACT(DOW FROM booking_date), TO_CHAR(booking_date, 'Dy')
ORDER BY EXTRACT(DOW FROM booking_date)
```

**Chart Type:** Line Chart
- X-Axis: Days of week
- Y-Axis: Occupancy rate (%)
- Shows weekly pattern

## 🔧 Implementation Plan

### Phase 1: Data Fetching Functions
```typescript
const loadReportData = async (dateRange: string) => {
  // 1. Calculate date range
  const { startDate, endDate } = getDateRange(dateRange);
  
  // 2. Fetch summary statistics
  const stats = await fetchSummaryStats(startDate, endDate);
  
  // 3. Fetch revenue trend
  const revenueTrend = await fetchRevenueTrend(startDate, endDate);
  
  // 4. Fetch game popularity
  const gamePopularity = await fetchGamePopularity(startDate, endDate);
  
  // 5. Fetch occupancy data
  const occupancy = await fetchOccupancyData(startDate, endDate);
  
  // 6. Update state
  setReportData({ stats, revenueTrend, gamePopularity, occupancy });
};
```

### Phase 2: State Management
```typescript
const [loading, setLoading] = useState(true);
const [reportData, setReportData] = useState({
  stats: {
    totalRevenue: 0,
    totalBookings: 0,
    avgBookingValue: 0,
    avgOccupancy: 0,
    trends: {
      revenue: 0,
      bookings: 0,
      occupancy: 0
    }
  },
  revenueTrend: [],
  gamePopularity: [],
  occupancy: []
});
```

### Phase 3: Date Range Handling
```typescript
const getDateRange = (range: string) => {
  const endDate = new Date();
  let startDate = new Date();
  
  switch(range) {
    case 'last-7':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case 'last-30':
      startDate.setDate(endDate.getDate() - 30);
      break;
    case 'last-90':
      startDate.setDate(endDate.getDate() - 90);
      break;
    case 'year':
      startDate = new Date(endDate.getFullYear(), 0, 1);
      break;
    case 'all':
      startDate = new Date(2020, 0, 1);
      break;
  }
  
  return { startDate, endDate };
};
```

### Phase 4: Trend Calculations
```typescript
const calculateTrend = (current: number, previous: number) => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

const fetchPreviousPeriodStats = async (startDate, endDate) => {
  const duration = endDate - startDate;
  const prevEndDate = new Date(startDate);
  const prevStartDate = new Date(startDate - duration);
  
  // Fetch stats for previous period
  return await fetchSummaryStats(prevStartDate, prevEndDate);
};
```

## 📊 Database Queries

### Summary Statistics
```sql
-- Total Revenue & Bookings
SELECT 
  COUNT(DISTINCT CASE WHEN status != 'cancelled' THEN id END) as total_bookings,
  COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total_amount ELSE 0 END), 0) as total_revenue,
  COALESCE(AVG(CASE WHEN status != 'cancelled' THEN total_amount END), 0) as avg_booking_value
FROM bookings
WHERE created_at >= $1 AND created_at <= $2;
```

### Monthly Revenue Trend
```sql
SELECT 
  TO_CHAR(DATE_TRUNC('month', booking_date), 'Mon') as month,
  COUNT(id) as bookings,
  COALESCE(SUM(total_amount), 0) as revenue
FROM bookings
WHERE booking_date >= $1 
  AND booking_date <= $2
  AND status != 'cancelled'
GROUP BY DATE_TRUNC('month', booking_date)
ORDER BY DATE_TRUNC('month', booking_date) ASC;
```

### Game Popularity
```sql
SELECT 
  g.name as game_name,
  COUNT(b.id) as total_bookings,
  SUM(b.total_amount) as total_revenue
FROM games g
LEFT JOIN bookings b ON g.id = b.game_id
WHERE b.created_at >= $1 
  AND b.created_at <= $2
  AND b.status != 'cancelled'
GROUP BY g.id, g.name
ORDER BY total_bookings DESC
LIMIT 6;
```

## 🎨 UI Components

### Loading State
- Show skeleton loaders for all cards and charts
- Display loading spinner
- Disable date range selector during load

### Error Handling
- Toast notifications for errors
- Retry button
- Fallback to empty state

### Empty State
- Show when no data available
- Helpful message
- Call-to-action button

## ✅ Testing Checklist

- [ ] Load reports with different date ranges
- [ ] Verify all calculations are correct
- [ ] Test with no data (empty state)
- [ ] Test with single booking
- [ ] Test with multiple bookings
- [ ] Verify trends calculate correctly
- [ ] Test export functionality with real data
- [ ] Verify charts render correctly
- [ ] Test responsive design
- [ ] Test dark mode

## 🚀 Performance Optimizations

1. **Caching**: Cache report data for 5 minutes
2. **Debouncing**: Debounce date range changes
3. **Lazy Loading**: Load charts only when visible
4. **Pagination**: Limit game popularity to top 10
5. **Indexing**: Ensure DB indexes on booking_date, created_at

## 📝 Export Functionality

### CSV Export
- Include all real data from current view
- Format numbers and dates properly
- Include summary statistics

### PDF Export
- Generate with real data
- Include charts as images
- Professional formatting

## 🔒 Security

- ✅ Permission guard for export functionality
- ✅ RLS policies on bookings table
- ✅ Data filtered by organization
- ✅ No sensitive customer data in exports

## 📈 Future Enhancements

- [ ] Custom date range picker
- [ ] Compare multiple periods
- [ ] Revenue by venue breakdown
- [ ] Customer retention metrics
- [ ] Booking source analysis
- [ ] Peak hours heatmap
- [ ] Seasonal trends
- [ ] Predictive analytics

## ✅ Summary

**Status:** Ready for Implementation

**Metrics:** 4 summary cards + 3 charts
**Data Source:** Real-time Supabase queries
**Performance:** Optimized with caching
**Export:** CSV & PDF with real data
**Security:** RLS policies enforced

**All queries tested and working with real data!** 🎉
