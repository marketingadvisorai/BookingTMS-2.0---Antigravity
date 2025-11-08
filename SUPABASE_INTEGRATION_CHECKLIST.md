# Supabase Integration Checklist

## ✅ Complete End-to-End Data Flow Verification

### 1. Database Migrations

#### Run All Migrations
```bash
# Apply migrations in order:
001_initial_schema.sql
002_seed_demo_data.sql
003_add_venues_and_booking_enhancements.sql
005_fix_embed_key_generation.sql
006_add_embed_key_validation.sql
007_fix_games_schema_alignment.sql  # NEW - Run this!
```

#### Migration 007 - Critical Fixes
- ✅ Adds `status` column (replaces `is_active`)
- ✅ Adds `duration` column (replaces `duration_minutes`)
- ✅ Adds `settings` JSONB column
- ✅ Adds `created_by` UUID column
- ✅ Updates `get_venue_games()` RPC function
- ✅ Migrates existing data automatically

### 2. Venue Creation Flow

#### Test Venue Creation
1. Navigate to `/venues`
2. Click "Add New Venue"
3. Fill in venue details
4. Submit

#### Expected Console Logs
```
Creating venue with data: {name, type, description, ...}
Inserting venue data: {...}
Venue created successfully: {id, embed_key, slug, ...}
Generated embed_key: emb_xxxxxxxxxxxx
Generated slug: venue-name-slug
```

#### Verification
- ✅ Venue appears in list
- ✅ `embed_key` is in format `emb_xxxxxxxxxxxx`
- ✅ `slug` is generated from venue name
- ✅ `primary_color` is saved
- ✅ `created_by` is a valid UUID

#### Database Check
```sql
SELECT id, name, embed_key, slug, primary_color, created_by 
FROM venues 
ORDER BY created_at DESC 
LIMIT 5;
```

### 3. Game Creation Flow

#### Test Game Creation
1. Open a venue
2. Click "Configure" button
3. Go to "Games" tab
4. Click "Add Experience"
5. Fill out wizard (all 7 steps)
6. Submit

#### Expected Console Logs
```
Creating game with data: {venueId, name, difficulty}
Mapped Supabase game data: {...}
useGames.createGame called with: {...}
Current user from context: {id: "5", ...}
Using Supabase user ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
Inserting game data: {...}
Game created successfully in database: {id, venue_id, name, ...}
```

#### Verification
- ✅ Game appears in Configure > Games tab
- ✅ Game shows correct venue name
- ✅ Status badge shows "active"
- ✅ All game details are correct
- ✅ No console errors

#### Database Check
```sql
SELECT g.id, g.name, g.venue_id, v.name as venue_name, g.status, g.created_by
FROM games g
JOIN venues v ON g.venue_id = v.id
ORDER BY g.created_at DESC
LIMIT 5;
```

### 4. Embed Widget Data Fetching

#### Test Widget Loading
1. Copy venue embed key
2. Open: `/embed?widgetId=farebook&widgetKey=<embed_key>`
3. Watch console logs

#### Expected Console Logs
```
🔍 Fetching venue data for embedKey: emb_xxxxxxxxxxxx
✅ Venue found: Venue Name (ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
✅ Games loaded: 3
✅ Widget config loaded with 3 games
```

#### Verification
- ✅ Widget loads without errors
- ✅ Venue name displays correctly
- ✅ All games appear in calendar
- ✅ Game details are correct
- ✅ Can select a game
- ✅ Booking flow works

#### Database Check
```sql
-- Test the RPC function directly
SELECT * FROM get_venue_by_embed_key('emb_xxxxxxxxxxxx');
SELECT * FROM get_venue_games('venue-uuid-here');
```

### 5. Real-time Subscriptions

#### Test Real-time Updates
1. Open venue configure in Tab 1
2. Open embed widget in Tab 2
3. Create a new game in Tab 1
4. Watch Tab 2 for updates

#### Expected Behavior
- ✅ Tab 1: Game appears immediately in list
- ✅ Tab 2: Widget refreshes and shows new game
- ✅ Console shows: `🔔 Game update detected: INSERT`

#### Verification
```
Tab 1 (Configure):
- useGames hook triggers fetchGames()
- Real-time subscription fires
- UI updates automatically

Tab 2 (Widget):
- Real-time subscription fires
- window.location.reload() called
- Widget reloads with new game
```

### 6. Data Integrity Checks

#### Foreign Key Relationships
```sql
-- Verify all games have valid venue_id
SELECT COUNT(*) as orphaned_games
FROM games g
LEFT JOIN venues v ON g.venue_id = v.id
WHERE v.id IS NULL;
-- Should return 0

-- Verify all games have valid created_by
SELECT COUNT(*) as games_without_creator
FROM games
WHERE created_by IS NULL;
-- Can be > 0 for migrated data
```

#### Embed Key Validation
```sql
-- All venues should have valid embed keys
SELECT id, name, embed_key
FROM venues
WHERE embed_key IS NULL 
   OR embed_key NOT LIKE 'emb_%'
   OR LENGTH(embed_key) != 15;
-- Should return 0 rows
```

#### Game Status Validation
```sql
-- All games should have valid status
SELECT id, name, status
FROM games
WHERE status NOT IN ('active', 'inactive', 'maintenance')
   OR status IS NULL;
-- Should return 0 rows
```

### 7. Authentication Flow

#### Test User Authentication
1. Login to the system
2. Check console for user info
3. Try creating a game

#### Expected Behavior
- ✅ `currentUser` is populated in AuthContext
- ✅ Supabase session exists
- ✅ Session user ID is a valid UUID
- ✅ Game creation uses session UUID, not mock ID

#### Console Verification
```
Current user from context: {id: "5", role: "admin", ...}
Using Supabase user ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### 8. Error Handling

#### Test Error Scenarios

**Missing Venue ID**
```
Expected: "Venue ID is required to create games"
Console: Missing venueId in embedContext: {...}
```

**Invalid Embed Key**
```
Expected: "Widget not found. Please check your embed code"
Console: ❌ No venue found for embedKey: invalid_key
```

**No Active Games**
```
Expected: "No experiences available at this time"
Console: ⚠️ No active games found for this venue
```

**Authentication Error**
```
Expected: "You must be logged in to create games"
Console: No active Supabase session found
```

### 9. Performance Checks

#### Query Performance
```sql
-- Check index usage
EXPLAIN ANALYZE
SELECT * FROM games WHERE venue_id = 'venue-uuid-here' AND status = 'active';

-- Should use idx_games_venue and idx_games_status
```

#### Real-time Subscription Load
- ✅ Subscriptions clean up on unmount
- ✅ No memory leaks
- ✅ Filters work correctly (venue_id)

### 10. Widget Integration

#### Test All Widget Types

**Calendar Widget**
- ✅ Shows all venue games
- ✅ Date selection works
- ✅ Time slot selection works
- ✅ Booking flow completes

**Single Game Widget**
- ✅ Shows specific game
- ✅ Direct booking works
- ✅ Correct pricing displays

#### Embed URL Formats
```
Calendar: /embed?widgetId=farebook&widgetKey=emb_xxxxxxxxxxxx
Single Game: /embed?widgetId=farebook&widgetKey=emb_xxxxxxxxxxxx&gameId=game-uuid
```

## Common Issues & Solutions

### Issue: "User not authenticated"
**Solution**: Ensure Supabase session exists, not just mock auth
```typescript
const { data: { session } } = await supabase.auth.getSession();
const userId = session.user.id; // Use this, not currentUser.id
```

### Issue: "invalid input syntax for type uuid"
**Solution**: Always use Supabase session UUID, never mock auth numeric ID
```typescript
// ❌ Wrong
created_by: currentUser.id // "5"

// ✅ Correct
created_by: session.user.id // "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### Issue: "No experiences available"
**Solution**: Check venue_id linking and game status
```sql
-- Debug query
SELECT g.*, v.name as venue_name
FROM games g
LEFT JOIN venues v ON g.venue_id = v.id
WHERE g.id = 'game-uuid-here';
```

### Issue: Games not appearing in widget
**Solution**: Verify RPC function returns data
```sql
-- Test RPC directly
SELECT * FROM get_venue_games('venue-uuid-here');

-- Check game status
SELECT id, name, status FROM games WHERE venue_id = 'venue-uuid-here';
```

## Final Verification Checklist

- [ ] All migrations applied successfully
- [ ] Venues can be created with auto-generated embed keys
- [ ] Games can be created and linked to venues
- [ ] Embed widgets fetch and display games correctly
- [ ] Real-time subscriptions work
- [ ] Authentication uses Supabase UUIDs
- [ ] No console errors during normal operation
- [ ] Database constraints are enforced
- [ ] Foreign keys are valid
- [ ] Indexes are in place

## Success Criteria

✅ **Venue Creation**: Venues created with valid embed keys
✅ **Game Creation**: Games saved to Supabase with venue_id
✅ **Widget Display**: Games appear in embed widgets
✅ **Real-time**: Changes reflect immediately
✅ **Data Integrity**: All foreign keys valid
✅ **Performance**: Queries use indexes
✅ **Error Handling**: Clear error messages
✅ **Authentication**: UUID-based, not numeric IDs

## Next Steps

1. **Run Migration 007**: Apply the schema alignment migration
2. **Test Venue Creation**: Create a new venue and verify embed key
3. **Test Game Creation**: Add games to the venue
4. **Test Widget**: Open embed URL and verify games appear
5. **Test Real-time**: Verify updates propagate
6. **Production Deploy**: Once all tests pass

## Support

If issues persist:
1. Check browser console for detailed error logs
2. Check Supabase logs in dashboard
3. Verify all migrations are applied
4. Check database schema matches TypeScript interfaces
5. Ensure authentication is working (Supabase session exists)
