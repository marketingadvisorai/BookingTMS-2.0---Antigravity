# System Admin Account Selector Implementation

**Date**: November 15, 2025  
**Status**: ✅ Complete - Account filtering working  

---

## 🎯 What Was Built

Added a comprehensive account selection system to the System Admin dashboard that filters all platform data based on the selected account.

---

## ✨ Features

### 1. Account Selector Dropdown
```
┌─────────────────────────────────────┐
│  🏢  Riddle Me This                 │
│      732-865-9397               ▼   │
└─────────────────────────────────────┘
```

**Features:**
- Shows selected account name and phone
- Dropdown with search functionality
- Recent accounts section (last 3 accessed)
- All accounts list with status indicators
- Green/red dots for active/inactive status
- Click outside to close
- Smooth animations

### 2. Custom System Admin Header
```
┌──────────────────────────────────────────────────────────┐
│  [☰] [Account Selector]  [Search Bar]  [🔔] [⚙️] [🌓]    │
└──────────────────────────────────────────────────────────┘
```

**Components:**
- Mobile menu toggle
- Account selector dropdown
- Global search bar (desktop)
- Notifications bell with badge
- Settings icon
- Theme toggle
- Mobile search bar (responsive)

### 3. Breadcrumb Navigation
When an account is selected:
```
System Admin › Riddle Me This
```

### 4. Data Filtering
All dashboard data filters based on selected account:
- **KPI Cards**: Total Owners, Active Subscriptions, Venues, MRR
- **Owners Table**: Shows only owners from selected account
- **Metrics**: Calculated from filtered data

---

## 📦 Components Created

### 1. `/components/systemadmin/AccountSelector.tsx`
**Purpose**: Dropdown component for account selection

**Props:**
```tsx
interface AccountSelectorProps {
  selectedAccount: Account | null;
  onAccountSelect: (account: Account | null) => void;
  accounts: Account[];
  recentAccounts: Account[];
}
```

**Features:**
- Search accounts by name, company, or phone
- Recent accounts section
- All accounts list
- Active/inactive status indicators
- Click outside to close
- Full dark mode support
- Smooth animations

**Account Type:**
```tsx
interface Account {
  id: number;
  name: string;
  company: string;
  phone: string;
  status: 'active' | 'inactive';
  isRecent?: boolean;
}
```

### 2. `/components/systemadmin/SystemAdminHeader.tsx`
**Purpose**: Custom header for System Admin dashboard only

**Props:**
```tsx
interface SystemAdminHeaderProps {
  selectedAccount: Account | null;
  onAccountSelect: (account: Account | null) => void;
  accounts: Account[];
  recentAccounts: Account[];
  onMobileMenuToggle?: () => void;
}
```

**Features:**
- Account selector integration
- Global search bar (desktop + mobile)
- Notification bell with badge
- Settings button
- Theme toggle
- Mobile responsive layout
- Full dark mode support

---

## 🔄 SystemAdminDashboard Updates

### State Management
```tsx
const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
```

### Mock Data
```tsx
const allAccounts: Account[] = [
  { id: 1, name: 'Riddle Me This', company: 'Escape Room PPC Manager', phone: '732-865-9397', status: 'active', isRecent: true },
  { id: 2, name: 'Xperience Games - Calgary', company: 'Escape Room PPC Manager', phone: '912-442-2090', status: 'active', isRecent: true },
  // ... 12 accounts total
];
```

### Data Filtering
```tsx
// Filter owners by selected account
const filteredOwners = useMemo(() => {
  if (!selectedAccount) return ownersData;
  return ownersData.filter(owner => owner.accountId === selectedAccount.id);
}, [selectedAccount]);

// Calculate filtered metrics
const filteredMetrics = useMemo(() => {
  if (!selectedAccount) {
    return platformMetrics; // All platform data
  }
  
  // Calculate metrics for selected account
  const accountOwners = filteredOwners;
  const totalVenues = accountOwners.reduce((sum, owner) => sum + owner.venues, 0);
  const activeOwners = accountOwners.filter(o => o.status === 'active').length;
  
  // Estimate MRR based on plans
  const mrr = accountOwners.reduce((sum, owner) => {
    const plan = plansData.find(p => p.name === owner.plan);
    return sum + (plan?.price || 0);
  }, 0);

  return {
    totalOwners: accountOwners.length,
    activeSubscriptions: activeOwners,
    activeVenues: totalVenues,
    mrr: mrr,
  };
}, [selectedAccount, filteredOwners]);
```

### Account Selection Handler
```tsx
const handleAccountSelect = (account: Account | null) => {
  setSelectedAccount(account);
  if (account) {
    toast.info(`Viewing data for: ${account.name}`);
  } else {
    toast.info('Viewing all platform data');
  }
};
```

---

## 🎨 UI/UX Features

### Account Selector Dropdown

**Header Section:**
```
┌─────────────────────────────────────────┐
│  🔍  Search accounts...                 │
└─────────────────────────────────────────┘
```

**All Accounts Option:**
```
┌─────────────────────────────────────────┐
│  🏢  All Accounts                       │
│      View all platform data             │
└─────────────────────────────────────────┘
```

**Recent Section:**
```
RECENT
┌─────────────────────────────────────────┐
│  🏢 ● Riddle Me This           732-...  │
│       Escape Room PPC Manager           │
├─────────────────────────────────────────┤
│  🏢 ● Xperience Games          912-...  │
│       Escape Room PPC Manager           │
└─────────────────────────────────────────┘
```

**All Accounts Section:**
```
ACCOUNTS
┌─────────────────────────────────────────┐
│  🏢 ● Real Escape | Mike       284-...  │
│       Escape Room Business              │
├─────────────────────────────────────────┤
│  🏢 ○ Michael D Gr             425-...  │
│       Adventure Zone                    │
└─────────────────────────────────────────┘

● = Active (green)
○ = Inactive (red)
```

### Search Functionality
- Real-time filtering
- Searches name, company, and phone
- Shows "No accounts found" when empty
- Clears search on selection

### Visual States
- **Hover**: Subtle background change
- **Selected**: Blue background highlight
- **Active Status**: Green dot
- **Inactive Status**: Red dot
- **Dropdown Open**: Chevron rotates 180°

---

## 🌓 Dark Mode Support

### AccountSelector
```tsx
const bgClass = isDark ? 'bg-[#161616]' : 'bg-white';
const hoverBgClass = isDark ? 'hover:bg-[#1a1a1a]' : 'hover:bg-gray-50';
const textClass = isDark ? 'text-white' : 'text-gray-900';
const mutedTextClass = isDark ? 'text-gray-400' : 'text-gray-600';
const borderColor = isDark ? 'border-[#333]' : 'border-gray-200';
const activeBg = isDark ? 'bg-[#1a1a1a]' : 'bg-blue-50';
```

### SystemAdminHeader
```tsx
const bgClass = isDark ? 'bg-[#0a0a0a]' : 'bg-white';
const borderColor = isDark ? 'border-[#1e1e1e]' : 'border-gray-200';
const textClass = isDark ? 'text-white' : 'text-gray-900';
const mutedTextClass = isDark ? 'text-gray-400' : 'text-gray-600';
```

---

## 📱 Responsive Design

### Desktop (≥1024px)
```
┌──────────────────────────────────────────────────────┐
│  [Account Selector]  [Search Bar]  [Actions]         │
└──────────────────────────────────────────────────────┘
```

### Tablet (768px - 1023px)
```
┌──────────────────────────────────────────────────────┐
│  [☰] [Account Selector]  [Search Bar]  [Actions]     │
└──────────────────────────────────────────────────────┘
```

### Mobile (<768px)
```
┌──────────────────────────────────────────────────────┐
│  [☰] [Account Selector]  [🔍] [🔔] [⚙️] [🌓]         │
├──────────────────────────────────────────────────────┤
│  [Search Bar - Full Width]                           │
└──────────────────────────────────────────────────────┘
```

---

## 🧪 Testing

### 1. Account Selection
- [x] Click account selector → Dropdown opens
- [x] Select "All Accounts" → Shows all data
- [x] Select specific account → Filters to that account
- [x] Toast notification appears on selection
- [x] Click outside dropdown → Closes

### 2. Search Functionality
- [x] Type in search bar → Filters accounts
- [x] Search by name → Works
- [x] Search by company → Works
- [x] Search by phone → Works
- [x] No results → Shows empty state
- [x] Clear search → Shows all accounts

### 3. Data Filtering
- [x] KPI cards update when account selected
- [x] Owners table filters correctly
- [x] Metrics calculate properly
- [x] "All Accounts" shows platform totals

### 4. UI/UX
- [x] Recent accounts appear first
- [x] Status indicators show correctly (green/red)
- [x] Hover states work
- [x] Selected account highlights
- [x] Breadcrumb appears when account selected
- [x] Mobile responsive layout works

### 5. Dark Mode
- [x] Account selector in dark mode
- [x] Header in dark mode
- [x] Dropdown in dark mode
- [x] Search bar in dark mode
- [x] All buttons in dark mode

---

## 💾 Mock Data

### Accounts (12 total)
```tsx
const allAccounts: Account[] = [
  // Recent accounts (3)
  { id: 1, name: 'Riddle Me This', isRecent: true, status: 'active' },
  { id: 2, name: 'Xperience Games - Calgary', isRecent: true, status: 'active' },
  { id: 3, name: 'Xperience Games - Kelowna', isRecent: true, status: 'active' },
  
  // Other accounts (9)
  { id: 4, name: 'Real Escape | Mike', status: 'inactive' },
  { id: 5, name: 'Michael D Gr', status: 'inactive' },
  // ... 7 more accounts
];
```

### Owners (5 total)
```tsx
const ownersData = [
  { id: 1, accountId: 1, ownerName: 'John Smith', plan: 'Pro', venues: 5 },
  { id: 2, accountId: 2, ownerName: 'Sarah Johnson', plan: 'Growth', venues: 3 },
  { id: 3, accountId: 3, ownerName: 'Michael Chen', plan: 'Basic', venues: 1 },
  { id: 4, accountId: 4, ownerName: 'Emily Davis', plan: 'Pro', venues: 4 },
  { id: 5, accountId: 5, ownerName: 'David Wilson', plan: 'Growth', venues: 2 },
];
```

---

## 🎯 User Flow

### View All Platform Data (Default)
```
1. Login as System Admin
2. Dashboard loads
3. Account selector shows "All Accounts"
4. KPI cards show platform totals:
   - Total Owners: 48
   - Active Subscriptions: 42
   - Active Venues: 156
   - MRR: $24,750
5. Owners table shows all 5 owners
```

### Filter to Specific Account
```
1. Click account selector
2. Dropdown opens with search and accounts list
3. Select "Riddle Me This"
4. Toast: "Viewing data for: Riddle Me This"
5. Breadcrumb appears: System Admin › Riddle Me This
6. KPI cards update:
   - Total Owners: 1
   - Active Subscriptions: 1
   - Active Venues: 5
   - MRR: $599
7. Owners table shows only John Smith
```

### Search Accounts
```
1. Click account selector
2. Type "Xperience" in search
3. Results filter to 2 accounts:
   - Xperience Games - Calgary
   - Xperience Games - Kelowna
4. Select one → Dashboard filters
```

---

## 🚀 Future Enhancements

### Phase 2: Enhanced Features
- [ ] Save recent accounts to localStorage
- [ ] Add account favorites/pins
- [ ] Account grouping/categories
- [ ] Multi-account comparison view
- [ ] Export filtered data

### Phase 3: Advanced Filtering
- [ ] Date range selector
- [ ] Additional filter options (plan, status, region)
- [ ] Saved filter presets
- [ ] Quick filters toolbar

### Phase 4: Real Data
- [ ] Connect to Supabase
- [ ] Real-time account switching
- [ ] Account search API
- [ ] Pagination for large account lists
- [ ] Account performance metrics

---

## 📚 Technical Details

### Component Hierarchy
```
SystemAdminDashboard
├── SystemAdminHeader
│   ├── AccountSelector
│   ├── Search Bar
│   ├── Notifications
│   ├── Settings
│   └── ThemeToggle
├── Breadcrumb (conditional)
├── KPI Cards (filtered)
├── Owners Table (filtered)
├── Plans Cards
└── Feature Flags
```

### State Flow
```
User selects account
     ↓
handleAccountSelect()
     ↓
setSelectedAccount(account)
     ↓
filteredOwners updates (useMemo)
     ↓
filteredMetrics updates (useMemo)
     ↓
UI re-renders with filtered data
```

### Performance Optimization
- `useMemo` for filtered data (prevents unnecessary recalculations)
- Memoized metrics calculation
- Efficient array filtering
- Debounced search (future enhancement)

---

## ✅ Summary

**What's Working:**
✅ Account selector with dropdown  
✅ Search functionality  
✅ Recent accounts section  
✅ Status indicators (active/inactive)  
✅ Data filtering (KPIs, table)  
✅ Metrics calculation  
✅ Custom System Admin header  
✅ Breadcrumb navigation  
✅ Toast notifications  
✅ Dark mode support  
✅ Mobile responsive  
✅ Click outside to close  

**User Experience:**
- Intuitive account selection
- Clear visual feedback
- Fast filtering
- Smooth animations
- Professional design
- Matches reference image

**Next Steps:**
1. Test with real Supabase data
2. Add localStorage for recent accounts
3. Implement advanced filtering
4. Add export functionality

---

**Status**: ✅ **COMPLETE - Ready to Use**  
**Date**: November 15, 2025  
**Files**: 3 (2 new components + 1 updated dashboard)  
**Testing**: ✅ Passed
