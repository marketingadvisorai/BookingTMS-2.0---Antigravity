# System Admin Metrics - Quick Reference Card

## 🎯 What Was Added

### **3 New Metrics** ⭐
```
Before: 4 metrics → After: 7 metrics
```

1. **Total Locations** 📍
   - Icon: `MapPin`
   - Value: 33 locations
   - Trend: +10% this month

2. **Total Games** 🎮
   - Icon: `Gamepad2`
   - Value: ~450 games
   - Trend: +22% this month

3. **Total Bookings** 📅
   - Icon: `Calendar`
   - Value: ~3,900 bookings
   - Trend: +25% this month

### **2 New Table Columns** 📊

1. **Venue IDs** 🏢
   - Shows first 3 venue IDs as badges
   - Example: `VEN-001` `VEN-002` `VEN-003` +2 more
   - Blue badges with hover effects

2. **Games** 🎮
   - Total games count per organization
   - Calculated from all venues
   - Example: 50 games

---

## 📊 Current Dashboard Layout

### **7 KPI Metrics Grid**
```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│ Total       │ Active      │ Active      │ Total       │
│ Owners: 22  │ Subscript.  │ Venues: 78  │ Locations   │
│             │ 18          │             │ 33          │
├─────────────┼─────────────┼─────────────┼─────────────┤
│ Total       │ Total       │ MRR         │             │
│ Games: 450  │ Bookings    │ $5,476      │             │
│             │ 3,900       │             │             │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

### **11-Column Table**
```
| Org ID | Org Name | Owner | Website | Email | Plan | Venues | Venue IDs | Games | Locations | Actions |
```

---

## 💾 Mock Data

### **Venues Data** (51 Total)
```typescript
const venuesData = [
  { id: 'VEN-001', name: 'Downtown Location', organizationId: 'ORG-001', games: 12 },
  { id: 'VEN-002', name: 'Westside Branch', organizationId: 'ORG-001', games: 10 },
  // ... 49 more
];
```

### **Games Data** (22+ Sample)
```typescript
const gamesData = [
  { id: 'GAME-001', name: 'The Bank Heist', venueId: 'VEN-001', difficulty: 'Hard' },
  { id: 'GAME-002', name: 'Prison Break', venueId: 'VEN-001', difficulty: 'Medium' },
  // ... more games
];
```

---

## 🎨 Styling

### **Venue ID Badges**
```css
/* Light Mode */
bg-blue-50 text-blue-700 border border-blue-200

/* Dark Mode */
bg-blue-500/10 text-blue-400 border border-blue-500/20
```

### **Games Count Pill**
```css
/* Light Mode: bg-gray-100 */
/* Dark Mode: bg-[#1e1e1e] */
```

---

## 📈 Calculations

### **Total Games**
```typescript
const totalGames = venuesData.reduce((sum, venue) => sum + venue.games, 0);
// Result: ~450 games
```

### **Total Bookings**
```typescript
const totalBookings = totalVenues * 50;  // Estimated average
// Result: 78 venues × 50 = 3,900 bookings
```

### **Games per Organization**
```typescript
venuesData
  .filter(v => v.organizationId === owner.organizationId)
  .reduce((sum, v) => sum + v.games, 0);
// Example: ORG-001 = 50 games (12+10+8+9+11)
```

---

## 🔄 Account Filtering

**When account is selected**, metrics update:

```typescript
// Before (All): 22 owners, 78 venues, 450 games
// After (Riddle Me This): 1 owner, 5 venues, 50 games
```

All metrics recalculate automatically based on selected account.

---

## 📱 Responsive Grid

| Breakpoint | Columns | Display |
|------------|---------|---------|
| Mobile (<640px) | 1 | Stacked |
| Tablet (640-1023px) | 2 | Side-by-side |
| Desktop (1024-1279px) | 3 | Grid layout |
| Large (≥1280px) | 4 | Full grid |

---

## 🎯 Example Data

### **Riddle Me This (ORG-001)**
```
Venues: 5
Venue IDs: VEN-001, VEN-002, VEN-003, VEN-004, VEN-005
Games: 50 total (12+10+8+9+11)
Locations: 2
Bookings: ~250/month
```

### **Xperience Games (ORG-002)**
```
Venues: 3
Venue IDs: VEN-006, VEN-007, VEN-008
Games: 21 total (7+6+8)
Locations: 1
Bookings: ~150/month
```

---

## ✅ Quick Testing

### **Check Metrics**
1. View dashboard → See 7 KPI cards
2. Verify Total Games shows ~450
3. Verify Total Bookings shows ~3,900
4. Check icons render (Calendar, Gamepad2)

### **Check Table**
1. Scroll to Organizations table
2. See "Venue IDs" column with badges
3. See "Games" column with counts
4. Verify badges show first 3 IDs
5. Check "+X more" appears if needed

### **Check Dark Mode**
1. Toggle dark mode
2. Verify badges have blue glow
3. Check all icons visible
4. Verify hover states work

---

## 🚀 Key Features

✅ **7 comprehensive metrics** tracking all platform dimensions  
✅ **Venue ID visibility** for quick identification  
✅ **Game inventory tracking** per organization  
✅ **Dynamic calculations** based on account selection  
✅ **Full dark mode support** with proper styling  
✅ **Responsive grid layout** for all screen sizes  
✅ **Professional design** matching Stripe/Shopify style  

---

## 📞 Quick Help

**Metrics not showing?**
- Check `filteredMetrics` calculation in code
- Verify `venuesData` and `gamesData` are defined

**Venue IDs not displaying?**
- Check organization ID matches between owners and venues
- Verify `.filter()` logic in table cell

**Games count wrong?**
- Verify `venuesData` has correct `games` property
- Check `.reduce()` calculation logic

---

**File**: `/pages/SystemAdminDashboard.tsx`  
**Documentation**: `/SYSTEM_ADMIN_3_NEW_METRICS_VENUE_GAME_IDS.md`  
**Version**: 1.0.0  
**Last Updated**: November 16, 2025
