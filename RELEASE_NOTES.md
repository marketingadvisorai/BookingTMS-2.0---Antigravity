# Booking TMS - Venue Working v0.2

## 🚀 Major Features Implemented

### 1. **Dynamic Game Scheduling System**
- **Admin can set custom schedules per game** via Venues > Configure > Games > Edit > Schedule
- **Operating Days**: Select specific days (e.g., Mon, Fri, Sat, Sun)
- **Operating Hours**: Set start/end times (e.g., 10:00 AM - 10:00 PM)
- **Time Slot Intervals**: Configure booking intervals (15, 30, 60 minutes)
- **Advance Booking**: Set how far in advance users can book

### 2. **Smart Calendar Widget**
- **Visual Availability Indicators**:
  - 🟢 Green background for available dates
  - 🔴 Red background for blocked/unavailable dates
  - Green/red dots at bottom of dates
- **Respects Game Schedules**: Only shows operating days as bookable
- **Dynamic Month Navigation**: Browse any month/year
- **Real-time Updates**: Changes sync instantly across all browsers

### 3. **Advanced Date & Time Blocking**
- **Full Day Blocking**: Block entire dates (e.g., holidays)
- **Time Slot Blocking**: Block specific time ranges (e.g., 6PM-8PM maintenance)
- **Admin Panel**: Easy-to-use interface in Calendar Widget Settings > Availability
- **Visual Indicators**: Shows blocked dates with red styling

### 4. **Database Integration**
- **Supabase Backend**: Full PostgreSQL database with real-time sync
- **Row-Level Security**: Secure data access policies
- **Real-time Subscriptions**: Instant updates across all connected clients
- **Data Persistence**: All settings saved to database, no localStorage

## 🏗️ Technical Architecture

### Game Schedule Flow
```
1. Admin creates game with schedule settings
2. Schedule data saved to database (operatingDays, startTime, endTime, slotInterval)
3. Game added to venue's widget configuration
4. Calendar widget reads schedule from config
5. Availability engine generates time slots based on schedule
6. Calendar shows only available dates/times
```

### Availability Engine
- **File**: `src/utils/availabilityEngine.ts`
- **Functions**:
  - `generateTimeSlots()` - Creates available time slots
  - `isDayOperating()` - Checks if day is in operating schedule
  - `isDateBlocked()` - Checks for full-day blocks
  - `isTimeSlotBlocked()` - Checks for time-range blocks

### Database Schema
```sql
venues
├── id, name, address, status
├── settings (JSONB) - contains widget config
└── created_at, updated_at

games  
├── id, name, venue_id
├── operatingDays (array)
├── startTime, endTime
├── slotInterval, advanceBooking
└── created_at, updated_at

widgets
├── venue_id, config (JSONB)
├── blockedDates (array with time ranges)
└── created_at, updated_at
```

## 🎯 User Experience

### For Administrators
1. **Create Venue**: Add venue with basic info
2. **Add Games**: Create games with custom schedules
3. **Configure Widget**: Set up calendar widget appearance
4. **Block Dates**: Block specific dates or time slots as needed
5. **Real-time Preview**: See changes instantly in widget preview

### For Customers
1. **Select Game**: Choose from available games
2. **See Available Dates**: Green dates are bookable, red are blocked
3. **Choose Time**: Select from available time slots based on schedule
4. **Complete Booking**: Standard booking flow
5. **Instant Confirmation**: Real-time availability updates

## 🔧 Key Components

### Calendar Widget (`src/components/widgets/CalendarWidget.tsx`)
- Dynamic calendar with month navigation
- Visual availability indicators
- Time slot generation based on game schedules
- Blocked date/time handling

### Calendar Settings (`src/components/widgets/CalendarWidgetSettings.tsx`)
- **Availability Tab**: Add/remove blocked dates and time slots
- **Games Tab**: Manage venue games
- **General Tab**: Widget appearance settings
- **Custom/SEO/Advanced Tabs**: Additional configuration

### Availability Engine (`src/utils/availabilityEngine.ts`)
- Core logic for generating available time slots
- Handles game schedules, blocked dates, and existing bookings
- Supports both full-day and time-slot blocking

### Game Wizard (`src/components/games/AddGameWizard.tsx`)
- Step-by-step game creation
- Schedule configuration interface
- Real-time preview of game settings

## 🚀 What's Working

### ✅ Complete Features
- [x] Game scheduling with custom days/hours/intervals
- [x] Dynamic calendar with visual indicators
- [x] Date and time slot blocking
- [x] Real-time synchronization
- [x] Database persistence
- [x] Widget and venue preview integration
- [x] Responsive design (mobile/desktop)
- [x] Multi-game support per venue
- [x] Month/year navigation
- [x] Timezone handling

### 🔒 Security
- [x] Row-Level Security policies
- [x] Authentication integration ready
- [x] Input validation and sanitization

### 📱 UI/UX
- [x] Modern, clean interface
- [x] Visual feedback for all actions
- [x] Loading states and error handling
- [x] Toast notifications for user actions
- [x] Responsive design

## 🔄 Real-time Features

### Live Updates
- **Schedule Changes**: When admin updates game schedule, all calendars update instantly
- **Date Blocking**: When admin blocks dates, all widgets show them as unavailable
- **Multi-browser Sync**: Changes appear in all open browsers immediately
- **Database Sync**: All data persisted to Supabase with real-time subscriptions

### Example Scenarios
1. **Schedule Update**: Admin changes game from "Mon-Fri" to "Sat-Sun only"
   → All calendars immediately show only weekends as available
   
2. **Emergency Closure**: Admin blocks today 6PM-8PM for maintenance
   → Time slots 6PM-8PM disappear from all calendars instantly
   
3. **Holiday Blocking**: Admin blocks Dec 25 entirely
   → Dec 25 shows red with "Date blocked by admin" tooltip

## 🎨 Visual Design

### Calendar Indicators
- **Available Dates**: Light green background, green dot, hover effect
- **Blocked Dates**: Light red background, red dot, disabled state
- **Selected Date**: Blue border, white background
- **Today**: Highlighted with primary color

### Time Slots
- **Available**: Green text, hover effect, clickable
- **Blocked**: Red text, disabled, "Time slot blocked" message
- **Selected**: Primary color background, white text

## 📋 Next Steps (Future Releases)

### v0.3 Planned Features
- [ ] Payment integration (Stripe, PayPal)
- [ ] Email notifications and confirmations
- [ ] Advanced booking rules (min/max group sizes)
- [ ] Recurring event support
- [ ] Analytics dashboard
- [ ] Multi-language support

### v0.4 Planned Features
- [ ] Mobile app companion
- [ ] API for third-party integrations
- [ ] Advanced reporting
- [ ] Custom branding options
- [ ] Staff management system

## 🛠️ Development Notes

### Key Dependencies
- **Supabase**: Database and real-time sync
- **React**: Frontend framework
- **TailwindCSS**: Styling
- **TypeScript**: Type safety
- **Sonner**: Toast notifications

### Environment Setup
```bash
# Install dependencies
npm install

# Configure Supabase
cp .env.example .env.local
# Add your Supabase URL and anon key

# Run development server
npm run dev
```

### Database Setup
```sql
-- Run these migrations in Supabase SQL Editor
-- Tables are automatically created via Drizzle migrations
-- RLS policies are configured for secure access
```

## 📞 Support

For technical questions or issues:
1. Check the console for error messages
2. Verify Supabase connection in browser dev tools
3. Review database tables and RLS policies
4. Check network tab for API calls

---

**Version**: v0.2  
**Release Date**: November 2025  
**Status**: Production Ready  
**Database**: Supabase PostgreSQL  
**Frontend**: React + TypeScript + TailwindCSS
