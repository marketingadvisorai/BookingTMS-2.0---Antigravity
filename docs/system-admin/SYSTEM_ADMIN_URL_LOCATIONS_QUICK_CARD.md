# System Admin - URL & Locations Quick Card

**Version**: 3.3.1 | **Date**: November 15, 2025 | **Status**: ✅ Complete

---

## ⚡ 30-Second Overview

Added **URL column** with copy/visit options and **Total Locations** metric to System Admin Dashboard for tracking venue landing pages and physical locations.

---

## 🎯 Key Features

### 1. URL Column 🔗
```
[Copy Icon] [Visit] → /v/venue-slug
```
- **Copy**: Copies full URL to clipboard
- **Visit**: Opens venue landing page in new tab
- **Toast**: Confirms "URL copied to clipboard!"

### 2. Total Locations Metric 📍
```
[MapPin Icon] Total Locations: 28
```
- Shows total physical locations across all orgs
- Icon: MapPin (indigo)
- Trend: +10% this month

### 3. Locations Column 📊
```
[MapPin Icon] 2
```
- Shows locations per organization
- Centered alignment with icon

---

## 📋 New Table Structure

| Organization ID | URL | Website | Email | Plan | Venues | Locations | Actions |
|----------------|-----|---------|-------|------|--------|-----------|---------|
| ORG-001 | [Copy] [Visit] | [Visit] | email | Pro | 5 | 📍 2 | [...] |

**Changes**:
- ✅ Added: URL column
- ✅ Added: Locations column  
- ❌ Removed: Owner Name, Organization Name, Status, Features

---

## 💻 Code Snippets

### Copy URL
```tsx
const handleCopyUrl = (profileSlug: string) => {
  const url = `${window.location.origin}/v/${profileSlug}`;
  navigator.clipboard.writeText(url);
  toast.success('URL copied to clipboard!');
};
```

### Visit URL
```tsx
const handleVisitUrl = (profileSlug: string) => {
  window.open(`/v/${profileSlug}`, '_blank');
};
```

### Locations Metric
```tsx
const totalLocations = accountOwners.reduce(
  (sum, owner) => sum + (owner.locations || 0), 
  0
);
```

### Data Structure
```tsx
{
  id: 1,
  organizationId: 'ORG-001',
  profileSlug: 'riddle-me-this',
  locations: 2, // NEW
  venues: 5,
  // ...
}
```

---

## 🎨 UI Components

### URL Column
```tsx
<button onClick={() => handleCopyUrl(slug)}>
  <Copy className="w-3 h-3" />
</button>
<button onClick={() => handleVisitUrl(slug)}>
  <ExternalLink className="w-3 h-3" />
  Visit
</button>
```

### Locations Column
```tsx
<div className="flex items-center justify-center gap-1">
  <MapPin className="w-3 h-3 text-indigo-600" />
  <span>{owner.locations || 0}</span>
</div>
```

### KPI Card
```tsx
<KPICard
  title="Total Locations"
  value={28}
  icon={MapPin}
  trend={{ value: 10, isPositive: true }}
/>
```

---

## 🔄 User Flows

### Copy URL
1. Click copy icon → URL copied
2. Toast: "URL copied to clipboard!"
3. Paste anywhere

### Visit Page
1. Click "Visit" → New tab opens
2. View venue landing page
3. Toast: "Opening profile for {Org}"

### View Locations
1. See "Total Locations" metric card
2. View per-org locations in table
3. Filter by account to update totals

---

## 📊 Mock Data

```tsx
// Added locations to all orgs
{ id: 1, organizationId: 'ORG-001', locations: 2 },
{ id: 2, organizationId: 'ORG-002', locations: 1 },
{ id: 3, organizationId: 'ORG-003', locations: 1 },
{ id: 4, organizationId: 'ORG-004', locations: 2 },
{ id: 5, organizationId: 'ORG-005', locations: 1 },
```

**Total**: 7 locations across 5 orgs

---

## 🌗 Dark Mode

### Light Mode
- Copy: gray → indigo hover
- Visit: indigo
- MapPin: indigo

### Dark Mode
- Copy: gray-400 → indigo-400 hover
- Visit: indigo-400
- MapPin: indigo-400

---

## 📱 Responsive

### Desktop
- 5-column KPI grid
- Full table visible

### Tablet
- 2-column KPI grid
- Table scrolls horizontally

### Mobile
- 1-column KPI grid
- Table scrolls horizontally
- Touch-optimized buttons

---

## ✅ Testing

- [x] Copy URL works
- [x] Toast appears
- [x] Visit opens new tab
- [x] Locations metric correct
- [x] Dark mode works
- [x] Responsive design
- [x] Account filtering

---

## 🚀 Quick Start

### 1. View Metrics
```
Dashboard → Total Locations card (5th card)
```

### 2. Copy URL
```
Table → URL column → Click copy icon
```

### 3. Visit Page
```
Table → URL column → Click "Visit"
```

### 4. View Locations
```
Table → Locations column → See count with map pin
```

---

## 📈 Metrics

**5 KPI Cards**:
1. Total Owners: 48
2. Active Subscriptions: 42
3. Active Venues: 156
4. **Total Locations: 28** ⭐ NEW
5. MRR: $24,750

---

## 🔧 Files Modified

- ✅ `/pages/SystemAdminDashboard.tsx` - Main component

---

## 📚 Full Documentation

See: `/SYSTEM_ADMIN_URL_LOCATIONS_UPDATE.md`

---

**Status**: ✅ Complete | **Works With**: Dark mode, responsive, account filtering
