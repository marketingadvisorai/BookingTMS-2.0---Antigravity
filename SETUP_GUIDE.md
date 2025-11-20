# Quick Setup Guide - Booking TMS v0.2

## 🚀 5-Minute Setup

### 1. Clone and Install
```bash
git clone <repository-url>
cd Booking-TMS-Beta-Dev-V0.1-widget-update-0.2
npm install
```

### 2. Configure Supabase
```bash
# Copy environment file
cp .env.example .env.local

# Edit .env.local with your Supabase credentials:
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Access the Application
- **Admin Panel**: http://localhost:5173
- **Login**: Use your Supabase auth credentials

## 🏗️ Database Setup (One-time)

### Run in Supabase SQL Editor:
```sql
-- Create venues table
CREATE TABLE venues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  status TEXT DEFAULT 'active',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create games table
CREATE TABLE games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  operatingDays TEXT[] DEFAULT ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
  startTime TEXT DEFAULT '10:00',
  endTime TEXT DEFAULT '22:00',
  slotInterval INTEGER DEFAULT 60,
  advanceBooking INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create widgets table
CREATE TABLE widgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE widgets ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust as needed for your security requirements)
CREATE POLICY "Public venues access" ON venues FOR ALL USING (true);
CREATE POLICY "Public games access" ON games FOR ALL USING (true);
CREATE POLICY "Public widgets access" ON widgets FOR ALL USING (true);
```

## 🎯 First Steps

### 1. Create Your First Venue
1. Go to **Venues** page
2. Click **"Add New Venue"**
3. Fill in venue details
4. Click **"Create Venue"**

### 2. Add Games with Schedules
1. Click **"Configure"** on your venue
2. Go to **Games** tab
3. Click **"Add Game"**
4. Fill game details and set **Schedule**:
   - Operating Days: Select days (e.g., Mon, Fri, Sat, Sun)
   - Hours: Set start/end times
   - Interval: Choose time slot duration
5. Click **"Create Game"**

### 3. Configure Widget
1. Go to **Calendar Widget Settings**
2. Adjust appearance in **General** tab
3. Block dates in **Availability** tab if needed
4. Click **"Preview Widget"** to test

### 4. Test Booking Flow
1. Select a game
2. See green dates (available) vs red dates (blocked)
3. Click an available date
4. Select time slots based on game schedule
5. Complete booking process

## 🔧 Troubleshooting

### Common Issues

**Calendar shows all days as available:**
- Check if game has schedule set (Venues > Configure > Games > Edit > Schedule)
- Verify operating days are selected
- Ensure times are set correctly

**Dates not saving:**
- Check Supabase connection in browser console
- Verify RLS policies allow writes
- Check network tab for API errors

**Real-time updates not working:**
- Ensure Supabase real-time is enabled
- Check browser console for subscription errors
- Verify internet connection

**Time slots not appearing:**
- Check game schedule settings
- Verify date is in operating days
- Ensure time is within operating hours

### Debug Mode
Add to browser console:
```javascript
// Check Supabase connection
console.log('Supabase client:', supabase);

// Check game data
console.log('Current game:', selectedGameData);

// Check blocked dates
console.log('Blocked dates:', config?.blockedDates);
```

## 📱 Mobile Testing

The application is fully responsive:
- **Desktop**: Full calendar with all features
- **Tablet**: Optimized layout with touch controls
- **Mobile**: Compact view with swipeable calendar

## 🚀 Going to Production

### 1. Build for Production
```bash
npm run build
```

### 2. Deploy to Vercel/Netlify
- Connect your repository
- Set environment variables
- Deploy automatically

### 3. Configure Supabase for Production
- Enable production URL
- Set proper RLS policies
- Configure authentication
- Set up backups

### 4. Custom Domain (Optional)
- Update Supabase CORS settings
- Configure custom domain in hosting provider
- Update environment variables

## 📞 Need Help?

- Check console errors first
- Review Supabase dashboard
- Verify database tables exist
- Test with incognito browser mode

---

**Version**: v0.2  
**Last Updated**: November 2025  
**Next Version**: v0.3 (Payment Integration)
