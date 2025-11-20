# Customer Segmentation & Analytics - Testing Checklist

## Dev Server
- ✅ Running on: http://localhost:3002/
- ✅ Hot Module Reload: Working

## Phase 1: Database Functions ✅ COMPLETED

### Test get_customer_with_insights()
- [x] Function created successfully
- [x] Returns customer profile
- [x] Calculates lifecycle_stage correctly (new/active/at-risk/churned)
- [x] Calculates spending_tier correctly (vip/high/medium/low)
- [x] Calculates frequency_tier correctly (frequent/regular/occasional/one-time)
- [x] Returns favorite_game with booking count
- [x] Returns preferred_venue with visit count
- [x] Calculates days_since_last_visit
- [x] Calculates average_booking_value
- [x] Calculates booking_frequency_per_month
- [x] Tested with real customer data (tariqul.social@gmail.com)

### Test get_customer_games()
- [x] Function created successfully
- [x] Returns all games played by customer
- [x] Shows booking_count per game
- [x] Shows total_spent per game
- [x] Shows last_played date
- [x] Ordered by booking_count DESC
- [x] Tested with real customer data

### Test get_customer_venues()
- [x] Function created successfully
- [x] Returns all venues visited by customer
- [x] Shows visit_count per venue
- [x] Shows total_spent per venue
- [x] Shows last_visit date
- [x] Ordered by visit_count DESC
- [x] Tested with real customer data

## Phase 2: Hook Layer ✅ COMPLETED

### Test useCustomers Hook
- [x] New interfaces added (CustomerGame, CustomerVenue, CustomerInsights)
- [x] getCustomerInsights() function exported
- [x] getCustomerGames() function exported
- [x] getCustomerVenues() function exported
- [x] TypeScript compilation successful
- [x] No type errors

## Phase 3: UI Enhancements ✅ COMPLETED

### Test CustomerDetailDialog Component

#### Dialog Opening
- [ ] Navigate to Customers page
- [ ] Click on any customer row
- [ ] Dialog opens without errors
- [ ] Loading state shows briefly

#### Customer Header
- [ ] Customer name displays correctly
- [ ] Customer ID displays correctly
- [ ] Email displays correctly
- [ ] Phone displays correctly
- [ ] Last booking date displays correctly

#### Stats Cards
- [ ] Total Bookings shows correct number
- [ ] Lifetime Value shows correct amount
- [ ] Average Booking Value displays

#### Booking History Tab
- [ ] Tab is selected by default
- [ ] Shows loading state initially
- [ ] Displays all bookings for customer
- [ ] Each booking shows:
  - [ ] Game name
  - [ ] Venue name
  - [ ] Booking date (formatted correctly)
  - [ ] Total amount (formatted as currency)
  - [ ] Status badge with correct color
- [ ] Empty state shows if no bookings

#### Games Played Tab ⭐ NEW
- [ ] Tab shows count in parentheses (e.g., "Games Played (2)")
- [ ] Click tab to switch
- [ ] Shows loading state initially
- [ ] Displays all games customer has played
- [ ] Each game card shows:
  - [ ] Game icon (Gamepad2)
  - [ ] Game name
  - [ ] Times Played count
  - [ ] Total Spent (formatted as currency)
  - [ ] Last Played date (formatted)
- [ ] Grid layout: 1 column on mobile, 2 columns on desktop
- [ ] Empty state shows if no games played
- [ ] Cards have proper styling and hover effects

#### Venues Visited Tab ⭐ NEW
- [ ] Tab shows count in parentheses (e.g., "Venues Visited (2)")
- [ ] Click tab to switch
- [ ] Shows loading state initially
- [ ] Displays all venues customer has visited
- [ ] Each venue card shows:
  - [ ] Venue icon (Building2)
  - [ ] Venue name
  - [ ] Visits count
  - [ ] Total Spent (formatted as currency)
  - [ ] Last Visit date (formatted)
- [ ] List layout with cards
- [ ] Empty state shows if no venues visited
- [ ] Cards have proper styling and hover effects

#### Notes Tab
- [ ] Tab exists
- [ ] Shows customer notes or empty state

#### Segment Badges
- [ ] VIP: Purple badge
- [ ] High: Indigo badge
- [ ] Regular/Frequent: Blue badge
- [ ] New/Active: Green badge
- [ ] At-Risk: Yellow badge
- [ ] Churned/Inactive: Gray badge

#### Responsive Design
- [ ] Dialog is full screen on mobile
- [ ] Dialog is 90vw/90vh on desktop (max 1200px)
- [ ] Games grid adapts to screen size
- [ ] All content scrollable
- [ ] No horizontal overflow

## Phase 4: Customer List Page ✅ COMPLETED

### Test Customers Page

#### Data Loading
- [ ] Navigate to /customers
- [ ] Loading state shows initially
- [ ] Real customer data loads from database
- [ ] No mock data displayed

#### Customer Table
- [ ] All customers display in table
- [ ] Each row shows:
  - [ ] Customer name (first + last)
  - [ ] Customer ID
  - [ ] Email
  - [ ] Phone
  - [ ] Total bookings (from database)
  - [ ] Lifetime value (formatted as currency)
  - [ ] Last booking date
  - [ ] Segment badge (from metadata.lifecycle_stage)
  - [ ] Status badge (Active/Inactive)
  - [ ] Actions dropdown

#### Search Functionality
- [ ] Search box works
- [ ] Filters by name
- [ ] Filters by email
- [ ] Results update in real-time

#### Segment Filter
- [ ] Segment dropdown exists
- [ ] Can filter by segment
- [ ] "All" option shows all customers

#### Actions
- [ ] View Profile opens CustomerDetailDialog
- [ ] Edit Customer opens edit dialog (if permissions)
- [ ] Add Customer button works (if permissions)
- [ ] Export button works (if permissions)
- [ ] Refresh button reloads data

#### Empty States
- [ ] Shows "No customers found" when search has no results
- [ ] Shows "Loading customers..." when loading

## Test with Real Data

### Test Customer: tariqul.social@gmail.com
Expected Data:
- **Total Bookings**: 5
- **Lifecycle Stage**: new (or active)
- **Spending Tier**: low
- **Frequency Tier**: regular
- **Favorite Game**: "DDDDD" (2 bookings, $240)
- **Preferred Venue**: "Smash Room" (3 visits, $360)
- **Games Played**: 2 different games
- **Venues Visited**: 2 different venues

### Verification Steps
1. [ ] Open Customers page
2. [ ] Find customer with email tariqul.social@gmail.com
3. [ ] Click to open detail dialog
4. [ ] Verify all stats match expected data
5. [ ] Check Games Played tab shows 2 games
6. [ ] Check Venues Visited tab shows 2 venues
7. [ ] Verify all amounts are formatted correctly
8. [ ] Verify all dates are formatted correctly

## Performance Testing

### Load Times
- [ ] Customer list loads in <2 seconds
- [ ] Customer detail dialog opens in <1 second
- [ ] Games/venues data loads in <1 second
- [ ] No lag when switching tabs

### Real-time Updates
- [ ] Changes in database reflect in UI
- [ ] Refresh button works correctly
- [ ] No memory leaks

## Error Handling

### Network Errors
- [ ] Graceful error messages
- [ ] Toast notifications for errors
- [ ] Console logs for debugging

### Empty Data
- [ ] Empty states display correctly
- [ ] No crashes with missing data
- [ ] Null checks working

## Browser Compatibility
- [ ] Chrome/Edge (tested)
- [ ] Firefox
- [ ] Safari

## Dark Mode
- [ ] All components respect theme
- [ ] Colors are readable
- [ ] Badges have proper dark mode colors
- [ ] No white flashes

## Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader friendly
- [ ] Proper ARIA labels
- [ ] Focus indicators visible

## Files Modified (Ready for Commit)
1. ✅ `src/hooks/useCustomers.ts` - Added analytics functions
2. ✅ `src/components/customers/CustomerDetailDialog.tsx` - Added games/venues tabs
3. ✅ `src/pages/Customers.tsx` - Using real database data
4. ✅ `CUSTOMER_SEGMENTATION_PLAN.md` - Documentation
5. ✅ `PHASE_2_IMPLEMENTATION_SUMMARY.md` - Phase 2 summary
6. ✅ `TESTING_CHECKLIST.md` - This file

## Database Migrations Applied
- ✅ `create_customer_analytics_functions` - RPC functions for insights, games, venues
- ✅ All functions tested and working

## Next Steps After Testing
1. Complete manual testing using this checklist
2. Fix any bugs found
3. Get approval from user
4. Commit all changes to GitHub
5. Consider Phase 5: Segmentation Dashboard (optional)

## Known Limitations
- Customer creation requires all fields
- Segments update only when bookings change
- No real-time segment calculation (uses metadata cache)
- Export functionality uses current implementation

## Future Enhancements (Phase 5)
- Segmentation dashboard page
- Bulk actions on customers
- Advanced filtering
- Customer lifecycle automation
- Email marketing integration
- Customer journey visualization
