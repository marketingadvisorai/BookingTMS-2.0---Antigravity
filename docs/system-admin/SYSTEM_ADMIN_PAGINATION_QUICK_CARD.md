# System Admin Dashboard Pagination - Quick Card

**Version**: 3.3.5 | **Date**: November 15, 2025

---

## ⚡ 30-Second Overview

Added pagination to System Admin Dashboard table (5 per page) with Previous/Next buttons and a "View All" button to open the full organizations page.

---

## 🎯 What Changed

### Before
```
[All 12+ organizations shown at once]
(No pagination, no View All button)
```

### After
```
[5 organizations per page]
[View All] button → Opens full page (10 per page)
[Previous] [Next] buttons for navigation
```

---

## 💻 Quick Code

### Pagination State
```tsx
const [currentPage, setCurrentPage] = useState(1);
const ITEMS_PER_PAGE = 5; // Dashboard shows 5

// Calculate pagination
const totalPages = Math.ceil(filteredOwners.length / ITEMS_PER_PAGE);
const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
const endIndex = startIndex + ITEMS_PER_PAGE;
const currentOwners = filteredOwners.slice(startIndex, endIndex);
```

### Handlers
```tsx
const handlePreviousPage = () => {
  setCurrentPage(prev => Math.max(1, prev - 1));
};

const handleNextPage = () => {
  setCurrentPage(prev => Math.min(totalPages, prev + 1));
};

const handleViewAllOrganizations = () => {
  window.location.href = '/?page=view-all-organizations';
};
```

### Auto-Reset
```tsx
useEffect(() => {
  setCurrentPage(1); // Reset when account changes
}, [selectedAccount]);
```

---

## 🎨 Visual Layout

```
┌─────────────────────────────────────────────────┐
│ Owners & Venues            [View All][Add Owner]│
│ Showing 1-5 of 12 organizations                 │
├─────────────────────────────────────────────────┤
│ [Table with 5 organizations]                    │
├─────────────────────────────────────────────────┤
│ Page 1 of 3              [← Previous]  [Next →]│
└─────────────────────────────────────────────────┘
```

---

## 🔄 Two-Tier System

### Dashboard (5 per page)
- Quick management view
- Integrated with KPIs
- Account filtering
- Fast overview

### View All (10 per page)
- Full-page dedicated view
- Advanced search
- More screen space
- Detailed browsing

---

## 📊 Pagination Flow

```
Page 1: Items 1-5     [← Prev (off)]  [Next]
Page 2: Items 6-10    [← Prev]        [Next]
Page 3: Items 11-12   [← Prev]        [Next (off)]
```

---

## 🎯 Key Features

```
✅ Shows 5 organizations per page
✅ Previous/Next navigation buttons
✅ View All button → Full page
✅ Item range: "Showing 1-5 of 12"
✅ Page counter: "Page 1 of 3"
✅ Auto-reset on account change
✅ Hides if only 1 page
✅ Full dark mode support
✅ Disabled states on boundaries
```

---

## 🧪 Quick Test

1. [ ] Shows 5 organizations max
2. [ ] Previous disabled on page 1
3. [ ] Next disabled on last page
4. [ ] View All opens new page
5. [ ] Page counter displays correctly
6. [ ] Account filter resets to page 1
7. [ ] Dark mode works
8. [ ] Buttons responsive on mobile

---

## 📚 Full Documentation

**Complete Guide**: `/SYSTEM_ADMIN_PAGINATION_UPDATE.md`

---

**Status**: ✅ Complete  
**File**: `/pages/SystemAdminDashboard.tsx`  
**Items Per Page**: 5 (Dashboard) / 10 (View All)
