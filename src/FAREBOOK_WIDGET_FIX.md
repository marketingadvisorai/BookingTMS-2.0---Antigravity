# FareBook Widget - Fixed Issues

## Problems Identified and Fixed

### Issue 1: No Games Showing in Embed Mode
**Problem**: When accessing the widget via embed URL (e.g., `?widget=farebook`), no categories or games were displayed.

**Root Cause**: The `Embed.tsx` component was passing an empty `games: []` array in the config, which overrode the widget's default games.

**Fix**: Updated `/pages/Embed.tsx` to include complete default configuration with:
- 2 categories (Traditional Escape Rooms, Printable Escape Rooms)
- 5 games (Zombie Apocalypse, Area 51, Catacombs, Murder Mystery, The Jolly Roger)
- 2 ticket types (Players, Veterans)
- Additional questions and cancellation policy

### Issue 2: Inconsistent Game Data
**Problem**: The preview in BookingWidgets page only showed 2 games while the embed had different data.

**Fix**: Updated `/pages/BookingWidgets.tsx` fareBookConfig to include all 5 games, matching the Embed.tsx configuration.

## Widget Flow - Now Working

### Step 1: Categories View
- Displays 2 category cards with images
- "Traditional Escape Rooms" - contains all 5 games
- "Printable Escape Rooms" - currently empty (intentional)
- Clicking a category navigates to games list

### Step 2: Games List View
- Shows all games in the selected category
- Each game card displays:
  - Game image
  - Game name
  - Price range
  - Age range
  - Duration
  - Difficulty stars (0-5)
  - "Select date" button
- Clicking "Select date" navigates to calendar

### Step 3: Calendar View
- Shows monthly calendar with available time slots
- Game name appears on days with availability
- Displays game hero image at top
- Month/year selection dropdowns
- Time slots generated randomly (85% of days have availability)
- Clicking a time slot navigates to ticket selection

### Step 4: Plan Your Experience
- Shows selected game and date/time
- Ticket type selectors with +/- buttons
- Players: $30 (Ages 6 & Up)
- Veterans: $25 (Must show military ID)
- "Continue" button (enabled when tickets selected)

### Step 5: Cart & Checkout
- Cart summary with ticket breakdown
- Promo code functionality:
  - **Player codes**: SAVE10 (10% off), WELCOME20 (20% off)
  - **Veteran codes**: VETERAN15 (15% off), VETERAN25 (25% off), THANKYOU10 (10% off)
- Additional questions (e.g., "How did you hear about us?")
- Cancellation policy display
- Price breakdown (Subtotal, Discount, Fees, Total)
- "Add to cart" button

### Step 6: Checkout Form
- Order summary with game details
- Contact details form (full name, phone, email)
- Payment details form (card number, expiry, security code, country)
- Price summary
- "Complete and pay" button

### Step 7: Success Page
- Confirmation message with booking ID
- Booking details summary
- "Print Receipt" and "Book Another Experience" buttons

## Testing Instructions

### Test in Admin Portal Preview
1. Navigate to "Booking Widget Templates" page
2. Find "FareBook Widget" card
3. Click "Preview" button
4. Should see categories immediately
5. Click "Traditional Escape Rooms"
6. Should see 5 games
7. Click "Select date" on any game
8. Should see calendar with time slots
9. Complete booking flow through success page

### Test in Embed Mode
1. Add `?widget=farebook` to the URL
2. Widget should load without admin layout
3. Follow same flow as preview test

### Test via Embed URL
1. Go to "Booking Widget Templates" page
2. Click "Embed" button on FareBook Widget
3. Copy the embed URL from "Widget Configuration" section
4. Open URL in new tab
5. Should see full working widget
6. Test complete booking flow

### Test iFrame Embed
1. Use the generated iframe code from Embed tab
2. Create a test HTML file or use the "Download Test Page" feature
3. Open in browser
4. Widget should load in iframe
5. Test responsive behavior

## Features Verified

✅ Categories display with images
✅ Games list with filtering by category
✅ Calendar view with dynamic time slots
✅ Ticket selection with quantity controls
✅ Promo code system (per ticket type)
✅ Cart management (add/remove items)
✅ Additional questions support
✅ Checkout form with validation indicators
✅ Payment processing flow
✅ Success confirmation page
✅ Breadcrumb navigation
✅ Mobile responsive design
✅ Secured badge and Health & Safety indicators
✅ Language selector in footer
✅ Price calculations (subtotal, discounts, fees, total)
✅ Date/time formatting
✅ Back navigation between steps
✅ Cross-origin iframe communication (postMessage)
✅ Responsive height updates for embed

## API Integration Points (Mock Data)

The widget currently uses mock data. For production:

1. **Categories**: Load from Games API (categories table)
2. **Games**: Load from Games API (rooms/events table)
3. **Availability**: Query booking slots from Calendar API
4. **Ticket Types**: Load from Settings API
5. **Promo Codes**: Validate against Promotions API
6. **Checkout**: Submit to Bookings API
7. **Payment**: Process via Payment Gateway integration

## Configuration Options

All configurable via FareBookSettings component:
- Toggle secured badge
- Toggle health & safety badge
- Enable/disable veteran discount
- Add/edit/delete categories
- Add/edit/delete games (with category assignment)
- Add/edit/delete ticket types
- Add/edit/delete additional questions
- Set cancellation policy text

## Known Limitations

1. All games currently assigned to category 1 (Traditional Escape Rooms)
2. Time slots are randomly generated (not from actual availability data)
3. Promo codes are hardcoded (should be loaded from API)
4. Payment processing is simulated (no actual payment gateway)
5. Booking confirmation is mocked (no actual booking creation)

## Next Steps for Production

1. Connect to real API endpoints for games and availability
2. Implement actual calendar/booking system integration
3. Add real payment gateway (Stripe, PayPal, etc.)
4. Store bookings in database
5. Send confirmation emails
6. Add booking management (view/cancel/modify)
7. Implement real promo code validation system
8. Add analytics tracking for widget usage
9. Implement multi-language support
10. Add accessibility improvements (ARIA labels, keyboard navigation)
