# Account Settings Dark Mode Design Fix

**Date**: November 3, 2025  
**Page**: `/pages/AccountSettings.tsx`

## Overview
Fixed the dark mode color design of the Account Settings page to comply with the BookingTMS Design System guidelines, ensuring consistent use of the 3-tier background system and proper color palette.

## Changes Made

### 1. Updated Base Dark Mode Classes

**Before:**
```typescript
const borderColor = isDark ? 'border-gray-800' : 'border-gray-200';
const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
const hoverBg = isDark ? 'hover:bg-[#1e1e1e]' : 'hover:bg-gray-50';
```

**After:**
```typescript
const borderColor = isDark ? 'border-[#1e1e1e]' : 'border-gray-200';
const textSecondary = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
const hoverBg = isDark ? 'hover:bg-[#1a1a1a]' : 'hover:bg-gray-50';
```

**Reasoning:**
- `border-[#1e1e1e]` - Follows the design system's border color for cards/containers in dark mode
- `text-[#a3a3a3]` - Standard secondary text color in dark mode (instead of gray-400)
- `hover:bg-[#1a1a1a]` - Subtle hover effect using intermediate shade between #161616 and #1e1e1e

### 2. Fixed TabsList Border

**Before:**
```tsx
<TabsList className={isDark ? 'bg-[#161616] border border-gray-800' : ''}>
```

**After:**
```tsx
<TabsList className={isDark ? 'bg-[#161616] border border-[#1e1e1e]' : ''}>
```

### 3. Enhanced Search Input

**Before:**
```tsx
<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
<Input
  className={`pl-10 h-12 ${isDark ? 'bg-[#161616] border-gray-800' : 'bg-gray-100 border-gray-300'} placeholder:text-gray-500`}
/>
```

**After:**
```tsx
<Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-[#737373]' : 'text-gray-400'}`} />
<Input
  className={`pl-10 h-12 ${isDark ? 'bg-[#0a0a0a] border-[#1e1e1e] text-white placeholder:text-[#737373]' : 'bg-gray-100 border-gray-300 placeholder:text-gray-500'}`}
/>
```

**Improvements:**
- Uses deepest background (#0a0a0a) for input fields
- Proper text color (white) in dark mode
- Consistent placeholder color (#737373)
- Search icon matches placeholder color

### 4. Updated Dialog Backgrounds (3-Tier System)

All dialogs now use `bg-[#1e1e1e]` (elevated modal tier) instead of `bg-[#161616]`:

**Dialogs Updated:**
- Create User Dialog
- Edit User Dialog
- Delete User AlertDialog

**Before:**
```tsx
<DialogContent className={isDark ? 'bg-[#161616] border-gray-800' : 'bg-white'}>
```

**After:**
```tsx
<DialogContent className={isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : 'bg-white'}>
```

**3-Tier Background System Applied:**
- `#0a0a0a` - Main background, input fields (deepest)
- `#161616` - Cards, containers (middle)
- `#1e1e1e` - Modals, elevated elements (highest)

### 5. Improved Form Inputs in Dialogs

All input fields in dialogs now use the deepest background tier:

**Before:**
```tsx
<Label className={isDark ? 'text-gray-300' : 'text-gray-700'}>Name</Label>
<Input
  className={`h-12 ${isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-gray-100 border-gray-300'} placeholder:text-gray-500`}
/>
```

**After:**
```tsx
<Label className={isDark ? 'text-[#a3a3a3]' : 'text-gray-700'}>Name</Label>
<Input
  className={`h-12 ${isDark ? 'bg-[#0a0a0a] border-[#1e1e1e] text-white placeholder:text-[#737373]' : 'bg-gray-100 border-gray-300 placeholder:text-gray-500'}`}
/>
```

### 6. Enhanced Select Dropdowns

**SelectTrigger:**
```tsx
className={`h-12 ${isDark ? 'bg-[#0a0a0a] border-[#1e1e1e] text-white' : 'bg-gray-100 border-gray-300'}`}
```

**SelectContent:**
```tsx
className={isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : ''}
```

**SelectItem:**
```tsx
className={isDark ? 'text-white focus:bg-[#161616] focus:text-white' : ''}
```

### 7. Fixed Dialog Buttons

**Cancel/Outline Buttons:**
```tsx
<Button 
  variant="outline" 
  className={isDark ? 'border-[#1e1e1e] bg-transparent text-[#a3a3a3] hover:bg-[#161616] hover:text-white' : ''}
>
  Cancel
</Button>
```

**Primary Action Buttons:**
```tsx
<Button className="text-white hover:opacity-90" style={{ backgroundColor: '#4f46e5' }}>
  Create User
</Button>
```

### 8. Updated Permission Badges

**Before:**
```tsx
className={`text-xs ${isDark ? 'border-gray-700 text-gray-300' : 'border-gray-300 text-gray-600'}`}
```

**After:**
```tsx
className={`text-xs ${isDark ? 'border-[#2a2a2a] text-[#a3a3a3] bg-[#0a0a0a]' : 'border-gray-300 text-gray-600 bg-white'}`}
```

### 9. Enhanced Action Buttons (Edit/Delete)

**Before:**
```tsx
<Button variant="ghost" size="sm">
  <Edit2 className="w-4 h-4" />
</Button>
<Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
  <Trash2 className="w-4 h-4" />
</Button>
```

**After:**
```tsx
<Button 
  variant="ghost" 
  size="sm"
  className={isDark ? 'hover:bg-[#1a1a1a] text-[#a3a3a3] hover:text-white' : ''}
>
  <Edit2 className="w-4 h-4" />
</Button>
<Button 
  variant="ghost" 
  size="sm"
  className={isDark ? 'text-red-400 hover:text-red-300 hover:bg-[#1a1a1a]' : 'text-red-600 hover:text-red-700'}
>
  <Trash2 className="w-4 h-4" />
</Button>
```

## Design System Compliance

### ✅ Color Palette
- **Backgrounds**: #0a0a0a (main), #161616 (cards), #1e1e1e (modals)
- **Borders**: #1e1e1e (standard), #2a2a2a (elevated)
- **Text**: white (primary), #a3a3a3 (secondary), #737373 (tertiary/placeholder)
- **Primary Action**: #4f46e5 (vibrant blue)
- **Destructive**: red-400 dark mode, red-600 light mode

### ✅ 3-Tier Background System
1. **Tier 1 (#0a0a0a)**: Main background, input fields
2. **Tier 2 (#161616)**: Cards, table rows, containers
3. **Tier 3 (#1e1e1e)**: Modals, dialogs, dropdowns

### ✅ Consistent Component Styling
- All inputs: `bg-[#0a0a0a] border-[#1e1e1e]`
- All cards: `bg-[#161616] border-[#1e1e1e]`
- All dialogs: `bg-[#1e1e1e] border-[#2a2a2a]`
- All labels: `text-[#a3a3a3]`
- All placeholders: `text-[#737373]`

### ✅ Hover States
- Table rows: `hover:bg-[#1a1a1a]`
- Ghost buttons: `hover:bg-[#1a1a1a]`
- Outline buttons: `hover:bg-[#161616]`

## Visual Improvements

### Before:
- ❌ Inconsistent gray shades (gray-800, gray-700, gray-400, gray-300)
- ❌ Wrong background tier for inputs (#161616 instead of #0a0a0a)
- ❌ Wrong dialog background (#161616 instead of #1e1e1e)
- ❌ Missing text color on inputs (relied on defaults)
- ❌ Inconsistent border colors

### After:
- ✅ Consistent design system colors throughout
- ✅ Proper 3-tier background hierarchy
- ✅ Explicit text colors on all elements
- ✅ Proper contrast ratios for accessibility
- ✅ Professional, cohesive dark mode appearance

## Testing Checklist

- [x] Search input displays correctly in dark mode
- [x] TabsList has proper border color
- [x] User table rows have correct hover effect
- [x] Create User dialog uses elevated background
- [x] Edit User dialog uses elevated background
- [x] Delete User dialog uses elevated background
- [x] Form inputs have deepest background tier
- [x] Select dropdowns have proper styling
- [x] Labels use correct secondary text color
- [x] Permission badges have proper colors
- [x] Edit/Delete buttons have correct hover states
- [x] All buttons use vibrant blue (#4f46e5) for primary actions
- [x] Cancel buttons have proper outline styling
- [x] All text colors follow design system

## Files Modified

- `/pages/AccountSettings.tsx` - Complete dark mode color overhaul

## Related Documentation

- Design System: `/guidelines/DESIGN_SYSTEM.md`
- Dark Mode Guide: `/DARK_MODE_COLOR_GUIDE.md`
- Main Guidelines: `/guidelines/Guidelines.md`

---

**Result**: Account Settings page now fully complies with BookingTMS design system dark mode guidelines with consistent colors, proper 3-tier background hierarchy, and professional appearance.
