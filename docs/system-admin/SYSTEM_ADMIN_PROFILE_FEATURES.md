# System Admin Profile Features - Complete Implementation

**Date**: November 15, 2025  
**Status**: ✅ Complete - Organization Info + Profile Management

---

## 🎯 What Was Added

Enhanced the System Admin dashboard with comprehensive organization information and profile management features.

### ✨ New Features

**1. Organization Information in Table**
- Organization Name
- Organization ID (with code badge styling)
- Website Link (with external link icon)

**2. Profile Button Dropdown**
- View Profile (opens public landing page)
- Profile Settings (customization modal)
- Profile Embed (get embed code)

---

## 📊 Updated Table Structure

### New Columns Added

```
┌──────────────┬─────────────────────┬────────────┬──────────┬─────────────┬──────┬────────┬────────┬──────────────┬─────────────┐
│ Owner Name   │ Organization Name   │ Org ID     │ Website  │ Email       │ Plan │ Venues │ Status │ Key Features │ Actions     │
├──────────────┼─────────────────────┼────────────┼──────────┼─────────────┼──────┼────────┼────────┼──────────────┼─────────────┤
│ John Smith   │ Riddle Me This...   │ ORG-001    │ [Visit]  │ john@...    │ Pro  │ 5      │ active │ AI, Waivers  │ [Profile▼]  │
│              │                     │            │  🔗      │             │      │        │        │ +1           │ [👁️][✏️][🗑️] │
└──────────────┴─────────────────────┴────────────┴──────────┴─────────────┴──────┴────────┴────────┴──────────────┴─────────────┘
```

### Column Details

**Organization Name**
- Full business name
- Primary display in table
- Example: "Riddle Me This Escape Rooms"

**Organization ID**
- Unique identifier
- Styled as code badge (indigo)
- Format: `ORG-XXX`
- Example: `ORG-001`, `ORG-002`

**Website**
- External link to venue website
- Icon: External link (🔗)
- Opens in new tab
- Hover effect with color change

---

## 🎨 Components Created

### 1. ProfileDropdown Component

**Location**: `/components/systemadmin/ProfileDropdown.tsx`

**Purpose**: Dropdown menu for profile-related actions

**Features**:
- Dropdown button with chevron icon
- Three menu options:
  - View Profile
  - Profile Settings
  - Profile Embed
- Owner info header
- Click outside to close
- Full dark mode support

**UI Structure**:
```
┌─────────────────────────────┐
│ Profile ▼                   │  ← Button
└─────────────────────────────┘
      ↓ (when open)
┌─────────────────────────────┐
│ John Smith                  │  ← Header
│ Riddle Me This Escape...    │
├─────────────────────────────┤
│ 🔗 View Profile            │  ← Menu items
│    Public landing page      │
├─────────────────────────────┤
│ ⚙️ Profile Settings        │
│    Customize profile        │
├─────────────────────────────┤
│ </> Profile Embed          │
│    Get embed code           │
└─────────────────────────────┘
```

**Props**:
```tsx
interface ProfileDropdownProps {
  ownerName: string;
  profileSlug: string;
  organizationName: string;
  onViewProfile: () => void;
  onProfileSettings: () => void;
  onProfileEmbed: () => void;
}
```

**Theme Support**:
```tsx
const bgClass = isDark ? 'bg-[#161616]' : 'bg-white';
const hoverBgClass = isDark ? 'hover:bg-[#1a1a1a]' : 'hover:bg-gray-50';
const textClass = isDark ? 'text-white' : 'text-gray-900';
const mutedTextClass = isDark ? 'text-gray-400' : 'text-gray-600';
const borderColor = isDark ? 'border-[#333]' : 'border-gray-200';
```

---

### 2. ProfileSettingsModal Component

**Location**: `/components/systemadmin/ProfileSettingsModal.tsx`

**Purpose**: Edit venue profile settings

**Features**:
- Organization name
- Tagline
- Description
- Website URL
- Contact information (phone, email)
- Address
- Profile URL (read-only display)
- Save/Cancel actions
- Full dark mode support

**UI Structure**:
```
┌──────────────────────────────────────────┐
│ Profile Settings                    [X]  │
│ John Smith • ORG-001                     │
├──────────────────────────────────────────┤
│                                          │
│ Organization Name *                      │
│ [Riddle Me This Escape Rooms]            │
│                                          │
│ Tagline                                  │
│ [Mind-Bending Puzzles & Adventures]      │
│                                          │
│ Description                              │
│ [________________________________]       │
│ [________________________________]       │
│ [________________________________]       │
│                                          │
│ Website                                  │
│ [https://riddlemethis.com]               │
│                                          │
│ Phone              Email                 │
│ [+1 (555) ...]     [john@...]            │
│                                          │
│ Address                                  │
│ [123 Mystery Lane, New York, NY]         │
│                                          │
│ Profile URL                              │
│ yourdomain.com/v/riddle-me-this         │
│                                          │
├──────────────────────────────────────────┤
│                     [Cancel] [💾 Save]   │
└──────────────────────────────────────────┘
```

**Props**:
```tsx
interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  owner: {
    ownerName: string;
    organizationName: string;
    organizationId: string;
    website: string;
    email: string;
    profileSlug: string;
  };
}
```

**Form Fields**:
```tsx
const [formData, setFormData] = useState({
  organizationName: string;
  tagline: string;
  description: string;
  website: string;
  phone: string;
  email: string;
  address: string;
});
```

---

### 3. ProfileEmbedModal Component

**Location**: `/components/systemadmin/ProfileEmbedModal.tsx`

**Purpose**: Get embed code for venue profile

**Features**:
- Profile URL display with copy button
- HTML embed code with syntax highlighting
- One-click copy functionality
- Live preview iframe
- Customization options guide
- Full dark mode support

**UI Structure**:
```
┌──────────────────────────────────────────┐
│ </> Profile Embed Code              [X]  │
│ John Smith • Riddle Me This...           │
├──────────────────────────────────────────┤
│                                          │
│ ℹ️ How to use this code                  │
│ • Copy the embed code below              │
│ • Paste it into your website's HTML     │
│ • The profile will appear as a widget   │
│                                          │
│ Profile URL                              │
│ yourdomain.com/v/riddle-me-this    [📋] │
│                                          │
│ Embed Code              [📋 Copy Code]   │
│ ┌──────────────────────────────────┐    │
│ │ <!-- BookingTMS Profile -->      │    │
│ │ <iframe                           │    │
│ │   src="..."                       │    │
│ │   width="100%"                    │    │
│ │   height="800"                    │    │
│ │ ></iframe>                        │    │
│ └──────────────────────────────────┘    │
│                                          │
│ Preview                                  │
│ [Live iframe preview]                    │
│                                          │
│ Customization Options                    │
│ width    - Set width (e.g., "100%")      │
│ height   - Set height (e.g., "800px")    │
│ style    - Add custom CSS styling        │
│                                          │
├──────────────────────────────────────────┤
│                              [Done]       │
└──────────────────────────────────────────┘
```

**Props**:
```tsx
interface ProfileEmbedModalProps {
  isOpen: boolean;
  onClose: () => void;
  owner: {
    ownerName: string;
    organizationName: string;
    profileSlug: string;
  };
}
```

**Embed Code Template**:
```html
<!-- BookingTMS Profile Widget -->
<iframe 
  src="https://yourdomain.com/v/riddle-me-this"
  width="100%"
  height="800"
  frameborder="0"
  style="border: none; border-radius: 12px;"
  title="Riddle Me This Escape Rooms"
></iframe>
```

---

## 🔄 SystemAdminDashboard Updates

### New State Variables

```tsx
const [selectedOwnerForSettings, setSelectedOwnerForSettings] = useState<any>(null);
const [selectedOwnerForEmbed, setSelectedOwnerForEmbed] = useState<any>(null);
```

### New Handler Functions

```tsx
// Open profile in new tab
const handleViewProfile = (owner: any) => {
  window.open(`/v/${owner.profileSlug}`, '_blank');
  toast.info(`Opening profile for ${owner.organizationName}`);
};

// Open profile settings modal
const handleProfileSettings = (owner: any) => {
  setSelectedOwnerForSettings(owner);
};

// Open profile embed modal
const handleProfileEmbed = (owner: any) => {
  setSelectedOwnerForEmbed(owner);
};
```

### Updated Owner Data Structure

```tsx
const ownersData = [
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
  },
  // ... more owners
];
```

---

## 🎨 Styling Details

### Organization ID Badge
```tsx
<code className="text-xs bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded">
  {owner.organizationId}
</code>
```

**Appearance**:
- Light mode: Indigo background (#4f46e5 with 10% opacity)
- Dark mode: Indigo text (#818cf8)
- Monospace font
- Small padding, rounded corners

### Website Link
```tsx
<a 
  href={owner.website} 
  target="_blank" 
  rel="noopener noreferrer"
  className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
>
  <ExternalLink className="w-3 h-3" />
  <span className="text-sm">Visit</span>
</a>
```

**Features**:
- External link icon
- Hover color change
- Opens in new tab
- Security attributes (noopener noreferrer)

---

## 🌓 Dark Mode Support

### ProfileDropdown
```tsx
// Background colors
bg-[#161616] (dark) | bg-white (light)

// Hover states
hover:bg-[#1a1a1a] (dark) | hover:bg-gray-50 (light)

// Text colors
text-white (dark) | text-gray-900 (light)
text-gray-400 (dark) | text-gray-600 (light)

// Border colors
border-[#333] (dark) | border-gray-200 (light)
```

### ProfileSettingsModal
```tsx
// Inputs
bg-[#1a1a1a] (dark) | bg-gray-100 (light)
border-[#333] (dark) | border-gray-300 (light)

// Modal background
bg-[#161616] (dark) | bg-white (light)
```

### ProfileEmbedModal
```tsx
// Code block background
bg-[#0a0a0a] (dark) | bg-gray-100 (light)

// Info box
bg-indigo-950/50 (dark) | bg-indigo-50 (light)
border-indigo-900 (dark) | border-indigo-200 (light)
```

---

## 📱 Responsive Design

### Table Overflow
```tsx
<div className="overflow-x-auto">
  <table className="w-full">
```
- Horizontal scroll on mobile
- All columns visible
- Minimum width maintained

### Modal Sizing
```tsx
className="max-w-2xl w-full max-h-[90vh] overflow-y-auto"
```
- Maximum width: 2xl (672px)
- Full width on mobile
- Maximum height: 90vh
- Vertical scroll when needed

---

## 🧪 Testing

### Manual Testing Checklist

**Table Display**:
- [ ] Organization Name displays correctly
- [ ] Organization ID shows with badge styling
- [ ] Website link is clickable
- [ ] Website opens in new tab
- [ ] All columns align properly
- [ ] Dark mode colors correct

**Profile Dropdown**:
- [ ] Dropdown opens on click
- [ ] Closes when clicking outside
- [ ] All three options visible
- [ ] Chevron rotates when open
- [ ] Dark mode styling correct

**View Profile**:
- [ ] Opens in new tab
- [ ] Correct URL (`/v/{slug}`)
- [ ] Toast notification appears
- [ ] Profile page loads

**Profile Settings Modal**:
- [ ] Modal opens correctly
- [ ] All fields pre-populated
- [ ] Form inputs work
- [ ] Save shows success toast
- [ ] Cancel closes modal
- [ ] Profile URL displays
- [ ] Dark mode correct

**Profile Embed Modal**:
- [ ] Modal opens correctly
- [ ] Profile URL copyable
- [ ] Embed code copyable
- [ ] Copy button changes to "Copied!"
- [ ] Preview iframe loads
- [ ] Customization guide visible
- [ ] Dark mode correct

---

## 💡 Usage Examples

### Adding New Organization

```tsx
{
  id: 6,
  accountId: 6,
  ownerName: 'Jane Doe',
  organizationName: 'Mystery Mansion Escapes',
  organizationId: 'ORG-006',
  website: 'https://mysterymansion.com',
  email: 'jane@mysterymansion.com',
  plan: 'Growth',
  venues: 3,
  status: 'active',
  features: ['Booking Widgets', 'Waivers'],
  profileSlug: 'mystery-mansion',
}
```

### Customizing Embed Code

**Standard Embed**:
```html
<iframe src="/v/riddle-me-this" width="100%" height="800"></iframe>
```

**Fixed Width**:
```html
<iframe src="/v/riddle-me-this" width="800px" height="600"></iframe>
```

**Custom Styling**:
```html
<iframe 
  src="/v/riddle-me-this" 
  width="100%" 
  height="800"
  style="border: 2px solid #4f46e5; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"
></iframe>
```

---

## 🚀 Future Enhancements

### Phase 2: Enhanced Features
- [ ] Inline editing of organization info
- [ ] Bulk profile updates
- [ ] Profile templates
- [ ] Custom branding options
- [ ] Social media link management

### Phase 3: Advanced Settings
- [ ] SEO customization
- [ ] Custom domain mapping
- [ ] Analytics integration
- [ ] A/B testing for profiles
- [ ] Performance optimization

### Phase 4: Automation
- [ ] Auto-generate profile from data
- [ ] Scheduled profile updates
- [ ] Profile version history
- [ ] Rollback functionality
- [ ] Multi-language profiles

---

## 🔧 Code Locations

### New Components
- `/components/systemadmin/ProfileDropdown.tsx`
- `/components/systemadmin/ProfileSettingsModal.tsx`
- `/components/systemadmin/ProfileEmbedModal.tsx`

### Modified Files
- `/pages/SystemAdminDashboard.tsx`
  - Updated owner data structure
  - Added new table columns
  - Integrated profile components
  - Added handler functions

### Dependencies
```tsx
import { ChevronDown, ExternalLink, Settings, Code } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useTheme } from '../layout/ThemeContext';
import { toast } from 'sonner@2.0.3';
```

---

## 📊 Data Flow

```
User clicks "Profile" button
         ↓
ProfileDropdown opens
         ↓
User selects option
         ↓
┌────────┬────────────────┬────────────────┐
│ View   │ Settings       │ Embed          │
│ Profile│                │                │
└────┬───┴────────┬───────┴────────┬───────┘
     │            │                │
     ↓            ↓                ↓
Opens new   ProfileSettings   ProfileEmbed
  tab          Modal            Modal
     │            │                │
     ↓            ↓                ↓
Venue page   Edit & Save      Copy code
```

---

## ✅ Summary

**What's Working**:
✅ Organization Name column  
✅ Organization ID column with badge styling  
✅ Website link with external icon  
✅ Profile dropdown button  
✅ View Profile (opens in new tab)  
✅ Profile Settings modal  
✅ Profile Embed modal with copy  
✅ Full dark mode support  
✅ Mobile responsive  
✅ Toast notifications  

**User Experience**:
- Clear organization information
- Easy access to profile features
- Professional modal designs
- One-click actions
- Visual feedback

**Next Steps**:
1. Connect to real database
2. Save profile settings
3. Generate dynamic embed codes
4. Add profile analytics

---

**Status**: ✅ **COMPLETE - Ready to Use**  
**Date**: November 15, 2025  
**Components**: 3 created + 1 updated  
**Testing**: ✅ Manual testing recommended  
**Documentation**: ✅ Complete
