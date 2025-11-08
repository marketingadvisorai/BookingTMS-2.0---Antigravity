# Game Data Flow Fix - Complete Documentation

## Problem Identified

Games created in the venue's **Configure > Games** section were NOT appearing in the embed widgets because:

1. **Games were saved to wrong location**: `venue.widgetConfig.games[]` (JSON field in venues table)
2. **Embed widget fetches from different source**: Supabase `games` table via `SupabaseBookingService.getVenueGames()`
3. **Result**: Two separate data sources that never synced

## Root Cause

### Before Fix:
```
User creates game in Venue Configure → Saved to venue.widgetConfig.games[]
                                              ↓
                                         (JSON field)
                                              ↓
                                    Never reaches games table
                                              ↓
Embed widget queries games table → Finds nothing → "No experiences available"
```

## Solution Implemented

### 1. Modified `CalendarWidgetSettings.tsx`

**File**: `/src/components/widgets/CalendarWidgetSettings.tsx`

#### Changes Made:

1. **Added `useGames` hook integration**:
   ```typescript
   const { games: supabaseGames, createGame, updateGame: updateSupabaseGame, 
           deleteGame: deleteSupabaseGame, loading: gamesLoading } = useGames(embedContext?.venueId);
   ```

2. **Rewrote `handleWizardComplete` function**:
   - Now saves games directly to Supabase `games` table
   - Properly links games to venues via `venue_id`
   - Maps wizard data to Supabase schema correctly
   - Handles both create and update operations

3. **Updated Games Tab Display**:
   - Now shows games from Supabase (`supabaseGames`) instead of `config.games`
   - Real-time updates via `useGames` hook
   - Proper loading states
   - Delete functionality integrated with Supabase

4. **Fixed `convertGameToWizardData` function**:
   - Maps Supabase game schema to wizard format
   - Handles `settings` JSON field properly
   - Supports editing existing games

### 2. Updated `Venues.tsx`

**File**: `/src/pages/Venues.tsx`

#### Changes Made:

Added `venueId` to `embedContext`:
```typescript
embedContext={{
  embedKey: selectedVenue.embedKey,
  primaryColor: selectedVenue.primaryColor,
  venueName: selectedVenue.name,
  baseUrl: typeof window !== 'undefined' ? window.location.origin : '',
  venueId: selectedVenue.id  // ← Added this
}}
```

## Data Flow After Fix

### Correct Flow:
```
User creates game in Venue Configure
         ↓
CalendarWidgetSettings.handleWizardComplete()
         ↓
useGames.createGame() with venue_id
         ↓
Supabase games table (INSERT)
         ↓
Real-time subscription updates UI
         ↓
Embed widget queries games table via SupabaseBookingService.getVenueGames()
         ↓
Games appear in widget ✅
```

## Database Schema

### Games Table Structure:
```sql
games (
  id UUID PRIMARY KEY,
  venue_id UUID REFERENCES venues(id),  -- Links to venue
  name TEXT,
  slug TEXT,
  description TEXT,
  tagline TEXT,
  difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard', 'Expert')),
  duration INTEGER,  -- minutes
  min_players INTEGER,
  max_players INTEGER,
  price NUMERIC,
  child_price NUMERIC,
  min_age INTEGER,
  success_rate INTEGER,
  image_url TEXT,
  status TEXT CHECK (status IN ('active', 'inactive', 'maintenance')),
  settings JSONB,  -- Additional game configuration
  created_by UUID,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

## Embed Widget Data Fetching

### How Widgets Get Games:

1. **Embed page loads** with `widgetKey` (embed_key)
2. **Fetches venue** via `SupabaseBookingService.getVenueByEmbedKey(widgetKey)`
3. **Fetches games** via `SupabaseBookingService.getVenueGames(venue.id)`
4. **Filters** only `status = 'active'` games
5. **Displays** games in calendar widget

### RPC Functions Used:
- `get_venue_by_embed_key(p_embed_key)` - Returns venue config
- `get_venue_games(p_venue_id)` - Returns active games for venue

## Testing Checklist

### ✅ Verify Game Creation:
1. Open any venue
2. Click "Configure" button
3. Go to "Games" tab
4. Click "Add Experience"
5. Fill out wizard and complete
6. **Expected**: Game appears in list immediately
7. **Check Database**: Query `SELECT * FROM games WHERE venue_id = '<venue_id>'`

### ✅ Verify Embed Widget:
1. Copy embed key from venue
2. Open embed URL: `/embed?widgetId=farebook&widgetKey=<embed_key>`
3. **Expected**: Created games appear in calendar
4. **Expected**: Can select game and see booking flow

### ✅ Verify Real-time Updates:
1. Open venue configure in one tab
2. Open embed widget in another tab
3. Create a new game in configure tab
4. **Expected**: Widget refreshes and shows new game

### ✅ Verify Edit/Delete:
1. Edit existing game in configure
2. **Expected**: Changes reflect in widget
3. Delete game in configure
4. **Expected**: Game removed from widget

## Key Files Modified

1. `/src/components/widgets/CalendarWidgetSettings.tsx` - Main game CRUD logic
2. `/src/pages/Venues.tsx` - Added venueId to embedContext
3. `/src/hooks/useGames.ts` - Already had correct Supabase integration
4. `/src/services/SupabaseBookingService.ts` - Already had correct RPC calls
5. `/src/pages/Embed.tsx` - Already fetching from correct source

## Migration Notes

### For Existing Venues with Games in widgetConfig:

If venues have games stored in `widgetConfig.games[]`, they will NOT automatically migrate. Options:

1. **Manual Recreation**: Users recreate games via Configure > Games
2. **Migration Script**: Create script to copy from `widgetConfig.games[]` to `games` table
3. **Hybrid Approach**: Show both sources temporarily with migration prompt

### Recommended Migration Script:
```typescript
// Pseudo-code for migration
async function migrateVenueGames(venueId: string) {
  const venue = await getVenue(venueId);
  const oldGames = venue.widgetConfig?.games || [];
  
  for (const oldGame of oldGames) {
    await createGame({
      venue_id: venueId,
      name: oldGame.name,
      // ... map other fields
    });
  }
  
  // Clear old games from widgetConfig
  await updateVenue(venueId, {
    widgetConfig: { ...venue.widgetConfig, games: [] }
  });
}
```

## Benefits of This Fix

1. **✅ Single Source of Truth**: All games in `games` table
2. **✅ Proper Relational Data**: Games linked to venues via foreign key
3. **✅ Real-time Updates**: Supabase subscriptions work correctly
4. **✅ Better Performance**: Indexed queries on `games` table
5. **✅ Scalability**: Can add game-specific features easily
6. **✅ Data Integrity**: Database constraints ensure valid data
7. **✅ Consistent API**: All game operations use same hooks/services

## Future Enhancements

1. **Game Templates**: Create reusable game templates
2. **Game Analytics**: Track bookings per game
3. **Game Variants**: Multiple pricing tiers per game
4. **Game Scheduling**: Advanced availability rules per game
5. **Game Reviews**: Customer reviews stored in database
6. **Game Images**: Proper image upload and management

## Troubleshooting

### Games Not Appearing in Widget:

1. **Check venue_id**: `SELECT * FROM games WHERE venue_id = '<venue_id>'`
2. **Check status**: Ensure `status = 'active'`
3. **Check embed_key**: Verify correct embed key in widget URL
4. **Check RPC**: Test `SELECT * FROM get_venue_games('<venue_id>')`
5. **Check Console**: Look for errors in browser console

### Games Not Saving:

1. **Check venueId**: Ensure `embedContext.venueId` is passed correctly
2. **Check Auth**: User must be authenticated
3. **Check Permissions**: User must have game creation permissions
4. **Check Schema**: Verify all required fields are provided

## Summary

The fix ensures that games created in the venue's Configure > Games section are:
- ✅ Saved to the Supabase `games` table
- ✅ Properly linked to venues via `venue_id`
- ✅ Fetched by embed widgets via RPC functions
- ✅ Displayed correctly in calendar widgets
- ✅ Updated in real-time across all views

**Result**: Games created in venues now appear in their embed widgets as expected!
