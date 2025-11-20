# System Admin Profile Features - Quick Reference

**Status**: ✅ Complete | **Date**: November 15, 2025

---

## 🚀 New Features at a Glance

### Organization Information
✅ Organization Name  
✅ Organization ID (badge style)  
✅ Website Link (opens in new tab)  

### Profile Button
✅ View Profile → Opens `/v/{slug}` in new tab  
✅ Profile Settings → Edit modal  
✅ Profile Embed → Get embed code  

---

## 📊 Table Structure

```
Owner Name | Org Name | Org ID | Website | Email | Plan | Venues | Status | Features | Actions
-----------|----------|--------|---------|-------|------|--------|--------|----------|----------
John Smith | Riddle.. | ORG-001| [Visit] | john..| Pro  | 5      | active | AI,Waiv.| [Profile▼]
```

**New Columns**:
- **Organization Name**: Full business name
- **Organization ID**: Unique ID with code badge (e.g., `ORG-001`)
- **Website**: Clickable link with external icon

---

## 🎨 Components

### 1. ProfileDropdown
**Location**: `/components/systemadmin/ProfileDropdown.tsx`

**Usage**:
```tsx
<ProfileDropdown
  ownerName="John Smith"
  profileSlug="riddle-me-this"
  organizationName="Riddle Me This Escape Rooms"
  onViewProfile={() => {}}
  onProfileSettings={() => {}}
  onProfileEmbed={() => {}}
/>
```

**Menu Options**:
```
┌─────────────────────────┐
│ 🔗 View Profile        │
│    Public landing page  │
├─────────────────────────┤
│ ⚙️ Profile Settings    │
│    Customize profile    │
├─────────────────────────┤
│ </> Profile Embed      │
│    Get embed code       │
└─────────────────────────┘
```

---

### 2. ProfileSettingsModal
**Location**: `/components/systemadmin/ProfileSettingsModal.tsx`

**Usage**:
```tsx
<ProfileSettingsModal
  isOpen={true}
  onClose={() => {}}
  owner={{
    ownerName: "John Smith",
    organizationName: "Riddle Me This",
    organizationId: "ORG-001",
    website: "https://...",
    email: "john@...",
    profileSlug: "riddle-me-this"
  }}
/>
```

**Fields**:
- Organization Name *
- Tagline
- Description
- Website
- Phone / Email
- Address
- Profile URL (read-only)

---

### 3. ProfileEmbedModal
**Location**: `/components/systemadmin/ProfileEmbedModal.tsx`

**Usage**:
```tsx
<ProfileEmbedModal
  isOpen={true}
  onClose={() => {}}
  owner={{
    ownerName: "John Smith",
    organizationName: "Riddle Me This",
    profileSlug: "riddle-me-this"
  }}
/>
```

**Features**:
- Profile URL with copy button
- HTML embed code with syntax highlighting
- Live preview iframe
- Customization guide

**Embed Code**:
```html
<iframe 
  src="https://yourdomain.com/v/riddle-me-this"
  width="100%"
  height="800"
></iframe>
```

---

## 💾 Data Structure

```tsx
{
  id: 1,
  accountId: 1,
  ownerName: 'John Smith',
  organizationName: 'Riddle Me This Escape Rooms',
  organizationId: 'ORG-001',
  website: 'https://riddlemethis.com',
  email: 'john@escaperooms.com',
  plan: 'Pro',
  venues: 5,
  status: 'active',
  features: ['AI Agents', 'Waivers', 'Analytics'],
  profileSlug: 'riddle-me-this',
}
```

---

## 🎨 Styling

### Organization ID Badge
```tsx
<code className="text-xs bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded">
  ORG-001
</code>
```

### Website Link
```tsx
<a href={url} target="_blank" className="flex items-center gap-1 hover:text-indigo-600">
  <ExternalLink className="w-3 h-3" />
  <span>Visit</span>
</a>
```

---

## 🌓 Dark Mode

**ProfileDropdown**:
- Background: `bg-[#161616]` (dark) | `bg-white` (light)
- Hover: `hover:bg-[#1a1a1a]` (dark) | `hover:bg-gray-50` (light)
- Border: `border-[#333]` (dark) | `border-gray-200` (light)

**Modals**:
- Input BG: `bg-[#1a1a1a]` (dark) | `bg-gray-100` (light)
- Input Border: `border-[#333]` (dark) | `border-gray-300` (light)
- Code BG: `bg-[#0a0a0a]` (dark) | `bg-gray-100` (light)

---

## 🔧 Quick Actions

### View Profile
```tsx
const handleViewProfile = (owner) => {
  window.open(`/v/${owner.profileSlug}`, '_blank');
};
```

### Open Settings
```tsx
const handleProfileSettings = (owner) => {
  setSelectedOwnerForSettings(owner);
};
```

### Open Embed
```tsx
const handleProfileEmbed = (owner) => {
  setSelectedOwnerForEmbed(owner);
};
```

---

## ✅ Testing Checklist

**Table**:
- [ ] Organization columns display
- [ ] Website link opens in new tab
- [ ] Dark mode colors correct

**Dropdown**:
- [ ] Opens on click
- [ ] Closes when clicking outside
- [ ] All options work

**Modals**:
- [ ] Profile Settings saves
- [ ] Embed code copies
- [ ] Preview loads
- [ ] Dark mode works

---

## 📚 Files

**Created** (3):
- `/components/systemadmin/ProfileDropdown.tsx`
- `/components/systemadmin/ProfileSettingsModal.tsx`
- `/components/systemadmin/ProfileEmbedModal.tsx`

**Modified** (1):
- `/pages/SystemAdminDashboard.tsx`

---

## 🎯 Key Features

✅ Organization info in table  
✅ Profile dropdown menu  
✅ View profile in new tab  
✅ Edit profile settings  
✅ Get embed code  
✅ Copy to clipboard  
✅ Live preview  
✅ Dark mode support  
✅ Mobile responsive  
✅ Toast notifications  

---

**Status**: ✅ **Ready to Use**  
**Full Guide**: `/SYSTEM_ADMIN_PROFILE_FEATURES.md`
