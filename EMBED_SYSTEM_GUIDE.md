# 🔗 Embed System Guide - BookingTMS

## Overview
The embed system allows venues to display booking widgets on their websites using unique embed keys. This guide explains how the system works and how to prevent failures.

## How It Works

### 1. Automatic Embed Key Generation

**When a venue is created:**
- ✅ `embed_key` is automatically generated (format: `emb_xxxxxxxxxxxx`)
- ✅ `slug` is automatically generated from venue name
- ✅ `primary_color` defaults to `#2563eb` if not provided
- ✅ All fields are unique and indexed for fast lookups

**Database Trigger:**
```sql
CREATE TRIGGER venue_auto_generate_fields_trigger
  BEFORE INSERT OR UPDATE ON venues
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_venue_fields();
```

### 2. Embed Key Features

- **Unique**: Each venue gets a unique embed key
- **Permanent**: Embed keys never change once generated
- **Indexed**: Fast lookups for widget loading
- **Secure**: Only active venues with valid keys can be embedded

### 3. Widget Loading Process

```
Customer visits widget URL
         ↓
/embed?widgetId=farebook&widgetKey=emb_abc123
         ↓
Fetch venue by embed_key (RPC: get_venue_by_embed_key)
         ↓
Fetch active games for venue (RPC: get_venue_games)
         ↓
Build widget config with venue settings + games
         ↓
Render widget with venue branding
```

### 4. Real-Time Updates

The embed page subscribes to Supabase Realtime for:
- **Game Changes**: When games are added, updated, or deleted
- **Venue Updates**: When venue settings or branding changes

**Automatic Refresh:**
When changes are detected, the widget automatically reloads to show the latest data.

## Embed URLs

### Standard Format
```
https://yourdomain.com/embed?widgetId=farebook&widgetKey=emb_abc123
```

### Parameters
- `widgetId`: Widget type (farebook, multistep, list, quickbook, resolvex)
- `widgetKey`: Unique embed key for the venue

### Example URLs
```
# Calendar Widget
/embed?widgetId=farebook&widgetKey=emb_j542svtecbwu

# Multi-Step Widget
/embed?widgetId=multistep&widgetKey=emb_j542svtecbwu

# List Widget
/embed?widgetId=list&widgetKey=emb_j542svtecbwu
```

## Getting Embed Keys

### Method 1: From Admin Dashboard
1. Login to BookingTMS admin
2. Go to Venues page
3. Click on a venue
4. Copy the embed_key from venue details

### Method 2: From Database
```sql
SELECT id, name, embed_key, slug 
FROM venues 
WHERE status = 'active';
```

### Method 3: Via API (Future)
```javascript
const response = await fetch('/api/venues/my-venue/embed-key');
const { embed_key } = await response.json();
```

## Preventing Failures

### ✅ Best Practices

1. **Always Use Embed Keys**
   - Never hardcode venue IDs in embed URLs
   - Always use the `embed_key` field
   - Embed keys are stable and won't change

2. **Check Venue Status**
   - Only active venues can be embedded
   - Inactive venues will show "Widget not found"

3. **Ensure Games Exist**
   - Venues must have at least one active game
   - Widget shows error if no games available

4. **Handle Errors Gracefully**
   - Widget shows user-friendly error messages
   - Errors are logged to console for debugging

5. **Test Before Deployment**
   - Always test embed URLs before sharing
   - Verify games load correctly
   - Check booking flow works end-to-end

### ❌ Common Mistakes to Avoid

1. **Don't use venue ID in embed URL**
   ```
   ❌ /embed?widgetId=farebook&venueId=123-456-789
   ✅ /embed?widgetId=farebook&widgetKey=emb_abc123
   ```

2. **Don't manually set embed_key**
   - Let the database trigger generate it
   - Manual keys may conflict

3. **Don't delete and recreate venues**
   - Embed keys will change
   - Existing embeds will break
   - Instead, update existing venues

4. **Don't forget to activate games**
   - Games must have `status='active'`
   - Inactive games won't appear in widget

## Error Handling

### Error: "Widget not found"
**Causes:**
- Invalid embed_key
- Venue is inactive
- Venue doesn't exist

**Solutions:**
- Verify embed_key is correct
- Check venue status in database
- Ensure venue wasn't deleted

### Error: "No experiences available"
**Causes:**
- No active games for venue
- All games are inactive
- Games not linked to venue

**Solutions:**
- Create at least one game
- Set game status to 'active'
- Verify game has correct venue_id

### Error: "Missing venue or game information"
**Causes:**
- Config not passed to widget
- venueId or gameId missing from config

**Solutions:**
- Check Embed.tsx passes venueId in config
- Verify games have correct IDs

## Database Schema

### Venues Table
```sql
CREATE TABLE venues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  embed_key VARCHAR(50) UNIQUE NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  primary_color VARCHAR(7) DEFAULT '#2563eb',
  base_url VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX idx_venues_embed_key ON venues(embed_key);
CREATE INDEX idx_venues_slug ON venues(slug);
CREATE INDEX idx_venues_status ON venues(status);
```

### Games Table
```sql
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  price DECIMAL(10,2) NOT NULL,
  -- ... other fields
);

-- Index for venue games lookup
CREATE INDEX idx_games_venue_id ON games(venue_id);
CREATE INDEX idx_games_status ON games(status);
```

## RPC Functions

### get_venue_by_embed_key
```sql
CREATE OR REPLACE FUNCTION get_venue_by_embed_key(p_embed_key TEXT)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  embed_key VARCHAR,
  slug VARCHAR,
  primary_color VARCHAR,
  settings JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT v.id, v.name, v.embed_key, v.slug, v.primary_color, v.settings
  FROM venues v
  WHERE v.embed_key = p_embed_key
    AND v.status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### get_venue_games
```sql
CREATE OR REPLACE FUNCTION get_venue_games(p_venue_id UUID)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  slug VARCHAR,
  description TEXT,
  price DECIMAL,
  -- ... other fields
) AS $$
BEGIN
  RETURN QUERY
  SELECT g.*
  FROM games g
  WHERE g.venue_id = p_venue_id
    AND g.status = 'active'
  ORDER BY g.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Monitoring & Debugging

### Check Embed Key Generation
```sql
-- Verify all venues have embed keys
SELECT 
  id, 
  name, 
  embed_key, 
  slug,
  CASE 
    WHEN embed_key IS NULL THEN '❌ MISSING'
    ELSE '✅ OK'
  END as embed_key_status
FROM venues;
```

### Check Widget Loading
```sql
-- Simulate widget load
SELECT * FROM get_venue_by_embed_key('emb_abc123');
SELECT * FROM get_venue_games('venue-uuid-here');
```

### Monitor Real-Time Subscriptions
```javascript
// In browser console
console.log('Active Supabase channels:', supabase.getChannels());
```

## Testing Checklist

- [ ] Venue has embed_key generated
- [ ] Venue has slug generated
- [ ] Venue status is 'active'
- [ ] At least one game exists for venue
- [ ] Game status is 'active'
- [ ] Game has venue_id set correctly
- [ ] Embed URL loads without errors
- [ ] Games display in widget
- [ ] Booking can be created
- [ ] Real-time updates work

## Migration History

1. **003_add_venues_and_booking_enhancements.sql**
   - Added venues table
   - Added embed_key column
   - Created initial trigger (INSERT only)

2. **004_fix_venue_rls_policies.sql**
   - Fixed RLS policies for venue access

3. **005_fix_embed_key_generation.sql** ✅ LATEST
   - Enhanced embed_key generation
   - Added slug generation
   - Trigger works on INSERT and UPDATE
   - Added unique constraints
   - Added indexes
   - Backfilled existing venues

## Support

### For Developers
- Check browser console for errors
- Verify embed_key in database
- Test RPC functions directly
- Check Supabase logs

### For Venue Owners
- Contact BookingTMS support
- Provide embed_key for troubleshooting
- Check venue status in admin dashboard

## Future Enhancements

- [ ] Custom embed domains (venue.bookings.com)
- [ ] Embed analytics (views, conversions)
- [ ] A/B testing for widgets
- [ ] White-label branding
- [ ] Embed key rotation (security)
- [ ] Rate limiting per embed_key
- [ ] Webhook notifications for embed events

---

**Last Updated**: November 8, 2025
**Version**: 1.0
**Status**: ✅ Production Ready
