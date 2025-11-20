# Customer/Guest Segmentation & Marketing Analytics Plan

## Executive Summary
Transform the customer management system from basic CRUD to a comprehensive marketing analytics platform with automatic segmentation, behavioral insights, and actionable customer intelligence.

## Current State Analysis

### Existing Infrastructure ✅
- **customers table**: Basic profile data with total_bookings and total_spent
- **bookings table**: Links customers to games and venues
- **Triggers**: Auto-update customer stats on booking changes
- **Functions**: 
  - `get_customer_history()` - Booking history
  - `search_customers()` - Customer search
  - `update_customer_stats()` - Stats maintenance
- **useCustomers hook**: Basic CRUD + history
- **Customers page**: List view with basic info

### Data Flow (150-Foot View)
```
Widget Booking → Create/Find Customer → Create Booking → Update Customer Stats
                                              ↓
                                    Link to Game + Venue
                                              ↓
                                    Trigger Analytics Update
```

## Architecture Plan

### 1. Database Layer - New RPC Functions

#### A. Customer Insights Function
```sql
get_customer_with_insights(customer_id UUID)
```
**Returns:**
- Customer profile
- Total bookings & spent
- Favorite game (most booked)
- Preferred venue (most visited)
- Last booking date
- Average booking value
- Days since last visit
- Lifecycle stage (new/regular/VIP/churned)
- Booking frequency (bookings per month)

#### B. Customer Games Function
```sql
get_customer_games(customer_id UUID)
```
**Returns:**
- game_id, game_name, game_image
- booking_count
- total_spent_on_game
- last_played_date
- Ordered by booking_count DESC

#### C. Customer Venues Function
```sql
get_customer_venues(customer_id UUID)
```
**Returns:**
- venue_id, venue_name
- visit_count
- total_spent_at_venue
- last_visit_date
- Ordered by visit_count DESC

#### D. Customer Segmentation Function
```sql
get_customer_segments()
```
**Returns customers grouped by:**
- **Spending Tiers:**
  - VIP: >$1000 total_spent
  - High: $500-$1000
  - Medium: $100-$500
  - Low: <$100

- **Frequency Tiers:**
  - Frequent: >10 bookings
  - Regular: 5-10 bookings
  - Occasional: 2-4 bookings
  - One-time: 1 booking

- **Lifecycle Stages:**
  - New: First booking <30 days ago
  - Active: Last booking <90 days ago
  - At-Risk: Last booking 90-180 days ago
  - Churned: Last booking >180 days ago

- **Game Preferences:**
  - Group by most-played game category

- **Venue Preferences:**
  - Group by most-visited venue

#### E. Update Customer Segments Trigger
```sql
update_customer_segments()
```
**Trigger on:** bookings INSERT/UPDATE/DELETE
**Action:** Update customer.metadata with:
```json
{
  "segments": ["vip", "frequent", "escape_room_fan"],
  "favorite_game_id": "uuid",
  "favorite_game_name": "The Heist",
  "preferred_venue_id": "uuid",
  "preferred_venue_name": "Downtown Location",
  "lifecycle_stage": "active",
  "spending_tier": "vip",
  "frequency_tier": "frequent",
  "last_booking_date": "2024-11-09",
  "days_since_last_visit": 5,
  "average_booking_value": 150.00,
  "booking_frequency_per_month": 2.5,
  "marketing_tags": []
}
```

### 2. Hook Layer - useCustomers Enhancement

**New Functions:**
```typescript
getCustomerInsights(customerId: string): Promise<CustomerInsights>
getCustomerGames(customerId: string): Promise<CustomerGame[]>
getCustomerVenues(customerId: string): Promise<CustomerVenue[]>
getCustomerSegments(): Promise<CustomerSegments>
updateCustomerTags(customerId: string, tags: string[]): Promise<void>
exportSegment(segmentType: string, segmentValue: string): Promise<Customer[]>
```

**New Interfaces:**
```typescript
interface CustomerInsights {
  customer: Customer;
  favorite_game: { id: string; name: string; count: number };
  preferred_venue: { id: string; name: string; count: number };
  lifecycle_stage: 'new' | 'active' | 'at-risk' | 'churned';
  spending_tier: 'vip' | 'high' | 'medium' | 'low';
  frequency_tier: 'frequent' | 'regular' | 'occasional' | 'one-time';
  average_booking_value: number;
  days_since_last_visit: number;
  booking_frequency_per_month: number;
}

interface CustomerGame {
  game_id: string;
  game_name: string;
  game_image: string;
  booking_count: number;
  total_spent: number;
  last_played: string;
}

interface CustomerVenue {
  venue_id: string;
  venue_name: string;
  visit_count: number;
  total_spent: number;
  last_visit: string;
}

interface CustomerSegments {
  spending_tiers: { tier: string; count: number; customers: Customer[] }[];
  frequency_tiers: { tier: string; count: number; customers: Customer[] }[];
  lifecycle_stages: { stage: string; count: number; customers: Customer[] }[];
  game_preferences: { game: string; count: number; customers: Customer[] }[];
  venue_preferences: { venue: string; count: number; customers: Customer[] }[];
}
```

### 3. UI Layer - Customer Page Enhancements

#### A. Customer List View Improvements
**Add Columns:**
- Segment badges (VIP, Regular, New, Churned)
- Favorite game (with icon)
- Preferred venue
- Last visit date
- Lifecycle indicator (color-coded)

**Add Filters:**
- By spending tier
- By frequency tier
- By lifecycle stage
- By favorite game
- By preferred venue
- By marketing tags

**Add Sorting:**
- By total spent (DESC)
- By total bookings (DESC)
- By last visit date (DESC)
- By customer value (lifetime value)

#### B. Customer Detail Dialog Enhancements
**New Sections:**

1. **Customer Overview Card**
   - Profile info
   - Segment badges
   - Lifecycle stage indicator
   - Quick stats (bookings, spent, avg value)

2. **Games Played Section**
   - Grid of game cards
   - Show game image, name, play count
   - Click to filter bookings by game

3. **Venues Visited Section**
   - List of venues with visit counts
   - Show total spent per venue
   - Click to filter bookings by venue

4. **Booking History** (existing)
   - Enhanced with game/venue filters
   - Show booking timeline chart

5. **Analytics Dashboard**
   - Spending trend chart
   - Visit frequency chart
   - Favorite times/days heatmap

6. **Marketing Section**
   - Add/remove marketing tags
   - Segment membership display
   - Export customer data
   - Send targeted email (future)

#### C. New Segmentation Dashboard Page
**Location:** `/customers/segments`

**Features:**
- Segment overview cards (count per segment)
- Distribution pie charts
- Segment comparison tables
- Export functionality for each segment
- Bulk actions (tag, email campaign)

### 4. Marketing Use Cases

#### Segment-Based Campaigns
1. **VIP Customers** - Exclusive offers, early access
2. **At-Risk Customers** - Win-back campaigns
3. **New Customers** - Welcome series, onboarding
4. **Game Enthusiasts** - New game announcements
5. **Venue Loyalists** - Location-specific promotions

#### Automated Triggers
- Birthday emails (using date_of_birth)
- Anniversary emails (first booking date)
- Re-engagement for churned customers
- Milestone celebrations (10th booking, $1000 spent)

### 5. Implementation Phases

#### Phase 1: Database Functions (Priority: High)
- [x] Research current architecture
- [ ] Create get_customer_with_insights()
- [ ] Create get_customer_games()
- [ ] Create get_customer_venues()
- [ ] Create get_customer_segments()
- [ ] Create update_customer_segments() trigger
- [ ] Test all functions with sample data

#### Phase 2: Hook Enhancement (Priority: High)
- [ ] Add new interfaces to useCustomers
- [ ] Implement getCustomerInsights()
- [ ] Implement getCustomerGames()
- [ ] Implement getCustomerVenues()
- [ ] Implement getCustomerSegments()
- [ ] Implement updateCustomerTags()
- [ ] Add real-time subscription for metadata changes

#### Phase 3: UI Updates (Priority: Medium)
- [ ] Add segment badges to customer list
- [ ] Add filters for segments
- [ ] Enhance customer detail dialog
- [ ] Add games played section
- [ ] Add venues visited section
- [ ] Add analytics charts
- [ ] Add marketing tags UI

#### Phase 4: Segmentation Dashboard (Priority: Medium)
- [ ] Create segments page
- [ ] Add segment overview cards
- [ ] Add distribution charts
- [ ] Add export functionality
- [ ] Add bulk actions

#### Phase 5: Marketing Automation (Priority: Low - Future)
- [ ] Email integration
- [ ] Campaign management
- [ ] Automated triggers
- [ ] A/B testing

## Technical Considerations

### Performance
- Index on customer.metadata->>'lifecycle_stage'
- Index on customer.metadata->>'spending_tier'
- Index on customer.metadata->>'frequency_tier'
- Materialized view for segment counts (refresh on trigger)

### Data Privacy
- GDPR compliance for customer data
- Opt-in for marketing communications
- Data export functionality
- Right to be forgotten implementation

### Scalability
- Pagination for large customer lists
- Lazy loading for customer details
- Caching for segment counts
- Background jobs for segment updates

## Success Metrics

### Business Metrics
- Customer retention rate improvement
- Average customer lifetime value increase
- Re-engagement campaign success rate
- Segment-based conversion rates

### Technical Metrics
- Query performance (<100ms for insights)
- Real-time update latency (<1s)
- UI responsiveness (60fps)
- Data accuracy (100% sync with bookings)

## Next Steps

1. **Immediate:** Create database functions for customer insights
2. **Short-term:** Update useCustomers hook with new functions
3. **Medium-term:** Enhance UI with segments and analytics
4. **Long-term:** Build segmentation dashboard and marketing automation

## Dependencies

- Supabase database access
- Chart library (recharts or chart.js)
- Export library (csv-export)
- Email service integration (future)

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Performance degradation with large datasets | High | Implement pagination, caching, indexes |
| Data accuracy issues | High | Comprehensive testing, trigger validation |
| Complex UI overwhelming users | Medium | Progressive disclosure, tooltips, onboarding |
| Privacy compliance | High | Legal review, opt-in mechanisms, audit logs |

## Conclusion

This plan transforms the customer management system into a powerful marketing analytics platform while maintaining simplicity and performance. The phased approach allows for incremental delivery and validation of each component.
